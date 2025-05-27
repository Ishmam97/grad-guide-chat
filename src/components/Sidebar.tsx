
import React from 'react';
import { GraduationCap, BarChart3 } from 'lucide-react';
import QueryReportForm from './QueryReportForm';
import NotesSection from './NotesSection';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  onReportSubmit: (question: string, comment: string) => void;
}

const Sidebar = ({ onReportSubmit }: SidebarProps) => {
  return (
    <div className="w-80 bg-slate-50 border-r h-full flex flex-col">
      <div className="p-4 border-b bg-blue-900 text-white">
        <div className="flex items-center">
          <GraduationCap className="w-6 h-6 mr-2" />
          <h1 className="text-lg font-bold">UALR Graduate Q&A</h1>
        </div>
        <p className="text-blue-100 text-sm mt-1">Coordinator Dashboard</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <QueryReportForm onReportSubmit={onReportSubmit} />
          <NotesSection />
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Quick Stats</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Questions Today:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reports Submitted:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Notes Created:</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
