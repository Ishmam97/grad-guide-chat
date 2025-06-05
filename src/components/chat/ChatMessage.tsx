
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string | any; // Allow for API response objects
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
  // Extract text content from API response object if needed
  const getMessageText = (text: string | any): string => {
    if (typeof text === 'string') {
      return text;
    }
    
    // Handle API response object structure
    if (text && typeof text === 'object') {
      // Try to extract content from common API response formats
      if (text.content) {
        return typeof text.content === 'string' ? text.content : JSON.stringify(text.content);
      }
      if (text.text) {
        return typeof text.text === 'string' ? text.text : JSON.stringify(text.text);
      }
      // Fallback to stringifying the object
      return JSON.stringify(text);
    }
    
    return String(text || '');
  };

  const displayText = getMessageText(message.text);

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
        <div className="text-sm prose prose-sm max-w-none">
          {message.isUser ? (
            <p>{displayText}</p>
          ) : (
            <ReactMarkdown
              className={`${message.isUser ? 'prose-invert' : ''}`}
              components={{
                // Customize markdown components for better styling
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 last:mb-0 list-disc pl-4">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 last:mb-0 list-decimal pl-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                    {children}
                  </pre>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              }}
            >
              {displayText}
            </ReactMarkdown>
          )}
        </div>
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
