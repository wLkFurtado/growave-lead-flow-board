import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { LeadCard } from './LeadCard';
import { DraggableLeadCard } from './DraggableLeadCard';
import { DroppableColumn } from './DroppableColumn';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, PhoneOff, Info } from 'lucide-react';
import { LeadPipelineService, PipelineStatus } from '@/services/LeadPipelineService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { SaleModal } from './SaleModal';

interface LeadKanbanBoardProps {
  leadsData: any[];
}

type ColumnId = 'contacted' | 'scheduled' | 'closed';

const statusForColumn = (col: ColumnId): PipelineStatus =>
  col === 'scheduled' ? 'Agendado' : col === 'closed' ? 'Tratamento Fechado' : null;

const getColumnIdForLead = (lead: any): ColumnId => {
  if (lead?.telefone && lead?.valor_venda) return 'closed';
  if (lead?.telefone && lead?.status === 'Agendado') return 'scheduled';
  return 'contacted';
};

export const LeadKanbanBoard = ({ leadsData }: LeadKanbanBoardProps) => {
  const { isAdmin, profile } = useAuth();
  const canMoveCards = !!profile;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Mantém estado local para refletir atualizações instantaneamente
  const [localLeads, setLocalLeads] = useState<any[]>(leadsData || []);
  useEffect(() => {
    setLocalLeads(leadsData || []);
  }, [leadsData]);

  // Controle do modal de venda
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [pendingLead, setPendingLead] = useState<any | null>(null);

  const leadsWithPhone = useMemo(
    () => (localLeads || []).filter(lead => lead.telefone && String(lead.telefone).trim() !== ''),
    [localLeads]
  );
  const leadsWithoutPhone = useMemo(
    () => (localLeads || []).filter(lead => !lead.telefone || String(lead.telefone).trim() === ''),
    [localLeads]
  );

  const categorizedLeads = useMemo(() => {
    const enteredContact = leadsWithPhone.filter(lead => !lead.valor_venda && lead.status !== 'Agendado');
    const scheduled = leadsWithPhone.filter(lead => !lead.valor_venda && lead.status === 'Agendado');
    const closedDeal = leadsWithPhone.filter(lead => lead.valor_venda);
    return { enteredContact, scheduled, closedDeal, leadsWithoutPhone };
  }, [leadsWithPhone, leadsWithoutPhone]);

  const kanbanColumns = [
    {
      id: 'contacted' as ColumnId,
      title: 'Entrou em Contato',
      leads: categorizedLeads.enteredContact,
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      headerColor: 'bg-blue-500'
    },
    {
      id: 'scheduled' as ColumnId,
      title: 'Agendado',
      leads: categorizedLeads.scheduled,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-500/10',
      headerColor: 'bg-yellow-500'
    },
    {
      id: 'closed' as ColumnId,
      title: 'Tratamento Fechado',
      leads: categorizedLeads.closedDeal,
      color: 'border-emerald-500',
      bgColor: 'bg-emerald-500/10',
      headerColor: 'bg-emerald-500'
    },
  ];

  const totalLeadsWithPhone = leadsWithPhone.length;

  const validateStatusChange = (from: ColumnId, to: ColumnId) => {
    // Exemplo de regra: não pode ir direto para "Tratamento Fechado" se não estava "Agendado"
    if (from !== 'scheduled' && to === 'closed') {
      return { valid: false, message: 'Lead deve ser agendado antes de fechar.' };
    }
    return { valid: true };
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (!canMoveCards) {
      toast({ title: 'Sem permissão', description: 'Você não pode mover cards do pipeline.', variant: 'destructive' as any });
      return;
    }

    const lead = leadsWithPhone.find(l => {
      const identity = (l.contact_id && String(l.contact_id)) || String(l.telefone);
      return identity === String(active.id);
    });

    if (!lead) return;

    const fromCol = getColumnIdForLead(lead);
    const toCol = over.id as ColumnId;

    if (fromCol === toCol) return;

    const validation = validateStatusChange(fromCol, toCol);
    if (!validation.valid) {
      toast({ title: 'Movimentação inválida', description: validation.message, variant: 'destructive' as any });
      return;
    }

    // Se for fechar, abrir modal para capturar valor
    if (toCol === 'closed') {
      setPendingLead(lead);
      setSaleModalOpen(true);
      return;
    }

    // Caso normal: atualizar status
    const contactId: string | undefined = lead.contact_id || null;
    if (!contactId) {
      toast({ title: 'Contato sem ID', description: 'Não foi possível identificar o contato para atualizar o status.', variant: 'destructive' as any });
      return;
    }

    const newStatus = statusForColumn(toCol);
    try {
      await LeadPipelineService.updateLeadStatus(contactId, newStatus);

      // Atualiza no estado local
      setLocalLeads(prev =>
        prev.map(item =>
          item.contact_id === contactId
            ? { ...item, status: newStatus }
            : item
        )
      );
      toast({ title: 'Status atualizado', description: `Lead movido para "${toCol === 'scheduled' ? 'Agendado' : 'Entrou em Contato'}".` });
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message || 'Tente novamente mais tarde.', variant: 'destructive' as any });
    }
  };

  const handleConfirmSale = async (payload: { valorVenda: number; dataFechamento?: Date | null; observacoes?: string | null }) => {
    if (!pendingLead) return;
    const contactId: string | undefined = pendingLead.contact_id || null;
    if (!contactId) {
      toast({ title: 'Contato sem ID', description: 'Não foi possível identificar o contato para registrar a venda.', variant: 'destructive' as any });
      setSaleModalOpen(false);
      setPendingLead(null);
      return;
    }

    try {
      await LeadPipelineService.closeSale({
        contactId,
        valorVenda: payload.valorVenda,
        dataFechamento: payload.dataFechamento || null,
        observacoes: payload.observacoes || null
      });

      setLocalLeads(prev =>
        prev.map(item =>
          item.contact_id === contactId
            ? { ...item, status: 'Tratamento Fechado', valor_venda: payload.valorVenda }
            : item
        )
      );
      toast({ title: 'Venda registrada', description: 'O lead foi movido para "Tratamento Fechado".' });
    } catch (err: any) {
      toast({ title: 'Erro ao registrar venda', description: err.message || 'Tente novamente.', variant: 'destructive' as any });
    } finally {
      setSaleModalOpen(false);
      setPendingLead(null);
    }
  };

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
          <div>Total: {localLeads.length} leads</div>
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {kanbanColumns.map(column => (
            <DroppableColumn key={column.id} droppableId={column.id} className={`bg-slate-800/30 backdrop-blur-lg border ${column.color} rounded-xl overflow-hidden`}>
              <div className={`${column.headerColor} px-6 py-4`}>
                <h3 className="font-bold text-lg text-white text-center">{column.title}</h3>
                <p className="text-center text-white/80 text-sm mt-1">{column.leads.length} leads</p>
              </div>

              <div className={`${column.bgColor} p-4`}>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {column.leads.length > 0 ? (
                    column.leads.map(lead => {
                      const dragId = (lead.contact_id && String(lead.contact_id)) || String(lead.telefone);
                      return (
                        <DraggableLeadCard
                          key={dragId}
                          dragId={dragId}
                          lead={lead}
                          disabled={!canMoveCards}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">Nenhum lead nesta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            </DroppableColumn>
          ))}
        </div>
      </DndContext>

      <SaleModal
        open={saleModalOpen}
        leadName={pendingLead?.nome}
        onConfirm={handleConfirmSale}
        onCancel={() => {
          setSaleModalOpen(false);
          setPendingLead(null);
        }}
      />
    </section>
  );
};

