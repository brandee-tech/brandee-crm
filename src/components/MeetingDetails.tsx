
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Plus, FileText, Upload, Link as LinkIcon, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useMeetingDetails } from '@/hooks/useMeetings';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MeetingDetailsProps {
  meetingId: string;
  onBack: () => void;
}

export const MeetingDetails = ({ meetingId, onBack }: MeetingDetailsProps) => {
  const { meeting, agendas, minutes, attachments, saveMinutes, addAgendaItem, addAttachment } = useMeetingDetails(meetingId);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [minutesContent, setMinutesContent] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Inicializar conteúdo das atas quando carregado
  useEffect(() => {
    if (minutes?.content) {
      setMinutesContent(minutes.content);
    }
  }, [minutes]);

  const handleSaveMinutes = async () => {
    await saveMinutes.mutateAsync(minutesContent);
  };

  const handleAddAgendaItem = async () => {
    if (!newAgendaItem.trim()) return;
    
    const nextIndex = agendas.length + 1;
    await addAgendaItem.mutateAsync({
      meeting_id: meetingId,
      title: newAgendaItem,
      order_index: nextIndex,
    });
    setNewAgendaItem('');
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    
    await addAttachment.mutateAsync({
      meeting_id: meetingId,
      name: newLink.name,
      type: 'link',
      url: newLink.url,
      created_by: user?.id || '',
    });
    setNewLink({ name: '', url: '' });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${meetingId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('meeting-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('meeting-attachments')
        .getPublicUrl(filePath);

      const isImage = file.type.startsWith('image/');
      
      await addAttachment.mutateAsync({
        meeting_id: meetingId,
        name: file.name,
        type: isImage ? 'image' : 'file',
        url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        created_by: user?.id || '',
      });

      toast({ title: 'Arquivo enviado com sucesso!' });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ 
        title: 'Erro ao enviar arquivo', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-500';
      case 'Em andamento':
        return 'bg-green-500';
      case 'Finalizada':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!meeting) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-8">
          <div className="text-lg">Carregando reunião...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
            <Badge className={getStatusColor(meeting.status)}>
              {meeting.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(meeting.date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {meeting.time} ({meeting.duration}min)
            </div>
          </div>
        </div>
      </div>

      {meeting.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{meeting.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pauta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pauta da Reunião
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {agendas.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-500 mt-0.5">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Novo item da pauta"
                value={newAgendaItem}
                onChange={(e) => setNewAgendaItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAgendaItem()}
              />
              <Button onClick={handleAddAgendaItem} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Anexos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Anexos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-2 border rounded-lg">
                  {attachment.type === 'image' && <Image className="w-4 h-4 text-blue-500" />}
                  {attachment.type === 'file' && <File className="w-4 h-4 text-gray-500" />}
                  {attachment.type === 'link' && <LinkIcon className="w-4 h-4 text-green-500" />}
                  
                  <div className="flex-1">
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {attachment.name}
                    </a>
                    {attachment.file_size && (
                      <p className="text-xs text-gray-500">
                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload de arquivo */}
            <div className="space-y-2">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
              </Button>
            </div>

            {/* Adicionar link */}
            <div className="space-y-2">
              <Input
                placeholder="Nome do link"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="URL do link"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
                <Button onClick={handleAddLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ata */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ata da Reunião
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Digite aqui as anotações e decisões da reunião..."
            value={minutesContent}
            onChange={(e) => setMinutesContent(e.target.value)}
            rows={10}
            className="min-h-[200px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveMinutes}
              disabled={saveMinutes.isPending}
            >
              {saveMinutes.isPending ? 'Salvando...' : 'Salvar Ata'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
