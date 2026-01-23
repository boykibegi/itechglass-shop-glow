import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useCart } from '@/lib/cart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required').max(255),
  phone: z.string().min(10, 'Valid phone number required').max(20),
  address: z.string().min(10, 'Full address required').max(500),
  paymentMethod: z.enum(['mpesa', 'tigopesa', 'airtelmoney']),
  transactionId: z.string().min(5, 'Transaction ID required').max(100).optional(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'mpesa',
    transactionId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', number: '0712 345 678', instructions: 'Send to M-Pesa number' },
    { id: 'tigopesa', name: 'Tigo Pesa', number: '0652 345 678', instructions: 'Send to Tigo Pesa number' },
    { id: 'airtelmoney', name: 'Airtel Money', number: '0782 345 678', instructions: 'Send to Airtel Money number' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB allowed.');
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate form
    try {
      checkoutSchema.parse({
        ...formData,
        transactionId: formData.transactionId || undefined,
      });
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

    if (!formData.transactionId && !paymentProofFile) {
      toast.error('Please provide either a transaction ID or upload payment proof');
      return;
    }

    setIsSubmitting(true);

    try {
      let paymentProofUrl = null;

      // Upload payment proof if provided
      if (paymentProofFile) {
        const fileExt = paymentProofFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentProofFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
        
        paymentProofUrl = publicUrl;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.phone.trim(),
          shipping_address: formData.address.trim(),
          items: items as unknown as Record<string, unknown>,
          total_amount: getTotalPrice(),
          payment_method: formData.paymentMethod,
          transaction_id: formData.transactionId.trim() || null,
          payment_proof_url: paymentProofUrl,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === formData.paymentMethod);

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0712 345 678"
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
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
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                  
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          formData.paymentMethod === method.id
                            ? 'border-gold bg-gold/5'
                            : 'border-border hover:border-gold/50'
                        }`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <span className="font-medium">{method.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {selectedPaymentMethod && (
                    <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                      <p className="text-sm font-medium mb-2">{selectedPaymentMethod.instructions}:</p>
                      <p className="text-2xl font-bold text-gold">{selectedPaymentMethod.number}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Amount: <span className="font-semibold">TSh {getTotalPrice().toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Confirmation */}
                <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Payment Confirmation</h2>
                  <p className="text-sm text-muted-foreground">
                    After making the payment, provide either the transaction ID or upload a screenshot.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID / Reference Number</Label>
                    <Input
                      id="transactionId"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      placeholder="e.g., MP12345678"
                    />
                  </div>

                  <div className="relative">
                    <p className="text-center text-sm text-muted-foreground my-4">OR</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Payment Proof</Label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {paymentProofFile ? paymentProofFile.name : 'Click to upload screenshot'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
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
