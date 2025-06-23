
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
  // Ajustar período padrão para junho de 2025 onde há dados reais
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date('2025-06-01'),
    to: new Date('2025-06-30')
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
    console.log('📅 DASHBOARD: Mudando período:', {
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
  const showDataAlert = !isLoading && !hasDataForPeriod && activeTab === 'dashboard';

  if (isLoading) {
    console.log('📊 DASHBOARD: Renderizando loading state');
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
    console.log('📊 DASHBOARD: Renderizando error state:', error);
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
            <strong>Erro ao carregar dados:</strong> {error}
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  console.log('📊 DASHBOARD: Renderizando dashboard normal');

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
            <strong>Sem dados para o período selecionado.</strong> Tente selecionar junho de 2025 onde há dados disponíveis.
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
