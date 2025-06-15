
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
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/8 via-transparent to-[#39FF14]/8 animate-pulse"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#00FF88]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#39FF14]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
      
      <main className={`pt-20 transition-all duration-300 ease-out ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="max-w-full mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
