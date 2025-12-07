import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadForm, LeadFormField, LeadFormSettings } from '@/types/leadForm';
import { Json } from '@/integrations/supabase/types';

export const useLeadForms = () => {
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchForms = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('lead_forms')
        .select(`
          *,
          lead_form_fields (*)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get submission counts
      const formsWithCounts = await Promise.all(
        (data || []).map(async (form) => {
          const { count } = await supabase
            .from('lead_form_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);

          return {
            ...form,
            settings: form.settings as unknown as LeadFormSettings,
            fields: (form.lead_form_fields as unknown as LeadFormField[])?.sort((a, b) => a.position - b.position),
            submissions_count: count || 0,
          };
        })
      );

      setForms(formsWithCounts as LeadForm[]);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast({
        title: 'Erro ao carregar formulários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createForm = async (
    name: string,
    templateId: string,
    settings: LeadFormSettings,
    fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('Empresa não encontrada');

      // Generate unique slug
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

      const { data: form, error: formError } = await supabase
        .from('lead_forms')
        .insert([{
          company_id: profile.company_id,
          name,
          template_id: templateId,
          slug,
          settings: settings as unknown as Json,
          created_by: user.id,
        }])
        .select()
        .single();

      if (formError) throw formError;

      // Insert fields
      if (fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('lead_form_fields')
          .insert(
            fields.map((field) => ({
              ...field,
              form_id: form.id,
            }))
          );

        if (fieldsError) throw fieldsError;
      }

      toast({
        title: 'Formulário criado',
        description: 'Seu formulário foi criado com sucesso!',
      });

      await fetchForms();
      return form;
    } catch (error: any) {
      console.error('Error creating form:', error);
      toast({
        title: 'Erro ao criar formulário',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateForm = async (
    formId: string,
    name: string,
    settings: LeadFormSettings,
    fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[]
  ) => {
    try {
      const { error: formError } = await supabase
        .from('lead_forms')
        .update({ name, settings: settings as unknown as Json })
        .eq('id', formId);

      if (formError) throw formError;

      // Delete existing fields and insert new ones
      await supabase.from('lead_form_fields').delete().eq('form_id', formId);

      if (fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('lead_form_fields')
          .insert(
            fields.map((field) => ({
              ...field,
              form_id: formId,
            }))
          );

        if (fieldsError) throw fieldsError;
      }

      toast({
        title: 'Formulário atualizado',
        description: 'As alterações foram salvas!',
      });

      await fetchForms();
    } catch (error: any) {
      console.error('Error updating form:', error);
      toast({
        title: 'Erro ao atualizar formulário',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleFormActive = async (formId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('lead_forms')
        .update({ is_active: isActive })
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: isActive ? 'Formulário ativado' : 'Formulário desativado',
      });

      await fetchForms();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteForm = async (formId: string) => {
    try {
      const { error } = await supabase.from('lead_forms').delete().eq('id', formId);

      if (error) throw error;

      toast({
        title: 'Formulário excluído',
      });

      await fetchForms();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir formulário',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return {
    forms,
    loading,
    createForm,
    updateForm,
    toggleFormActive,
    deleteForm,
    refetch: fetchForms,
  };
};
