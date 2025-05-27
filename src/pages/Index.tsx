
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [reportedQuestions, setReportedQuestions] = useState<Array<{question: string, comment: string}>>([]);

  const handleReportSubmit = (question: string, comment: string) => {
    setReportedQuestions(prev => [...prev, { question, comment }]);
    console.log('Question reported:', { question, comment });
  };

  const handleQuestionSubmit = (question: string) => {
    console.log('Question submitted to chatbot:', question);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar onReportSubmit={handleReportSubmit} />
      <div className="flex-1 flex flex-col">
        <ChatInterface onQuestionSubmit={handleQuestionSubmit} />
      </div>
    </div>
  );
};

export default Index;
