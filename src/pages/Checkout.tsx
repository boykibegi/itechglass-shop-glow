import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useCart } from '@/lib/cart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useClickPesaPayment, PaymentStatus } from '@/hooks/useClickPesaPayment';
import { useAuth } from '@/hooks/useAuth';
 const checkoutSchema = z.object({
   name: z.string().min(2, 'Name is required').max(100),
   email: z.string().email('Valid email required').max(255),
   phone: z.string().min(10, 'Valid phone number required').max(20),
   address: z.string().min(10, 'Full address required').max(500),
 });
 
const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    status: paymentStatus,
    availableMethods,
    error: paymentError,
    previewPayment,
    initiatePayment,
    checkPaymentStatus,
    resetPayment,
  } = useClickPesaPayment();
  
  // Pre-fill email from authenticated user
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update email when user changes (ensure it matches authenticated user)
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);
 
   // Cleanup polling on unmount
   useEffect(() => {
     return () => {
       if (pollingIntervalRef.current) {
         clearInterval(pollingIntervalRef.current);
       }
     };
   }, []);
 
   const handleInputChange = (field: string, value: string) => {
     setFormData((prev) => ({ ...prev, [field]: value }));
     setErrors((prev) => ({ ...prev, [field]: '' }));
     // Reset payment state when phone changes
     if (field === 'phone') {
       resetPayment();
     }
   };
 
   const generateOrderReference = () => {
     const timestamp = Date.now().toString(36).toUpperCase();
     const random = Math.random().toString(36).substring(2, 6).toUpperCase();
     return `ITG${timestamp}${random}`;
   };
 
   const handleVerifyPhone = async () => {
     if (!formData.phone || formData.phone.length < 10) {
       setErrors(prev => ({ ...prev, phone: 'Enter a valid phone number' }));
       return;
     }
     
     const ref = generateOrderReference();
     setOrderReference(ref);
     
     await previewPayment(formData.phone, getTotalPrice(), ref);
   };
   
   const handleInitiatePayment = async () => {
     if (!orderReference) return;
     
     const success = await initiatePayment(formData.phone, getTotalPrice(), orderReference);
     if (success) {
       startPollingPaymentStatus();
     }
   };
   
   const startPollingPaymentStatus = () => {
     if (!orderReference) return;
     
     let attempts = 0;
     const maxAttempts = 60; // Poll for 5 minutes max (every 5 seconds)
     
     pollingIntervalRef.current = setInterval(async () => {
       attempts++;
       
       if (attempts > maxAttempts) {
         if (pollingIntervalRef.current) {
           clearInterval(pollingIntervalRef.current);
         }
         toast.error('Payment verification timed out. Please check your payment status.');
         return;
       }
       
       const result = await checkPaymentStatus(orderReference);
       
       if (result === 'SUCCESS') {
         if (pollingIntervalRef.current) {
           clearInterval(pollingIntervalRef.current);
         }
         await createOrder('confirmed');
       } else if (result === 'FAILED') {
         if (pollingIntervalRef.current) {
           clearInterval(pollingIntervalRef.current);
         }
       }
     }, 5000);
   };
   
  const createOrder = async (paymentStat: string) => {
    setIsSubmitting(true);
    
    try {
      if (!user?.id || !user?.email) {
        throw new Error('You must be logged in to place an order');
      }

      // Ensure the email matches the authenticated user's email
      if (formData.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        throw new Error('Email must match your account email');
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          customer_name: formData.name.trim(),
          customer_email: user.email, // Use authenticated user's email
          customer_phone: formData.phone.trim(),
          shipping_address: formData.address.trim(),
          items: JSON.parse(JSON.stringify(items)),
          total_amount: getTotalPrice(),
          payment_method: 'mobile_money',
          transaction_id: orderReference,
          payment_status: paymentStat,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
      
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (items.length === 0) {
       toast.error('Your cart is empty');
       return;
     }
 
     try {
       checkoutSchema.parse(formData);
     } catch (err) {
       if (err instanceof z.ZodError) {
         const newErrors: Record<string, string> = {};
         err.errors.forEach((error) => {
           if (error.path[0]) {
             newErrors[error.path[0] as string] = error.message;
           }
         });
         setErrors(newErrors);
         return;
       }
     }
 
     if (availableMethods.length === 0) {
       toast.error('Please verify your phone number first');
       return;
     }
 
     handleInitiatePayment();
   };
 
   const getPaymentStatusDisplay = (status: PaymentStatus) => {
     switch (status) {
       case 'previewing':
         return { text: 'Verifying phone...', color: 'text-muted-foreground' };
       case 'initiating':
         return { text: 'Sending payment request...', color: 'text-muted-foreground' };
       case 'processing':
         return { text: 'Waiting for payment confirmation...', color: 'text-gold' };
       case 'success':
         return { text: 'Payment successful!', color: 'text-green-500' };
       case 'failed':
         return { text: paymentError || 'Payment failed', color: 'text-destructive' };
       default:
         return null;
     }
   };
 
   const statusDisplay = getPaymentStatusDisplay(paymentStatus);
 
   if (items.length === 0) {
     navigate('/cart');
     return null;
   }
 
   return (
     <div className="min-h-screen flex flex-col">
       <Header />
       
       <main className="flex-1 py-8 md:py-12">
         <div className="container max-w-4xl">
           <Button
             variant="ghost"
             className="mb-6"
             onClick={() => navigate('/cart')}
           >
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Cart
           </Button>
 
           <h1 className="text-3xl font-bold mb-8">Checkout</h1>
 
           <form onSubmit={handleSubmit}>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
               {/* Form */}
               <div className="lg:col-span-3 space-y-8">
                 {/* Customer Info */}
                 <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                   <h2 className="text-xl font-semibold">Customer Information</h2>
                   
                   <div className="space-y-2">
                     <Label htmlFor="name">Full Name</Label>
                     <Input
                       id="name"
                       value={formData.name}
                       onChange={(e) => handleInputChange('name', e.target.value)}
                       placeholder="John Doe"
                     />
                     {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                   </div>
 
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">Email is linked to your account and cannot be changed.</p>
                    </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="address">Shipping Address</Label>
                     <Textarea
                       id="address"
                       value={formData.address}
                       onChange={(e) => handleInputChange('address', e.target.value)}
                       placeholder="Street address, city, region..."
                       rows={3}
                     />
                     {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                   </div>
                 </div>
 
                 {/* Payment */}
                 <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                   <h2 className="text-xl font-semibold">Mobile Money Payment</h2>
                   <p className="text-sm text-muted-foreground">
                     Enter your mobile money number to pay via M-Pesa, Tigo Pesa, or Airtel Money.
                   </p>
 
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <Label htmlFor="phone">Phone Number</Label>
                       <div className="flex gap-2">
                         <div className="flex-1">
                           <Input
                             id="phone"
                             type="tel"
                             value={formData.phone}
                             onChange={(e) => handleInputChange('phone', e.target.value)}
                             placeholder="0712 345 678"
                             disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                           />
                         </div>
                         <Button
                           type="button"
                           variant="outline"
                           onClick={handleVerifyPhone}
                           disabled={paymentStatus === 'previewing' || paymentStatus === 'processing' || paymentStatus === 'success'}
                         >
                           {paymentStatus === 'previewing' ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <>
                               <Phone className="h-4 w-4 mr-2" />
                               Verify
                             </>
                           )}
                         </Button>
                       </div>
                       {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                     </div>
                     
                     {/* Available payment methods */}
                     {availableMethods.length > 0 && (
                       <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                         <p className="text-sm font-medium">Available payment methods:</p>
                         <div className="flex flex-wrap gap-2">
                           {availableMethods.map((method) => (
                             <div
                               key={method.name}
                               className={`px-3 py-1 rounded-full text-sm ${
                                 method.status === 'AVAILABLE'
                                   ? 'bg-green-500/10 text-green-600'
                                   : 'bg-destructive/10 text-destructive'
                               }`}
                             >
                               {method.name}
                               {method.fee ? ` (Fee: TSh ${method.fee})` : ''}
                             </div>
                           ))}
                         </div>
                         <p className="text-sm text-muted-foreground mt-2">
                           Amount: <span className="font-semibold">TSh {getTotalPrice().toLocaleString()}</span>
                         </p>
                       </div>
                     )}
 
                     {/* Payment status */}
                     {statusDisplay && (
                       <div className={`flex items-center gap-2 ${statusDisplay.color}`}>
                         {paymentStatus === 'processing' && <Loader2 className="h-4 w-4 animate-spin" />}
                         {paymentStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                         {paymentStatus === 'failed' && <AlertCircle className="h-4 w-4" />}
                         <span className="text-sm">{statusDisplay.text}</span>
                       </div>
                     )}
                     
                     {paymentStatus === 'processing' && (
                       <div className="bg-gold/10 rounded-lg p-4 border border-gold/20">
                         <p className="text-sm text-gold font-medium">
                           A payment request has been sent to your phone.
                         </p>
                         <p className="text-xs text-muted-foreground mt-1">
                           Enter your mobile money PIN to complete the payment.
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
 
               {/* Order Summary */}
               <div className="lg:col-span-2">
                 <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                   <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                   
                   <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                     {items.map((item) => (
                       <div key={`${item.productId}-${item.selectedModel}`} className="flex gap-3">
                         <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                           <img src={item.image} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium truncate">{item.name}</p>
                           <p className="text-xs text-muted-foreground">{item.selectedModel} × {item.quantity}</p>
                         </div>
                         <p className="text-sm font-medium">TSh {(item.price * item.quantity).toLocaleString()}</p>
                       </div>
                     ))}
                   </div>
 
                   <div className="border-t border-border pt-4 space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Subtotal</span>
                       <span>TSh {getTotalPrice().toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Shipping</span>
                       <span className="text-gold">Free</span>
                     </div>
                     <div className="flex justify-between text-lg font-semibold pt-2">
                       <span>Total</span>
                       <span>TSh {getTotalPrice().toLocaleString()}</span>
                     </div>
                   </div>
 
                   <Button
                     type="submit"
                     variant="gold"
                     className="w-full mt-6"
                     size="lg"
                     disabled={isSubmitting || paymentStatus === 'processing' || paymentStatus === 'initiating'}
                   >
                     {isSubmitting || paymentStatus === 'processing' || paymentStatus === 'initiating' ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         {paymentStatus === 'processing' ? 'Awaiting Payment...' : 'Processing...'}
                       </>
                     ) : (
                       'Pay Now'
                     )}
                   </Button>
                 </div>
               </div>
             </div>
           </form>
         </div>
       </main>
 
       <Footer />
       <WhatsAppButton />
     </div>
   );
 };
 
 export default Checkout;