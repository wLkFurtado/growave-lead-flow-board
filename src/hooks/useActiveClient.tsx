
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

    let mounted = true;

    const initializeClient = async () => {
      try {
        if (authLoading) {
          console.log('⏳ useActiveClient: Auth carregando, aguardando...');
          return;
        }

        console.log('🔄 useActiveClient: Auth finalizado, processando cliente...');

        if (!profile) {
          console.log('⚠️ useActiveClient: Nenhum perfil, finalizando');
          if (mounted) {
            setActiveClient('');
            setAvailableClients([]);
            setIsLoading(false);
          }
          return;
        }

        if (isAdmin) {
          console.log('🔄 useActiveClient: Usuário admin, buscando todos os clientes...');
          await fetchAllClients();
        } else {
          console.log('🔄 useActiveClient: Usuário regular, usando clientes associados:', userClients);
          if (mounted) {
            setAvailableClients(userClients);
            if (userClients.length > 0) {
              setActiveClient(userClients[0]);
              console.log('✅ useActiveClient: Cliente definido:', userClients[0]);
            }
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ useActiveClient: Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchAllClients = async () => {
      try {
        console.log('🔄 useActiveClient: Buscando clientes no Supabase...');
        
        const { supabase } = await import('@/integrations/supabase/client');
        
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

        console.log('✅ useActiveClient: Respostas obtidas:', {
          fb: fbResponse.data?.length || 0,
          wpp: wppResponse.data?.length || 0,
          fbError: !!fbResponse.error,
          wppError: !!wppResponse.error
        });

        if (fbResponse.error || wppResponse.error) {
          console.error('❌ useActiveClient: Erro nas queries:', {
            fb: fbResponse.error,
            wpp: wppResponse.error
          });
        }

        const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const allClients = [...new Set([...fbClients, ...wppClients])];

        console.log('✅ useActiveClient: Clientes encontrados:', allClients);

        if (mounted) {
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
        }
      } catch (error) {
        console.error('❌ useActiveClient: Erro ao buscar clientes:', error);
        if (mounted) {
          setAvailableClients([]);
          setActiveClient('');
          setIsLoading(false);
        }
      }
    };

    const globalTimeout = setTimeout(() => {
      console.log('⏰ useActiveClient: TIMEOUT GLOBAL - Forçando finalização');
      if (mounted) {
        setIsLoading(false);
      }
    }, 10000);

    initializeClient();

    return () => {
      console.log('🧹 useActiveClient: Cleanup');
      mounted = false;
      clearTimeout(globalTimeout);
    };
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
