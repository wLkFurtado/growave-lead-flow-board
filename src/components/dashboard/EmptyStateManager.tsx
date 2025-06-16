
import React from 'react';
import { Calendar, Database, Phone } from 'lucide-react';
import { EmptyState } from './LoadingStates';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmptyStateManagerProps {
  type: 'contacts-no-data' | 'contacts-no-client' | 'dashboard-no-data' | 'dashboard-no-client' | 'kanban-no-data' | 'kanban-no-client';
  activeClient?: string | null;
  dateRange?: { from: Date; to: Date };
  isAdmin?: boolean;
}

export const EmptyStateManager = ({ type, activeClient, dateRange, isAdmin }: EmptyStateManagerProps) => {
  switch (type) {
    case 'contacts-no-data':
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

    case 'contacts-no-client':
      return (
        <EmptyState
          title="Nenhum cliente selecionado"
          description="Selecione um cliente para visualizar todos os contatos com telefone."
        />
      );

    case 'dashboard-no-data':
      return (
        <div className="space-y-4">
          <Alert className="bg-amber-900/20 border-amber-500/50 text-amber-400">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong>Nenhum dado encontrado no período:</strong> {dateRange?.from.toISOString().split('T')[0]} até {dateRange?.to.toISOString().split('T')[0]}
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

    case 'dashboard-no-client':
      return (
        <EmptyState
          title="Nenhum cliente selecionado"
          description="Selecione um cliente para visualizar os dados de marketing."
        />
      );

    case 'kanban-no-data':
      return (
        <EmptyState
          title="Nenhum lead encontrado"
          description={`Não há leads disponíveis para o cliente "${activeClient}" no período selecionado. Tente ampliar o período de busca.`}
        />
      );

    case 'kanban-no-client':
      return (
        <EmptyState
          title="Nenhum cliente selecionado"
          description="Selecione um cliente para visualizar os leads."
        />
      );

    default:
      return null;
  }
};
