
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 useActiveClient: Estado atual', {
    authLoading,
    profile: !!profile,
    isAdmin,
    activeClient: `"${activeClient}"`,
    availableClients: availableClients.length,
    error
  });

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeClients = async () => {
      console.log('🔄 useActiveClient: Iniciando...');
      
      if (authLoading) {
        console.log('⏳ useActiveClient: Auth ainda carregando...');
        return;
      }

      if (!profile) {
        console.log('⚠️ useActiveClient: Sem perfil');
        if (mounted) {
          setActiveClient('');
          setAvailableClients([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Timeout de 10 segundos para evitar loading infinito
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⏰ useActiveClient: Timeout - usando fallback');
            setAvailableClients(['Hospital do Cabelo']);
            setActiveClient('Hospital do Cabelo');
            setError(null);
            setIsLoading(false);
          }
        }, 10000);
        
        if (!isAdmin) {
          console.log('👤 useActiveClient: Usuário não-admin, verificando clientes...');
          
          try {
            // Buscar clientes associados
            const { data: userClientsData, error: fetchError } = await supabase
              .from('user_clients')
              .select('cliente_nome')
              .eq('user_id', profile.id);

            if (fetchError) {
              console.warn('⚠️ useActiveClient: Erro ao buscar clientes (usando fallback):', fetchError);
            }

            const userClients = userClientsData?.map(item => item.cliente_nome) || [];
            console.log('📊 useActiveClient: Clientes do usuário:', userClients);

            if (userClients.length > 0) {
              // Usuário já tem clientes associados
              console.log('✅ useActiveClient: Clientes encontrados');
              if (mounted) {
                clearTimeout(timeoutId);
                setAvailableClients(userClients);
                setActiveClient(userClients[0]);
                setIsLoading(false);
              }
            } else {
              // Tentar associar automaticamente com Hospital do Cabelo
              console.log('🏥 useActiveClient: Tentando associar Hospital do Cabelo...');
              
              try {
                const { error: insertError } = await supabase
                  .from('user_clients')
                  .insert({
                    user_id: profile.id,
                    cliente_nome: 'Hospital do Cabelo'
                  });

                if (insertError) {
                  console.warn('⚠️ useActiveClient: Erro ao associar (usando fallback):', insertError);
                } else {
                  console.log('✅ useActiveClient: Hospital do Cabelo associado com sucesso');
                }
              } catch (insertError) {
                console.warn('⚠️ useActiveClient: Exceção ao associar (usando fallback):', insertError);
              }
              
              // Sempre definir cliente (fallback)
              if (mounted) {
                clearTimeout(timeoutId);
                setAvailableClients(['Hospital do Cabelo']);
                setActiveClient('Hospital do Cabelo');
                setError(null);
                setIsLoading(false);
              }
            }
          } catch (error) {
            console.warn('⚠️ useActiveClient: Erro na busca de clientes (usando fallback):', error);
            if (mounted) {
              clearTimeout(timeoutId);
              setAvailableClients(['Hospital do Cabelo']);
              setActiveClient('Hospital do Cabelo');
              setError(null);
              setIsLoading(false);
            }
          }
        } else {
          console.log('👑 useActiveClient: Admin - buscando todos os clientes...');
          
          try {
            // Para admins, buscar todos os clientes disponíveis
            const [fbResponse, wppResponse] = await Promise.all([
              supabase.from('facebook_ads').select('cliente_nome').not('cliente_nome', 'is', null),
              supabase.from('whatsapp_anuncio').select('cliente_nome').not('cliente_nome', 'is', null)
            ]);

            const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
            const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
            const allClients = [...new Set([...fbClients, ...wppClients])].sort();

            console.log('✅ useActiveClient: Clientes encontrados para admin:', allClients);

            if (mounted) {
              clearTimeout(timeoutId);
              setAvailableClients(allClients.length > 0 ? allClients : ['Hospital do Cabelo']);
              if (allClients.length > 0) {
                const hospitalClient = allClients.find(c => c.toLowerCase().includes('hospital')) || allClients[0];
                setActiveClient(hospitalClient);
              } else {
                setActiveClient('Hospital do Cabelo');
              }
              setIsLoading(false);
            }
          } catch (error) {
            console.warn('⚠️ useActiveClient: Erro ao buscar clientes admin (usando fallback):', error);
            if (mounted) {
              clearTimeout(timeoutId);
              setAvailableClients(['Hospital do Cabelo']);
              setActiveClient('Hospital do Cabelo');
              setError(null);
              setIsLoading(false);
            }
          }
        }
        
      } catch (error: any) {
        console.warn('⚠️ useActiveClient: Erro fatal (usando fallback):', error);
        if (mounted) {
          clearTimeout(timeoutId);
          // Sempre garantir fallback em caso de erro
          setAvailableClients(['Hospital do Cabelo']);
          setActiveClient('Hospital do Cabelo');
          setError(null);
          setIsLoading(false);
        }
      }
    };

    initializeClients();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [profile, isAdmin, authLoading]);

  const changeActiveClient = (clientName: string) => {
    console.log('🔄 useActiveClient: Mudando para:', clientName);
    setActiveClient(clientName);
  };

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    error,
    changeActiveClient
  };
};
