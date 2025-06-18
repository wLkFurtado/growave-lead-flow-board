
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Database, Shield } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-client' | 'no-data' | 'admin-only';
  clientName?: string;
}

export const EmptyState = ({ type, clientName }: EmptyStateProps) => {
  const renderContent = () => {
    switch (type) {
      case 'no-client':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Building2 className="h-12 w-12 text-[#00FF88]" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">Nenhum cliente selecionado</h3>
              <p className="text-slate-400 mt-1">
                Selecione um cliente para visualizar os dados.
              </p>
            </div>
          </div>
        );
      
      case 'no-data':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Database className="h-12 w-12 text-[#00FF88]" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">Nenhum dado encontrado</h3>
              <p className="text-slate-400 mt-1">
                Não há dados disponíveis para {clientName} no período selecionado.
              </p>
            </div>
          </div>
        );
      
      case 'admin-only':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Shield className="h-12 w-12 text-red-400" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">Acesso Restrito</h3>
              <p className="text-slate-400 mt-1">
                Esta seção é exclusiva para administradores.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
