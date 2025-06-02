
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { Script } from '@/hooks/useScripts';
import { toast } from 'sonner';

interface ViewScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: Script | null;
}

export const ViewScriptDialog = ({ open, onOpenChange, script }: ViewScriptDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!script) return;
    
    try {
      await navigator.clipboard.writeText(script.content);
      setCopied(true);
      toast.success('Conteúdo copiado para a área de transferência!');
      
      // Reset copy state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar conteúdo');
    }
  };

  if (!script) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{script.title}</DialogTitle>
            <Badge variant="secondary">{script.category}</Badge>
          </div>
          {script.description && (
            <p className="text-sm text-gray-600 mt-2">{script.description}</p>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Conteúdo do Script:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <div className="bg-white p-4 rounded border max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {script.content}
              </pre>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>Criado em: {new Date(script.created_at).toLocaleDateString('pt-BR')}</p>
            <p>Última atualização: {new Date(script.updated_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
