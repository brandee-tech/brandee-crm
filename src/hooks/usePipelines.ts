import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Pipeline {
    id: string;
    name: string;
    company_id: string;
    created_at: string;
}

export const usePipelines = () => {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchPipelines = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching pipelines for user:', user.id);

            const { data, error } = await (supabase
                .from('pipelines' as any)
                .select('*')
                .order('created_at', { ascending: true }));

            if (error) {
                throw error;
            }

            setPipelines(data || []);
            console.log('Pipelines fetched:', data?.length);
        } catch (error) {
            console.error('Error fetching pipelines:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os pipelines",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const createPipeline = async (name: string) => {
        if (!user) return;

        try {
            // Get company_id (assuming it's in profiles like elsewhere)
            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single();

            if (!profile?.company_id) throw new Error('Company ID not found');

            const { data, error } = await (supabase
                .from('pipelines' as any)
                .insert([{ name, company_id: profile.company_id }])
                .select()
                .single()) as { data: Pipeline, error: any };

            if (error) throw error;

            // Create default columns
            const defaultColumns = [
                { name: 'Novo Lead', color: '#3B82F6', position: 1 },
                { name: 'Agendado', color: '#10B981', position: 2 },
                { name: 'Reunião/Visita', color: '#8B5CF6', position: 3 },
                { name: 'Negociação', color: '#F59E0B', position: 4 },
                { name: 'Ganho', color: '#22C55E', position: 5 },
                { name: 'Perdido', color: '#EF4444', position: 6 },
            ];

            const columnsToInsert = defaultColumns.map(col => ({
                pipeline_id: data.id,
                company_id: profile.company_id,
                name: col.name,
                color: col.color,
                position: col.position
            }));

            const { error: columnsError } = await supabase
                .from('pipeline_columns')
                .insert(columnsToInsert);

            if (columnsError) {
                console.error('Error creating default columns:', columnsError);
                toast({
                    title: "Aviso",
                    description: "Pipeline criado, mas houve erro ao criar colunas padrão.",
                    variant: "default"
                });
            }

            // Realtime will handle state update, but for UX speed update optimistic or wait for re-fetch
            // In this case, we rely on refetch from realtime or manual update
            // But let's add locally just in case realtime is slow
            setPipelines(prev => [...prev, data]);

            toast({
                title: "Sucesso",
                description: "Pipeline criado com sucesso"
            });
            return data;
        } catch (error) {
            console.error('Error creating pipeline:', error);
            toast({
                title: "Erro",
                description: "Não foi possível criar o pipeline",
                variant: "destructive"
            });
        }
    };

    const deletePipeline = async (id: string) => {
        if (!user) return;

        try {
            const { error } = await (supabase
                .from('pipelines' as any)
                .delete()
                .eq('id', id));

            if (error) throw error;

            setPipelines(prev => prev.filter(p => p.id !== id));
            toast({
                title: "Sucesso",
                description: "Pipeline removido com sucesso"
            });
        } catch (error) {
            console.error('Error deleting pipeline:', error);
            toast({
                title: "Erro",
                description: "Não foi possível remover o pipeline",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        fetchPipelines();

        const channel = supabase
            .channel('pipelines-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pipelines'
                },
                (payload) => {
                    console.log('Realtime pipelines update:', payload);
                    // Simple strategy: refetch all pipelines to ensure sync
                    fetchPipelines();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return {
        pipelines,
        loading,
        createPipeline,
        deletePipeline,
        refetch: fetchPipelines
    };
};
