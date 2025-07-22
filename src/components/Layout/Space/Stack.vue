<template>
  <div class="layout-stack" :class="stackClasses" :style="stackStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LayoutUtils, type ResponsiveGap, type AlignItems } from './layout-types';

interface Props extends ResponsiveGap {
  // Alinhamento horizontal dos itens
  align?: AlignItems;
  alignMobile?: AlignItems;
  alignTablet?: AlignItems;
  alignDesktop?: AlignItems;
  alignWide?: AlignItems;

  // Dimensões
  minHeight?: string;
  maxHeight?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  width?: string;

  // Comportamento
  reverse?: boolean;
  wrap?: boolean;

  // Separadores (experimentar)
  separator?: boolean;
  separatorColor?: string;

  // Classes customizadas
  class?: string | string[] | Record<string, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 'md',
  align: 'stretch',
  reverse: false,
  wrap: false,
  separator: false,
});

// Calcula estilos CSS do stack
const stackStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Flex direction
  styles['flex-direction'] = props.reverse ? 'column-reverse' : 'column';

  // Gap
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
  if (props.align) {
    const alignValue =
      props.align === 'start' ? 'flex-start' : props.align === 'end' ? 'flex-end' : props.align;
    styles['align-items'] = alignValue;
  }

  // Wrap
  if (props.wrap) {
    styles['flex-wrap'] = 'wrap';
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

  // Separador
  if (props.separator && props.separatorColor) {
    styles['--separator-color'] = props.separatorColor;
  }

  return styles;
});

// Classes CSS dinâmicas
const stackClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'layout-stack--reverse': props.reverse,
    'layout-stack--wrap': props.wrap,
    'layout-stack--separator': props.separator,
  };

  // Classes de alinhamento
  if (props.align) {
    classes[`layout-stack--align-${props.align}`] = true;
  }

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
.layout-stack {
  display: flex;
  flex-direction: column;

  &--reverse {
    flex-direction: column-reverse;
  }

  &--wrap {
    flex-wrap: wrap;
  }

  // Separadores visuais entre itens
  &--separator {
    > * + * {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: calc(-1 * var(--gap, 16px) / 2);
        left: 0;
        right: 0;
        height: 1px;
        background-color: var(--separator-color, #e0e0e0);
      }
    }
  }

  // Classes de alinhamento
  &--align-start {
    align-items: flex-start;
  }

  &--align-end {
    align-items: flex-end;
  }

  &--align-center {
    align-items: center;
  }

  &--align-stretch {
    align-items: stretch;
  }

  &--align-baseline {
    align-items: baseline;
  }
}

// Media queries responsivas
@media (max-width: 767px) {
  .layout-stack {
    // Estilos mobile podem ser adicionados aqui
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .layout-stack {
    // Estilos tablet podem ser adicionados aqui
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .layout-stack {
    // Estilos desktop podem ser adicionados aqui
  }
}

@media (min-width: 1440px) {
  .layout-stack {
    // Estilos wide podem ser adicionados aqui
  }
}
</style>
