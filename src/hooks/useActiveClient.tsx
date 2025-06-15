
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('🔄 useActiveClient: Hook iniciado', {
    authLoading,
    profile: !!profile,
    isAdmin,
    activeClient,
    profileClients: profile?.clientes_associados,
    hasInitialized
  });

  useEffect(() => {
    console.log('🔄 useActiveClient: useEffect iniciado');

    if (hasInitialized) {
      console.log('✅ useActiveClient: Já inicializado, pulando.');
      return;
    }

    if (authLoading) {
      console.log('⏳ useActiveClient: Auth ainda carregando...');
      return;
    }

    if (!profile) {
      console.log('⚠️ useActiveClient: Sem perfil, finalizando');
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    // Para usuários não-admin, usar apenas os clientes associados ao perfil
    if (!isAdmin && profile.clientes_associados && profile.clientes_associados.length > 0) {
      console.log('👤 useActiveClient: Usuário não-admin, usando clientes do perfil:', profile.clientes_associados);
      
      setAvailableClients(profile.clientes_associados);
      
      // Se o usuário tem apenas um cliente associado, usar esse
      if (profile.clientes_associados.length === 1) {
        const clienteAssociado = profile.clientes_associados[0];
        console.log('✅ useActiveClient: Selecionando único cliente associado:', clienteAssociado);
        setActiveClient(clienteAssociado);
      } else {
        // Se tem múltiplos clientes, priorizar "Hospital do Cabelo"
        const hospitalDoCabelo = profile.clientes_associados.find(cliente => {
          const clienteLower = cliente.toLowerCase();
          return (clienteLower.includes('hospital') && clienteLower.includes('cabelo')) ||
                 clienteLower.includes('hospital do cabelo');
        });
        
        const clienteParaSelecionar = hospitalDoCabelo || profile.clientes_associados[0];
        console.log('✅ useActiveClient: Selecionando cliente associado:', clienteParaSelecionar);
        setActiveClient(clienteParaSelecionar);
      }
      
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    // Para admins, continuar com a lógica atual de buscar todos os clientes
    if (isAdmin) {
      console.log('👑 useActiveClient: Admin detectado, buscando todos os clientes...');
      const fetchClients = async () => {
        try {
          console.log('🔄 useActiveClient: Buscando clientes nas tabelas...');
          setIsLoading(true);
          
          // Buscar clientes diretamente das tabelas de dados com retry
          let fbResponse, wppResponse;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              [fbResponse, wppResponse] = await Promise.all([
                supabase
                  .from('facebook_ads')
                  .select('cliente_nome')
                  .not('cliente_nome', 'is', null),
                supabase
                  .from('whatsapp_anuncio')
                  .select('cliente_nome')
                  .not('cliente_nome', 'is', null)
              ]);
              break;
            } catch (error) {
              retryCount++;
              console.log(`⚠️ useActiveClient: Tentativa ${retryCount} falhou:`, error);
              if (retryCount >= maxRetries) throw error;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }

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
          
          // Só definir cliente ativo se não tiver um já selecionado
          if (allClients.length > 0 && !activeClient) {
            // Priorizar "Hospital do Cabelo" com busca mais flexível
            const hospitalDoCabelo = allClients.find(cliente => {
              const clienteLower = cliente.toLowerCase();
              return (clienteLower.includes('hospital') && clienteLower.includes('cabelo')) ||
                     clienteLower.includes('hospital do cabelo');
            });
            
            const clienteParaSelecionar = hospitalDoCabelo || allClients[0];
            
            console.log('✅ useActiveClient: Selecionando cliente:', {
              encontrouHospital: !!hospitalDoCabelo,
              clienteSelecionado: clienteParaSelecionar,
              todosClientes: allClients
            });
            
            setActiveClient(clienteParaSelecionar);
          } else if (allClients.length === 0) {
            console.log('⚠️ useActiveClient: Nenhum cliente encontrado');
            setActiveClient('');
          }
          
          setHasInitialized(true);
          
        } catch (error) {
          console.error('❌ useActiveClient: Erro fatal ao buscar clientes:', error);
          setAvailableClients([]);
          setActiveClient('');
          setHasInitialized(true);
        } finally {
          console.log('✅ useActiveClient: Finalizando loading');
          setIsLoading(false);
        }
      };

      fetchClients();
    } else {
      console.log('⚠️ useActiveClient: Usuário sem clientes associados');
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [profile, isAdmin, authLoading, hasInitialized]);

  const changeActiveClient = (clientName: string) => {
    console.log('🔄 useActiveClient: Mudando cliente para:', clientName);
    setActiveClient(clientName);
  };

  console.log('📊 useActiveClient: Estado atual:', {
    activeClient,
    availableClients: availableClients.length,
    isLoading: isLoading || authLoading,
    isAdmin,
    profileClients: profile?.clientes_associados,
    hasInitialized
  });

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
