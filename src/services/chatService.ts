
import { supabase } from '@/integrations/supabase/client';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  is_user_message: boolean;
  model_used?: string;
  retrieved_docs?: any[];
  created_at: string;
}

export interface ChatFeedback {
  id: string;
  user_id: string;
  message_id?: string;
  conversation_id?: string;
  feedback_type: 'thumbs_up' | 'thumbs_down';
  user_query?: string;
  bot_response?: string;
  thumbs_up_reason?: string;
  thumbs_down_reason?: string;
  corrected_question?: string;
  correct_answer?: string;
  model_used?: string;
  retrieved_docs?: any[];
  created_at: string;
}

export const chatService = {
  // Conversations
  async createConversation(title: string): Promise<ChatConversation> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert([{ title }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations(): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateConversation(id: string, updates: Partial<ChatConversation>): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  // Messages
  async addMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Feedback
  async submitFeedback(feedback: Omit<ChatFeedback, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('chat_feedback')
      .insert([feedback]);

    if (error) throw error;
  },
};
