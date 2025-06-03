
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader = ({ onClearChat }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b" style={{ backgroundColor: '#4c1a27' }}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">UALR Graduate Procedures Assistant</h2>
        <Button
          onClick={onClearChat}
          variant="outline"
          size="sm"
          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
