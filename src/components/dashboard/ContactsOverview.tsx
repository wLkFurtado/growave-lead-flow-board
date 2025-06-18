
import React from 'react';
import { ContactsTable } from './ContactsTable';

interface ContactsOverviewProps {
  facebookAds: any[];
  whatsappLeads: any[];
  clientName: string;
}

export const ContactsOverview = ({ facebookAds, whatsappLeads, clientName }: ContactsOverviewProps) => {
  // Combinar dados do Facebook e WhatsApp para criar lista de contatos
  const contactsData = [
    ...facebookAds.map(ad => ({
      telefone: ad.telefone || '',
      nome: ad.nome || '',
      sobrenome: ad.sobrenome || '',
      email: ad.email || '',
      data_criacao: ad.data_criacao,
      nome_anuncio: ad.nome_anuncio,
      nome_campanha: ad.nome_campanha,
      nome_conjunto: ad.nome_conjunto,
      source_url: ad.source_url,
      cidade: ad.cidade,
      estado: ad.estado,
      mensagem: ad.mensagem
    })),
    ...whatsappLeads.map(lead => ({
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
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Contatos - {clientName}</h2>
        <p className="text-slate-400 mt-1">
          Todos os contatos obtidos através das campanhas
        </p>
      </div>
      
      <ContactsTable 
        contactsData={contactsData}
        dateRange={{ from: new Date(), to: new Date() }}
      />
    </div>
  );
};
