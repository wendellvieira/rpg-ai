<template>
  <div class="layout-flex-item" :class="itemClasses" :style="itemStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FlexItemProps, AlignItems } from './layout-types';

interface Props extends FlexItemProps {
  // Flex responsivo
  flexMobile?: number | string;
  flexTablet?: number | string;
  flexDesktop?: number | string;
  flexWide?: number | string;

  growMobile?: number;
  growTablet?: number;
  growDesktop?: number;
  growWide?: number;

  shrinkMobile?: number;
  shrinkTablet?: number;
  shrinkDesktop?: number;
  shrinkWide?: number;

  basisMobile?: string;
  basisTablet?: string;
  basisDesktop?: string;
  basisWide?: string;

  // Alinhamento responsivo
  alignSelfMobile?: AlignItems;
  alignSelfTablet?: AlignItems;
  alignSelfDesktop?: AlignItems;
  alignSelfWide?: AlignItems;

  // Ordem responsiva
  orderMobile?: number;
  orderTablet?: number;
  orderDesktop?: number;
  orderWide?: number;

  // Dimensões
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  minHeight?: string;
  maxHeight?: string;
  height?: string;

  // Classes customizadas
  class?: string | string[] | Record<string, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  flex: 'none',
  grow: 0,
  shrink: 1,
  basis: 'auto',
  order: 0,
});

// Calcula estilos CSS do item flex
const itemStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Flex shorthand ou propriedades individuais
  if (props.flex !== 'none') {
    styles['flex'] = String(props.flex);
  } else {
    if (props.grow !== 0) {
      styles['flex-grow'] = String(props.grow);
    }
    if (props.shrink !== 1) {
      styles['flex-shrink'] = String(props.shrink);
    }
    if (props.basis !== 'auto') {
      styles['flex-basis'] = props.basis;
    }
  }

  // Alinhamento
  if (props.alignSelf) {
    const alignValue =
      props.alignSelf === 'start'
        ? 'flex-start'
        : props.alignSelf === 'end'
          ? 'flex-end'
          : props.alignSelf;
    styles['align-self'] = alignValue;
  }

  // Ordem
  if (props.order !== 0) {
    styles['order'] = String(props.order);
  }

  // Dimensões
  if (props.width) {
    styles['width'] = props.width;
  }
  if (props.minWidth) {
    styles['min-width'] = props.minWidth;
  }
  if (props.maxWidth) {
    styles['max-width'] = props.maxWidth;
  }
  if (props.height) {
    styles['height'] = props.height;
  }
  if (props.minHeight) {
    styles['min-height'] = props.minHeight;
  }
  if (props.maxHeight) {
    styles['max-height'] = props.maxHeight;
  }

  return styles;
});

// Classes CSS dinâmicas
const itemClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'layout-flex-item--grow': props.grow > 0,
    'layout-flex-item--shrink': props.shrink > 0,
    'layout-flex-item--no-shrink': props.shrink === 0,
    'layout-flex-item--ordered': props.order !== 0,
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

// Expõe referência para componentes pais
defineExpose({
  element: null, // Será definido via template ref se necessário
});
</script>

<style lang="scss" scoped>
.layout-flex-item {
  // Estilos base do flex item
  min-width: 0; // Previne overflow em flex items
  min-height: 0; // Previne overflow em flex items

  &--grow {
    flex-grow: 1;
  }

  &--shrink {
    flex-shrink: 1;
  }

  &--no-shrink {
    flex-shrink: 0;
  }

  &--ordered {
    // Indicador visual para itens com ordem customizada (opcional)
  }
}

// Media queries responsivas
@media (max-width: 767px) {
  .layout-flex-item {
    // Estilos mobile podem ser adicionados aqui
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .layout-flex-item {
    // Estilos tablet podem ser adicionados aqui
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .layout-flex-item {
    // Estilos desktop podem ser adicionados aqui
  }
}

@media (min-width: 1440px) {
  .layout-flex-item {
    // Estilos wide podem ser adicionados aqui
  }
}
</style>
