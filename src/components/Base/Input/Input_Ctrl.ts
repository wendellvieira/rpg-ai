import { reactive } from 'vue';
import { riid } from '../../../utils/riid';
import type { Input_Data, InputConfig } from './Input_Data';

/**
 * Controller para o componente Input
 * Gerencia estado, validação e comportamento do input
 */
export class Input_Ctrl {
  /**
   * Cria uma instância reativa do controller
   */
  static reactive() {
    return reactive(new Input_Ctrl()) as Input_Ctrl;
  }

  /**
   * Factory method para criar instância com configuração inicial
   */
  static create(config: InputConfig = {}) {
    const instance = Input_Ctrl.reactive();
    return instance.mount(config);
  }

  /**
   * Factory method para criar input vazio
   */
  static createEmpty() {
    return Input_Ctrl.reactive();
  }

  // Propriedades principais
  public id: string = riid();
  public value: string | number | null = null;
  public label?: string;
  public placeholder?: string;
  public type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' = 'text';
  public required = false;
  public disabled = false;
  public readonly = false;
  public maxlength?: number;
  public minlength?: number;
  public min?: number;
  public max?: number;
  public step?: number;
  public pattern?: string;
  public autocomplete?: string;
  public autofocus = false;

  // Estados de validação
  public error = false;
  public errorMessage?: string;
  public hint?: string;

  // Aparência
  public prefix?: string;
  public suffix?: string;
  public clearable = false;
  public outlined = true;
  public filled = false;
  public dense = false;
  public square = false;
  public rounded = false;
  public borderless = false;
  public standout = false;
  public hideBottomSpace = false;
  public stackLabel = false;
  public floatLabel = false;
  public clearIcon = 'cancel';

  // Estados especiais
  public loading = false;
  public debounce?: string | number;
  public throttle?: string | number;

  // Máscara
  public mask?: string;
  public fillMask?: boolean | string;
  public reverseFillMask = false;
  public unmaskedValue = false;

  // Dependências
  protected parent: unknown = null;

  /**
   * Inicializa o controller com configuração
   */
  mount(config: InputConfig) {
    if (config.id) this.id = config.id;
    if (config.value !== undefined) this.value = config.value;
    if (config.label) this.label = config.label;
    if (config.placeholder) this.placeholder = config.placeholder;
    if (config.type) this.type = config.type;
    if (config.required !== undefined) this.required = config.required;
    if (config.disabled !== undefined) this.disabled = config.disabled;
    if (config.readonly !== undefined) this.readonly = config.readonly;
    if (config.maxlength !== undefined) this.maxlength = config.maxlength;
    if (config.minlength !== undefined) this.minlength = config.minlength;
    if (config.min !== undefined) this.min = config.min;
    if (config.max !== undefined) this.max = config.max;
    if (config.step !== undefined) this.step = config.step;
    if (config.pattern) this.pattern = config.pattern;
    if (config.autocomplete) this.autocomplete = config.autocomplete;
    if (config.autofocus !== undefined) this.autofocus = config.autofocus;
    if (config.error !== undefined) this.error = config.error;
    if (config.errorMessage) this.errorMessage = config.errorMessage;
    if (config.hint) this.hint = config.hint;
    if (config.prefix) this.prefix = config.prefix;
    if (config.suffix) this.suffix = config.suffix;
    if (config.clearable !== undefined) this.clearable = config.clearable;
    if (config.outlined !== undefined) this.outlined = config.outlined;
    if (config.filled !== undefined) this.filled = config.filled;
    if (config.dense !== undefined) this.dense = config.dense;
    if (config.square !== undefined) this.square = config.square;
    if (config.rounded !== undefined) this.rounded = config.rounded;
    if (config.borderless !== undefined) this.borderless = config.borderless;
    if (config.standout !== undefined) this.standout = config.standout;
    if (config.hideBottomSpace !== undefined) this.hideBottomSpace = config.hideBottomSpace;
    if (config.stackLabel !== undefined) this.stackLabel = config.stackLabel;
    if (config.floatLabel !== undefined) this.floatLabel = config.floatLabel;
    if (config.clearIcon) this.clearIcon = config.clearIcon;
    if (config.loading !== undefined) this.loading = config.loading;
    if (config.debounce !== undefined) this.debounce = config.debounce;
    if (config.throttle !== undefined) this.throttle = config.throttle;
    if (config.mask) this.mask = config.mask;
    if (config.fillMask !== undefined) this.fillMask = config.fillMask;
    if (config.reverseFillMask !== undefined) this.reverseFillMask = config.reverseFillMask;
    if (config.unmaskedValue !== undefined) this.unmaskedValue = config.unmaskedValue;

    return this;
  }

  /**
   * Conecta com controller pai
   */
  connect(parent: unknown) {
    this.parent = parent;
    return this;
  }

  /**
   * Restaura estado a partir de dados persistidos
   */
  restore(data: Input_Data) {
    this.value = data.value;
    if (data.label) this.label = data.label;
    if (data.placeholder) this.placeholder = data.placeholder;
    if (data.type) this.type = data.type;
    if (data.required !== undefined) this.required = data.required;
    if (data.disabled !== undefined) this.disabled = data.disabled;
    if (data.readonly !== undefined) this.readonly = data.readonly;
    if (data.maxlength !== undefined) this.maxlength = data.maxlength;
    if (data.minlength !== undefined) this.minlength = data.minlength;
    if (data.min !== undefined) this.min = data.min;
    if (data.max !== undefined) this.max = data.max;
    if (data.step !== undefined) this.step = data.step;
    if (data.pattern) this.pattern = data.pattern;
    if (data.autocomplete) this.autocomplete = data.autocomplete;
    if (data.autofocus !== undefined) this.autofocus = data.autofocus;
    if (data.error !== undefined) this.error = data.error;
    if (data.errorMessage) this.errorMessage = data.errorMessage;
    if (data.hint) this.hint = data.hint;
    if (data.prefix) this.prefix = data.prefix;
    if (data.suffix) this.suffix = data.suffix;
    if (data.clearable !== undefined) this.clearable = data.clearable;
    if (data.outlined !== undefined) this.outlined = data.outlined;
    if (data.filled !== undefined) this.filled = data.filled;
    if (data.dense !== undefined) this.dense = data.dense;
    if (data.square !== undefined) this.square = data.square;
    if (data.rounded !== undefined) this.rounded = data.rounded;
    if (data.borderless !== undefined) this.borderless = data.borderless;
    if (data.standout !== undefined) this.standout = data.standout;
    if (data.hideBottomSpace !== undefined) this.hideBottomSpace = data.hideBottomSpace;
    if (data.stackLabel !== undefined) this.stackLabel = data.stackLabel;
    if (data.floatLabel !== undefined) this.floatLabel = data.floatLabel;
    if (data.clearIcon) this.clearIcon = data.clearIcon;
    if (data.loading !== undefined) this.loading = data.loading;
    if (data.debounce !== undefined) this.debounce = data.debounce;
    if (data.throttle !== undefined) this.throttle = data.throttle;
    if (data.mask) this.mask = data.mask;
    if (data.fillMask !== undefined) this.fillMask = data.fillMask;
    if (data.reverseFillMask !== undefined) this.reverseFillMask = data.reverseFillMask;
    if (data.unmaskedValue !== undefined) this.unmaskedValue = data.unmaskedValue;
    
    return this;
  }

  /**
   * Captura dados para persistência
   */
  takeSnapshot(): Input_Data {
    const data: Input_Data = {
      value: this.value,
    };

    if (this.label !== undefined) data.label = this.label;
    if (this.placeholder !== undefined) data.placeholder = this.placeholder;
    if (this.type !== 'text') data.type = this.type;
    if (this.required) data.required = this.required;
    if (this.disabled) data.disabled = this.disabled;
    if (this.readonly) data.readonly = this.readonly;
    if (this.maxlength !== undefined) data.maxlength = this.maxlength;
    if (this.minlength !== undefined) data.minlength = this.minlength;
    if (this.min !== undefined) data.min = this.min;
    if (this.max !== undefined) data.max = this.max;
    if (this.step !== undefined) data.step = this.step;
    if (this.pattern !== undefined) data.pattern = this.pattern;
    if (this.autocomplete !== undefined) data.autocomplete = this.autocomplete;
    if (this.autofocus) data.autofocus = this.autofocus;
    if (this.error) data.error = this.error;
    if (this.errorMessage !== undefined) data.errorMessage = this.errorMessage;
    if (this.hint !== undefined) data.hint = this.hint;
    if (this.prefix !== undefined) data.prefix = this.prefix;
    if (this.suffix !== undefined) data.suffix = this.suffix;
    if (this.clearable) data.clearable = this.clearable;
    if (!this.outlined) data.outlined = this.outlined;
    if (this.filled) data.filled = this.filled;
    if (this.dense) data.dense = this.dense;
    if (this.square) data.square = this.square;
    if (this.rounded) data.rounded = this.rounded;
    if (this.borderless) data.borderless = this.borderless;
    if (this.standout) data.standout = this.standout;
    if (this.hideBottomSpace) data.hideBottomSpace = this.hideBottomSpace;
    if (this.stackLabel) data.stackLabel = this.stackLabel;
    if (this.floatLabel) data.floatLabel = this.floatLabel;
    if (this.clearIcon !== 'cancel') data.clearIcon = this.clearIcon;
    if (this.loading) data.loading = this.loading;
    if (this.debounce !== undefined) data.debounce = this.debounce;
    if (this.throttle !== undefined) data.throttle = this.throttle;
    if (this.mask !== undefined) data.mask = this.mask;
    if (this.fillMask !== undefined) data.fillMask = this.fillMask;
    if (this.reverseFillMask) data.reverseFillMask = this.reverseFillMask;
    if (this.unmaskedValue) data.unmaskedValue = this.unmaskedValue;

    return data;
  }

  /**
   * Getters para estados derivados
   */
  get isValid() {
    return !this.error && this.validateRequired();
  }

  get isEmpty() {
    return this.value === null || this.value === undefined || this.value === '';
  }

  get hasValue() {
    return !this.isEmpty;
  }

  /**
   * Métodos de validação
   */
  validateRequired(): boolean {
    if (!this.required) return true;
    return this.hasValue;
  }

  validate(): boolean {
    this.error = false;
    this.errorMessage = '';

    // Validação de obrigatório
    if (!this.validateRequired()) {
      this.error = true;
      this.errorMessage = 'Campo obrigatório';
      return false;
    }

    // Validação de tamanho mínimo
    if (this.minlength && this.value && String(this.value).length < this.minlength) {
      this.error = true;
      this.errorMessage = `Mínimo de ${this.minlength} caracteres`;
      return false;
    }

    // Validação de tamanho máximo
    if (this.maxlength && this.value && String(this.value).length > this.maxlength) {
      this.error = true;
      this.errorMessage = `Máximo de ${this.maxlength} caracteres`;
      return false;
    }

    // Validação de valor mínimo (para números)
    if (this.type === 'number' && this.min !== undefined && this.value !== null && Number(this.value) < this.min) {
      this.error = true;
      this.errorMessage = `Valor mínimo: ${this.min}`;
      return false;
    }

    // Validação de valor máximo (para números)
    if (this.type === 'number' && this.max !== undefined && this.value !== null && Number(this.value) > this.max) {
      this.error = true;
      this.errorMessage = `Valor máximo: ${this.max}`;
      return false;
    }

    // Validação de padrão
    if (this.pattern && this.value) {
      const regex = new RegExp(this.pattern);
      if (!regex.test(String(this.value))) {
        this.error = true;
        this.errorMessage = 'Formato inválido';
        return false;
      }
    }

    // Validação de email
    if (this.type === 'email' && this.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(this.value))) {
        this.error = true;
        this.errorMessage = 'Email inválido';
        return false;
      }
    }

    return true;
  }

  /**
   * Métodos de ação
   */
  clear() {
    this.value = null;
    this.error = false;
    this.errorMessage = '';
  }

  focus() {
    // Este método será chamado pelo componente Vue
    // para focar no elemento input
  }

  blur() {
    // Este método será chamado pelo componente Vue
    // quando o input perder o foco
    this.validate();
  }

  /**
   * Métodos de configuração
   */
  setError(message: string) {
    this.error = true;
    this.errorMessage = message;
  }

  clearError() {
    this.error = false;
    this.errorMessage = '';
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  setReadonly(readonly: boolean) {
    this.readonly = readonly;
  }

  setValue(value: string | number | null) {
    this.value = value;
    this.validate();
  }
}
