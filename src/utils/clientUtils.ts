
export const DEFAULT_CLIENT = 'Hospital do Cabelo';

export const createTimeoutPromise = (timeoutMs: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout após ${timeoutMs}ms`));
    }, timeoutMs);
  });
};

export const logClientState = (state: {
  authLoading: boolean;
  profile: boolean;
  isAdmin: boolean;
  activeClient: string;
  availableClientsCount: number;
  error: string | null;
}) => {
  console.log('🔄 useActiveClient: Estado atual', {
    authLoading: state.authLoading,
    profile: state.profile,
    isAdmin: state.isAdmin,
    activeClient: `"${state.activeClient}"`,
    availableClients: state.availableClientsCount,
    error: state.error
  });
};
