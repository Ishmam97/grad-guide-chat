
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ChatConversation = Database['public']['Tables']['chat_conversations']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatFeedback = Database['public']['Tables']['chat_feedback']['Row'];

export interface StoredMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  retrievedDocs?: any[];
  modelUsed?: string;
}

export class ChatStorageService {
  private currentConversationId: string | null = null;

  // Create a new conversation
  async createConversation(title?: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title: title || 'New Conversation',
      })
      .select('id')
      .single();

    if (error) throw error;
    
    this.currentConversationId = data.id;
    return data.id;
  }

  // Get current conversation ID or create a new one
  async getCurrentConversationId(): Promise<string> {
    if (this.currentConversationId) {
      return this.currentConversationId;
    }
    return await this.createConversation();
  }

  // Store a message in the database
  async storeMessage(
    content: string,
    isUserMessage: boolean,
    retrievedDocs?: any[],
    modelUsed?: string
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const conversationId = await this.getCurrentConversationId();

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        content,
        is_user_message: isUserMessage,
        retrieved_docs: retrievedDocs || null,
        model_used: modelUsed || null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Store feedback for a message
  async storeFeedback(
    messageId: string,
    feedbackType: 'thumbs_up' | 'thumbs_down',
    userQuery: string,
    botResponse: string,
    thumbsUpReason?: string,
    thumbsDownReason?: string,
    correctedQuestion?: string,
    correctAnswer?: string,
    retrievedDocs?: any[],
    modelUsed?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const conversationId = await this.getCurrentConversationId();

    const { error } = await supabase
      .from('chat_feedback')
      .insert({
        user_id: user.id,
        message_id: messageId,
        conversation_id: conversationId,
        feedback_type: feedbackType,
        user_query: userQuery,
        bot_response: botResponse,
        thumbs_up_reason: thumbsUpReason || null,
        thumbs_down_reason: thumbsDownReason || null,
        corrected_question: correctedQuestion || null,
        correct_answer: correctAnswer || null,
        retrieved_docs: retrievedDocs || null,
        model_used: modelUsed || null,
      });

    if (error) throw error;
  }

  // Load messages for current conversation
  async loadConversationMessages(conversationId?: string): Promise<StoredMessage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const targetConversationId = conversationId || this.currentConversationId;
    if (!targetConversationId) return [];

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', targetConversationId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.is_user_message || false,
      timestamp: new Date(msg.created_at || ''),
      retrievedDocs: msg.retrieved_docs as any[] || undefined,
      modelUsed: msg.model_used || undefined,
    }));
  }

  // Get user's conversations
  async getUserConversations(): Promise<ChatConversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Clear current conversation and start new one
  clearCurrentConversation(): void {
    this.currentConversationId = null;
  }

  // Set current conversation
  setCurrentConversation(conversationId: string): void {
    this.currentConversationId = conversationId;
  }
}

export const chatStorage = new ChatStorageService();
