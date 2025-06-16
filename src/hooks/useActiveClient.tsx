
import { useAuth } from './useAuth';
import { useClientInitialization } from './useClientInitialization';
import { logClientState } from '@/utils/clientUtils';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const {
    activeClient,
    availableClients,
    isLoading,
    error,
    setActiveClient
  } = useClientInitialization({
    profile,
    isAdmin,
    authLoading
  });

  logClientState({
    authLoading,
    profile: !!profile,
    isAdmin,
    activeClient,
    availableClientsCount: availableClients.length,
    error
  });

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
