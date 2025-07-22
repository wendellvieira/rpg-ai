<template>
  <div class="layout-grid-item" :class="itemClasses" :style="itemStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GridItemProps, AlignItems, JustifyItems } from './layout-types';

interface Props extends GridItemProps {
  // Posicionamento responsivo
  colStartMobile?: number;
  colStartTablet?: number;
  colStartDesktop?: number;
  colStartWide?: number;

  colEndMobile?: number;
  colEndTablet?: number;
  colEndDesktop?: number;
  colEndWide?: number;

  colSpanMobile?: number;
  colSpanTablet?: number;
  colSpanDesktop?: number;
  colSpanWide?: number;

  rowStartMobile?: number;
  rowStartTablet?: number;
  rowStartDesktop?: number;
  rowStartWide?: number;

  rowEndMobile?: number;
  rowEndTablet?: number;
  rowEndDesktop?: number;
  rowEndWide?: number;

  rowSpanMobile?: number;
  rowSpanTablet?: number;
  rowSpanDesktop?: number;
  rowSpanWide?: number;

  // Área responsiva
  areaMobile?: string;
  areaTablet?: string;
  areaDesktop?: string;
  areaWide?: string;

  // Alinhamento responsivo
  alignSelfMobile?: AlignItems;
  alignSelfTablet?: AlignItems;
  alignSelfDesktop?: AlignItems;
  alignSelfWide?: AlignItems;

  justifySelfMobile?: JustifyItems;
  justifySelfTablet?: JustifyItems;
  justifySelfDesktop?: JustifyItems;
  justifySelfWide?: JustifyItems;

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

const props = defineProps<Props>();

// Calcula estilos CSS do item
const itemStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Grid column
  if (props.colStart) {
    styles['grid-column-start'] = String(props.colStart);
  }
  if (props.colEnd) {
    styles['grid-column-end'] = String(props.colEnd);
  }
  if (props.colSpan) {
    styles['grid-column'] = `span ${props.colSpan}`;
  }

  // Grid row
  if (props.rowStart) {
    styles['grid-row-start'] = String(props.rowStart);
  }
  if (props.rowEnd) {
    styles['grid-row-end'] = String(props.rowEnd);
  }
  if (props.rowSpan) {
    styles['grid-row'] = `span ${props.rowSpan}`;
  }

  // Grid area
  if (props.area) {
    styles['grid-area'] = props.area;
  }

  // Alinhamento
  if (props.alignSelf) {
    styles['align-self'] = props.alignSelf;
  }
  if (props.justifySelf) {
    styles['justify-self'] = props.justifySelf;
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
  const classes: Record<string, boolean> = {};

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
.layout-grid-item {
  // Estilos base do item
  min-width: 0; // Previne overflow em grids
  min-height: 0; // Previne overflow em grids
}

// Media queries responsivas para props responsivas
// Nota: Para implementação completa das props responsivas,
// seria necessário gerar CSS dinâmico ou usar CSS-in-JS
// Por enquanto, os estilos responsivos podem ser aplicados via classes

@media (max-width: 767px) {
  .layout-grid-item {
    // Estilos mobile podem ser adicionados aqui
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .layout-grid-item {
    // Estilos tablet podem ser adicionados aqui
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .layout-grid-item {
    // Estilos desktop podem ser adicionados aqui
  }
}

@media (min-width: 1440px) {
  .layout-grid-item {
    // Estilos wide podem ser adicionados aqui
  }
}
</style>
