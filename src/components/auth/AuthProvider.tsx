
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
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!mounted) return;

        console.log('🔄 AuthProvider: Iniciando getSession...');
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('✅ AuthProvider: Session obtida:', !!session);

        if (session?.user && mounted) {
          console.log('🔄 AuthProvider: Usuário encontrado, buscando perfil...');
          setUser(session.user);
          
          try {
            // Timeout mais curto para fetchProfile
            const profilePromise = fetchProfile(session.user.id, session.user);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            );
            
            const profileData = await Promise.race([profilePromise, timeoutPromise]) as Profile;
            
            if (mounted) {
              setProfile(profileData);
              setUserClients(profileData.clientes_associados);
              console.log('✅ AuthProvider: Profile e clientes definidos');
            }
          } catch (error) {
            console.error('❌ AuthProvider: Erro ao buscar perfil:', error);
            if (mounted) {
              // Perfil básico em caso de erro
              const basicProfile: Profile = {
                id: session.user.id,
                nome_completo: session.user.email?.split('@')[0] || 'Usuário',
                email: session.user.email || 'usuario@email.com',
                role: 'admin', // Assumir admin se não conseguir buscar
                clientes_associados: []
              };
              setProfile(basicProfile);
              console.log('✅ AuthProvider: Profile básico definido como admin');
            }
          }
        } else {
          console.log('⚠️ AuthProvider: Nenhum usuário logado');
        }

        if (mounted) {
          console.log('✅ AuthProvider: Finalizando loading');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Timeout global reduzido
    const globalTimeout = setTimeout(() => {
      console.log('⏰ AuthProvider: TIMEOUT GLOBAL - Forçando finalização do loading');
      if (mounted) {
        setIsLoading(false);
      }
    }, 8000); // Reduzido de 15s para 8s

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthProvider: Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setUserClients([]);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          try {
            const profileData = await fetchProfile(session.user.id, session.user);
            setProfile(profileData);
            setUserClients(profileData.clientes_associados);
          } catch (error) {
            console.error('❌ AuthProvider: Erro ao buscar perfil no state change:', error);
            // Perfil básico como fallback
            const basicProfile: Profile = {
              id: session.user.id,
              nome_completo: session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || 'usuario@email.com',
              role: 'admin',
              clientes_associados: []
            };
            setProfile(basicProfile);
          }
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
