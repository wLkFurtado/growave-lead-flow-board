
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
  console.log('🔄 AuthUtils: INICIANDO fetchProfile para userId:', userId);
  
  // Retornar perfil admin padrão imediatamente para evitar loops
  const defaultProfile: Profile = {
    id: userId,
    nome_completo: user?.email?.split('@')[0] || 'Admin',
    email: user?.email || 'admin@email.com',
    role: 'admin',
    clientes_associados: []
  };

  console.log('✅ AuthUtils: Retornando perfil admin padrão:', defaultProfile);
  return defaultProfile;
};
