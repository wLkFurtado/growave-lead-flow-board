
import { supabase } from '@/integrations/supabase/client';

export const fetchDistinctClients = async (): Promise<string[]> => {
  console.log('👑 clientService: Buscando clientes das tabelas de dados...');
  
  const [fbResponse, wppResponse] = await Promise.all([
    supabase
      .from('facebook_ads')
      .select('cliente_nome')
      .not('cliente_nome', 'is', null)
      .neq('cliente_nome', ''),
    supabase
      .from('whatsapp_anuncio')
      .select('cliente_nome')
      .not('cliente_nome', 'is', null)
      .neq('cliente_nome', '')
  ]);

  const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
  const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
  const allClients = [...new Set([...fbClients, ...wppClients])].sort();

  console.log('✅ clientService: Clientes encontrados:', allClients);
  return allClients;
};

export const getDefaultClient = (clients: string[]): string => {
  if (clients.length === 0) {
    return 'Hospital do Cabelo';
  }
  
  // Tentar encontrar Hospital do Cabelo, senão usar o primeiro da lista
  return clients.find(c => c.toLowerCase().includes('hospital')) || clients[0];
};
