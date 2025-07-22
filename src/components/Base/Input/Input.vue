<template>
  <q-input
    v-model="ctrl.value"
    :label="ctrl.label"
    :placeholder="ctrl.placeholder"
    :type="ctrl.type"
    :required="ctrl.required"
    :disable="ctrl.disabled"
    :readonly="ctrl.readonly"
    :maxlength="ctrl.maxlength"
    :minlength="ctrl.minlength"
    :min="ctrl.min"
    :max="ctrl.max"
    :step="ctrl.step"
    :pattern="ctrl.pattern"
    :autocomplete="ctrl.autocomplete"
    :autofocus="ctrl.autofocus"
    :error="ctrl.error"
    :error-message="ctrl.errorMessage"
    :hint="ctrl.hint"
    :prefix="ctrl.prefix"
    :suffix="ctrl.suffix"
    :clearable="ctrl.clearable"
    :outlined="ctrl.outlined"
    :filled="ctrl.filled"
    :dense="ctrl.dense"
    :square="ctrl.square"
    :rounded="ctrl.rounded"
    :borderless="ctrl.borderless"
    :standout="ctrl.standout"
    :hide-bottom-space="ctrl.hideBottomSpace"
    :stack-label="ctrl.stackLabel"
    :float-label="ctrl.floatLabel"
    :clear-icon="ctrl.clearIcon"
    :loading="ctrl.loading"
    :debounce="ctrl.debounce"
    :throttle="ctrl.throttle"
    :mask="ctrl.mask"
    :fill-mask="ctrl.fillMask"
    :reverse-fill-mask="ctrl.reverseFillMask"
    :unmasked-value="ctrl.unmaskedValue"
    @update:model-value="onUpdateValue"
    @focus="onFocus"
    @blur="onBlur"
    @clear="onClear"
    @keydown="onKeydown"
    @keyup="onKeyup"
    @input="onInput"
    class="base-input"
    :class="inputClasses"
  >
    <!-- Slot para ícone inicial -->
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <!-- Slot para ícone final -->
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>

    <!-- Slot para conteúdo antes do input -->
    <template v-if="$slots.before" #before>
      <slot name="before" />
    </template>

    <!-- Slot para conteúdo após o input -->
    <template v-if="$slots.after" #after>
      <slot name="after" />
    </template>

    <!-- Slot para label customizado -->
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>

    <!-- Slot para loading customizado -->
    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>

    <!-- Slot para hint customizado -->
    <template v-if="$slots.hint" #hint>
      <slot name="hint" />
    </template>

    <!-- Slot para error customizado -->
    <template v-if="$slots.error" #error>
      <slot name="error" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Input_Ctrl } from './Input_Ctrl';
import type { InputConfig } from './Input_Data';

// Definindo nome do componente para resolver problema ESLint
defineOptions({
  name: 'BaseInput',
});

interface Props {
  ctrl?: Input_Ctrl;
  config?: InputConfig;
  modelValue?: string | number | null;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  minlength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autocomplete?: string;
  autofocus?: boolean;
  error?: boolean;
  errorMessage?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  clearable?: boolean;
  outlined?: boolean;
  filled?: boolean;
  dense?: boolean;
  square?: boolean;
  rounded?: boolean;
  borderless?: boolean;
  standout?: boolean;
  hideBottomSpace?: boolean;
  stackLabel?: boolean;
  floatLabel?: boolean;
  clearIcon?: string;
  loading?: boolean;
  debounce?: string | number;
  throttle?: string | number;
  mask?: string;
  fillMask?: boolean | string;
  reverseFillMask?: boolean;
  unmaskedValue?: boolean;
  class?: string | string[] | Record<string, boolean>;
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void;
  (e: 'focus', event: Event): void;
  (e: 'blur', event: Event): void;
  (e: 'clear', value: string | number | null): void;
  (e: 'keydown', event: KeyboardEvent): void;
  (e: 'keyup', event: KeyboardEvent): void;
  (e: 'input', value: string | number | null): void;
  (e: 'change', value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false,
  autofocus: false,
  error: false,
  clearable: false,
  outlined: true,
  filled: false,
  dense: false,
  square: false,
  rounded: false,
  borderless: false,
  standout: false,
  hideBottomSpace: false,
  stackLabel: false,
  floatLabel: false,
  clearIcon: 'cancel',
  loading: false,
  reverseFillMask: false,
  unmaskedValue: false,
});

const emit = defineEmits<Emits>();

// Controller interno ou injetado
const internalCtrl = ref<Input_Ctrl | null>(null);

// Inicializa o controller se necessário
const initializeController = () => {
  if (!internalCtrl.value && !props.ctrl) {
    internalCtrl.value = Input_Ctrl.create(props.config || {});
  }
};

const ctrl = computed(() => {
  if (props.ctrl) return props.ctrl;
  initializeController();
  return internalCtrl.value!;
});

// Classes CSS dinâmicas
const inputClasses = computed(() => {
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
  if (ctrl.value.error) classes['base-input--error'] = true;
  if (ctrl.value.loading) classes['base-input--loading'] = true;
  if (ctrl.value.disabled) classes['base-input--disabled'] = true;
  if (ctrl.value.readonly) classes['base-input--readonly'] = true;
  if (ctrl.value.required) classes['base-input--required'] = true;
  if (ctrl.value.hasValue) classes['base-input--has-value'] = true;

  return classes;
});

// Event handlers
function onUpdateValue(value: string | number | null) {
  ctrl.value.setValue(value);
  emit('update:modelValue', value);
  emit('change', value);
}

function onFocus(event: Event) {
  ctrl.value.focus();
  emit('focus', event);
}

function onBlur(event: Event) {
  ctrl.value.blur();
  emit('blur', event);
}

function onClear(value: string | number | null) {
  ctrl.value.clear();
  emit('clear', value);
  emit('update:modelValue', null);
  emit('change', null);
}

function onKeydown(event: KeyboardEvent) {
  emit('keydown', event);
}

function onKeyup(event: KeyboardEvent) {
  emit('keyup', event);
}

function onInput(value: string | number | null) {
  emit('input', value);
}

// Sincroniza props com controller quando não usar controller injetado
function syncPropsToController() {
  if (props.ctrl) return; // Não sincroniza se usar controller injetado

  const config: InputConfig = {};
  if (props.modelValue !== undefined) config.value = props.modelValue;
  if (props.label !== undefined) config.label = props.label;
  if (props.placeholder !== undefined) config.placeholder = props.placeholder;
  if (props.type !== undefined) config.type = props.type;
  if (props.required !== undefined) config.required = props.required;
  if (props.disabled !== undefined) config.disabled = props.disabled;
  if (props.readonly !== undefined) config.readonly = props.readonly;
  if (props.maxlength !== undefined) config.maxlength = props.maxlength;
  if (props.minlength !== undefined) config.minlength = props.minlength;
  if (props.min !== undefined) config.min = props.min;
  if (props.max !== undefined) config.max = props.max;
  if (props.step !== undefined) config.step = props.step;
  if (props.pattern !== undefined) config.pattern = props.pattern;
  if (props.autocomplete !== undefined) config.autocomplete = props.autocomplete;
  if (props.autofocus !== undefined) config.autofocus = props.autofocus;
  if (props.error !== undefined) config.error = props.error;
  if (props.errorMessage !== undefined) config.errorMessage = props.errorMessage;
  if (props.hint !== undefined) config.hint = props.hint;
  if (props.prefix !== undefined) config.prefix = props.prefix;
  if (props.suffix !== undefined) config.suffix = props.suffix;
  if (props.clearable !== undefined) config.clearable = props.clearable;
  if (props.outlined !== undefined) config.outlined = props.outlined;
  if (props.filled !== undefined) config.filled = props.filled;
  if (props.dense !== undefined) config.dense = props.dense;
  if (props.square !== undefined) config.square = props.square;
  if (props.rounded !== undefined) config.rounded = props.rounded;
  if (props.borderless !== undefined) config.borderless = props.borderless;
  if (props.standout !== undefined) config.standout = props.standout;
  if (props.hideBottomSpace !== undefined) config.hideBottomSpace = props.hideBottomSpace;
  if (props.stackLabel !== undefined) config.stackLabel = props.stackLabel;
  if (props.floatLabel !== undefined) config.floatLabel = props.floatLabel;
  if (props.clearIcon !== undefined) config.clearIcon = props.clearIcon;
  if (props.loading !== undefined) config.loading = props.loading;
  if (props.debounce !== undefined) config.debounce = props.debounce;
  if (props.throttle !== undefined) config.throttle = props.throttle;
  if (props.mask !== undefined) config.mask = props.mask;
  if (props.fillMask !== undefined) config.fillMask = props.fillMask;
  if (props.reverseFillMask !== undefined) config.reverseFillMask = props.reverseFillMask;
  if (props.unmaskedValue !== undefined) config.unmaskedValue = props.unmaskedValue;

  ctrl.value.mount(config);
}

// Expõe o controller para componentes pais
defineExpose({ ctrl: ctrl.value });

onMounted(() => {
  syncPropsToController();
});
</script>

<style lang="scss" scoped>
.base-input {
  &--error {
    // Estilos para estado de erro
  }

  &--loading {
    // Estilos para estado de carregamento
  }

  &--disabled {
    // Estilos para estado desabilitado
  }

  &--readonly {
    // Estilos para estado somente leitura
  }

  &--required {
    // Estilos para campos obrigatórios
  }

  &--has-value {
    // Estilos quando o campo tem valor
  }
}
</style>
