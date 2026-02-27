import { useEffect, useRef } from 'react';
import { useOrderStore } from './store/orderStore';
import { useSettingsStore } from './store/settingsStore';
import { statevApi } from './services/statevApi';

interface AutoPaymentWatcherProps {
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export default function AutoPaymentWatcher({ enabled = true, interval = 600000 }: AutoPaymentWatcherProps) {
  const { 
    checkForPaymentMatches, 
    ordersDone, 
    updateOrder,
    moveToArchive
  } = useOrderStore();
  
  const { 
    autoPaymentSettings: settings, 
    setAutoPaymentSettings: updateSettings,
    testMode
  } = useSettingsStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date | null>(null);

  // Initialize lastCheck from settings if available
  useEffect(() => {
    if (settings.lastCheck) {
      lastCheckRef.current = new Date(settings.lastCheck);
    }
  }, []);

  useEffect(() => {
    // Priority: Store settings > Prop enabled
    const isEnabled = settings.enabled && enabled;
    
    if (!isEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const performAutomaticProcessing = async () => {
      try {
        console.log('🔄 Automatische Prüfung gestartet (Zero Local Storage Sync)...');
        console.log('📅 Aktuelle Zeit:', new Date().toISOString());
        console.log('⏰ Letzte Prüfung:', lastCheckRef.current?.toISOString() || 'Nie');
        
        // ============================================
        // SCHRITT 1: ZAHLUNGSABGLEICH (offen → gezahlt)
        // ============================================
        console.log('💰 Schritt 1: Zahlungsabgleich für offene Aufträge...');
        
        try {
          const accounts = await statevApi.getFactoryBankAccounts();
          const filteredAccounts = accounts.filter(account => account.vban && account.vban.toString() === '409856');
          
          if (filteredAccounts.length > 0) {
            const bankId = filteredAccounts[0].id;
            const transactionData = await statevApi.getTransactions(bankId, 100, 0);
            
            if (transactionData.transactions.length > 0) {
              let transactionsToCheck = transactionData.transactions;
              
              if (lastCheckRef.current) {
                const lastCheckTime = lastCheckRef.current.getTime();
                transactionsToCheck = transactionData.transactions.filter(transaction => {
                  try {
                    const transactionTime = new Date(transaction.timestamp).getTime();
                    return transactionTime > lastCheckTime;
                  } catch (error) {
                    return true;
                  }
                });
              }

              if (transactionsToCheck.length > 0) {
                const incomingTransactions = transactionsToCheck.filter(t => {
                  const isIncoming = t.receiverVban && t.receiverVban.toString() === '409856';
                  const hasPurpose = t.purpose || t.reference;
                  return isIncoming && hasPurpose;
                });
                
                const relevantTransactions = incomingTransactions.filter(t => {
                  const purpose = (t.purpose || t.reference || '').toString().toUpperCase();
                  // More robust tracking: support SD (Orders) and CTR (Contracts) with flexible formatting
                  return /SD\s?-?\s?\d{4,}/i.test(purpose) || /CTR\s?-?\s?\d{4,}/i.test(purpose);
                });
                
                if (relevantTransactions.length > 0) {
                  checkForPaymentMatches(relevantTransactions);
                  
                  import('sonner').then(({ toast }) => {
                    toast.success('Zahlungsabgleich erfolgreich', {
                      description: `${relevantTransactions.length} relevante Zahlungen im Verwendungszweck identifiziert.`,
                    });
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Fehler beim Zahlungsabgleich:', error);
        }

        // ============================================
        // SCHRITT 2: STATUS-PROGRESSION (gezahlt → abgeschlossen)
        // ============================================
        console.log('⏳ Schritt 2: Prüfe abgelaufene "Gezahlt"-Aufträge...');
        
        const now = new Date().getTime();
        const timeLimit = testMode ? 30000 : 1800000; // 30s (Test) vs 30m
        
        let completedCount = 0;
        ordersDone.forEach(order => {
          if (order.status === 'Gezahlt' && order.paidAt) {
            const paidTime = new Date(order.paidAt).getTime();
            const elapsed = now - paidTime;
            
            if (elapsed >= timeLimit) {
              updateOrder(order.id, { 
                status: 'Abgeschlossen', 
                finishedAt: new Date().toISOString() 
              });
              completedCount++;
            }
          }
        });
        
        if (completedCount > 0) {
          import('sonner').then(({ toast }) => {
            toast.info('Status-Update', {
              description: `${completedCount} Aufträge automatisch abgeschlossen.`,
            });
          });
        }

        // ============================================
        // SCHRITT 3: ARCHIVIERUNG (abgeschlossen → archiv)
        // ============================================
        console.log('📦 Schritt 3: Prüfe Archivierung...');
        
        const archiveTimeLimit = testMode ? 60000 : 86400000; // 1m vs 24h
        let archivedCount = 0;
        
        ordersDone.forEach(order => {
          if (order.status === 'Abgeschlossen' && order.finishedAt) {
            const finishedTime = new Date(order.finishedAt).getTime();
            const elapsed = now - finishedTime;
            
            if (elapsed >= archiveTimeLimit) {
              moveToArchive(order.id);
              archivedCount++;
            }
          }
        });
        
        if (archivedCount > 0) {
          import('sonner').then(({ toast }) => {
            const timeLabel = testMode ? '1 Minute' : '24 Stunden';
            toast.success('Archivierung abgeschlossen', {
              description: `${archivedCount} Aufträge nach ${timeLabel} archiviert.`,
            });
          });
        }

        // ============================================
        // PRÜFUNG ABGESCHLOSSEN - Update Cloud Sync
        // ============================================
        const checkTime = new Date();
        lastCheckRef.current = checkTime;
        
        // Push last check time to cloud via settings store
        updateSettings({ lastCheck: checkTime.toISOString() });
        
        console.log('✅ Automatische Prüfung abgeschlossen');
      } catch (error) {
        console.error('❌ Fehler bei automatischer Prüfung:', error);
      }
    };

    const initialTimeout = setTimeout(performAutomaticProcessing, 5000); // 5s startup delay
    const checkInterval = settings.interval || interval;
    intervalRef.current = setInterval(performAutomaticProcessing, checkInterval);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, interval, checkForPaymentMatches, ordersDone, updateOrder, settings.enabled, settings.interval, testMode, updateSettings]);

  return null;
}