-- Add more comprehensive RLS policies for regular operations

-- Companies policies
CREATE POLICY "Admins can manage all companies" ON public.companies FOR ALL USING (
  public.is_current_user_admin()
);

CREATE POLICY "Users can create companies" ON public.companies FOR INSERT WITH CHECK (true);

-- Profiles policies  
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  public.is_current_user_admin()
);

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (
  id = auth.uid()
);

-- Roles policies
CREATE POLICY "Admins can manage all roles" ON public.roles FOR ALL USING (
  public.is_current_user_admin()
);

CREATE POLICY "Users can create roles for their company" ON public.roles FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update roles for their company" ON public.roles FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete roles for their company" ON public.roles FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Leads policies
CREATE POLICY "Users can create leads for their company" ON public.leads FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company leads" ON public.leads FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company leads" ON public.leads FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Appointments policies
CREATE POLICY "Users can create appointments for their company" ON public.appointments FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company appointments" ON public.appointments FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company appointments" ON public.appointments FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Scripts policies
CREATE POLICY "Users can create scripts for their company" ON public.scripts FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company scripts" ON public.scripts FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company scripts" ON public.scripts FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create a more permissive policy for admin_companies_view access
-- Note: Since it's a view, we need to create an RLS policy on the underlying tables
-- The view will inherit the RLS from the companies table
CREATE POLICY "SaaS admins can view all company data for admin view" ON public.companies FOR SELECT USING (
  public.is_current_user_admin()
);