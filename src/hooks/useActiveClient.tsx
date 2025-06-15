
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

    const initializeClients = async () => {
      try {
        setIsLoading(true);
        
        if (!isAdmin) {
          console.log('👤 useActiveClient: Usuário não-admin, buscando clientes associados...');
          
          const { data: userClientsData, error } = await supabase
            .from('user_clients')
            .select('cliente_nome')
            .eq('user_id', profile.id);

          if (error) {
            console.error('❌ useActiveClient: Erro ao buscar clientes do usuário:', error);
          }

          const userClients = userClientsData?.map(item => item.cliente_nome) || [];
          console.log('📊 useActiveClient: Clientes encontrados para o usuário:', userClients);

          if (userClients.length > 0) {
            setAvailableClients(userClients);
            const clienteParaSelecionar = userClients.find(cliente => 
              cliente.toLowerCase().includes('hospital')
            ) || userClients[0];
            
            console.log('✅ useActiveClient: Selecionando cliente associado:', clienteParaSelecionar);
            setActiveClient(clienteParaSelecionar);
          } else {
            // Primeiro, verificar se Hospital do Cabelo existe nos dados
            console.log('🔍 useActiveClient: Verificando se Hospital do Cabelo tem dados...');
            
            const [fbCheck, wppCheck] = await Promise.all([
              supabase
                .from('facebook_ads')
                .select('id')
                .eq('cliente_nome', 'Hospital do Cabelo')
                .limit(1),
              supabase
                .from('whatsapp_anuncio')
                .select('telefone')
                .eq('cliente_nome', 'Hospital do Cabelo')
                .not('telefone', 'is', null)
                .neq('telefone', '')
                .limit(1)
            ]);

            const hasHospitalData = (fbCheck.data && fbCheck.data.length > 0) || 
                                   (wppCheck.data && wppCheck.data.length > 0);

            console.log('📊 useActiveClient: Hospital do Cabelo tem dados?', {
              facebook: fbCheck.data?.length || 0,
              whatsapp: wppCheck.data?.length || 0,
              hasData: hasHospitalData
            });

            if (hasHospitalData) {
              // Tentar associar automaticamente com Hospital do Cabelo
              console.log('⚠️ useActiveClient: Usuário sem clientes, tentando associar Hospital do Cabelo...');
              
              const { error: insertError } = await supabase
                .from('user_clients')
                .insert({
                  user_id: profile.id,
                  cliente_nome: 'Hospital do Cabelo'
                });

              if (insertError) {
                console.error('❌ useActiveClient: Erro ao associar cliente:', insertError);
                console.log('🆘 useActiveClient: Associação falhou, mas permitindo acesso temporário');
              } else {
                console.log('✅ useActiveClient: Hospital do Cabelo associado com sucesso');
              }
              
              // Permitir acesso mesmo se a associação falhar
              setAvailableClients(['Hospital do Cabelo']);
              setActiveClient('Hospital do Cabelo');
            } else {
              console.log('⚠️ useActiveClient: Hospital do Cabelo não tem dados, deixando vazio');
              setAvailableClients([]);
              setActiveClient('');
            }
          }
        } else {
          console.log('👑 useActiveClient: Admin detectado, buscando todos os clientes...');
          
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
          
          if (allClients.length > 0 && !activeClient) {
            const hospitalDoCabelo = allClients.find(cliente => 
              cliente.toLowerCase().includes('hospital')
            );
            
            const clienteParaSelecionar = hospitalDoCabelo || allClients[0];
            console.log('✅ useActiveClient: Selecionando cliente:', clienteParaSelecionar);
            setActiveClient(clienteParaSelecionar);
          }
        }
        
        setHasInitialized(true);
      } catch (error) {
        console.error('❌ useActiveClient: Erro fatal:', error);
        
        // Fallback de emergência: se tudo falhar, tentar Hospital do Cabelo mesmo assim
        console.log('🆘 useActiveClient: Aplicando fallback de emergência...');
        setAvailableClients(['Hospital do Cabelo']);
        setActiveClient('Hospital do Cabelo');
        setHasInitialized(true);
      } finally {
        console.log('✅ useActiveClient: Finalizando loading');
        setIsLoading(false);
      }
    };

    initializeClients();
  }, [profile, isAdmin, authLoading, hasInitialized]);

  const changeActiveClient = (clientName: string) => {
    console.log('🔄 useActiveClient: Mudando cliente para:', clientName);
    setActiveClient(clientName);
  };

  console.log('📊 useActiveClient: Estado atual:', {
    activeClient: `"${activeClient}"`,
    availableClients: availableClients.length,
    isLoading: isLoading || authLoading,
    isAdmin,
    hasInitialized
  });

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
