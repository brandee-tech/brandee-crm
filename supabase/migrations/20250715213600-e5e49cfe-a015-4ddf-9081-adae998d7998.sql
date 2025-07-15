-- Create enum for block types
CREATE TYPE public.schedule_block_type AS ENUM ('time_slot', 'full_day');

-- Create schedule_blocks table
CREATE TABLE public.schedule_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  block_type public.schedule_block_type NOT NULL DEFAULT 'time_slot',
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern JSONB DEFAULT '{}',
  reason TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their company schedule blocks"
  ON public.schedule_blocks
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create schedule blocks for their company"
  ON public.schedule_blocks
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own schedule blocks"
  ON public.schedule_blocks
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own schedule blocks"
  ON public.schedule_blocks
  FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_schedule_blocks_user_date ON public.schedule_blocks(user_id, start_date, end_date);
CREATE INDEX idx_schedule_blocks_company ON public.schedule_blocks(company_id);

-- Create trigger for updated_at
CREATE TRIGGER update_schedule_blocks_updated_at
  BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();