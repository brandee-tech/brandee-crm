import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.177.0/encoding/hex.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

async function hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return new TextDecoder().decode(encode(new Uint8Array(hash)));
}

async function handleLeads(
    supabase: SupabaseClient,
    companyId: string,
    req: Request,
    pathSegments: string[]
): Promise<Response> {
    // GET /leads
    if (req.method === 'GET' && pathSegments.length === 0) {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ data: leads }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /leads
    if (req.method === 'POST' && pathSegments.length === 0) {
        const body = await req.json();
        if (!body.name) return new Response(JSON.stringify({ error: 'Missing name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const { data: lead, error } = await supabase
            .from('leads')
            .insert({ ...body, company_id: companyId, source: body.source || 'API Integration' })
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify({ data: lead }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /leads/:id
    if (req.method === 'GET' && pathSegments.length === 1) {
        const id = pathSegments[0];
        const { data: lead, error } = await supabase
            .from('leads')
            .select('*')
            .eq('company_id', companyId)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!lead) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ data: lead }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // PUT /leads/:id
    if (req.method === 'PUT' && pathSegments.length === 1) {
        const id = pathSegments[0];
        const body = await req.json();
        const { data: lead, error } = await supabase
            .from('leads')
            .update(body)
            .eq('company_id', companyId)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify({ data: lead }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // DELETE /leads/:id
    if (req.method === 'DELETE' && pathSegments.length === 1) {
        const id = pathSegments[0];
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('company_id', companyId)
            .eq('id', id);

        if (error) throw error;
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleContacts(
    supabase: SupabaseClient,
    companyId: string,
    req: Request,
    pathSegments: string[]
): Promise<Response> {
    // GET /contacts
    if (req.method === 'GET' && pathSegments.length === 0) {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('company_id', companyId)
            .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /contacts
    if (req.method === 'POST' && pathSegments.length === 0) {
        const body = await req.json();
        if (!body.name) return new Response(JSON.stringify({ error: 'Missing name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const { data, error } = await supabase
            .from('contacts')
            .insert({ ...body, company_id: companyId })
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /contacts/:id
    if (req.method === 'GET' && pathSegments.length === 1) {
        const id = pathSegments[0];
        const { data, error } = await supabase.from('contacts').select('*').eq('company_id', companyId).eq('id', id).single();
        if (error) throw error;
        if (!data) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleAppointments(
    supabase: SupabaseClient,
    companyId: string,
    req: Request,
    pathSegments: string[]
): Promise<Response> {
    // GET /appointments
    if (req.method === 'GET' && pathSegments.length === 0) {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('company_id', companyId)
            .order('date', { ascending: false })
            .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /appointments
    if (req.method === 'POST' && pathSegments.length === 0) {
        const body = await req.json();
        // Basic validation
        if (!body.title || !body.date) return new Response(JSON.stringify({ error: 'Missing title or date' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const { data, error } = await supabase
            .from('appointments')
            .insert({ ...body, company_id: companyId })
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleProducts(
    supabase: SupabaseClient,
    companyId: string,
    req: Request,
    pathSegments: string[]
): Promise<Response> {
    // GET /products
    if (req.method === 'GET' && pathSegments.length === 0) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('company_id', companyId)
            .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleTasks(
    supabase: SupabaseClient,
    companyId: string,
    req: Request,
    pathSegments: string[]
): Promise<Response> {
    // GET /tasks
    if (req.method === 'GET' && pathSegments.length === 0) {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('company_id', companyId)
            .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /tasks
    if (req.method === 'POST' && pathSegments.length === 0) {
        const body = await req.json();
        if (!body.title) return new Response(JSON.stringify({ error: 'Missing title' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const { data, error } = await supabase
            .from('tasks')
            .insert({ ...body, company_id: companyId })
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const apiKey = req.headers.get('x-api-key');

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'Missing x-api-key header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const hashedKey = await hashKey(apiKey);

        // Validate API Key
        const { data: keyData, error: keyError } = await supabase
            .from('api_keys')
            .select('company_id, is_active')
            .eq('key_hash', hashedKey)
            .single();

        if (keyError || !keyData || !keyData.is_active) {
            return new Response(
                JSON.stringify({ error: 'Invalid or inactive API Key' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Update last used at (fire and forget)
        supabase.from('api_keys').update({ last_used_at: new Date() }).eq('key_hash', hashedKey).then();

        const companyId = keyData.company_id;
        const url = new URL(req.url);
        const path = url.pathname.replace('/external-api', ''); // Remove function name if locally served, or handle path properly
        // Note: When deployed to functions/v1/external-api, the pathname might be /external-api/leads
        // We need to robustly extract the resource.

        // Normalize path. Remove leading /external-api if present (case of full path proxy)
        // Or just look at segments.
        // Example: /external-api/leads -> ['external-api', 'leads'] (if splitting by /)

        // Let's assume standard Supabase behavior:
        // Invoke: https://project.supabase.co/functions/v1/external-api/leads/123
        // pathname: /external-api/leads/123 (if mapped that way?)
        // Actually, usually it's just /external-api unless we capture wildcards. 
        // Supabase Edge Functions don't support file-based routing inside the function automatically, but we can parse the URL.

        // Strategy: Split URL by '/' and find the segment after 'external-api'.
        const segments = url.pathname.split('/').filter(Boolean);
        const functionIndex = segments.indexOf('external-api');
        const routeSegments = functionIndex !== -1 ? segments.slice(functionIndex + 1) : segments;

        const resource = routeSegments[0];
        const subSegments = routeSegments.slice(1);

        switch (resource) {
            case 'leads':
                return await handleLeads(supabase, companyId, req, subSegments);
            case 'contacts':
                return await handleContacts(supabase, companyId, req, subSegments);
            case 'appointments':
                return await handleAppointments(supabase, companyId, req, subSegments);
            case 'products':
                return await handleProducts(supabase, companyId, req, subSegments);
            case 'tasks':
                return await handleTasks(supabase, companyId, req, subSegments);
            default:
                // Root path or unknown
                return new Response(
                    JSON.stringify({
                        message: 'Welcome to WeCRM External API',
                        resources: ['leads', 'contacts', 'appointments', 'products', 'tasks']
                    }),
                    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
