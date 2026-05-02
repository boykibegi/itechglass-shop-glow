-- Create inventory movement log
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'backglass',
  phone_model TEXT NOT NULL,
  movement_type TEXT NOT NULL, -- 'created' | 'updated' | 'deleted'
  units_bought_before INTEGER,
  units_bought_after INTEGER,
  units_sold_before INTEGER,
  units_sold_after INTEGER,
  buying_price_yuan_before NUMERIC,
  buying_price_yuan_after NUMERIC,
  selling_price_tzs_before NUMERIC,
  selling_price_tzs_after NUMERIC,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_item ON public.inventory_movements(inventory_item_id);
CREATE INDEX idx_inventory_movements_category ON public.inventory_movements(category);
CREATE INDEX idx_inventory_movements_created ON public.inventory_movements(created_at DESC);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view movements" ON public.inventory_movements
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert movements" ON public.inventory_movements
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger function to log changes
CREATE OR REPLACE FUNCTION public.log_inventory_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.inventory_movements (
      inventory_item_id, category, phone_model, movement_type,
      units_bought_after, units_sold_after,
      buying_price_yuan_after, selling_price_tzs_after, changed_by
    ) VALUES (
      NEW.id, NEW.category, NEW.phone_model, 'created',
      NEW.units_bought, NEW.units_sold,
      NEW.buying_price_yuan, NEW.selling_price_tzs, auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.inventory_movements (
      inventory_item_id, category, phone_model, movement_type,
      units_bought_before, units_bought_after,
      units_sold_before, units_sold_after,
      buying_price_yuan_before, buying_price_yuan_after,
      selling_price_tzs_before, selling_price_tzs_after, changed_by
    ) VALUES (
      NEW.id, NEW.category, NEW.phone_model, 'updated',
      OLD.units_bought, NEW.units_bought,
      OLD.units_sold, NEW.units_sold,
      OLD.buying_price_yuan, NEW.buying_price_yuan,
      OLD.selling_price_tzs, NEW.selling_price_tzs, auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.inventory_movements (
      inventory_item_id, category, phone_model, movement_type,
      units_bought_before, units_sold_before,
      buying_price_yuan_before, selling_price_tzs_before, changed_by
    ) VALUES (
      OLD.id, OLD.category, OLD.phone_model, 'deleted',
      OLD.units_bought, OLD.units_sold,
      OLD.buying_price_yuan, OLD.selling_price_tzs, auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER inventory_items_movement_log
AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.log_inventory_movement();