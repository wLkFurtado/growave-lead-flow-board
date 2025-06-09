
import React, { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { AdAnalysisTable } from '../components/dashboard/AdAnalysisTable';
import { LeadKanbanBoard } from '../components/dashboard/LeadKanbanBoard';
import { facebookAdsData, whatsappAnuncioData } from '../data/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background gradient */}
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
            {activeTab === 'dashboard' && (
              <>
                <DashboardOverview adsData={facebookAdsData} leadsData={whatsappAnuncioData} />
                <AdAnalysisTable adsData={facebookAdsData} leadsData={whatsappAnuncioData} />
              </>
            )}
            {activeTab === 'kanban' && (
              <LeadKanbanBoard leadsData={whatsappAnuncioData} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
