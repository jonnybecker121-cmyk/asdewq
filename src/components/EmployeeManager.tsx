import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Users, 
  Plus, 
  Phone, 
  CreditCard, 
  Link as LinkIcon, 
  Trash2, 
  Edit,
  X,
  ExternalLink,
  FileText,
  TableProperties,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useEmployeeStore } from './store/employeeStore';

// Extended Employee type with additional fields
interface ExtendedEmployee {
  id: string;
  name: string;
  phone: string;
  vban: string;
  idCard: string;
  link: string;
  createdAt: string;
  role?: string;
  email?: string;
}

export default function EmployeeManager() {
  const { employees: storeEmployees, addEmployee, updateEmployee: updateEmp, deleteEmployee: deleteEmp } = useEmployeeStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<ExtendedEmployee | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vban: '',
    idCard: '',
    link: ''
  });

  // Map store employees to extended format
  const employees: ExtendedEmployee[] = storeEmployees.map(emp => ({
    id: emp.id,
    name: emp.name,
    phone: emp.phone || '',
    vban: (emp as any).vban || '',
    idCard: (emp as any).idCard || '',
    link: (emp as any).link || '',
    createdAt: (emp as any).createdAt || new Date().toISOString(),
    role: emp.role,
    email: emp.email
  }));

  // Create new employee
  const createEmployee = () => {
    if (!formData.name.trim()) {
      toast.error('Name ist erforderlich');
      return;
    }

    addEmployee({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: '', // Optional
      role: 'Mitarbeiter', // Default role
      vCardUrl: formData.link.trim(),
      ...(formData.vban && { vban: formData.vban.trim() }),
      ...(formData.idCard && { idCard: formData.idCard.trim() }),
      ...(formData.link && { link: formData.link.trim() }),
      createdAt: new Date().toISOString()
    } as any);
    
    toast.success('Mitarbeiter erstellt', {
      description: `${formData.name} wurde hinzugefügt`
    });

    resetForm();
    setIsDialogOpen(false);
  };

  // Update employee
  const updateEmployee = () => {
    if (!editingEmployee) return;
    if (!formData.name.trim()) {
      toast.error('Name ist erforderlich');
      return;
    }

    updateEmp(editingEmployee.id, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      vCardUrl: formData.link.trim(),
      ...(formData.vban && { vban: formData.vban.trim() }),
      ...(formData.idCard && { idCard: formData.idCard.trim() }),
      ...(formData.link && { link: formData.link.trim() })
    } as any);
    
    toast.success('Mitarbeiter aktualisiert', {
      description: `${formData.name} wurde aktualisiert`
    });

    resetForm();
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  // Delete employee
  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    if (confirm(`Mitarbeiter "${employee.name}" wirklich löschen?`)) {
      deleteEmp(id);
      toast.success('Mitarbeiter gelöscht');
    }
  };

  // Open dialog for new employee
  const openNewDialog = () => {
    resetForm();
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing
  const openEditDialog = (employee: ExtendedEmployee) => {
    setFormData({
      name: employee.name,
      phone: employee.phone,
      vban: employee.vban,
      idCard: employee.idCard || '',
      link: employee.link
    });
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      vban: '',
      idCard: '',
      link: ''
    });
  };

  // Open link in new tab
  const openLink = (url: string) => {
    if (!url) return;
    
    // Add https:// if not present
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  // Open Google Form in new tab
  const openGoogleForm = () => {
    window.open('https://docs.google.com/forms/u/0/', '_blank');
  };

  // Copy Google Sheets formulas
  const copyExcelFormulas = () => {
    // Google Sheets Formeln (englische Namen, Semikolon-Trennzeichen für DE)
    const sheetsData = `=SUM(B1:B4)\t=SUM(C1:C4)\t=SUM(D1:D4)\t=SUM(E1:E4)\t=SUM(F1:F4)\t=SUM(G1:G4)\t=SUM(H1:H4)
1,65\t1,65\t1,65\t1,65\t1,65\t1,65\t1,65
=PRODUCT(B5;B6)\t=PRODUCT(C5;C6)\t=PRODUCT(D5;D6)\t=PRODUCT(E5;E6)\t=PRODUCT(F5;F6)\t=PRODUCT(G5;G6)\t=PRODUCT(H5;H6)
\t\t\t\t\t\t
\tSUMME\t\tAUFGERUNDET\t\t\t
\t=SUM(B7:H7)\t\t=ROUNDUP(C10)\t\t\t`;

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sheetsData)
        .then(() => {
          toast.success('Google Sheets Formeln kopiert', {
            description: '6 Zeilen mit Formeln & Berechnungen'
          });
        })
        .catch(() => {
          // Fallback
          copyToClipboardFallback(sheetsData, 'Google Sheets Formeln kopiert', '6 Zeilen mit Formeln & Berechnungen');
        });
    } else {
      copyToClipboardFallback(sheetsData, 'Google Sheets Formeln kopiert', '6 Zeilen mit Formeln & Berechnungen');
    }
  };

  // Fallback copy method
  const copyToClipboardFallback = (text: string, successMessage: string, successDescription?: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        toast.success(successMessage, successDescription ? {
          description: successDescription
        } : undefined);
      } else {
        toast.error('Kopieren fehlgeschlagen');
      }
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  // Copy Lohn Stempel
  const copyLohnStempel = () => {
    // Format current date as DD.MM.YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
    
    const lohnText = `Schmelzdepot Lohn vom ${formattedDate}`;

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lohnText)
        .then(() => {
          toast.success('Lohn Stempel kopiert', {
            description: lohnText
          });
        })
        .catch(() => {
          // Fallback
          copyToClipboardFallback(lohnText, 'Lohn Stempel kopiert', lohnText);
        });
    } else {
      copyToClipboardFallback(lohnText, 'Lohn Stempel kopiert', lohnText);
    }
  };

  // No need to load from localStorage anymore - using store!

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-black dark:text-white">
                  Mitarbeiter-Verwaltung
                </CardTitle>
                <CardDescription className="mt-1">
                  {employees.length} {employees.length === 1 ? 'Mitarbeiter' : 'Mitarbeiter'} registriert
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={openGoogleForm} 
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Formular
              </Button>
              
              <Button 
                onClick={copyExcelFormulas} 
                variant="outline"
                className="gap-2 border-blue-500/40 hover:bg-blue-500/10"
              >
                <TableProperties className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Google-Formeln
              </Button>
              
              <Button 
                onClick={copyLohnStempel} 
                variant="outline"
                className="gap-2 border-primary/40 hover:bg-primary/10"
              >
                <Calendar className="h-4 w-4 text-primary" />
                Lohn Stempel
              </Button>
              
              <Button onClick={openNewDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Neuer Mitarbeiter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Employee List */}
      <Card className="bg-card border border-primary/20">
        <CardContent className="pt-6">
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">Keine Mitarbeiter vorhanden</p>
              <p className="text-sm text-muted-foreground mt-2">
                Klicken Sie auf "Neuer Mitarbeiter" um einen hinzuzufügen
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>VBAN</TableHead>
                    <TableHead>ID-Card</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        {employee.phone ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span 
                              className="cursor-pointer hover:text-foreground transition-colors"
                              onClick={() => {
                                const textArea = document.createElement('textarea');
                                textArea.value = employee.phone;
                                textArea.style.position = 'fixed';
                                textArea.style.opacity = '0';
                                document.body.appendChild(textArea);
                                textArea.select();
                                try {
                                  document.execCommand('copy');
                                  toast.success('Telefonnummer kopiert!', {
                                    description: employee.phone
                                  });
                                } catch (err) {
                                  toast.error('Fehler beim Kopieren');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }}
                              title="Klicken zum Kopieren"
                            >
                              {employee.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.vban ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <code 
                              className="text-sm font-mono bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={() => {
                                const textArea = document.createElement('textarea');
                                textArea.value = employee.vban;
                                textArea.style.position = 'fixed';
                                textArea.style.opacity = '0';
                                document.body.appendChild(textArea);
                                textArea.select();
                                try {
                                  document.execCommand('copy');
                                  toast.success('VBAN kopiert!', {
                                    description: employee.vban
                                  });
                                } catch (err) {
                                  toast.error('Fehler beim Kopieren');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }}
                              title="Klicken zum Kopieren"
                            >
                              {employee.vban}
                            </code>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.idCard ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <code 
                              className="text-sm font-mono bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={() => {
                                const textArea = document.createElement('textarea');
                                textArea.value = employee.idCard;
                                textArea.style.position = 'fixed';
                                textArea.style.opacity = '0';
                                document.body.appendChild(textArea);
                                textArea.select();
                                try {
                                  document.execCommand('copy');
                                  toast.success('ID-Card kopiert!', {
                                    description: employee.idCard
                                  });
                                } catch (err) {
                                  toast.error('Fehler beim Kopieren');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }}
                              title="Klicken zum Kopieren"
                            >
                              {employee.idCard}
                            </code>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.link ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openLink(employee.link)}
                            className="gap-2 text-primary hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Link folgen
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEmployee(employee.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New/Edit Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="bg-card border border-primary/20 max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee 
                ? 'Bearbeiten Sie die Mitarbeiter-Daten' 
                : 'Fügen Sie einen neuen Mitarbeiter hinzu'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Max Mustermann"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-primary/50 focus:border-primary bg-input-background"
              />
            </div>

            {/* Telefonnummer */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Telefonnummer
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+49 123 456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 bg-input-background"
                />
              </div>
            </div>

            {/* VBAN */}
            <div className="space-y-2">
              <Label htmlFor="vban" className="text-foreground">
                VBAN
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="vban"
                  placeholder="VBAN-XXXXXX"
                  value={formData.vban}
                  onChange={(e) => setFormData({ ...formData, vban: e.target.value })}
                  className="pl-10 bg-input-background"
                />
              </div>
            </div>

            {/* ID-Card */}
            <div className="space-y-2">
              <Label htmlFor="idCard" className="text-foreground">
                ID-Card Nummer
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="idCard"
                  placeholder="ID-12345678"
                  value={formData.idCard}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                  className="pl-10 bg-input-background"
                />
              </div>
            </div>

            {/* Link / URL */}
            <div className="space-y-2">
              <Label htmlFor="link" className="text-foreground">
                Link / URL
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  placeholder="https://beispiel.de"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="pl-10 bg-input-background"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Wird beim Klick auf "Link folgen" geöffnet
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
                setEditingEmployee(null);
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={editingEmployee ? updateEmployee : createEmployee}
              className="bg-primary hover:bg-primary/90"
            >
              {editingEmployee ? 'Speichern' : 'Erstellen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
