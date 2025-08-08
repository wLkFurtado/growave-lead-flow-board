
import React from 'react';
import { DateRange } from '@/types/common';
import { DashboardOverview } from './DashboardOverview';
import { ContactsOverview } from './ContactsOverview';
import { EmptyState } from './EmptyState';
import { DateRangePicker } from './DateRangePicker';
import { UserManagement } from './UserManagement';
import { MyProfile } from './MyProfile';
import { useAuth } from '@/hooks/useAuth';
import { LeadKanbanBoard } from './LeadKanbanBoard';

interface TabContentProps {
  activeTab: string;
  hasData: boolean;
  activeClient: string;
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

  const renderEmptyState = () => {
    if (!activeClient) {
      return <EmptyState type="no-client" />;
    }
    return <EmptyState type="no-data" clientName={activeClient} />;
  };

  // Determinar se tem dados baseado no conteúdo real
  const hasRealData = (facebookAds && facebookAds.length > 0) || (whatsappLeads && whatsappLeads.length > 0);

  switch (activeTab) {
    case 'dashboard':
      return (
        <div>
          {hasRealData ? (
            <DashboardOverview 
              adsData={facebookAds}
              leadsData={whatsappLeads}
              onDateRangeChange={handleDateRangeChange}
              dateRange={dateRange}
            />
          ) : (
            renderEmptyState()
          )}
        </div>
      );
    
    case 'contacts':
      return (
        <ContactsOverview 
          whatsappLeads={whatsappLeads}
          clientName={activeClient}
          dateRange={dateRange}
        />
      );
    
    case 'kanban':
      return (
        <LeadKanbanBoard leadsData={whatsappLeads} />
      );
    

    
    case 'users':
      return isAdmin ? (
        <UserManagement />
      ) : (
        <EmptyState type="admin-only" />
      );
    
    case 'profile':
      return <MyProfile />;
      
    default:
      return (
        <DashboardOverview 
          adsData={facebookAds}
          leadsData={whatsappLeads}
          onDateRangeChange={handleDateRangeChange}
          dateRange={dateRange}
        />
      );
  }
};
