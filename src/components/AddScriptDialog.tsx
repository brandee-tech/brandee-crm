
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScripts } from '@/hooks/useScripts';
import { ScriptAttachments } from '@/components/ScriptAttachments';

interface AddScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    title: string;
    content: string;
    category: string;
    description: string;
  };
  setFormData: (data: {
    title: string;
    content: string;
    category: string;
    description: string;
  } | ((prev: {
    title: string;
    content: string;
    category: string;
    description: string;
  }) => {
    title: string;
    content: string;
    category: string;
    description: string;
  })) => void;
  createdScriptId: string | null;
  setCreatedScriptId: (id: string | null) => void;
}

export const AddScriptDialog = ({ 
  open, 
  onOpenChange, 
  formData, 
  setFormData, 
  createdScriptId, 
  setCreatedScriptId 
}: AddScriptDialogProps) => {
  const { createScript } = useScripts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createScript.mutateAsync({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      description: formData.description || undefined
    });

    if (result?.id) {
      setCreatedScriptId(result.id);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: '',
      content: '',
      category: 'Vendas',
      description: ''
    });
    setCreatedScriptId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Material</DialogTitle>
        </DialogHeader>
        
        {!createdScriptId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                  <SelectItem value="Objeções">Objeções</SelectItem>
                  <SelectItem value="Fechamento">Fechamento</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Material *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createScript.isPending}>
                {createScript.isPending ? 'Criando...' : 'Criar Material'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-lg font-medium text-green-600 mb-2">Material criado com sucesso!</h3>
              <p className="text-gray-600">Agora você pode adicionar arquivos e links ao material.</p>
            </div>
            
            <ScriptAttachments scriptId={createdScriptId} showManageButton />
            
            <DialogFooter>
              <Button onClick={handleClose}>
                Finalizar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
