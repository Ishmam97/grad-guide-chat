
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import LoadingIndicator from './chat/LoadingIndicator';
import { queryBackend } from '@/services/chatbotApi';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string | any;
  isUser: boolean;
  timestamp: Date;
  retrievedDocs?: any[];
  modelUsed?: string;
}

interface ChatInterfaceProps {
  apiKey: string;
}

const ChatInterface = ({ apiKey }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help answer questions about UALR graduate procedures. What would you like to know?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    currentConversation, 
    createNewConversation, 
    addMessage: addDbMessage, 
    submitFeedback 
  } = useChat();

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !apiKey) {
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please configure your Gemini API key in the sidebar.",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create conversation if this is the first message
      let conversationId = currentConversation?.id;
      if (!conversationId && messages.length === 1) {
        const newConversation = await createNewConversation(message);
        conversationId = newConversation?.id;
      }

      // Save user message to database
      if (conversationId) {
        await addDbMessage(message, true, conversationId);
      }

      const response = await queryBackend({
        query: message,
        api_key: apiKey,
        k: 3,
        model: 'gemini-1.5-flash-latest'
      });

      console.log('API Response:', response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        retrievedDocs: response.retrieved_docs,
        modelUsed: response.model_used,
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message to database
      if (conversationId) {
        await addDbMessage(response.response, false, conversationId, {
          model_used: response.model_used,
          retrieved_docs: response.retrieved_docs,
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, feedbackType: 'positive' | 'negative') => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      await submitFeedback(messageId, feedbackType === 'positive' ? 'thumbs_up' : 'thumbs_down', {
        user_query: messages[messages.findIndex(m => m.id === messageId) - 1]?.text || '',
        bot_response: message.text,
        model_used: message.modelUsed,
        retrieved_docs: message.retrievedDocs,
      });

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m here to help answer questions about UALR graduate procedures. What would you like to know?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onClearChat={clearChat} />
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedback={handleFeedback}
            />
          ))}
          {isLoading && <LoadingIndicator />}
        </div>
      </ScrollArea>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;
