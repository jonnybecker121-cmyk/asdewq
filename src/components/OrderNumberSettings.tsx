import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Save, RotateCcw, Hash, Info } from 'lucide-react';
import { useOrderStore } from './store/orderStore';
import { toast } from 'sonner@2.0.3';

export function OrderNumberSettings() {
  const { orderPrefix, orderDigits, nextCounter, updateSettings } = useOrderStore();
  
  const [localPrefix, setLocalPrefix] = useState(orderPrefix);
  const [localDigits, setLocalDigits] = useState(orderDigits.toString());
  const [localCounter, setLocalCounter] = useState(nextCounter.toString());

  const handleSave = () => {
    const digits = parseInt(localDigits) || 4;
    const counter = parseInt(localCounter) || 1;

    if (digits < 1 || digits > 10) {
      toast.error('Anzahl Ziffern muss zwischen 1 und 10 liegen');
      return;
    }

    if (counter < 1) {
      toast.error('Nächste Nummer muss mindestens 1 sein');
      return;
    }

    updateSettings({
      prefix: localPrefix,
      digits: digits,
      counter: counter
    });

    toast.success('Bestellnummern-Einstellungen gespeichert!', {
      description: `Neue Aufträge beginnen mit: ${getPreviewNumber()}`
    });
  };

  const handleReset = () => {
    setLocalPrefix('SD');
    setLocalDigits('4');
    setLocalCounter('1145');
    
    updateSettings({
      prefix: 'SD',
      digits: 4,
      counter: 1145
    });

    toast.success('Einstellungen zurückgesetzt', {
      description: 'Standardwerte wiederhergestellt: SD1145'
    });
  };

  const getPreviewNumber = () => {
    const digits = parseInt(localDigits) || 4;
    const counter = parseInt(localCounter) || 1;
    return `${localPrefix}${String(counter).padStart(digits, '0')}`;
  };

  const getCurrentNumber = () => {
    return `${orderPrefix}${String(nextCounter).padStart(orderDigits, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Current Settings Info */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Aktuelle Bestellnummer:</span>
            <Badge variant="default" className="bg-primary text-primary-foreground font-mono text-base">
              {getCurrentNumber()}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Settings Form */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Prefix */}
        <div className="space-y-2">
          <Label htmlFor="order-prefix" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            Präfix
          </Label>
          <Input
            id="order-prefix"
            value={localPrefix}
            onChange={(e) => setLocalPrefix(e.target.value.toUpperCase())}
            placeholder="SD"
            maxLength={6}
            className="font-mono font-bold"
          />
          <p className="text-xs text-muted-foreground">
            Buchstaben vor der Nummer (z.B. SD, ORD, INV)
          </p>
        </div>

        {/* Digits */}
        <div className="space-y-2">
          <Label htmlFor="order-digits" className="flex items-center gap-2">
            Anzahl Ziffern
          </Label>
          <Input
            id="order-digits"
            type="number"
            min="1"
            max="10"
            value={localDigits}
            onChange={(e) => setLocalDigits(e.target.value)}
            placeholder="4"
          />
          <p className="text-xs text-muted-foreground">
            Minimale Länge der Nummer (mit führenden Nullen)
          </p>
        </div>

        {/* Next Counter */}
        <div className="space-y-2">
          <Label htmlFor="order-counter" className="flex items-center gap-2">
            Nächste Nummer
          </Label>
          <Input
            id="order-counter"
            type="number"
            min="1"
            value={localCounter}
            onChange={(e) => setLocalCounter(e.target.value)}
            placeholder="1145"
          />
          <p className="text-xs text-muted-foreground">
            Startwert für neue Bestellnummern
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Vorschau der nächsten Bestellnummer:</p>
            <p className="text-3xl font-bold font-mono text-primary tracking-wider">
              {getPreviewNumber()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Format</p>
            <Badge variant="outline" className="font-mono">
              {localPrefix}
              {'{'}
              {'0'.repeat(parseInt(localDigits) || 4)}
              {'}'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="gap-2 flex-1">
          <Save className="h-4 w-4" />
          Einstellungen speichern
        </Button>
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Zurücksetzen
        </Button>
      </div>

      {/* Examples */}
      <div className="pt-4 border-t">
        <p className="text-sm font-medium mb-3">📋 Beispiele:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { prefix: 'SD', digits: 4, counter: 1145, label: 'Standard (SCHMELZDEPOT)' },
            { prefix: 'ORD', digits: 5, counter: 1, label: 'Order-Format' },
            { prefix: 'INV', digits: 6, counter: 100, label: 'Invoice-Format' },
            { prefix: 'REF', digits: 3, counter: 500, label: 'Referenz-Format' },
          ].map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLocalPrefix(example.prefix);
                setLocalDigits(example.digits.toString());
                setLocalCounter(example.counter.toString());
              }}
              className="p-3 border rounded-lg hover:bg-accent/10 hover:border-primary/50 transition-colors text-left group"
            >
              <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                {example.label}
              </p>
              <p className="font-mono font-bold text-sm group-hover:text-primary transition-colors">
                {example.prefix}{String(example.counter).padStart(example.digits, '0')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Warning */}
      <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>⚠️ Hinweis:</strong> Das Ändern dieser Einstellungen beeinflusst nur <strong>neue</strong> Aufträge. 
          Bestehende Aufträge behalten ihre ursprüngliche Nummer. 
          Eine hohe Startnummer verhindert Duplikate mit bereits erstellten Aufträgen.
        </AlertDescription>
      </Alert>
    </div>
  );
}
