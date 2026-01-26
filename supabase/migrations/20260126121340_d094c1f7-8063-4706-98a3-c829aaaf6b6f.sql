-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create secure policy requiring authentication
CREATE POLICY "Authenticated users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);