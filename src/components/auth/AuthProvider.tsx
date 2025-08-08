
import { useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { Profile } from '@/types/auth';
import { signIn as authSignIn, signOut as authSignOut, fetchProfile } from '@/utils/authUtils';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userClients, setUserClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Cache para evitar re-fetch desnecessário do perfil
  const profileCacheRef = useRef<{ userId: string; profile: Profile; clients: string[] } | null>(null);

  // ✅ Log removido para melhor performance

  const loadUserProfile = async (user: User) => {
    try {
      setError(null);
      
      // ✅ Verificar cache antes de buscar novamente
      if (profileCacheRef.current?.userId === user.id) {
        setProfile(profileCacheRef.current.profile);
        setUserClients(profileCacheRef.current.clients);
        return;
      }
      
      const profileData = await fetchProfile(user.id, user);
      setProfile(profileData);
      
      let clients: string[] = [];
      
      // Buscar clientes associados se não for admin
      if (profileData.role !== 'admin') {
        const { data: clientsData, error: clientsError } = await supabase
          .from('user_clients')
          .select('cliente_nome')
          .eq('user_id', user.id);
        
        if (clientsError) {
          console.error('❌ AuthProvider: Erro ao buscar clientes:', clientsError);
          throw clientsError;
        }
        
        clients = clientsData?.map(item => item.cliente_nome) || [];
        setUserClients(clients);
      } else {
        setUserClients([]);
      }
      
      // ✅ Salvar no cache
      profileCacheRef.current = {
        userId: user.id,
        profile: profileData,
        clients: clients
      };
      
    } catch (error) {
      console.error('❌ AuthProvider: Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar perfil');
      
      // Criar perfil fallback em caso de erro
      const fallbackProfile: Profile = {
        id: user.id,
        nome_completo: user.email?.split('@')[0] || 'Usuário',
        email: user.email || 'email@example.com',
        role: 'client',
        clientes_associados: []
      };
      setProfile(fallbackProfile);
      setUserClients([]);
    }
  };

  useEffect(() => {
    // Watchdog: guarantee we don't get stuck loading forever
    const watchdog = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    // 1) Set up auth state listener FIRST (sync-only operations inside)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        setError(null);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setUserClients([]);
          profileCacheRef.current = null; // clear cache on sign out
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);

          // Use cache if available
          if (profileCacheRef.current?.userId === session.user.id) {
            setProfile(profileCacheRef.current.profile);
            setUserClients(profileCacheRef.current.clients);
            setIsLoading(false);
          } else {
            // Defer Supabase calls to avoid deadlocks
            setIsLoading(true);
            setTimeout(() => {
              loadUserProfile(session.user!)
                .catch((e) => {
                  console.error('❌ AuthProvider: loadUserProfile (listener) error:', e);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }, 0);
          }
        } else {
          // No session
          setUser(null);
          setProfile(null);
          setUserClients([]);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('❌ AuthProvider: onAuthStateChange error:', e);
        setError('Erro ao processar mudança de autenticação');
        setIsLoading(false);
      }
    });

    // 2) THEN check for existing session
    setIsLoading(true);
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão:', error);
          setError('Erro ao verificar autenticação');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);

          if (profileCacheRef.current?.userId === session.user.id) {
            setProfile(profileCacheRef.current.profile);
            setUserClients(profileCacheRef.current.clients);
            setIsLoading(false);
          } else {
            setTimeout(() => {
              loadUserProfile(session.user!)
                .catch((e) => {
                  console.error('❌ AuthProvider: loadUserProfile (init) error:', e);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }, 0);
          }
        } else {
          setUser(null);
          setProfile(null);
          setUserClients([]);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.error('❌ AuthProvider: getSession unexpected error:', e);
        setError('Erro inesperado na inicialização');
        setIsLoading(false);
      });

    return () => {
      clearTimeout(watchdog);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    userClients,
    isAdmin: profile?.role === 'admin',
    isLoading,
    signIn: authSignIn,
    signOut: authSignOut,
  };

  // ✅ Log removido para melhor performance

  // Se houver erro crítico, mostrar tela de erro
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">Erro de autenticação</div>
          <div className="text-slate-400">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#00FF88] text-slate-900 rounded hover:bg-[#00FF88]/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
