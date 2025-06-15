
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Enhanced animated background - light theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 dark:from-[#00FF88]/8 dark:via-transparent dark:to-[#39FF14]/8 animate-pulse"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 dark:bg-[#00FF88]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/8 dark:bg-[#39FF14]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
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
      
      <main className={`pt-16 transition-all duration-300 ease-out ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
