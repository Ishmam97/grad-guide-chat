
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onQuestionSubmit: (question: string) => void;
}

const ChatInterface = ({ onQuestionSubmit }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help you with graduate program procedures at UALR. What would you like to know?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateChatbotResponse = (question: string): string => {
    const responses = [
      `Based on UALR graduate procedures, here's what I found regarding "${question.toLowerCase()}": This typically involves submitting the required forms to your graduate coordinator within the specified deadline. Please check with your department for specific requirements.`,
      `For questions about "${question.toLowerCase()}", I recommend reviewing the graduate handbook section 4.2. The process usually requires approval from your advisory committee and the graduate school.`,
      `Regarding "${question.toLowerCase()}", this procedure follows standard UALR graduate policies. You'll need to complete the necessary paperwork and obtain required signatures before the deadline.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    onQuestionSubmit(inputValue);

    // Simulate API call delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateChatbotResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);

    setInputValue('');
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      text: 'Hello! I\'m here to help you with graduate program procedures at UALR. What would you like to know?',
      isUser: false,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-blue-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-900">UALR Graduate Procedures Assistant</h2>
          <Button
            onClick={clearConversation}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className={`text-xs mt-1 block ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 border p-3 rounded-lg max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about graduate procedures..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
