
import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MetricCard = ({ title, value, unit = '', trend = 'neutral', className = '' }: MetricCardProps) => {
  const formatValue = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      minimumFractionDigits: unit === '%' || unit === ' R$' ? 2 : 0, 
      maximumFractionDigits: unit === '%' || unit === ' R$' ? 2 : 0 
    });
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-emerald-500/50 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {trend !== 'neutral' && (
          <div className={`w-2 h-2 rounded-full ${trend === 'up' ? 'bg-emerald-400' : 'bg-red-400'}`} />
        )}
      </div>
      <p className="text-2xl font-bold text-white">
        {formatValue(value)}{unit}
      </p>
    </div>
  );
};
