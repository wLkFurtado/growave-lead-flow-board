
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  trend = 'neutral', 
  percentage,
  className = '' 
}: MetricCardProps) => {
  const formatValue = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      minimumFractionDigits: unit === '%' || unit === ' R$' ? 2 : 0, 
      maximumFractionDigits: unit === '%' || unit === ' R$' ? 2 : 0 
    });
  };

  return (
    <div className={`group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-[#00FF88]/50 hover:shadow-2xl hover:shadow-[#00FF88]/10 hover:-translate-y-1 ${className}`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/5 to-[#39FF14]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
          {trend !== 'neutral' && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {percentage && <span>{percentage > 0 ? '+' : ''}{percentage}%</span>}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-white group-hover:text-[#00FF88] transition-colors duration-300">
            {formatValue(value)}{unit}
          </p>
          {percentage && (
            <p className={`text-sm font-medium ${
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {percentage > 0 ? '+' : ''}{percentage}% vs último período
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
