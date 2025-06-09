
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
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAuth = async () => {
      while (retryCount < maxRetries && mounted) {
        try {
          console.log(`🔄 AuthProvider: Tentativa ${retryCount + 1}/${maxRetries} - Iniciando getSession...`);
          
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error(`❌ AuthProvider: Erro na tentativa ${retryCount + 1}:`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`⏳ AuthProvider: Aguardando 2s antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            } else {
              console.error('❌ AuthProvider: Máximo de tentativas atingido');
              if (mounted) {
                setIsLoading(false);
              }
              return;
            }
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
          return;
        } catch (error) {
          console.error(`❌ AuthProvider: Erro fatal na tentativa ${retryCount + 1}:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (mounted) {
        console.log('❌ AuthProvider: Todas as tentativas falharam, finalizando');
        setIsLoading(false);
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        console.log('🔄 AuthProvider: Buscando perfil para userId:', userId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('❌ AuthProvider: Erro ao buscar perfil:', error);
          if (mounted) {
            const tempProfile: Profile = {
              id: userId,
              nome_completo: 'Usuário',
              email: user?.email || 'usuario@email.com',
              role: 'client',
              clientes_associados: []
            };
            console.log('🔧 AuthProvider: Usando perfil temporário');
            setProfile(tempProfile);
            setIsLoading(false);
          }
          return;
        }

        console.log('✅ AuthProvider: Perfil obtido:', data);

        if (data && mounted) {
          let clientesAssociados: string[] = [];
          
          if (data.role !== 'admin') {
            try {
              console.log('🔄 AuthProvider: Buscando clientes associados...');
              const { data: userClientsData } = await supabase
                .from('user_clients')
                .select('cliente_nome')
                .eq('user_id', userId);

              if (userClientsData) {
                clientesAssociados = userClientsData.map(item => item.cliente_nome);
                console.log('✅ AuthProvider: Clientes encontrados:', clientesAssociados);
              }
            } catch (error) {
              console.error('❌ AuthProvider: Erro ao buscar clientes do usuário:', error);
            }
          }

          const profileWithClients: Profile = {
            id: data.id,
            nome_completo: data.name || data.email,
            email: data.email,
            role: data.role,
            clientes_associados: clientesAssociados
          };

          setProfile(profileWithClients);
          setUserClients(clientesAssociados);
          console.log('✅ AuthProvider: Profile e clientes definidos');
        }

        if (mounted) {
          console.log('✅ AuthProvider: Finalizando loading (fetchProfile)');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Erro ao buscar perfil:', error);
        if (mounted) {
          const basicProfile: Profile = {
            id: userId,
            nome_completo: 'Usuário',
            email: user?.email || 'usuario@email.com',
            role: 'client',
            clientes_associados: []
          };
          setProfile(basicProfile);
          console.log('✅ AuthProvider: Finalizando loading (erro fetchProfile)');
          setIsLoading(false);
        }
      }
    };

    const globalTimeout = setTimeout(() => {
      console.log('⏰ AuthProvider: TIMEOUT GLOBAL - Forçando finalização do loading');
      if (mounted) {
        setIsLoading(false);
      }
    }, 30000);

    initializeAuth();

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
