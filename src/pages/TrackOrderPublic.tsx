import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedModel?: string;
}

interface OrderResult {
  id: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  items: OrderItem[];
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; description: string }> = {
  pending: { icon: <Clock className="h-5 w-5" />, label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', description: 'Your order has been received and is awaiting processing.' },
  processing: { icon: <Package className="h-5 w-5" />, label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', description: 'Your order is being prepared for shipment.' },
  shipped: { icon: <Truck className="h-5 w-5" />, label: 'Out for Delivery', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', description: 'Your order is on its way to you!' },
  delivered: { icon: <CheckCircle className="h-5 w-5" />, label: 'Delivered', color: 'bg-green-500/10 text-green-500 border-green-500/20', description: 'Your order has been delivered successfully.' },
  cancelled: { icon: <XCircle className="h-5 w-5" />, label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20', description: 'This order has been cancelled.' },
};

const paymentStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Payment Pending' },
  confirmed: { color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Paid' },
  failed: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Payment Failed' },
};

const TrackOrderPublic = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(price);

  const getProgressValue = (status: string) => {
    if (status === 'cancelled') return 0;
    const index = statusSteps.indexOf(status);
    return ((index + 1) / statusSteps.length) * 100;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setHasSearched(true);

    if (!orderId.trim() || !phone.trim()) {
      setError('Please enter both your Order ID and phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('lookup-order-status', {
        body: { orderId: orderId.trim(), phone: phone.trim() },
      });

      if (fnError) {
        setError('Could not look up order. Please try again.');
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      setOrder(data as OrderResult);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const status = order ? (statusConfig[order.order_status] || statusConfig.pending) : null;
  const paymentStatus = order ? (paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending) : null;
  const isCancelled = order?.order_status === 'cancelled';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">
              iTech<span className="text-gold">Glass</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-2xl px-4">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground text-sm">
              Enter your order ID and phone number to check the status of your order.
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="e.g. a1b2c3d4-..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. 0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track Order
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Your information is verified securely</span>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="mb-6 border-destructive/30">
              <CardContent className="py-4 text-center text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {order && status && paymentStatus && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Status Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono mb-1">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        Placed on {format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                      <Badge variant="outline" className={paymentStatus.color}>
                        {paymentStatus.label}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{status.description}</p>
                </CardContent>
              </Card>

              {/* Progress */}
              {!isCancelled && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <Progress value={getProgressValue(order.order_status)} className="h-2" />
                    </div>
                    <div className="flex justify-between">
                      {statusSteps.map((step, index) => {
                        const stepIndex = statusSteps.indexOf(order.order_status);
                        const isActive = index <= stepIndex;
                        const stepCfg = statusConfig[step];

                        return (
                          <div key={step} className={`flex flex-col items-center ${isActive ? 'text-gold' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isActive ? 'bg-gold/20' : 'bg-secondary'}`}>
                              {stepCfg.icon}
                            </div>
                            <span className="text-xs text-center hidden sm:block">{stepCfg.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(order.items as unknown as OrderItem[]).map((item, index) => (
                      <div key={index} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          {item.selectedModel && <p className="text-xs text-muted-foreground">{item.selectedModel}</p>}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold text-gold">{formatPrice(order.total_amount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm font-medium">{order.shipping_address}</p>
                </CardContent>
              </Card>

              {/* Last Updated */}
              <p className="text-xs text-center text-muted-foreground">
                Last updated: {format(new Date(order.updated_at), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          )}

          {/* No result message */}
          {hasSearched && !order && !error && !isLoading && (
            <Card className="text-center py-8">
              <CardContent>
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No results to display</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrackOrderPublic;
