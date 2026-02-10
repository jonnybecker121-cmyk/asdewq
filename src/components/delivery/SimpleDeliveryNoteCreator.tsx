import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Plus, Truck, Trash2, Download, RotateCcw, FileText } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { toast } from 'sonner';
import headerImage from 'figma:asset/e17036e96c493e942eb229759f7176629b452331.png';
import deliveryHeaderImage from 'figma:asset/0dc968ac64609c78bb942790170ad4e4a7ff4cd7.png';
import confirmationHeaderImage from 'figma:asset/0dc968ac64609c78bb942790170ad4e4a7ff4cd7.png'; 
interface DeliveryItem {
  name: string;
  qty: number;
  price: number;
}

type DocumentType = 'invoice' | 'delivery' | 'confirmation';

export default function SimpleDeliveryNoteCreator() {
  const { ordersOpen, ordersDone } = useOrderStore();
  const orders = [...(ordersOpen || []), ...(ordersDone || [])];
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [documentType, setDocumentType] = useState<DocumentType>('delivery');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    orderNumber: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    items: [] as DeliveryItem[],
    paymentNote: ''
  });

  const handleLoadFromOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        deliveryAddress: 'Standard-Abstellplatz', 
        orderNumber: order.number || '',
        deliveryDate: new Date().toISOString().split('T')[0],
        items: order.items?.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price || 0
        })) || [],
        paymentNote: ''
      });
      toast.success('Auftragsdaten geladen');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', qty: 1, price: 0 }]
    }));
  };

  const updateItem = (index: number, field: keyof DeliveryItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryAddress: '',
      orderNumber: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      items: [],
      paymentNote: ''
    });
  };

  const getDocTitle = () => {
    switch (documentType) {
      case 'invoice': return 'RECHNUNG';
      case 'delivery': return 'LIEFERSCHEIN';
      case 'confirmation': return 'BESTELLBESTÄTIGUNG';
      default: return 'LIEFERSCHEIN';
    }
  };

  // Calculations
  const taxPercent = 5;
  const calcSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.price * item.qty);
    }, 0);
  };
  const sub = calcSubtotal();
  const fee = sub * (taxPercent / 100);
  const net = sub + fee;

  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'usd'
  });

  const exportAsPNG = async () => {
    if (!previewRef.current) {
      console.error('❌ Preview reference not found');
      return;
    }

    if (!(window as any).html2canvas) {
      alert('html2canvas wird geladen... Bitte versuchen Sie es in wenigen Sekunden erneut.');
      return;
    }

    try {
      console.log('🚀 Starting Export...');
      
      const wrapper = previewRef.current.parentElement;
      const originalTransform = wrapper ? wrapper.style.transform : null;
      
      // Temporarily remove transform for export to get natural size
      if (wrapper) {
        wrapper.style.transform = 'none';
      }
      
      const EXPORT_WIDTH = 949;
      const actualHeight = previewRef.current.scrollHeight;
      const EXPORT_HEIGHT = actualHeight;

      const canvas = await (window as any).html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 1,
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        windowWidth: EXPORT_WIDTH,
        windowHeight: EXPORT_HEIGHT,
        useCORS: true,
        allowTaint: false,
        logging: false,
        pixelRatio: 1,
        removeContainer: true,
        onclone: (clonedDoc: any) => {
           const clonedElement = clonedDoc.querySelector('[data-export-target]');
           if (clonedElement) {
             clonedElement.style.transform = 'none';
             clonedElement.style.border = 'none';
             clonedElement.style.boxShadow = 'none';
           }
        }
      });
      
      // Restore transform
      if (wrapper && originalTransform) {
        wrapper.style.transform = originalTransform;
      }
      
      const link = document.createElement('a');
      link.download = `${getDocTitle()}_${formData.orderNumber || 'DRAFT'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Dokument erfolgreich exportiert!');
      
    } catch (error: any) {
      console.error('❌ Export failed:', error);
      toast.error('Export fehlgeschlagen: ' + error.message);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
        {/* Editor Column */}
        <Card className="h-fit xl:sticky xl:top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumenten-Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* Document Type Selection */}
             <div className="space-y-2">
              <Label>Dokumententyp</Label>
              <Select value={documentType} onValueChange={(val: DocumentType) => setDocumentType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Lieferschein</SelectItem>
                  <SelectItem value="confirmation">Bestellbest��tigung</SelectItem>
                  <SelectItem value="invoice">Rechnung</SelectItem>
                </SelectContent>
              </Select>
            </div>

             {/* Auftrag laden */}
             <div className="space-y-2">
              <Label>Aus Auftrag laden</Label>
              <Select onValueChange={handleLoadFromOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Auftrag wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.number} - {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Kundendaten & Lieferung</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kunde / Firma</Label>
                  <Input 
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Firmenname oder Kunde"
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Vorgangs-Nr. / Bestell-Nr.</Label>
                  <Input 
                    value={formData.orderNumber}
                    onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                    placeholder="z.B. 2024-001"
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-Mail Adresse</Label>
                  <Input 
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="buchhaltung@firma.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon / Mobil</Label>
                  <Input 
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="+1 555 0100"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Lieferadresse</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  placeholder="Straße, Hausnummer&#10;PLZ Stadt&#10;Land"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lieferdatum / Belegdatum</Label>
                  <Input 
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verwendungszweck / Notiz</Label>
                  <Input 
                    value={formData.paymentNote}
                    onChange={(e) => handleInputChange('paymentNote', e.target.value)}
                    placeholder="Zusatztext für Footer (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Positionen</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Position
                </Button>
              </div>

              <div className="space-y-2">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-[2]">
                      <Input 
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="Artikel"
                      />
                    </div>
                    <div className="w-20">
                      <Input 
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 1)}
                        placeholder="Menge"
                      />
                    </div>
                     <div className="w-24">
                      <Input 
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="Preis"
                      />
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                    Keine Positionen
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={exportAsPNG}>
                <Download className="h-4 w-4 mr-2" />
                Als PNG exportieren
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Column */}
        <div className="space-y-2 flex justify-center bg-gray-100/50 p-8 rounded-xl border overflow-auto">
          {/* Scaled Wrapper */}
          <div style={{ 
            transform: 'scale(0.8)', // Adjust scale to fit comfortably
            transformOrigin: 'top center',
            width: '949px',
            minHeight: '1200px'
          }}>
            <div 
              ref={previewRef} 
              data-export-target="true"
              style={{ 
                width: '949px',
                minHeight: 'auto',
                border: 'none',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#ffffff',
                fontSize: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                paddingBottom: '0'
              }}
            >
              {/* Header Image */}
              <img 
                src={(documentType === 'delivery' || documentType === 'confirmation') ? deliveryHeaderImage : headerImage} 
                alt="SCHMELZDEPOT" 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block',
                  flexShrink: 0
                }}
              />

              {/* Customer Information Section */}
              <div style={{ 
                borderBottom: '2px solid #e5e7eb', 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                flexShrink: 0 
              }}>
                {/* Left Column - Customer Details */}
                <div style={{ padding: '32px', borderRight: '2px solid #e5e7eb' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Kundenname</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{formData.customerName}</div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>E-Mail</div>
                    <div style={{ fontSize: '18px', color: '#111827' }}>{formData.customerEmail}</div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Telefon</div>
                    <div style={{ fontSize: '18px', color: '#111827' }}>{formData.customerPhone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Lieferadresse</div>
                    <div style={{ fontSize: '18px', color: '#111827' }}>{formData.deliveryAddress}</div>
                  </div>
                </div>

                {/* Right Column - Document Details */}
                <div style={{ padding: '32px' }}>
                   {/* Dynamic Title */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Dokumententyp</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff8000', textTransform: 'uppercase' }}>{getDocTitle()}</div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Vorgangsnummer</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{formData.orderNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Datum</div>
                    <div style={{ fontSize: '18px', color: '#111827' }}>
                      {formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString('de-DE') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ 
                padding: '32px', 
                flex: 1,
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  marginBottom: '32px'
                }}>
                  {/* Table Header - Orange */}
                  <thead>
                    <tr style={{ 
                      backgroundColor: '#ff8000', 
                      color: '#ffffff'
                    }}>
                      <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '16px', fontWeight: 'bold' }}>ARTIKEL</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '16px', fontWeight: 'bold' }}>MENGE</th>
                      {documentType !== 'delivery' && (
                        <>
                          <th style={{ textAlign: 'right', padding: '16px 12px', fontSize: '16px', fontWeight: 'bold' }}>PREIS</th>
                          <th style={{ textAlign: 'right', padding: '16px 12px', fontSize: '16px', fontWeight: 'bold' }}>GESAMT</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {formData.items.map((item, index) => {
                      const itemTotal = item.price * item.qty;
                      return (
                        <tr 
                          key={index} 
                          style={{ 
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                          }}
                        >
                          <td style={{ padding: '14px 12px', fontSize: '16px', color: '#111827' }}>{item.name}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '16px', color: '#111827' }}>{item.qty}</td>
                          {documentType !== 'delivery' && (
                            <>
                              <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: '16px', color: '#111827' }}>{formatter.format(item.price)}</td>
                              <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{formatter.format(itemTotal)}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Summary Section (Only for Invoice/Confirmation) */}
                {documentType !== 'delivery' && (
                  <div style={{ 
                    marginTop: 'auto',
                    paddingTop: '24px',
                    borderTop: '2px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '16px' }}>
                      <span style={{ color: '#6b7280' }}>Zwischensumme</span>
                      <span style={{ fontWeight: 'bold', color: '#111827' }}>{formatter.format(sub)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '16px' }}>
                      <span style={{ color: '#6b7280' }}>Steuer (+5%)</span>
                      <span style={{ fontWeight: 'bold', color: '#111827' }}>+{formatter.format(fee)}</span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      paddingTop: '20px',
                      marginTop: '20px',
                      borderTop: '3px solid #111827',
                      fontSize: '22px',
                      fontWeight: 'bold'
                    }}>
                      <span style={{ color: '#111827' }}>Erwartete Summe</span>
                      <span style={{ color: '#ff8000' }}>{formatter.format(net)}</span>
                    </div>
                  </div>
                )}
                
                {/* Delivery Note Spacer */}
                {documentType === 'delivery' && (
                  <div style={{ marginTop: 'auto', paddingTop: '24px' }}></div>
                )}
              </div>

              {/* Dynamic Footer */}
              <div 
                style={{ 
                  backgroundColor: '#ff8000',
                  color: '#ffffff',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flexShrink: 0,
                  marginTop: 'auto'
                }}
              >
                {documentType === 'delivery' ? (
                  // Delivery Note Footer
                  <>
                     <p style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px', margin: 0 }}>
                      LITTLE SEOUL WEST 121 · SA, LOS SANTOS · SCHMELZDEPOT@STATEV.DE
                    </p>
                    <div style={{ fontSize: '14px', lineHeight: '1.5', opacity: 0.95 }}>
                      <p>Ware bleibt bis zur vollständigen Bezahlung Eigentum des Schmelzdepots.</p>
                      <p>Bitte prüfen Sie die Ware sofort auf Vollständigkeit und Unversehrtheit.</p>
                      <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Vielen Dank für Ihr Vertrauen!</p>
                    </div>
                  </>
                ) : (
                  // Invoice / Confirmation Footer
                  <>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px', margin: 0 }}>
                      LITTLE SEOUL WEST 121 · SA, LOS SANTOS · SCHMELZDEPOT@STATEV.DE
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        Vielen Dank für Ihre Bestellung!
                      </span>
                      <span style={{ fontSize: '14px', opacity: 0.9 }}>
                        Hinweis: Dies ist keine Rechnung. Die Zahlung erfolgt erst nach Erhalt der offiziellen Rechnung. 
                        Die aufgeführten Preise dienen lediglich als vorläufiger Kostenvoranschlag.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}