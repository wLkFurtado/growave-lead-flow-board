
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Clock } from 'lucide-react';
import { UserCreationStatus } from './UserCreationStatus';

interface UserCreationFormProps {
  availableClients: string[];
  onSubmit: (formData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'client';
    selectedClients: string[];
  }) => Promise<void>;
  isCreating: boolean;
  creationStep: string;
}

export const UserCreationForm = ({ 
  availableClients, 
  onSubmit, 
  isCreating, 
  creationStep 
}: UserCreationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      email,
      password,
      name,
      role,
      selectedClients
    });
    
    // Clear form after successful submission
    setEmail('');
    setPassword('');
    setName('');
    setRole('client');
    setSelectedClients([]);
  };

  return (
    <>
      <UserCreationStatus isCreating={isCreating} creationStep={creationStep} />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              required
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Nome</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Nome do usuário"
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">Tipo de Usuário *</Label>
            <Select 
              value={role} 
              onValueChange={(value: 'admin' | 'client') => setRole(value)}
              disabled={isCreating}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {role === 'client' && (
          <div className="space-y-2">
            <Label className="text-slate-300">Clientes Associados</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableClients.map(client => (
                <label key={client} className="flex items-center space-x-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClients([...selectedClients, client]);
                      } else {
                        setSelectedClients(selectedClients.filter(c => c !== client));
                      }
                    }}
                    className="rounded"
                    disabled={isCreating}
                  />
                  <span className="text-sm">{client}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isCreating}
          className="bg-gradient-to-r from-[#00FF88] to-[#39FF14] text-slate-900 font-bold hover:from-[#00FF88]/90 hover:to-[#39FF14]/90"
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              Criando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Criar Usuário
            </div>
          )}
        </Button>
      </form>
    </>
  );
};
