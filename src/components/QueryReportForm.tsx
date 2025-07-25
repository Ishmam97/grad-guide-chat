
import React, { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QueryReportFormProps {
  onReportSubmit: (question: string, comment: string) => void;
}

const QueryReportForm = ({ onReportSubmit }: QueryReportFormProps) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !user) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reported_questions')
        .insert({
          user_id: user.id,
          question: question.trim(),
          comment: comment.trim() || null,
          status: 'pending'
        });

      if (error) {
        console.error('Error storing reported question:', error);
        toast({
          title: "Error",
          description: "Failed to submit your report. Please try again.",
          variant: "destructive"
        });
      } else {
        onReportSubmit(question, comment);
        toast({
          title: "Report Submitted",
          description: "Your unanswered question has been reported for review.",
        });
        setQuestion('');
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center mb-3">
        <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
        <h3 className="font-semibold text-gray-800">Report Unanswered Question</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="question" className="text-sm font-medium text-gray-700">
            Unanswered Question *
          </Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What question couldn't be answered?"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
            Additional Comment (Optional)
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g., Missed deadline details, unclear procedures..."
            rows={3}
            className="mt-1"
          />
        </div>
        
        <Button
          type="submit"
          disabled={!question.trim() || isSubmitting || !user}
          className="w-full text-white hover:opacity-90"
          style={{ backgroundColor: '#6e2639' }}
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
};

export default QueryReportForm;
