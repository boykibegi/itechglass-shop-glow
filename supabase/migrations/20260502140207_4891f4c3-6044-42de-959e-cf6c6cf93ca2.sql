ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'backglass';

CREATE INDEX IF NOT EXISTS idx_inventory_items_category
  ON public.inventory_items (category);