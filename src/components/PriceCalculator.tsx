import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Calculator, 
  Boxes, 
  Trash2, 
  Plus, 
  ShoppingCart, 
  Cylinder,
  Save,
  Target,
  Cloud,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useCalculatorStore } from './store/calculatorStore';
import type { MaterialUsage } from './store/calculatorStore';

interface PriceCalculatorProps {
  syncTrigger?: number;
}

export default function PriceCalculator({ syncTrigger = 0 }: PriceCalculatorProps = {}) {
  // Store Hooks
  const { 
    materials, 
    endProducts, 
    addMaterial, 
    deleteMaterial, 
    addEndProduct, 
    deleteEndProduct,
  } = useCalculatorStore();

  // Local State
  const [activeTab, setActiveTab] = useState<'calculator' | 'products' | 'target'>('calculator');
  
  // -- CALCULATOR STATE --
  const [calcName, setCalcName] = useState('');
  const [calcIngredients, setCalcIngredients] = useState<MaterialUsage[]>([]);
  const [currentIngId, setCurrentIngId] = useState('');
  const [currentIngQty, setCurrentIngQty] = useState('1');
  const [margin, setMargin] = useState('20');
  
  // -- QUICK ADD MATERIALS STATE --
  const [quickRawName, setQuickRawName] = useState('');
  const [quickRawPrice, setQuickRawPrice] = useState('');

  // Helper: Format Currency - Updated to Dollar ($)
  const fmtMoney = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(val);

  // --- ACTIONS ---

  // Quick Add Raw Material
  const handleAddRaw = () => {
    if (!quickRawName || !quickRawPrice) return toast.error('Name und Preis erforderlich');
    addMaterial({
      name: quickRawName,
      ekPrice: parseFloat(quickRawPrice),
      unit: 'Stück',
      category: 'raw'
    });
    setQuickRawName('');
    setQuickRawPrice('');
    toast.success('Rohstoff hinzugefügt');
  };

  // Add Ingredient to Calculator
  const addIngredientToCalc = () => {
    if (!currentIngId) return;
    const qty = parseFloat(currentIngQty);
    if (qty <= 0) return;

    setCalcIngredients(prev => [...prev, { materialId: currentIngId, quantity: qty }]);
    setCurrentIngId('');
    setCurrentIngQty('1');
  };

  // Remove Ingredient
  const removeIngredient = (idx: number) => {
    setCalcIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculate Totals
  const calculateTotals = () => {
    const cost = calcIngredients.reduce((sum, ing) => {
      const mat = materials.find(m => m.id === ing.materialId);
      return sum + ((mat?.ekPrice || 0) * ing.quantity);
    }, 0);
    
    const marginPercent = parseFloat(margin) || 0;
    const profit = cost * (marginPercent / 100);
    const final = cost + profit;

    return { cost, profit, final };
  };

  const totals = calculateTotals();

  // Save Calculator Result as End Product
  const saveCalculatorResult = () => {
    if (!calcName) return toast.error('Bitte Namen eingeben');
    if (calcIngredients.length === 0) return toast.error('Keine Materialien gewählt');

    addEndProduct({
      name: calcName,
      materials: calcIngredients,
      productionTime: 0,
      productionCost: 0,
      markup: parseFloat(margin) || 0,
      markupType: 'percent',
      vkPrice: totals.final,
      category: 'part'
    });

    toast.success(`Produkt "${calcName}" gespeichert!`);
    setCalcIngredients([]);
    setCalcName('');
  };

  // --- STANDARD RECIPES LOADER ---
  const loadStandardRecipes = () => {
    const neededMaterials = [
      { name: 'Eisenerz', ekPrice: 2 },
      { name: 'Holzbrett', ekPrice: 5 },
      { name: 'Eisenbarren', ekPrice: 25 }, 
      { name: 'Kupfererz', ekPrice: 3 },
      { name: 'Silbererz', ekPrice: 4 },
      { name: 'Golderz', ekPrice: 10 },
      { name: 'Quarzsand', ekPrice: 1 },
      { name: 'Kupferbarren', ekPrice: 35 }, 
      { name: 'Zinkbarren', ekPrice: 30 }, 
      { name: 'Kohlebrocken', ekPrice: 5 },
      { name: 'Sphalerit', ekPrice: 4 },
      { name: 'Titanerz', ekPrice: 15 },
      { name: 'Felsbrocken', ekPrice: 2 },
      { name: 'Graphit', ekPrice: 8 },
      { name: 'Lithium', ekPrice: 20 },
    ];

    // 1. Sync Materials
    neededMaterials.forEach( needed => {
       const existing = useCalculatorStore.getState().materials.find(m => m.name === needed.name);
       if (!existing) {
         addMaterial({
            name: needed.name,
            ekPrice: needed.ekPrice,
            unit: 'Stück',
            category: 'raw'
         });
       }
    });

    // 2. Add Recipes (Delayed to ensure materials are in store)
    setTimeout(() => {
       const currentMaterials = useCalculatorStore.getState().materials;
       const getM = (name: string) => currentMaterials.find(m => m.name === name)?.id;
       
       const recipes = [
         { name: 'Eisenbarren', ingredients: [{ name: 'Eisenerz', qty: 10 }, { name: 'Holzbrett', qty: 1 }] },
         { name: 'Stahlbarren', ingredients: [{ name: 'Eisenbarren', qty: 3 }, { name: 'Holzbrett', qty: 1 }] },
         { name: 'Kupferbarren', ingredients: [{ name: 'Kupfererz', qty: 10 }, { name: 'Holzbrett', qty: 1 }] },
         { name: 'Silberbarren', ingredients: [{ name: 'Silbererz', qty: 10 }, { name: 'Holzbrett', qty: 1 }] },
         { name: 'Goldbarren', ingredients: [{ name: 'Golderz', qty: 10 }, { name: 'Holzbrett', qty: 1 }] },
         { name: 'Glas', ingredients: [{ name: 'Quarzsand', qty: 80 }, { name: 'Holzbrett', qty: 1 }] },
         { name: 'Messing', ingredients: [{ name: 'Kupferbarren', qty: 2 }, { name: 'Zinkbarren', qty: 1 }, { name: 'Kohlebrocken', qty: 2 }] },
         { name: 'Zinkbarren', ingredients: [{ name: 'Sphalerit', qty: 12 }, { name: 'Kohlebrocken', qty: 2 }] },
         { name: 'Titanbarren', ingredients: [{ name: 'Titanerz', qty: 10 }, { name: 'Kohlebrocken', qty: 4 }] },
         { name: 'Zement / Beton', ingredients: [{ name: 'Felsbrocken', qty: 5 }, { name: 'Kohlebrocken', qty: 2 }] },
         { name: 'Gusseisen', ingredients: [{ name: 'Eisenbarren', qty: 1 }, { name: 'Kohlebrocken', qty: 2 }] },
         { name: 'Carbon / Graphit', ingredients: [{ name: 'Graphit', qty: 3 }] },
         { name: 'Lithium', ingredients: [{ name: 'Lithium', qty: 3 }] },
       ];
       
       let addedCount = 0;
       recipes.forEach(recipe => {
         const matUsages: MaterialUsage[] = [];
         let possible = true;
         
         recipe.ingredients.forEach(ing => {
            const mId = getM(ing.name);
            if (mId) {
              matUsages.push({ materialId: mId, quantity: ing.qty });
            } else {
              possible = false;
            }
         });
         
         if (possible && matUsages.length > 0) {
            const existingProd = useCalculatorStore.getState().endProducts.find(p => p.name === recipe.name);
            if (!existingProd) {
               addEndProduct({
                 name: recipe.name,
                 materials: matUsages,
                 productionTime: 0,
                 productionCost: 0,
                 markup: 20,
                 markupType: 'percent',
                 vkPrice: 0, 
                 category: 'part'
               });
               addedCount++;
            }
         }
       });
       
       if (addedCount > 0) {
         toast.success(`${addedCount} Standard-Rezepte & Materialien geladen!`);
       } else {
         toast.info('Standards bereits vorhanden.');
       }
    }, 100);
  };

  // --- RENDER HELPERS ---
  const rawMaterials = materials.filter(m => m.category === 'raw' || !m.category); // Legacy support
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/90 rounded-lg shadow-lg shadow-primary/20">
            <Calculator className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kalkulator Suite</h1>
            <p className="text-muted-foreground text-sm">Produktkalkulation & Rohstoffe</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadStandardRecipes} className="gap-2 border-primary/20 text-primary hover:bg-primary/10">
            <Boxes className="h-4 w-4" />
            Standards laden
          </Button>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <Cloud className="h-4 w-4" />
              <span>Ready</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="calculator" className="gap-2">
            <Calculator className="h-4 w-4" />
            Produktkalkulator
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Gespeicherte Produkte
            <Badge variant="secondary" className="ml-2 bg-[#ff8000] text-white hover:bg-[#e67300]">{endProducts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="target" className="gap-2">
            <Target className="h-4 w-4" />
            Zielpreis
          </TabsTrigger>
        </TabsList>

        {/* --- CALCULATOR TAB --- */}
        <TabsContent value="calculator" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-6">
            
            {/* LEFT COLUMN: RESOURCES */}
            <div className="space-y-6">
              {/* Raw Materials Quick Add */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Cylinder className="h-4 w-4" /> Rohstoffe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Name (z.B. Eisen)" 
                      value={quickRawName} 
                      onChange={e => setQuickRawName(e.target.value)} 
                      className="h-9"
                    />
                    <Input 
                      type="number" 
                      placeholder="$" 
                      value={quickRawPrice} 
                      onChange={e => setQuickRawPrice(e.target.value)} 
                      className="w-20 h-9" 
                    />
                    <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddRaw}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {rawMaterials.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Keine Rohstoffe</p>}
                    {rawMaterials.map(m => (
                      <div key={m.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md group hover:bg-muted transition-colors">
                        <span className="font-medium truncate max-w-[140px]" title={m.name}>{m.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                             <span className="absolute left-2 top-1.5 text-[10px] text-muted-foreground pointer-events-none">$</span>
                             <Input 
                               type="number"
                               step="0.01"
                               className="h-7 w-20 pl-4 pr-2 text-right text-xs bg-transparent border-transparent hover:border-border hover:bg-background focus:bg-background focus:border-primary/50 transition-all"
                               defaultValue={m.ekPrice}
                               onBlur={(e) => useCalculatorStore.getState().updateMaterial(m.id, { ekPrice: parseFloat(e.target.value) || 0 })}
                               onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                             />
                          </div>
                          <button onClick={() => deleteMaterial(m.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: MAIN CALCULATOR */}
            <Card className="flex flex-col h-full border-2 border-primary/10">
              <CardHeader className="border-b bg-muted/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Produktkalkulator</CardTitle>
                    <CardDescription>Berechne Preise für Produkte und Bauteile</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground/80">Produktbezeichnung</Label>
                  <Input 
                    placeholder="z.B. Verstärkte Stahlplatte" 
                    value={calcName} 
                    onChange={e => setCalcName(e.target.value)}
                    className="font-medium text-lg h-12 bg-background border-border/50 focus:border-[#ff8000]"
                  />
                </div>

                {/* Ingredients Selection */}
                <div className="space-y-4 pt-4">
                  <Label className="text-xs font-bold uppercase text-muted-foreground/80">Zutat hinzufügen</Label>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Select value={currentIngId} onValueChange={setCurrentIngId}>
                        <SelectTrigger className="h-11 bg-background border-border/50">
                          <SelectValue placeholder="Material wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterials.length > 0 && (
                            <>
                              <SelectItem value="header_1" disabled className="font-bold opacity-100 text-[#ff8000] text-[10px] uppercase py-2">-- Rohstoffe --</SelectItem>
                              {rawMaterials.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name} ({fmtMoney(m.ekPrice)})</SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 text-center block w-full">Menge</Label>
                      <Input 
                        type="number" 
                        value={currentIngQty} 
                        onChange={e => setCurrentIngQty(e.target.value)} 
                        min="0.1"
                        className="h-11 text-center bg-background border-border/50"
                      />
                    </div>
                    <Button 
                      onClick={addIngredientToCalc} 
                      className="h-11 px-8 bg-[#ff8000] hover:bg-[#e67300] text-white font-bold uppercase tracking-wider shadow-lg shadow-[#ff8000]/20 transition-all hover:scale-[1.02]"
                    >
                      Hinzufügen
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="border border-border/40 rounded-xl overflow-hidden min-h-[150px] shadow-sm bg-card/30">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-b border-border/40">
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Inhalt</TableHead>
                          <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest py-4">Menge</TableHead>
                          <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest py-4">Kosten</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calcIngredients.map((ing, idx) => {
                          const mat = materials.find(m => m.id === ing.materialId);
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{mat?.name || 'Unbekannt'}</TableCell>
                              <TableCell className="text-right">{ing.quantity}</TableCell>
                              <TableCell className="text-right">{fmtMoney((mat?.ekPrice || 0) * ing.quantity)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => removeIngredient(idx)} className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {calcIngredients.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                              Keine Materialien hinzugefügt
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Footer Totals */}
                <div className="mt-auto pt-6 space-y-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Materialkosten (EK)</span>
                    <span className="font-medium">{fmtMoney(totals.cost)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Gewünschte Marge (%)</span>
                        <Input 
                          type="number" 
                          value={margin} 
                          onChange={e => setMargin(e.target.value)} 
                          className="w-20 h-8 text-center"
                        />
                     </div>
                     <div className="text-right">
                        <span className="text-xs text-green-600 font-medium block">Gewinn</span>
                        <span className="font-bold text-green-600">{fmtMoney(totals.profit)}</span>
                     </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
                    <span className="font-bold text-foreground">Verkaufspreis</span>
                    <span className="text-2xl font-bold text-primary">{fmtMoney(totals.final)}</span>
                  </div>

                  <Button size="lg" className="w-full" onClick={saveCalculatorResult}>
                    <Save className="h-4 w-4 mr-2" />
                    Als Produkt speichern
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- PRODUCTS TAB --- */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gespeicherte Produkte</CardTitle>
              <CardDescription>Alle kalkulierten Produkte</CardDescription>
            </CardHeader>
            <CardContent>
              {endProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Keine Produkte gespeichert</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead className="text-right">EK</TableHead>
                      <TableHead className="text-right">VK</TableHead>
                      <TableHead className="text-right">Marge</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endProducts.map(p => {
                       // Recalculate cost for display
                       const cost = p.materials.reduce((acc, use) => {
                          const m = materials.find(mat => mat.id === use.materialId);
                          return acc + ((m?.ekPrice || 0) * use.quantity);
                       }, 0);
                       const profit = (p.vkPrice || 0) - cost;
                       
                       return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>
                            <Badge variant={p.category === 'vehicle' ? 'default' : 'secondary'} className={p.category === 'vehicle' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
                              {p.category === 'vehicle' ? 'Fahrzeug (Legacy)' : 'Produkt'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">{fmtMoney(cost)}</TableCell>
                          <TableCell className="text-right font-bold font-mono">
                            <div className="relative flex justify-end">
                               <span className="absolute right-16 top-1.5 text-[10px] text-muted-foreground pointer-events-none">$</span>
                               <Input 
                                 type="number"
                                 step="0.01"
                                 className="h-7 w-24 pl-4 pr-2 text-right text-xs font-bold bg-transparent border-transparent hover:border-border hover:bg-background focus:bg-background focus:border-primary/50 transition-all"
                                 defaultValue={p.vkPrice || 0}
                                 onBlur={(e) => useCalculatorStore.getState().updateEndProduct(p.id, { vkPrice: parseFloat(e.target.value) || 0 })}
                                 onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                               />
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">+{fmtMoney(profit)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteEndProduct(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                       );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TARGET PRICE TAB --- */}
        <TabsContent value="target">
           <Card>
             <CardHeader>
               <CardTitle>Zielpreis Rechner</CardTitle>
               <CardDescription>Rückwärtskalkulation (Coming Soon)</CardDescription>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">Diese Funktion wird derzeit überarbeitet.</p>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}