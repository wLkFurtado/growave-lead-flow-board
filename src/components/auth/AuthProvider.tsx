
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

  console.log('🔄 AuthProvider: Componente iniciado');

  const loadUserProfile = async (user: User) => {
    try {
      console.log('🔄 AuthProvider: Carregando perfil do usuário...');
      
      const profileData = await fetchProfile(user.id, user);
      setProfile(profileData);
      
      // Buscar clientes associados se não for admin
      if (profileData.role !== 'admin') {
        const { data: clientsData } = await supabase
          .from('user_clients')
          .select('cliente_nome')
          .eq('user_id', user.id);
        
        const clients = clientsData?.map(item => item.cliente_nome) || [];
        setUserClients(clients);
      } else {
        setUserClients([]);
      }
      
      console.log('✅ AuthProvider: Perfil carregado:', profileData);
    } catch (error) {
      console.error('❌ AuthProvider: Erro ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider: useEffect principal iniciado');
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Verificando sessão existente...');
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão:', error);
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

        console.log('✅ AuthProvider: Finalizando loading');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ AuthProvider: Erro na inicialização:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthProvider: Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setUserClients([]);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
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
    isAdmin: profile?.role === 'admin'
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
