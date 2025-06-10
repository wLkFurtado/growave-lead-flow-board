
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔄 useActiveClient: Hook iniciado');

  useEffect(() => {
    console.log('🔄 useActiveClient: useEffect iniciado', {
      authLoading,
      profile: !!profile,
      isAdmin
    });

    if (authLoading) {
      console.log('⏳ useActiveClient: Auth carregando...');
      return;
    }

    if (!profile) {
      console.log('⚠️ useActiveClient: Sem perfil');
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      return;
    }

    const fetchClients = async () => {
      try {
        console.log('🔄 useActiveClient: Buscando clientes...');
        
        // Buscar clientes nas duas tabelas
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
          fbError: fbResponse.error,
          wppError: wppResponse.error
        });

        const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const allClients = [...new Set([...fbClients, ...wppClients])];

        console.log('✅ useActiveClient: Clientes únicos encontrados:', allClients);

        setAvailableClients(allClients);
        
        if (allClients.length > 0) {
          const firstClient = allClients[0];
          setActiveClient(firstClient);
          console.log('✅ useActiveClient: Cliente ativo definido:', firstClient);
        } else {
          console.log('⚠️ useActiveClient: Nenhum cliente encontrado');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ useActiveClient: Erro ao buscar clientes:', error);
        setAvailableClients([]);
        setActiveClient('');
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [profile, isAdmin, authLoading]);

  const changeActiveClient = (clientName: string) => {
    console.log('🔄 useActiveClient: Mudando cliente para:', clientName);
    setActiveClient(clientName);
  };

  console.log('📊 useActiveClient: Estado atual:', {
    activeClient,
    availableClients: availableClients.length,
    isLoading: isLoading || authLoading
  });

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
