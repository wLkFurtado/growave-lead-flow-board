
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Building } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface UserClient {
  id: string;
  user_id: string;
  cliente_nome: string;
}

interface UsersListProps {
  profiles: Profile[];
  userClients: UserClient[];
}

export const UsersList = ({ profiles, userClients }: UsersListProps) => {
  const getUserClients = (userId: string) => {
    return userClients.filter(uc => uc.user_id === userId).map(uc => uc.cliente_nome);
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700">
          <TableHead className="text-slate-300">Usuário</TableHead>
          <TableHead className="text-slate-300">Tipo</TableHead>
          <TableHead className="text-slate-300">Clientes</TableHead>
          <TableHead className="text-slate-300">Criado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map(profile => (
          <TableRow key={profile.id} className="border-slate-700">
            <TableCell className="text-white">
              <div>
                <div className="font-medium">{profile.name || profile.email}</div>
                {profile.name && (
                  <div className="text-sm text-slate-400">{profile.email}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant={profile.role === 'admin' ? 'default' : 'secondary'}
                className={profile.role === 'admin' 
                  ? 'bg-[#00FF88] text-slate-900' 
                  : 'bg-slate-600 text-white'
                }
              >
                {profile.role === 'admin' ? (
                  <><Shield className="w-3 h-3 mr-1" />Admin</>
                ) : (
                  <><Building className="w-3 h-3 mr-1" />Cliente</>
                )}
              </Badge>
            </TableCell>
            <TableCell className="text-slate-300">
              {profile.role === 'admin' ? (
                <span className="text-[#00FF88]">Todos os clientes</span>
              ) : (
                <div className="space-y-1">
                  {getUserClients(profile.id).map(client => (
                    <Badge key={client} variant="outline" className="text-xs">
                      {client}
                    </Badge>
                  ))}
                  {getUserClients(profile.id).length === 0 && (
                    <span className="text-red-400 text-sm">Nenhum cliente</span>
                  )}
                </div>
              )}
            </TableCell>
            <TableCell className="text-slate-400">
              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
