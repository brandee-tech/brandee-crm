import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, FileText, Link as LinkIcon, Copy, ExternalLink, Trash2, Edit, Eye } from 'lucide-react';
import { useLeadForms } from '@/hooks/useLeadForms';
import { FormEditorDialog } from '@/components/automation/FormEditorDialog';
import { FormPreviewDialog } from '@/components/automation/FormPreviewDialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LeadAutomation = () => {
  const navigate = useNavigate();
  const { forms, loading, toggleFormActive, deleteForm } = useLeadForms();
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const getFormUrl = (slug: string) => {
    return `${window.location.origin}/form/${slug}`;
  };

  const copyFormLink = (slug: string) => {
    navigator.clipboard.writeText(getFormUrl(slug));
    toast({
      title: 'Link copiado!',
      description: 'O link do formulário foi copiado para a área de transferência.',
    });
  };

  const handleEdit = (form: any) => {
    setSelectedForm(form);
    setEditorOpen(true);
  };

  const handlePreview = (form: any) => {
    setSelectedForm(form);
    setPreviewOpen(true);
  };

  const handleDeleteClick = (formId: string) => {
    setFormToDelete(formId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (formToDelete) {
      await deleteForm(formToDelete);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Automação de Captação</h1>
            <p className="text-muted-foreground mt-1">
              Configure fontes automáticas para capturar leads
            </p>
          </div>
        </div>

        {/* Sources Section */}
        <div className="grid gap-6">
          {/* Form Source */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Formulários de Captação</CardTitle>
                    <CardDescription>
                      Crie formulários personalizados para capturar leads automaticamente
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => { setSelectedForm(null); setEditorOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Formulário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando formulários...
                </div>
              ) : forms.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum formulário criado ainda
                  </p>
                  <Button variant="outline" onClick={() => { setSelectedForm(null); setEditorOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro formulário
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {forms.map((form) => (
                    <Card key={form.id} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{form.name}</h3>
                                <Badge variant={form.is_active ? 'default' : 'secondary'}>
                                  {form.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3" />
                                  {form.slug}
                                </span>
                                <span>{form.submissions_count} submissões</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={form.is_active}
                              onCheckedChange={(checked) => toggleFormActive(form.id, checked)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePreview(form)}
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyFormLink(form.slug)}
                              title="Copiar link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(getFormUrl(form.slug), '_blank')}
                              title="Abrir em nova aba"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(form)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(form.id)}
                              title="Excluir"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Future Sources Placeholder */}
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Mais fontes de captação em breve: Landing Pages, Integrações com redes sociais, Webhooks...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Editor Dialog */}
      <FormEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        form={selectedForm}
      />

      {/* Form Preview Dialog */}
      <FormPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        form={selectedForm}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O formulário e todas as submissões serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeadAutomation;
