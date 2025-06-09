
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

interface DateRange {
  from: Date;
  to: Date;
}

export const useClientData = (dateRange?: DateRange) => {
  const { activeClient } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeClient) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('=== INÍCIO DA BUSCA ===');
        console.log('Cliente ativo:', activeClient);
        console.log('Período original:', dateRange);
        
        // Construir queries base
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient);
          
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient);

        // Aplicar filtro de data se fornecido
        if (dateRange) {
          // Garantir que as datas sejam no formato correto
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          
          // Ajustar a data final para o final do dia
          toDate.setHours(23, 59, 59, 999);
          
          // Converter para string no formato ISO e pegar apenas a parte da data
          const fromDateStr = fromDate.toISOString().split('T')[0];
          const toDateStr = toDate.toISOString().split('T')[0];
          
          console.log('Data FROM original:', dateRange.from);
          console.log('Data TO original:', dateRange.to);
          console.log('Data FROM formatada:', fromDateStr);
          console.log('Data TO formatada:', toDateStr);
          
          fbQuery = fbQuery
            .gte('data', fromDateStr)
            .lte('data', toDateStr);
            
          wppQuery = wppQuery
            .gte('data_criacao', fromDateStr)
            .lte('data_criacao', toDateStr);
            
          console.log('Filtros aplicados - FB: data >=', fromDateStr, 'AND data <=', toDateStr);
          console.log('Filtros aplicados - WPP: data_criacao >=', fromDateStr, 'AND data_criacao <=', toDateStr);
        } else {
          console.log('Nenhum filtro de data aplicado - buscando todos os dados');
        }

        console.log('Executando queries...');
        const [fbResponse, wppResponse] = await Promise.all([
          fbQuery,
          wppQuery
        ]);

        console.log('=== RESULTADOS DAS QUERIES ===');
        console.log('Facebook Response:', fbResponse);
        console.log('WhatsApp Response:', wppResponse);

        if (fbResponse.error) {
          console.error('Erro Facebook Ads:', fbResponse.error);
          throw fbResponse.error;
        }
        
        if (wppResponse.error) {
          console.error('Erro WhatsApp:', wppResponse.error);
          throw wppResponse.error;
        }

        const fbData = fbResponse.data || [];
        const wppData = wppResponse.data || [];

        console.log('Dados Facebook encontrados:', fbData.length, 'registros');
        console.log('Dados WhatsApp encontrados:', wppData.length, 'registros');
        
        if (fbData.length > 0) {
          console.log('Primeiro registro FB:', fbData[0]);
          console.log('Datas FB encontradas:', fbData.map(item => item.data));
        }
        
        if (wppData.length > 0) {
          console.log('Primeiro registro WPP:', wppData[0]);
          console.log('Datas WPP encontradas:', wppData.map(item => item.data_criacao));
        }

        // Se não há dados no período, vamos verificar se existem dados para este cliente
        if (dateRange && (fbData.length === 0 && wppData.length === 0)) {
          console.log('=== VERIFICANDO DADOS SEM FILTRO ===');
          
          const [fbAllResponse, wppAllResponse] = await Promise.all([
            supabase
              .from('facebook_ads')
              .select('data, cliente_nome')
              .eq('cliente_nome', activeClient)
              .limit(5),
            supabase
              .from('whatsapp_anuncio')
              .select('data_criacao, cliente_nome')
              .eq('cliente_nome', activeClient)
              .limit(5)
          ]);
          
          console.log('Dados FB sem filtro:', fbAllResponse.data);
          console.log('Dados WPP sem filtro:', wppAllResponse.data);
          
          if (fbAllResponse.data?.length || wppAllResponse.data?.length) {
            console.log('DIAGNÓSTICO: Existem dados para este cliente, mas não no período selecionado');
            if (fbAllResponse.data?.length) {
              console.log('Amostras de datas FB disponíveis:', fbAllResponse.data.map(item => item.data));
            }
            if (wppAllResponse.data?.length) {
              console.log('Amostras de datas WPP disponíveis:', wppAllResponse.data.map(item => item.data_criacao));
            }
          } else {
            console.log('DIAGNÓSTICO: Não existem dados para este cliente');
          }
        }

        console.log('=== DEFININDO ESTADO FINAL ===');
        setFacebookAds(fbData);
        setWhatsappLeads(wppData);
        
      } catch (error: any) {
        console.error('=== ERRO NA BUSCA ===');
        console.error('Erro completo:', error);
        setError(error.message || 'Erro ao carregar dados');
        setFacebookAds([]);
        setWhatsappLeads([]);
      } finally {
        setIsLoading(false);
        console.log('=== FIM DA BUSCA ===');
      }
    };

    fetchData();
  }, [activeClient, dateRange]);

  return {
    facebookAds,
    whatsappLeads,
    isLoading,
    error,
    activeClient,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0
  };
};
