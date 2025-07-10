import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/types/common';

interface UseWhatsAppLeadsQueryOptions {
  activeClient: string;
  dateRange?: DateRange;
  skipDateFilter?: boolean;
  enabled?: boolean;
}

export const useWhatsAppLeadsQuery = ({ 
  activeClient, 
  dateRange, 
  skipDateFilter = false, 
  enabled = true 
}: UseWhatsAppLeadsQueryOptions) => {
  
  return useQuery({
    queryKey: [
      'whatsapp-leads', 
      activeClient, 
      skipDateFilter ? 'no-date-filter' : dateRange?.from?.toISOString(), 
      skipDateFilter ? 'no-date-filter' : dateRange?.to?.toISOString()
    ],
    queryFn: async () => {
      if (!activeClient || activeClient.trim() === '') {
        console.log('🔄 useWhatsAppLeadsQuery: Cliente vazio, retornando array vazio');
        return [];
      }

      console.log('🔄 useWhatsAppLeadsQuery: Buscando dados WA para:', activeClient);

      let query = supabase
        .from('whatsapp_anuncio')
        .select('*')
        .eq('cliente_nome', activeClient)
        .order('data_criacao', { ascending: false });

      // Apply date filter if needed
      if (!skipDateFilter && dateRange) {
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
        
        console.log('📅 useWhatsAppLeadsQuery: Aplicando filtro de data:', {
          from: fromDate,
          to: toDate,
          cliente: activeClient
        });
        
        query = query.gte('data_criacao', fromDate).lte('data_criacao', toDate);
      }

      const { data: waData, error: waError } = await query;

      if (waError) {
        console.error('❌ useWhatsAppLeadsQuery: Erro:', waError);
        throw new Error(`Erro WhatsApp: ${waError.message}`);
      }

      const validatedData = waData || [];
      
      // Security validation - ensure data belongs to correct client
      const invalidData = validatedData.filter(row => row.cliente_nome !== activeClient);
      if (invalidData.length > 0) {
        console.error('🚨 VAZAMENTO DE DADOS WA DETECTADO:', {
          invalidCount: invalidData.length,
          expectedClient: activeClient
        });
        throw new Error('Erro de segurança: dados de outros clientes detectados');
      }

      console.log('✅ useWhatsAppLeadsQuery: Dados WA validados:', {
        cliente: activeClient,
        total: validatedData.length,
        comContato: validatedData.filter(row => row.telefone).length
      });

      return validatedData;
    },
    enabled: enabled && !!activeClient && activeClient.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (era cacheTime)
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Não tentar novamente em caso de erro de segurança
      if (error.message.includes('segurança')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};