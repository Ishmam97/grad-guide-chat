
import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Sidebar as SidebarComponent, 
  SidebarContent, 
  SidebarHeader,
  useSidebar 
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import QueryReportForm from './QueryReportForm';
import NotesSection from './NotesSection';
import ApiKeyConfig from './ApiKeyConfig';
import QuickStats from './sidebar/QuickStats';

interface SidebarProps {
  onReportSubmit: (question: string, comment: string) => void;
  onApiKeyChange: (apiKey: string) => void;
}

const Sidebar = ({ onReportSubmit, onApiKeyChange }: SidebarProps) => {
  const { signOut, user } = useAuth();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarComponent className="bg-gray-600 border-r">
      <SidebarHeader className="p-4 border-b text-black bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* UALR Logo */}
            <img 
              src="https://ishmam97.github.io/grad-guide-chat/placeholder.svg" 
              alt="UALR Logo" 
              className="w-10 h-10 mr-3"
            />
            {state === 'expanded' && (
              <div>
                <h1 className="text-lg font-bold text-[#4c1a27]">UA Little Rock</h1>
                <p className="text-gray-800 text-sm">Graduate Admissions</p>
              </div>
            )}
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
        {user && state === 'expanded' && (
          <p className="text-gray-800 text-xs mt-2">
            {user.email}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 p-4">
          {state === 'expanded' && (
            <div className="space-y-6">
              <ApiKeyConfig onApiKeyChange={onApiKeyChange} />
              <QueryReportForm onReportSubmit={onReportSubmit} />
              <NotesSection />
              <QuickStats />
            </div>
          )}
        </ScrollArea>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
