
import React, { useState } from 'react';
import { subDays, subMonths } from 'date-fns';
import { MainLayout } from './MainLayout';
import { TabContent } from './TabContent';
import { DashboardSkeleton } from './LoadingStates';
import { useClientData } from '../../hooks/useClientData';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

export const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Período padrão mais amplo para incluir todos os dados
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date('2025-06-01'),
    to: new Date('2025-07-31')
  });
  
  // Para aba de contatos: buscar todos os dados sem filtro de data
  const contactsData = useClientData({ 
    skipDateFilter: true 
  });
  
  // Para outras abas: usar filtro de data normal  
  const regularData = useClientData({ 
    dateRange 
  });

  // Escolher qual dataset usar baseado na aba ativa
  const currentData = activeTab === 'contacts' ? contactsData : regularData;
  const { facebookAds, whatsappLeads, isLoading, error, activeClient, hasData } = currentData;
  
  // Verificação de consistência dos dados - FORÇA NOVA BUSCA SE INCONSISTENTE
  const isDataConsistent = facebookAds.every(row => !row.cliente_nome || row.cliente_nome === activeClient) &&
                          whatsappLeads.every(row => !row.cliente_nome || row.cliente_nome === activeClient);
  
  if (!isDataConsistent && !isLoading) {
    console.error('🚨 INCONSISTÊNCIA DETECTADA: Dados não pertencem ao cliente atual!', {
      activeClient,
      fbClients: [...new Set(facebookAds.map(row => row.cliente_nome))],
      wppClients: [...new Set(whatsappLeads.map(row => row.cliente_nome))]
    });
  }

  console.log('🔄 DashboardContent: RENDER COM DADOS:', {
    activeClient: `"${activeClient}"`,
    activeTab,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    isLoading,
    hasData
  });

  console.log('=== DASHBOARD CONTENT RENDER ===');
  console.log('activeTab:', activeTab);
  console.log('activeClient:', `"${activeClient}"`);
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
    console.log('📅 DASHBOARD: Mudando período para cliente:', `"${activeClient}"`, {
      from: newRange.from.toISOString().split('T')[0],
      to: newRange.to.toISOString().split('T')[0]
    });
    setDateRange(newRange);
  };

  const handleNavigateToProfile = (tab: string) => {
    setActiveTab(tab);
  };

  // Verificar se há dados para o período selecionado
  const hasDataForPeriod = facebookAds.length > 0 || whatsappLeads.length > 0;
  const showDataAlert = !isLoading && !hasDataForPeriod && activeTab === 'dashboard' && activeClient;

  // Mensagem específica baseada no cliente e dados disponíveis
  const getDataAlertMessage = () => {
    if (!activeClient) return '';
    
    if (activeClient === 'Simone Mendes') {
      return 'Dados de Simone Mendes estão disponíveis principalmente em julho de 2025. Ajuste o período para visualizar os dados.';
    } else if (activeClient === 'Hospital do Cabelo') {
      return 'Dados do Hospital do Cabelo estão disponíveis principalmente em junho de 2025. Ajuste o período para visualizar os dados.';
    }
    
    return `Sem dados para ${activeClient} no período selecionado. Tente ajustar as datas ou verificar se há dados disponíveis para este cliente.`;
  };

  if (isLoading) {
    console.log('📊 DASHBOARD: Renderizando loading state para cliente:', `"${activeClient}"`);
    return (
      <MainLayout 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  if (error) {
    console.log('📊 DASHBOARD: Renderizando error state para cliente:', `"${activeClient}"`, error);
    return (
      <MainLayout 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <Alert className="bg-red-900/20 border-red-500/50 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro ao carregar dados para {activeClient}:</strong> {error}
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  console.log('📊 DASHBOARD: Renderizando dashboard normal para cliente:', `"${activeClient}"`);

  return (
    <MainLayout 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      onNavigateToProfile={handleNavigateToProfile}
    >
      {showDataAlert && (
        <Alert className="mb-4 bg-blue-900/20 border-blue-500/50 text-blue-400">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {getDataAlertMessage()}
          </AlertDescription>
        </Alert>
      )}
      
      <TabContent
        activeTab={activeTab}
        hasData={hasData}
        activeClient={activeClient}
        dateRange={dateRange}
        facebookAds={facebookAds}
        whatsappLeads={whatsappLeads}
        handleDateRangeChange={handleDateRangeChange}
      />
    </MainLayout>
  );
};
