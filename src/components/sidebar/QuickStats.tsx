
import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StatsData {
  questionsToday: number;
  totalQuestions: number;
  reportsSubmitted: number;
  notesCreated: number;
}

const QuickStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    questionsToday: 0,
    totalQuestions: 0,
    reportsSubmitted: 0,
    notesCreated: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch questions today (user messages in chat_messages)
      const { data: questionsTodayData, error: questionsTodayError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_user_message', true)
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      if (questionsTodayError) throw questionsTodayError;

      // Fetch total questions (all user messages)
      const { data: totalQuestionsData, error: totalQuestionsError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_user_message', true);

      if (totalQuestionsError) throw totalQuestionsError;

      // Fetch reports submitted
      const { data: reportsData, error: reportsError } = await supabase
        .from('reported_questions')
        .select('id')
        .eq('user_id', user.id);

      if (reportsError) throw reportsError;

      // Fetch notes created
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id);

      if (notesError) throw notesError;

      setStats({
        questionsToday: questionsTodayData?.length || 0,
        totalQuestions: totalQuestionsData?.length || 0,
        reportsSubmitted: reportsData?.length || 0,
        notesCreated: notesData?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for chat messages
    const messagesChannel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Chat message change detected, updating stats...');
          fetchStats();
        }
      )
      .subscribe();

    // Set up real-time subscription for reported questions
    const reportsChannel = supabase
      .channel('reported-questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reported_questions',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Reported question change detected, updating stats...');
          fetchStats();
        }
      )
      .subscribe();

    // Set up real-time subscription for notes
    const notesChannel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Notes change detected, updating stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center mb-3">
          <BarChart3 className="w-5 h-5 mr-2" style={{ color: '#245d7a' }} />
          <h3 className="font-semibold text-gray-800">Quick Stats</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center mb-3">
        <BarChart3 className="w-5 h-5 mr-2" style={{ color: '#245d7a' }} />
        <h3 className="font-semibold text-gray-800">Quick Stats</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Questions Today:</span>
          <span className="font-medium text-blue-600">{stats.questionsToday}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Questions:</span>
          <span className="font-medium text-indigo-600">{stats.totalQuestions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reports Submitted:</span>
          <span className="font-medium text-green-600">{stats.reportsSubmitted}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Notes Created:</span>
          <span className="font-medium text-purple-600">{stats.notesCreated}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
