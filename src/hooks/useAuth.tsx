
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  role: string;
  clientes_associados: string[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userClients: string[];
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userClients, setUserClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔄 AuthProvider: Componente iniciado');

  useEffect(() => {
    console.log('🔄 AuthProvider: useEffect principal iniciado');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Iniciando getSession...');
        
        // Aumentei o timeout para 15 segundos
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session timeout')), 15000);
        });

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('❌ AuthProvider: Erro ao buscar sessão:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('✅ AuthProvider: Session obtida:', !!session);

        if (session?.user && mounted) {
          console.log('🔄 AuthProvider: Usuário encontrado, buscando perfil...');
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('⚠️ AuthProvider: Nenhum usuário logado');
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ AuthProvider: Erro fatal na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        console.log('🔄 AuthProvider: Buscando perfil para userId:', userId);
        
        // Aumentei o timeout para 20 segundos e simplifiquei a query
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile timeout')), 20000);
        });

        const { data, error } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('❌ AuthProvider: Erro ao buscar perfil:', error);
          // Mesmo com erro no perfil, vamos tentar continuar
          if (mounted) {
            // Criar um perfil temporário para não quebrar o app
            const tempProfile = {
              id: userId,
              nome_completo: 'Usuário',
              email: 'usuario@email.com',
              role: 'client',
              clientes_associados: []
            };
            setProfile(tempProfile);
            setIsLoading(false);
          }
          return;
        }

        console.log('✅ AuthProvider: Perfil obtido:', data);

        if (data && mounted) {
          // Buscar clientes associados se não for admin
          let clientesAssociados: string[] = [];
          
          if (data.role !== 'admin') {
            try {
              console.log('🔄 AuthProvider: Buscando clientes associados...');
              const { data: userClientsData, error: clientsError } = await supabase
                .from('user_clients')
                .select('cliente_nome')
                .eq('user_id', userId);

              if (!clientsError && userClientsData) {
                clientesAssociados = userClientsData.map(item => item.cliente_nome);
                console.log('✅ AuthProvider: Clientes encontrados:', clientesAssociados);
              }
            } catch (error) {
              console.error('❌ AuthProvider: Erro ao buscar clientes do usuário:', error);
            }
          }

          const profileWithClients = {
            ...data,
            clientes_associados: clientesAssociados
          };

          setProfile(profileWithClients);
          setUserClients(clientesAssociados);
          console.log('✅ AuthProvider: Profile e clientes definidos');
        } else {
          console.log('⚠️ AuthProvider: Nenhum perfil encontrado');
        }

        if (mounted) {
          console.log('✅ AuthProvider: Finalizando loading (fetchProfile)');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Erro ao buscar perfil:', error);
        if (mounted) {
          console.log('✅ AuthProvider: Finalizando loading (erro fetchProfile)');
          setIsLoading(false);
        }
      }
    };

    // Timeout global aumentado para 30 segundos
    const globalTimeout = setTimeout(() => {
      console.log('⏰ AuthProvider: TIMEOUT GLOBAL - Forçando finalização do loading');
      if (mounted) {
        setIsLoading(false);
      }
    }, 30000);

    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthProvider: Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' && mounted) {
          setUser(null);
          setProfile(null);
          setUserClients([]);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleanup');
      mounted = false;
      clearTimeout(globalTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Log do estado atual a cada mudança
  useEffect(() => {
    console.log('📊 AuthProvider: Estado atual:', {
      user: !!user,
      profile: !!profile,
      userClients: userClients.length,
      isLoading,
      isAdmin: profile?.role === 'admin'
    });
  }, [user, profile, userClients, isLoading]);

  const signIn = async (email: string, password: string) => {
    console.log('🔄 AuthProvider: Fazendo login...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🔄 AuthProvider: Fazendo logout...');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    userClients,
    isAdmin: profile?.role === 'admin',
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
