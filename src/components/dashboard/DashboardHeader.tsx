
import React from 'react';

export const DashboardHeader = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard Marketing
          </h1>
          <p className="text-slate-400 text-sm">
            Monitoramento e análise de campanhas digitais
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
            Performance Analytics
          </div>
        </div>
      </div>
    </header>
  );
};
