import React from 'react';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-80 bg-gray-600 border-r h-full flex flex-col">
      <div className="p-4 border-b text-black bg-white sidebar-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* UALR Logo */}
            <img 
              src="/placeholder.svg" 
              alt="UALR Logo" 
              className="w-10 h-10 mr-3"
            />
            <div>
              <h1 className="text-lg font-bold text-[#4c1a27]">UALR Graduate Q&A</h1>
              <p className="text-gray-800 text-sm">Coordinator Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-black hover:bg-gray-500"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        {user && (
          <p className="text-gray-800 text-xs mt-2">
            {user.email}
          </p>
        )}
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
