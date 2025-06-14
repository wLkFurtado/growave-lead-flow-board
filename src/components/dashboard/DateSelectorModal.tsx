
import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DateFilterForm } from './DateFilterForm';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateSelectorModal = ({ open, onOpenChange, value, onChange }: DateSelectorModalProps) => {
  const [tempRange, setTempRange] = useState<DateRange>(value);
  
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
    setTempRange(preset);
  };

  const handleFormChange = (newRange: DateRange) => {
    setTempRange(newRange);
  };

  const handleCalendarSelect = (range: any) => {
    if (range?.from && range?.to) {
      setTempRange({ from: range.from, to: range.to });
    } else if (range?.from) {
      setTempRange({ from: range.from, to: range.from });
    }
  };

  const handleApply = () => {
    onChange(tempRange);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Selecionar Período
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtros Rápidos */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Filtros Rápidos</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {presets.map((preset, index) => (
                <Button
                  key={`preset-${index}`}
                  variant="outline"
                  size="sm"
                  className="bg-slate-700 border-slate-600 text-white hover:bg-[#00FF88] hover:text-slate-900 transition-colors"
                  onClick={() => handlePresetClick(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Seleção Manual */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Seleção Manual</h3>
            <DateFilterForm 
              value={tempRange}
              onChange={handleFormChange}
            />
          </div>

          {/* Calendário */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Calendário</h3>
            <div className="flex justify-center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempRange?.from}
                selected={{ from: tempRange?.from, to: tempRange?.to }}
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
            </div>
          </div>

          {/* Período Selecionado */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Período Selecionado:</h4>
            <p className="text-white">
              {format(tempRange.from, 'dd/MM/yyyy', { locale: ptBR })} - {format(tempRange.to, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              className="bg-[#00FF88] text-slate-900 hover:bg-[#00FF88]/90"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
