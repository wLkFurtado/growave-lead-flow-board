
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordInput } from './password/PasswordInput';
import { PasswordRequirements } from './password/PasswordRequirements';
import { changePasswordSchema, ChangePasswordForm as ChangePasswordFormType } from '@/utils/passwordValidation';
import { updatePassword } from '@/services/passwordService';

export const ChangePasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = form.watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormType) => {
    setIsLoading(true);
    
    try {
      await updatePassword(data);
      
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
        variant: "default"
      });

      form.reset();
    } catch (error) {
      console.error('Erro inesperado ao alterar senha:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado ao alterar a senha.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-transparent border-2 border-[#00FF88]/60 growave-neon-border growave-card-hover">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-[#00FF88]" />
          <span>Segurança</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PasswordInput
              control={form.control}
              name="currentPassword"
              label="Senha Atual"
              placeholder="Digite sua senha atual"
            />

            <PasswordInput
              control={form.control}
              name="newPassword"
              label="Nova Senha"
              placeholder="Digite sua nova senha"
            >
              <PasswordRequirements password={newPassword} />
            </PasswordInput>

            <PasswordInput
              control={form.control}
              name="confirmPassword"
              label="Confirmar Nova Senha"
              placeholder="Confirme sua nova senha"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00FF88] to-[#39FF14] hover:from-[#00FF88]/80 hover:to-[#39FF14]/80 text-slate-900 font-semibold transition-all duration-300 growave-neon-text"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando Senha...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
