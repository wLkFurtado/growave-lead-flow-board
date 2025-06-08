
import React, { useMemo } from 'react';
import { LeadCard } from './LeadCard';

interface LeadKanbanBoardProps {
  leadsData: any[];
}

export const LeadKanbanBoard = ({ leadsData }: LeadKanbanBoardProps) => {
  const categorizedLeads = useMemo(() => {
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

  const kanbanColumns = [
    {
      id: 'contacted',
      title: 'Entrou em Contato',
      leads: categorizedLeads.enteredContact,
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      headerColor: 'bg-blue-500'
    },
    {
      id: 'scheduled',
      title: 'Agendado',
      leads: categorizedLeads.scheduled,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-500/10',
      headerColor: 'bg-yellow-500'
    },
    {
      id: 'closed',
      title: 'Tratamento Fechado',
      leads: categorizedLeads.closedDeal,
      color: 'border-emerald-500',
      bgColor: 'bg-emerald-500/10',
      headerColor: 'bg-emerald-500'
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kanban da Jornada do Lead</h2>
        <div className="text-slate-400 text-sm">
          Total: {leadsData.filter(lead => lead.telefone).length} leads
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map(column => (
          <div
            key={column.id}
            className={`bg-slate-800/30 backdrop-blur-lg border ${column.color} rounded-xl overflow-hidden`}
          >
            <div className={`${column.headerColor} px-6 py-4`}>
              <h3 className="font-bold text-lg text-white text-center">
                {column.title}
              </h3>
              <p className="text-center text-white/80 text-sm mt-1">
                {column.leads.length} leads
              </p>
            </div>
            
            <div className={`${column.bgColor} p-4`}>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {column.leads.length > 0 ? (
                  column.leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">Nenhum lead nesta etapa</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
