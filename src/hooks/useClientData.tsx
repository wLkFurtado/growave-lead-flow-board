
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

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

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient,
    clientLoading,
    dateRange,
    skipDateFilter
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
        }
        return;
      }
      
      console.log('🔄 useClientData: Buscando dados para cliente:', `"${activeClient}"`);
      setIsLoading(true);
      setError(null);
      
      try {
        // Primeiro, verificar exatamente quais clientes existem no banco
        console.log('🔍 DIAGNÓSTICO: Verificando clientes no banco...');
        const [allFbClients, allWppClients] = await Promise.all([
          supabase
            .from('facebook_ads')
            .select('cliente_nome')
            .not('cliente_nome', 'is', null),
          supabase
            .from('whatsapp_anuncio')
            .select('cliente_nome')
            .not('cliente_nome', 'is', null)
        ]);

        const uniqueFbClients = [...new Set(allFbClients.data?.map(row => row.cliente_nome).filter(Boolean))];
        const uniqueWppClients = [...new Set(allWppClients.data?.map(row => row.cliente_nome).filter(Boolean))];
        
        console.log('📊 DIAGNÓSTICO: Clientes únicos encontrados:', {
          fb: uniqueFbClients,
          wpp: uniqueWppClients,
          activeClient: `"${activeClient}"`,
          fbExactMatch: uniqueFbClients.find(c => c === activeClient),
          wppExactMatch: uniqueWppClients.find(c => c === activeClient)
        });

        // Buscar dados do Facebook Ads com busca exata primeiro, depois case-insensitive
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data', { ascending: false });
          
        // Buscar dados do WhatsApp com busca exata primeiro
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient)
          .not('telefone', 'is', null)
          .neq('telefone', '')
          .order('data_criacao', { ascending: false });

        // Aplicar filtro de data apenas se não for skipDateFilter e se dateRange for fornecido
        if (!skipDateFilter && dateRange) {
          const fromDate = dateRange.from.toISOString().split('T')[0];
          const toDate = dateRange.to.toISOString().split('T')[0];
          
          console.log('🔄 useClientData: Aplicando filtro de data:', fromDate, 'até', toDate);
          
          fbQuery = fbQuery.gte('data', fromDate).lte('data', toDate);
          wppQuery = wppQuery.gte('data_criacao', fromDate).lte('data_criacao', toDate);
        } else {
          console.log('📅 useClientData: Buscando TODOS os dados (sem filtro de data)');
        }

        console.log('🔄 useClientData: Executando queries para:', `"${activeClient}"`);
        const [fbResponse, wppResponse] = await Promise.all([fbQuery, wppQuery]);

        console.log('📊 useClientData: Resultados das queries:', {
          fbCount: fbResponse.data?.length || 0,
          wppCount: wppResponse.data?.length || 0,
          fbError: fbResponse.error,
          wppError: wppResponse.error,
          fbSample: fbResponse.data?.slice(0, 2).map(row => ({ 
            cliente: row.cliente_nome, 
            campanha: row.campanha, 
            data: row.data 
          })),
          wppSample: wppResponse.data?.slice(0, 2).map(row => ({ 
            cliente: row.cliente_nome, 
            nome: row.nome, 
            telefone: row.telefone 
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

  const hasData = facebookAds.length > 0 || whatsappLeads.length > 0;

  console.log('📊 useClientData: Estado final:', {
    activeClient: `"${activeClient}"`,
    isLoading: isLoading || clientLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    hasData,
    error,
    skipDateFilter
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
