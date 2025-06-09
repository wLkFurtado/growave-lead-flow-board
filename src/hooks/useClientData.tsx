
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
    dateRange: dateRange ? 'definido' : 'undefined'
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Se cliente ainda está carregando, aguardar
        if (clientLoading) {
          console.log('⏳ useClientData: Cliente carregando, aguardando...');
          
          const timeoutId = setTimeout(() => {
            console.log('⏰ useClientData: TIMEOUT aguardando cliente - finalizando');
            if (mounted) {
              setFacebookAds([]);
              setWhatsappLeads([]);
              setError(null);
              setIsLoading(false);
            }
          }, 10000);
          return () => clearTimeout(timeoutId);
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
        
        // Timeout aumentado para 15 segundos
        const queryPromise = async () => {
          let fbQuery = supabase
            .from('facebook_ads')
            .select('*')
            .eq('cliente_nome', activeClient)
            .order('data', { ascending: false });
            
          let wppQuery = supabase
            .from('whatsapp_anuncio')
            .select('*')
            .eq('cliente_nome', activeClient)
            .order('data_criacao', { ascending: false });

          if (dateRange) {
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            
            const fromDateStr = fromDate.toISOString().split('T')[0];
            const toDateStr = toDate.toISOString().split('T')[0];
            
            console.log('🔄 useClientData: Aplicando filtro de data:', fromDateStr, 'até', toDateStr);
            
            fbQuery = fbQuery.gte('data', fromDateStr).lte('data', toDateStr);
            wppQuery = wppQuery.gte('data_criacao', fromDateStr).lte('data_criacao', toDateStr);
          }

          return Promise.all([fbQuery, wppQuery]);
        };

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), 15000);
        });

        const [fbResponse, wppResponse] = await Promise.race([
          queryPromise(),
          timeoutPromise
        ]) as any;

        console.log('✅ useClientData: Dados obtidos:', {
          fb: fbResponse.data?.length || 0,
          wpp: wppResponse.data?.length || 0,
          fbError: !!fbResponse.error,
          wppError: !!wppResponse.error
        });

        if (fbResponse.error || wppResponse.error) {
          const errorMsg = `Erro ao carregar dados: ${fbResponse.error?.message || wppResponse.error?.message}`;
          console.error('❌ useClientData:', errorMsg);
          if (mounted) {
            setError(errorMsg);
            setFacebookAds([]);
            setWhatsappLeads([]);
          }
        } else {
          if (mounted) {
            setFacebookAds(fbResponse.data || []);
            setWhatsappLeads(wppResponse.data || []);
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

    // Timeout global aumentado para 25 segundos
    const globalTimeout = setTimeout(() => {
      console.log('⏰ useClientData: TIMEOUT GLOBAL - Forçando finalização');
      if (mounted) {
        setIsLoading(false);
        setError('Timeout na busca de dados');
      }
    }, 25000);

    fetchData();

    return () => {
      console.log('🧹 useClientData: Cleanup');
      mounted = false;
      clearTimeout(globalTimeout);
    };
  }, [activeClient, clientLoading, dateRange]);

  // Log do estado atual
  useEffect(() => {
    console.log('📊 useClientData: Estado atual:', {
      activeClient,
      isLoading: isLoading || clientLoading,
      hasData: facebookAds.length > 0 || whatsappLeads.length > 0,
      fbCount: facebookAds.length,
      wppCount: whatsappLeads.length,
      error
    });
  }, [activeClient, isLoading, clientLoading, facebookAds, whatsappLeads, error]);

  return {
    facebookAds,
    whatsappLeads,
    isLoading: isLoading || clientLoading,
    error,
    activeClient,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0
  };
};
