
import React from 'react';
import { ContactsTable } from './ContactsTable';
import { DateRange } from '@/types/common';
import { formatDate } from '@/utils/data/formatters';
import { BUSINESS_RULES } from '@/config/business';

interface ContactsOverviewProps {
  whatsappLeads: any[];
  clientName: string;
  dateRange?: DateRange;
}

const normalizePhone = (phone?: string) => (phone || '').replace(/\D/g, '');

export const ContactsOverview = ({ whatsappLeads, clientName, dateRange }: ContactsOverviewProps) => {
  // Usar apenas leads do WhatsApp com telefone válido
  const leadsWithPhone = (whatsappLeads || []).filter(lead => normalizePhone(lead.telefone).length >= BUSINESS_RULES.VALID_PHONE_MIN_LENGTH);

  const contactsData = leadsWithPhone.map(lead => ({
    telefone: lead.telefone || '',
    nome: lead.nome || '',
    sobrenome: lead.sobrenome || '',
    email: lead.email || '',
    data_criacao: lead.data_criacao,
    nome_anuncio: lead.nome_anuncio,
    nome_campanha: lead.nome_campanha,
    nome_conjunto: lead.nome_conjunto,
    source_url: lead.source_url,
    cidade: lead.cidade,
    estado: lead.estado,
    mensagem: lead.mensagem
  }));

  const periodText =
    dateRange?.from && dateRange?.to
      ? `Período: ${formatDate(dateRange.from)} — ${formatDate(dateRange.to)}`
      : 'Apenas leads com telefone';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Contatos - {clientName}</h2>
        <p className="text-slate-400 mt-1">{periodText}</p>
      </div>
      
      <ContactsTable 
        contactsData={contactsData}
        dateRange={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : { from: new Date(), to: new Date() }}
      />
    </div>
  );
};
