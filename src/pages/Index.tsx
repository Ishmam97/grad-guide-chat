
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [reportedQuestions, setReportedQuestions] = useState<Array<{question: string, comment: string}>>([]);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const handleReportSubmit = (question: string, comment: string) => {
    setReportedQuestions(prev => [...prev, { question, comment }]);
    console.log('Question reported:', { question, comment });
  };

  const handleQuestionSubmit = (question: string) => {
    console.log('Question submitted to chatbot:', question);
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    console.log('API key updated');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        onReportSubmit={handleReportSubmit} 
        onApiKeyChange={handleApiKeyChange}
      />
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          onQuestionSubmit={handleQuestionSubmit}
          apiKey={apiKey}
        />
      </div>
    </div>
  );
};

export default Index;
