import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type InventoryItem = {
  id: string;
  phone_model: string;
  buying_price_yuan: number;
  exchange_rate: number;
  units_bought: number;
  units_sold: number;
  stock_in_date: string;
  selling_price_tzs: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  phone_model: string;
  buying_price_yuan: string;
  exchange_rate: string;
  units_bought: string;
  units_sold: string;
  stock_in_date: string;
  selling_price_tzs: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  phone_model: '',
  buying_price_yuan: '',
  exchange_rate: '380',
  units_bought: '1',
  units_sold: '0',
  stock_in_date: today(),
  selling_price_tzs: '',
  notes: '',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

const AdminInventory = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as InventoryItem[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        phone_model: form.phone_model.trim(),
        buying_price_yuan: parseFloat(form.buying_price_yuan) || 0,
        exchange_rate: parseFloat(form.exchange_rate) || 0,
        units_bought: parseInt(form.units_bought) || 0,
        units_sold: parseInt(form.units_sold) || 0,
        stock_in_date: form.stock_in_date || today(),
        selling_price_tzs: parseFloat(form.selling_price_tzs) || 0,
        notes: form.notes.trim() || null,
      };
      if (!payload.phone_model) throw new Error('Phone model is required');
      if (editing) {
        const { error } = await supabase
          .from('inventory_items' as any)
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inventory_items' as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory_items'] });
      toast.success(editing ? 'Item updated' : 'Item added');
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory_items'] });
      toast.success('Item deleted');
      setDeleting(null);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete'),
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      phone_model: item.phone_model,
      buying_price_yuan: String(item.buying_price_yuan),
      exchange_rate: String(item.exchange_rate),
      units_bought: String(item.units_bought),
      selling_price_tzs: String(item.selling_price_tzs),
      notes: item.notes ?? '',
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const filtered = items.filter((i) =>
    i.phone_model.toLowerCase().includes(search.toLowerCase()),
  );

  // Totals
  const totals = filtered.reduce(
    (acc, i) => {
      const tzCost = i.buying_price_yuan * i.exchange_rate;
      const profitPerUnit = i.selling_price_tzs - tzCost;
      acc.units += i.units_bought;
      acc.cost += tzCost * i.units_bought;
      acc.revenue += i.selling_price_tzs * i.units_bought;
      acc.profit += profitPerUnit * i.units_bought;
      return acc;
    },
    { units: 0, cost: 0, revenue: 0, profit: 0 },
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-sm text-muted-foreground">
              Track buying cost, units, and profit per phone model.
            </p>
          </div>
          <Button onClick={openAdd} className="bg-gold text-background hover:bg-gold/90">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search phone model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Model</TableHead>
                  <TableHead className="text-right">Buying (¥)</TableHead>
                  <TableHead className="text-right">Exchange Rate</TableHead>
                  <TableHead className="text-right">TZS Cost/Unit</TableHead>
                  <TableHead className="text-right">Units Bought</TableHead>
                  <TableHead className="text-right">Selling/Unit (TZS)</TableHead>
                  <TableHead className="text-right">Profit/Unit (TZS)</TableHead>
                  <TableHead className="text-right">Total Cost (TZS)</TableHead>
                  <TableHead className="text-right">Total Revenue (TZS)</TableHead>
                  <TableHead className="text-right">Total Profit (TZS)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      No inventory items yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const tzCost = item.buying_price_yuan * item.exchange_rate;
                    const profitPerUnit = item.selling_price_tzs - tzCost;
                    const totalCost = tzCost * item.units_bought;
                    const totalRevenue = item.selling_price_tzs * item.units_bought;
                    const totalProfit = profitPerUnit * item.units_bought;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.phone_model}</TableCell>
                        <TableCell className="text-right">¥{fmt(item.buying_price_yuan)}</TableCell>
                        <TableCell className="text-right">{item.exchange_rate}</TableCell>
                        <TableCell className="text-right">{fmt(tzCost)}</TableCell>
                        <TableCell className="text-right">{item.units_bought}</TableCell>
                        <TableCell className="text-right">{fmt(item.selling_price_tzs)}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${profitPerUnit >= 0 ? 'text-green-500' : 'text-destructive'}`}
                        >
                          {fmt(profitPerUnit)}
                        </TableCell>
                        <TableCell className="text-right">{fmt(totalCost)}</TableCell>
                        <TableCell className="text-right">{fmt(totalRevenue)}</TableCell>
                        <TableCell
                          className={`text-right font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-destructive'}`}
                        >
                          {fmt(totalProfit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleting(item)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              {filtered.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-semibold">Totals</TableCell>
                    <TableCell className="text-right font-semibold">{totals.units}</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell className="text-right font-semibold">{fmt(totals.cost)}</TableCell>
                    <TableCell className="text-right font-semibold">{fmt(totals.revenue)}</TableCell>
                    <TableCell
                      className={`text-right font-bold ${totals.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}
                    >
                      {fmt(totals.profit)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={(o) => (o ? setIsOpen(true) : closeDialog())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Phone Model</Label>
              <Input
                value={form.phone_model}
                onChange={(e) => setForm({ ...form, phone_model: e.target.value })}
                placeholder="e.g. iPhone 15 Pro Max"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Buying Price (¥)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.buying_price_yuan}
                  onChange={(e) => setForm({ ...form, buying_price_yuan: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Exchange Rate (TZS/¥)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.exchange_rate}
                  onChange={(e) => setForm({ ...form, exchange_rate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Units Bought</Label>
                <Input
                  type="number"
                  value={form.units_bought}
                  onChange={(e) => setForm({ ...form, units_bought: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Selling Price (TZS)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.selling_price_tzs}
                  onChange={(e) => setForm({ ...form, selling_price_tzs: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Live preview */}
            {form.buying_price_yuan && form.exchange_rate && (
              <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TZS cost / unit:</span>
                  <span>
                    {fmt(parseFloat(form.buying_price_yuan) * parseFloat(form.exchange_rate))}
                  </span>
                </div>
                {form.selling_price_tzs && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit / unit:</span>
                    <span className="font-semibold text-gold">
                      {fmt(
                        parseFloat(form.selling_price_tzs) -
                          parseFloat(form.buying_price_yuan) * parseFloat(form.exchange_rate),
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={() => upsertMutation.mutate()}
              disabled={upsertMutation.isPending}
              className="bg-gold text-background hover:bg-gold/90"
            >
              {upsertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inventory item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deleting?.phone_model}" from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminInventory;
