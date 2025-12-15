import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { formId, data } = await req.json();

    console.log('Received form submission:', { formId, data });

    if (!formId || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing formId or data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the form with its fields
    const { data: form, error: formError } = await supabase
      .from('lead_forms')
      .select(`
        id,
        company_id,
        name,
        is_active,
        lead_form_fields (*)
      `)
      .eq('id', formId)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      console.error('Form not found or inactive:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found form:', form.name);

    // Map form data to lead fields
    const leadData: Record<string, any> = {
      company_id: form.company_id,
      source: `Formulário: ${form.name}`,
      status: 'Novo Lead',
    };

    const fields = form.lead_form_fields || [];
    
    for (const field of fields) {
      const value = data[field.field_name];
      if (value && field.maps_to_lead_field) {
        if (field.maps_to_lead_field === 'product_value') {
          leadData[field.maps_to_lead_field] = parseFloat(value) || 0;
        } else {
          leadData[field.maps_to_lead_field] = value;
        }
      }
    }

    // Ensure we have at least a name
    if (!leadData.name) {
      leadData.name = data.name || data.email || 'Lead sem nome';
    }

    console.log('Creating lead with data:', leadData);

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: leadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead created successfully:', lead.id);

    // Save the submission
    const { error: submissionError } = await supabase
      .from('lead_form_submissions')
      .insert({
        form_id: formId,
        lead_id: lead.id,
        data: data,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

    if (submissionError) {
      console.error('Error saving submission:', submissionError);
      // Don't fail the request, lead was already created
    }

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
