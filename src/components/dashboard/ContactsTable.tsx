

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, Calendar, Phone, Mail, Target, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contact {
  telefone: string;
  nome?: string;
  sobrenome?: string;
  email?: string;
  data_criacao: string;
  nome_anuncio?: string;
  nome_campanha?: string;
  nome_conjunto?: string;
  source_url?: string;
  cidade?: string;
  estado?: string;
  mensagem?: string;
}

interface ContactsTableProps {
  contactsData: Contact[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const ContactsTable = ({ contactsData, dateRange }: ContactsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Contact>('data_criacao');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const itemsPerPage = 20;

  // Filtros e busca
  const filteredContacts = useMemo(() => {
    let filtered = contactsData.filter(contact => {
      const searchString = `${contact.nome || ''} ${contact.sobrenome || ''} ${contact.telefone} ${contact.email || ''}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] || '';
      let bValue: string | number = b[sortField] || '';
      
      if (sortField === 'data_criacao') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [contactsData, searchTerm, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  // Métricas
  const metrics = useMemo(() => {
    const total = contactsData.length;
    const withPhone = contactsData.filter(c => c.telefone && c.telefone.trim() !== '').length;
    const withEmail = contactsData.filter(c => c.email && c.email.trim() !== '').length;
    const uniquePhones = new Set(contactsData.map(c => c.telefone)).size;
    
    return { total, withPhone, withEmail, uniquePhones };
  }, [contactsData]);

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatUrl = (url?: string) => {
    if (!url || url.trim() === '') return null;
    
    // Se a URL não começar com http, adiciona https
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    return (
      <a 
        href={formattedUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center space-x-1 text-[#00FF88] hover:text-[#39FF14] transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
        <span className="text-xs">Ver anúncio</span>
      </a>
    );
  };

  if (contactsData.length === 0) {
    return (
      <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Phone className="h-12 w-12 text-[#00FF88]" />
            <div>
              <h3 className="text-lg font-medium text-white">Nenhum contato encontrado</h3>
              <p className="text-slate-400 mt-1">
                Não há contatos disponíveis para o período selecionado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-[#00FF88]" />
              <div>
                <p className="text-sm text-slate-400">Total de Contatos</p>
                <p className="text-lg font-semibold text-white">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-[#39FF14]" />
              <div>
                <p className="text-sm text-slate-400">Com Telefone</p>
                <p className="text-lg font-semibold text-white">{metrics.withPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-[#00FF88]" />
              <div>
                <p className="text-sm text-slate-400">Com Email</p>
                <p className="text-lg font-semibold text-white">{metrics.withEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-[#39FF14]" />
              <div>
                <p className="text-sm text-slate-400">Únicos</p>
                <p className="text-lg font-semibold text-white">{metrics.uniquePhones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card className="bg-transparent border-[#00FF88]/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-white">Contatos</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-transparent border-[#00FF88]/50 text-[#00FF88] hover:bg-[#00FF88]/10">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00FF88]" />
                <Input
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-transparent border-[#00FF88]/30 text-white placeholder-slate-400 focus:border-[#00FF88] focus:ring-[#00FF88]/20"
                />
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="border border-[#00FF88]/30 rounded-lg overflow-hidden bg-transparent backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-[#00FF88]/20 hover:bg-[#00FF88]/5">
                  <TableHead 
                    className="text-[#00FF88] cursor-pointer hover:text-[#39FF14] transition-colors"
                    onClick={() => handleSort('nome')}
                  >
                    Nome
                  </TableHead>
                  <TableHead 
                    className="text-[#00FF88] cursor-pointer hover:text-[#39FF14] transition-colors"
                    onClick={() => handleSort('telefone')}
                  >
                    Telefone
                  </TableHead>
                  <TableHead className="text-[#00FF88]">Anúncio</TableHead>
                  <TableHead className="text-[#00FF88]">Campanha</TableHead>
                  <TableHead className="text-[#00FF88]">Criativo</TableHead>
                  <TableHead 
                    className="text-[#00FF88] cursor-pointer hover:text-[#39FF14] transition-colors"
                    onClick={() => handleSort('data_criacao')}
                  >
                    Data
                  </TableHead>
                  <TableHead className="text-[#00FF88]">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContacts.map((contact, index) => (
                  <TableRow key={`${contact.telefone}-${index}`} className="border-[#00FF88]/10 hover:bg-[#00FF88]/5 transition-colors">
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">
                          {contact.nome || contact.sobrenome 
                            ? `${contact.nome || ''} ${contact.sobrenome || ''}`.trim()
                            : 'Não informado'
                          }
                        </div>
                        {contact.cidade && contact.estado && (
                          <div className="text-xs text-slate-400">
                            {contact.cidade}, {contact.estado}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {formatPhone(contact.telefone)}
                    </TableCell>
                    <TableCell className="text-slate-300 max-w-[200px] truncate">
                      {contact.nome_anuncio || '-'}
                    </TableCell>
                    <TableCell className="text-slate-300 max-w-[200px] truncate">
                      {contact.nome_campanha || '-'}
                    </TableCell>
                    <TableCell className="text-slate-300 max-w-[200px] truncate">
                      {contact.nome_conjunto || '-'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {format(new Date(contact.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {formatUrl(contact.source_url) || (
                        <span className="text-slate-500 text-xs">Sem link</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-400">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredContacts.length)} de {filteredContacts.length} contatos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-transparent border-[#00FF88]/30 text-slate-300 hover:text-white hover:bg-[#00FF88]/10 disabled:opacity-50"
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-300">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-transparent border-[#00FF88]/30 text-slate-300 hover:text-white hover:bg-[#00FF88]/10 disabled:opacity-50"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

