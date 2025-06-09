
import React from 'react';
import { UserProfile } from './UserProfile';
import { ClientSelector } from './ClientSelector';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Search } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  isCollapsed: boolean;
}

export const DashboardHeader = ({ activeTab, isCollapsed }: DashboardHeaderProps) => {
  const { isAdmin, profile } = useAuth();

  const getTitle = () => {
    switch (activeTab) {
      case 'kanban':
        return 'Lead Pipeline';
      default:
        return 'Marketing Analytics';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'kanban':
        return 'Acompanhe a jornada dos seus leads';
      default:
        return 'Performance das suas campanhas em tempo real';
    }
  };

  return (
    <header className={`fixed top-0 right-0 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 z-40 transition-all duration-300 ${
      isCollapsed ? 'left-16' : 'left-64'
    }`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-xl font-bold text-white growave-neon-text">
              {getTitle()}
            </h1>
            <p className="text-slate-400 text-sm">
              {getSubtitle()}
            </p>
          </div>
          
          {isAdmin && <ClientSelector />}
          
          {!isAdmin && profile && (
            <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
              <span className="text-sm text-slate-300">Cliente: </span>
              <span className="text-sm font-medium text-white">{profile.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-white text-sm placeholder-slate-400 focus:outline-none w-40"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full growave-logo-glow"></div>
          </button>
          
          <UserProfile />
        </div>
      </div>
    </header>
  );
};
