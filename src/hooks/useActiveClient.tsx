
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔄 useActiveClient: Hook iniciado', {
    authLoading,
    profile: !!profile,
    isAdmin,
    activeClient
  });

  useEffect(() => {
    console.log('🔄 useActiveClient: useEffect iniciado');

    if (authLoading) {
      console.log('⏳ useActiveClient: Auth ainda carregando...');
      return;
    }

    if (!profile) {
      console.log('⚠️ useActiveClient: Sem perfil, finalizando');
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      return;
    }

    const fetchClients = async () => {
      try {
        console.log('🔄 useActiveClient: Buscando clientes nas tabelas...');
        setIsLoading(true);
        
        // Buscar clientes diretamente das tabelas de dados
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

        if (fbResponse.error) {
          console.error('❌ useActiveClient: Erro FB:', fbResponse.error);
        }
        
        if (wppResponse.error) {
          console.error('❌ useActiveClient: Erro WPP:', wppResponse.error);
        }

        const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const allClients = [...new Set([...fbClients, ...wppClients])].sort();

        console.log('✅ useActiveClient: Clientes únicos encontrados:', allClients);

        setAvailableClients(allClients);
        
        // Priorizar "Hospital do Cabelo" se estiver disponível
        if (allClients.length > 0 && !activeClient) {
          let clienteParaSelecionar = allClients[0]; // fallback para o primeiro
          
          // Procurar especificamente por "Hospital do Cabelo"
          const hospitalDoCabelo = allClients.find(cliente => 
            cliente.toLowerCase().includes('hospital') && cliente.toLowerCase().includes('cabelo')
          );
          
          if (hospitalDoCabelo) {
            clienteParaSelecionar = hospitalDoCabelo;
            console.log('✅ useActiveClient: Hospital do Cabelo encontrado:', hospitalDoCabelo);
          }
          
          console.log('✅ useActiveClient: Definindo cliente ativo:', clienteParaSelecionar);
          setActiveClient(clienteParaSelecionar);
        } else if (allClients.length === 0) {
          console.log('⚠️ useActiveClient: Nenhum cliente encontrado');
          setActiveClient('');
        }
        
      } catch (error) {
        console.error('❌ useActiveClient: Erro ao buscar clientes:', error);
        setAvailableClients([]);
        setActiveClient('');
      } finally {
        console.log('✅ useActiveClient: Finalizando loading');
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
