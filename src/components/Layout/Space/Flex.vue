<template>
  <div class="layout-flex" :class="flexClasses" :style="flexStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  LayoutUtils,
  type ResponsiveGap,
  type AlignItems,
  type AlignContent,
  type JustifyContent,
} from './layout-types';

// Definindo nome do componente para resolver problema ESLint
defineOptions({
  name: 'LayoutFlex',
});

interface Props extends ResponsiveGap {
  // Direção do flex
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  directionMobile?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  directionTablet?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  directionDesktop?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  directionWide?: 'row' | 'column' | 'row-reverse' | 'column-reverse';

  // Wrap
  wrap?: boolean | 'reverse';
  wrapMobile?: boolean | 'reverse';
  wrapTablet?: boolean | 'reverse';
  wrapDesktop?: boolean | 'reverse';
  wrapWide?: boolean | 'reverse';

  // Alinhamento
  alignContent?: AlignContent;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;

  // Alinhamento responsivo
  alignContentMobile?: AlignContent;
  alignContentTablet?: AlignContent;
  alignContentDesktop?: AlignContent;
  alignContentWide?: AlignContent;

  justifyContentMobile?: JustifyContent;
  justifyContentTablet?: JustifyContent;
  justifyContentDesktop?: JustifyContent;
  justifyContentWide?: JustifyContent;

  alignItemsMobile?: AlignItems;
  alignItemsTablet?: AlignItems;
  alignItemsDesktop?: AlignItems;
  alignItemsWide?: AlignItems;

  // Dimensões
  minHeight?: string;
  maxHeight?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  width?: string;

  // Utilidades
  inline?: boolean;
  reverse?: boolean;

  // Classes customizadas
  class?: string | string[] | Record<string, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'row',
  gap: 'md',
  wrap: false,
  alignItems: 'stretch',
  justifyContent: 'start',
  inline: false,
  reverse: false,
});

// Calcula estilos CSS do flex
const flexStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Flex direction
  let direction = props.direction;
  if (props.reverse) {
    direction = direction === 'row' ? 'row-reverse' : 'column-reverse';
  }
  styles['flex-direction'] = direction;

  // Flex wrap
  if (props.wrap === true) {
    styles['flex-wrap'] = 'wrap';
  } else if (props.wrap === 'reverse') {
    styles['flex-wrap'] = 'wrap-reverse';
  } else {
    styles['flex-wrap'] = 'nowrap';
  }

  // Gap (usando gap em flexbox - suporte moderno)
  if (props.gap) {
    styles['gap'] = LayoutUtils.getGapValue(props.gap);
  }
  if (props.gapX) {
    styles['column-gap'] = LayoutUtils.getGapValue(props.gapX);
  }
  if (props.gapY) {
    styles['row-gap'] = LayoutUtils.getGapValue(props.gapY);
  }

  // Alinhamento
  if (props.alignContent) {
    styles['align-content'] = props.alignContent;
  }
  if (props.justifyContent) {
    const justifyValue =
      props.justifyContent === 'start'
        ? 'flex-start'
        : props.justifyContent === 'end'
          ? 'flex-end'
          : props.justifyContent;
    styles['justify-content'] = justifyValue;
  }
  if (props.alignItems) {
    const alignValue =
      props.alignItems === 'start'
        ? 'flex-start'
        : props.alignItems === 'end'
          ? 'flex-end'
          : props.alignItems;
    styles['align-items'] = alignValue;
  }

  // Dimensões
  if (props.height) {
    styles['height'] = props.height;
  }
  if (props.minHeight) {
    styles['min-height'] = props.minHeight;
  }
  if (props.maxHeight) {
    styles['max-height'] = props.maxHeight;
  }
  if (props.width) {
    styles['width'] = props.width;
  }
  if (props.minWidth) {
    styles['min-width'] = props.minWidth;
  }
  if (props.maxWidth) {
    styles['max-width'] = props.maxWidth;
  }

  return styles;
});

// Classes CSS dinâmicas
const flexClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'layout-flex--inline': props.inline,
    'layout-flex--column': props.direction === 'column' || props.direction === 'column-reverse',
    'layout-flex--reverse': props.reverse,
    'layout-flex--wrap': props.wrap === true,
    'layout-flex--wrap-reverse': props.wrap === 'reverse',
  };

  // Classes customizadas
  if (props.class) {
    if (typeof props.class === 'string') {
      props.class.split(' ').forEach((cls) => {
        if (cls.trim()) classes[cls.trim()] = true;
      });
    } else if (Array.isArray(props.class)) {
      props.class.forEach((cls) => {
        if (cls.trim()) classes[cls.trim()] = true;
      });
    } else {
      Object.assign(classes, props.class);
    }
  }

  return classes;
});

// Expõe referência para componentes filhos
defineExpose({
  element: null, // Será definido via template ref se necessário
});
</script>

<style lang="scss" scoped>
.layout-flex {
  display: flex;

  &--inline {
    display: inline-flex;
  }

  &--column {
    flex-direction: column;
  }

  &--reverse {
    &.layout-flex--column {
      flex-direction: column-reverse;
    }
    &:not(.layout-flex--column) {
      flex-direction: row-reverse;
    }
  }

  &--wrap {
    flex-wrap: wrap;
  }

  &--wrap-reverse {
    flex-wrap: wrap-reverse;
  }
}

// Media queries responsivas
@media (max-width: 767px) {
  .layout-flex {
    // Estilos mobile podem ser adicionados aqui
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .layout-flex {
    // Estilos tablet podem ser adicionados aqui
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .layout-flex {
    // Estilos desktop podem ser adicionados aqui
  }
}

@media (min-width: 1440px) {
  .layout-flex {
    // Estilos wide podem ser adicionados aqui
  }
}
</style>
