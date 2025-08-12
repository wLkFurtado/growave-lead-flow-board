
import React, { useEffect, useState } from 'react';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DateSelectorModal } from './DateSelectorModal';
import { DateRange } from '@/types/common';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

type CalendarRange = { from?: Date; to?: Date };

export const DateRangePicker = ({ value, onChange, className }: DateRangePickerProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tempRange, setTempRange] = useState<CalendarRange>({ from: value?.from, to: value?.to });

  useEffect(() => {
    setTempRange({ from: value?.from, to: value?.to });
  }, [value]);

  const formatDateRange = () => {
    if (!value?.from) {
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

  const apply = (range: DateRange) => {
    onChange(range);
    setPopoverOpen(false);
    setSheetOpen(false);
    try {
      localStorage.setItem(
        'lastDateRange',
        JSON.stringify({ from: range.from?.toISOString?.(), to: range.to?.toISOString?.() })
      );
    } catch {}
  };

  const presets = [
    {
      label: 'Hoje',
      getRange: (): DateRange => {
        const now = new Date();
        return { from: startOfDay(now), to: endOfDay(now) };
      },
    },
    {
      label: 'Últimos 7 dias',
      getRange: (): DateRange => {
        const now = new Date();
        const from = startOfDay(subDays(now, 6));
        const to = endOfDay(now);
        return { from, to };
      },
    },
    {
      label: 'Últimos 30 dias',
      getRange: (): DateRange => {
        const now = new Date();
        const from = startOfDay(subDays(now, 29));
        const to = endOfDay(now);
        return { from, to };
      },
    },
    {
      label: 'Este mês',
      getRange: (): DateRange => {
        const now = new Date();
        return { from: startOfMonth(now), to: endOfMonth(now) };
      },
    },
    {
      label: 'Mês passado',
      getRange: (): DateRange => {
        const lastMonth = addMonths(new Date(), -1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
    },
  ];

  const InlineContent = (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button key={p.label} size="sm" variant="secondary" onClick={() => apply(p.getRange())}>
            {p.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setPopoverOpen(false);
            setSheetOpen(false);
            setModalOpen(true);
          }}
        >
          Avançado
        </Button>
      </div>

      <Calendar
        mode="range"
        selected={{ from: tempRange?.from, to: tempRange?.to }}
        onSelect={(r) => {
          if (!r) return;
          const from = r.from || tempRange?.from;
          setTempRange(from ? { from, to: r.to } : {});
        }}
        numberOfMonths={2}
        initialFocus
        className={cn('p-3 pointer-events-auto')}
      />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setPopoverOpen(false); setSheetOpen(false); }}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => tempRange?.from && apply({ from: tempRange.from, to: tempRange.to })}
          disabled={!tempRange?.from}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor="date-range-picker" className="text-sm font-medium">
        Período:
      </label>

      {/* Desktop (Popover) */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-picker"
            variant="outline"
            onClick={() => setPopoverOpen(true)}
            className={cn(
              'hidden md:inline-flex w-full sm:w-auto justify-start text-left font-normal min-w-[280px]',
              !value?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          {InlineContent}
        </PopoverContent>
      </Popover>

      {/* Mobile (Sheet) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            id="date-range-picker"
            variant="outline"
            className={cn(
              'md:hidden w-full justify-start text-left font-normal min-w-[280px]',
              !value?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Selecionar período</SheetTitle>
          </SheetHeader>
          {InlineContent}
        </SheetContent>
      </Sheet>

      {/* Avançado (Modal existente) */}
      <DateSelectorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
