import { format } from 'date-fns';
import { Check, CheckCheck, Clock, X, Image, File, Play } from 'lucide-react';
import { WhatsAppMessage } from '@/types/whatsapp';
import { cn } from '@/lib/utils';
import { AudioPlayer } from './AudioPlayer';

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOutgoing = message.direction === 'outgoing';

  const StatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <X className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  const renderMedia = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="mb-2">
            <img
              src={message.media_url}
              alt="Imagem"
              className="rounded-lg max-w-sm"
            />
          </div>
        );
      case 'audio':
        return <AudioPlayer src={message.media_url!} />;
      case 'video':
        return (
          <div className="mb-2 relative">
            <video
              src={message.media_url}
              controls
              className="rounded-lg max-w-sm"
            />
          </div>
        );
      case 'document':
        return (
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-accent rounded-lg mb-2"
          >
            <File className="w-5 h-5" />
            <span className="text-sm">Documento</span>
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isOutgoing
            ? 'bg-green-600 text-white'
            : 'bg-accent text-foreground'
        )}
      >
        {!isOutgoing && message.sender_name && (
          <p className="text-xs font-semibold mb-1 text-green-600">
            {message.sender_name}
          </p>
        )}

        {renderMedia()}

        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isOutgoing && <StatusIcon />}
        </div>
      </div>
    </div>
  );
};
