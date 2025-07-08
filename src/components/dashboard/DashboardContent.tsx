import React, { useState } from 'react';
import { MainLayout } from './MainLayout';
import { TabContent } from './TabContent';
import { DashboardSkeleton } from './LoadingStates';
import { useClientData } from '../../hooks/useClientData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

export const DashboardContent = () => {
  console.log('🔄 DashboardContent: Iniciando componente');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);
  
  // Usar um único hook - sempre sem filtro para garantir que carregue dados
  const clientData = useClientData({ 
    skipDateFilter: true  // SEMPRE sem filtro para garantir dados
  });

  const { facebookAds, whatsappLeads, isLoading, error, activeClient, hasData } = clientData;
  
  console.log('🔄 DashboardContent: Estado atual', {
    activeClient: `"${activeClient}"`,
    activeTab,
    fbCount: facebookAds?.length || 0,
    wppCount: whatsappLeads?.length || 0,
    isLoading,
    hasData,
    error
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    console.log('📅 DASHBOARD: Mudando período para cliente:', `"${activeClient}"`, {
      from: newRange.from.toISOString().split('T')[0],
      to: newRange.to.toISOString().split('T')[0]
    });
    setCustomDateRange(newRange);
  };

  const handleNavigateToProfile = (tab: string) => {
    setActiveTab(tab);
  };

  // Se está carregando, mostrar loading
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

  // Se há erro, mostrar erro
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

  console.log('📊 DASHBOARD: Renderizando dashboard normal:', {
    activeClient,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length
  });

  return (
    <MainLayout 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      onNavigateToProfile={handleNavigateToProfile}
    >
      <TabContent
        activeTab={activeTab}
        hasData={hasData}
        activeClient={activeClient}
        dateRange={customDateRange}
        facebookAds={facebookAds}
        whatsappLeads={whatsappLeads}
        handleDateRangeChange={handleDateRangeChange}
      />
    </MainLayout>
  );
};