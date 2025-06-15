
import { supabase } from '@/integrations/supabase/client';
import { ChangePasswordForm } from '@/utils/passwordValidation';

export const updatePassword = async (data: ChangePasswordForm) => {
  console.log('Tentando alterar senha...');
  
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword
  });

  if (error) {
    console.error('Erro ao alterar senha:', error);
    
    if (error.message.includes('same as the old password') || error.message.includes('same_password')) {
      throw new Error('A nova senha deve ser diferente da senha atual.');
    } else if (error.message.includes('should be at least')) {
      throw new Error('A senha deve atender aos critérios de segurança.');
    } else {
      throw new Error(error.message || 'Ocorreu um erro inesperado.');
    }
  }

  console.log('Senha alterada com sucesso!');
};
