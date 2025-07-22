/**
 * Interface para dados de persistência do Input
 */
export interface Input_Data {
  value: string | number | null;
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
}

/**
 * Configuração para criação de Input via controller
 */
export interface InputConfig {
  id?: string;
  value?: string | number | null;
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
}
