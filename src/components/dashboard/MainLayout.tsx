
import React from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

interface MainLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  children: React.ReactNode;
}

export const MainLayout = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  children 
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/5 via-transparent to-[#39FF14]/5 animate-pulse"></div>
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <DashboardHeader 
        activeTab={activeTab}
        isCollapsed={isCollapsed}
      />
      
      <main className={`pt-16 transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
