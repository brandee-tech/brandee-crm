import { useState } from 'react';
import { X, FileText, Music, Video, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface MediaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onSend: (caption?: string) => void;
  isUploading: boolean;
  uploadProgress?: number;
}

export const MediaPreviewDialog = ({
  open,
  onOpenChange,
  file,
  onSend,
  isUploading,
  uploadProgress = 0,
}: MediaPreviewDialogProps) => {
  const [caption, setCaption] = useState('');

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const previewUrl = isImage || isVideo ? URL.createObjectURL(file) : null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = () => {
    onSend(caption || undefined);
    setCaption('');
  };

  const getFileIcon = () => {
    if (isAudio) return <Music className="w-16 h-16 text-muted-foreground" />;
    if (isVideo) return <Video className="w-16 h-16 text-muted-foreground" />;
    return <File className="w-16 h-16 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar arquivo</DialogTitle>
          <DialogDescription>
            Adicione uma legenda opcional e clique em enviar para compartilhar o arquivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative bg-muted rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
            {isImage && previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[400px] w-auto object-contain"
              />
            )}
            
            {isVideo && previewUrl && (
              <video
                src={previewUrl}
                controls
                className="max-h-[400px] w-auto"
              />
            )}
            
            {!isImage && !isVideo && (
              <div className="flex flex-col items-center gap-4 p-8">
                {getFileIcon()}
                <div className="text-center">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <Textarea
            placeholder="Adicionar legenda (opcional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[60px] resize-none"
            disabled={isUploading}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Enviando arquivo... {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
