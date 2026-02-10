import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useTabVisibilityStore } from './store/tabVisibilityStore';
import { toast } from 'sonner';

interface Tab {
  id: string;
  title: string;
  description: string;
}

interface TabVisibilityManagerProps {
  tabs: Tab[];
}

export function TabVisibilityManager({ tabs }: TabVisibilityManagerProps) {
  const { hiddenTabs, toggleTabVisibility, resetTabVisibility } = useTabVisibilityStore();

  const handleReset = () => {
    resetTabVisibility();
    toast.success('Tab-Sichtbarkeit zurückgesetzt', {
      description: 'Alle Tabs sind wieder sichtbar',
    });
  };

  const visibleCount = tabs.length - hiddenTabs.length;
  const hiddenCount = hiddenTabs.length;

  return (
    <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="border-b border-primary/20 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                <Eye className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-black dark:text-white">Tab-Verwaltung</span>
            </CardTitle>
            <CardDescription>
              Wählen Sie aus, welche Tabs in der Navigation angezeigt werden sollen (nur im Dev-Mode)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-primary/30 hover:bg-primary/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Sichtbar
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {visibleCount}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <EyeOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Versteckt
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {hiddenCount}
            </p>
          </div>
        </div>

        {/* Tab List */}
        <div className="space-y-3">
          {tabs.map((tab) => {
            const isVisible = !hiddenTabs.includes(tab.id);
            
            return (
              <div
                key={tab.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isVisible
                    ? 'bg-card border-border hover:border-primary/30'
                    : 'bg-muted/50 border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`tab-${tab.id}`}
                    checked={isVisible}
                    onCheckedChange={() => toggleTabVisibility(tab.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`tab-${tab.id}`}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      {isVisible ? (
                        <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={isVisible ? 'text-foreground' : 'text-muted-foreground'}>
                        {tab.title}
                      </span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {tab.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning */}
        {hiddenCount > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <EyeOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Hinweis
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  {hiddenCount} {hiddenCount === 1 ? 'Tab ist' : 'Tabs sind'} derzeit ausgeblendet. 
                  Diese Einstellung bleibt gespeichert bis Sie sie zurücksetzen.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
