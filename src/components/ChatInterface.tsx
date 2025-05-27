
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryBackend, submitFeedback } from '@/services/chatbotApi';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  retrievedDocs?: any[];
  modelUsed?: string;
}

interface ChatInterfaceProps {
  onQuestionSubmit: (question: string) => void;
  apiKey: string;
}

const ChatInterface = ({ onQuestionSubmit, apiKey }: ChatInterfaceProps) => {
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

  const handleFeedback = async (messageId: string, feedbackType: 'positive' | 'negative') => {
    const message = messages.find(m => m.id === messageId);
    const userMessage = messages.find(m => m.isUser && messages.indexOf(m) === messages.findIndex(msg => msg.id === messageId) - 1);
    
    if (!message || !userMessage) return;

    try {
      await submitFeedback({
        timestamp: new Date().toISOString(),
        query: userMessage.text,
        response: message.text,
        feedback_type: feedbackType,
        model_used: message.modelUsed || 'gemini-1.5-flash-latest',
        retrieved_docs: message.retrievedDocs || [],
        source_message_id: messageId
      });
      console.log(`Feedback submitted: ${feedbackType} for message ${messageId}`);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    if (!apiKey) {
      alert('Please configure your Gemini API key in the sidebar first.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    onQuestionSubmit(inputValue);

    try {
      const response = await queryBackend({
        query: inputValue,
        api_key: apiKey,
        k: 3,
        model: 'gemini-1.5-flash-latest'
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        retrievedDocs: response.retrieved_docs,
        modelUsed: response.model_used
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Query failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your question. Please check your API key and try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

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
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!message.isUser && message.id !== '1' && (
                    <div className="flex space-x-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-100"
                        onClick={() => handleFeedback(message.id, 'positive')}
                      >
                        <ThumbsUp className="w-3 h-3 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-red-100"
                        onClick={() => handleFeedback(message.id, 'negative')}
                      >
                        <ThumbsDown className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
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
