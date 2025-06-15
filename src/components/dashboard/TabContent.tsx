
import React from 'react';
import { Calendar, Database, Phone } from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { AdAnalysisTable } from './AdAnalysisTable';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { ContactsTable } from './ContactsTable';
import { UserManagement } from './UserManagement';
import { MyProfile } from './MyProfile';
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

  // Calcular se temos dados, mesmo que fora do período atual
  const hasFacebookData = facebookAds.length > 0;
  const hasWhatsappData = whatsappLeads.length > 0;
  const hasAnyData = hasFacebookData || hasWhatsappData;

  console.log('=== TAB CONTENT DEBUG ===');
  console.log('activeTab:', activeTab);
  console.log('activeClient:', `"${activeClient}"`);
  console.log('hasData:', hasData);
  console.log('hasAnyData:', hasAnyData);
  console.log('facebookAds.length:', facebookAds.length);
  console.log('whatsappLeads.length:', whatsappLeads.length);
  console.log('dateRange:', {
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0]
  });

  if (activeTab === 'profile') {
    return <MyProfile />;
  }

  if (activeTab === 'contacts') {
    if (!hasWhatsappData && activeClient) {
      return (
        <div className="space-y-4">
          <EmptyState
            title="Nenhum contato com telefone encontrado"
            description={`Não foram encontrados contatos com telefone válido para o cliente "${activeClient}".`}
            action={
              <div className="text-sm text-slate-400 space-y-2">
                <div>
                  <Phone className="inline-block w-4 h-4 mr-1" />
                  Verifique se os dados foram importados corretamente no sistema.
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
          description="Selecione um cliente para visualizar todos os contatos com telefone."
        />
      );
    }

    return <ContactsTable contactsData={whatsappLeads} dateRange={dateRange} />;
  }

  if (activeTab === 'dashboard') {
    if (!hasAnyData && activeClient) {
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

    // Mostrar dashboard mesmo se não há dados no período atual, mas há dados no cliente
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
  }

  if (activeTab === 'kanban') {
    if (!hasWhatsappData && activeClient) {
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
