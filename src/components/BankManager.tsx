import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, RefreshCw, Factory, ArrowUpDown, TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, Calculator, Wallet } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { statevApi, FACTORY_ID, type BankAccount, type Transaction, type TransactionResponse } from './services/statevApi';
import { useOrderStore } from './store/orderStore';
import { useSettingsStore } from './store/settingsStore';
import { toast } from 'sonner';
import { Lock, Unlock, ShieldCheck, KeyRound } from 'lucide-react';

export default function BankManager() {
  const { checkForPaymentMatches } = useOrderStore();
  const bankPin = useSettingsStore(state => state.bankPin);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionResponse | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionLimit, setTransactionLimit] = useState('50');
  const [transactionOffset, setTransactionOffset] = useState('0');
  const [lastPaymentCheck, setLastPaymentCheck] = useState<Date | null>(null);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  useEffect(() => {
    if (selectedBankAccount && selectedBankAccount !== 'none') {
      loadTransactions(selectedBankAccount, parseInt(transactionLimit), parseInt(transactionOffset));
      loadAllTransactionsForStats();
    }
  }, [selectedBankAccount]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const accounts = await statevApi.getFactoryBankAccounts();
      // Filter to only show VBAN-409856
      const filteredAccounts = accounts.filter(account => account.vban.toString() === '409856');
      setBankAccounts(filteredAccounts);
      
      // Auto-select the account if found
      if (filteredAccounts.length > 0) {
        setSelectedBankAccount(filteredAccounts[0].id);
      } else {
        setSelectedBankAccount('');
        setTransactions(null);
        setAllTransactions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Bankkonten');
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (bankId: string, limit: number = 50, offset: number = 0) => {
    if (!bankId) return;
    
    try {
      setLoadingTransactions(true);
      setError(null);
      const transactionData = await statevApi.getTransactions(bankId, limit, offset);
      setTransactions(transactionData);
      
      // Check for payment matches automatically
      if (transactionData.transactions.length > 0) {
        console.log('🔍 Checking for payment matches in transactions...');
        checkForPaymentMatches(transactionData.transactions);
        setLastPaymentCheck(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Transaktionen');
      setTransactions(null);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadAllTransactionsForStats = async () => {
    if (!selectedBankAccount || selectedBankAccount === 'none') return;

    try {
      setLoadingStats(true);
      // Load more transactions for better statistics (up to 200)
      const transactionData = await statevApi.getTransactions(selectedBankAccount, 200, 0);
      setAllTransactions(transactionData.transactions);
      
      // Also check all transactions for payment matches
      if (transactionData.transactions.length > 0) {
        console.log('🔍 Checking all transactions for payment matches...');
        checkForPaymentMatches(transactionData.transactions);
        setLastPaymentCheck(new Date());
      }
    } catch (err) {
      console.error('Fehler beim Laden der Statistik-Daten:', err);
      setAllTransactions([]);
    } finally {
      setLoadingStats(false);
    }
  };

  // Manual payment check function
  const manualPaymentCheck = async () => {
    if (!selectedBankAccount || selectedBankAccount === 'none') return;
    
    try {
      setLoadingTransactions(true);
      console.log('🔄 Manual payment check initiated...');
      const transactionData = await statevApi.getTransactions(selectedBankAccount, 100, 0);
      
      if (transactionData.transactions.length > 0) {
        checkForPaymentMatches(transactionData.transactions);
        setLastPaymentCheck(new Date());
        
        // Show success toast
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.success('Zahlungsabgleich durchgeführt', {
              description: `${transactionData.transactions.length} Transaktionen überprüft.`,
            });
          }).catch(() => {
            console.log('Toast notification not available');
          });
        }
      }
    } catch (err) {
      console.error('Fehler beim manuellen Zahlungsabgleich:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const refreshData = () => {
    loadBankAccounts();
    if (selectedBankAccount && selectedBankAccount !== 'none') {
      loadTransactions(selectedBankAccount, parseInt(transactionLimit), parseInt(transactionOffset));
      loadAllTransactionsForStats();
    }
  };

  const loadTransactionsWithParams = () => {
    if (selectedBankAccount && selectedBankAccount !== 'none') {
      loadTransactions(selectedBankAccount, parseInt(transactionLimit), parseInt(transactionOffset));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatVBAN = (vban: string | number) => {
    return `VBAN-${vban}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const selectedAccountData = bankAccounts.find(a => a.id === selectedBankAccount);
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  const handleUnlock = () => {
    if (pinInput === bankPin) {
      setIsUnlocked(true);
      toast.success('Bank erfolgreich entsperrt');
    } else {
      toast.error('Falscher PIN', { description: 'Bitte versuchen Sie es erneut.' });
      setPinInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  // Financial Statistics Calculations
  const financialStats = useMemo(() => {
    if (!selectedAccountData || allTransactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0,
        transactionCount: 0,
        avgTransactionAmount: 0,
        weeklyIncome: 0,
        weeklyExpenses: 0,
        totalRevenue: 0,
        profit: 0,
        dailyData: [],
        monthlyData: [],
        expenseCategories: [],
        incomeCategories: []
      };
    }

    const accountVban = selectedAccountData.vban.toString();
    let totalIncome = 0;
    let totalExpenses = 0;
    let weeklyIncome = 0;
    let weeklyExpenses = 0;
    const dailyFlows: { [key: string]: { income: number; expenses: number; date: string } } = {};
    const monthlyFlows: { [key: string]: { income: number; expenses: number; month: string } } = {};
    const expenseCategories: { [key: string]: number } = {};
    const incomeCategories: { [key: string]: number } = {};

    // Calculate current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days to previous Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    allTransactions.forEach(transaction => {
      const isIncoming = transaction.receiverVban.toString() === accountVban;
      const amount = Math.abs(transaction.amount);
      const date = new Date(transaction.timestamp.toString());
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if transaction is in current week
      const isCurrentWeek = date >= weekStart;
      
      // Initialize daily data
      if (!dailyFlows[dayKey]) {
        dailyFlows[dayKey] = { income: 0, expenses: 0, date: dayKey };
      }
      
      // Initialize monthly data
      if (!monthlyFlows[monthKey]) {
        monthlyFlows[monthKey] = { income: 0, expenses: 0, month: monthKey };
      }

      if (isIncoming) {
        totalIncome += amount;
        dailyFlows[dayKey].income += amount;
        monthlyFlows[monthKey].income += amount;
        
        if (isCurrentWeek) {
          weeklyIncome += amount;
        }
        
        // Categorize income by reference
        const category = transaction.reference || 'Sonstige Einnahmen';
        incomeCategories[category] = (incomeCategories[category] || 0) + amount;
      } else {
        totalExpenses += amount;
        dailyFlows[dayKey].expenses += amount;
        monthlyFlows[monthKey].expenses += amount;
        
        if (isCurrentWeek) {
          weeklyExpenses += amount;
        }
        
        // 🎯 Ausgaben ohne Referenz werden zu VBAN-209328 zugeordnet
        let category: string;
        if (!transaction.reference || transaction.reference.trim() === '') {
          category = 'VBAN-209328';
        } else {
          category = transaction.reference;
        }
        expenseCategories[category] = (expenseCategories[category] || 0) + amount;
      }
    });

    const netFlow = totalIncome - totalExpenses;
    const avgTransactionAmount = allTransactions.length > 0 ? (totalIncome + totalExpenses) / allTransactions.length : 0;
    const totalRevenue = totalIncome; // Total revenue = total income
    const profit = totalIncome - totalExpenses; // Profit = income - expenses

    // Convert to arrays and sort
    const dailyData = Object.values(dailyFlows)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    const monthlyData = Object.values(monthlyFlows)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Top categories
    const topExpenseCategories = Object.entries(expenseCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const topIncomeCategories = Object.entries(incomeCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    return {
      totalIncome,
      totalExpenses,
      netFlow,
      transactionCount: allTransactions.length,
      avgTransactionAmount,
      weeklyIncome,
      weeklyExpenses,
      totalRevenue,
      profit,
      dailyData,
      monthlyData,
      expenseCategories: topExpenseCategories,
      incomeCategories: topIncomeCategories
    };
  }, [allTransactions, selectedAccountData]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  // Render Lock Screen if PIN is set and not unlocked
  if (bankPin && !isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md bg-card border border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              <Lock className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold">Bank gesperrt</CardTitle>
            <p className="text-sm text-muted-foreground">Geben Sie Ihren PIN ein, um die Finanzdaten einzusehen.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="****"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pl-10 text-center text-2xl tracking-[1em] h-14"
                  maxLength={4}
                  autoFocus
                />
              </div>
            </div>
            <Button onClick={handleUnlock} className="w-full h-12 text-lg font-bold" size="lg">
              <Unlock className="h-5 w-5 mr-2" />
              Entsperren
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">

      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bank Account Display */}


      {/* Comprehensive Banking Dashboard */}
      {selectedBankAccount && bankAccounts.length > 0 && (
        <div className="space-y-6">
          {/* Current Balance & Account Overview */}
          <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="border-b border-primary/20 bg-card">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                  <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-black dark:text-white">Kontoübersicht - Aktueller Saldo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-lg">
                      <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-green-700 dark:text-green-300">Aktueller Saldo</div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedAccountData?.balance || 0)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        VBAN: {formatVBAN(selectedAccountData?.vban || '')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Gesamt Umsatz Eingegangen</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(financialStats.totalIncome)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 dark:bg-red-800/50 rounded-lg">
                      <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-red-700 dark:text-red-300">Gesamt Umsatz Ausgegangen</div>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(financialStats.totalExpenses)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="border-b border-primary/20 bg-card">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                  <Calendar className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-black dark:text-white">Wöchentliche Übersicht</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt Wöchentliche Eingänge</div>
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(financialStats.weeklyIncome)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt Wöchentliche Ausgänge</div>
                      <div className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(financialStats.weeklyExpenses)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Wochen Umsatz</div>
                      <div className="font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(financialStats.weeklyIncome)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      (financialStats.weeklyIncome - financialStats.weeklyExpenses) >= 0 
                        ? 'bg-emerald-100 dark:bg-emerald-800/50' 
                        : 'bg-orange-100 dark:bg-orange-800/50'
                    }`}>
                      <Wallet className={`h-6 w-6 ${
                        (financialStats.weeklyIncome - financialStats.weeklyExpenses) >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Wochen Gewinn</div>
                      <div className={`font-bold ${
                        (financialStats.weeklyIncome - financialStats.weeklyExpenses) >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {formatCurrency(financialStats.weeklyIncome - financialStats.weeklyExpenses)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="pb-2 border-b border-primary/20 bg-card">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                    <ArrowUpDown className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-black dark:text-white">Transaktionen</span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-6">
                    {transactions?.transactions.length || 0}/{transactions?.totalTransactions || 0}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={refreshData} disabled={loadingTransactions} className="h-6 px-2">
                    <RefreshCw className={`h-3 w-3 ${loadingTransactions ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              {/* Transaction Controls */}
              <div className="flex items-end gap-2 mb-3 p-2 bg-card rounded-sm border border-primary/20">
                <div>
                  <Label className="text-xs">Anzahl</Label>
                  <Input
                    type="number"
                    value={transactionLimit}
                    onChange={(e) => setTransactionLimit(e.target.value)}
                    className="w-16 h-6 text-xs px-2"
                    min="1"
                    max="200"
                  />
                </div>
                <div>
                  <Label className="text-xs">Offset</Label>
                  <Input
                    type="number"
                    value={transactionOffset}
                    onChange={(e) => setTransactionOffset(e.target.value)}
                    className="w-16 h-6 text-xs px-2"
                    min="0"
                  />
                </div>
                <Button onClick={loadTransactionsWithParams} disabled={loadingTransactions} size="sm" className="h-6 px-3 text-xs">
                  Laden
                </Button>
              </div>

              {loadingTransactions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs">Lade...</span>
                </div>
              ) : transactions && transactions.transactions.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                    <span>{transactions.totalTransactions.toLocaleString()} total</span>
                    <span>{transactions.transactions.length} angezeigt</span>
                  </div>

                  <div className="border border-primary/20 rounded-sm h-64 overflow-auto bg-card">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card dark:bg-card z-10">
                        <TableRow className="h-8 border-b border-primary/20">
                          <TableHead className="text-xs py-1 px-2 text-primary">Datum</TableHead>
                          <TableHead className="text-xs py-1 px-2 text-black dark:text-white">Von</TableHead>
                          <TableHead className="text-xs py-1 px-2 text-black dark:text-white">An</TableHead>
                          <TableHead className="text-xs py-1 px-2 text-black dark:text-white">Zweck</TableHead>
                          <TableHead className="text-xs py-1 px-2 text-right text-black dark:text-white">Betrag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.transactions.map((transaction, index) => {
                          const isIncoming = transaction.receiverVban.toString() === selectedAccountData?.vban;
                          return (
                            <TableRow key={index} className="h-8 hover:bg-primary/10 dark:hover:bg-primary/10">
                              <TableCell className="py-1 px-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5 text-primary" />
                                  <span className="text-xs text-black dark:text-white">{formatDate(transaction.timestamp.toString())}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-1 px-2">
                                <div className="font-mono text-xs text-black dark:text-white">
                                  {formatVBAN(transaction.senderVban)}
                                </div>
                              </TableCell>
                              <TableCell className="py-1 px-2">
                                <div className="font-mono text-xs text-black dark:text-white">
                                  {formatVBAN(transaction.receiverVban)}
                                </div>
                              </TableCell>
                              <TableCell className="py-1 px-2 max-w-24 truncate">
                                {!isIncoming && (!transaction.reference || transaction.reference.trim() === '') ? (
                                  <span className="text-xs text-primary font-mono">VBAN-209328</span>
                                ) : (
                                  <span className="text-xs text-black dark:text-white">{transaction.reference || '—'}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-1 px-2 text-right">
                                <div className="font-medium flex items-center justify-end gap-0.5 text-xs text-primary">
                                  {isIncoming ? (
                                    <TrendingUp className="h-2.5 w-2.5" />
                                  ) : (
                                    <TrendingDown className="h-2.5 w-2.5" />
                                  )}
                                  {isIncoming ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                  Keine Transaktionen verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}