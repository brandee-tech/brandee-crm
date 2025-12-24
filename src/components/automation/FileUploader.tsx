import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  helpText?: string;
}

export const FileUploader = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  helpText
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lead-form-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lead-form-assets')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>

      {value ? (
        <div className="relative group">
          <div className="border rounded-lg p-2 bg-muted/30">
            <div className="flex items-center gap-3">
              {value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Enviando...' : 'Upload'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            className="hidden"
          />

          {showUrlInput && (
            <Input
              placeholder="https://exemplo.com/imagem.png"
              onBlur={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  setShowUrlInput(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value) {
                    onChange(target.value);
                    setShowUrlInput(false);
                  }
                }
              }}
            />
          )}
        </div>
      )}

      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};
