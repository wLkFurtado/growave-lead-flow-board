
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';
import { subMonths } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface UseClientDataOptions {
  dateRange?: DateRange;
  skipDateFilter?: boolean;
}

export const useClientData = (options: UseClientDataOptions = {}) => {
  const { dateRange, skipDateFilter = false } = options;
  const { activeClient, isLoading: clientLoading } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedClient, setLastFetchedClient] = useState<string>('');

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient: `"${activeClient}"`,
    clientLoading,
    dateRange,
    skipDateFilter,
    lastFetchedClient
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (clientLoading) {
        console.log('⏳ useClientData: Cliente carregando...');
        return;
      }

      if (!activeClient || activeClient.trim() === '') {
        console.log('⚠️ useClientData: Nenhum cliente ativo ou cliente vazio');
        if (mounted) {
          setFacebookAds([]);
          setWhatsappLeads([]);
          setError(null);
          setIsLoading(false);
          setLastFetchedClient('');
        }
        return;
      }

      // Evitar refetch desnecessário para o mesmo cliente
      if (activeClient === lastFetchedClient && !skipDateFilter && dateRange) {
        console.log('📊 useClientData: Mesma consulta, pulando refetch');
        return;
      }
      
      console.log('🔄 useClientData: Buscando dados para cliente:', `"${activeClient}"`);
      setIsLoading(true);
      setError(null);
      
      try {
        // Usar período mais amplo por padrão se não especificado
        let effectiveDateRange = dateRange;
        if (!skipDateFilter && !dateRange) {
          effectiveDateRange = {
            from: subMonths(new Date(), 12), // 12 meses por padrão
            to: new Date()
          };
        }

        // Buscar dados do Facebook Ads
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data', { ascending: false });
          
        // Buscar dados do WhatsApp
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient)
          .not('telefone', 'is', null)
          .neq('telefone', '')
          .order('data_criacao', { ascending: false });

        // Aplicar filtro de data se necessário
        if (!skipDateFilter && effectiveDateRange) {
          const fromDate = effectiveDateRange.from.toISOString().split('T')[0];
          const toDate = effectiveDateRange.to.toISOString().split('T')[0];
          
          console.log('🔄 useClientData: Aplicando filtro de data:', fromDate, 'até', toDate);
          
          fbQuery = fbQuery.gte('data', fromDate).lte('data', toDate);
          wppQuery = wppQuery.gte('data_criacao', fromDate).lte('data_criacao', toDate);
        } else {
          console.log('📅 useClientData: Buscando TODOS os dados (sem filtro de data)');
        }

        console.log('🔄 useClientData: Executando queries para:', `"${activeClient}"`);
        
        // Executar queries com retry
        let fbResponse, wppResponse;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            [fbResponse, wppResponse] = await Promise.all([fbQuery, wppQuery]);
            break;
          } catch (queryError) {
            retryCount++;
            console.log(`⚠️ useClientData: Tentativa ${retryCount} falhou:`, queryError);
            if (retryCount >= maxRetries) throw queryError;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        console.log('📊 useClientData: Resultados das queries:', {
          cliente: `"${activeClient}"`,
          fbCount: fbResponse.data?.length || 0,
          wppCount: wppResponse.data?.length || 0,
          fbError: fbResponse.error,
          wppError: wppResponse.error,
          dateFilter: !skipDateFilter && effectiveDateRange ? 'Aplicado' : 'Sem filtro',
          fbSample: fbResponse.data?.slice(0, 2).map(row => ({ 
            cliente: row.cliente_nome, 
            campanha: row.campanha, 
            data: row.data 
          })),
          wppSample: wppResponse.data?.slice(0, 2).map(row => ({ 
            cliente: row.cliente_nome, 
            nome: row.nome, 
            telefone: row.telefone,
            data: row.data_criacao 
          }))
        });

        if (fbResponse.error) {
          console.error('❌ useClientData: Erro FB:', fbResponse.error);
          throw new Error(`Erro Facebook: ${fbResponse.error.message}`);
        }
        
        if (wppResponse.error) {
          console.error('❌ useClientData: Erro WPP:', wppResponse.error);
          throw new Error(`Erro WhatsApp: ${wppResponse.error.message}`);
        }

        if (mounted) {
          const fbData = fbResponse.data || [];
          const wppData = wppResponse.data || [];
          
          console.log('✅ useClientData: Definindo dados FINAIS:', {
            cliente: `"${activeClient}"`,
            fbCount: fbData.length,
            wppCount: wppData.length,
            wppWithPhoneCount: wppData.filter(lead => lead.telefone && lead.telefone.trim() !== '').length,
            skipDateFilter
          });
          
          setFacebookAds(fbData);
          setWhatsappLeads(wppData);
          setError(null);
          setLastFetchedClient(activeClient);
        }
        
      } catch (error: any) {
        console.error('❌ useClientData: Erro fatal:', error);
        if (mounted) {
          setError(error.message || 'Erro ao carregar dados');
          setFacebookAds([]);
          setWhatsappLeads([]);
        }
      } finally {
        if (mounted) {
          console.log('✅ useClientData: Finalizando loading');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      console.log('🧹 useClientData: Cleanup');
      mounted = false;
    };
  }, [activeClient, clientLoading, dateRange, skipDateFilter]);

  // Melhorar o cálculo de hasData
  const hasData = facebookAds.length > 0 || whatsappLeads.length > 0;

  console.log('📊 useClientData: Estado final:', {
    activeClient: `"${activeClient}"`,
    isLoading: isLoading || clientLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    hasData,
    error,
    skipDateFilter,
    lastFetchedClient
  });

  return {
    facebookAds,
    whatsappLeads,
    isLoading: isLoading || clientLoading,
    error,
    activeClient,
    hasData
  };
};
