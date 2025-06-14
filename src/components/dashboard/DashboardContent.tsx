
import React, { useState } from 'react';
import { subDays } from 'date-fns';
import { MainLayout } from './MainLayout';
import { TabContent } from './TabContent';
import { DashboardSkeleton } from './LoadingStates';
import { useClientData } from '../../hooks/useClientData';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

export const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  
  const { facebookAds, whatsappLeads, isLoading, error, activeClient, hasData } = useClientData(dateRange);

  console.log('=== DASHBOARD CONTENT RENDER ===');
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
    console.log('📅 DASHBOARD: Mudando período:', {
      from: newRange.from.toISOString().split('T')[0],
      to: newRange.to.toISOString().split('T')[0]
    });
    setDateRange(newRange);
  };

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
    >
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
