
import React, { useMemo } from 'react';
import { LeadCard } from './LeadCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, PhoneOff, Info } from 'lucide-react';

interface LeadKanbanBoardProps {
  leadsData: any[];
}

export const LeadKanbanBoard = ({ leadsData }: LeadKanbanBoardProps) => {
  const categorizedLeads = useMemo(() => {
    console.log('🔄 LeadKanbanBoard: Categorizando leads:', {
      totalLeads: leadsData.length,
      leadsWithPhone: leadsData.filter(lead => lead.telefone && lead.telefone.trim() !== '').length,
      leadsWithoutPhone: leadsData.filter(lead => !lead.telefone || lead.telefone.trim() === '').length
    });

    // Incluir TODOS os leads, mas separar por categoria
    const leadsWithPhone = leadsData.filter(lead => lead.telefone && lead.telefone.trim() !== '');
    const leadsWithoutPhone = leadsData.filter(lead => !lead.telefone || lead.telefone.trim() === '');

    const enteredContact = leadsWithPhone.filter(lead =>
      !lead.valor_venda && lead.status !== 'Agendado'
    );
    const scheduled = leadsWithPhone.filter(lead =>
      !lead.valor_venda && lead.status === 'Agendado'
    );
    const closedDeal = leadsWithPhone.filter(lead =>
      lead.valor_venda
    );

    console.log('📊 LeadKanbanBoard: Leads categorizados:', {
      enteredContact: enteredContact.length,
      scheduled: scheduled.length,
      closedDeal: closedDeal.length,
      withoutPhone: leadsWithoutPhone.length
    });

    return { enteredContact, scheduled, closedDeal, leadsWithoutPhone };
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

  const totalLeadsWithPhone = leadsData.filter(lead => lead.telefone && lead.telefone.trim() !== '').length;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kanban da Jornada do Lead</h2>
        <div className="text-slate-400 text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-400" />
            <span>Com telefone: {totalLeadsWithPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneOff className="w-4 h-4 text-red-400" />
            <span>Sem telefone: {categorizedLeads.leadsWithoutPhone.length}</span>
          </div>
          <div>Total: {leadsData.length} leads</div>
        </div>
      </div>

      {categorizedLeads.leadsWithoutPhone.length > 0 && (
        <Alert className="bg-amber-900/20 border-amber-500/50 text-amber-400">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{categorizedLeads.leadsWithoutPhone.length} leads sem telefone</strong> não aparecem no Kanban pois precisam de contato para avançar na jornada.
          </AlertDescription>
        </Alert>
      )}
      
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
                    <LeadCard key={lead.id || `${lead.nome}-${lead.telefone}`} lead={lead} />
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
