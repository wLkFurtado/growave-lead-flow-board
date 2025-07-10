
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DateSelectorModal } from './DateSelectorModal';
import { DateRange } from '@/types/common';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker = ({ value, onChange, className }: DateRangePickerProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const formatDateRange = () => {
    if (!value || !value.from) {
      return 'Selecionar período';
    }
    
    try {
      const fromFormatted = format(value.from, 'dd/MM/yyyy', { locale: ptBR });
      const toFormatted = format(value.to || value.from, 'dd/MM/yyyy', { locale: ptBR });
      
      if (fromFormatted === toFormatted) {
        return fromFormatted;
      }
      
      return `${fromFormatted} - ${toFormatted}`;
    } catch (error) {
      console.error('Erro ao formatar datas:', error);
      return 'Selecionar período';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor="date-range-picker" className="text-sm font-medium text-white">
        Período:
      </label>
      
      <Button
        id="date-range-picker"
        variant="outline"
        onClick={() => setModalOpen(true)}
        className="w-full sm:w-auto justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 min-w-[280px]"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDateRange()}
      </Button>

      <DateSelectorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
