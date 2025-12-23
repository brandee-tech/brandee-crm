-- Fix stack depth limit exceeded by splitting profiles policies to avoid recursion
-- when helper functions like get_current_user_company_id() query the profiles table.

DROP POLICY IF EXISTS "Users can view their company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;

-- 1. Policy for users to view their own profile (Critical for recursion breaking)
-- This allows get_current_user_company_id() to work without triggering the other policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 2. Policy for users to view other profiles in their company
CREATE POLICY "Users can view company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id != auth.uid() 
  AND company_id = public.get_current_user_company_id()
);

-- 3. Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id != auth.uid() 
  AND public.is_saas_admin()
);
