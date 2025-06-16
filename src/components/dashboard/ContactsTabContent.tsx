
import React from 'react';
import { ContactsTable } from './ContactsTable';
import { EmptyStateManager } from './EmptyStateManager';
import { useAuth } from '../../hooks/useAuth';

interface DateRange {
  from: Date;
  to: Date;
}

interface ContactsTabContentProps {
  hasWhatsappData: boolean;
  activeClient: string | null;
  whatsappLeads: any[];
  dateRange: DateRange;
}

export const ContactsTabContent = ({
  hasWhatsappData,
  activeClient,
  whatsappLeads,
  dateRange
}: ContactsTabContentProps) => {
  const { isAdmin } = useAuth();

  if (!hasWhatsappData && activeClient) {
    return (
      <EmptyStateManager
        type="contacts-no-data"
        activeClient={activeClient}
        isAdmin={isAdmin}
      />
    );
  }

  if (!activeClient) {
    return <EmptyStateManager type="contacts-no-client" />;
  }

  return <ContactsTable contactsData={whatsappLeads} dateRange={dateRange} />;
};
