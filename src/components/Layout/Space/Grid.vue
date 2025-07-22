<template>
  <div :class="gridClasses" :style="computedStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type GridProps, GAP_VALUES } from './layout-types';

const props = withDefaults(defineProps<GridProps>(), {
  autoFlow: 'row',
  alignItems: 'stretch',
  alignContent: 'stretch',
  justifyContent: 'stretch',
  justifyItems: 'stretch',
  gap: 'md',
  dense: false,
  inline: false,
});

// Grid classes
const gridClasses = computed(() => ({
  'layout-grid': true,
  'layout-grid--inline': props.inline,
  'layout-grid--dense': props.dense,
}));

// Computed styles
const computedStyles = computed(() => {
  // Generate grid columns
  let gridColumns = 'repeat(auto-fit, minmax(250px, 1fr))'; // default
  if (props.cols) gridColumns = `repeat(${props.cols}, 1fr)`;
  else if (props.colsTablet) gridColumns = `repeat(${props.colsTablet}, 1fr)`;
  else if (props.colsMobile) gridColumns = `repeat(${props.colsMobile}, 1fr)`;

  // Generate gap
  let gapValue = '16px'; // default md
  if (props.gap) gapValue = GAP_VALUES[props.gap];
  else if (props.gapTablet) gapValue = GAP_VALUES[props.gapTablet];
  else if (props.gapMobile) gapValue = GAP_VALUES[props.gapMobile];

  return {
    display: props.inline ? 'inline-grid' : 'grid',
    gridAutoFlow: props.autoFlow,
    gridTemplateColumns: gridColumns,
    alignItems: props.alignItems,
    alignContent: props.alignContent,
    justifyContent: props.justifyContent,
    justifyItems: props.justifyItems,
    gap: gapValue,
    gridAutoRows: props.dense ? 'min-content' : undefined,
  };
});
</script>

<style lang="scss" scoped>
.layout-grid {
  display: grid;

  &--inline {
    display: inline-grid;
  }

  &--dense {
    grid-auto-flow: dense;
  }
}
</style>
