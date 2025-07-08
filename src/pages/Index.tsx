
import React from 'react';
import { DashboardContent } from '../components/dashboard/DashboardContent';

const Index = () => {
  console.log('🔄 Index: Componente iniciado');
  
  try {
    return <DashboardContent />;
  } catch (error) {
    console.error('❌ Erro no Index:', error);
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro de Renderização</h1>
          <p className="text-muted-foreground">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
};

export default Index;
