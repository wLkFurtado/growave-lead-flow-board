
import { supabase } from '@/integrations/supabase/client';

export type PipelineStatus = 'Agendado' | 'Tratamento Fechado' | null;

export const LeadPipelineService = {
  async updateLeadStatus(contactId: string, status: PipelineStatus) {
    console.log('🔄 LeadPipelineService.updateLeadStatus', { contactId, status });
    const { data, error } = await supabase
      .from('whatsapp_anuncio')
      .update({ status })
      .eq('contact_id', contactId)
      .select();

    if (error) {
      console.error('❌ updateLeadStatus error:', error);
      throw new Error(error.message);
    }
    return data;
  },

  async closeSale(params: {
    contactId: string;
    valorVenda: number;
    dataFechamento?: Date | null;
    observacoes?: string | null;
  }) {
    const { contactId, valorVenda, dataFechamento, observacoes } = params;
    console.log('💰 LeadPipelineService.closeSale', { contactId, valorVenda, dataFechamento, observacoes });

    // 1) Atualiza o lead como fechado com valor_venda
    const { error: updError } = await supabase
      .from('whatsapp_anuncio')
      .update({
        status: 'Tratamento Fechado',
        valor_venda: valorVenda,
      })
      .eq('contact_id', contactId);

    if (updError) {
      console.error('❌ closeSale update error:', updError);
      throw new Error(updError.message);
    }

    // 2) Registra no histórico (inclui data_fechamento e observações)
    const { error: histError } = await supabase
      .from('lead_status_history')
      .insert([{
        contact_id: contactId,
        status_anterior: 'Agendado',
        status_novo: 'Tratamento Fechado',
        valor_venda_anterior: null,
        valor_venda_novo: valorVenda,
        data_fechamento: dataFechamento ? new Date(dataFechamento) : null,
        observacoes: observacoes || null,
        // changed_by e changed_at são definidos via RLS/DEFAULTS e auth.uid() no trigger/policy
      }]);

    if (histError) {
      console.error('❌ closeSale history insert error:', histError);
      // Não desfaz o update, mas informa o erro do histórico
      throw new Error(`Venda registrada, mas houve erro ao salvar histórico: ${histError.message}`);
    }

    return true;
  }
};
