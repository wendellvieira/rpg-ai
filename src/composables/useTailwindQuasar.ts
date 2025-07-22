/**
 * Composable para integração entre Tailwind CSS e Quasar
 *
 * Fornece utilitários para combinar classes do Tailwind com componentes Quasar
 * de forma consistente e type-safe.
 */

import { computed, type Ref } from 'vue';

/**
 * Tipos para configuração de estilos
 */
export interface TailwindQuasarConfig {
  base?: string;
  variants?: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'accent' | 'positive' | 'negative' | 'warning' | 'info';
    variant?: 'filled' | 'outlined' | 'text' | 'unelevated' | 'elevated';
    dense?: boolean;
    rounded?: boolean;
    flat?: boolean;
  };
  tailwind?: string;
  custom?: string;
}

/**
 * Mapeamento de cores Quasar para Tailwind
 */
const COLOR_MAP = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',
  positive: 'green',
  negative: 'red',
  warning: 'yellow',
  info: 'blue',
} as const;

/**
 * Mapeamento de tamanhos
 */
const SIZE_MAP = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
  xl: 'text-xl px-8 py-4',
} as const;

/**
 * Hook principal para combinar estilos Tailwind + Quasar
 */
export function useTailwindQuasar() {
  /**
   * Combina classes CSS de diferentes fontes de forma inteligente
   */
  const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  };

  /**
   * Gera classes Tailwind baseadas na configuração
   */
  const generateTailwindClasses = (config: TailwindQuasarConfig): string => {
    const classes: string[] = [];

    // Classes base
    if (config.base) {
      classes.push(config.base);
    }

    // Variantes
    if (config.variants) {
      const { size, color, variant, dense, rounded, flat } = config.variants;

      // Tamanho
      if (size && SIZE_MAP[size]) {
        classes.push(SIZE_MAP[size]);
      }

      // Cor (usando Tailwind)
      if (color && COLOR_MAP[color]) {
        const tailwindColor = COLOR_MAP[color];

        switch (variant) {
          case 'filled':
            classes.push(`bg-${tailwindColor}-600 text-white hover:bg-${tailwindColor}-700`);
            break;
          case 'outlined':
            classes.push(
              `border-2 border-${tailwindColor}-600 text-${tailwindColor}-600 hover:bg-${tailwindColor}-50`,
            );
            break;
          case 'text':
            classes.push(`text-${tailwindColor}-600 hover:bg-${tailwindColor}-50`);
            break;
        }
      }

      // Modificadores
      if (dense) {
        classes.push('py-1');
      }
      if (rounded) {
        classes.push('rounded-full');
      }
      if (flat) {
        classes.push('shadow-none');
      }
    }

    // Classes Tailwind customizadas
    if (config.tailwind) {
      classes.push(config.tailwind);
    }

    // Classes totalmente customizadas
    if (config.custom) {
      classes.push(config.custom);
    }

    return classes.join(' ');
  };

  /**
   * Cria props computadas para componentes Quasar com Tailwind
   */
  const createQuasarProps = (config: Ref<TailwindQuasarConfig> | TailwindQuasarConfig) => {
    return computed(() => {
      const configValue = 'value' in config ? config.value : config;

      // Props base do Quasar
      const quasarProps: Record<string, string | boolean | number> = {};

      if (configValue.variants) {
        const { size, color, variant, dense, rounded, flat } = configValue.variants;

        if (size) quasarProps.size = size;
        if (color) quasarProps.color = color;
        if (variant) quasarProps[variant] = true;
        if (dense) quasarProps.dense = true;
        if (rounded) quasarProps.rounded = true;
        if (flat) quasarProps.flat = true;
      }

      return quasarProps;
    });
  };

  /**
   * Utilitários específicos para componentes
   */
  const buttonClasses = (config: TailwindQuasarConfig) => {
    return combineClasses(
      'btn-rpg', // Classe base do nosso CSS
      generateTailwindClasses(config),
    );
  };

  const inputClasses = (config: TailwindQuasarConfig) => {
    return combineClasses(
      'input-rpg', // Classe base do nosso CSS
      generateTailwindClasses(config),
    );
  };

  const cardClasses = (config: TailwindQuasarConfig) => {
    return combineClasses(
      'card-rpg', // Classe base do nosso CSS
      generateTailwindClasses(config),
    );
  };

  /**
   * Utilitários para layout responsivo
   */
  const responsiveClasses = (breakpoints: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
  }) => {
    const classes: string[] = [];

    if (breakpoints.mobile) classes.push(breakpoints.mobile);
    if (breakpoints.tablet) classes.push(`tablet:${breakpoints.tablet}`);
    if (breakpoints.desktop) classes.push(`desktop:${breakpoints.desktop}`);
    if (breakpoints.wide) classes.push(`wide:${breakpoints.wide}`);

    return classes.join(' ');
  };

  /**
   * Utilitários para estados
   */
  const stateClasses = (states: {
    hover?: string;
    focus?: string;
    active?: string;
    disabled?: string;
  }) => {
    const classes: string[] = [];

    if (states.hover) classes.push(`hover:${states.hover}`);
    if (states.focus) classes.push(`focus:${states.focus}`);
    if (states.active) classes.push(`active:${states.active}`);
    if (states.disabled) classes.push(`disabled:${states.disabled}`);

    return classes.join(' ');
  };

  /**
   * Utilitário para transições suaves
   */
  const transitionClasses = (type: 'all' | 'colors' | 'transform' | 'opacity' = 'all') => {
    const base = 'transition-';
    const duration = 'duration-200';
    const timing = 'ease-in-out';

    return `${base}${type} ${duration} ${timing}`;
  };

  return {
    // Funções principais
    combineClasses,
    generateTailwindClasses,
    createQuasarProps,

    // Utilitários por componente
    buttonClasses,
    inputClasses,
    cardClasses,

    // Utilitários avançados
    responsiveClasses,
    stateClasses,
    transitionClasses,

    // Constantes
    COLOR_MAP,
    SIZE_MAP,
  };
}

/**
 * Hook específico para gerenciar tema escuro/claro
 */
export function useTailwindTheme() {
  const applyTheme = (isDark: boolean) => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const getThemeClasses = (isDark: boolean) => {
    return {
      background: isDark ? 'bg-dark-900' : 'bg-white',
      surface: isDark ? 'bg-dark-800' : 'bg-gray-50',
      text: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
      border: isDark ? 'border-dark-700' : 'border-gray-200',
    };
  };

  return {
    applyTheme,
    getThemeClasses,
  };
}
