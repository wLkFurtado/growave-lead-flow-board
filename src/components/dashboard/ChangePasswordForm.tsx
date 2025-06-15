
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = form.watch('newPassword');

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', met: newPassword.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(newPassword) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(newPassword) },
    { label: 'Um número', met: /[0-9]/.test(newPassword) }
  ];

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    
    try {
      // Supabase automaticamente verifica a senha atual ao tentar atualizá-la
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        if (error.message.includes('same as the old password')) {
          toast({
            title: "Erro",
            description: "A nova senha deve ser diferente da senha atual.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao alterar senha",
            description: error.message || "Ocorreu um erro inesperado.",
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
        variant: "default"
      });

      form.reset();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao alterar a senha.",
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
            {/* Senha Atual */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00FF88]/80 font-medium">Senha Atual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        className="bg-slate-800/80 border-[#00FF88]/20 text-white pr-10 growave-neon-border placeholder:text-white/30"
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00FF88] transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nova Senha */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00FF88]/80 font-medium">Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        className="bg-slate-800/80 border-[#00FF88]/20 text-white pr-10 growave-neon-border placeholder:text-white/30"
                        placeholder="Digite sua nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00FF88] transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* Requisitos da senha */}
                  {newPassword && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-400">Requisitos da senha:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {req.met ? (
                              <Check className="w-4 h-4 text-[#00FF88]" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-xs ${req.met ? 'text-[#00FF88]' : 'text-slate-400'}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Confirmar Senha */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00FF88]/80 font-medium">Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        className="bg-slate-800/80 border-[#00FF88]/20 text-white pr-10 growave-neon-border placeholder:text-white/30"
                        placeholder="Confirme sua nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00FF88] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
