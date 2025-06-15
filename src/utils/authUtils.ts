
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const signIn = async (email: string, password: string) => {
  console.log('🔄 AuthUtils: Fazendo login...');
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

export const signOut = async () => {
  console.log('🔄 AuthUtils: Fazendo logout...');
  await supabase.auth.signOut();
};

export const fetchProfile = async (userId: string, user: any): Promise<Profile> => {
  console.log('🔄 AuthUtils: Buscando perfil do usuário no banco:', userId);
  
  try {
    // Buscar perfil da tabela profiles
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('🔍 AuthUtils: Resposta da query profiles:', { profileData, error });

    if (error && error.code !== 'PGRST116') {
      console.error('❌ AuthUtils: Erro ao buscar perfil:', error);
      throw error;
    }

    // Se não encontrou o perfil, criar um padrão
    if (!profileData || error?.code === 'PGRST116') {
      console.log('⚠️ AuthUtils: Perfil não encontrado, criando perfil padrão');
      
      const fallbackProfile: Profile = {
        id: userId,
        nome_completo: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário',
        email: user?.email || 'email@example.com',
        role: 'client'
      };
      
      console.log('📝 AuthUtils: Perfil padrão criado:', fallbackProfile);
      return fallbackProfile;
    }

    const profile: Profile = {
      id: profileData.id,
      nome_completo: profileData.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário',
      email: profileData.email || user?.email,
      role: profileData.role || 'client'
    };

    console.log('✅ AuthUtils: Perfil encontrado no banco:', profile);
    return profile;
  } catch (error) {
    console.error('❌ AuthUtils: Erro inesperado ao buscar perfil:', error);
    
    // Fallback em caso de erro
    const fallbackProfile: Profile = {
      id: userId,
      nome_completo: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário',
      email: user?.email || 'email@example.com',
      role: 'client'
    };
    
    console.log('🆘 AuthUtils: Usando perfil de emergência:', fallbackProfile);
    return fallbackProfile;
  }
};
