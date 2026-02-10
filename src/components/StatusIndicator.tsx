import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, AlertCircle, DollarSign, Hourglass } from 'lucide-react';
import { useOrderStore } from './store/orderStore';

interface StatusIndicatorProps {
  orderId: string;
  status: string;
  paidAt?: string;
  showTimer?: boolean;
}

export function StatusIndicator({ orderId, status, paidAt, showTimer = false }: StatusIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { cancelAutoClose } = useOrderStore();

  useEffect(() => {
    if (status === 'Gezahlt' && paidAt && showTimer) {
      const paidTime = new Date(paidAt).getTime();
      const oneHour = 3600000; // 1 hour in milliseconds
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const elapsed = now - paidTime;
        const remaining = oneHour - elapsed;
        
        if (remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(null);
        }
      };

      // Update immediately
      updateTimer();
      
      // Update every minute
      const interval = setInterval(updateTimer, 60000);
      
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [status, paidAt, showTimer]);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Ausstehend':
        return <AlertCircle className="h-3 w-3" />;
      case 'In Bearbeitung':
        return <Clock className="h-3 w-3" />;
      case 'Warten auf Zahlung':
        return <Hourglass className="h-3 w-3" />;
      case 'Gezahlt':
        return <DollarSign className="h-3 w-3" />;
      case 'Abgeschlossen':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'Ausstehend':
        return 'destructive';
      case 'In Bearbeitung':
        return 'outline';
      case 'Warten auf Zahlung':
        return 'secondary';
      case 'Gezahlt':
        return 'default';
      case 'Abgeschlossen':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusClassName = () => {
    switch (status) {
      case 'Ausstehend':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Bearbeitung':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Warten auf Zahlung':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Gezahlt':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Abgeschlossen':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={getStatusVariant() as any}
        className={`flex items-center gap-1 ${getStatusClassName()}`}
      >
        {getStatusIcon()}
        {status}
      </Badge>
      
      {timeRemaining !== null && status === 'Gezahlt' && (
        <Badge 
          variant="outline" 
          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
        >
          <Clock className="h-2.5 w-2.5 mr-1" />
          {formatTimeRemaining(timeRemaining)} bis Abschluss
        </Badge>
      )}
    </div>
  );
}