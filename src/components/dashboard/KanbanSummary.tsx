
import React, { useMemo } from 'react';

interface KanbanSummaryProps {
  leadsData: any[];
}

export const KanbanSummary = ({ leadsData }: KanbanSummaryProps) => {
  const { enteredContact, scheduled, closedDeal } = useMemo(() => {
    const enteredContact = leadsData.filter(lead =>
      lead.telefone && !lead.valor_venda && lead.status !== 'Agendado'
    );
    const scheduled = leadsData.filter(lead =>
      lead.telefone && !lead.valor_venda && lead.status === 'Agendado'
    );
    const closedDeal = leadsData.filter(lead =>
      lead.telefone && lead.valor_venda
    );
    return { enteredContact, scheduled, closedDeal };
  }, [leadsData]);

  return (
    <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Resumo da Jornada do Lead</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">{enteredContact.length}</span>
          </div>
          <p className="text-blue-400 font-medium">Entrou em Contato</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">{scheduled.length}</span>
          </div>
          <p className="text-yellow-400 font-medium">Agendado</p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">{closedDeal.length}</span>
          </div>
          <p className="text-emerald-400 font-medium">Tratamento Fechado</p>
        </div>
      </div>
    </div>
  );
};
