
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
  const [lastSuccessfulClient, setLastSuccessfulClient] = useState<string>('');

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient: `"${activeClient}"`,
    clientLoading,
    dateRange,
    skipDateFilter,
    lastSuccessfulClient: `"${lastSuccessfulClient}"`
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

      // Se é o mesmo cliente que já carregamos com sucesso, não recarregar
      if (activeClient === lastSuccessfulClient && facebookAds.length > 0 && whatsappLeads.length > 0) {
        console.log('✅ useClientData: Dados já carregados para:', `"${activeClient}"`);
        setIsLoading(false);
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

        // Processar erros individualmente para não bloquear tudo
        let fbData: any[] = [];
        let wppData: any[] = [];
        
        if (fbResponse.error) {
          console.error('❌ useClientData: Erro FB (continuando):', fbResponse.error);
        } else {
          fbData = fbResponse.data || [];
        }
        
        if (wppResponse.error) {
          console.error('❌ useClientData: Erro WPP (continuando):', wppResponse.error);
        } else {
          wppData = wppResponse.data || [];
        }

        if (mounted) {
          console.log('✅ useClientData: Dados carregados:', {
            cliente: `"${activeClient}"`,
            fbCount: fbData.length,
            wppCount: wppData.length
          });
          
          setFacebookAds(fbData);
          setWhatsappLeads(wppData);
          setLastSuccessfulClient(activeClient);
          setError(null);
        }
        
      } catch (error: any) {
        console.error('❌ useClientData: Erro fatal:', error);
        if (mounted) {
          setError(error.message || 'Erro ao carregar dados');
          // Não limpar os dados em caso de erro, manter os anteriores se existirem
          if (facebookAds.length === 0 && whatsappLeads.length === 0) {
            setFacebookAds([]);
            setWhatsappLeads([]);
          }
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
