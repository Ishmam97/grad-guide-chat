
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  retrievedDocs?: any[];
  modelUsed?: string;
}

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string, feedbackType: 'positive' | 'negative') => void;
}

const ChatMessage = ({ message, onFeedback }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.isUser
            ? 'text-white'
            : 'bg-white text-gray-800 border'
        }`}
        style={message.isUser ? { backgroundColor: '#4c1a27' } : {}}
      >
        <p className="text-sm">{message.text}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${
            message.isUser ? 'text-pink-100' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!message.isUser && message.id !== '1' && (
            <div className="flex space-x-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-green-100"
                onClick={() => onFeedback(message.id, 'positive')}
              >
                <ThumbsUp className="w-3 h-3 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-red-100"
                onClick={() => onFeedback(message.id, 'negative')}
              >
                <ThumbsDown className="w-3 h-3 text-red-600" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
