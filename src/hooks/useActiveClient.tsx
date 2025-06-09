
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useActiveClient = () => {
  const { profile, userClients, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!profile) {
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      return;
    }

    if (isAdmin) {
      // Admin pode ver todos os clientes - manter funcionalidade original
      fetchAllClients();
    } else {
      // Cliente vê apenas seus clientes associados
      setAvailableClients(userClients);
      if (userClients.length > 0 && !activeClient) {
        setActiveClient(userClients[0]);
      }
      setIsLoading(false);
    }
  }, [profile, userClients, isAdmin, authLoading]);

  const fetchAllClients = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
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
      
      // Se não há cliente ativo, selecionar o primeiro ou o salvo
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

  const changeActiveClient = (clientName: string) => {
    setActiveClient(clientName);
    if (isAdmin) {
      localStorage.setItem('activeClient', clientName);
    }
  };

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
