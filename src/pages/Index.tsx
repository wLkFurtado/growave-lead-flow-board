
import React, { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { AdAnalysisTable } from '../components/dashboard/AdAnalysisTable';
import { LeadKanbanBoard } from '../components/dashboard/LeadKanbanBoard';
import { facebookAdsData, whatsappAnuncioData } from '../data/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
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
        </main>
      </div>
    </div>
  );
};

export default Index;
