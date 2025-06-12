
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

interface DateRange {
  from: Date;
  to: Date;
}

export const useClientData = (dateRange?: DateRange) => {
  const { activeClient, isLoading: clientLoading } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient,
    clientLoading,
    dateRange
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (clientLoading) {
        console.log('⏳ useClientData: Cliente carregando...');
        return;
      }

      if (!activeClient) {
        console.log('⚠️ useClientData: Nenhum cliente ativo');
        if (mounted) {
          setFacebookAds([]);
          setWhatsappLeads([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }
      
      console.log('🔄 useClientData: Buscando dados para cliente:', activeClient);
      setIsLoading(true);
      setError(null);
      
      try {
        // DIAGNÓSTICO COMPLETO: Buscar todos os clientes únicos primeiro
        console.log('🔍 DIAGNÓSTICO: Buscando todos os clientes únicos nas tabelas...');
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

        const uniqueFbClients = [...new Set(allFbClients.data?.map(row => row.cliente_nome))];
        const uniqueWppClients = [...new Set(allWppClients.data?.map(row => row.cliente_nome))];
        
        console.log('📊 DIAGNÓSTICO: Clientes únicos encontrados:', {
          fb: uniqueFbClients,
          wpp: uniqueWppClients,
          activeClient,
          fbMatch: uniqueFbClients.find(c => c?.toLowerCase() === activeClient.toLowerCase()),
          wppMatch: uniqueWppClients.find(c => c?.toLowerCase() === activeClient.toLowerCase())
        });

        // Buscar dados do Facebook Ads com busca case-insensitive
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .ilike('cliente_nome', activeClient)
          .order('data', { ascending: false });
          
        // Buscar dados do WhatsApp com busca case-insensitive
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .ilike('cliente_nome', activeClient)
          .order('data_criacao', { ascending: false });

        // Teste sem filtro de data primeiro
        console.log('🔄 useClientData: Buscando dados SEM filtro de data...');
        const [fbResponseNoFilter, wppResponseNoFilter] = await Promise.all([fbQuery, wppQuery]);

        console.log('📊 useClientData: Dados SEM filtro:', {
          fbCount: fbResponseNoFilter.data?.length || 0,
          wppCount: wppResponseNoFilter.data?.length || 0,
          fbError: fbResponseNoFilter.error,
          wppError: wppResponseNoFilter.error,
          wppSample: wppResponseNoFilter.data?.slice(0, 3)
        });

        // Agora aplicar filtro de data se fornecido
        if (dateRange) {
          const fromDate = dateRange.from.toISOString().split('T')[0];
          const toDate = dateRange.to.toISOString().split('T')[0];
          
          console.log('🔄 useClientData: Aplicando filtro de data:', fromDate, 'até', toDate);
          
          fbQuery = fbQuery.gte('data', fromDate).lte('data', toDate);
          wppQuery = wppQuery.gte('data_criacao', fromDate).lte('data_criacao', toDate);

          const [fbResponse, wppResponse] = await Promise.all([fbQuery, wppQuery]);

          console.log('📊 useClientData: Dados COM filtro de data:', {
            fbCount: fbResponse.data?.length || 0,
            wppCount: wppResponse.data?.length || 0,
            fbError: fbResponse.error,
            wppError: wppResponse.error,
            wppWithPhone: wppResponse.data?.filter(lead => lead.telefone && lead.telefone.trim() !== '').length || 0,
            wppSample: wppResponse.data?.slice(0, 3)
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
              fbCount: fbData.length,
              wppCount: wppData.length,
              wppWithPhoneCount: wppData.filter(lead => lead.telefone && lead.telefone.trim() !== '').length
            });
            
            setFacebookAds(fbData);
            setWhatsappLeads(wppData);
            setError(null);
          }
        } else {
          // Sem filtro de data
          console.log('📅 useClientData: Sem filtro de data - usando dados completos');
          if (mounted) {
            const fbData = fbResponseNoFilter.data || [];
            const wppData = wppResponseNoFilter.data || [];
            
            console.log('✅ useClientData: Definindo dados SEM FILTRO:', {
              fbCount: fbData.length,
              wppCount: wppData.length,
              wppWithPhoneCount: wppData.filter(lead => lead.telefone && lead.telefone.trim() !== '').length
            });
            
            setFacebookAds(fbData);
            setWhatsappLeads(wppData);
            setError(null);
          }
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
  }, [activeClient, clientLoading, dateRange]);

  const hasData = facebookAds.length > 0 || whatsappLeads.length > 0;

  console.log('📊 useClientData: Estado final:', {
    activeClient,
    isLoading: isLoading || clientLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    hasData,
    error
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
