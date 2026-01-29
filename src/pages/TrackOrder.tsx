import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, MapPin, Navigation, Loader2, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DeliveryMap from '@/components/tracking/DeliveryMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const STORE_LOCATION = { lat: -6.7924, lng: 39.2083 };

interface LocationPoint {
  lat: number;
  lng: number;
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="h-5 w-5" />, label: 'Order Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  processing: { icon: <Package className="h-5 w-5" />, label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  shipped: { icon: <Truck className="h-5 w-5" />, label: 'Out for Delivery', color: 'bg-gold/10 text-gold border-gold/20' },
  delivered: { icon: <CheckCircle className="h-5 w-5" />, label: 'Delivered', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  cancelled: { icon: <XCircle className="h-5 w-5" />, label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const TrackOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [driverLocation, setDriverLocation] = useState<LocationPoint | null>(null);
  const [routeHistory, setRouteHistory] = useState<LocationPoint[]>([]);

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['trackOrder', orderId],
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

  // Fetch location history
  const { data: locationHistory } = useQuery({
    queryKey: ['locationHistory', orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from('delivery_locations')
        .select('latitude, longitude, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId && order?.order_status === 'shipped',
    refetchInterval: 10000,
  });

  // Set up realtime subscription for live updates
  useEffect(() => {
    if (!orderId || order?.order_status !== 'shipped') return;

    const channel = supabase
      .channel(`delivery-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_locations',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newLocation = payload.new as { latitude: number; longitude: number };
          setDriverLocation({
            lat: Number(newLocation.latitude),
            lng: Number(newLocation.longitude),
          });
          setRouteHistory(prev => [
            ...prev,
            { lat: Number(newLocation.latitude), lng: Number(newLocation.longitude) }
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, order?.order_status]);

  // Update driver location from history
  useEffect(() => {
    if (locationHistory && locationHistory.length > 0) {
      const history = locationHistory.map(loc => ({
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
      }));
      setRouteHistory(history);
      setDriverLocation(history[history.length - 1]);
    }
  }, [locationHistory]);

  if (orderLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl">
            <Skeleton className="h-8 w-48 mb-8" />
            <Skeleton className="h-[400px] w-full mb-4" />
            <Skeleton className="h-32 w-full" />
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
            <p className="text-muted-foreground mb-4">
              This order doesn't exist or you don't have access to it.
            </p>
            <Button asChild variant="gold">
              <Link to="/orders">View My Orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.order_status] || statusConfig.pending;
  const isTrackable = order.order_status === 'shipped';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl px-4">
          {/* Back Button */}
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to={`/order/${orderId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order Details
            </Link>
          </Button>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Track Delivery</h1>
              <p className="text-sm text-muted-foreground font-mono">Order #{order.id.slice(0, 8)}</p>
            </div>
            <Badge variant="outline" className={status.color}>
              {status.icon}
              <span className="ml-2">{status.label}</span>
            </Badge>
          </div>

          {/* Map Section */}
          {isTrackable ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-gold" />
                  Live Tracking
                </CardTitle>
                <CardDescription>
                  {driverLocation 
                    ? 'Your order is on the way! The driver\'s location updates in real-time.'
                    : 'Waiting for driver to start delivery...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeliveryMap
                  storeLocation={STORE_LOCATION}
                  driverLocation={driverLocation}
                  routeHistory={routeHistory}
                  className="h-[400px]"
                />
                {driverLocation && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Store</span>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <div className="w-3 h-3 rounded-full bg-gold" />
                      <span>Driver</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-12 text-center">
                {order.order_status === 'delivered' ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Order Delivered!</h2>
                    <p className="text-muted-foreground">
                      Your order has been successfully delivered.
                    </p>
                  </>
                ) : order.order_status === 'cancelled' ? (
                  <>
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Order Cancelled</h2>
                    <p className="text-muted-foreground">
                      This order has been cancelled.
                    </p>
                  </>
                ) : (
                  <>
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Tracking Not Available Yet</h2>
                    <p className="text-muted-foreground">
                      Live tracking will be available once your order is out for delivery.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.shipping_address}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
