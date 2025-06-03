
import React from 'react';
import { GraduationCap } from 'lucide-react';
import QueryReportForm from './QueryReportForm';
import NotesSection from './NotesSection';
import ApiKeyConfig from './ApiKeyConfig';
import QuickStats from './sidebar/QuickStats';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  onReportSubmit: (question: string, comment: string) => void;
  onApiKeyChange: (apiKey: string) => void;
}

const Sidebar = ({ onReportSubmit, onApiKeyChange }: SidebarProps) => {
  return (
    <div className="w-80 bg-slate-50 border-r h-full flex flex-col">
      <div className="p-4 border-b text-white" style={{ backgroundColor: '#4c1a27' }}>
        <div className="flex items-center">
          <GraduationCap className="w-6 h-6 mr-2" />
          <h1 className="text-lg font-bold">UALR Graduate Q&A</h1>
        </div>
        <p className="text-blue-100 text-sm mt-1">Coordinator Dashboard</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <ApiKeyConfig onApiKeyChange={onApiKeyChange} />
          <QueryReportForm onReportSubmit={onReportSubmit} />
          <NotesSection />
          <QuickStats />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
