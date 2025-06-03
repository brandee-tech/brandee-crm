
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  location: string | null;
  company_id: string | null;
  last_contact: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  companies?: {
    name: string;
  };
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      // Primeiro obter o company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error('Erro ao buscar company_id:', profileError);
        setContacts([]);
        return;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          companies (
            name
          )
        `)
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'companies'>) => {
    try {
      // Obter o company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !profileData?.company_id) {
        toast({
          title: "Erro",
          description: "Não foi possível identificar sua empresa",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([{ 
          ...contactData, 
          created_by: user?.id,
          company_id: profileData.company_id
        }])
        .select(`
          *,
          companies (
            name
          )
        `)
        .single();

      if (error) throw error;
      setContacts(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o contato",
        variant: "destructive"
      });
    }
  };

  const updateContact = async (id: string, updates: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'companies'>>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          companies (
            name
          )
        `)
        .single();

      if (error) throw error;
      setContacts(prev => prev.map(contact => contact.id === id ? data : contact));
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contato",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o contato",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
};
