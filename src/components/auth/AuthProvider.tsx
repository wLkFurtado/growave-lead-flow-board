
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

  useEffect(() => {
    console.log('🔄 AuthProvider: useEffect principal iniciado');
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Iniciando getSession...');
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão:', error);
          setIsLoading(false);
          return;
        }

        console.log('✅ AuthProvider: Session obtida:', !!session);

        if (session?.user) {
          console.log('🔄 AuthProvider: Usuário encontrado, buscando perfil...');
          setUser(session.user);
          
          const profileData = await fetchProfile(session.user.id, session.user);
          
          setProfile(profileData);
          setUserClients(profileData.clientes_associados);
          console.log('✅ AuthProvider: Profile definido:', profileData.role);
        } else {
          console.log('⚠️ AuthProvider: Nenhum usuário logado');
        }

        console.log('✅ AuthProvider: Finalizando loading');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ AuthProvider: Erro na inicialização:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

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
          const profileData = await fetchProfile(session.user.id, session.user);
          setProfile(profileData);
          setUserClients(profileData.clientes_associados);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleanup');
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

  const value = {
    user,
    profile,
    userClients,
    isAdmin: profile?.role === 'admin',
    isLoading,
    signIn: authSignIn,
    signOut: authSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
