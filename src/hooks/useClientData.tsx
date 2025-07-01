
import { useActiveClient } from './useActiveClient';
import { useAuth } from './useAuth';
import { useFacebookAdsData } from './data/useFacebookAdsData';
import { useWhatsAppLeadsData } from './data/useWhatsAppLeadsData';
import { useDataValidation } from './data/useDataValidation';
import { DateRange } from '@/types/common';

interface UseClientDataOptions {
  dateRange?: DateRange;
  skipDateFilter?: boolean;
}

export const useClientData = (options: UseClientDataOptions = {}) => {
  const { dateRange, skipDateFilter = false } = options;
  const { activeClient, isLoading: clientLoading } = useActiveClient();
  const { isAdmin, profile } = useAuth();

  // Determine effective date range
  const effectiveDateRange = dateRange || (!skipDateFilter ? {
    from: new Date('2025-06-01'),
    to: new Date('2025-06-30')
  } : undefined);

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient: `"${activeClient}"`,
    clientLoading,
    isAdmin,
    userId: profile?.id,
    dateRange: effectiveDateRange ? {
      from: effectiveDateRange.from.toISOString().split('T')[0],
      to: effectiveDateRange.to?.toISOString().split('T')[0]
    } : 'sem filtro'
  });

  // Fetch Facebook Ads data
  const {
    data: facebookAds,
    isLoading: fbLoading,
    error: fbError
  } = useFacebookAdsData({
    activeClient,
    dateRange: effectiveDateRange,
    skipDateFilter,
    enabled: !clientLoading && !!profile
  });

  // Fetch WhatsApp leads data
  const {
    data: whatsappLeads,
    isLoading: wppLoading,
    error: wppError
  } = useWhatsAppLeadsData({
    activeClient,
    dateRange: effectiveDateRange,
    skipDateFilter,
    enabled: !clientLoading && !!profile
  });

  // Validate and analyze data
  const validation = useDataValidation(facebookAds, whatsappLeads, activeClient);

  // Combine loading states and errors
  const isLoading = clientLoading || fbLoading || wppLoading;
  const error = fbError || wppError;

  console.log('📊 useClientData: Estado final para cliente:', `"${activeClient}"`, {
    isLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    hasData: validation.hasData,
    error,
    periodo: effectiveDateRange ? {
      from: effectiveDateRange.from.toISOString().split('T')[0],
      to: effectiveDateRange.to?.toISOString().split('T')[0]
    } : 'sem filtro'
  });

  return {
    facebookAds,
    whatsappLeads,
    isLoading,
    error,
    activeClient,
    hasData: validation.hasData,
    stats: {
      facebook: validation.facebookStats,
      whatsapp: validation.whatsappStats,
      totalRecords: validation.totalRecords
    }
  };
};
