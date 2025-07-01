
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
    userId: profile?.id,
    dateRange: dateRange ? {
      from: dateRange.from.toISOString().split('T')[0],
      to: dateRange.to?.toISOString().split('T')[0]
    } : 'sem filtro'
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (clientLoading || !profile) {
        console.log('⏳ useClientData: Aguardando cliente ou sem perfil');
        return;
      }

      if (!activeClient || activeClient.trim() === '') {
        console.log('⚠️ useClientData: Nenhum cliente ativo - limpando dados');
        if (mounted) {
          setFacebookAds([]);
          setWhatsappLeads([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }
      
      console.log('🚀 useClientData: MUDANÇA DE CLIENTE DETECTADA - BUSCANDO DADOS PARA:', {
        cliente: `"${activeClient}"`,
        isAdmin,
        userId: profile.id,
        skipDateFilter,
        periodo: dateRange ? {
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to?.toISOString().split('T')[0]
        } : 'todos os dados'
      });
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Limpar dados anteriores imediatamente ao trocar de cliente
        setFacebookAds([]);
        setWhatsappLeads([]);

        // Período de data melhorado
        let effectiveDateRange = dateRange;
        if (!skipDateFilter && !dateRange) {
          // Usar junho de 2025 como padrão onde há dados
          effectiveDateRange = {
            from: new Date('2025-06-01'),
            to: new Date('2025-06-30')
          };
        }

        // Queries otimizadas com filtro por cliente_nome
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data', { ascending: false });
          
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient)
          .not('telefone', 'is', null)
          .neq('telefone', '')
          .order('data_criacao', { ascending: false });

        // Aplicar filtro de data com validação melhorada
        if (!skipDateFilter && effectiveDateRange) {
          const fromDate = effectiveDateRange.from.toISOString().split('T')[0];
          const toDate = (effectiveDateRange.to || effectiveDateRange.from).toISOString().split('T')[0];
          
          console.log('📅 useClientData: Aplicando filtro de data:', {
            from: fromDate,
            to: toDate,
            cliente: activeClient
          });
          
          fbQuery = fbQuery.gte('data', fromDate).lte('data', toDate);
          wppQuery = wppQuery.gte('data_criacao', fromDate).lte('data_criacao', toDate);
        }

        console.log('🔄 useClientData: Executando queries para cliente:', `"${activeClient}"`);

        // Executar queries com tratamento de erro melhorado
        const [fbResponse, wppResponse] = await Promise.all([fbQuery, wppQuery]);

        console.log('📊 useClientData: RESULTADOS PARA CLIENTE:', {
          cliente: `"${activeClient}"`,
          facebook: {
            count: fbResponse.data?.length || 0,
            error: fbResponse.error?.message || 'OK',
            sampleDate: fbResponse.data?.[0]?.data || 'N/A',
            sampleCampanha: fbResponse.data?.[0]?.campanha || 'N/A'
          },
          whatsapp: {
            count: wppResponse.data?.length || 0,
            error: wppResponse.error?.message || 'OK',
            sampleDate: wppResponse.data?.[0]?.data_criacao || 'N/A',
            sampleNome: wppResponse.data?.[0]?.nome || 'N/A'
          },
          filtros: {
            periodo: !skipDateFilter && effectiveDateRange ? {
              from: effectiveDateRange.from.toISOString().split('T')[0],
              to: effectiveDateRange.to?.toISOString().split('T')[0]
            } : 'sem filtro',
            isAdmin,
            userId: profile.id
          }
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
          
          // Validação de segurança - garantir que dados são do cliente correto
          const fbInvalidos = fbData.filter(row => row.cliente_nome !== activeClient);
          const wppInvalidos = wppData.filter(row => row.cliente_nome !== activeClient);
          
          if (fbInvalidos.length > 0 || wppInvalidos.length > 0) {
            console.error('🚨 VAZAMENTO DE DADOS DETECTADO:', {
              fbInvalidos: fbInvalidos.length,
              wppInvalidos: wppInvalidos.length,
              clienteEsperado: activeClient
            });
            throw new Error('Erro de segurança: dados de outros clientes detectados');
          }
          
          // Log de qualidade dos dados
          const fbComInvestimento = fbData.filter(row => row.investimento > 0);
          const wppComVenda = wppData.filter(row => row.valor_venda > 0);
          
          console.log('✅ useClientData: DADOS FINAIS VALIDADOS PARA CLIENTE:', `"${activeClient}"`, {
            facebook: {
              total: fbData.length,
              comInvestimento: fbComInvestimento.length,
              investimentoTotal: fbComInvestimento.reduce((sum, row) => sum + (row.investimento || 0), 0),
              campanhas: [...new Set(fbData.map(row => row.campanha))].slice(0, 3)
            },
            whatsapp: {
              total: wppData.length,
              comVenda: wppComVenda.length,
              faturamentoTotal: wppComVenda.reduce((sum, row) => sum + (row.valor_venda || 0), 0),
              statusDistribution: wppData.reduce((acc, row) => {
                acc[row.status || 'sem_status'] = (acc[row.status || 'sem_status'] || 0) + 1;
                return acc;
              }, {})
            },
            validacao: {
              todosDadosCorretos: fbInvalidos.length === 0 && wppInvalidos.length === 0,
              periodoFiltrado: !skipDateFilter
            }
          });
          
          setFacebookAds(fbData);
          setWhatsappLeads(wppData);
          setError(null);
        }
        
      } catch (error: any) {
        console.error('❌ useClientData: Erro fatal para cliente:', `"${activeClient}"`, error);
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

  console.log('📊 useClientData: Estado final para cliente:', `"${activeClient}"`, {
    isLoading: isLoading || clientLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    hasData,
    error,
    periodo: dateRange ? {
      from: dateRange.from.toISOString().split('T')[0],
      to: dateRange.to?.toISOString().split('T')[0]
    } : 'sem filtro'
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
