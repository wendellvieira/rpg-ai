import { reactive } from 'vue';
import { riid } from '../../../utils/riid';
import type { Select_Data, SelectConfig, SelectOption } from './Select_Data';

/**
 * Controller para o componente Select
 * Gerencia estado, opções e comportamento do select
 */
export class Select_Ctrl {
  /**
   * Cria uma instância reativa do controller
   */
  static reactive() {
    return reactive(new Select_Ctrl()) as Select_Ctrl;
  }

  /**
   * Factory method para criar instância com configuração inicial
   */
  static create(config: SelectConfig = {}) {
    const instance = Select_Ctrl.reactive();
    return instance.mount(config);
  }

  /**
   * Factory method para criar select vazio
   */
  static createEmpty() {
    return Select_Ctrl.reactive();
  }

  /**
   * Factory method para criar select simples com opções
   */
  static createWithOptions(options: SelectOption[], label?: string) {
    const config: SelectConfig = { options };
    if (label) config.label = label;
    return Select_Ctrl.create(config);
  }

  /**
   * Factory method para criar select múltiplo
   */
  static createMultiple(options: SelectOption[], label?: string) {
    const config: SelectConfig = {
      options,
      multiple: true,
      value: [],
    };
    if (label) config.label = label;
    return Select_Ctrl.create(config);
  }

  /**
   * Factory method para criar select com busca
   */
  static createSearchable(options: SelectOption[], label?: string) {
    const config: SelectConfig = {
      options,
      useInput: true,
      fillInput: true,
    };
    if (label) config.label = label;
    return Select_Ctrl.create(config);
  }

  // Propriedades principais
  public id: string = riid();
  public value: unknown = null;
  public options: SelectOption[] = [];
  public label?: string;
  public placeholder?: string;
  public multiple = false;
  public required = false;
  public disabled = false;
  public readonly = false;
  public clearable = false;

  // Aparência
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

  // Estados
  public loading = false;
  public error = false;
  public errorMessage?: string;
  public hint?: string;

  // Customização
  public prefix?: string;
  public suffix?: string;
  public optionValue = 'value';
  public optionLabel = 'label';
  public optionDisable = 'disable';
  public emitValue = true;
  public mapOptions = true;

  // Funcionalidades
  public useInput = false;
  public useChips = false;
  public fillInput = false;
  public hideSelected = false;
  public hideDropdownIcon = false;
  public dropdownIcon = 'arrow_drop_down';
  public maxValues?: number;
  public displayValue?: string;
  public displayValueHtml = false;
  public tabindex?: number;
  public autocomplete?: string;
  public inputDebounce?: string | number;

  // Popup
  public transitionShow = 'fade';
  public transitionHide = 'fade';
  public popupContentClass?: string;
  public popupContentStyle?: string | object;

  // Virtual Scroll
  public virtualScrollSliceSize?: number;
  public virtualScrollSliceRatio?: number;
  public virtualScrollItemSize?: number;

  // Comportamento
  public behavior: 'default' | 'menu' | 'dialog' = 'default';

  // Filtros
  public filteredOptions: SelectOption[] = [];
  public filterValue = '';

  // Dependências
  protected parent: unknown = null;

  /**
   * Inicializa o controller com configuração
   */
  mount(config: SelectConfig) {
    if (config.id) this.id = config.id;
    if (config.value !== undefined) this.value = config.value;
    if (config.options) this.setOptions(config.options);
    if (config.label) this.label = config.label;
    if (config.placeholder) this.placeholder = config.placeholder;
    if (config.multiple !== undefined) this.multiple = config.multiple;
    if (config.required !== undefined) this.required = config.required;
    if (config.disabled !== undefined) this.disabled = config.disabled;
    if (config.readonly !== undefined) this.readonly = config.readonly;
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
    if (config.loading !== undefined) this.loading = config.loading;
    if (config.error !== undefined) this.error = config.error;
    if (config.errorMessage) this.errorMessage = config.errorMessage;
    if (config.hint) this.hint = config.hint;
    if (config.prefix) this.prefix = config.prefix;
    if (config.suffix) this.suffix = config.suffix;
    if (config.optionValue) this.optionValue = config.optionValue;
    if (config.optionLabel) this.optionLabel = config.optionLabel;
    if (config.optionDisable) this.optionDisable = config.optionDisable;
    if (config.emitValue !== undefined) this.emitValue = config.emitValue;
    if (config.mapOptions !== undefined) this.mapOptions = config.mapOptions;
    if (config.useInput !== undefined) this.useInput = config.useInput;
    if (config.useChips !== undefined) this.useChips = config.useChips;
    if (config.fillInput !== undefined) this.fillInput = config.fillInput;
    if (config.hideSelected !== undefined) this.hideSelected = config.hideSelected;
    if (config.hideDropdownIcon !== undefined) this.hideDropdownIcon = config.hideDropdownIcon;
    if (config.dropdownIcon) this.dropdownIcon = config.dropdownIcon;
    if (config.maxValues !== undefined) this.maxValues = config.maxValues;
    if (config.displayValue) this.displayValue = config.displayValue;
    if (config.displayValueHtml !== undefined) this.displayValueHtml = config.displayValueHtml;
    if (config.tabindex !== undefined) this.tabindex = config.tabindex;
    if (config.autocomplete) this.autocomplete = config.autocomplete;
    if (config.inputDebounce !== undefined) this.inputDebounce = config.inputDebounce;
    if (config.transitionShow) this.transitionShow = config.transitionShow;
    if (config.transitionHide) this.transitionHide = config.transitionHide;
    if (config.popupContentClass) this.popupContentClass = config.popupContentClass;
    if (config.popupContentStyle) this.popupContentStyle = config.popupContentStyle;
    if (config.virtualScrollSliceSize !== undefined) this.virtualScrollSliceSize = config.virtualScrollSliceSize;
    if (config.virtualScrollSliceRatio !== undefined) this.virtualScrollSliceRatio = config.virtualScrollSliceRatio;
    if (config.virtualScrollItemSize !== undefined) this.virtualScrollItemSize = config.virtualScrollItemSize;
    if (config.behavior) this.behavior = config.behavior;

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
  restore(data: Select_Data) {
    this.value = data.value;
    if (data.options) this.setOptions(data.options);
    if (data.label) this.label = data.label;
    if (data.placeholder) this.placeholder = data.placeholder;
    if (data.multiple !== undefined) this.multiple = data.multiple;
    if (data.required !== undefined) this.required = data.required;
    if (data.disabled !== undefined) this.disabled = data.disabled;
    if (data.readonly !== undefined) this.readonly = data.readonly;
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
    if (data.loading !== undefined) this.loading = data.loading;
    if (data.error !== undefined) this.error = data.error;
    if (data.errorMessage) this.errorMessage = data.errorMessage;
    if (data.hint) this.hint = data.hint;
    if (data.prefix) this.prefix = data.prefix;
    if (data.suffix) this.suffix = data.suffix;
    if (data.optionValue) this.optionValue = data.optionValue;
    if (data.optionLabel) this.optionLabel = data.optionLabel;
    if (data.optionDisable) this.optionDisable = data.optionDisable;
    if (data.emitValue !== undefined) this.emitValue = data.emitValue;
    if (data.mapOptions !== undefined) this.mapOptions = data.mapOptions;
    if (data.useInput !== undefined) this.useInput = data.useInput;
    if (data.useChips !== undefined) this.useChips = data.useChips;
    if (data.fillInput !== undefined) this.fillInput = data.fillInput;
    if (data.hideSelected !== undefined) this.hideSelected = data.hideSelected;
    if (data.hideDropdownIcon !== undefined) this.hideDropdownIcon = data.hideDropdownIcon;
    if (data.dropdownIcon) this.dropdownIcon = data.dropdownIcon;
    if (data.maxValues !== undefined) this.maxValues = data.maxValues;
    if (data.displayValue) this.displayValue = data.displayValue;
    if (data.displayValueHtml !== undefined) this.displayValueHtml = data.displayValueHtml;
    if (data.tabindex !== undefined) this.tabindex = data.tabindex;
    if (data.autocomplete) this.autocomplete = data.autocomplete;
    if (data.inputDebounce !== undefined) this.inputDebounce = data.inputDebounce;
    if (data.transitionShow) this.transitionShow = data.transitionShow;
    if (data.transitionHide) this.transitionHide = data.transitionHide;
    if (data.popupContentClass) this.popupContentClass = data.popupContentClass;
    if (data.popupContentStyle) this.popupContentStyle = data.popupContentStyle;
    if (data.virtualScrollSliceSize !== undefined) this.virtualScrollSliceSize = data.virtualScrollSliceSize;
    if (data.virtualScrollSliceRatio !== undefined) this.virtualScrollSliceRatio = data.virtualScrollSliceRatio;
    if (data.virtualScrollItemSize !== undefined) this.virtualScrollItemSize = data.virtualScrollItemSize;
    if (data.behavior) this.behavior = data.behavior;

    return this;
  }

  /**
   * Captura dados para persistência
   */
  takeSnapshot(): Select_Data {
    const data: Select_Data = {
      value: this.value,
    };

    if (this.options.length > 0) data.options = this.options;
    if (this.label !== undefined) data.label = this.label;
    if (this.placeholder !== undefined) data.placeholder = this.placeholder;
    if (this.multiple) data.multiple = this.multiple;
    if (this.required) data.required = this.required;
    if (this.disabled) data.disabled = this.disabled;
    if (this.readonly) data.readonly = this.readonly;
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
    if (this.loading) data.loading = this.loading;
    if (this.error) data.error = this.error;
    if (this.errorMessage !== undefined) data.errorMessage = this.errorMessage;
    if (this.hint !== undefined) data.hint = this.hint;
    if (this.prefix !== undefined) data.prefix = this.prefix;
    if (this.suffix !== undefined) data.suffix = this.suffix;
    if (this.optionValue !== 'value') data.optionValue = this.optionValue;
    if (this.optionLabel !== 'label') data.optionLabel = this.optionLabel;
    if (this.optionDisable !== 'disable') data.optionDisable = this.optionDisable;
    if (!this.emitValue) data.emitValue = this.emitValue;
    if (!this.mapOptions) data.mapOptions = this.mapOptions;
    if (this.useInput) data.useInput = this.useInput;
    if (this.useChips) data.useChips = this.useChips;
    if (this.fillInput) data.fillInput = this.fillInput;
    if (this.hideSelected) data.hideSelected = this.hideSelected;
    if (this.hideDropdownIcon) data.hideDropdownIcon = this.hideDropdownIcon;
    if (this.dropdownIcon !== 'arrow_drop_down') data.dropdownIcon = this.dropdownIcon;
    if (this.maxValues !== undefined) data.maxValues = this.maxValues;
    if (this.displayValue !== undefined) data.displayValue = this.displayValue;
    if (this.displayValueHtml) data.displayValueHtml = this.displayValueHtml;
    if (this.tabindex !== undefined) data.tabindex = this.tabindex;
    if (this.autocomplete !== undefined) data.autocomplete = this.autocomplete;
    if (this.inputDebounce !== undefined) data.inputDebounce = this.inputDebounce;
    if (this.transitionShow !== 'fade') data.transitionShow = this.transitionShow;
    if (this.transitionHide !== 'fade') data.transitionHide = this.transitionHide;
    if (this.popupContentClass !== undefined) data.popupContentClass = this.popupContentClass;
    if (this.popupContentStyle !== undefined) data.popupContentStyle = this.popupContentStyle;
    if (this.virtualScrollSliceSize !== undefined) data.virtualScrollSliceSize = this.virtualScrollSliceSize;
    if (this.virtualScrollSliceRatio !== undefined) data.virtualScrollSliceRatio = this.virtualScrollSliceRatio;
    if (this.virtualScrollItemSize !== undefined) data.virtualScrollItemSize = this.virtualScrollItemSize;
    if (this.behavior !== 'default') data.behavior = this.behavior;

    return data;
  }

  /**
   * Getters para estados derivados
   */
  get isValid() {
    return !this.error && this.validateRequired();
  }

  get isEmpty() {
    if (this.multiple) {
      return !Array.isArray(this.value) || this.value.length === 0;
    }
    return this.value === null || this.value === undefined || this.value === '';
  }

  get hasValue() {
    return !this.isEmpty;
  }

  get selectedOption() {
    if (this.multiple) return null;
    return this.options.find(opt => opt.value === this.value) || null;
  }

  get selectedOptions() {
    if (!this.multiple || !Array.isArray(this.value)) return [];
    const valueArray = this.value as unknown[];
    return this.options.filter(opt => valueArray.includes(opt.value));
  }

  get optionsToShow() {
    return this.filteredOptions.length > 0 ? this.filteredOptions : this.options;
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

    // Validação de valores máximos (para múltiplo)
    if (this.multiple && this.maxValues && Array.isArray(this.value) && this.value.length > this.maxValues) {
      this.error = true;
      this.errorMessage = `Máximo de ${this.maxValues} seleções`;
      return false;
    }

    return true;
  }

  /**
   * Métodos de manipulação de opções
   */
  setOptions(options: SelectOption[]) {
    this.options = [...options];
    this.filteredOptions = [];
    this.filterValue = '';
  }

  addOption(option: SelectOption) {
    this.options.push(option);
  }

  removeOption(value: unknown) {
    this.options = this.options.filter(opt => opt.value !== value);
    
    // Remove da seleção se estiver selecionado
    if (this.multiple && Array.isArray(this.value)) {
      this.value = this.value.filter(val => val !== value);
    } else if (this.value === value) {
      this.value = null;
    }
  }

  findOption(value: unknown): SelectOption | undefined {
    return this.options.find(opt => opt.value === value);
  }

  getOptionLabel(value: unknown): string {
    const option = this.findOption(value);
    return option ? option.label : String(value);
  }

  /**
   * Métodos de seleção
   */
  selectOption(value: unknown) {
    if (this.multiple) {
      if (!Array.isArray(this.value)) {
        this.value = [];
      }
      const valueArray = this.value as unknown[];
      if (!valueArray.includes(value)) {
        valueArray.push(value);
      }
    } else {
      this.value = value;
    }
    this.validate();
  }

  deselectOption(value: unknown) {
    if (this.multiple && Array.isArray(this.value)) {
      const valueArray = this.value as unknown[];
      this.value = valueArray.filter(val => val !== value);
    } else if (this.value === value) {
      this.value = null;
    }
    this.validate();
  }

  toggleOption(value: unknown) {
    if (this.multiple && Array.isArray(this.value)) {
      const valueArray = this.value as unknown[];
      if (valueArray.includes(value)) {
        this.deselectOption(value);
      } else {
        this.selectOption(value);
      }
    } else {
      this.selectOption(value);
    }
  }

  clear() {
    this.value = this.multiple ? [] : null;
    this.error = false;
    this.errorMessage = '';
  }

  /**
   * Métodos de filtro
   */
  filter(inputValue: string) {
    this.filterValue = inputValue.toLowerCase();
    
    if (!this.filterValue) {
      this.filteredOptions = [];
      return;
    }

    this.filteredOptions = this.options.filter(option =>
      option.label.toLowerCase().includes(this.filterValue) ||
      (option.description && option.description.toLowerCase().includes(this.filterValue))
    );
  }

  resetFilter() {
    this.filterValue = '';
    this.filteredOptions = [];
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

  setValue(value: unknown) {
    this.value = value;
    this.validate();
  }
}
