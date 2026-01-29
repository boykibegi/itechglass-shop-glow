-- Create delivery_locations table to track driver GPS positions
CREATE TABLE public.delivery_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add driver assignment columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS driver_id UUID,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8) DEFAULT -6.7924,
ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8) DEFAULT 39.2083,
ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8);

-- Enable RLS on delivery_locations
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_delivery_locations_order ON public.delivery_locations(order_id);
CREATE INDEX idx_delivery_locations_driver ON public.delivery_locations(driver_id);
CREATE INDEX idx_delivery_locations_created ON public.delivery_locations(created_at DESC);

-- RLS Policies for delivery_locations

-- Drivers can insert their own locations
CREATE POLICY "Drivers can insert own locations"
ON public.delivery_locations
FOR INSERT
WITH CHECK (
  auth.uid() = driver_id AND 
  has_role(auth.uid(), 'driver')
);

-- Drivers can view locations for their assigned orders
CREATE POLICY "Drivers can view own order locations"
ON public.delivery_locations
FOR SELECT
USING (
  has_role(auth.uid(), 'driver') AND driver_id = auth.uid()
);

-- Admins can view all locations
CREATE POLICY "Admins can view all locations"
ON public.delivery_locations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Customers can view locations for their orders
CREATE POLICY "Customers can view their order locations"
ON public.delivery_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = delivery_locations.order_id 
    AND orders.customer_email = auth.email()
  )
);

-- Update orders RLS to allow drivers to view assigned orders
CREATE POLICY "Drivers can view assigned orders"
ON public.orders
FOR SELECT
USING (
  has_role(auth.uid(), 'driver') AND driver_id = auth.uid()
);

-- Drivers can update order status for assigned orders
CREATE POLICY "Drivers can update assigned orders"
ON public.orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'driver') AND driver_id = auth.uid()
);

-- Enable realtime for delivery_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_locations;