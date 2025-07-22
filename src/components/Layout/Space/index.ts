/**
 * Sistema de Layout Space
 * Componentes de layout baseados em CSS Grid e Flexbox
 * Substitui o sistema de cols/rows do Quasar
 */

// Grid System
export { default as Grid } from './Grid.vue';
export { default as GridItem } from './GridItem.vue';

// Flex System
export { default as Flex } from './Flex.vue';
export { default as FlexItem } from './FlexItem.vue';

// Layout Primitives
export { default as Stack } from './Stack.vue'; // Layout vertical
export { default as Cluster } from './Cluster.vue'; // Layout horizontal

// Types and Utilities
export * from './layout-types';
export type {
  GapSize,
  Breakpoint,
  AlignContent,
  JustifyContent,
  AlignItems,
  JustifyItems,
  ResponsiveColumns,
  ResponsiveGap,
  GridItemProps,
  FlexItemProps,
} from './layout-types';
