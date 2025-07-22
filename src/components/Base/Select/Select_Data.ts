/**
 * Interface para opções do Select
 */
export interface SelectOption {
  label: string;
  value: unknown;
  disable?: boolean;
  icon?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Interface para dados de persistência do Select
 */
export interface Select_Data {
  value: unknown;
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
}

/**
 * Configuração para criação de Select via controller
 */
export interface SelectConfig {
  id?: string;
  value?: unknown;
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
  onFilter?: (inputValue: string, update: (fn: () => void) => void) => void;
}
