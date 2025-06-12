
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryBackend } from '@/services/chatbotApi';
import { chatStorage, type StoredMessage } from '@/services/chatStorage';
import { useAuth } from '@/hooks/useAuth';
import FeedbackModal from './FeedbackModal';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import LoadingIndicator from './chat/LoadingIndicator';

interface Message {
  id: string;
  text: string | any;
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
  const { user } = useAuth();
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
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    messageId: string;
    feedbackType: 'positive' | 'negative';
    userQuery: string;
    botResponse: string;
    retrievedDocs?: any[];
    modelUsed?: string;
  }>({
    isOpen: false,
    messageId: '',
    feedbackType: 'positive',
    userQuery: '',
    botResponse: '',
    retrievedDocs: [],
    modelUsed: ''
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversation messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;
      
      try {
        const storedMessages = await chatStorage.loadConversationMessages();
        if (storedMessages.length > 0) {
          const formattedMessages: Message[] = storedMessages.map(msg => ({
            id: msg.id,
            text: msg.content,
            isUser: msg.isUser,
            timestamp: msg.timestamp,
            retrievedDocs: msg.retrievedDocs,
            modelUsed: msg.modelUsed,
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Failed to load conversation messages:', error);
      }
    };

    loadMessages();
  }, [user]);

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

    setFeedbackModal({
      isOpen: true,
      messageId,
      feedbackType,
      userQuery: typeof userMessage.text === 'string' ? userMessage.text : JSON.stringify(userMessage.text),
      botResponse: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
      retrievedDocs: message.retrievedDocs || [],
      modelUsed: message.modelUsed || 'gemini-1.5-flash-latest'
    });
  };

  const handleFeedbackSubmit = async (comment: string, correctedQuestion?: string, correctAnswer?: string) => {
    if (!user) return;

    try {
      await chatStorage.storeFeedback(
        feedbackModal.messageId,
        feedbackModal.feedbackType === 'positive' ? 'thumbs_up' : 'thumbs_down',
        feedbackModal.userQuery,
        feedbackModal.botResponse,
        feedbackModal.feedbackType === 'positive' ? comment : undefined,
        feedbackModal.feedbackType === 'negative' ? comment : undefined,
        correctedQuestion,
        correctAnswer,
        feedbackModal.retrievedDocs,
        feedbackModal.modelUsed
      );

      console.log(`Feedback submitted: ${feedbackModal.feedbackType} for message ${feedbackModal.messageId}`);
      setFeedbackModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    if (!apiKey) {
      alert('Please configure your Gemini API key in the sidebar first.');
      return;
    }

    if (!user) {
      alert('Please sign in to use the chat.');
      return;
    }

    try {
      // Store user message
      const userMessageId = await chatStorage.storeMessage(inputValue, true);
      
      const userMessage: Message = {
        id: userMessageId,
        text: inputValue,
        isUser: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      onQuestionSubmit(inputValue);

      const response = await queryBackend({
        query: inputValue,
        api_key: apiKey,
        k: 3,
        model: 'gemini-1.5-flash-latest'
      });

      console.log('API Response:', response);

      // Store bot response
      const botMessageId = await chatStorage.storeMessage(
        typeof response.response === 'string' ? response.response : JSON.stringify(response.response),
        false,
        response.retrieved_docs,
        response.model_used
      );

      const botResponse: Message = {
        id: botMessageId,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        retrievedDocs: response.retrieved_docs,
        modelUsed: response.model_used
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Query failed:', error);
      
      // Store error message
      try {
        const errorMessageId = await chatStorage.storeMessage(
          'Sorry, I encountered an error while processing your question. Please check your API key and try again.',
          false
        );

        const errorMessage: Message = {
          id: errorMessageId,
          text: 'Sorry, I encountered an error while processing your question. Please check your API key and try again.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } catch (storeError) {
        console.error('Failed to store error message:', storeError);
      }
    } finally {
      setIsLoading(false);
    }

    setInputValue('');
  };

  const clearConversation = async () => {
    try {
      // Clear current conversation and start a new one
      chatStorage.clearCurrentConversation();
      
      setMessages([{
        id: '1',
        text: 'Hello! I\'m here to help you with graduate program procedures at UALR. What would you like to know?',
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <ChatHeader onClearChat={clearConversation} />

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4" style={{ paddingBottom: '80px' }}>
        <div className="space-y-4">
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

      <div className="fixed bottom-0 left-80 right-0 z-10">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleFeedbackSubmit}
        feedbackType={feedbackModal.feedbackType}
      />
    </div>
  );
};

export default ChatInterface;
