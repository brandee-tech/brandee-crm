import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePipelines, Pipeline } from '@/hooks/usePipelines';
import { Trash2, Plus, Edit2, Loader2, X } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface PipelineManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pipelines: Pipeline[];
    onPipelineDeleted: (id: string) => void;
    onPipelineCreated: (pipeline: Pipeline) => void;
}

export function PipelineManagerDialog({
    open,
    onOpenChange,
    pipelines,
    onPipelineDeleted,
    onPipelineCreated
}: PipelineManagerDialogProps) {
    const { createPipeline, deletePipeline, loading } = usePipelines();
    const [newPipelineName, setNewPipelineName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!newPipelineName.trim()) return;

        setIsCreating(true);
        try {
            const newPipeline = await createPipeline(newPipelineName);
            if (newPipeline) {
                setNewPipelineName('');
                onPipelineCreated(newPipeline);
            }
        } catch (error) {
            console.error('Error creating pipeline:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (pipelines.length <= 1) {
            toast({
                title: "Ação não permitida",
                description: "Você não pode apagar o único pipeline existente.",
                variant: "destructive"
            });
            return;
        }

        try {
            await deletePipeline(id);
            onPipelineDeleted(id);
        } catch (error) {
            console.error('Error deleting pipeline:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Pipelines</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Novo Pipeline</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nome do pipeline (ex: Parcerias)"
                                value={newPipelineName}
                                onChange={(e) => setNewPipelineName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                            <Button onClick={handleCreate} disabled={!newPipelineName.trim() || isCreating || loading}>
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Pipelines Existentes</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {pipelines.map((pipeline) => (
                                <div key={pipeline.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                    <span className="font-medium">{pipeline.name}</span>
                                    <div className="flex items-center gap-2">
                                        {pipelines.length > 1 && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir pipeline?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Todos os leads e colunas associados a este pipeline serão perdidos permanentemente ou precisarão ser migrados.

                                                            (Nota: A migração automática de leads não está implementada nesta ação de exclusão simples de UI).
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(pipeline.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                                            Excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
