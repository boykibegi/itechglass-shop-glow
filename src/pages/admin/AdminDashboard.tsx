import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, stock', { count: 'exact' }),
        supabase.from('orders').select('id, total_amount, payment_status, created_at'),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      
      const totalRevenue = orders
        .filter((o) => o.payment_status === 'confirmed')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      const pendingOrders = orders.filter((o) => o.payment_status === 'pending').length;
      const lowStockProducts = products.filter((p) => p.stock < 5).length;

      return {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      description: `${stats?.lowStockProducts || 0} low stock`,
      color: 'text-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: `${stats?.pendingOrders || 0} pending`,
      color: 'text-green-500',
    },
    {
      title: 'Revenue',
      value: `TSh ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      description: 'From confirmed orders',
      color: 'text-gold',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      description: 'Awaiting confirmation',
      color: 'text-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to iTechGlass admin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/admin/products"
                className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium">Manage Products</p>
                    <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
                  </div>
                </div>
              </a>
              <a
                href="/admin/orders"
                className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium">View Orders</p>
                    <p className="text-sm text-muted-foreground">Review and confirm payments</p>
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="flex items-center gap-2 text-sm text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="flex items-center gap-2 text-sm text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <span className="flex items-center gap-2 text-sm text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Enabled
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
