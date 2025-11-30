import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const emojiCategories = {
  smileys: {
    label: '😊',
    emojis: [
      '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
      '😋', '😎', '😍', '🥰', '😘', '😗', '☺️', '😚', '😙', '🥲',
      '😏', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
      '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸',
    ],
  },
  gestures: {
    label: '👍',
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏',
      '💪', '👏', '🙌', '👐', '🤲', '🤳', '✍️', '🦾', '🦿', '🦵',
    ],
  },
  hearts: {
    label: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    ],
  },
  objects: {
    label: '📱',
    emojis: [
      '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹', '🎥', '📞',
      '☎️', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏰', '📧', '📨',
      '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '✉️',
    ],
  },
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');

  return (
    <div className="w-[320px] h-[300px] bg-background border border-border rounded-lg shadow-lg">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full h-full">
        <TabsList className="w-full grid grid-cols-4 gap-1 p-2 bg-muted/50">
          {Object.entries(emojiCategories).map(([key, { label }]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="text-xl hover:bg-muted data-[state=active]:bg-accent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(emojiCategories).map(([key, { emojis }]) => (
          <TabsContent key={key} value={key} className="h-[calc(100%-50px)] m-0">
            <ScrollArea className="h-full p-2">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onEmojiSelect(emoji)}
                    className="text-2xl p-2 hover:bg-muted rounded transition-colors"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
