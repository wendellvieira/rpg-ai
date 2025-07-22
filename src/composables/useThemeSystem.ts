/**
 * 🎨 Sistema de Temas RPG-AI
 *
 * Gerencia tokens de design, variáveis CSS e temas do projeto.
 * Integra com Tailwind CSS e Quasar Framework.
 */

import { ref, computed, watch } from 'vue';

/**
 * Tipos para definição de temas
 */
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borders: ThemeBorders;
  animations: ThemeAnimations;
}

export interface ThemeColors {
  // Cores principais
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;

  // Cores funcionais
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;

  // Cores neutras
  gray: ColorScale;
  dark: ColorScale;

  // Cores de superficie
  background: string;
  surface: string;
  overlay: string;

  // Texto
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Bordas
  border: string;
  borderLight: string;
  borderHeavy: string;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
    fantasy: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  glow: string;
  card: string;
  modal: string;
}

export interface ThemeBorders {
  radius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  width: {
    0: string;
    1: string;
    2: string;
    4: string;
    8: string;
  };
}

export interface ThemeAnimations {
  duration: {
    75: string;
    100: string;
    150: string;
    200: string;
    300: string;
    500: string;
    700: string;
    1000: string;
  };
  timing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
  };
}

/**
 * Temas predefinidos
 */
export const LIGHT_THEME: ThemeConfig = {
  id: 'light',
  name: 'Tema Claro',
  description: 'Tema claro padrão com cores vibrantes',
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006',
    },
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
      950: '#500724',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    dark: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    background: '#ffffff',
    surface: '#f8fafc',
    overlay: 'rgba(0, 0, 0, 0.5)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHeavy: '#cbd5e1',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      fantasy: ['Cinzel', 'serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
    '5xl': '96px',
    '6xl': '128px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    width: {
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
  },
  animations: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export const DARK_THEME: ThemeConfig = {
  ...LIGHT_THEME,
  id: 'dark',
  name: 'Tema Escuro',
  description: 'Tema escuro elegante para uso noturno',
  colors: {
    ...LIGHT_THEME.colors,
    background: '#0f172a',
    surface: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.75)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#0f172a',
    border: '#334155',
    borderLight: '#475569',
    borderHeavy: '#64748b',
  },
};

/**
 * Hook principal para gerenciamento de temas
 */
export function useThemeSystem() {
  // Estado reativo
  const currentThemeId = ref<string>('light');
  const availableThemes = ref<ThemeConfig[]>([LIGHT_THEME, DARK_THEME]);
  const isSystemDarkMode = ref(false);
  const autoDetectSystemTheme = ref(true);

  // Computed properties
  const currentTheme = computed(
    () => availableThemes.value.find((theme) => theme.id === currentThemeId.value) || LIGHT_THEME,
  );

  const isDarkMode = computed(() => currentThemeId.value === 'dark');

  /**
   * Aplica as variáveis CSS do tema atual
   */
  const applyTheme = () => {
    const root = document.documentElement;
    const theme = currentTheme.value;

    // Apply design tokens based on theme
    root.className = isDarkMode.value ? 'dark' : '';

    // Generate CSS variables for the current theme
    const cssVars = getCSSVariables(theme);
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  /**
   * Gerar variáveis CSS a partir do tema
   */
  const getCSSVariables = (theme: ThemeConfig): Record<string, string> => {
    const variables: Record<string, string> = {};

    // Cores
    Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'string') {
        variables[`--color-${colorName}`] = colorValue;
      } else if (typeof colorValue === 'object' && colorValue !== null) {
        Object.entries(colorValue as ColorScale).forEach(([shade, value]) => {
          variables[`--color-${colorName}-${shade}`] = value as string;
        });
      }
    });

    // Tipografia
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
      variables[`--font-size-${size}`] = value;
    });

    Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
      variables[`--font-weight-${weight}`] = value.toString();
    });

    // Espaçamento
    Object.entries(theme.spacing).forEach(([size, value]) => {
      variables[`--spacing-${size}`] = value;
    });

    // Sombras
    Object.entries(theme.shadows).forEach(([size, value]) => {
      variables[`--shadow-${size}`] = value;
    });

    // Bordas
    Object.entries(theme.borders.radius).forEach(([size, value]) => {
      variables[`--radius-${size}`] = value;
    });

    // Animações
    Object.entries(theme.animations.duration).forEach(([duration, value]) => {
      variables[`--duration-${duration}`] = value;
    });

    return variables;
  };

  /**
   * Alterar tema
   */
  const setTheme = (themeId: string) => {
    const theme = availableThemes.value.find((t) => t.id === themeId);
    if (theme) {
      currentThemeId.value = themeId;
      applyTheme();

      // Salvar preferência no localStorage
      localStorage.setItem('rpg-ai-theme', themeId);
    }
  };

  /**
   * Alternar entre claro e escuro
   */
  const toggleTheme = () => {
    const newTheme = isDarkMode.value ? 'light' : 'dark';
    setTheme(newTheme);
  };

  /**
   * Detectar preferência do sistema
   */
  const detectSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isSystemDarkMode.value = mediaQuery.matches;

    if (autoDetectSystemTheme.value) {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    // Escutar mudanças
    mediaQuery.addEventListener('change', (e) => {
      isSystemDarkMode.value = e.matches;
      if (autoDetectSystemTheme.value) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  };

  /**
   * Carregar tema salvo
   */
  const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('rpg-ai-theme');
    const savedAutoDetect = localStorage.getItem('rpg-ai-auto-detect-theme');

    if (savedAutoDetect !== null) {
      autoDetectSystemTheme.value = savedAutoDetect === 'true';
    }

    if (savedTheme && !autoDetectSystemTheme.value) {
      setTheme(savedTheme);
    } else {
      detectSystemTheme();
    }
  };

  /**
   * Adicionar tema customizado
   */
  const addCustomTheme = (theme: ThemeConfig) => {
    const existingIndex = availableThemes.value.findIndex((t) => t.id === theme.id);
    if (existingIndex >= 0) {
      availableThemes.value[existingIndex] = theme;
    } else {
      availableThemes.value.push(theme);
    }
  };

  /**
   * Gerar CSS para tema
   */
  const generateThemeCSS = (theme: ThemeConfig): string => {
    const variables = getCSSVariables(theme);
    const cssLines: string[] = [`:root {`];

    Object.entries(variables).forEach(([property, value]) => {
      cssLines.push(`  ${property}: ${value};`);
    });

    cssLines.push(`}`);
    return cssLines.join('\n');
  };

  // Watchers
  watch(autoDetectSystemTheme, (newValue) => {
    localStorage.setItem('rpg-ai-auto-detect-theme', newValue.toString());
    if (newValue) {
      detectSystemTheme();
    }
  });

  // Inicialização
  const initializeTheme = () => {
    loadSavedTheme();
  };

  return {
    // Estado
    currentThemeId,
    currentTheme,
    availableThemes,
    isDarkMode,
    isSystemDarkMode,
    autoDetectSystemTheme,

    // Métodos
    setTheme,
    toggleTheme,
    applyTheme,
    detectSystemTheme,
    loadSavedTheme,
    addCustomTheme,
    generateThemeCSS,
    getCSSVariables,
    initializeTheme,

    // Temas predefinidos
    LIGHT_THEME,
    DARK_THEME,
  };
}
