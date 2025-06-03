
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string, correctedQuestion?: string, correctAnswer?: string) => void;
  feedbackType: 'positive' | 'negative';
}

const FeedbackModal = ({ isOpen, onClose, onSubmit, feedbackType }: FeedbackModalProps) => {
  const [comment, setComment] = useState('');
  const [correctedQuestion, setCorrectedQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const handleSubmit = () => {
    onSubmit(comment, correctedQuestion || undefined, correctAnswer || undefined);
    setComment('');
    setCorrectedQuestion('');
    setCorrectAnswer('');
  };

  const handleClose = () => {
    setComment('');
    setCorrectedQuestion('');
    setCorrectAnswer('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {feedbackType === 'positive' ? (
              <>
                <ThumbsUp className="w-5 h-5 text-green-600" />
                Thank you for your feedback!
              </>
            ) : (
              <>
                <ThumbsDown className="w-5 h-5 text-red-600" />
                Help us improve
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              {feedbackType === 'positive' 
                ? 'What did you like about this response?' 
                : 'What was wrong with this response?'}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={feedbackType === 'positive' 
                ? 'e.g., Clear and helpful information...' 
                : 'e.g., Information was incorrect or incomplete...'}
              rows={3}
              className="mt-1"
            />
          </div>

          {feedbackType === 'negative' && (
            <>
              <div>
                <Label htmlFor="correctedQuestion" className="text-sm font-medium">
                  Corrected Question (Optional)
                </Label>
                <Textarea
                  id="correctedQuestion"
                  value={correctedQuestion}
                  onChange={(e) => setCorrectedQuestion(e.target.value)}
                  placeholder="How should the question have been asked?"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="correctAnswer" className="text-sm font-medium">
                  Correct Answer (Optional)
                </Label>
                <Textarea
                  id="correctAnswer"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="What should the correct answer be?"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!comment.trim()}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#245d7a' }}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
