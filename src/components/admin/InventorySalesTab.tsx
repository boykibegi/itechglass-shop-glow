import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type InventoryItem = {
  id: string;
  phone_model: string;
  units_bought: number;
  units_sold: number;
  selling_price_tzs: number;
};

type Sale = {
  id: string;
  inventory_item_id: string;
  quantity: number;
  sale_date: string;
  unit_price_tzs: number | null;
  notes: string | null;
  created_at: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

const InventorySalesTab = () => {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState<Sale | null>(null);
  const [form, setForm] = useState({
    inventory_item_id: '',
    quantity: '1',
    sale_date: today(),
    unit_price_tzs: '',
    notes: '',
  });

  const { data: items = [] } = useQuery({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select('id, phone_model, units_bought, units_sold, selling_price_tzs')
        .order('phone_model');
      if (error) throw error;
      return data as unknown as InventoryItem[];
    },
  });

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['inventory_sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_sales' as any)
        .select('*')
        .order('sale_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Sale[];
    },
  });

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.inventory_item_id) throw new Error('Select a phone model');
      const qty = parseInt(form.quantity);
      if (!qty || qty < 1) throw new Error('Quantity must be at least 1');
      const item = itemMap.get(form.inventory_item_id);
      const fallbackPrice = item?.selling_price_tzs ?? 0;
      const { error } = await supabase.from('inventory_sales' as any).insert({
        inventory_item_id: form.inventory_item_id,
        quantity: qty,
        sale_date: form.sale_date || today(),
        unit_price_tzs: form.unit_price_tzs
          ? parseFloat(form.unit_price_tzs)
          : fallbackPrice,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory_sales'] });
      qc.invalidateQueries({ queryKey: ['inventory_items'] });
      toast.success('Sale recorded');
      setIsOpen(false);
      setForm({
        inventory_item_id: '',
        quantity: '1',
        sale_date: today(),
        unit_price_tzs: '',
        notes: '',
      });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to record sale'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_sales' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory_sales'] });
      qc.invalidateQueries({ queryKey: ['inventory_items'] });
      toast.success('Sale removed (stock restored)');
      setDeleting(null);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete'),
  });

  const totals = sales.reduce(
    (acc, s) => {
      acc.qty += s.quantity;
      acc.revenue += (s.unit_price_tzs ?? 0) * s.quantity;
      return acc;
    },
    { qty: 0, revenue: 0 },
  );

  const selectedItem = itemMap.get(form.inventory_item_id);
  const available = selectedItem
    ? selectedItem.units_bought - selectedItem.units_sold
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Sales Log</h2>
          <p className="text-sm text-muted-foreground">
            Each sale automatically reduces remaining stock.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gold text-background hover:bg-gold/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Record Sale
        </Button>
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
                <TableHead>Date</TableHead>
                <TableHead>Phone Model</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price (TZS)</TableHead>
                <TableHead className="text-right">Total (TZS)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No sales recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((s) => {
                  const item = itemMap.get(s.inventory_item_id);
                  const total = (s.unit_price_tzs ?? 0) * s.quantity;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(s.sale_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item?.phone_model ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">{s.quantity}</TableCell>
                      <TableCell className="text-right">
                        {s.unit_price_tzs != null ? fmt(s.unit_price_tzs) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmt(total)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {s.notes ?? ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleting(s)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {sales.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">Totals</TableCell>
                  <TableCell className="text-right font-semibold">{totals.qty}</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-bold text-gold">
                    {fmt(totals.revenue)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}
      </div>

      {/* Record sale dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Sale</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Phone Model</Label>
              <Select
                value={form.inventory_item_id}
                onValueChange={(v) => setForm({ ...form, inventory_item_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a model..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => {
                    const left = i.units_bought - i.units_sold;
                    return (
                      <SelectItem
                        key={i.id}
                        value={i.id}
                        disabled={left <= 0}
                      >
                        {i.phone_model} ({left} left)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedItem && (
                <p className="text-xs text-muted-foreground">
                  Available stock: <span className="font-semibold">{available}</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max={available || undefined}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sale Date</Label>
                <Input
                  type="date"
                  value={form.sale_date}
                  onChange={(e) => setForm({ ...form, sale_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                Discount Selling Price (TZS){' '}
                <span className="text-xs text-muted-foreground">
                  (leave empty to use the model's regular price
                  {selectedItem
                    ? `: ${fmt(selectedItem.selling_price_tzs)}`
                    : ''}
                  )
                </span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder={
                  selectedItem
                    ? `Discount price (regular: ${fmt(selectedItem.selling_price_tzs)})`
                    : 'Enter discounted price if any'
                }
                value={form.unit_price_tzs}
                onChange={(e) => setForm({ ...form, unit_price_tzs: e.target.value })}
              />
              {selectedItem &&
                form.unit_price_tzs &&
                parseFloat(form.unit_price_tzs) < selectedItem.selling_price_tzs && (
                  <p className="text-xs text-gold">
                    Discount: {fmt(selectedItem.selling_price_tzs - parseFloat(form.unit_price_tzs))} TZS off per unit
                  </p>
                )}
            </div>
            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Customer name, channel, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="bg-gold text-background hover:bg-gold/90"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Record Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.quantity} unit(s) will be returned to stock.
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
    </div>
  );
};

export default InventorySalesTab;
