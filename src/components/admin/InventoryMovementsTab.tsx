import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

type InventoryCategory = 'backglass' | 'cover';

type Movement = {
  id: string;
  inventory_item_id: string;
  category: InventoryCategory;
  phone_model: string;
  movement_type: 'created' | 'updated' | 'deleted';
  units_bought_before: number | null;
  units_bought_after: number | null;
  units_sold_before: number | null;
  units_sold_after: number | null;
  buying_price_yuan_before: number | null;
  buying_price_yuan_after: number | null;
  selling_price_tzs_before: number | null;
  selling_price_tzs_after: number | null;
  created_at: string;
};

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

const diff = (before: number | null, after: number | null) => {
  if (before == null || after == null || before === after) return null;
  const d = after - before;
  return (d > 0 ? '+' : '') + fmt(d);
};

const typeMeta: Record<Movement['movement_type'], { label: string; icon: typeof Plus; cls: string }> = {
  created: { label: 'Added', icon: Plus, cls: 'bg-green-500/15 text-green-500 border-green-500/30' },
  updated: { label: 'Edited', icon: Pencil, cls: 'bg-gold/15 text-gold border-gold/30' },
  deleted: { label: 'Deleted', icon: Trash2, cls: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export default function InventoryMovementsTab({ category }: { category: InventoryCategory }) {
  const [search, setSearch] = useState('');

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['inventory_movements', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements' as any)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as unknown as Movement[];
    },
  });

  const filtered = movements.filter((m) =>
    m.phone_model.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
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
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Phone Model</TableHead>
                <TableHead className="text-right">Units Bought</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Buying (¥)</TableHead>
                <TableHead className="text-right">Selling (TZS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No movements yet for {category === 'cover' ? 'Covers' : 'Backglass'}.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => {
                  const meta = typeMeta[m.movement_type];
                  const Icon = meta.icon;
                  const ub = diff(m.units_bought_before, m.units_bought_after);
                  const us = diff(m.units_sold_before, m.units_sold_after);
                  const bp = diff(m.buying_price_yuan_before, m.buying_price_yuan_after);
                  const sp = diff(m.selling_price_tzs_before, m.selling_price_tzs_after);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(m.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={meta.cls}>
                          <Icon className="h-3 w-3 mr-1" /> {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{m.phone_model}</TableCell>
                      <TableCell className="text-right">
                        {m.movement_type === 'updated' ? (
                          ub ? (
                            <span className={ub.startsWith('+') ? 'text-green-500' : 'text-destructive'}>
                              {ub} <span className="text-muted-foreground text-xs">({fmt(m.units_bought_before)} → {fmt(m.units_bought_after)})</span>
                            </span>
                          ) : '—'
                        ) : (
                          fmt(m.units_bought_after ?? m.units_bought_before)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {m.movement_type === 'updated' ? (
                          us ? (
                            <span className={us.startsWith('+') ? 'text-green-500' : 'text-destructive'}>
                              {us} <span className="text-muted-foreground text-xs">({fmt(m.units_sold_before)} → {fmt(m.units_sold_after)})</span>
                            </span>
                          ) : '—'
                        ) : (
                          fmt(m.units_sold_after ?? m.units_sold_before)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {m.movement_type === 'updated' ? (
                          bp ? (
                            <span className="text-xs text-muted-foreground">¥{fmt(m.buying_price_yuan_before)} → ¥{fmt(m.buying_price_yuan_after)}</span>
                          ) : '—'
                        ) : (
                          `¥${fmt(m.buying_price_yuan_after ?? m.buying_price_yuan_before)}`
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {m.movement_type === 'updated' ? (
                          sp ? (
                            <span className="text-xs text-muted-foreground">{fmt(m.selling_price_tzs_before)} → {fmt(m.selling_price_tzs_after)}</span>
                          ) : '—'
                        ) : (
                          fmt(m.selling_price_tzs_after ?? m.selling_price_tzs_before)
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
