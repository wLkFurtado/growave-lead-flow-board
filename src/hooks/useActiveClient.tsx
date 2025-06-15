
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
      console.log('🔄 useActiveClient: Iniciando sistema original...');
      
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
          // Para usuários não-admin: sempre Hospital do Cabelo
          console.log('👤 useActiveClient: Usuário não-admin - definindo Hospital do Cabelo');
          if (mounted) {
            setAvailableClients(['Hospital do Cabelo']);
            setActiveClient('Hospital do Cabelo');
            setIsLoading(false);
          }
        } else {
          // Para admins: buscar todos os clientes das tabelas de dados
          console.log('👑 useActiveClient: Admin - buscando clientes das tabelas de dados...');
          
          const [fbResponse, wppResponse] = await Promise.all([
            supabase
              .from('facebook_ads')
              .select('cliente_nome')
              .not('cliente_nome', 'is', null)
              .neq('cliente_nome', ''),
            supabase
              .from('whatsapp_anuncio')
              .select('cliente_nome')
              .not('cliente_nome', 'is', null)
              .neq('cliente_nome', '')
          ]);

          const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
          const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
          const allClients = [...new Set([...fbClients, ...wppClients])].sort();

          console.log('✅ useActiveClient: Clientes encontrados:', allClients);

          if (mounted) {
            if (allClients.length > 0) {
              setAvailableClients(allClients);
              // Tentar definir Hospital do Cabelo como padrão, senão o primeiro da lista
              const defaultClient = allClients.find(c => c.toLowerCase().includes('hospital')) || allClients[0];
              setActiveClient(defaultClient);
            } else {
              // Fallback caso não encontre nenhum cliente
              setAvailableClients(['Hospital do Cabelo']);
              setActiveClient('Hospital do Cabelo');
            }
            setIsLoading(false);
          }
        }
        
      } catch (error: any) {
        console.error('❌ useActiveClient: Erro:', error);
        if (mounted) {
          // Fallback em caso de erro
          setAvailableClients(['Hospital do Cabelo']);
          setActiveClient('Hospital do Cabelo');
          setError(null); // Não mostrar erro, usar fallback
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
    console.log('🔄 useActiveClient: Mudando para:', `"${clientName}"`);
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
