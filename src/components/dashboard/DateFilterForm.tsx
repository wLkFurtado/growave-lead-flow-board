
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, X } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateFilterFormProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

interface FormData {
  startDate: string;
  endDate: string;
}

export const DateFilterForm = ({ value, onChange, className }: DateFilterFormProps) => {
  const form = useForm<FormData>({
    defaultValues: {
      startDate: format(value.from, 'yyyy-MM-dd'),
      endDate: format(value.to, 'yyyy-MM-dd')
    }
  });

  const onSubmit = (data: FormData) => {
    try {
      const fromDate = new Date(data.startDate);
      const toDate = new Date(data.endDate);
      
      // Garantir que as datas sejam válidas
      if (fromDate && toDate && fromDate <= toDate) {
        onChange({ from: fromDate, to: toDate });
        console.log('=== FILTRO APLICADO ===');
        console.log('Data FROM:', fromDate.toISOString());
        console.log('Data TO:', toDate.toISOString());
      } else {
        console.error('Datas inválidas:', { fromDate, toDate });
      }
    } catch (error) {
      console.error('Erro ao aplicar filtro:', error);
    }
  };

  const handleReset = () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      form.setValue('startDate', format(thirtyDaysAgo, 'yyyy-MM-dd'));
      form.setValue('endDate', format(today, 'yyyy-MM-dd'));
      
      onChange({ from: thirtyDaysAgo, to: today });
    } catch (error) {
      console.error('Erro ao resetar datas:', error);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Data Inicial</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      id="filter-start-date"
                      name="startDate"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Data Final</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      id="filter-end-date"
                      name="endDate"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#00FF88] to-[#39FF14] text-slate-900 font-bold hover:from-[#00FF88]/90 hover:to-[#39FF14]/90"
            >
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtro
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
          
          <div className="text-sm text-slate-400">
            <Calendar className="inline-block w-4 h-4 mr-1" />
            Período atual: {format(value.from, 'dd/MM/yyyy', { locale: ptBR })} até {format(value.to, 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        </form>
      </Form>
    </div>
  );
};
