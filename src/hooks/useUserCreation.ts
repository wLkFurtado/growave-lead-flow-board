
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'client';
  selectedClients: string[];
}

export const useUserCreation = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState('');

  const createUser = async (userData: CreateUserData) => {
    const { email, password, name, role, selectedClients } = userData;
    
    setIsCreating(true);
    setCreationStep('Criando conta do usuário...');

    try {
      console.log('Iniciando criação de usuário com role:', role);
      
      // Passo 1: Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email,
            role: role // Crucial: passar o role nos metadados
          }
        }
      });

      if (authError) {
        console.error('Erro no signup:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('✅ Usuário criado no Auth, ID:', authData.user.id, 'Role enviado:', role);
      setCreationStep('Configurando perfil do usuário...');

      // Passo 2: Aguardar o trigger criar o perfil (com delay maior)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Passo 3: Verificar se o perfil foi criado corretamente
      setCreationStep('Verificando perfil criado...');
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('📋 Perfil encontrado:', profileCheck);

      if (profileCheckError || !profileCheck) {
        console.warn('⚠️ Perfil não encontrado, tentando criar manualmente...');
        
        // Criar perfil manualmente se o trigger falhou
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            name: name || email,
            role: role
          })
          .select()
          .single();

        if (manualError) {
          console.error('❌ Erro ao criar perfil manualmente:', manualError);
          throw manualError;
        }

        console.log('✅ Perfil criado manualmente:', manualProfile);
      } else {
        // Verificar se o role está correto
        if (profileCheck.role !== role) {
          console.log(`🔄 Role incorreto (${profileCheck.role}), corrigindo para ${role}...`);
          setCreationStep('Corrigindo role do usuário...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', authData.user.id)
            .select();

          if (updateError) {
            console.error('❌ Erro ao corrigir role:', updateError);
            toast({
              title: "Aviso",
              description: `Usuário criado, mas role pode estar incorreto. Verifique na lista.`,
              variant: "default"
            });
          } else {
            console.log('✅ Role corrigido com sucesso:', updateData);
          }
        } else {
          console.log('✅ Role está correto:', profileCheck.role);
        }
      }

      // Passo 4: Associar clientes se for um cliente
      if (role === 'client' && selectedClients.length > 0) {
        setCreationStep('Associando clientes...');
        
        const clientAssociations = selectedClients.map(clientName => ({
          user_id: authData.user.id,
          cliente_nome: clientName
        }));

        const { error: clientsError } = await supabase
          .from('user_clients')
          .insert(clientAssociations);

        if (clientsError) {
          console.error('Erro ao associar clientes:', clientsError);
          toast({
            title: "Aviso",
            description: "Usuário criado, mas houve erro ao associar clientes.",
            variant: "default"
          });
        } else {
          console.log('✅ Clientes associados com sucesso');
        }
      }

      setCreationStep('Finalizando...');

      toast({
        title: "Sucesso",
        description: `Usuário ${email} criado com sucesso como ${role}!`,
      });

      // Recarregar dados com delay maior para garantir consistência
      setTimeout(() => {
        console.log('🔄 Recarregando dados...');
        onSuccess();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      
      let errorMessage = "Erro ao criar usuário";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado no sistema";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email inválido";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Senha deve ter pelo menos 6 caracteres";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setCreationStep('');
    }
  };

  return {
    createUser,
    isCreating,
    creationStep
  };
};
