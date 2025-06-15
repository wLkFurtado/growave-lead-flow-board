
import { useState, useEffect } from 'react';
import { useActiveClient } from './useActiveClient';
import { UseClientDataOptions, ClientDataResult } from '@/types/clientData';
import { getEffectiveDateRange } from '@/utils/dateRangeUtils';
import { fetchFacebookAds, fetchWhatsappLeads } from '@/services/clientDataService';

export const useClientData = (options: UseClientDataOptions = {}): ClientDataResult => {
  const { dateRange, skipDateFilter = false } = options;
  const { activeClient, isLoading: clientLoading, error: clientError } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 useClientData: Estado atual', {
    activeClient: `"${activeClient}"`,
    clientLoading,
    clientError,
    isLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (clientLoading) {
        console.log('⏳ useClientData: Cliente carregando...');
        return;
      }

      if (clientError) {
        console.log('❌ useClientData: Erro no cliente:', clientError);
        if (mounted) {
          setError(clientError);
          setIsLoading(false);
        }
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

      console.log('🔄 useClientData: Buscando dados para:', `"${activeClient}"`);
      setIsLoading(true);
      setError(null);
      
      try {
        const effectiveDateRange = getEffectiveDateRange(dateRange, skipDateFilter);
        
        console.log('📅 useClientData: Range de data:', effectiveDateRange ? 'Com filtro' : 'Sem filtro');

        const [fbResponse, wppResponse] = await Promise.all([
          fetchFacebookAds(activeClient, effectiveDateRange),
          fetchWhatsappLeads(activeClient, effectiveDateRange)
        ]);

        console.log('📊 useClientData: Resultados:', {
          cliente: `"${activeClient}"`,
          fbCount: fbResponse.data?.length || 0,
          wppCount: wppResponse.data?.length || 0,
          fbError: fbResponse.error,
          wppError: wppResponse.error
        });

        if (mounted) {
          setFacebookAds(fbResponse.data || []);
          setWhatsappLeads(wppResponse.data || []);
          setError(null);
          setIsLoading(false);
        }
        
      } catch (error: any) {
        console.error('❌ useClientData: Erro:', error);
        if (mounted) {
          setError(error.message || 'Erro ao carregar dados');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [activeClient, clientLoading, clientError, dateRange, skipDateFilter]);

  const hasData = facebookAds.length > 0 || whatsappLeads.length > 0;

  return {
    facebookAds,
    whatsappLeads,
    isLoading: isLoading || clientLoading,
    error: error || clientError,
    activeClient,
    hasData
  };
};
