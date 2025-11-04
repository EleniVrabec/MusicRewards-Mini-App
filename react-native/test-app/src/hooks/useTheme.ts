// useTheme hook - Provides current theme based on theme preference
import { THEME_DARK, THEME_LIGHT } from '../constants/theme';
import { useThemeStore, selectThemeMode } from '../stores/themeStore';

export const useTheme = () => {
  const themeMode = useThemeStore(selectThemeMode);
  
  // Return the appropriate theme object
  return themeMode === 'dark' ? THEME_DARK : THEME_LIGHT;
};

