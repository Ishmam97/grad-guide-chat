
import { supabase } from '@/integrations/supabase/client';

export interface ReportedQuestion {
  id: string;
  user_id: string;
  question: string;
  comment?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export const reportService = {
  async submitReport(question: string, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('reported_questions')
      .insert([{ question, comment }]);

    if (error) throw error;
  },

  async getReports(): Promise<ReportedQuestion[]> {
    const { data, error } = await supabase
      .from('reported_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateReportStatus(id: string, status: ReportedQuestion['status']): Promise<void> {
    const { error } = await supabase
      .from('reported_questions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },
};
