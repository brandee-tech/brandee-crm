
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paperclip, Link, Trash2, Download, ExternalLink, Upload, Eye } from 'lucide-react';
import { useScriptAttachments, ScriptAttachment } from '@/hooks/useScriptAttachments';
import { useAuth } from '@/hooks/useAuth';

interface ScriptAttachmentsProps {
  scriptId: string;
  showManageButton?: boolean;
}

export const ScriptAttachments = ({ scriptId, showManageButton = false }: ScriptAttachmentsProps) => {
  const { attachments, uploadFile, addLink, deleteAttachment } = useScriptAttachments(scriptId);
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && scriptId) {
      uploadFile.mutate({ file, scriptId });
    }
    // Reset the input
    event.target.value = '';
  };

  const handleAddLink = () => {
    if (linkName.trim() && linkUrl.trim() && scriptId) {
      addLink.mutate({ name: linkName, url: linkUrl, scriptId });
      setLinkName('');
      setLinkUrl('');
    }
  };

  const canDelete = (attachment: ScriptAttachment) => {
    return user && attachment.created_by === user.id;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadFile = async (attachment: ScriptAttachment) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  if (attachments.length === 0 && !showManageButton) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Anexos ({attachments.length})
        </h4>
        {showManageButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Paperclip className="w-4 h-4" />
            Gerenciar Anexos
          </Button>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="grid gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
            >
              <div className="flex items-center gap-2 flex-1">
                {attachment.type === 'file' ? (
                  <Paperclip className="w-4 h-4 text-gray-500" />
                ) : (
                  <Link className="w-4 h-4 text-blue-500" />
                )}
                <div className="flex-1">
                  <button
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer text-left"
                    title={attachment.type === 'file' ? 'Clique para visualizar o arquivo' : 'Clique para abrir o link'}
                  >
                    {attachment.name}
                  </button>
                  {attachment.type === 'file' && attachment.file_size && (
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {attachment.type === 'file' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                      title="Visualizar arquivo"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(attachment)}
                      title="Baixar arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                {canDelete(attachment) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAttachment.mutate(attachment)}
                    title="Remover anexo"
                    disabled={deleteAttachment.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Anexos</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Arquivo</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label>Enviar Arquivo</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadFile.isPending}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadFile.isPending ? 'Enviando...' : 'Selecionar Arquivo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT (máx. 10MB)
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkName">Nome do Link</Label>
                <Input
                  id="linkName"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="Ex: Site oficial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
            <Tabs defaultValue="file">
              <TabsContent value="link">
                <Button 
                  onClick={handleAddLink}
                  disabled={!linkName.trim() || !linkUrl.trim() || addLink.isPending}
                >
                  {addLink.isPending ? 'Adicionando...' : 'Adicionar Link'}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
