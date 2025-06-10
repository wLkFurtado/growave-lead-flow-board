
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useActiveClient = () => {
  const { profile, userClients, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔄 useActiveClient: Hook iniciado');

  useEffect(() => {
    console.log('🔄 useActiveClient: useEffect principal iniciado', {
      authLoading,
      profile: !!profile,
      isAdmin,
      userClients: userClients.length
    });

    if (authLoading) {
      console.log('⏳ useActiveClient: Auth carregando, aguardando...');
      return;
    }

    if (!profile) {
      console.log('⚠️ useActiveClient: Nenhum perfil, finalizando');
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      return;
    }

    const initializeClient = async () => {
      if (isAdmin) {
        console.log('🔄 useActiveClient: Usuário admin, buscando todos os clientes...');
        await fetchAllClients();
      } else {
        console.log('🔄 useActiveClient: Usuário regular, usando clientes associados:', userClients);
        setAvailableClients(userClients);
        if (userClients.length > 0) {
          setActiveClient(userClients[0]);
          console.log('✅ useActiveClient: Cliente definido:', userClients[0]);
        }
        setIsLoading(false);
      }
    };

    const fetchAllClients = async () => {
      try {
        console.log('🔄 useActiveClient: Buscando clientes no Supabase...');
        
        const { supabase } = await import('@/integrations/supabase/client');
        
        const [fbResponse, wppResponse] = await Promise.all([
          supabase.from('facebook_ads').select('cliente_nome').not('cliente_nome', 'is', null),
          supabase.from('whatsapp_anuncio').select('cliente_nome').not('cliente_nome', 'is', null)
        ]);

        console.log('✅ useActiveClient: Respostas obtidas:', {
          fb: fbResponse.data?.length || 0,
          wpp: wppResponse.data?.length || 0
        });

        const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const allClients = [...new Set([...fbClients, ...wppClients])];

        console.log('✅ useActiveClient: Clientes encontrados:', allClients);

        setAvailableClients(allClients);
        
        if (allClients.length > 0) {
          const savedClient = localStorage.getItem('activeClient');
          const clientToSet = (savedClient && allClients.includes(savedClient)) 
            ? savedClient 
            : allClients[0];
          
          setActiveClient(clientToSet);
          console.log('✅ useActiveClient: Cliente ativo definido:', clientToSet);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ useActiveClient: Erro ao buscar clientes:', error);
        setAvailableClients([]);
        setActiveClient('');
        setIsLoading(false);
      }
    };

    initializeClient();
  }, [profile, userClients, isAdmin, authLoading]);

  useEffect(() => {
    console.log('📊 useActiveClient: Estado atual:', {
      activeClient,
      availableClients: availableClients.length,
      isLoading: isLoading || authLoading
    });
  }, [activeClient, availableClients, isLoading, authLoading]);

  const changeActiveClient = (clientName: string) => {
    console.log('🔄 useActiveClient: Mudando cliente para:', clientName);
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
