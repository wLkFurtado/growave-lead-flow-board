
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
        
        if (!isAdmin) {
          console.log('👤 useActiveClient: Usuário não-admin, verificando clientes...');
          
          // Buscar clientes associados
          const { data: userClientsData, error: fetchError } = await supabase
            .from('user_clients')
            .select('cliente_nome')
            .eq('user_id', profile.id);

          if (fetchError) {
            console.error('❌ useActiveClient: Erro ao buscar clientes:', fetchError);
            setError(`Erro ao buscar clientes: ${fetchError.message}`);
          }

          const userClients = userClientsData?.map(item => item.cliente_nome) || [];
          console.log('📊 useActiveClient: Clientes do usuário:', userClients);

          if (userClients.length > 0) {
            // Usuário já tem clientes associados
            console.log('✅ useActiveClient: Clientes encontrados');
            if (mounted) {
              setAvailableClients(userClients);
              setActiveClient(userClients[0]);
              setIsLoading(false);
            }
          } else {
            // Tentar associar automaticamente com Hospital do Cabelo
            console.log('🏥 useActiveClient: Tentando associar Hospital do Cabelo...');
            
            const { error: insertError } = await supabase
              .from('user_clients')
              .insert({
                user_id: profile.id,
                cliente_nome: 'Hospital do Cabelo'
              });

            if (insertError) {
              console.error('❌ useActiveClient: Erro ao associar:', insertError);
              setError(`Erro ao configurar cliente: ${insertError.message}`);
            } else {
              console.log('✅ useActiveClient: Hospital do Cabelo associado com sucesso');
            }
            
            // Definir cliente mesmo se a inserção falhar (fallback)
            if (mounted) {
              setAvailableClients(['Hospital do Cabelo']);
              setActiveClient('Hospital do Cabelo');
              setIsLoading(false);
            }
          }
        } else {
          console.log('👑 useActiveClient: Admin - buscando todos os clientes...');
          
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
            setAvailableClients(allClients);
            if (allClients.length > 0) {
              const hospitalClient = allClients.find(c => c.toLowerCase().includes('hospital')) || allClients[0];
              setActiveClient(hospitalClient);
            }
            setIsLoading(false);
          }
        }
        
      } catch (error: any) {
        console.error('❌ useActiveClient: Erro fatal:', error);
        if (mounted) {
          setError(`Erro inesperado: ${error.message}`);
          // Fallback: sempre permitir Hospital do Cabelo
          setAvailableClients(['Hospital do Cabelo']);
          setActiveClient('Hospital do Cabelo');
          setIsLoading(false);
        }
      }
    };

    initializeClients();

    return () => {
      mounted = false;
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
