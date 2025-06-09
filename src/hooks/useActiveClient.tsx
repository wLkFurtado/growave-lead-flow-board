
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useActiveClient = () => {
  const { profile, userClients, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('=== useActiveClient Effect START ===');
  console.log('authLoading:', authLoading);
  console.log('profile:', profile);
  console.log('isAdmin:', isAdmin);
  console.log('userClients:', userClients);
  console.log('hasInitialized:', hasInitialized);

  useEffect(() => {
    const initializeClient = async () => {
      // Se auth ainda está carregando E ainda não inicializamos, aguardar um pouco
      if (authLoading && !hasInitialized) {
        console.log('Auth ainda carregando, aguardando...');
        
        // Timeout de segurança para não esperar infinitamente
        const authTimeout = setTimeout(() => {
          console.log('TIMEOUT: Auth demorou mais de 8s, continuando sem ele');
          setIsLoading(false);
          setHasInitialized(true);
        }, 8000);
        
        // Limpar timeout se o auth terminar antes
        const checkAuth = () => {
          if (!authLoading) {
            clearTimeout(authTimeout);
          }
        };
        checkAuth();
        
        return;
      }

      if (!profile) {
        console.log('Nenhum perfil encontrado, finalizando loading');
        setActiveClient('');
        setAvailableClients([]);
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }

      setIsLoading(true);

      if (isAdmin) {
        console.log('Usuário é admin, buscando todos os clientes...');
        await fetchAllClients();
      } else {
        console.log('Usuário é cliente regular, usando clientes associados:', userClients);
        setAvailableClients(userClients);
        if (userClients.length > 0) {
          const clientToSet = userClients[0];
          console.log('Definindo cliente ativo para:', clientToSet);
          setActiveClient(clientToSet);
        } else {
          console.log('Nenhum cliente associado encontrado');
          setActiveClient('');
        }
        setIsLoading(false);
      }
      
      setHasInitialized(true);
    };

    initializeClient();
  }, [profile, userClients, isAdmin, authLoading, hasInitialized]);

  const fetchAllClients = async () => {
    try {
      console.log('=== BUSCANDO TODOS OS CLIENTES PARA ADMIN ===');
      
      const clientsTimeout = setTimeout(() => {
        console.log('TIMEOUT: Busca de clientes demorou mais de 10s, finalizando com lista vazia');
        setAvailableClients([]);
        setActiveClient('');
        setIsLoading(false);
      }, 10000);

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

      clearTimeout(clientsTimeout);

      console.log('FB Response:', fbResponse.data?.length || 0, 'registros');
      console.log('WPP Response:', wppResponse.data?.length || 0, 'registros');

      if (fbResponse.error) {
        console.error('Erro ao buscar clientes FB:', fbResponse.error);
      }
      
      if (wppResponse.error) {
        console.error('Erro ao buscar clientes WPP:', wppResponse.error);
      }

      const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
      const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
      
      // Combinar e remover duplicatas
      const allClients = [...new Set([...fbClients, ...wppClients])];
      console.log('Total de clientes únicos encontrados:', allClients.length);
      console.log('Clientes:', allClients);
      
      setAvailableClients(allClients);
      
      // Se não há cliente ativo e há clientes disponíveis, selecionar um
      if (allClients.length > 0) {
        const savedClient = localStorage.getItem('activeClient');
        console.log('Cliente salvo no localStorage:', savedClient);
        
        if (savedClient && allClients.includes(savedClient)) {
          console.log('Usando cliente salvo:', savedClient);
          setActiveClient(savedClient);
        } else {
          console.log('Usando primeiro cliente da lista:', allClients[0]);
          setActiveClient(allClients[0]);
        }
      } else {
        console.log('Nenhum cliente encontrado na base de dados');
        setActiveClient('');
      }
    } catch (error) {
      console.error('Erro fatal ao buscar clientes:', error);
      setAvailableClients([]);
      setActiveClient('');
    } finally {
      console.log('=== FINALIZANDO BUSCA DE CLIENTES ===');
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

  // Timeout de segurança global para este hook
  useEffect(() => {
    const globalTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('TIMEOUT GLOBAL useActiveClient: Forçando finalização do loading após 20s');
        setIsLoading(false);
        setHasInitialized(true);
      }
    }, 20000);

    return () => clearTimeout(globalTimeout);
  }, [isLoading]);

  console.log('=== useActiveClient State FINAL ===');
  console.log('activeClient:', activeClient);
  console.log('availableClients:', availableClients.length, 'clientes');
  console.log('isLoading:', isLoading || authLoading);

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
