
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import { reportService } from '@/services/reportService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const { toast } = useToast();

  const handleReportSubmit = async (question: string, comment: string) => {
    try {
      await reportService.submitReport(question, comment);
      toast({
        title: "Report submitted",
        description: "Thank you for reporting this question. We'll review it shortly.",
      });
      console.log('Question reported:', { question, comment });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
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
        <ChatInterface apiKey={apiKey} />
      </div>
    </div>
  );
};

export default Index;
