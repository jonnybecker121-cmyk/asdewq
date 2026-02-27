import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';

export function PaymentTestHelper() {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSimulatePayment = () => {
    if (!orderId || !amount) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    // Simulate payment
    const log = {
      timestamp: new Date().toISOString(),
      message: `Simulierte Zahlung: ${amount}$ für Auftrag ${orderId}`,
    };

    const logs = JSON.parse(localStorage.getItem('autopayment-debug-logs') || '[]');
    logs.unshift(log);
    localStorage.setItem('autopayment-debug-logs', JSON.stringify(logs));

    toast.success(`Zahlung simuliert: ${amount}$ für ${orderId}`);
    setOrderId('');
    setAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="test-order-id">Auftrags-ID (z.B. SD-1234)</Label>
          <Input
            id="test-order-id"
            placeholder="SD-1234"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-amount">Betrag ($)</Label>
          <Input
            id="test-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleSimulatePayment} className="w-full">
        Zahlung simulieren
      </Button>
    </div>
  );
}