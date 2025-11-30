import { useState, useRef, ChangeEvent } from 'react';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WhatsAppConversation } from '@/types/whatsapp';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { EmojiPicker } from './EmojiPicker';
import { MediaPreviewDialog } from './MediaPreviewDialog';
import { toast } from 'sonner';

interface MessageInputProps {
  conversation: WhatsAppConversation;
  instanceName: string;
}

export const MessageInput = ({ conversation, instanceName }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, sendMedia } = useWhatsAppMessages(conversation.id, instanceName);
  const { uploadMedia, isUploading, uploadProgress } = useMediaUpload();

  const handleSend = () => {
    if (!message.trim()) return;

    const phone = conversation.contact?.whatsapp_id || '';

    sendMessage.mutate(
      {
        number: phone,
        text: message,
        companyId: conversation.company_id,
      },
      {
        onSuccess: () => {
          setMessage('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 100MB');
      return;
    }

    setSelectedFile(file);
    setShowMediaDialog(true);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMedia = async (caption?: string) => {
    if (!selectedFile) return;

    const phone = conversation.contact?.whatsapp_id || '';

    try {
      // Upload file to storage
      const { url, mediaType, mimeType } = await uploadMedia(selectedFile);

      // Send via WhatsApp
      await sendMedia.mutateAsync({
        number: phone,
        mediaUrl: url,
        mediaType,
        caption,
        companyId: conversation.company_id,
      });

      toast.success('Arquivo enviado com sucesso!');
      setShowMediaDialog(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending media:', error);
      toast.error('Erro ao enviar arquivo');
    }
  };

  return (
    <>
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                disabled={isUploading}
              >
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="start" 
              className="w-auto p-0 border-0"
            >
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>

          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            disabled={isUploading}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </Button>

          <Textarea
            placeholder="Digite uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isUploading}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending || isUploading}
            className="shrink-0 bg-green-600 hover:bg-green-700"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Media Preview Dialog */}
      <MediaPreviewDialog
        open={showMediaDialog}
        onOpenChange={setShowMediaDialog}
        file={selectedFile}
        onSend={handleSendMedia}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </>
  );
};
