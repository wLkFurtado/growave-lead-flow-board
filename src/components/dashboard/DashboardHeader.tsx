import React, { useState } from 'react';
import { UserProfile } from './UserProfile';
import { ClientSelector } from './ClientSelector';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Menu, X } from 'lucide-react';
interface DashboardHeaderProps {
  activeTab: string;
  isCollapsed: boolean;
}
export const DashboardHeader = ({
  activeTab,
  isCollapsed
}: DashboardHeaderProps) => {
  const {
    isAdmin,
    profile
  } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getTitle = () => {
    switch (activeTab) {
      case 'kanban':
        return 'Lead Pipeline';
      case 'users':
        return 'Gerenciar Usuários';
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
      default:
        return 'Performance das suas campanhas em tempo real';
    }
  };
  return <header className={`fixed top-0 right-0 h-16 growave-glass border-b border-slate-700/50 z-40 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Mobile menu button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden md:block">
            
            <p className="text-slate-400 text-sm">
              {getSubtitle()}
            </p>
          </div>
          
          {isAdmin && <div className="hidden lg:block"><ClientSelector /></div>}
          
          {!isAdmin && profile && <div className="hidden md:flex bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700 growave-card-hover">
              <span className="text-sm text-slate-300">Cliente: </span>
              <span className="text-sm font-medium text-white ml-1">{profile.nome_completo}</span>
            </div>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200 growave-card-hover">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full growave-logo-glow animate-pulse"></div>
          </button>
          
          <UserProfile />
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && <div className="md:hidden absolute top-16 left-0 right-0 growave-glass border-b border-slate-700/50 p-4 space-y-4">
          <div>
            <h1 className="text-lg font-bold text-white growave-neon-text">
              {getTitle()}
            </h1>
            <p className="text-slate-400 text-sm">
              {getSubtitle()}
            </p>
          </div>
          
          {isAdmin && <ClientSelector />}
        </div>}
    </header>;
};