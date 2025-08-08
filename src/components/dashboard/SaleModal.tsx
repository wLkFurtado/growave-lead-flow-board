
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface SaleModalProps {
  open: boolean;
  leadName?: string;
  onConfirm: (payload: { valorVenda: number; dataFechamento?: Date | null; observacoes?: string | null }) => void;
  onCancel: () => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({ open, leadName, onConfirm, onCancel }) => {
  const [valor, setValor] = useState<string>('');
  const [dataFechamento, setDataFechamento] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValor('');
      setDataFechamento('');
      setObservacoes('');
      setSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    const num = Number(valor.replace(',', '.'));
    if (Number.isNaN(num) || num <= 0) {
      return;
    }
    setSubmitting(true);
    onConfirm({
      valorVenda: num,
      dataFechamento: dataFechamento ? new Date(dataFechamento) : null,
      observacoes: observacoes?.trim() || null
    });
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fechar venda</DialogTitle>
          <DialogDescription>
            Informe os detalhes do fechamento para {leadName || 'o lead'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm mb-1">Valor da venda (R$)</label>
            <Input
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Data do fechamento</label>
            <Input
              type="date"
              value={dataFechamento}
              onChange={(e) => setDataFechamento(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Observações (opcional)</label>
            <Textarea
              placeholder="Ex.: forma de pagamento, observações do atendimento..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
