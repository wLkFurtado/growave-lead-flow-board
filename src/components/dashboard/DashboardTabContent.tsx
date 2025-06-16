
import React from 'react';
import { Calendar } from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { AdAnalysisTable } from './AdAnalysisTable';
import { EmptyStateManager } from './EmptyStateManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../hooks/useAuth';

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardTabContentProps {
  hasAnyData: boolean;
  activeClient: string | null;
  facebookAds: any[];
  whatsappLeads: any[];
  dateRange: DateRange;
  handleDateRangeChange: (range: DateRange) => void;
}

export const DashboardTabContent = ({
  hasAnyData,
  activeClient,
  facebookAds,
  whatsappLeads,
  dateRange,
  handleDateRangeChange
}: DashboardTabContentProps) => {
  const { isAdmin } = useAuth();

  if (!hasAnyData && activeClient) {
    return (
      <EmptyStateManager
        type="dashboard-no-data"
        activeClient={activeClient}
        dateRange={dateRange}
        isAdmin={isAdmin}
      />
    );
  }

  if (!activeClient) {
    return <EmptyStateManager type="dashboard-no-client" />;
  }

  return (
    <>
      {!hasAnyData && (
        <Alert className="bg-blue-900/20 border-blue-500/50 text-blue-400 mb-6">
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Período selecionado sem dados.</strong> Ajuste o período acima para ver os dados do cliente "{activeClient}".
          </AlertDescription>
        </Alert>
      )}
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
  );
};
