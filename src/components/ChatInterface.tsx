
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryBackend, submitFeedback } from '@/services/chatbotApi';
import FeedbackModal from './FeedbackModal';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import LoadingIndicator from './chat/LoadingIndicator';

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
      userQuery: userMessage.text,
      botResponse: message.text,
      retrievedDocs: message.retrievedDocs || [],
      modelUsed: message.modelUsed || 'gemini-1.5-flash-latest'
    });
  };

  const handleFeedbackSubmit = async (comment: string, correctedQuestion?: string, correctAnswer?: string) => {
    try {
      const feedbackData = {
        timestamp: new Date().toISOString(),
        query: feedbackModal.userQuery,
        response: feedbackModal.botResponse,
        feedback_type: feedbackModal.feedbackType === 'positive' ? 'thumbs_up' : 'thumbs_down',
        thumbs_up_reason: feedbackModal.feedbackType === 'positive' ? comment : undefined,
        thumbs_down_reason: feedbackModal.feedbackType === 'negative' ? comment : undefined,
        corrected_question: correctedQuestion,
        correct_answer: correctAnswer,
        model_used: feedbackModal.modelUsed,
        retrieved_docs: feedbackModal.retrievedDocs,
        source_message_id: feedbackModal.messageId
      };

      await submitFeedback(feedbackData);
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
      <ChatHeader onClearChat={clearConversation} />

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
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

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

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
