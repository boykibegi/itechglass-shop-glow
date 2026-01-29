import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, MapPin, Phone, Mail, CreditCard, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedModel?: string;
}

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  pending: { icon: <Clock className="h-5 w-5" />, label: 'Order Pending' },
  processing: { icon: <Package className="h-5 w-5" />, label: 'Processing' },
  shipped: { icon: <Truck className="h-5 w-5" />, label: 'Shipped' },
  delivered: { icon: <CheckCircle className="h-5 w-5" />, label: 'Delivered' },
  cancelled: { icon: <XCircle className="h-5 w-5" />, label: 'Cancelled' },
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId || !user?.email) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('customer_email', user.email)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId && !!user?.email,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProgressValue = (status: string) => {
    if (status === 'cancelled') return 0;
    const index = statusSteps.indexOf(status);
    return ((index + 1) / statusSteps.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">This order doesn't exist or you don't have access to it.</p>
            <Button asChild variant="gold">
              <Link to="/orders">View My Orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const items = order.items as unknown as OrderItem[];
  const status = statusConfig[order.order_status] || statusConfig.pending;
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          {/* Order Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order Details</h1>
                <p className="text-sm text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
              </div>
              <Badge 
                variant="outline" 
                className={`text-base px-4 py-2 ${isCancelled ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}
              >
                {status.icon}
                <span className="ml-2">{status.label}</span>
              </Badge>
            </div>
          </div>

          {/* Order Progress */}
          {!isCancelled && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Progress value={getProgressValue(order.order_status)} className="h-2" />
                </div>
                <div className="flex justify-between">
                  {statusSteps.map((step, index) => {
                    const stepIndex = statusSteps.indexOf(order.order_status);
                    const isActive = index <= stepIndex;
                    const stepConfig = statusConfig[step];
                    
                    return (
                      <div key={step} className={`flex flex-col items-center ${isActive ? 'text-gold' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isActive ? 'bg-gold/20' : 'bg-secondary'}`}>
                          {stepConfig.icon}
                        </div>
                        <span className="text-xs text-center hidden sm:block">{stepConfig.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Items */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.selectedModel && (
                          <p className="text-sm text-muted-foreground">{item.selectedModel}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-gold">{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {order.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {order.customer_email}
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold" />
                  Payment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant="outline" 
                    className={order.payment_status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}
                  >
                    {order.payment_status === 'confirmed' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-sm">{order.transaction_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Date</span>
                  <span className="text-sm">{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Track Delivery Button */}
          {(order.order_status === 'shipped' || order.order_status === 'processing') && (
            <Card className="mt-6">
              <CardContent className="py-4">
                <Button asChild variant="gold" className="w-full">
                  <Link to={`/track/${order.id}`}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Track Live Delivery
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-6">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                Need help with your order? Contact us on WhatsApp for instant support.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default OrderDetail;
