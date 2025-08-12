import React, { useState } from 'react';
import { UserProfile } from './UserProfile';
import { ClientSelector } from './ClientSelector';
import { useAuth } from '@/hooks/useAuth';
import { useActiveClient } from '@/hooks/useActiveClient';
import { Bell, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebarNav } from './MobileSidebarNav';

interface DashboardHeaderProps {
  activeTab: string;
  isCollapsed: boolean;
  onNavigateToProfile?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const DashboardHeader = ({
  activeTab,
  isCollapsed,
  onNavigateToProfile,
  onSelectTab
}: DashboardHeaderProps) => {
  const {
    isAdmin,
    profile
  } = useAuth();
  const { activeClient } = useActiveClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'kanban':
        return 'Lead Pipeline';
      case 'users':
        return 'Gerenciar Usuários';
      case 'profile':
        return 'Meu Perfil';
      default:
        return 'Marketing Analytics';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'kanban':
        return 'Acompanhe a jornada dos seus leads';
      case 'users':
        return 'Controle de acesso e permissões';
      case 'profile':
        return 'Gerencie suas informações pessoais';
      default:
        return 'Performance das suas campanhas em tempo real';
    }
  };

  const handleNavigateToProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile('profile');
    }
    onSelectTab?.('profile');
  };

  return (
    <header className={`fixed top-0 right-0 h-16 growave-glass border-b border-slate-700/50 z-40 transition-all duration-300 left-0 ${isCollapsed ? 'md:left-16' : 'md:left-64'}`}>

      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 sm:w-80">
                <SheetHeader>
                  <SheetTitle>Navegação</SheetTitle>
                </SheetHeader>
                <div className="mt-2 space-y-4">
                  {isAdmin && (
                    <div>
                      <ClientSelector />
                    </div>
                  )}
                  <MobileSidebarNav
                    activeTab={activeTab}
                    isAdmin={isAdmin}
                    onSelectTab={(tab) => {
                      onSelectTab?.(tab);
                      setIsMobileMenuOpen(false);
                    }}
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          <div className="hidden md:block">
            
            <p className="text-slate-400 text-sm">
              {getSubtitle()}
            </p>
          </div>
          
            {isAdmin && <div className="hidden lg:block"><ClientSelector /></div>}
          
          {!isAdmin && activeClient && <div className="hidden md:flex bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700 growave-card-hover">
              <span className="text-sm text-slate-300">Cliente: </span>
              <span className="text-sm font-medium text-white ml-1">{activeClient}</span>
            </div>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200 growave-card-hover">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full growave-logo-glow animate-pulse"></div>
          </button>
          
          <UserProfile onNavigateToProfile={handleNavigateToProfile} />
        </div>
      </div>

      {/* Mobile menu overlay replaced by Sheet */}
    </header>
  );
};
