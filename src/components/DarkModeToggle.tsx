import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useSettingsStore } from './store/settingsStore';

export function DarkModeToggle() {
  const { theme, setTheme } = useSettingsStore();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={isDark ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-[#ff8000]" />
      ) : (
        <Moon className="h-5 w-5 text-[#ff8000]" />
      )}
    </Button>
  );
}
