-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Create policy: Admins can view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy: Users can view their own orders by email
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND customer_email = auth.email());