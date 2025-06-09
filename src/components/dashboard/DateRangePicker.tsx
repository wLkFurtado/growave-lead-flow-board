
import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
      label: 'Últimos 7 dias',
      value: { from: subDays(new Date(), 7), to: new Date() }
    },
    {
      label: 'Últimos 30 dias', 
      value: { from: subDays(new Date(), 30), to: new Date() }
    },
    {
      label: 'Este mês',
      value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
    },
    {
      label: 'Mês passado',
      value: { 
        from: startOfMonth(subDays(startOfMonth(new Date()), 1)), 
        to: endOfMonth(subDays(startOfMonth(new Date()), 1)) 
      }
    }
  ];

  const handlePresetClick = (preset: DateRange) => {
    onChange(preset);
    setOpen(false);
  };

  const handleReset = () => {
    onChange({ from: subDays(new Date(), 30), to: new Date() });
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-white">Período:</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full sm:w-auto justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 min-w-[280px]',
              !value && 'text-slate-400'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                  {format(value.to, 'dd/MM/yyyy', { locale: ptBR })}
                </>
              ) : (
                format(value.from, 'dd/MM/yyyy', { locale: ptBR })
              )
            ) : (
              <span>Selecionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
          <div className="flex flex-col lg:flex-row">
            {/* Presets */}
            <div className="border-b lg:border-b-0 lg:border-r border-slate-700">
              <div className="p-3 border-b border-slate-700">
                <h4 className="text-sm font-medium text-white">Períodos Rápidos</h4>
              </div>
              <div className="p-2 space-y-1 min-w-[160px]">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => handlePresetClick(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-400 hover:bg-slate-700 hover:text-white"
                  onClick={handleReset}
                >
                  <X className="w-3 h-3 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <div className="text-center mb-3">
                <h4 className="text-sm font-medium text-white">Selecionar Período Personalizado</h4>
                <p className="text-xs text-slate-400">Clique na data inicial e final</p>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={value?.from}
                selected={{ from: value?.from, to: value?.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onChange({ from: range.from, to: range.to });
                    setOpen(false);
                  } else if (range?.from) {
                    onChange({ from: range.from, to: range.from });
                  }
                }}
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
