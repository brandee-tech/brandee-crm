
import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScripts, Script } from '@/hooks/useScripts';
import { ScriptAttachments } from '@/components/ScriptAttachments';

interface EditScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: Script | null;
}

export const EditScriptDialog = ({ open, onOpenChange, script }: EditScriptDialogProps) => {
  const { updateScript } = useScripts();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Treinamento',
    description: ''
  });

  useEffect(() => {
    if (script) {
      setFormData({
        title: script.title,
        content: script.content,
        category: script.category,
        description: script.description || ''
      });
    }
  }, [script]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!script) return;

    await updateScript.mutateAsync({
      id: script.id,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      description: formData.description || undefined
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
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
                    <SelectItem value="Treinamento">Treinamento</SelectItem>
                    <SelectItem value="Script">Script</SelectItem>
                    <SelectItem value="Relacionamento">Relacionamento</SelectItem>
                    <SelectItem value="Documentos">Documentos</SelectItem>
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateScript.isPending}>
                  {updateScript.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="attachments" className="space-y-4">
            {script && <ScriptAttachments scriptId={script.id} showManageButton />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
