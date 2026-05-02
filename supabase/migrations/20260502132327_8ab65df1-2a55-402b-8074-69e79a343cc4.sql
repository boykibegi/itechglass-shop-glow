CREATE TABLE public.inventory_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unit_price_tzs NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_sales_item ON public.inventory_sales(inventory_item_id);
CREATE INDEX idx_inventory_sales_date ON public.inventory_sales(sale_date DESC);

ALTER TABLE public.inventory_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sales"
  ON public.inventory_sales FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sales"
  ON public.inventory_sales FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sales"
  ON public.inventory_sales FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger: keep inventory_items.units_sold in sync, and prevent overselling
CREATE OR REPLACE FUNCTION public.sync_inventory_units_sold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  available INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT (units_bought - units_sold) INTO available
      FROM public.inventory_items WHERE id = NEW.inventory_item_id FOR UPDATE;
    IF available IS NULL THEN
      RAISE EXCEPTION 'Inventory item not found';
    END IF;
    IF NEW.quantity > available THEN
      RAISE EXCEPTION 'Cannot sell % units — only % available', NEW.quantity, available;
    END IF;
    UPDATE public.inventory_items
       SET units_sold = units_sold + NEW.quantity, updated_at = now()
     WHERE id = NEW.inventory_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.inventory_items
       SET units_sold = GREATEST(0, units_sold - OLD.quantity), updated_at = now()
     WHERE id = OLD.inventory_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_inventory_units_sold
AFTER INSERT OR DELETE ON public.inventory_sales
FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_units_sold();