<template>
  <div class="layout-cluster" :class="clusterClasses" :style="clusterStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  LayoutUtils,
  type ResponsiveGap,
  type AlignItems,
  type JustifyContent,
} from './layout-types';

interface Props extends ResponsiveGap {
  // Alinhamento vertical dos itens
  align?: AlignItems;
  alignMobile?: AlignItems;
  alignTablet?: AlignItems;
  alignDesktop?: AlignItems;
  alignWide?: AlignItems;

  // Justificação horizontal dos itens
  justify?: JustifyContent;
  justifyMobile?: JustifyContent;
  justifyTablet?: JustifyContent;
  justifyDesktop?: JustifyContent;
  justifyWide?: JustifyContent;

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
  wrapReverse?: boolean;

  // Separadores (experimentar)
  separator?: boolean;
  separatorColor?: string;

  // Classes customizadas
  class?: string | string[] | Record<string, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 'md',
  align: 'center',
  justify: 'start',
  reverse: false,
  wrap: true,
  wrapReverse: false,
  separator: false,
});

// Calcula estilos CSS do cluster
const clusterStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Flex direction
  styles['flex-direction'] = props.reverse ? 'row-reverse' : 'row';

  // Flex wrap
  if (props.wrapReverse) {
    styles['flex-wrap'] = 'wrap-reverse';
  } else if (props.wrap) {
    styles['flex-wrap'] = 'wrap';
  } else {
    styles['flex-wrap'] = 'nowrap';
  }

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

  // Justificação
  if (props.justify) {
    const justifyValue =
      props.justify === 'start'
        ? 'flex-start'
        : props.justify === 'end'
          ? 'flex-end'
          : props.justify;
    styles['justify-content'] = justifyValue;
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
const clusterClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'layout-cluster--reverse': props.reverse,
    'layout-cluster--wrap': props.wrap,
    'layout-cluster--wrap-reverse': props.wrapReverse,
    'layout-cluster--no-wrap': !props.wrap && !props.wrapReverse,
    'layout-cluster--separator': props.separator,
  };

  // Classes de alinhamento
  if (props.align) {
    classes[`layout-cluster--align-${props.align}`] = true;
  }

  // Classes de justificação
  if (props.justify) {
    classes[`layout-cluster--justify-${props.justify}`] = true;
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
.layout-cluster {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  &--reverse {
    flex-direction: row-reverse;
  }

  &--wrap {
    flex-wrap: wrap;
  }

  &--wrap-reverse {
    flex-wrap: wrap-reverse;
  }

  &--no-wrap {
    flex-wrap: nowrap;
  }

  // Separadores visuais entre itens
  &--separator {
    > * + * {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: calc(-1 * var(--gap, 16px) / 2);
        top: 0;
        bottom: 0;
        width: 1px;
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

  // Classes de justificação
  &--justify-start {
    justify-content: flex-start;
  }

  &--justify-end {
    justify-content: flex-end;
  }

  &--justify-center {
    justify-content: center;
  }

  &--justify-stretch {
    justify-content: stretch;
  }

  &--justify-space-around {
    justify-content: space-around;
  }

  &--justify-space-between {
    justify-content: space-between;
  }

  &--justify-space-evenly {
    justify-content: space-evenly;
  }
}

// Media queries responsivas
@media (max-width: 767px) {
  .layout-cluster {
    // Estilos mobile podem ser adicionados aqui
    // Por exemplo: forçar direção vertical em mobile
    // flex-direction: column;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .layout-cluster {
    // Estilos tablet podem ser adicionados aqui
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .layout-cluster {
    // Estilos desktop podem ser adicionados aqui
  }
}

@media (min-width: 1440px) {
  .layout-cluster {
    // Estilos wide podem ser adicionados aqui
  }
}
</style>
