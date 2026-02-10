import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Truck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Package, 
  Trash2, 
  Timer,
  Check,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useTransportOrderStore, TransportOrder, TransportItem } from './store/transportOrderStore';
import { useInventoryStore } from './store/inventoryStore';
import { toast } from 'sonner';
// Fallback to framer-motion if motion/react fails in this environment
import { motion, AnimatePresence } from 'framer-motion';

// Notification sound URL
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function TransportOrderManager() {
  const { orders, addOrder, markAsArrived, deleteOrder } = useTransportOrderStore();
  const { lastSnapshot } = useInventoryStore();
  
  const [currentItems, setCurrentItems] = useState<TransportItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(0);
  
  const [price, setPrice] = useState<number>(0);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Play sound function
  const playArrivalSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Audio playback failed:', err));
  };

  const handleAddItemToOrder = () => {
    if (!newItemName || newItemQuantity <= 0) {
      toast.error('Artikelname und Menge erforderlich');
      return;
    }
    setCurrentItems([...currentItems, { name: newItemName, quantity: newItemQuantity }]);
    setNewItemName('');
    setNewItemQuantity(0);
  };

  const handleRemoveItemFromOrder = (index: number) => {
    setCurrentItems(currentItems.filter((_, i) => i !== index));
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Support legacy and new multi-item format
    if (currentItems.length === 0 && (!newItemName || newItemQuantity <= 0)) {
      toast.error('Bitte fügen Sie mindestens einen Artikel hinzu.');
      return;
    }

    const itemsToSubmit = currentItems.length > 0 
      ? currentItems 
      : [{ name: newItemName, quantity: newItemQuantity }];

    addOrder({
      itemName: itemsToSubmit[0].name, // Legacy support
      quantity: itemsToSubmit[0].quantity, // Legacy support
      items: itemsToSubmit,
      price: price || 0,
      fromTime: fromTime || 'Sofort',
      toTime: toTime || 'Unbekannt'
    });

    setCurrentItems([]);
    setNewItemName('');
    setNewItemQuantity(0);
    setPrice(0);
    setFromTime('');
    setToTime('');
    setIsAdding(false);
    toast.success('Fahrbefehl erstellt');
  };

  const handleMarkArrived = (id: string) => {
    markAsArrived(id);
    playArrivalSound();
    toast.success('Ware im Lager angekommen', {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
    });
  };

  // Get available items from inventory snapshot for suggestions
  const availableItems = lastSnapshot 
    ? Array.from(new Set([...lastSnapshot.gold, ...lastSnapshot.silver, ...lastSnapshot.items, ...lastSnapshot.machines].map(i => i.name)))
    : [];

  return (
    <div className="space-y-6">
      <Card className="bg-card border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                <Truck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-black dark:text-white">Fahrbefehle</span>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "ghost" : "default"}
              className="gap-2"
            >
              {isAdding ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isAdding ? 'Abbrechen' : 'Neuer Befehl'}
            </Button>
          </div>
          <CardDescription>
            Verwalten Sie Transportaufträge und verfolgen Sie den Wareneingang
          </CardDescription>
        </CardHeader>
        
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-primary/10"
            >
              <CardContent className="pt-6 bg-primary/5">
                <div className="space-y-6">
                  {/* Item Input Section */}
                  <div className="bg-background/40 p-4 rounded-xl border border-primary/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                      <div className="md:col-span-4 space-y-2">
                        <Label htmlFor="itemName">Artikel / Ressource</Label>
                        <Input
                          id="itemName"
                          list="inventory-items"
                          placeholder="z.B. Goldbarren"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <datalist id="inventory-items">
                          {availableItems.map(item => (
                            <option key={item} value={item} />
                          ))}
                        </datalist>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="quantity">Menge</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0"
                          value={newItemQuantity || ''}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleAddItemToOrder}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Hinzufügen
                      </Button>
                    </div>

                    {/* Items List */}
                    {currentItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-primary/5 mt-2">
                        {currentItems.map((item, index) => (
                          <Badge 
                            key={`new-item-${index}`} 
                            variant="secondary" 
                            className="pl-3 pr-1 py-1 gap-2 bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            <span>{item.quantity}x {item.name}</span>
                            <button 
                              onClick={() => handleRemoveItemFromOrder(index)}
                              className="p-0.5 hover:bg-destructive/20 rounded-full text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Details Section */}
                  <form onSubmit={handleAddOrder} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="orderPrice">Gesamtpreis ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="orderPrice"
                          type="number"
                          placeholder="0.00"
                          value={price || ''}
                          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromTime">Ab wann?</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fromTime"
                          placeholder="z.B. 14:00"
                          value={fromTime}
                          onChange={(e) => setFromTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toTime">Bis wann?</Label>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="toTime"
                          placeholder="z.B. 16:00"
                          value={toTime}
                          onChange={(e) => setToTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-10 bg-primary hover:bg-primary/90">
                      Fahrbefehl finalisieren
                    </Button>
                  </form>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="pt-6">
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted/50">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground font-medium">Keine aktiven Fahrbefehle</p>
                <p className="text-sm text-muted-foreground mt-1">Erstellen Sie einen neuen Befehl, um Lieferungen zu koordinieren.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`group relative overflow-hidden border rounded-xl transition-all duration-300 ${
                      order.status === 'arrived' 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : 'bg-card border-primary/10 hover:border-primary/30'
                    }`}
                  >
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          order.status === 'arrived' ? 'bg-green-500/20 text-green-600' : 'bg-primary/10 text-primary'
                        }`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <Badge key={idx} variant={order.status === 'arrived' ? 'secondary' : 'outline'} className={
                                  order.status === 'arrived' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-primary/5'
                                }>
                                  {item.quantity}x {item.name}
                                </Badge>
                              ))
                            ) : (
                              <>
                                <h3 className="font-semibold text-lg">{order.itemName}</h3>
                                <Badge variant={order.status === 'arrived' ? 'secondary' : 'outline'} className={
                                  order.status === 'arrived' ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''
                                }>
                                  {order.quantity} Stk.
                                </Badge>
                              </>
                            )}
                            {order.price > 0 && (
                              <Badge className="bg-primary text-primary-foreground font-bold ml-1">
                                <DollarSign className="h-3 w-3 mr-0.5" />
                                {order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(order.createdAt).toLocaleDateString('de-DE')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {order.fromTime} - {order.toTime}
                            </span>
                            {order.status === 'arrived' && order.arrivedAt && (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Angekommen um {new Date(order.arrivedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {order.status === 'pending' ? (
                          <Button 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            onClick={() => handleMarkArrived(order.id)}
                          >
                            <Check className="h-4 w-4" />
                            Eingang Bestätigen
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg font-medium border border-green-500/20">
                            <Check className="h-4 w-4" />
                            Im Lager
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                            deleteOrder(order.id);
                            toast.info('Fahrbefehl gelöscht');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Status Indicator Bar */}
                    <div className={`h-1 w-full absolute bottom-0 left-0 transition-all duration-500 ${
                      order.status === 'arrived' ? 'bg-green-500' : 'bg-primary/30'
                    }`} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-4 flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary/40" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Offene Lieferungen</p>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500/40" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Erfolgreich Abgeschlossen</p>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'arrived').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-primary/10">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-orange-500/40" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Durchschnittszeit</p>
              <p className="text-2xl font-bold">Live</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}