/**
 * Serviço para gerenciar temas da aplicação
 */

import { ref, computed } from 'vue';
import { Dark } from 'quasar';

export type TemaApp = 'auto' | 'light' | 'dark';

class ThemeService {
  private static instance: ThemeService;
  private _theme = ref<TemaApp>('auto');

  private constructor() {
    this.loadThemeFromStorage();
    this.setupMediaQueryListener();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Tema atual configurado pelo usuário
   */
  get theme() {
    return this._theme.value;
  }

  /**
   * Se está usando tema escuro atualmente
   */
  get isDark() {
    return computed(() => {
      if (this._theme.value === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return this._theme.value === 'dark';
    });
  }

  /**
   * Define o tema da aplicação
   */
  public setTheme(theme: TemaApp): void {
    this._theme.value = theme;
    this.applyTheme();
    this.saveThemeToStorage();
  }

  /**
   * Alterna entre tema claro e escuro
   */
  public toggleTheme(): void {
    const currentIsDark = this.isDark.value;
    this.setTheme(currentIsDark ? 'light' : 'dark');
  }

  /**
   * Aplica o tema atual
   */
  private applyTheme(): void {
    const shouldBeDark = this._theme.value === 'dark' || 
      (this._theme.value === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    Dark.set(shouldBeDark);
    
    // Adicionar classe ao body para CSS customizado
    document.body.classList.toggle('theme-dark', shouldBeDark);
    document.body.classList.toggle('theme-light', !shouldBeDark);
  }

  /**
   * Carrega tema do localStorage
   */
  private loadThemeFromStorage(): void {
    const stored = localStorage.getItem('rpg-ai-theme') as TemaApp;
    if (stored && ['auto', 'light', 'dark'].includes(stored)) {
      this._theme.value = stored;
    }
    this.applyTheme();
  }

  /**
   * Salva tema no localStorage
   */
  private saveThemeToStorage(): void {
    localStorage.setItem('rpg-ai-theme', this._theme.value);
  }

  /**
   * Configura listener para mudanças de preferência do sistema
   */
  private setupMediaQueryListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addListener(() => {
      if (this._theme.value === 'auto') {
        this.applyTheme();
      }
    });
  }

  /**
   * Obtém lista de temas disponíveis
   */
  public getAvailableThemes(): Array<{ value: TemaApp; label: string; icon: string }> {
    return [
      { value: 'auto', label: 'Automático', icon: 'brightness_auto' },
      { value: 'light', label: 'Claro', icon: 'light_mode' },
      { value: 'dark', label: 'Escuro', icon: 'dark_mode' }
    ];
  }

  /**
   * Obtém cores do tema atual
   */
  public getCurrentThemeColors() {
    const isDark = this.isDark.value;
    
    return {
      primary: isDark ? '#bb86fc' : '#1976d2',
      secondary: isDark ? '#03dac6' : '#26a69a',
      accent: isDark ? '#cf6679' : '#9c27b0',
      dark: isDark ? '#121212' : '#1d1d1d',
      positive: isDark ? '#4caf50' : '#21ba45',
      negative: isDark ? '#f44336' : '#c10015',
      info: isDark ? '#2196f3' : '#31ccec',
      warning: isDark ? '#ff9800' : '#f2c037',
      background: isDark ? '#121212' : '#ffffff',
      surface: isDark ? '#1e1e1e' : '#f5f5f5'
    };
  }
}

// Exportar instância singleton
export const themeService = ThemeService.getInstance();

// Composable para usar em componentes Vue
export function useTheme() {
  return {
    theme: computed(() => themeService.theme),
    isDark: themeService.isDark,
    setTheme: themeService.setTheme.bind(themeService),
    toggleTheme: themeService.toggleTheme.bind(themeService),
    availableThemes: themeService.getAvailableThemes(),
    currentColors: computed(() => themeService.getCurrentThemeColors())
  };
}
