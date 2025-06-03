
import { useState, useEffect } from 'react';
import { chatService, ChatConversation, ChatMessage } from '@/services/chatService';
import { useAuth } from './useAuth';

export const useChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages for current conversation
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(convId);
      setMessages(data);
      
      // Find and set current conversation
      const conversation = conversations.find(c => c.id === convId);
      setCurrentConversation(conversation || null);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (firstMessage: string) => {
    if (!user) return null;

    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      const conversation = await chatService.createConversation(title);
      setCurrentConversation(conversation);
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const addMessage = async (content: string, isUserMessage: boolean, conversationId: string, additionalData?: any) => {
    if (!user) return;

    try {
      const message = await chatService.addMessage({
        conversation_id: conversationId,
        user_id: user.id,
        content,
        is_user_message: isUserMessage,
        model_used: additionalData?.model_used,
        retrieved_docs: additionalData?.retrieved_docs,
      });

      setMessages(prev => [...prev, message]);
      return message;
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const submitFeedback = async (messageId: string, feedbackType: 'thumbs_up' | 'thumbs_down', additionalData?: any) => {
    if (!user || !currentConversation) return;

    try {
      await chatService.submitFeedback({
        user_id: user.id,
        message_id: messageId,
        conversation_id: currentConversation.id,
        feedback_type: feedbackType,
        ...additionalData,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    createNewConversation,
    addMessage,
    submitFeedback,
    loadConversations,
    loadMessages,
  };
};
