
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useActiveClient = () => {
  const { profile, userClients, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== useActiveClient Effect ===');
    console.log('authLoading:', authLoading);
    console.log('profile:', profile);
    console.log('isAdmin:', isAdmin);
    console.log('userClients:', userClients);

    if (authLoading) {
      console.log('Auth ainda carregando, aguardando...');
      return;
    }

    if (!profile) {
      console.log('Nenhum perfil encontrado, redirecionando para auth...');
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      return;
    }

    if (isAdmin) {
      console.log('Usuário é admin, buscando todos os clientes...');
      fetchAllClients();
    } else {
      console.log('Usuário é cliente, usando clientes associados:', userClients);
      setAvailableClients(userClients);
      if (userClients.length > 0) {
        const clientToSet = userClients[0];
        console.log('Definindo cliente ativo para:', clientToSet);
        setActiveClient(clientToSet);
      } else {
        console.log('Nenhum cliente associado encontrado');
      }
      setIsLoading(false);
    }
  }, [profile, userClients, isAdmin, authLoading]);

  const fetchAllClients = async () => {
    try {
      console.log('Buscando todos os clientes para admin...');
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

      console.log('FB Response:', fbResponse);
      console.log('WPP Response:', wppResponse);

      if (fbResponse.error) {
        console.error('Erro ao buscar clientes FB:', fbResponse.error);
      }
      
      if (wppResponse.error) {
        console.error('Erro ao buscar clientes WPP:', wppResponse.error);
      }

      const fbClients = fbResponse.data?.map(row => row.cliente_nome) || [];
      const wppClients = wppResponse.data?.map(row => row.cliente_nome) || [];
      
      // Combinar e remover duplicatas
      const allClients = [...new Set([...fbClients, ...wppClients])].filter(Boolean);
      console.log('Todos os clientes encontrados:', allClients);
      
      setAvailableClients(allClients);
      
      // Se não há cliente ativo, selecionar o primeiro ou o salvo
      if (!activeClient && allClients.length > 0) {
        const savedClient = localStorage.getItem('activeClient');
        console.log('Cliente salvo no localStorage:', savedClient);
        
        if (savedClient && allClients.includes(savedClient)) {
          console.log('Usando cliente salvo:', savedClient);
          setActiveClient(savedClient);
        } else {
          console.log('Usando primeiro cliente da lista:', allClients[0]);
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
    console.log('Mudando cliente ativo para:', clientName);
    setActiveClient(clientName);
    if (isAdmin) {
      localStorage.setItem('activeClient', clientName);
    }
  };

  console.log('=== useActiveClient State ===');
  console.log('activeClient:', activeClient);
  console.log('availableClients:', availableClients);
  console.log('isLoading:', isLoading || authLoading);

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
