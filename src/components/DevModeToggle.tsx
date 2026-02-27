import { useSettingsStore } from './store/settingsStore';

export function useDevMode() {
  return useSettingsStore((state) => state.devMode);
}
