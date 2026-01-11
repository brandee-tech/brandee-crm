import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadAttachment {
    name: string;
    id: string; // Using name as ID for bucket storage
    url: string;
    type: string; // 'image', 'video', 'document', etc.
    size: number;
    created_at: string;
    mime_type: string;
}

const BUCKET_NAME = 'whatsapp-media';

export const useLeadAttachments = (leadId?: string) => {
    const queryClient = useQueryClient();

    const { data: attachments = [], isLoading } = useQuery({
        queryKey: ['lead-attachments', leadId],
        queryFn: async () => {
            if (!leadId) return [];

            const folderPath = `leads/${leadId}`;
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folderPath, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) {
                console.error('Error fetching lead attachments:', error);
                throw error;
            }

            // Transform generic file integration into typed attachments
            return await Promise.all(data.map(async (file) => {
                const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(`${folderPath}/${file.name}`);

                return {
                    name: file.name,
                    id: file.name, // In bucket storage, name is unique in the folder
                    url: publicUrl,
                    type: getFileType(file.metadata?.mimetype || ''),
                    size: file.metadata?.size || 0,
                    created_at: file.created_at,
                    mime_type: file.metadata?.mimetype || 'application/octet-stream',
                };
            }));
        },
        enabled: !!leadId,
    });

    const uploadAttachment = useMutation({
        mutationFn: async (file: File) => {
            if (!leadId) throw new Error('Lead ID is required');

            // Sanitize filename to avoid issues
            const fileExt = file.name.split('.').pop();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${safeName}`;
            const filePath = `leads/${leadId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            return fileName;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead-attachments', leadId] });
            toast.success('Arquivo enviado com sucesso');
        },
        onError: (error) => {
            console.error('Error uploading file:', error);
            toast.error('Erro ao enviar arquivo');
        },
    });

    const deleteAttachment = useMutation({
        mutationFn: async (fileName: string) => {
            if (!leadId) throw new Error('Lead ID is required');

            const filePath = `leads/${leadId}/${fileName}`;
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([filePath]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead-attachments', leadId] });
            toast.success('Arquivo removido com sucesso');
        },
        onError: (error) => {
            console.error('Error deleting file:', error);
            toast.error('Erro ao remover arquivo');
        },
    });

    return {
        attachments,
        isLoading,
        uploadAttachment,
        deleteAttachment,
    };
};

// Helper to determine simplified file type
const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'file';
};
