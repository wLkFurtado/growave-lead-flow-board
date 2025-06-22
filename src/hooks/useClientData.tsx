
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';
import { useAuth } from './useAuth';
import { subMonths } from 'date-fns';
import { DateRange } from '@/types/common';

interface UseClientDataOptions {
  dateRange?: DateRange;
  skipDateFilter?: boolean;
}

export const useClientData = (options: UseClientDataOptions = {}) => {
  const { dateRange, skipDateFilter = false } = options;
  const { activeClient, isLoading: clientLoading } = useActiveClient();
  const { isAdmin, profile } = useAuth();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient: `"${activeClient}"`,
    clientLoading,
    isAdmin,
    userId: profile?.id
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (clientLoading || !profile) {
        console.log('⏳ useClientData: Aguardando cliente ou sem perfil');
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
      
      console.log('🚀 useClientData: BUSCANDO DADOS PARA:', {
        cliente: `"${activeClient}"`,
        isAdmin,
        userId: profile.id,
        skipDateFilter
      });
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Período de data
        let effectiveDateRange = dateRange;
        if (!skipDateFilter && !dateRange) {
          effectiveDateRange = {
            from: subMonths(new Date(), 12),
            to: new Date()
          };
        }

        // Queries com filtro por cliente_nome (RLS vai aplicar controle adicional)
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient) // FILTRO PRINCIPAL: só dados deste cliente
          .order('data', { ascending: false });
          
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient) // FILTRO PRINCIPAL: só dados deste cliente
          .not('telefone', 'is', null)
          .neq('telefone', '')
          .order('data_criacao', { ascending: false });

        // Aplicar filtro de data se necessário
        if (!skipDateFilter && effectiveDateRange) {
          const fromDate = effectiveDateRange.from.toISOString().split('T')[0];
          const toDate = (effectiveDateRange.to || effectiveDateRange.from).toISOString().split('T')[0];
          
          console.log('📅 useClientData: Aplicando filtro de data:', fromDate, 'até', toDate);
          
          fbQuery = fbQuery.gte('data', fromDate).lte('data', toDate);
          wppQuery = wppQuery.gte('data_criacao', fromDate).lte('data_criacao', toDate);
        }

        console.log('🔄 useClientData: Executando queries com RLS para:', {
          cliente: `"${activeClient}"`,
          isAdmin,
          aplicaFiltroData: !skipDateFilter && !!effectiveDateRange
        });

        // Executar queries (RLS vai garantir que só veja dados permitidos)
        const [fbResponse, wppResponse] = await Promise.all([fbQuery, wppQuery]);

        console.log('📊 useClientData: RESULTADOS DAS QUERIES:', {
          cliente: `"${activeClient}"`,
          fbCount: fbResponse.data?.length || 0,
          wppCount: wppResponse.data?.length || 0,
          fbError: fbResponse.error?.message || 'OK',
          wppError: wppResponse.error?.message || 'OK',
          isAdmin,
          userId: profile.id
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
          
          // VERIFICAÇÃO ADICIONAL: garantir que todos os dados são realmente do cliente correto
          const fbInvalidos = fbData.filter(row => row.cliente_nome !== activeClient);
          const wppInvalidos = wppData.filter(row => row.cliente_nome !== activeClient);
          
          if (fbInvalidos.length > 0 || wppInvalidos.length > 0) {
            console.error('🚨 VAZAMENTO DE DADOS DETECTADO:', {
              fbInvalidos: fbInvalidos.length,
              wppInvalidos: wppInvalidos.length,
              clienteEsperado: activeClient
            });
          }
          
          console.log('✅ useClientData: DADOS FINAIS DEFINIDOS:', {
            cliente: `"${activeClient}"`,
            fbCount: fbData.length,
            wppCount: wppData.length,
            todosDoClienteCorreto: fbInvalidos.length === 0 && wppInvalidos.length === 0
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
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [activeClient, clientLoading, dateRange, skipDateFilter, profile, isAdmin]);

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
