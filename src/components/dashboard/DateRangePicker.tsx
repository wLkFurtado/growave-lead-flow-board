
import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays as sub } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateFilterForm } from './DateFilterForm';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker = ({ value, onChange, className }: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  
  const presets = [
    {
      label: 'Hoje',
      value: { from: startOfDay(new Date()), to: endOfDay(new Date()) }
    },
    {
      label: 'Ontem', 
      value: { 
        from: startOfDay(subDays(new Date(), 1)), 
        to: endOfDay(subDays(new Date(), 1)) 
      }
    },
    {
      label: 'Últimos 7 dias', 
      value: { from: subDays(new Date(), 7), to: new Date() }
    },
    {
      label: 'Mês',
      value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
    }
  ];

  const handlePresetClick = (preset: DateRange) => {
    try {
      console.log('=== PRESET SELECIONADO ===');
      console.log('Preset:', preset);
      onChange(preset);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao aplicar preset:', error);
    }
  };

  const handleFormChange = (newRange: DateRange) => {
    try {
      console.log('=== FORM CHANGE ===');
      console.log('Nova range:', newRange);
      onChange(newRange);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao aplicar filtro do form:', error);
    }
  };

  const handleReset = () => {
    try {
      const defaultRange = { from: subDays(new Date(), 7), to: new Date() };
      console.log('=== RESET FILTRO ===');
      console.log('Range padrão:', defaultRange);
      onChange(defaultRange);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao resetar filtro:', error);
    }
  };

  const handleCalendarSelect = (range: any) => {
    try {
      if (range?.from && range?.to) {
        console.log('=== CALENDAR SELECT ===');
        console.log('Range selecionada:', range);
        onChange({ from: range.from, to: range.to });
        setOpen(false);
      } else if (range?.from) {
        onChange({ from: range.from, to: range.from });
      }
    } catch (error) {
      console.error('Erro ao selecionar no calendário:', error);
    }
  };
  
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor="date-range-picker" className="text-sm font-medium text-white">
        Período:
      </label>
      
      {/* Filtros rápidos sempre visíveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {presets.map((preset, index) => (
          <Button
            key={`preset-${index}`}
            id={`quick-filter-${index}`}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-white hover:bg-[#00FF88] hover:text-slate-900 transition-colors"
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      
      {/* Formulário simples sempre visível */}
      <DateFilterForm 
        value={value}
        onChange={handleFormChange}
        className="mb-4"
      />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-picker"
            name="dateRangePicker"
            variant="outline"
            className={cn(
              'w-full sm:w-auto justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 min-w-[280px]',
              !value && 'text-slate-400'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Seleção Personalizada
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
          <div className="p-3">
            <div className="text-center mb-3">
              <h4 className="text-sm font-medium text-white">Selecionar Período Personalizado</h4>
              <p className="text-xs text-slate-400">Clique na data inicial e final</p>
            </div>
            <Calendar
              id="date-range-calendar"
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={{ from: value?.from, to: value?.to }}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
              classNames={{
                day_selected: "bg-[#00FF88] text-slate-900 hover:bg-[#00FF88] hover:text-slate-900",
                day_range_middle: "bg-[#00FF88]/20 text-white",
                day_range_end: "bg-[#00FF88] text-slate-900",
                day_today: "bg-slate-600 text-white"
              }}
              disabled={(date) => date > new Date()}
            />
            <div className="mt-3 pt-3 border-t border-slate-700">
              <Button
                id="reset-button"
                variant="ghost"
                size="sm"
                className="w-full justify-center text-slate-400 hover:bg-slate-700 hover:text-white"
                onClick={handleReset}
              >
                <X className="w-3 h-3 mr-2" />
                Resetar para Últimos 7 dias
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
