
// Interface DateRange compatível com react-day-picker
export interface DateRange {
  from: Date;
  to?: Date; // Opcional para compatibilidade com react-day-picker
}

// Função helper para garantir que temos um DateRange válido
export const ensureValidDateRange = (range: DateRange): { from: Date; to: Date } => {
  return {
    from: range.from,
    to: range.to || range.from // Se 'to' não existir, usa 'from' como padrão
  };
};
