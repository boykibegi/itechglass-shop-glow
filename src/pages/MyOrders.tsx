import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedModel?: string;
}

const MyOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pending: { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: t('orders.pending') },
    processing: { icon: <Package className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: t('orders.processing') },
    shipped: { icon: <Truck className="h-4 w-4" />, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: t('orders.shipped') },
    delivered: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: t('orders.delivered') },
    cancelled: { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500/10 text-red-500 border-red-500/20', label: t('orders.cancelled') },
  };

  const paymentStatusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: t('orders.pending') },
    confirmed: { color: 'bg-green-500/10 text-green-500 border-green-500/20', label: t('orders.delivered') },
    failed: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: t('orders.cancelled') },
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const items = order.items as unknown as OrderItem[];
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || order.id.toLowerCase().includes(searchLower) || items.some(item => item.name.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(price);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t('orders.noOrders')}</h2>
            <p className="text-muted-foreground mb-4">{t('orders.noOrdersDesc')}</p>
            <Button asChild variant="gold">
              <Link to="/shop">{t('orders.browseProducts')}</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t('orders.noMatching')}</h2>
            <p className="text-muted-foreground mb-4">{t('orders.noMatchingDesc')}</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
              {t('shop.clearFilters')}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {(searchQuery || statusFilter !== 'all') && (
          <p className="text-sm text-muted-foreground mb-2">
            {t('orders.showing')} {filteredOrders.length} {t('orders.of')} {orders.length} {t('orders.orders')}
          </p>
        )}
        {filteredOrders.map((order) => {
          const items = order.items as unknown as OrderItem[];
          const status = statusConfig[order.order_status] || statusConfig.pending;
          const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;

          return (
            <Card key={order.id} className="overflow-hidden hover:border-gold/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('orders.orderPlaced')} {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      ID: {order.id.slice(0, 8)}...
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

                <div className="space-y-3">
                  {items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
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
                  {items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{items.length - 2} more item{items.length - 2 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('cart.total')}</p>
                    <p className="text-lg font-bold text-gold">{formatPrice(order.total_amount)}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-gold hover:text-gold">
                    <Link to={`/order/${order.id}`}>
                      {t('orders.viewDetails')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gold/10 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('orders.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('orders.subtitle')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('orders.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('orders.allOrders')}</SelectItem>
                <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                <SelectItem value="processing">{t('orders.processing')}</SelectItem>
                <SelectItem value="shipped">{t('orders.shipped')}</SelectItem>
                <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderContent()}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default MyOrders;
