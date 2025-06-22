
import { useState, useEffect, ReactNode } from 'react';
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

  console.log('🔄 AuthProvider: Componente iniciado');

  const loadUserProfile = async (user: User) => {
    try {
      console.log('🔄 AuthProvider: Carregando perfil do usuário...', user.id);
      setError(null);
      
      const profileData = await fetchProfile(user.id, user);
      console.log('✅ AuthProvider: Perfil carregado:', profileData);
      setProfile(profileData);
      
      // Buscar clientes associados se não for admin
      if (profileData.role !== 'admin') {
        console.log('👤 AuthProvider: Buscando clientes para usuário não-admin');
        const { data: clientsData, error: clientsError } = await supabase
          .from('user_clients')
          .select('cliente_nome')
          .eq('user_id', user.id);
        
        if (clientsError) {
          console.error('❌ AuthProvider: Erro ao buscar clientes:', clientsError);
          throw clientsError;
        }
        
        const clients = clientsData?.map(item => item.cliente_nome) || [];
        setUserClients(clients);
        console.log('✅ AuthProvider: Clientes carregados:', clients);
      } else {
        console.log('👑 AuthProvider: Usuário admin - sem clientes específicos');
        setUserClients([]);
      }
      
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
    console.log('🔄 AuthProvider: useEffect principal iniciado');
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Verificando sessão existente...');
        setIsLoading(true);
        setError(null);
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão:', error);
          setError('Erro ao verificar autenticação');
          setIsLoading(false);
          return;
        }

        console.log('✅ AuthProvider: Session obtida:', !!session?.user);

        if (session?.user) {
          console.log('🔄 AuthProvider: Usuário encontrado, carregando perfil...');
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          console.log('⚠️ AuthProvider: Nenhum usuário logado');
          setUser(null);
          setProfile(null);
          setUserClients([]);
        }

      } catch (error) {
        console.error('❌ AuthProvider: Erro na inicialização:', error);
        setError('Erro inesperado na inicialização');
      } finally {
        console.log('✅ AuthProvider: Finalizando loading');
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthProvider: Auth state changed:', event);
        
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setUserClients([]);
            setError(null);
            setIsLoading(false);
          } else if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setIsLoading(true);
            await loadUserProfile(session.user);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ AuthProvider: Erro no listener:', error);
          setError('Erro ao processar mudança de autenticação');
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleanup');
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

  console.log('📊 AuthProvider: Estado final:', {
    user: !!user,
    profile: !!profile,
    role: profile?.role,
    userClients: userClients.length,
    isLoading,
    isAdmin: profile?.role === 'admin',
    error
  });

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
