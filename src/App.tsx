import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from './components/ui/sidebar';
import { Badge } from './components/ui/badge';
import { 
  ShoppingCart, 
  FileText, 
  Package, 
  Building2,
  Settings,
  Home,
  Archive,
  Calculator,
  Loader2,
  Users,
  RefreshCw,
  Cloud,
  CloudOff,
  Truck,
  FileSignature,
} from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Lazy load heavy components
const OrderManager = lazy(() => import('./components/OrderManager'));
const InvoiceManager = lazy(() => import('./components/InvoiceManager'));
const InventoryManager = lazy(() => import('./components/InventoryManager'));
const ArchiveManager = lazy(() => import('./components/ArchiveManager'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const SettingsManager = lazy(() => import('./components/SettingsManager'));
const PriceCalculator = lazy(() => import('./components/PriceCalculator'));
const EmployeeManager = lazy(() => import('./components/EmployeeManager'));
const TransportOrderManager = lazy(() => import('./components/TransportOrderManager'));
const ContractManager = lazy(() => import('./components/ContractManager'));
import UniversalBackupSystem from './components/UniversalBackupSystem';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useTabVisibilityStore } from './components/store/tabVisibilityStore';
import { useSettingsStore } from './components/store/settingsStore';
import LiveSyncManager from './components/LiveSyncManager';

const navigation = [
  { id: 'dashboard', title: 'Dashboard', icon: Home, description: 'Übersicht & Statistiken' },
  { id: 'orders', title: 'Aufträge', icon: ShoppingCart, description: 'Bestellungs-Management' },
  { id: 'invoices', title: 'Rechnungen', icon: FileText, description: 'Rechnungswesen' },
  { id: 'contracts', title: 'Verträge', icon: FileSignature, description: 'Vertragsverwaltung' },
  { id: 'inventory', title: 'Lager & Logistik', icon: Package, description: 'Bestandsführung & Tracking' },
  { id: 'transport', title: 'Fahrbefehle', icon: Truck, description: 'Transport & Logistik' },
  { id: 'employees', title: 'Mitarbeiter', icon: Users, description: 'Personalverwaltung' },
  { id: 'calculator', title: 'Kalkulator', icon: Calculator, description: 'Preise & Margen' },
  { id: 'archive', title: 'Archiv', icon: Archive, description: 'Historische Daten' },
  { id: 'settings', title: 'Einstellungen', icon: Settings, description: 'System-Konfiguration' }
];

// Loading component for initial cloud sync
const CloudBootLoader = () => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <Cloud className="h-12 w-12 text-primary animate-pulse" />
      <RefreshCw className="h-6 w-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-xl font-bold">SCHMELZDEPOT Cloud-Boot</h2>
      <p className="text-muted-foreground animate-pulse">Synchronisiere Live-Daten mit Supabase...</p>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex h-[400px] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { isTabVisible } = useTabVisibilityStore();
  const { syncEnabled, theme, workspaceId } = useSettingsStore();
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isCloudBooted, setIsCloudBooted] = useState(false);
  
  // Apply theme on initial load and when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Listen for cloud boot completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCloudBooted(true);
    }, 2500); // Allow some time for initial sync
    return () => clearTimeout(timer);
  }, []);

  // Filter navigation based on tab visibility
  const visibleNavigation = navigation.filter(nav => isTabVisible(nav.id));
  
  // Load html2canvas for invoice generation
  useEffect(() => {
    // Laden für Rechnungen
    if (activeView !== 'invoices' || (window as any).html2canvas) return;
    
    const timeoutId = setTimeout(() => {
      console.log("Loading html2canvas for PDF/PNG generation...");
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      script.async = true;
      document.head.appendChild(script);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [activeView]);
  
  const activeNavItem = visibleNavigation.find(nav => nav.id === activeView);
  
  // Redirect to first visible tab if current view is hidden
  useEffect(() => {
    if (!isTabVisible(activeView) && visibleNavigation.length > 0) {
      setActiveView(visibleNavigation[0].id);
    }
  }, [activeView, isTabVisible, visibleNavigation]);
  
  // Tab change handler
  const handleTabChange = useCallback((view: string) => {
    setActiveView(view);
    setSyncTrigger(prev => prev + 1);
  }, []);

  // Manual refresh handler (Rein lokal)
  const handleManualRefresh = useCallback(() => {
    setSyncTrigger(prev => prev + 1);
  }, []);
  
  // Render active component with syncTrigger
  const renderActiveComponent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleTabChange} syncTrigger={syncTrigger} />;
      case 'orders':
        return <OrderManager syncTrigger={syncTrigger} />;
      case 'invoices':
        return <InvoiceManager syncTrigger={syncTrigger} />;
      case 'contracts':
        return <ContractManager />;
      case 'inventory':
        return <InventoryManager syncTrigger={syncTrigger} />;
      case 'transport':
        return <TransportOrderManager />;
      case 'employees':
        return <EmployeeManager />;
      case 'calculator':
        return <PriceCalculator syncTrigger={syncTrigger} />;
      case 'archive':
        return <ArchiveManager syncTrigger={syncTrigger} />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <Dashboard onNavigate={handleTabChange} syncTrigger={syncTrigger} />;
    }
  };

  return (
    <SidebarProvider>
      {!isCloudBooted && <CloudBootLoader />}
      
      <LiveSyncManager syncTrigger={syncTrigger} />
      {/* 100% Cloud-Synchronisation aktiv */}
      <UniversalBackupSystem />
      
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
          <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Building2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg tracking-tight">SCHMELZDEPOT</h1>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {syncEnabled ? `Team: ${workspaceId}` : 'Lokaler Modus'}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {visibleNavigation.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleTabChange(item.id)}
                        isActive={activeView === item.id}
                        className={`w-full justify-start gap-3 px-3 py-2.5 mb-1 rounded-md transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium ${item.id === 'settings' ? 'hidden' : ''}`}
                      >
                        <item.icon className="h-4 w-4" strokeWidth={2} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1 bg-primary/10 rounded">
                {isOnline ? (
                  <Cloud className="h-3 w-3 text-green-500" />
                ) : (
                  <CloudOff className="h-3 w-3 text-red-500" />
                )}
              </div>
              <span className="text-muted-foreground">{isOnline ? 'Cloud-Synchronisiert' : 'Keine Verbindung'}</span>
              <Badge variant="outline" className={`ml-auto border-primary/40 text-primary text-[10px] px-1.5 py-0 h-5 ${isOnline ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                {isOnline ? 'LIVE' : 'OFFLINE'}
              </Badge>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/80 px-6 py-3.5 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg">{activeNavItem?.title}</h2>
                    <Badge variant="secondary" className={`text-[10px] h-5 px-2 ${isOnline ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activeNavItem?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualRefresh}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors group"
                  title="Ansicht aktualisieren"
                >
                  <RefreshCw className="h-4 w-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-sm text-primary">Reload</span>
                </button>
                <div className="w-px h-8 bg-border mx-1" />
                <DarkModeToggle />
                <div 
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 flex items-center justify-center border-2 border-primary/30 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => handleTabChange('settings')}
                >
                  <span className="text-sm text-primary-foreground">SD</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="p-6 max-w-[1920px] mx-auto">
              <Suspense fallback={<LoadingSpinner />}>
                {renderActiveComponent()}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </SidebarProvider>
  );
}