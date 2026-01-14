import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Code, Box, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormEmbedCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

export const FormEmbedCodeDialog = ({ open, onOpenChange, form }: FormEmbedCodeDialogProps) => {
    const { toast } = useToast();
    const [copiedTab, setCopiedTab] = useState<string | null>(null);

    if (!form) return null;

    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed/${form.slug}`;

    // Código iframe básico
    const iframeBasicCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="${form.name}"
></iframe>`;

    // Código iframe responsivo com wrapper
    const iframeResponsiveCode = `<!-- Container responsivo para o formulário -->
<div style="position: relative; width: 100%; max-width: 600px; margin: 0 auto;">
  <iframe
    src="${embedUrl}"
    width="100%"
    height="600"
    frameborder="0"
    style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
    title="${form.name}"
  ></iframe>
</div>`;

    // Código JavaScript avançado com resize automático
    const javascriptCode = `<!-- Formulário Brandee com resize automático -->
<div id="brandee-form-container" style="max-width: 600px; margin: 0 auto;">
  <iframe
    id="brandee-form-${form.slug}"
    src="${embedUrl}"
    width="100%"
    height="600"
    frameborder="0"
    style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: height 0.3s ease;"
    title="${form.name}"
  ></iframe>
</div>

<script>
  (function() {
    var iframe = document.getElementById('brandee-form-${form.slug}');
    
    window.addEventListener('message', function(event) {
      // Verifica se a mensagem é do formulário Brandee
      if (event.data && event.data.type === 'brandee-form-resize' && event.data.slug === '${form.slug}') {
        iframe.style.height = event.data.height + 'px';
      }
      
      // Callback quando o formulário é submetido
      if (event.data && event.data.type === 'brandee-form-submitted' && event.data.slug === '${form.slug}') {
        console.log('Formulário enviado com sucesso!', event.data.data);
        // Adicione aqui sua lógica de callback, por exemplo:
        // gtag('event', 'form_submit', { 'form_name': '${form.name}' });
      }
    });
  })();
</script>`;

    // Código para popup/modal
    const popupCode = `<!-- Botão para abrir formulário em popup -->
<button
  onclick="window.open('${embedUrl}', 'brandee-form', 'width=500,height=700,scrollbars=yes,resizable=yes')"
  style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;"
>
  Fale Conosco
</button>`;

    const copyToClipboard = async (code: string, tabName: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedTab(tabName);
        toast({
            title: 'Código copiado!',
            description: 'O código foi copiado para a área de transferência.',
        });
        setTimeout(() => setCopiedTab(null), 2000);
    };

    const CodeBlock = ({ code, tabName }: { code: string; tabName: string }) => (
        <div className="relative">
            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-auto">
                <code>{code}</code>
            </pre>
            <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(code, tabName)}
            >
                {copiedTab === tabName ? (
                    <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                    </>
                )}
            </Button>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Código de Embed
                    </DialogTitle>
                    <DialogDescription>
                        Copie o código abaixo e cole no HTML do seu site para incorporar o formulário "{form.name}".
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic" className="text-xs">
                                <Box className="w-3 h-3 mr-1" />
                                Básico
                            </TabsTrigger>
                            <TabsTrigger value="responsive" className="text-xs">
                                <Box className="w-3 h-3 mr-1" />
                                Responsivo
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="text-xs">
                                <Code className="w-3 h-3 mr-1" />
                                Avançado
                            </TabsTrigger>
                            <TabsTrigger value="popup" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Popup
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <TabsContent value="basic" className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-2">iFrame Básico</p>
                                    <p>
                                        O código mais simples para incorporar o formulário. Ideal para a maioria dos casos.
                                    </p>
                                </div>
                                <CodeBlock code={iframeBasicCode} tabName="basic" />
                            </TabsContent>

                            <TabsContent value="responsive" className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-2">iFrame Responsivo</p>
                                    <p>
                                        Inclui um container centralizado com largura máxima e sombra para melhor aparência.
                                    </p>
                                </div>
                                <CodeBlock code={iframeResponsiveCode} tabName="responsive" />
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-2">JavaScript Avançado</p>
                                    <p>
                                        Inclui script que ajusta automaticamente a altura do iframe e detecta quando o formulário é enviado.
                                    </p>
                                    <ul className="list-disc list-inside mt-2 text-xs">
                                        <li>Altura automática baseada no conteúdo</li>
                                        <li>Callback quando o formulário é submetido</li>
                                        <li>Ideal para integrações com analytics</li>
                                    </ul>
                                </div>
                                <CodeBlock code={javascriptCode} tabName="advanced" />
                            </TabsContent>

                            <TabsContent value="popup" className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-2">Botão Popup</p>
                                    <p>
                                        Abre o formulário em uma nova janela popup. Ideal para CTAs em páginas.
                                    </p>
                                </div>
                                <CodeBlock code={popupCode} tabName="popup" />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <div className="flex justify-between items-center pt-4 border-t mt-4">
                    <div className="text-xs text-muted-foreground">
                        URL do embed: <code className="bg-muted px-1 py-0.5 rounded">{embedUrl}</code>
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
