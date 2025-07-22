<template>
  <q-btn
    :label="ctrl.label"
    :icon="ctrl.icon"
    :icon-right="ctrl.iconRight"
    :loading="ctrl.loading"
    :disable="ctrl.disabled"
    :type="ctrl.type"
    :color="ctrl.color"
    :text-color="ctrl.textColor"
    :size="ctrl.size"
    :outline="ctrl.outline"
    :flat="ctrl.flat"
    :unelevated="ctrl.unelevated"
    :rounded="ctrl.rounded"
    :push="ctrl.push"
    :glossy="ctrl.glossy"
    :fab="ctrl.fab"
    :fab-mini="ctrl.fabMini"
    :padding="ctrl.padding"
    :dense="ctrl.dense"
    :ripple="ctrl.ripple"
    :round="ctrl.round"
    :square="ctrl.square"
    :stretch="ctrl.stretch"
    :stack="ctrl.stack"
    :align="ctrl.align"
    :no-caps="ctrl.noCaps"
    :no-wrap="ctrl.noWrap"
    :percentage="ctrl.percentage"
    :tabindex="ctrl.tabindex"
    :href="ctrl.href"
    :target="ctrl.target"
    :to="ctrl.to"
    :replace="ctrl.replace"
    :exact="ctrl.exact"
    :exact-active-class="ctrl.exactActiveClass"
    :active-class="ctrl.activeClass"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
    @keyup="onKeyup"
    class="base-btn"
    :class="btnClasses"
  >
    <!-- Slot para conteúdo customizado -->
    <template v-if="$slots.default" #default>
      <slot />
    </template>

    <!-- Slot para loading customizado -->
    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Btn_Ctrl } from './Btn_Ctrl';
import type { BtnConfig } from './Btn_Data';

interface Props {
  ctrl?: Btn_Ctrl;
  config?: BtnConfig;
  label?: string;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  color?: string;
  textColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  outline?: boolean;
  flat?: boolean;
  unelevated?: boolean;
  rounded?: boolean;
  push?: boolean;
  glossy?: boolean;
  fab?: boolean;
  fabMini?: boolean;
  padding?: string;
  dense?: boolean;
  ripple?: boolean;
  round?: boolean;
  square?: boolean;
  stretch?: boolean;
  stack?: boolean;
  align?: 'left' | 'right' | 'center' | 'around' | 'between' | 'evenly';
  noCaps?: boolean;
  noWrap?: boolean;
  percentage?: number;
  darkPercentage?: number;
  tabindex?: number;
  href?: string;
  target?: string;
  to?: string | object;
  replace?: boolean;
  exact?: boolean;
  exactActiveClass?: string;
  activeClass?: string;
  class?: string | string[] | Record<string, boolean>;
}

interface Emits {
  (e: 'click', event: Event): void;
  (e: 'focus', event: Event): void;
  (e: 'blur', event: Event): void;
  (e: 'keydown', event: KeyboardEvent): void;
  (e: 'keyup', event: KeyboardEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  size: 'md',
  loading: false,
  disabled: false,
  outline: false,
  flat: false,
  unelevated: false,
  rounded: false,
  push: false,
  glossy: false,
  fab: false,
  fabMini: false,
  dense: false,
  ripple: true,
  round: false,
  square: false,
  stretch: false,
  stack: false,
  align: 'center',
  noCaps: false,
  noWrap: false,
  replace: false,
  exact: false,
});

const emit = defineEmits<Emits>();

// Controller interno ou injetado
const internalCtrl = ref<Btn_Ctrl | null>(null);
const ctrl = computed(() => {
  if (props.ctrl) return props.ctrl;
  if (!internalCtrl.value) {
    internalCtrl.value = Btn_Ctrl.create(props.config || {});
  }
  return internalCtrl.value;
});

// Classes CSS dinâmicas
const btnClasses = computed(() => {
  const classes: Record<string, boolean> = {};

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

  // Classes baseadas no estado do controller
  if (ctrl.value.loading) classes['base-btn--loading'] = true;
  if (ctrl.value.disabled) classes['base-btn--disabled'] = true;
  if (ctrl.value.isIconOnly) classes['base-btn--icon-only'] = true;
  if (ctrl.value.hasLabel) classes['base-btn--has-label'] = true;
  if (ctrl.value.hasIcon) classes['base-btn--has-icon'] = true;
  if (ctrl.value.isNavigation) classes['base-btn--navigation'] = true;
  if (!ctrl.value.isClickable) classes['base-btn--not-clickable'] = true;

  return classes;
});

// Event handlers
async function onClick(event: Event) {
  try {
    await ctrl.value.click();
    emit('click', event);
  } catch (error) {
    console.error('Erro no clique do botão:', error);
  }
}

function onFocus(event: Event) {
  emit('focus', event);
}

function onBlur(event: Event) {
  emit('blur', event);
}

function onKeydown(event: KeyboardEvent) {
  emit('keydown', event);
}

function onKeyup(event: KeyboardEvent) {
  emit('keyup', event);
}

// Sincroniza props com controller quando não usar controller injetado
function syncPropsToController() {
  if (props.ctrl) return; // Não sincroniza se usar controller injetado

  const config: BtnConfig = {};
  if (props.label !== undefined) config.label = props.label;
  if (props.icon !== undefined) config.icon = props.icon;
  if (props.iconRight !== undefined) config.iconRight = props.iconRight;
  if (props.loading !== undefined) config.loading = props.loading;
  if (props.disabled !== undefined) config.disabled = props.disabled;
  if (props.type !== undefined) config.type = props.type;
  if (props.color !== undefined) config.color = props.color;
  if (props.textColor !== undefined) config.textColor = props.textColor;
  if (props.size !== undefined) config.size = props.size;
  if (props.outline !== undefined) config.outline = props.outline;
  if (props.flat !== undefined) config.flat = props.flat;
  if (props.unelevated !== undefined) config.unelevated = props.unelevated;
  if (props.rounded !== undefined) config.rounded = props.rounded;
  if (props.push !== undefined) config.push = props.push;
  if (props.glossy !== undefined) config.glossy = props.glossy;
  if (props.fab !== undefined) config.fab = props.fab;
  if (props.fabMini !== undefined) config.fabMini = props.fabMini;
  if (props.padding !== undefined) config.padding = props.padding;
  if (props.dense !== undefined) config.dense = props.dense;
  if (props.ripple !== undefined) config.ripple = props.ripple;
  if (props.round !== undefined) config.round = props.round;
  if (props.square !== undefined) config.square = props.square;
  if (props.stretch !== undefined) config.stretch = props.stretch;
  if (props.stack !== undefined) config.stack = props.stack;
  if (props.align !== undefined) config.align = props.align;
  if (props.noCaps !== undefined) config.noCaps = props.noCaps;
  if (props.noWrap !== undefined) config.noWrap = props.noWrap;
  if (props.percentage !== undefined) config.percentage = props.percentage;
  if (props.darkPercentage !== undefined) config.darkPercentage = props.darkPercentage;
  if (props.tabindex !== undefined) config.tabindex = props.tabindex;
  if (props.href !== undefined) config.href = props.href;
  if (props.target !== undefined) config.target = props.target;
  if (props.to !== undefined) config.to = props.to;
  if (props.replace !== undefined) config.replace = props.replace;
  if (props.exact !== undefined) config.exact = props.exact;
  if (props.exactActiveClass !== undefined) config.exactActiveClass = props.exactActiveClass;
  if (props.activeClass !== undefined) config.activeClass = props.activeClass;

  ctrl.value.mount(config);
}

// Expõe o controller para componentes pais
defineExpose({ ctrl: ctrl.value });

onMounted(() => {
  syncPropsToController();
});
</script>

<style lang="scss" scoped>
.base-btn {
  &--loading {
    // Estilos para estado de carregamento
  }

  &--disabled {
    // Estilos para estado desabilitado
  }

  &--icon-only {
    // Estilos para botões apenas com ícone
  }

  &--has-label {
    // Estilos para botões com label
  }

  &--has-icon {
    // Estilos para botões com ícone
  }

  &--navigation {
    // Estilos para botões de navegação
  }

  &--not-clickable {
    // Estilos para botões não clicáveis
  }
}
</style>
