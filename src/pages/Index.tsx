
import React, { useState } from 'react';
import { subDays } from 'date-fns';
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

interface DateRange {
  from: Date;
  to: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Período mais amplo para capturar mais dados - 6 meses
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 180),
    to: new Date()
  });
  
  const { facebookAds, whatsappLeads, isLoading, error, activeClient, hasData } = useClientData(dateRange);
  const { isAdmin } = useAuth();

  console.log('=== INDEX RENDER ===');
  console.log('activeClient:', activeClient);
  console.log('isLoading:', isLoading);
  console.log('facebookAds.length:', facebookAds.length);
  console.log('whatsappLeads.length:', whatsappLeads.length);
  console.log('hasData:', hasData);
  console.log('error:', error);
  console.log('dateRange:', {
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0]
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    console.log('📅 INDEX: Mudando período:', {
      from: newRange.from.toISOString().split('T')[0],
      to: newRange.to.toISOString().split('T')[0]
    });
    setDateRange(newRange);
  };

  if (isLoading) {
    console.log('📊 INDEX: Renderizando loading state');
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
    console.log('📊 INDEX: Renderizando error state:', error);
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

  console.log('📊 INDEX: Renderizando dashboard normal');

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
                    description={`Não há dados disponíveis para o cliente "${activeClient}" no período selecionado (${dateRange.from.toISOString().split('T')[0]} até ${dateRange.to.toISOString().split('T')[0]}). Verifique se os dados foram importados corretamente ou ajuste o período.`}
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
                    <DashboardOverview 
                      adsData={facebookAds} 
                      leadsData={whatsappLeads}
                      onDateRangeChange={handleDateRangeChange}
                      dateRange={dateRange}
                    />
                    <AdAnalysisTable 
                      adsData={facebookAds} 
                      leadsData={whatsappLeads}
                      onDateRangeChange={handleDateRangeChange}
                      dateRange={dateRange}
                    />
                  </>
                )}
              </>
            )}
            
            {activeTab === 'kanban' && (
              <>
                {!hasData && activeClient ? (
                  <EmptyState
                    title="Nenhum lead encontrado"
                    description={`Não há leads disponíveis para o cliente "${activeClient}" no período selecionado.`}
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
