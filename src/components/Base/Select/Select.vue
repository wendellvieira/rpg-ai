<template>
  <q-select
    v-model="ctrl.value"
    :options="ctrl.optionsToShow"
    :label="ctrl.label"
    :placeholder="ctrl.placeholder"
    :multiple="ctrl.multiple"
    :disable="ctrl.disabled"
    :readonly="ctrl.readonly"
    :required="ctrl.required"
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
    :loading="ctrl.loading"
    :error="ctrl.error"
    :error-message="ctrl.errorMessage"
    :hint="ctrl.hint"
    :prefix="ctrl.prefix"
    :suffix="ctrl.suffix"
    :option-value="ctrl.optionValue"
    :option-label="ctrl.optionLabel"
    :option-disable="ctrl.optionDisable"
    :emit-value="ctrl.emitValue"
    :map-options="ctrl.mapOptions"
    :use-input="ctrl.useInput"
    :use-chips="ctrl.useChips"
    :fill-input="ctrl.fillInput"
    :hide-selected="ctrl.hideSelected"
    :hide-dropdown-icon="ctrl.hideDropdownIcon"
    :dropdown-icon="ctrl.dropdownIcon"
    :max-values="ctrl.maxValues"
    :display-value="ctrl.displayValue"
    :display-value-html="ctrl.displayValueHtml"
    :tabindex="ctrl.tabindex"
    :autocomplete="ctrl.autocomplete"
    :input-debounce="ctrl.inputDebounce"
    :transition-show="ctrl.transitionShow"
    :transition-hide="ctrl.transitionHide"
    :popup-content-class="ctrl.popupContentClass"
    :popup-content-style="ctrl.popupContentStyle"
    :virtual-scroll-slice-size="ctrl.virtualScrollSliceSize"
    :virtual-scroll-slice-ratio="ctrl.virtualScrollSliceRatio"
    :virtual-scroll-item-size="ctrl.virtualScrollItemSize"
    :behavior="ctrl.behavior"
    @update:model-value="onUpdateValue"
    @filter="onFilter"
    @focus="onFocus"
    @blur="onBlur"
    @clear="onClear"
    @add="onAdd"
    @remove="onRemove"
    @new-value="onNewValue"
    @keydown="onKeydown"
    @keyup="onKeyup"
    class="base-select"
    :class="selectClasses"
  >
    <!-- Slot para opções customizadas -->
    <template v-if="$slots.option" #option="scope">
      <slot name="option" v-bind="scope" />
    </template>

    <!-- Slot para item selecionado -->
    <template v-if="$slots['selected-item']" #selected-item="scope">
      <slot name="selected-item" v-bind="scope" />
    </template>

    <!-- Slot para valor selecionado -->
    <template v-if="$slots.selected" #selected>
      <slot name="selected" />
    </template>

    <!-- Slots removidos que não existem no QSelect -->
    <!-- placeholder slot não existe no QSelect -->

    <!-- Slot para conteúdo customizado no topo -->
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <!-- Slot para conteúdo customizado no final -->
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>

    <!-- Slot para conteúdo antes do select -->
    <template v-if="$slots.before" #before>
      <slot name="before" />
    </template>

    <!-- Slot para conteúdo após o select -->
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

    <!-- Slot para conteúdo sem opções -->
    <template v-if="$slots['no-option']" #no-option="scope">
      <slot name="no-option" v-bind="scope" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Select_Ctrl } from './Select_Ctrl';
import type { SelectConfig, SelectOption } from './Select_Data';

interface Props {
  ctrl?: Select_Ctrl;
  config?: SelectConfig;
  modelValue?: unknown;
  options?: SelectOption[];
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
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
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  optionValue?: string;
  optionLabel?: string;
  optionDisable?: string;
  emitValue?: boolean;
  mapOptions?: boolean;
  useInput?: boolean;
  useChips?: boolean;
  fillInput?: boolean;
  hideSelected?: boolean;
  hideDropdownIcon?: boolean;
  dropdownIcon?: string;
  maxValues?: number;
  displayValue?: string;
  displayValueHtml?: boolean;
  tabindex?: number;
  autocomplete?: string;
  inputDebounce?: string | number;
  transitionShow?: string;
  transitionHide?: string;
  popupContentClass?: string;
  popupContentStyle?: string | object;
  virtualScrollSliceSize?: number;
  virtualScrollSliceRatio?: number;
  virtualScrollItemSize?: number;
  behavior?: 'default' | 'menu' | 'dialog';
  class?: string | string[] | Record<string, boolean>;
}

interface Emits {
  (e: 'update:modelValue', value: unknown): void;
  (e: 'filter', inputValue: string, update: (fn: () => void) => void, abort: () => void): void;
  (e: 'focus', event: Event): void;
  (e: 'blur', event: Event): void;
  (e: 'clear', value: unknown): void;
  (e: 'add', details: { index: number; value: unknown }): void;
  (e: 'remove', details: { index: number; value: unknown }): void;
  (
    e: 'new-value',
    inputValue: string,
    done: (item?: unknown, mode?: 'add' | 'add-unique' | 'toggle') => void,
  ): void;
  (e: 'keydown', event: KeyboardEvent): void;
  (e: 'keyup', event: KeyboardEvent): void;
  (e: 'change', value: unknown): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  required: false,
  disabled: false,
  readonly: false,
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
  loading: false,
  error: false,
  optionValue: 'value',
  optionLabel: 'label',
  optionDisable: 'disable',
  emitValue: true,
  mapOptions: true,
  useInput: false,
  useChips: false,
  fillInput: false,
  hideSelected: false,
  hideDropdownIcon: false,
  dropdownIcon: 'arrow_drop_down',
  displayValueHtml: false,
  transitionShow: 'fade',
  transitionHide: 'fade',
  behavior: 'default',
});

const emit = defineEmits<Emits>();

// Controller interno ou injetado
const internalCtrl = ref<Select_Ctrl | null>(null);
const ctrl = computed(() => {
  if (props.ctrl) return props.ctrl;
  if (!internalCtrl.value) {
    internalCtrl.value = Select_Ctrl.create(props.config || {});
  }
  return internalCtrl.value;
});

// Classes CSS dinâmicas
const selectClasses = computed(() => {
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
  if (ctrl.value.error) classes['base-select--error'] = true;
  if (ctrl.value.loading) classes['base-select--loading'] = true;
  if (ctrl.value.disabled) classes['base-select--disabled'] = true;
  if (ctrl.value.readonly) classes['base-select--readonly'] = true;
  if (ctrl.value.required) classes['base-select--required'] = true;
  if (ctrl.value.hasValue) classes['base-select--has-value'] = true;
  if (ctrl.value.multiple) classes['base-select--multiple'] = true;
  if (ctrl.value.useInput) classes['base-select--searchable'] = true;

  return classes;
});

// Event handlers
function onUpdateValue(value: unknown) {
  ctrl.value.setValue(value);
  emit('update:modelValue', value);
  emit('change', value);
}

function onFilter(inputValue: string, update: (fn: () => void) => void, abort: () => void) {
  ctrl.value.filter(inputValue);
  update(() => {
    // As opções filtradas já foram atualizadas no controller
  });
  emit('filter', inputValue, update, abort);
}

function onFocus(event: Event) {
  emit('focus', event);
}

function onBlur(event: Event) {
  ctrl.value.validate();
  emit('blur', event);
}

function onClear(value: unknown) {
  ctrl.value.clear();
  emit('clear', value);
  emit('update:modelValue', ctrl.value.multiple ? [] : null);
  emit('change', ctrl.value.multiple ? [] : null);
}

function onAdd(details: { index: number; value: unknown }) {
  emit('add', details);
}

function onRemove(details: { index: number; value: unknown }) {
  emit('remove', details);
}

function onNewValue(
  inputValue: string,
  done: (item?: unknown, mode?: 'add' | 'add-unique' | 'toggle') => void,
) {
  emit('new-value', inputValue, done);
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

  const config: SelectConfig = {};
  if (props.modelValue !== undefined) config.value = props.modelValue;
  if (props.options !== undefined) config.options = props.options;
  if (props.label !== undefined) config.label = props.label;
  if (props.placeholder !== undefined) config.placeholder = props.placeholder;
  if (props.multiple !== undefined) config.multiple = props.multiple;
  if (props.required !== undefined) config.required = props.required;
  if (props.disabled !== undefined) config.disabled = props.disabled;
  if (props.readonly !== undefined) config.readonly = props.readonly;
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
  if (props.loading !== undefined) config.loading = props.loading;
  if (props.error !== undefined) config.error = props.error;
  if (props.errorMessage !== undefined) config.errorMessage = props.errorMessage;
  if (props.hint !== undefined) config.hint = props.hint;
  if (props.prefix !== undefined) config.prefix = props.prefix;
  if (props.suffix !== undefined) config.suffix = props.suffix;
  if (props.optionValue !== undefined) config.optionValue = props.optionValue;
  if (props.optionLabel !== undefined) config.optionLabel = props.optionLabel;
  if (props.optionDisable !== undefined) config.optionDisable = props.optionDisable;
  if (props.emitValue !== undefined) config.emitValue = props.emitValue;
  if (props.mapOptions !== undefined) config.mapOptions = props.mapOptions;
  if (props.useInput !== undefined) config.useInput = props.useInput;
  if (props.useChips !== undefined) config.useChips = props.useChips;
  if (props.fillInput !== undefined) config.fillInput = props.fillInput;
  if (props.hideSelected !== undefined) config.hideSelected = props.hideSelected;
  if (props.hideDropdownIcon !== undefined) config.hideDropdownIcon = props.hideDropdownIcon;
  if (props.dropdownIcon !== undefined) config.dropdownIcon = props.dropdownIcon;
  if (props.maxValues !== undefined) config.maxValues = props.maxValues;
  if (props.displayValue !== undefined) config.displayValue = props.displayValue;
  if (props.displayValueHtml !== undefined) config.displayValueHtml = props.displayValueHtml;
  if (props.tabindex !== undefined) config.tabindex = props.tabindex;
  if (props.autocomplete !== undefined) config.autocomplete = props.autocomplete;
  if (props.inputDebounce !== undefined) config.inputDebounce = props.inputDebounce;
  if (props.transitionShow !== undefined) config.transitionShow = props.transitionShow;
  if (props.transitionHide !== undefined) config.transitionHide = props.transitionHide;
  if (props.popupContentClass !== undefined) config.popupContentClass = props.popupContentClass;
  if (props.popupContentStyle !== undefined) config.popupContentStyle = props.popupContentStyle;
  if (props.virtualScrollSliceSize !== undefined)
    config.virtualScrollSliceSize = props.virtualScrollSliceSize;
  if (props.virtualScrollSliceRatio !== undefined)
    config.virtualScrollSliceRatio = props.virtualScrollSliceRatio;
  if (props.virtualScrollItemSize !== undefined)
    config.virtualScrollItemSize = props.virtualScrollItemSize;
  if (props.behavior !== undefined) config.behavior = props.behavior;

  ctrl.value.mount(config);
}

// Expõe o controller para componentes pais
defineExpose({ ctrl: ctrl.value });

onMounted(() => {
  syncPropsToController();
});
</script>

<style lang="scss" scoped>
.base-select {
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

  &--multiple {
    // Estilos para select múltiplo
  }

  &--searchable {
    // Estilos para select com busca
  }
}
</style>
