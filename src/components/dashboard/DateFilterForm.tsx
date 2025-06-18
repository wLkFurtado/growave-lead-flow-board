
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DateRange } from '@/types/common';

interface DateFilterFormProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateFilterForm = ({ value, onChange, className }: DateFilterFormProps) => {
  const [dataInicio, setDataInicio] = useState(
    format(value.from, 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(value.to || value.from, 'yyyy-MM-dd')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const novaDataInicio = new Date(dataInicio + 'T00:00:00');
      const novaDataFim = new Date(dataFim + 'T23:59:59');
      
      if (novaDataInicio > novaDataFim) {
        alert('Data de início não pode ser maior que data de fim');
        return;
      }
      
      onChange({
        from: novaDataInicio,
        to: novaDataFim
      });
    } catch (error) {
      console.error('Erro ao processar datas:', error);
      alert('Erro ao processar as datas. Verifique os valores inseridos.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="data-inicio" className="block text-xs font-medium text-slate-300 mb-1">
            Data de Início:
          </label>
          <input
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="data-fim" className="block text-xs font-medium text-slate-300 mb-1">
            Data de Fim:
          </label>
          <input
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        size="sm"
        className="w-full bg-[#00FF88] text-slate-900 hover:bg-[#00FF88]/90"
      >
        Aplicar Filtro
      </Button>
    </form>
  );
};
