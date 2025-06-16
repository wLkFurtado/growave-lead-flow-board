
import React from 'react';
import { MainLayout } from './MainLayout';
import { TabContent } from './TabContent';
import { DashboardSkeleton } from './LoadingStates';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  dateRange: DateRange;
  handleDateRangeChange: (range: DateRange) => void;
  handleNavigateToProfile: (tab: string) => void;
  facebookAds: any[];
  whatsappLeads: any[];
  isLoading: boolean;
  error: string | null;
  activeClient: string;
  hasData: boolean;
}

export const DashboardLayout = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  dateRange,
  handleDateRangeChange,
  handleNavigateToProfile,
  facebookAds,
  whatsappLeads,
  isLoading,
  error,
  activeClient,
  hasData
}: DashboardLayoutProps) => {
  if (isLoading) {
    console.log('📊 DASHBOARD LAYOUT: Renderizando loading state');
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
    console.log('📊 DASHBOARD LAYOUT: Renderizando error state:', error);
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

  console.log('📊 DASHBOARD LAYOUT: Renderizando dashboard normal');

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
        dateRange={dateRange}
        facebookAds={facebookAds}
        whatsappLeads={whatsappLeads}
        handleDateRangeChange={handleDateRangeChange}
      />
    </MainLayout>
  );
};
