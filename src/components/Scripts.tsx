import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FileText, Eye } from 'lucide-react';
import { useScripts, Script } from '@/hooks/useScripts';
import { AddScriptDialog } from '@/components/AddScriptDialog';
import { EditScriptDialog } from '@/components/EditScriptDialog';
import { ViewScriptDialog } from '@/components/ViewScriptDialog';
import { useAuth } from '@/hooks/useAuth';

export const Scripts = () => {
  const { scripts, isLoading, deleteScript } = useScripts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
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
    if (window.confirm('Tem certeza que deseja excluir este script?')) {
      await deleteScript.mutateAsync(id);
    }
  };

  const canEditScript = (script: Script) => {
    return user && script.created_by === user.id;
  };

  const handleView = (script: Script) => {
    setSelectedScript(script);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando scripts...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scripts</h1>
            <p className="text-gray-600">Gerencie seus scripts de vendas e atendimento</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Script
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar scripts..."
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
          <Card key={script.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{script.title}</CardTitle>
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
                    onClick={() => handleView(script)}
                    title="Visualizar script"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canEditScript(script) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(script)}
                        title="Editar script"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(script.id)}
                        title="Excluir script"
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
        ))}
      </div>

      {filteredScripts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum script encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro script.'}
          </p>
        </div>
      )}

      <AddScriptDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
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
