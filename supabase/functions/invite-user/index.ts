import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
  role_id: string;
  send_email?: boolean;
  redirect_to?: string;
  password?: string;
  create_with_password?: boolean;
}

serve(async (req: Request) => {
  console.log('🚀 Invite user function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client to get current user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Failed to get authenticated user');
    }

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error('User profile not found or no company associated');
    }

    // Parse request body
    const { email, role_id, send_email = true, redirect_to, password, create_with_password = false }: InviteUserRequest = await req.json();

    if (!email || !role_id) {
      throw new Error('Email and role_id are required');
    }

    if (create_with_password && !password) {
      throw new Error('Password is required when creating user directly');
    }

    console.log(`📧 Processing ${create_with_password ? 'user creation' : 'invite'} for ${email}`);

    let supabase_invite_id = null;

    // If create_with_password is true, create user directly
    if (create_with_password) {
      console.log('👤 Creating user directly with password');
      
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role_id: role_id,
          company_id: profile.company_id,
          created_via_admin: true
        }
      });

      if (createError) {
        console.error('❌ Failed to create user:', createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      supabase_invite_id = userData.user?.id || null;
      console.log('✅ User created successfully:', supabase_invite_id);
      
      // Create profile for the new user
      const { error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: userData.user.id,
          email,
          company_id: profile.company_id,
          role_id,
          full_name: email.split('@')[0]
        });

      if (profileCreateError) {
        console.error('❌ Failed to create profile:', profileCreateError);
        // Don't throw here as user was created successfully
      }
    } else if (send_email) {
      console.log('📨 Sending native email invite via Supabase');
      
      const defaultRedirectTo = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.supabase.co/`;
      const inviteRedirectTo = redirect_to || defaultRedirectTo;

      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: inviteRedirectTo,
          data: {
            role_id: role_id,
            company_id: profile.company_id,
            invited_via_function: true
          }
        }
      );

      if (inviteError) {
        console.error('❌ Failed to send native invite:', inviteError);
        throw new Error(`Failed to send email invite: ${inviteError.message}`);
      }

      supabase_invite_id = inviteData.user?.id || null;
      console.log('✅ Native invite sent successfully:', supabase_invite_id);
    }

    // Save invitation record in our table for tracking (only if not creating user directly)
    let invitation = null;
    if (!create_with_password) {
      const { data: invitationData, error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role_id,
          company_id: profile.company_id,
          invited_by: user.id,
          sent_via_email: send_email,
          supabase_invite_id
        })
        .select(`
          *,
          roles (
            name,
            description
          )
        `)
        .single();

      if (insertError) {
        console.error('❌ Failed to save invitation record:', insertError);
        throw new Error(`Failed to save invitation: ${insertError.message}`);
      }
      
      invitation = invitationData;
      console.log('✅ Invitation record saved successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        invitation,
        user_id: supabase_invite_id,
        created_directly: create_with_password,
        message: create_with_password
          ? `Usuário criado diretamente para ${email}`
          : send_email 
            ? `Convite enviado por email para ${email}` 
            : `Convite criado para ${email} (link manual)`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in invite-user function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process invitation'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});