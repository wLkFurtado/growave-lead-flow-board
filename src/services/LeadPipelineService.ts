
import { supabase } from '@/integrations/supabase/client';

export type PipelineStatus = 'Agendado' | 'Tratamento Fechado' | null;

export const LeadPipelineService = {
  async updateLeadStatus(idTransacao: string, status: PipelineStatus) {
    console.log('🔄 LeadPipelineService.updateLeadStatus', { idTransacao, status });
    const { data, error } = await supabase
      .from('whatsapp_anuncio')
      .update({ status })
      .eq('id_transacao', idTransacao)
      .select();

    if (error) {
      console.error('❌ updateLeadStatus error:', error);
      throw new Error(error.message);
    }
    return data;
  },

  async closeSale(params: {
    idTransacao: string;
    valorVenda: number;
    dataFechamento?: Date | null;
    observacoes?: string | null;
  }) {
    const { idTransacao, valorVenda, dataFechamento, observacoes } = params;
    console.log('💰 LeadPipelineService.closeSale', { idTransacao, valorVenda, dataFechamento, observacoes });

    // 1) Atualiza o lead como fechado com valor_venda
    // Observação: o histórico será registrado automaticamente pela trigger do banco (trg_log_lead_status_change).
    const { error: updError } = await supabase
      .from('whatsapp_anuncio')
      .update({
        status: 'Tratamento Fechado',
        valor_venda: valorVenda,
      })
      .eq('id_transacao', idTransacao);

    if (updError) {
      console.error('❌ closeSale update error:', updError);
      throw new Error(updError.message);
    }

    // 2) Antes existia uma inserção manual em lead_status_history aqui.
    //    Removida para evitar erros de tipagem, pois os tipos gerados do Supabase ainda não incluem essa tabela.
    //    O log de histórico agora é responsabilidade da trigger criada no banco.

    return true;
  }
};
