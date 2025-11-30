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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

    const { event, instance, data } = webhookData;

    // Buscar a instância no banco de dados
    const { data: instanceData, error: instanceError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('id, company_id')
      .eq('instance_name', instance)
      .single();

    if (instanceError || !instanceData) {
      console.error('Instance not found:', instance);
      return new Response(
        JSON.stringify({ error: 'Instance not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar eventos
    switch (event) {
      case 'MESSAGES_UPSERT':
      case 'messages.upsert': {
        // Suportar ambos os formatos: array (antigo) ou objeto direto (v2)
        const message = Array.isArray(data.messages) ? data.messages[0] : data;
        
        if (!message || !message.key) {
          console.log('Message or message.key is missing, skipping');
          break;
        }

        const remoteJid = message.key.remoteJid;
        const fromMe = message.key.fromMe;
        const messageContent = message.message?.conversation || 
                               message.message?.extendedTextMessage?.text || 
                               '';
        
        console.log('Processing message from:', remoteJid, 'fromMe:', fromMe, 'content:', messageContent);

        // Criar ou obter contato
        const senderName = message.pushName || remoteJid.split('@')[0];
        const timestamp = message.messageTimestamp;
        
        const { data: contact, error: contactError } = await supabaseAdmin
          .from('whatsapp_contacts')
          .upsert({
            company_id: instanceData.company_id,
            whatsapp_id: remoteJid,
            phone: remoteJid.split('@')[0],
            name: senderName,
          }, {
            onConflict: 'company_id,whatsapp_id',
            ignoreDuplicates: false,
          })
          .select()
          .single();

        if (contactError) {
          console.error('Error creating/updating contact:', contactError);
          break;
        }
        
        console.log('Contact created/updated:', contact.id, contact.name);

        // Criar ou obter conversa
        const { data: conversation, error: conversationError } = await supabaseAdmin
          .from('whatsapp_conversations')
          .select('id')
          .eq('contact_id', contact.id)
          .eq('instance_id', instanceData.id)
          .single();

        let conversationId;
        if (conversationError || !conversation) {
          const { data: newConversation } = await supabaseAdmin
            .from('whatsapp_conversations')
            .insert({
              company_id: instanceData.company_id,
              contact_id: contact.id,
              instance_id: instanceData.id,
              last_message: messageContent,
              last_message_at: new Date(timestamp * 1000).toISOString(),
              unread_count: fromMe ? 0 : 1,
            })
            .select()
            .single();
          conversationId = newConversation?.id;
          console.log('New conversation created:', conversationId);
        } else {
          conversationId = conversation.id;
          console.log('Updating existing conversation:', conversationId);
          // Atualizar conversa
          await supabaseAdmin
            .from('whatsapp_conversations')
            .update({
              last_message: messageContent,
              last_message_at: new Date(timestamp * 1000).toISOString(),
              unread_count: fromMe ? 0 : supabaseAdmin.rpc('increment', { row_id: conversation.id }),
            })
            .eq('id', conversation.id);
        }

        // Detectar tipo de mensagem
        let messageType = 'text';
        let mediaUrl = null;
        let mediaMimetype = null;

        if (message.message?.imageMessage) {
          messageType = 'image';
          mediaUrl = message.message.imageMessage.url;
          mediaMimetype = message.message.imageMessage.mimetype;
        } else if (message.message?.audioMessage) {
          messageType = 'audio';
          mediaUrl = message.message.audioMessage.url;
          mediaMimetype = message.message.audioMessage.mimetype;
        } else if (message.message?.videoMessage) {
          messageType = 'video';
          mediaUrl = message.message.videoMessage.url;
          mediaMimetype = message.message.videoMessage.mimetype;
        } else if (message.message?.documentMessage) {
          messageType = 'document';
          mediaUrl = message.message.documentMessage.url;
          mediaMimetype = message.message.documentMessage.mimetype;
        }

        // Inserir mensagem
        const { error: messageError } = await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            conversation_id: conversationId,
            company_id: instanceData.company_id,
            whatsapp_message_id: message.key.id,
            direction: fromMe ? 'outgoing' : 'incoming',
            content: messageContent,
            message_type: messageType,
            media_url: mediaUrl,
            media_mimetype: mediaMimetype,
            status: fromMe ? 'sent' : 'delivered',
            sender_name: senderName,
            created_at: new Date(timestamp * 1000).toISOString(),
          });
        
        if (messageError) {
          console.error('Error inserting message:', messageError);
        } else {
          console.log('Message inserted successfully');
        }

        break;
      }

      case 'MESSAGES_UPDATE':
      case 'messages.update': {
        const updates = data;
        for (const update of updates) {
          const messageId = update.key.id;
          let status = 'sent';

          if (update.update?.status === 3) status = 'delivered';
          if (update.update?.status === 4) status = 'read';

          await supabaseAdmin
            .from('whatsapp_messages')
            .update({ status })
            .eq('whatsapp_message_id', messageId)
            .eq('company_id', instanceData.company_id);
        }
        break;
      }

      case 'CONNECTION_UPDATE':
      case 'connection.update': {
        const connectionState = data.state;
        let status = 'disconnected';

        if (connectionState === 'open') status = 'connected';
        else if (connectionState === 'connecting') status = 'pending';

        await supabaseAdmin
          .from('whatsapp_instances')
          .update({ 
            status,
            phone_number: data.instance?.profilePictureUrl || null,
          })
          .eq('id', instanceData.id);

        break;
      }

      case 'QRCODE_UPDATED':
      case 'qrcode.updated': {
        const qrcode = data.qrcode;
        await supabaseAdmin
          .from('whatsapp_instances')
          .update({ qr_code: qrcode })
          .eq('id', instanceData.id);
        break;
      }

      default:
        console.log('Unhandled event:', event);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
