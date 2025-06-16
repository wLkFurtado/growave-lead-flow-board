
import React from 'react';
import { MyProfile } from './MyProfile';
import { ContactsTabContent } from './ContactsTabContent';
import { DashboardTabContent } from './DashboardTabContent';
import { KanbanTabContent } from './KanbanTabContent';
import { UsersTabContent } from './UsersTabContent';
import { useAuth } from '../../hooks/useAuth';

interface DateRange {
  from: Date;
  to: Date;
}

interface TabContentProps {
  activeTab: string;
  hasData: boolean;
  activeClient: string | null;
  dateRange: DateRange;
  facebookAds: any[];
  whatsappLeads: any[];
  handleDateRangeChange: (range: DateRange) => void;
}

export const TabContent = ({
  activeTab,
  hasData,
  activeClient,
  dateRange,
  facebookAds,
  whatsappLeads,
  handleDateRangeChange
}: TabContentProps) => {
  const { isAdmin } = useAuth();

  // Calcular se temos dados, mesmo que fora do período atual
  const hasFacebookData = facebookAds.length > 0;
  const hasWhatsappData = whatsappLeads.length > 0;
  const hasAnyData = hasFacebookData || hasWhatsappData;

  console.log('=== TAB CONTENT DEBUG ===');
  console.log('activeTab:', activeTab);
  console.log('activeClient:', `"${activeClient}"`);
  console.log('hasData:', hasData);
  console.log('hasAnyData:', hasAnyData);
  console.log('facebookAds.length:', facebookAds.length);
  console.log('whatsappLeads.length:', whatsappLeads.length);
  console.log('dateRange:', {
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0]
  });

  if (activeTab === 'profile') {
    return <MyProfile />;
  }

  if (activeTab === 'contacts') {
    return (
      <ContactsTabContent
        hasWhatsappData={hasWhatsappData}
        activeClient={activeClient}
        whatsappLeads={whatsappLeads}
        dateRange={dateRange}
      />
    );
  }

  if (activeTab === 'dashboard') {
    return (
      <DashboardTabContent
        hasAnyData={hasAnyData}
        activeClient={activeClient}
        facebookAds={facebookAds}
        whatsappLeads={whatsappLeads}
        dateRange={dateRange}
        handleDateRangeChange={handleDateRangeChange}
      />
    );
  }

  if (activeTab === 'kanban') {
    return (
      <KanbanTabContent
        hasWhatsappData={hasWhatsappData}
        activeClient={activeClient}
        whatsappLeads={whatsappLeads}
      />
    );
  }

  if (activeTab === 'users') {
    return <UsersTabContent isAdmin={isAdmin} />;
  }

  return null;
};
