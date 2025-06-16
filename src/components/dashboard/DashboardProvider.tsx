
import React, { useState } from 'react';
import { subMonths } from 'date-fns';
import { useClientData } from '../../hooks/useClientData';

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardProviderProps {
  children: (props: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    dateRange: DateRange;
    handleDateRangeChange: (range: DateRange) => void;
    handleNavigateToProfile: (tab: string) => void;
    facebookAds: any[];
    whatsappLeads: any[];
    isLoading: boolean;
    error: string | null;
    activeClient: string;
    hasData: boolean;
  }) => React.ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Usar período padrão de 6 meses para garantir que dados sejam encontrados
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  
  // Para aba de contatos: buscar todos os dados sem filtro de data
  const contactsData = useClientData({ 
    skipDateFilter: true 
  });
  
  // Para outras abas: usar filtro de data normal
  const regularData = useClientData({ 
    dateRange 
  });

  // Escolher qual dataset usar baseado na aba ativa
  const currentData = activeTab === 'contacts' ? contactsData : regularData;
  const { facebookAds, whatsappLeads, isLoading, error, activeClient, hasData } = currentData;

  console.log('=== DASHBOARD PROVIDER RENDER ===');
  console.log('activeTab:', activeTab);
  console.log('activeClient:', `"${activeClient}"`);
  console.log('isLoading:', isLoading);
  console.log('facebookAds.length:', facebookAds.length);
  console.log('whatsappLeads.length:', whatsappLeads.length);
  console.log('hasData:', hasData);
  console.log('error:', error);
  console.log('dateRange:', {
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0]
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    console.log('📅 DASHBOARD PROVIDER: Mudando período:', {
      from: newRange.from.toISOString().split('T')[0],
      to: newRange.to.toISOString().split('T')[0]
    });
    setDateRange(newRange);
  };

  const handleNavigateToProfile = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      {children({
        activeTab,
        setActiveTab,
        isCollapsed,
        setIsCollapsed,
        dateRange,
        handleDateRangeChange,
        handleNavigateToProfile,
        facebookAds,
        whatsappLeads,
        isLoading,
        error,
        activeClient,
        hasData
      })}
    </>
  );
};
