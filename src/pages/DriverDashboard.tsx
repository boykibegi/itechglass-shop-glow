import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Navigation, Package, CheckCircle, Play, Square, Loader2, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DeliveryMap from '@/components/tracking/DeliveryMap';

const STORE_LOCATION = { lat: -6.7924, lng: 39.2083 };
const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds

interface OrderItem {
  name: string;
  quantity: number;
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const {
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    error: geoError,
    isTracking,
    startTracking,
    stopTracking,
  } = useGeolocation();

  // Check if user is a driver
  const { data: isDriver, isLoading: roleLoading } = useQuery({
    queryKey: ['isDriver', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'driver',
      });
      return data === true;
    },
    enabled: !!user?.id,
  });

  // Fetch assigned orders
  const { data: assignedOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['driverOrders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', user?.id)
        .in('order_status', ['processing', 'shipped'])
        .order('assigned_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isDriver === true,
    refetchInterval: 30000,
  });

  // Mutation to update location
  const updateLocation = useMutation({
    mutationFn: async ({ orderId, lat, lng, acc, head, spd }: {
      orderId: string;
      lat: number;
      lng: number;
      acc: number | null;
      head: number | null;
      spd: number | null;
    }) => {
      const { error } = await supabase
        .from('delivery_locations')
        .insert({
          order_id: orderId,
          driver_id: user?.id,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          heading: head,
          speed: spd,
        });

      if (error) throw error;
    },
  });

  // Mutation to update order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverOrders'] });
      toast({
        title: 'Status Updated',
        description: 'Order status has been updated successfully.',
      });
    },
  });

  // Send location updates when tracking
  useEffect(() => {
    if (!isTracking || !activeOrderId || latitude === null || longitude === null) return;

    const interval = setInterval(() => {
      if (latitude !== null && longitude !== null) {
        updateLocation.mutate({
          orderId: activeOrderId,
          lat: latitude,
          lng: longitude,
          acc: accuracy,
          head: heading,
          spd: speed,
        });
      }
    }, LOCATION_UPDATE_INTERVAL);

    // Also send immediately
    updateLocation.mutate({
      orderId: activeOrderId,
      lat: latitude,
      lng: longitude,
      acc: accuracy,
      head: heading,
      spd: speed,
    });

    return () => clearInterval(interval);
  }, [isTracking, activeOrderId, latitude, longitude]);

  const handleStartDelivery = useCallback((orderId: string) => {
    setActiveOrderId(orderId);
    startTracking();
    updateOrderStatus.mutate({ orderId, status: 'shipped' });
    toast({
      title: 'Delivery Started',
      description: 'Your location is now being tracked.',
    });
  }, [startTracking, updateOrderStatus, toast]);

  const handleCompleteDelivery = useCallback((orderId: string) => {
    stopTracking();
    setActiveOrderId(null);
    updateOrderStatus.mutate({ orderId, status: 'delivered' });
    toast({
      title: 'Delivery Completed',
      description: 'Order has been marked as delivered.',
    });
  }, [stopTracking, updateOrderStatus, toast]);

  const handleStopTracking = useCallback(() => {
    stopTracking();
    setActiveOrderId(null);
  }, [stopTracking]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isDriver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-4">
          You don't have driver access. Please contact an administrator.
        </p>
        <Button variant="gold" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="container max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Driver Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your deliveries</p>
          </div>
          <div className="flex items-center gap-2">
            {isTracking && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Navigation className="h-3 w-3 mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6 px-4 space-y-6">
        {/* GPS Status */}
        {geoError && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-4">
              <p className="text-sm text-red-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                GPS Error: {geoError}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Location Map */}
        {isTracking && latitude && longitude && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5 text-gold" />
                Your Location
              </CardTitle>
              <CardDescription>
                Accuracy: {accuracy?.toFixed(0)}m | Speed: {speed?.toFixed(1) || '0'} m/s
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryMap
                storeLocation={STORE_LOCATION}
                driverLocation={{ lat: latitude, lng: longitude }}
                className="h-[250px]"
              />
              <Button
                variant="outline"
                onClick={handleStopTracking}
                className="mt-4 w-full"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Tracking
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Assigned Orders */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Assigned Orders</h2>
          
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : !assignedOrders?.length ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders assigned to you yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((order) => {
                const items = order.items as unknown as OrderItem[];
                const isActive = activeOrderId === order.id;

                return (
                  <Card key={order.id} className={isActive ? 'border-gold' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-mono">
                            #{order.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription>{order.customer_name}</CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            order.order_status === 'shipped'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }
                        >
                          {order.order_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Items */}
                      <div className="text-sm">
                        <p className="font-medium mb-1">Items:</p>
                        {items.map((item, idx) => (
                          <p key={idx} className="text-muted-foreground">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>

                      {/* Customer Info */}
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {order.shipping_address}
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {order.customer_phone}
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {order.customer_email}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="font-medium">Total</span>
                        <span className="text-gold font-bold">{formatPrice(order.total_amount)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {order.order_status === 'processing' && !isTracking && (
                          <Button
                            variant="gold"
                            className="flex-1"
                            onClick={() => handleStartDelivery(order.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Delivery
                          </Button>
                        )}
                        
                        {order.order_status === 'shipped' && isActive && (
                          <Button
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleCompleteDelivery(order.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Delivered
                          </Button>
                        )}

                        {order.order_status === 'shipped' && !isActive && !isTracking && (
                          <Button
                            variant="gold"
                            className="flex-1"
                            onClick={() => handleStartDelivery(order.id)}
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Resume Tracking
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
