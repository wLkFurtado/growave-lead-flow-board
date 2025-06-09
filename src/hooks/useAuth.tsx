
import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userClients: string[];
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userClients, setUserClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('=== AuthProvider State ===');
  console.log('user:', user?.id);
  console.log('profile:', profile);
  console.log('userClients:', userClients);
  console.log('isLoading:', isLoading);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('=== INICIANDO BUSCA DO PERFIL ===');
      console.log('User ID:', userId);
      
      // Usar maybeSingle() ao invés de single() para evitar erros
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile response:', { data: profileData, error: profileError });

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setIsLoading(false);
        return;
      }

      if (!profileData) {
        console.log('Perfil não encontrado, criando...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || 'unknown@email.com',
            name: user?.user_metadata?.name || user?.email || 'Usuário',
            role: 'client'
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          setIsLoading(false);
          return;
        }
        
        console.log('Perfil criado:', newProfile);
        if (newProfile) {
          setProfile(newProfile);
        }
      } else {
        console.log('Perfil encontrado:', profileData);
        setProfile(profileData);
      }

      // Buscar clientes do usuário se não for admin
      if (profileData?.role !== 'admin') {
        console.log('Usuário não é admin, buscando clientes associados...');
        const { data: clientsData, error: clientsError } = await supabase
          .from('user_clients')
          .select('cliente_nome')
          .eq('user_id', userId);

        console.log('Clientes response:', { data: clientsData, error: clientsError });

        if (clientsError) {
          console.error('Erro ao buscar clientes:', clientsError);
          setUserClients([]);
        } else {
          const clients = clientsData?.map(item => item.cliente_nome) || [];
          console.log('Clientes encontrados:', clients);
          setUserClients(clients);
        }
      } else {
        console.log('Usuário é admin, não precisa de clientes específicos');
        setUserClients([]);
      }

    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
    } finally {
      console.log('=== FINALIZANDO BUSCA DO PERFIL ===');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== AuthProvider useEffect INICIADO ===');
    
    // Verificar usuário atual
    const getCurrentUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        console.log('Current user check:', { user: currentUser?.id, error });
        
        if (error) {
          console.error('Erro ao verificar usuário:', error);
          setIsLoading(false);
          return;
        }

        if (currentUser) {
          console.log('Usuário encontrado, buscando perfil...');
          setUser(currentUser);
          await fetchProfile(currentUser.id);
        } else {
          console.log('Nenhum usuário logado');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsLoading(false);
      }
    };

    getCurrentUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setUserClients([]);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== TENTATIVA DE LOGIN ===');
      console.log('Email:', email);
      
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data: data?.user?.id, error });

      if (error) {
        console.error('Erro no login:', error);
        setIsLoading(false);
        return { error };
      }

      console.log('Login realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado ao fazer login:', error);
      setIsLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setUserClients([]);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      userClients,
      isAdmin,
      isLoading,
      signIn,
      signOut
    }}>
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
