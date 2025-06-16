
import { useState, useEffect } from 'react';
import { fetchDistinctClients, getDefaultClient } from '@/services/clientService';
import { DEFAULT_CLIENT, createTimeoutPromise } from '@/utils/clientUtils';

interface UseClientInitializationProps {
  profile: any;
  isAdmin: boolean;
  authLoading: boolean;
}

interface UseClientInitializationResult {
  activeClient: string;
  availableClients: string[];
  isLoading: boolean;
  error: string | null;
  setActiveClient: (client: string) => void;
  setAvailableClients: (clients: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useClientInitialization = ({
  profile,
  isAdmin,
  authLoading
}: UseClientInitializationProps): UseClientInitializationResult => {
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeClients = async () => {
      console.log('🔄 useClientInitialization: Iniciando sistema original...');
      
      if (authLoading) {
        console.log('⏳ useClientInitialization: Auth ainda carregando...');
        return;
      }

      if (!profile) {
        console.log('⚠️ useClientInitialization: Sem perfil');
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
          console.log('👤 useClientInitialization: Usuário não-admin - definindo Hospital do Cabelo');
          if (mounted) {
            setAvailableClients([DEFAULT_CLIENT]);
            setActiveClient(DEFAULT_CLIENT);
            setIsLoading(false);
          }
        } else {
          // Para admins: buscar todos os clientes das tabelas de dados com timeout
          console.log('👑 useClientInitialization: Admin - buscando clientes...');
          
          const clientsPromise = fetchDistinctClients();
          const timeoutPromise = createTimeoutPromise(10000);
          
          const allClients = await Promise.race([clientsPromise, timeoutPromise]);

          if (mounted) {
            if (allClients.length > 0) {
              setAvailableClients(allClients);
              const defaultClient = getDefaultClient(allClients);
              setActiveClient(defaultClient);
            } else {
              // Fallback caso não encontre nenhum cliente
              setAvailableClients([DEFAULT_CLIENT]);
              setActiveClient(DEFAULT_CLIENT);
            }
            setIsLoading(false);
          }
        }
        
      } catch (error: any) {
        console.error('❌ useClientInitialization: Erro:', error);
        if (mounted) {
          // Fallback em caso de erro
          setAvailableClients([DEFAULT_CLIENT]);
          setActiveClient(DEFAULT_CLIENT);
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

  return {
    activeClient,
    availableClients,
    isLoading,
    error,
    setActiveClient,
    setAvailableClients,
    setIsLoading,
    setError
  };
};
