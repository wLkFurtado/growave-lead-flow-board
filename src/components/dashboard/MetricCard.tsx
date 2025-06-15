
import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
  className?: string;
  icon?: React.ReactNode;
}

export const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  trend = 'neutral', 
  percentage,
  className = '',
  icon
}: MetricCardProps) => {
  const formatValue = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      minimumFractionDigits: unit === '%' || unit === ' R$' ? 2 : 0, 
      maximumFractionDigits: unit === '%' || unit === ' R$' ? 2 : 0 
    });
  };

  return (
    <div className={`group relative growave-glass border border-slate-700/50 rounded-2xl p-6 transition-all duration-500 hover:border-[#00FF88]/50 hover:shadow-2xl hover:shadow-[#00FF88]/10 hover:-translate-y-2 growave-card-hover ${className}`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/5 to-[#39FF14]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00FF88]/20 to-[#39FF14]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-[#00FF88] group-hover:bg-[#00FF88]/10 transition-all duration-300">
                {icon}
              </div>
            )}
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide group-hover:text-slate-300 transition-colors duration-300">
              {title}
            </h3>
          </div>
          
          {trend !== 'neutral' && (
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              trend === 'up' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {percentage && <span>{percentage > 0 ? '+' : ''}{percentage}%</span>}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl xl:text-4xl font-bold text-white group-hover:text-[#00FF88] transition-all duration-500 animate-fade-in">
              {formatValue(value)}{unit}
            </p>
            {trend !== 'neutral' && (
              <Activity className="w-4 h-4 text-slate-500 group-hover:text-[#00FF88] transition-colors duration-300" />
            )}
          </div>
          
          {percentage && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                trend === 'up' ? 'bg-emerald-400' : trend === 'down' ? 'bg-red-400' : 'bg-slate-400'
              } animate-pulse`}></div>
              <p className={`text-sm font-medium ${
                trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {percentage > 0 ? '+' : ''}{percentage}% vs último período
              </p>
            </div>
          )}
        </div>

        {/* Mini sparkline placeholder */}
        <div className="mt-4 h-8 flex items-end justify-between space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-[#00FF88]/30 rounded-sm transition-all duration-300"
              style={{
                height: `${Math.random() * 100 + 20}%`,
                width: '6px',
                animationDelay: `${i * 50}ms`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
