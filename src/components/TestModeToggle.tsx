import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useSettingsStore } from './store/settingsStore';
import { toast } from 'sonner@2.0.3';

export function TestModeToggle() {
  const { testMode, setTestMode } = useSettingsStore();

  const handleToggle = (checked: boolean) => {
    setTestMode(checked);
    
    toast.success(
      checked 
        ? '🧪 Test-Modus aktiviert - Schnelle Timer (1 Min)' 
        : '✅ Test-Modus deaktiviert - Normale Timer (30 Min / 24h)',
      { duration: 3000 }
    );
  };

  return (
    <div className="flex items-center space-x-3 p-4 border border-[#ff8000] rounded-lg bg-black/20">
      <Switch
        id="test-mode"
        checked={testMode}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="test-mode" className="cursor-pointer">
        🧪 Test-Modus {testMode && '(Aktiv - Schnelle Timer)'}
      </Label>
    </div>
  );
}
