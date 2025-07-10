import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from './MainLayout';
import { TabContent } from './TabContent';
import { DashboardSkeleton } from './LoadingStates';
import { DebugOverlay } from './DebugOverlay';
import { useClientDataQuery } from '@/hooks/data/useClientDataQuery';
import { useClientContext } from '@/contexts/ClientContext';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface DateRange {
  from: Date;
  to: Date;
}

export const DashboardContent = () => {
  const { isLoading: clientLoading } = useClientContext();
  const queryClient = useQueryClient();
  const isPageVisible = usePageVisibility();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Inicializar com período padrão (últimos 30 dias)
  const [customDateRange, setCustomDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      from: thirtyDaysAgo,
      to: today
    };
  });
  
  // Usar hook com filtro de data conectado
  const clientData = useClientDataQuery({ 
    dateRange: customDateRange,
    skipDateFilter: false
  });

  const { facebookAds, whatsappLeads, isLoading, error, activeClient, stats } = clientData;
  
  // ✅ Invalidar queries quando página volta a ficar visível (com throttle)
  const lastInvalidationRef = useRef<number>(0);
  
  useEffect(() => {
    if (isPageVisible && activeClient) {
      const now = Date.now();
      const timeSinceLastInvalidation = now - lastInvalidationRef.current;
      
      // ✅ Só invalidar se passou mais de 30 segundos
      if (timeSinceLastInvalidation > 30000) {
        console.log('🔄 Página visível - invalidando queries para cliente:', activeClient);
        
        queryClient.invalidateQueries({ 
          queryKey: ['facebook-ads', activeClient],
          refetchType: 'active'
        });
        queryClient.invalidateQueries({ 
          queryKey: ['whatsapp-leads', activeClient],
          refetchType: 'active'
        });
        
        lastInvalidationRef.current = now;
      }
    }
  }, [isPageVisible, activeClient, queryClient]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setCustomDateRange(newRange);
  };

  const handleNavigateToProfile = (tab: string) => {
    setActiveTab(tab);
  };

  // Se está carregando contexto do cliente ou dados, mostrar loading
  if (clientLoading || isLoading) {
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
        hasData={stats?.hasData || false}
        activeClient={activeClient}
        dateRange={customDateRange}
        facebookAds={facebookAds}
        whatsappLeads={whatsappLeads}
        handleDateRangeChange={handleDateRangeChange}
      />
      
      {/* ✅ Debug overlay temporário para monitoramento */}
      <DebugOverlay 
        activeClient={activeClient}
        isPageVisible={isPageVisible}
      />
    </MainLayout>
  );
};