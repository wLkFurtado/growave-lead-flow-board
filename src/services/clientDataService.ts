
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/types/clientData';
import { formatDateForQuery } from '@/utils/dateRangeUtils';

export const fetchFacebookAds = async (
  clientName: string,
  dateRange?: DateRange | null
) => {
  console.log('🔄 clientDataService: Buscando Facebook Ads para:', `"${clientName}"`);
  
  let query = supabase
    .from('facebook_ads')
    .select('*')
    .eq('cliente_nome', clientName)
    .order('data', { ascending: false });

  if (dateRange) {
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    query = query.gte('data', fromDate).lte('data', toDate);
  }

  return query;
};

export const fetchWhatsappLeads = async (
  clientName: string,
  dateRange?: DateRange | null
) => {
  console.log('🔄 clientDataService: Buscando WhatsApp Leads para:', `"${clientName}"`);
  
  let query = supabase
    .from('whatsapp_anuncio')
    .select('*')
    .eq('cliente_nome', clientName)
    .not('telefone', 'is', null)
    .neq('telefone', '')
    .order('data_criacao', { ascending: false });

  if (dateRange) {
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    query = query.gte('data_criacao', fromDate).lte('data_criacao', toDate);
  }

  return query;
};
