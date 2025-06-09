
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
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Iniciando getSession...');
        
        // Timeout para getSession
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Session timeout')), 8000);
        });

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (timeoutId) clearTimeout(timeoutId);

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
        
        // Timeout para fetchProfile
        const profilePromise = supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Profile timeout')), 10000);
        });

        const { data, error } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (timeoutId) clearTimeout(timeoutId);

        if (error) {
          console.error('❌ AuthProvider: Erro ao buscar perfil:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('✅ AuthProvider: Perfil obtido:', data);

        if (data && mounted) {
          setProfile(data);
          setUserClients(data.clientes_associados || []);
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

    // Timeout global de segurança
    const globalTimeout = setTimeout(() => {
      console.log('⏰ AuthProvider: TIMEOUT GLOBAL - Forçando finalização do loading');
      if (mounted) {
        setIsLoading(false);
      }
    }, 15000);

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
      if (timeoutId) clearTimeout(timeoutId);
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
