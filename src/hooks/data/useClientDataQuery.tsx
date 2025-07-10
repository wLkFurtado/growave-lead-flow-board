import { useClientContext } from '@/contexts/ClientContext';
import { useAuth } from '@/hooks/useAuth';
import { useFacebookAdsQuery } from './useFacebookAdsQuery';
import { useWhatsAppLeadsQuery } from './useWhatsAppLeadsQuery';
import { useDataValidation } from './useDataValidation';
import { DateRange } from '@/types/common';

interface UseClientDataQueryOptions {
  dateRange?: DateRange;
  skipDateFilter?: boolean;
}

export const useClientDataQuery = (options: UseClientDataQueryOptions = {}) => {
  const { activeClient } = useClientContext();
  const { profile: userProfile } = useAuth();
  
  const { dateRange, skipDateFilter = false } = options;

  // Facebook Ads Query
  const facebookQuery = useFacebookAdsQuery({
    activeClient,
    dateRange,
    skipDateFilter,
    enabled: !!userProfile && !!activeClient
  });

  // WhatsApp Leads Query
  const whatsappQuery = useWhatsAppLeadsQuery({
    activeClient,
    dateRange,
    skipDateFilter,
    enabled: !!userProfile && !!activeClient
  });

  // Dados para validação
  const facebookAds = facebookQuery.data || [];
  const whatsappLeads = whatsappQuery.data || [];

  // Validação dos dados
  const validation = useDataValidation(facebookAds, whatsappLeads, activeClient);

  // Estados combinados
  const isLoading = facebookQuery.isLoading || whatsappQuery.isLoading;
  const error = facebookQuery.error || whatsappQuery.error;

  // Debug apenas em desenvolvimento
  if (import.meta.env.DEV && false) { // Desabilitado
    console.log('🔄 useClientDataQuery: Estado atual:', {
      activeClient,
      isLoading,
      facebookCount: facebookAds.length,
      whatsappCount: whatsappLeads.length
    });
  }

  return {
    // Dados
    facebookAds,
    whatsappLeads,
    
    // Estados
    isLoading,
    error: error?.message || null,
    
    // Cliente ativo
    activeClient,
    
    // Validação e estatísticas
    validation,
    
    // Estatísticas rápidas
    stats: {
      totalFacebookAds: facebookAds.length,
      totalWhatsappLeads: whatsappLeads.length,
      totalInvestment: facebookAds.reduce((sum, ad) => sum + (ad.investimento || 0), 0),
      totalSales: whatsappLeads.filter(lead => lead.valor_venda && lead.valor_venda > 0).length,
      hasData: facebookAds.length > 0 || whatsappLeads.length > 0
    },

    // Funções de refetch
    refetchFacebook: facebookQuery.refetch,
    refetchWhatsapp: whatsappQuery.refetch,
    refetchAll: () => {
      facebookQuery.refetch();
      whatsappQuery.refetch();
    }
  };
};