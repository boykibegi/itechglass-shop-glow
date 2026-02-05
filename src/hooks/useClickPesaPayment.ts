 import { useState, useCallback, useRef } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 export type PaymentStatus = 'idle' | 'previewing' | 'initiating' | 'processing' | 'success' | 'failed';
 
 interface PaymentMethod {
   name: string;
   status: 'AVAILABLE' | 'UNAVAILABLE';
   fee?: number;
   message?: string;
 }
 
 interface PreviewResponse {
   activeMethods: PaymentMethod[];
   sender?: {
     accountName: string;
     accountNumber: string;
     accountProvider: string;
   };
 }
 
 interface InitiateResponse {
   id: string;
   status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'SETTLED';
   channel: string;
   orderReference: string;
   collectedAmount: string;
   collectedCurrency: string;
   createdAt: string;
   clientId: string;
 }
 
 interface UseClickPesaPaymentReturn {
   status: PaymentStatus;
   availableMethods: PaymentMethod[];
   transactionId: string | null;
   error: string | null;
   previewPayment: (phoneNumber: string, amount: number, orderReference: string) => Promise<boolean>;
   initiatePayment: (phoneNumber: string, amount: number, orderReference: string) => Promise<boolean>;
   checkPaymentStatus: (orderReference: string) => Promise<'SUCCESS' | 'FAILED' | 'PROCESSING' | null>;
   resetPayment: () => void;
 }
 
 export function useClickPesaPayment(): UseClickPesaPaymentReturn {
   const [status, setStatus] = useState<PaymentStatus>('idle');
   const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
   const [transactionId, setTransactionId] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const pollingRef = useRef<NodeJS.Timeout | null>(null);
 
   const formatPhoneNumber = (phone: string): string => {
     // Remove all non-digits
     let cleaned = phone.replace(/\D/g, '');
     
     // If starts with 0, replace with 255
     if (cleaned.startsWith('0')) {
       cleaned = '255' + cleaned.slice(1);
     }
     // If doesn't start with 255, add it
     else if (!cleaned.startsWith('255')) {
       cleaned = '255' + cleaned;
     }
     
     return cleaned;
   };
 
   const previewPayment = useCallback(async (
     phoneNumber: string,
     amount: number,
     orderReference: string
   ): Promise<boolean> => {
     setStatus('previewing');
     setError(null);
 
     try {
       const { data, error: fnError } = await supabase.functions.invoke('clickpesa-payment', {
         body: {
           action: 'preview',
           phoneNumber: formatPhoneNumber(phoneNumber),
           amount,
           orderReference,
         },
       });
 
       if (fnError) throw new Error(fnError.message);
       if (!data.success) throw new Error(data.error || 'Preview failed');
 
       const previewData = data.data as PreviewResponse;
       setAvailableMethods(previewData.activeMethods || []);
       
       const hasAvailable = previewData.activeMethods?.some(m => m.status === 'AVAILABLE');
       if (!hasAvailable) {
         setError('No payment methods available for this phone number');
         setStatus('failed');
         return false;
       }
 
       setStatus('idle');
       return true;
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to preview payment';
       setError(message);
       setStatus('failed');
       toast.error(message);
       return false;
     }
   }, []);
 
   const initiatePayment = useCallback(async (
     phoneNumber: string,
     amount: number,
     orderReference: string
   ): Promise<boolean> => {
     setStatus('initiating');
     setError(null);
 
     try {
       const { data, error: fnError } = await supabase.functions.invoke('clickpesa-payment', {
         body: {
           action: 'initiate',
           phoneNumber: formatPhoneNumber(phoneNumber),
           amount,
           orderReference,
         },
       });
 
       if (fnError) throw new Error(fnError.message);
       if (!data.success) throw new Error(data.error || 'Payment initiation failed');
 
       const initiateData = data.data as InitiateResponse;
       setTransactionId(initiateData.id);
       setStatus('processing');
       
       toast.info('Check your phone for the payment prompt');
       return true;
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to initiate payment';
       setError(message);
       setStatus('failed');
       toast.error(message);
       return false;
     }
   }, []);
 
   const checkPaymentStatus = useCallback(async (
     orderReference: string
   ): Promise<'SUCCESS' | 'FAILED' | 'PROCESSING' | null> => {
     try {
       const { data, error: fnError } = await supabase.functions.invoke('clickpesa-payment', {
         body: {
           action: 'status',
           orderReference,
         },
       });
 
       if (fnError) throw new Error(fnError.message);
       if (!data.success) return null;
 
       const statusData = data.data;
       if (statusData.status === 'SUCCESS' || statusData.status === 'SETTLED') {
         setStatus('success');
         return 'SUCCESS';
       } else if (statusData.status === 'FAILED') {
         setStatus('failed');
         setError('Payment was declined or failed');
         return 'FAILED';
       }
       
       return 'PROCESSING';
     } catch {
       return null;
     }
   }, []);
 
   const resetPayment = useCallback(() => {
     if (pollingRef.current) {
       clearInterval(pollingRef.current);
       pollingRef.current = null;
     }
     setStatus('idle');
     setAvailableMethods([]);
     setTransactionId(null);
     setError(null);
   }, []);
 
   return {
     status,
     availableMethods,
     transactionId,
     error,
     previewPayment,
     initiatePayment,
     checkPaymentStatus,
     resetPayment,
   };
 }