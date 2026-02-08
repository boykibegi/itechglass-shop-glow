-- Fix STORAGE_EXPOSURE: Make payment-proofs bucket private and update policies
UPDATE storage.buckets SET public = false WHERE id = 'payment-proofs';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view payment proofs" ON storage.objects;

-- Create admin-only SELECT policy for payment proofs
CREATE POLICY "Admins can view payment proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

-- Fix PUBLIC_USER_DATA: Add user_id column to orders table for proper ownership tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing orders to link to users based on email (one-time migration)
UPDATE public.orders o
SET user_id = (
  SELECT au.id FROM auth.users au WHERE au.email = o.customer_email LIMIT 1
)
WHERE o.user_id IS NULL;

-- Drop the old email-based user viewing policy
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Create new user_id-based policies for orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    customer_email = auth.email()
  )
);

-- Update the INSERT policy to require user_id and matching email
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

CREATE POLICY "Users can create own orders" 
ON public.orders FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid() AND 
  customer_email = auth.email()
);