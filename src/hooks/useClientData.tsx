
import { useState, useEffect } from 'react';
import { useActiveClient } from './useActiveClient';
import { UseClientDataOptions, ClientDataResult } from '@/types/clientData';
import { getEffectiveDateRange } from '@/utils/dateRangeUtils';
import { fetchFacebookAds, fetchWhatsappLeads } from '@/services/clientDataService';

export const useClientData = (options: UseClientDataOptions = {}): ClientDataResult => {
  const { dateRange, skipDateFilter = false } = options;
  const { activeClient, isLoading: clientLoading } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient: `"${activeClient}"`,
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
        console.log('⚠️ useClientData: Nenhum cliente ativo');
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
        const effectiveDateRange = getEffectiveDateRange(dateRange, skipDateFilter);

        if (effectiveDateRange) {
          console.log('📅 useClientData: Aplicando filtro de data:', 
            effectiveDateRange.from.toISOString().split('T')[0], 
            'até', 
            effectiveDateRange.to.toISOString().split('T')[0]
          );
        } else {
          console.log('📅 useClientData: Buscando TODOS os dados (sem filtro de data)');
        }

        console.log('🔄 useClientData: Executando queries para:', `"${activeClient}"`);
        
        const [fbResponse, wppResponse] = await Promise.all([
          fetchFacebookAds(activeClient, effectiveDateRange),
          fetchWhatsappLeads(activeClient, effectiveDateRange)
        ]);

        console.log('📊 useClientData: Resultados das queries:', {
          cliente: `"${activeClient}"`,
          fbCount: fbResponse.data?.length || 0,
          wppCount: wppResponse.data?.length || 0,
          fbError: fbResponse.error,
          wppError: wppResponse.error
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
          
          console.log('✅ useClientData: Dados carregados com sucesso:', {
            cliente: `"${activeClient}"`,
            fbCount: fbData.length,
            wppCount: wppData.length
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
