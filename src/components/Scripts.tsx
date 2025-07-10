
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FileText, Eye, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeScripts } from '@/hooks/useRealtimeScripts';
import { useScriptAttachments } from '@/hooks/useScriptAttachments';
import { AddScriptDialog } from '@/components/AddScriptDialog';
import { EditScriptDialog } from '@/components/EditScriptDialog';
import { ViewScriptDialog } from '@/components/ViewScriptDialog';

import { useAuth } from '@/hooks/useAuth';

interface Script {
  id: string;
  title: string;
  content: string;
  category: string;
  description?: string;
  created_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

const ScriptCard = ({ script, onEdit, onDelete, onView, canEdit }: {
  script: Script;
  onEdit: (script: Script) => void;
  onDelete: (id: string) => void;
  onView: (script: Script) => void;
  canEdit: boolean;
}) => {
  const { attachments } = useScriptAttachments(script.id);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{script.title}</CardTitle>
              {attachments.length > 0 && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-xs">{attachments.length}</span>
                </div>
              )}
            </div>
            <Badge variant="secondary" className="mb-2">
              {script.category}
            </Badge>
            {script.description && (
              <CardDescription>{script.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(script)}
              title="Visualizar material"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(script)}
                  title="Editar material"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(script.id)}
                  title="Excluir material"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Prévia:</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-4">
            {script.content}
          </p>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Criado em: {new Date(script.created_at).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
};

interface ScriptsProps {
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  scriptFormData: {
    title: string;
    content: string;
    category: string;
    description: string;
  };
  setScriptFormData: (data: {
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

export const Scripts = ({ 
  addDialogOpen, 
  setAddDialogOpen, 
  scriptFormData, 
  setScriptFormData, 
  createdScriptId, 
  setCreatedScriptId 
}: ScriptsProps) => {
  const { scripts, loading, isUpdating } = useRealtimeScripts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || script.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(scripts.map(script => script.category)))];

  const handleEdit = (script: Script) => {
    setSelectedScript(script);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      try {
        const { error } = await supabase
          .from('scripts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Material excluído com sucesso"
        });
      } catch (error) {
        console.error('Erro ao excluir material:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o material",
          variant: "destructive"
        });
      }
    }
  };

  const canEditScript = (script: Script) => {
    return user && script.created_by === user.id;
  };

  const handleView = (script: Script) => {
    setSelectedScript(script);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando materiais...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materiais</h1>
            <p className="text-gray-600">Gerencie seus materiais de vendas e atendimento</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Material
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas as categorias' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredScripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            canEdit={canEditScript(script)}
          />
        ))}
      </div>

      {filteredScripts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum material encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro material.'}
          </p>
        </div>
      )}

      <AddScriptDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        formData={scriptFormData}
        setFormData={setScriptFormData}
        createdScriptId={createdScriptId}
        setCreatedScriptId={setCreatedScriptId}
      />

      <EditScriptDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        script={selectedScript}
      />

      <ViewScriptDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        script={selectedScript}
      />
    </div>
  );
};
