/**
 * 🎨 Sistema Tailwind CSS + Quasar
 *
 * Exports centralizados para fácil importação dos utilitários
 * de integração entre Tailwind CSS e Quasar Framework.
 */

// Composables principais
export { useTailwindQuasar, useTailwindTheme } from 'src/composables/useTailwindQuasar';

// Componente de demonstração
export { default as TailwindDemo } from 'src/components/TailwindDemo.vue';

// Tipos TypeScript
export type { TailwindQuasarConfig } from 'src/composables/useTailwindQuasar';

/**
 * Re-export das constantes úteis
 */
import { useTailwindQuasar } from 'src/composables/useTailwindQuasar';

const { COLOR_MAP, SIZE_MAP } = useTailwindQuasar();

export { COLOR_MAP, SIZE_MAP };

/**
 * Utilitários de classe CSS comuns
 */
export const CommonClasses = {
  // Containers
  container: 'container-rpg',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',

  // Layouts
  centerContent: 'center-content',
  gridAutoFit: 'grid-auto-fit',
  gridAutoFill: 'grid-auto-fill',

  // Cards
  cardBase: 'card-rpg',
  cardHeader: 'card-rpg-header',
  cardBody: 'card-rpg-body',
  cardFooter: 'card-rpg-footer',

  // Botões
  btnBase: 'btn-rpg',
  btnPrimary: 'btn-rpg-primary',
  btnSecondary: 'btn-rpg-secondary',
  btnOutline: 'btn-rpg-outline',
  btnGhost: 'btn-rpg-ghost',

  // Inputs
  inputBase: 'input-rpg',
  inputError: 'input-rpg-error',

  // Estados
  interactive: 'interactive',
  interactiveSubtle: 'interactive-subtle',
  disabled: 'disabled',
  focusVisible: 'focus-visible',

  // Animações
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  bounceSoft: 'animate-bounce-soft',
  pulseGlow: 'animate-pulse-glow',

  // Utilitários
  scrollbarThin: 'scrollbar-thin',
  textBalance: 'text-balance',
  textPretty: 'text-pretty',
  fullBleed: 'full-bleed',
} as const;

/**
 * Paleta de cores para desenvolvimento
 */
export const ColorPalette = {
  primary: {
    50: 'bg-primary-50 text-primary-950',
    100: 'bg-primary-100 text-primary-900',
    200: 'bg-primary-200 text-primary-800',
    300: 'bg-primary-300 text-primary-700',
    400: 'bg-primary-400 text-primary-600',
    500: 'bg-primary-500 text-white',
    600: 'bg-primary-600 text-white',
    700: 'bg-primary-700 text-white',
    800: 'bg-primary-800 text-white',
    900: 'bg-primary-900 text-white',
    950: 'bg-primary-950 text-white',
  },
  secondary: {
    50: 'bg-secondary-50 text-secondary-950',
    100: 'bg-secondary-100 text-secondary-900',
    200: 'bg-secondary-200 text-secondary-800',
    300: 'bg-secondary-300 text-secondary-700',
    400: 'bg-secondary-400 text-secondary-600',
    500: 'bg-secondary-500 text-white',
    600: 'bg-secondary-600 text-white',
    700: 'bg-secondary-700 text-white',
    800: 'bg-secondary-800 text-white',
    900: 'bg-secondary-900 text-white',
    950: 'bg-secondary-950 text-white',
  },
  // ... outras cores disponíveis através das variáveis CSS
} as const;

/**
 * Breakpoints para uso em JavaScript
 */
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Sistema de Gap em pixels
 */
export const GapSizes = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
