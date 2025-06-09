
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useActiveClient = () => {
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Buscar clientes únicos das duas tabelas
        const [fbResponse, wppResponse] = await Promise.all([
          supabase
            .from('facebook_ads')
            .select('cliente_nome')
            .not('cliente_nome', 'is', null),
          supabase
            .from('whatsapp_anuncio')
            .select('cliente_nome')
            .not('cliente_nome', 'is', null)
        ]);

        const fbClients = fbResponse.data?.map(row => row.cliente_nome) || [];
        const wppClients = wppResponse.data?.map(row => row.cliente_nome) || [];
        
        // Combinar e remover duplicatas
        const allClients = [...new Set([...fbClients, ...wppClients])];
        
        setAvailableClients(allClients);
        
        // Se não há cliente ativo, selecionar o primeiro
        if (!activeClient && allClients.length > 0) {
          const savedClient = localStorage.getItem('activeClient');
          if (savedClient && allClients.includes(savedClient)) {
            setActiveClient(savedClient);
          } else {
            setActiveClient(allClients[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const changeActiveClient = (clientName: string) => {
    setActiveClient(clientName);
    localStorage.setItem('activeClient', clientName);
  };

  return {
    activeClient,
    availableClients,
    isLoading,
    changeActiveClient
  };
};
