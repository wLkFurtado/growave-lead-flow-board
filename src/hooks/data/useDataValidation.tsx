
import { useMemo } from 'react';

interface DataValidationResult {
  hasData: boolean;
  totalRecords: number;
  facebookStats: {
    total: number;
    withInvestment: number;
    totalInvestment: number;
    campaigns: string[];
  };
  whatsappStats: {
    total: number;
    withSales: number;
    totalRevenue: number;
    statusDistribution: Record<string, number>;
  };
}

export const useDataValidation = (
  facebookAds: any[],
  whatsappLeads: any[],
  activeClient: string
): DataValidationResult => {
  return useMemo(() => {
    const fbWithInvestment = facebookAds.filter(row => row.investimento > 0);
    const wppWithSales = whatsappLeads.filter(row => row.valor_venda > 0);
    
    const totalInvestment = fbWithInvestment.reduce((sum, row) => sum + (row.investimento || 0), 0);
    const totalRevenue = wppWithSales.reduce((sum, row) => sum + (row.valor_venda || 0), 0);
    
    const campaigns = [...new Set(facebookAds.map(row => row.campanha))].filter(Boolean);
    
    const statusDistribution = whatsappLeads.reduce((acc, row) => {
      const status = row.status || 'sem_status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasData = facebookAds.length > 0 || whatsappLeads.length > 0;
    const totalRecords = facebookAds.length + whatsappLeads.length;

    console.log('📊 useDataValidation: Validação final para cliente:', `"${activeClient}"`, {
      hasData,
      totalRecords,
      facebook: {
        total: facebookAds.length,
        withInvestment: fbWithInvestment.length,
        totalInvestment
      },
      whatsapp: {
        total: whatsappLeads.length,
        withSales: wppWithSales.length,
        totalRevenue
      }
    });

    return {
      hasData,
      totalRecords,
      facebookStats: {
        total: facebookAds.length,
        withInvestment: fbWithInvestment.length,
        totalInvestment,
        campaigns: campaigns.slice(0, 5) // Limit to 5 campaigns for display
      },
      whatsappStats: {
        total: whatsappLeads.length,
        withSales: wppWithSales.length,
        totalRevenue,
        statusDistribution
      }
    };
  }, [facebookAds, whatsappLeads, activeClient]);
};
