
import React, { useState } from 'react';
import { UserProfile } from './UserProfile';
import { ClientSelector } from './ClientSelector';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Search, Menu, X } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  isCollapsed: boolean;
}

export const DashboardHeader = ({ activeTab, isCollapsed }: DashboardHeaderProps) => {
  const { isAdmin, profile } = useAuth();
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

  return (
    <header className={`fixed top-0 right-0 h-16 growave-glass border-b border-slate-700/50 dark:border-slate-700/50 border-slate-300/50 z-40 transition-all duration-300 ${
      isCollapsed ? 'left-16' : 'left-64'
    }`}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:bg-slate-200 text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-700 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden md:block">
            <h1 className="text-lg md:text-xl font-bold text-white dark:text-white text-slate-900 growave-neon-text">
              {getTitle()}
            </h1>
            <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-xs md:text-sm">
              {getSubtitle()}
            </p>
          </div>
          
          {isAdmin && <div className="hidden lg:block"><ClientSelector /></div>}
          
          {!isAdmin && profile && (
            <div className="hidden md:flex bg-slate-800/50 dark:bg-slate-800/50 bg-slate-200/50 rounded-lg px-3 md:px-4 py-2 border border-slate-700 dark:border-slate-700 border-slate-300 growave-card-hover">
              <span className="text-xs md:text-sm text-slate-300 dark:text-slate-300 text-slate-600">Cliente: </span>
              <span className="text-xs md:text-sm font-medium text-white dark:text-white text-slate-900 ml-1">{profile.nome_completo}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - hidden on mobile */}
          <div className="hidden lg:flex items-center growave-glass rounded-lg px-4 py-2 border border-slate-700/50 dark:border-slate-700/50 border-slate-300/50">
            <Search size={16} className="text-slate-400 dark:text-slate-400 text-slate-600 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-white dark:text-white text-slate-900 text-sm placeholder-slate-400 dark:placeholder-slate-400 placeholder-slate-600 focus:outline-none w-32 xl:w-40"
            />
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:bg-slate-200 text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-700 transition-all duration-200 growave-card-hover">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full growave-logo-glow animate-pulse"></div>
          </button>
          
          <UserProfile />
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 growave-glass border-b border-slate-700/50 dark:border-slate-700/50 border-slate-300/50 p-4 space-y-4">
          <div>
            <h1 className="text-lg font-bold text-white dark:text-white text-slate-900 growave-neon-text">
              {getTitle()}
            </h1>
            <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm">
              {getSubtitle()}
            </p>
          </div>
          
          {isAdmin && <ClientSelector />}
          
          <div className="flex items-center growave-glass rounded-lg px-4 py-2 border border-slate-700/50 dark:border-slate-700/50 border-slate-300/50">
            <Search size={16} className="text-slate-400 dark:text-slate-400 text-slate-600 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-white dark:text-white text-slate-900 text-sm placeholder-slate-400 dark:placeholder-slate-400 placeholder-slate-600 focus:outline-none flex-1"
            />
          </div>
        </div>
      )}
    </header>
  );
};
