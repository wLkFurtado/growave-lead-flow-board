
import React from 'react';
import { Calendar, Database } from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { AdAnalysisTable } from './AdAnalysisTable';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { UserManagement } from './UserManagement';
import { EmptyState } from './LoadingStates';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DateRange {
  from: Date;
  to: Date;
}

interface TabContentProps {
  activeTab: string;
  hasData: boolean;
  activeClient: string | null;
  dateRange: DateRange;
  facebookAds: any[];
  whatsappLeads: any[];
  handleDateRangeChange: (range: DateRange) => void;
}

export const TabContent = ({
  activeTab,
  hasData,
  activeClient,
  dateRange,
  facebookAds,
  whatsappLeads,
  handleDateRangeChange
}: TabContentProps) => {
  const { isAdmin } = useAuth();

  if (activeTab === 'dashboard') {
    if (!hasData && activeClient) {
      return (
        <div className="space-y-4">
          <Alert className="bg-amber-900/20 border-amber-500/50 text-amber-400">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong>Nenhum dado encontrado no período:</strong> {dateRange.from.toISOString().split('T')[0]} até {dateRange.to.toISOString().split('T')[0]}
            </AlertDescription>
          </Alert>
          <EmptyState
            title="Experimente ampliar o período"
            description={`Tente selecionar um período maior ou diferente para ver os dados do cliente "${activeClient}". Os dados podem estar em meses anteriores ao período atual selecionado.`}
            action={
              <div className="text-sm text-slate-400 space-y-2">
                <div>
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Sugestão: Use o filtro de período acima para selecionar "Últimos 30 dias", "Este mês" ou "Mês passado"
                </div>
                {isAdmin && (
                  <div>
                    <Database className="inline-block w-4 h-4 mr-1" />
                    Como admin, você pode verificar a importação de dados no Supabase.
                  </div>
                )}
              </div>
            }
          />
        </div>
      );
    }

    if (!activeClient) {
      return (
        <EmptyState
          title="Nenhum cliente selecionado"
          description="Selecione um cliente para visualizar os dados de marketing."
        />
      );
    }

    return (
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
    );
  }

  if (activeTab === 'kanban') {
    if (!hasData && activeClient) {
      return (
        <EmptyState
          title="Nenhum lead encontrado"
          description={`Não há leads disponíveis para o cliente "${activeClient}" no período selecionado. Tente ampliar o período de busca.`}
        />
      );
    }

    if (!activeClient) {
      return (
        <EmptyState
          title="Nenhum cliente selecionado"
          description="Selecione um cliente para visualizar os leads."
        />
      );
    }

    return <LeadKanbanBoard leadsData={whatsappLeads} />;
  }

  if (activeTab === 'users') {
    if (!isAdmin) {
      return (
        <EmptyState
          title="Acesso Restrito"
          description="Apenas administradores podem acessar o gerenciamento de usuários."
        />
      );
    }

    return <UserManagement />;
  }

  return null;
};
