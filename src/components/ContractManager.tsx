import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  FileSignature, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  FileText,
  Clock,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign,
  Printer,
  Briefcase,
  Key,
  HandCoins,
  ShieldCheck,
  AlertCircle,
  Repeat,
  Image as ImageIcon
} from 'lucide-react';
import { useContractStore, Contract } from './store/contractStore';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

const CONTRACT_TEMPLATES = {
  Arbeitsvertrag: {
    title: 'Arbeitsvertrag (Standard)',
    content: `1. Leistungserbringung und Unternehmensinteresse:
Der Arbeitnehmer verpflichtet sich, seine Arbeitskraft vollumfänglich und gewissenhaft einzubringen. Er handelt stets loyal und fördert aktiv den Erfolg und das positive Ansehen des Unternehmens (Treuepflicht).

2. Weisungsgebundenheit 
Der Arbeitnehmer respektiert die betrieblichen Strukturen und ist verpflichtet, den fachlichen und disziplinarischen Anweisungen der Geschäftsleitung Folge zu leisten.

3. Vergütung
Festgehalt: Der Arbeitnehmer erhält ein monatliches Brutto-Festgehalt von 2.500,00$. (Netto) Von 2.375,00$

Variable Vergütung (Provision): Der Arbeitnehmer erhält eine umsatzabhängige Vergütung basierend auf der Netto-Rechnungssumme der von ihm vermittelten Aufträge. Der Provisionssatz beträgt insgesamt 35 % der Netto-Rechnungssumme und wird wie folgt aufgeteilt:
30 % kommen als direkte Brutto-Provisionszahlung an den Arbeitnehmer zur Auszahlung.
5 % werden als Pauschale für anfallende Überweisungsgebühren und steuerliche Aufwände verrechnet bzw. einbehalten.

4. Folgen bei Pflichtverletzung 
Bei Nichteinhaltung der vertraglichen Pflichten behält sich der Arbeitgeber arbeitsrechtliche Konsequenzen vor. Dies kann zu einer Kürzung der variablen Vergütung oder zur Beendigung des Arbeitsverhältnisses führen.

5. Laufzeit 
Das Arbeitsverhältnis wird auf unbestimmte Zeit geschlossen.`,
    icon: Briefcase
  },
  Pachtvertrag: {
    title: 'Pachtvertrag / Standplatzmiete',
    content: 'Gegenstand der Pacht ist die Nutzung der Anlage/Fläche [ORT] für betriebliche Zwecke.\n\n1. Pachtzins: Monatlich fällig zum 1. des Monats.\n2. Instandhaltung: Der Pächter verpflichtet sich zur pfleglichen Behandlung.',
    icon: Key
  },
  Darlehensvertrag: {
    title: 'Darlehensvertrag (Intern)',
    content: 'Der Darlehensgeber gewährt dem Darlehensnehmer eine Summe in Höhe von [WERT].\n\n1. Rückzahlung: Die Rückzahlung erfolgt in Raten.\n2. Zinsen: Es wird ein Zinssatz von [X]% vereinbart.',
    icon: HandCoins
  },
  Kooperationsvertrag: {
    title: 'Kooperationsvertrag',
    content: 'Die Partner vereinbaren eine strategische Zusammenarbeit im Bereich [BEREICH].',
    icon: ShieldCheck
  },
  Individuell: {
    title: 'Individuelle Vereinbarung',
    content: 'Freitext für spezielle Absprachen...',
    icon: FileText
  }
};

export default function ContractManager() {
  const { contracts, addContract, updateContractStatus, deleteContract } = useContractStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const contractRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    if (!contractRef.current) return;
    
    if (!(window as any).html2canvas) {
      toast.error('Export-Modul wird geladen...');
      return;
    }

    try {
      const EXPORT_WIDTH = 949;
      // We'll calculate height dynamically but keep the same scale logic as Invoice
      const canvas = await (window as any).html2canvas(contractRef.current, {
        backgroundColor: '#ffffff',
        scale: 1,
        width: EXPORT_WIDTH,
        windowWidth: EXPORT_WIDTH,
        useCORS: true,
        logging: false,
        pixelRatio: 1,
      });

      const link = document.createElement('a');
      link.download = `SCHMELZDEPOT_Vertrag_${selectedContract?.contractNumber || 'DOC'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG erfolgreich exportiert');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export fehlgeschlagen');
    }
  };

  const [formData, setFormData] = useState<{
    contractNumber: string;
    partnerName: string;
    partnerAddress: string;
    type: Contract['type'];
    title: string;
    content: string;
    value: number;
    netValue: number;
    date: string;
    endDate: string;
    isRecurring: boolean;
    recurringInterval: Contract['recurringInterval'];
  }>({
    contractNumber: `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    partnerName: '',
    partnerAddress: '',
    type: 'Kooperationsvertrag',
    title: 'Geschäftsvertrag / Rahmenvereinbarung',
    content: 'Dieser Vertrag regelt die Zusammenarbeit...',
    value: 0,
    netValue: 0,
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    isRecurring: false,
    recurringInterval: 'monthly'
  });

  const handleTemplateChange = (type: Contract['type']) => {
    const template = CONTRACT_TEMPLATES[type];
    const isArbeitsvertrag = type === 'Arbeitsvertrag';
    
    setFormData({
      ...formData,
      type,
      title: template.title,
      content: template.content,
      value: isArbeitsvertrag ? 2500 : 0,
      netValue: isArbeitsvertrag ? 2375 : 0
    });
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerName || !formData.title) {
      toast.error('Bitte Partner und Titel angeben');
      return;
    }

    addContract(formData);
    setFormData({
      contractNumber: `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      partnerName: '',
      partnerAddress: '',
      type: 'Kooperationsvertrag',
      title: 'Geschäftsvertrag / Rahmenvereinbarung',
      content: 'Dieser Vertrag regelt die Zusammenarbeit...',
      value: 0,
      netValue: 0,
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      isRecurring: false,
      recurringInterval: 'monthly'
    });
    setIsAdding(false);
    toast.success('Vertrag erfolgreich erstellt');
  };

  const filteredContracts = contracts.filter(c => 
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    if (!selectedContract) return;
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* Header with Search and Add */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Verträge durchsuchen..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2 w-full md:w-auto">
          {isAdding ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Abbrechen' : 'Neuer Vertrag'}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/20 bg-card shadow-xl">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-primary" />
                  Vertrags-Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateContract} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Vertragstyp</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(val: Contract['type']) => handleTemplateChange(val)}
                      >
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Typ auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arbeitsvertrag">Arbeitsvertrag</SelectItem>
                          <SelectItem value="Pachtvertrag">Pachtvertrag</SelectItem>
                          <SelectItem value="Darlehensvertrag">Darlehensvertrag</SelectItem>
                          <SelectItem value="Kooperationsvertrag">Kooperationsvertrag</SelectItem>
                          <SelectItem value="Individuell">Individuelle Vereinbarung</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vertragsnummer</Label>
                        <Input value={formData.contractNumber} readOnly className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <Label>Datum</Label>
                        <Input 
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Vertragspartner (Unternehmen / Person)</Label>
                      <Input 
                        placeholder="z.B. Rohstoff Handel GmbH"
                        value={formData.partnerName}
                        onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Adresse des Partners</Label>
                      <Textarea 
                        placeholder="Musterstraße 1, 12345 Stadt"
                        rows={2}
                        value={formData.partnerAddress}
                        onChange={(e) => setFormData({...formData, partnerAddress: e.target.value})}
                      />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-border">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-primary" />
                            Wiederkehrende Zahlung?
                          </Label>
                          <p className="text-[10px] text-muted-foreground">Regelmäßige Buchung aktivieren</p>
                        </div>
                        <Switch 
                          checked={formData.isRecurring} 
                          onCheckedChange={(checked) => setFormData({...formData, isRecurring: checked})} 
                        />
                      </div>
                      
                      {formData.isRecurring && (
                        <Select 
                          value={formData.recurringInterval} 
                          onValueChange={(val: any) => setFormData({...formData, recurringInterval: val})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Intervall" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Wöchentlich</SelectItem>
                            <SelectItem value="monthly">Monatlich</SelectItem>
                            <SelectItem value="yearly">Jährlich</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{formData.type === 'Arbeitsvertrag' ? 'Brutto ($)' : 'Vertragswert ($)'}</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            className="pl-10 h-12"
                            value={formData.value || ''}
                            onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      
                      {formData.type === 'Arbeitsvertrag' ? (
                        <div className="space-y-2">
                          <Label>Netto ($)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              className="pl-10 h-12 border-primary/30 bg-primary/5"
                              value={formData.netValue || ''}
                              onChange={(e) => setFormData({...formData, netValue: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Enddatum (Optional)</Label>
                          <Input 
                            type="date" 
                            className="h-12"
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                    
                    {formData.type === 'Arbeitsvertrag' && (
                      <div className="space-y-2">
                        <Label>Enddatum (Optional)</Label>
                        <Input 
                          type="date" 
                          className="h-12"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Vertragstitel</Label>
                      <Input 
                        placeholder="z.B. Kooperationsvertrag Q3"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Vertragsinhalt / Klauseln</Label>
                      <Textarea 
                        placeholder="Vertragstext hier einfügen..."
                        rows={5}
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">
                      Vertrag erstellen & speichern
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-2">
            <Clock className="h-4 w-4" />
            Letzte Verträge
          </h3>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-xl border-dashed">
              <FileSignature className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">Keine Verträge gefunden</p>
            </div>
          ) : (
            filteredContracts.map(c => (
              <Card 
                key={c.id} 
                className={`cursor-pointer transition-all hover:border-primary/50 group ${selectedContract?.id === c.id ? 'border-primary bg-primary/5 shadow-md' : ''}`}
                onClick={() => setSelectedContract(c)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/20">
                      {c.contractNumber}
                    </Badge>
                    <Badge className={
                      c.status === 'signed' ? 'bg-green-500/10 text-green-600' : 
                      c.status === 'expired' ? 'bg-red-500/10 text-red-600' :
                      c.status === 'archived' ? 'bg-gray-500/10 text-gray-600' : 'bg-orange-500/10 text-orange-600'
                    }>
                      {c.status === 'signed' ? 'Signiert' : c.status === 'expired' ? 'Abgelaufen' : c.status === 'archived' ? 'Archiv' : 'Entwurf'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {c.type === 'Arbeitsvertrag' && <Briefcase className="h-3 w-3 text-primary" />}
                    {c.type === 'Pachtvertrag' && <Key className="h-3 w-3 text-primary" />}
                    {c.type === 'Darlehensvertrag' && <HandCoins className="h-3 w-3 text-primary" />}
                    <h4 className="font-bold truncate group-hover:text-primary transition-colors">{c.partnerName}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{c.title}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.date).toLocaleDateString('de-DE')}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      ${c.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <Card className="border-primary/20 shadow-lg sticky top-6">
              <CardHeader className="border-b bg-card py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Vorschau: {selectedContract.contractNumber}</CardTitle>
                  <CardDescription>Erstellt am {new Date(selectedContract.createdAt).toLocaleDateString('de-DE')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPNG}>
                    <ImageIcon className="h-4 w-4" />
                    PNG Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                    Drucken
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      updateContractStatus(selectedContract.id, 'signed');
                      toast.success('Vertrag als signiert markiert');
                    }}
                    disabled={selectedContract.status === 'signed'}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Signieren
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => {
                      deleteContract(selectedContract.id);
                      setSelectedContract(null);
                      toast.info('Vertrag gelöscht');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-white text-black overflow-hidden">
                <div 
                  ref={contractRef}
                  style={{ 
                    width: '949px',
                    padding: '48px',
                    minHeight: '1177px',
                    fontFamily: 'serif',
                    lineHeight: '1.625',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                    <div>
                      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#ff8000', marginBottom: '8px' }}>SCHMELZDEPOT</h1>
                      {/* <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#4b5563' }}>Industrielle Rohstoff-Logistik & Management</p> */}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', lineHeight: '1.25', color: '#000000', fontFamily: 'sans-serif' }}>
                      <p>LITTLE SEOUL WEST 121 · SA, LOS SANTOS</p>
                      <p style={{ textTransform: 'uppercase' }}>SCHMELZDEPOT@STATEV.DE</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '48px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Vertragspartner</p>
                    <div style={{ padding: '16px', borderLeft: '4px solid #ff8000', backgroundColor: '#f9fafb' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#111827' }}>{selectedContract.partnerName}</p>
                      <p style={{ whiteSpace: 'pre-line', color: '#4b5563' }}>{selectedContract.partnerAddress}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '48px', borderBottom: '2px solid #ff8000', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ padding: '8px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                        {selectedContract.type === 'Arbeitsvertrag' && <Briefcase style={{ height: '24px', width: '24px', color: '#ff8000' }} />}
                        {selectedContract.type === 'Pachtvertrag' && <Key style={{ height: '24px', width: '24px', color: '#ff8000' }} />}
                        {selectedContract.type === 'Darlehensvertrag' && <HandCoins style={{ height: '24px', width: '24px', color: '#ff8000' }} />}
                        {selectedContract.type === 'Kooperationsvertrag' && <ShieldCheck style={{ height: '24px', width: '24px', color: '#ff8000' }} />}
                        {selectedContract.type === 'Individuell' && <FileText style={{ height: '24px', width: '24px', color: '#ff8000' }} />}
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.025em', color: '#111827' }}>{selectedContract.title}</h2>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', fontFamily: 'monospace', color: '#6b7280' }}>
                      <span>Typ: {selectedContract.type}</span>
                      <span>Ref: {selectedContract.contractNumber}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '18px' }}>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.625', color: '#1f2937' }}>
                      {selectedContract.content}
                    </div>

                    <div style={{ paddingTop: '96px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      <div style={{ padding: '24px', border: '2px dashed #ffedd5', borderRadius: '12px', backgroundColor: '#fffaf5' }}>
                        <p style={{ fontWeight: 'bold', color: '#ff8000', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle style={{ height: '20px', width: '20px', color: '#ff8000' }} />
                          Digitale Bestätigung (VMail)
                        </p>
                        <p style={{ fontSize: '18px', lineHeight: '1.625', color: '#1f2937' }}>
                          Zum Bestätigen des Vertrages antworten Sie bitte auf diese VMail mit: 
                          <span style={{ display: 'block', marginTop: '8px', fontFamily: 'monospace', backgroundColor: '#ffffff', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                            „Ich bestätige den Vertrag“, Ihrem Vor- und Zunamen sowie dem Datum.
                          </span>
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '96px', paddingTop: '32px' }}>
                        <div>
                          <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '48px', borderBottom: '1px solid #000000', paddingBottom: '4px', color: '#6b7280' }}>Bestätigung SCHMELZDEPOT</p>
                          <p style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '24px', color: '#1e40af', opacity: '0.8' }}>Inhaber John_Hecht</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '48px', borderBottom: '1px solid #000000', paddingBottom: '4px', color: '#6b7280' }}>Bestätigung {selectedContract.partnerName}</p>
                          {selectedContract.status === 'signed' ? (
                            <div style={{ position: 'relative' }}>
                              <CheckCircle style={{ position: 'absolute', top: '-48px', right: '-16px', height: '64px', width: '64px', color: '#dcfce7' }} />
                              <p style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '24px', color: '#15803d' }}>Per VMail bestätigt</p>
                            </div>
                          ) : (
                            <p style={{ color: '#d1d5db', fontStyle: 'italic', fontSize: '20px' }}>Warten auf VMail-Antwort...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-card/50 border border-dashed rounded-2xl p-12 text-center">
              <div className="p-6 bg-primary/10 rounded-full mb-6">
                <FileSignature className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Kein Vertrag ausgewählt</h2>
              <p className="text-muted-foreground max-w-md">
                Wählen Sie einen Vertrag aus der Liste aus, um die Vorschau anzuzeigen, oder erstellen Sie ein neues Dokument.
              </p>
              <Button onClick={() => setIsAdding(true)} variant="outline" className="mt-8 gap-2">
                <Plus className="h-4 w-4" />
                Ersten Vertrag erstellen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}