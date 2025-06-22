
import React from 'react';
import { DateRange } from '@/types/common';
import { DashboardOverview } from './DashboardOverview';
import { ContactsOverview } from './ContactsOverview';
import { EmptyState } from './EmptyState';
import { DateRangePicker } from './DateRangePicker';
import { UserManagement } from './UserManagement';
import { useAuth } from '@/hooks/useAuth';
import { AccessTestPanel } from './AccessTestPanel';

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

  switch (activeTab) {
    case 'dashboard':
      return (
        <div>
          {/* Painel de teste de acesso - apenas para debug */}
          {process.env.NODE_ENV === 'development' && (
            <AccessTestPanel />
          )}
          
          <div className="flex justify-end mb-4">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
          
          {hasData ? (
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
        <div>
          {hasData ? (
            <ContactsOverview 
              facebookAds={facebookAds}
              whatsappLeads={whatsappLeads}
              clientName={activeClient}
            />
          ) : (
            renderEmptyState()
          )}
        </div>
      );
    
    case 'users':
      return isAdmin ? (
        <UserManagement />
      ) : (
        <EmptyState type="admin-only" />
      );
    
    case 'profile':
      return <div>Perfil do usuário</div>;
      
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
