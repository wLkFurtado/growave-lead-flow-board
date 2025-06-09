
import React, { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { AdAnalysisTable } from '../components/dashboard/AdAnalysisTable';
import { LeadKanbanBoard } from '../components/dashboard/LeadKanbanBoard';
import { UserManagement } from '../components/dashboard/UserManagement';
import { DashboardSkeleton, EmptyState } from '../components/dashboard/LoadingStates';
import { useClientData } from '../hooks/useClientData';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Database } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { facebookAds, whatsappLeads, isLoading, error, activeClient, hasData } = useClientData();
  const { isAdmin } = useAuth();

  if (isLoading) {
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
            <div className="max-w-7xl mx-auto">
              <DashboardSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
            <div className="max-w-7xl mx-auto">
              <Alert className="bg-red-900/20 border-red-500/50 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro ao carregar dados:</strong> {error}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            {activeTab === 'dashboard' && (
              <>
                {!hasData && activeClient ? (
                  <EmptyState
                    title="Nenhum dado encontrado"
                    description={`Não há dados disponíveis para o cliente "${activeClient}". Verifique se os dados foram importados corretamente.`}
                    action={
                      isAdmin && (
                        <div className="text-sm text-slate-400">
                          <Database className="inline-block w-4 h-4 mr-1" />
                          Como admin, você pode verificar a importação de dados no Supabase.
                        </div>
                      )
                    }
                  />
                ) : !activeClient ? (
                  <EmptyState
                    title="Nenhum cliente selecionado"
                    description="Selecione um cliente para visualizar os dados de marketing."
                  />
                ) : (
                  <>
                    <DashboardOverview adsData={facebookAds} leadsData={whatsappLeads} />
                    <AdAnalysisTable adsData={facebookAds} leadsData={whatsappLeads} />
                  </>
                )}
              </>
            )}
            
            {activeTab === 'kanban' && (
              <>
                {!hasData && activeClient ? (
                  <EmptyState
                    title="Nenhum lead encontrado"
                    description={`Não há leads disponíveis para o cliente "${activeClient}".`}
                  />
                ) : !activeClient ? (
                  <EmptyState
                    title="Nenhum cliente selecionado"
                    description="Selecione um cliente para visualizar os leads."
                  />
                ) : (
                  <LeadKanbanBoard leadsData={whatsappLeads} />
                )}
              </>
            )}
            
            {activeTab === 'users' && isAdmin && (
              <UserManagement />
            )}
            
            {activeTab === 'users' && !isAdmin && (
              <EmptyState
                title="Acesso Restrito"
                description="Apenas administradores podem acessar o gerenciamento de usuários."
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
