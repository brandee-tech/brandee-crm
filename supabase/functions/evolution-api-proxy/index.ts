import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Evolution API not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, data } = await req.json();

    console.log('Evolution API Proxy - Action:', action);

    let evolutionResponse;

    switch (action) {
      case 'createInstance': {
        const { instanceName } = data;
        evolutionResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey,
          },
          body: JSON.stringify({
            instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          }),
        });
        break;
      }

      case 'connectInstance': {
        const { instanceName } = data;
        evolutionResponse = await fetch(
          `${evolutionApiUrl}/instance/connect/${instanceName}`,
          {
            method: 'GET',
            headers: {
              'apikey': evolutionApiKey,
            },
          }
        );
        break;
      }

      case 'getQRCode': {
        const { instanceName } = data;
        evolutionResponse = await fetch(
          `${evolutionApiUrl}/instance/connect/${instanceName}`,
          {
            method: 'GET',
            headers: {
              'apikey': evolutionApiKey,
            },
          }
        );
        break;
      }

      case 'fetchInfo': {
        const { instanceName } = data;
        evolutionResponse = await fetch(
          `${evolutionApiUrl}/instance/fetchInstances?instanceName=${instanceName}`,
          {
            method: 'GET',
            headers: {
              'apikey': evolutionApiKey,
            },
          }
        );
        break;
      }

      case 'sendText': {
        const { instanceName, number, text } = data;
        evolutionResponse = await fetch(
          `${evolutionApiUrl}/message/sendText/${instanceName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': evolutionApiKey,
            },
            body: JSON.stringify({
              number,
              text,
            }),
          }
        );
        break;
      }

      case 'sendMedia': {
        const { instanceName, number, mediaUrl, caption, mediaType } = data;
        const endpoint = mediaType === 'audio' ? 'sendWhatsAppAudio' : 'sendMedia';
        evolutionResponse = await fetch(
          `${evolutionApiUrl}/message/${endpoint}/${instanceName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': evolutionApiKey,
            },
            body: JSON.stringify({
              number,
              mediatype: mediaType,
              media: mediaUrl,
              caption: caption || '',
            }),
          }
        );
        break;
      }

      case 'logout': {
        const { instanceName } = data;
        evolutionResponse = await fetch(
          `${evolutionApiUrl}/instance/logout/${instanceName}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': evolutionApiKey,
            },
          }
        );
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    const responseData = await evolutionResponse.json();

    return new Response(JSON.stringify(responseData), {
      status: evolutionResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Evolution API Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
