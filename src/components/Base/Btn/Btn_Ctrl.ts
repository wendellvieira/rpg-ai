import { reactive } from 'vue';
import { riid } from '../../../utils/riid';
import type { Btn_Data, BtnConfig } from './Btn_Data';

/**
 * Controller para o componente Btn
 * Gerencia estado, interações e comportamento do botão
 */
export class Btn_Ctrl {
  /**
   * Cria uma instância reativa do controller
   */
  static reactive() {
    return reactive(new Btn_Ctrl()) as Btn_Ctrl;
  }

  /**
   * Factory method para criar instância com configuração inicial
   */
  static create(config: BtnConfig = {}) {
    const instance = Btn_Ctrl.reactive();
    return instance.mount(config);
  }

  /**
   * Factory method para criar botão vazio
   */
  static createEmpty() {
    return Btn_Ctrl.reactive();
  }

  /**
   * Factory method para criar botão primário
   */
  static createPrimary(label: string, onClick?: () => void | Promise<void>) {
    const config: BtnConfig = {
      label,
      color: 'primary',
    };
    if (onClick) config.onClick = onClick;
    return Btn_Ctrl.create(config);
  }

  /**
   * Factory method para criar botão secundário
   */
  static createSecondary(label: string, onClick?: () => void | Promise<void>) {
    const config: BtnConfig = {
      label,
      color: 'secondary',
      outline: true,
    };
    if (onClick) config.onClick = onClick;
    return Btn_Ctrl.create(config);
  }

  /**
   * Factory method para criar botão de perigo
   */
  static createDanger(label: string, onClick?: () => void | Promise<void>) {
    const config: BtnConfig = {
      label,
      color: 'negative',
    };
    if (onClick) config.onClick = onClick;
    return Btn_Ctrl.create(config);
  }

  /**
   * Factory method para criar botão com ícone
   */
  static createIcon(icon: string, onClick?: () => void | Promise<void>) {
    const config: BtnConfig = {
      icon,
      flat: true,
      round: true,
    };
    if (onClick) config.onClick = onClick;
    return Btn_Ctrl.create(config);
  }

  /**
   * Factory method para criar FAB (Floating Action Button)
   */
  static createFab(icon: string, onClick?: () => void | Promise<void>) {
    const config: BtnConfig = {
      icon,
      fab: true,
      color: 'primary',
    };
    if (onClick) config.onClick = onClick;
    return Btn_Ctrl.create(config);
  }

  // Propriedades principais
  public id: string = riid();
  public label?: string;
  public icon?: string;
  public iconRight?: string;
  public loading = false;
  public disabled = false;
  public type: 'button' | 'submit' | 'reset' = 'button';

  // Aparência
  public color?: string;
  public textColor?: string;
  public size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  public outline = false;
  public flat = false;
  public unelevated = false;
  public rounded = false;
  public push = false;
  public glossy = false;
  public fab = false;
  public fabMini = false;
  public padding?: string;
  public dense = false;
  public ripple = true;
  public round = false;
  public square = false;
  public stretch = false;
  public stack = false;
  public align: 'left' | 'right' | 'center' | 'around' | 'between' | 'evenly' = 'center';
  public noCaps = false;
  public noWrap = false;

  // Estados especiais
  public percentage?: number;
  public darkPercentage?: number;
  public tabindex?: number;

  // Navegação
  public href?: string;
  public target?: string;
  public to?: string | object;
  public replace = false;
  public exact = false;
  public exactActiveClass?: string;
  public activeClass?: string;

  // Ações
  public onClick?: () => void | Promise<void>;

  // Dependências
  protected parent: unknown = null;

  /**
   * Inicializa o controller com configuração
   */
  mount(config: BtnConfig) {
    if (config.id) this.id = config.id;
    if (config.label !== undefined) this.label = config.label;
    if (config.icon !== undefined) this.icon = config.icon;
    if (config.iconRight !== undefined) this.iconRight = config.iconRight;
    if (config.loading !== undefined) this.loading = config.loading;
    if (config.disabled !== undefined) this.disabled = config.disabled;
    if (config.type !== undefined) this.type = config.type;
    if (config.color !== undefined) this.color = config.color;
    if (config.textColor !== undefined) this.textColor = config.textColor;
    if (config.size !== undefined) this.size = config.size;
    if (config.outline !== undefined) this.outline = config.outline;
    if (config.flat !== undefined) this.flat = config.flat;
    if (config.unelevated !== undefined) this.unelevated = config.unelevated;
    if (config.rounded !== undefined) this.rounded = config.rounded;
    if (config.push !== undefined) this.push = config.push;
    if (config.glossy !== undefined) this.glossy = config.glossy;
    if (config.fab !== undefined) this.fab = config.fab;
    if (config.fabMini !== undefined) this.fabMini = config.fabMini;
    if (config.padding !== undefined) this.padding = config.padding;
    if (config.dense !== undefined) this.dense = config.dense;
    if (config.ripple !== undefined) this.ripple = config.ripple;
    if (config.round !== undefined) this.round = config.round;
    if (config.square !== undefined) this.square = config.square;
    if (config.stretch !== undefined) this.stretch = config.stretch;
    if (config.stack !== undefined) this.stack = config.stack;
    if (config.align !== undefined) this.align = config.align;
    if (config.noCaps !== undefined) this.noCaps = config.noCaps;
    if (config.noWrap !== undefined) this.noWrap = config.noWrap;
    if (config.percentage !== undefined) this.percentage = config.percentage;
    if (config.darkPercentage !== undefined) this.darkPercentage = config.darkPercentage;
    if (config.tabindex !== undefined) this.tabindex = config.tabindex;
    if (config.href !== undefined) this.href = config.href;
    if (config.target !== undefined) this.target = config.target;
    if (config.to !== undefined) this.to = config.to;
    if (config.replace !== undefined) this.replace = config.replace;
    if (config.exact !== undefined) this.exact = config.exact;
    if (config.exactActiveClass !== undefined) this.exactActiveClass = config.exactActiveClass;
    if (config.activeClass !== undefined) this.activeClass = config.activeClass;
    if (config.onClick !== undefined) this.onClick = config.onClick;

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
  restore(data: Btn_Data) {
    if (data.label !== undefined) this.label = data.label;
    if (data.icon !== undefined) this.icon = data.icon;
    if (data.iconRight !== undefined) this.iconRight = data.iconRight;
    if (data.loading !== undefined) this.loading = data.loading;
    if (data.disabled !== undefined) this.disabled = data.disabled;
    if (data.type !== undefined) this.type = data.type;
    if (data.color !== undefined) this.color = data.color;
    if (data.textColor !== undefined) this.textColor = data.textColor;
    if (data.size !== undefined) this.size = data.size;
    if (data.outline !== undefined) this.outline = data.outline;
    if (data.flat !== undefined) this.flat = data.flat;
    if (data.unelevated !== undefined) this.unelevated = data.unelevated;
    if (data.rounded !== undefined) this.rounded = data.rounded;
    if (data.push !== undefined) this.push = data.push;
    if (data.glossy !== undefined) this.glossy = data.glossy;
    if (data.fab !== undefined) this.fab = data.fab;
    if (data.fabMini !== undefined) this.fabMini = data.fabMini;
    if (data.padding !== undefined) this.padding = data.padding;
    if (data.dense !== undefined) this.dense = data.dense;
    if (data.ripple !== undefined) this.ripple = data.ripple;
    if (data.round !== undefined) this.round = data.round;
    if (data.square !== undefined) this.square = data.square;
    if (data.stretch !== undefined) this.stretch = data.stretch;
    if (data.stack !== undefined) this.stack = data.stack;
    if (data.align !== undefined) this.align = data.align;
    if (data.noCaps !== undefined) this.noCaps = data.noCaps;
    if (data.noWrap !== undefined) this.noWrap = data.noWrap;
    if (data.percentage !== undefined) this.percentage = data.percentage;
    if (data.darkPercentage !== undefined) this.darkPercentage = data.darkPercentage;
    if (data.tabindex !== undefined) this.tabindex = data.tabindex;
    if (data.href !== undefined) this.href = data.href;
    if (data.target !== undefined) this.target = data.target;
    if (data.to !== undefined) this.to = data.to;
    if (data.replace !== undefined) this.replace = data.replace;
    if (data.exact !== undefined) this.exact = data.exact;
    if (data.exactActiveClass !== undefined) this.exactActiveClass = data.exactActiveClass;
    if (data.activeClass !== undefined) this.activeClass = data.activeClass;

    return this;
  }

  /**
   * Captura dados para persistência
   */
  takeSnapshot(): Btn_Data {
    const data: Btn_Data = {};

    if (this.label !== undefined) data.label = this.label;
    if (this.icon !== undefined) data.icon = this.icon;
    if (this.iconRight !== undefined) data.iconRight = this.iconRight;
    if (this.loading) data.loading = this.loading;
    if (this.disabled) data.disabled = this.disabled;
    if (this.type !== 'button') data.type = this.type;
    if (this.color !== undefined) data.color = this.color;
    if (this.textColor !== undefined) data.textColor = this.textColor;
    if (this.size !== 'md') data.size = this.size;
    if (this.outline) data.outline = this.outline;
    if (this.flat) data.flat = this.flat;
    if (this.unelevated) data.unelevated = this.unelevated;
    if (this.rounded) data.rounded = this.rounded;
    if (this.push) data.push = this.push;
    if (this.glossy) data.glossy = this.glossy;
    if (this.fab) data.fab = this.fab;
    if (this.fabMini) data.fabMini = this.fabMini;
    if (this.padding !== undefined) data.padding = this.padding;
    if (this.dense) data.dense = this.dense;
    if (!this.ripple) data.ripple = this.ripple;
    if (this.round) data.round = this.round;
    if (this.square) data.square = this.square;
    if (this.stretch) data.stretch = this.stretch;
    if (this.stack) data.stack = this.stack;
    if (this.align !== 'center') data.align = this.align;
    if (this.noCaps) data.noCaps = this.noCaps;
    if (this.noWrap) data.noWrap = this.noWrap;
    if (this.percentage !== undefined) data.percentage = this.percentage;
    if (this.darkPercentage !== undefined) data.darkPercentage = this.darkPercentage;
    if (this.tabindex !== undefined) data.tabindex = this.tabindex;
    if (this.href !== undefined) data.href = this.href;
    if (this.target !== undefined) data.target = this.target;
    if (this.to !== undefined) data.to = this.to;
    if (this.replace) data.replace = this.replace;
    if (this.exact) data.exact = this.exact;
    if (this.exactActiveClass !== undefined) data.exactActiveClass = this.exactActiveClass;
    if (this.activeClass !== undefined) data.activeClass = this.activeClass;

    return data;
  }

  /**
   * Getters para estados derivados
   */
  get isClickable() {
    return !this.disabled && !this.loading;
  }

  get isIconOnly() {
    return (this.icon || this.iconRight) && !this.label;
  }

  get hasLabel() {
    return !!this.label;
  }

  get hasIcon() {
    return !!(this.icon || this.iconRight);
  }

  get isNavigation() {
    return !!(this.href || this.to);
  }

  /**
   * Métodos de ação
   */
  async click() {
    if (!this.isClickable) return;

    try {
      this.loading = true;
      
      if (this.onClick) {
        await this.onClick();
      }
    } catch (error) {
      console.error('Erro ao executar ação do botão:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Métodos de configuração
   */
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  setLabel(label: string) {
    this.label = label;
  }

  setIcon(icon: string) {
    this.icon = icon;
  }

  setColor(color: string) {
    this.color = color;
  }

  setOnClick(onClick: () => void | Promise<void>) {
    this.onClick = onClick;
  }

  /**
   * Métodos de estilo
   */
  makePrimary() {
    this.color = 'primary';
    this.outline = false;
    this.flat = false;
    return this;
  }

  makeSecondary() {
    this.color = 'secondary';
    this.outline = true;
    this.flat = false;
    return this;
  }

  makeDanger() {
    this.color = 'negative';
    this.outline = false;
    this.flat = false;
    return this;
  }

  makeFlat() {
    this.flat = true;
    this.outline = false;
    return this;
  }

  makeOutline() {
    this.outline = true;
    this.flat = false;
    return this;
  }

  makeRounded() {
    this.rounded = true;
    this.square = false;
    return this;
  }

  makeSquare() {
    this.square = true;
    this.rounded = false;
    return this;
  }

  makeSmall() {
    this.size = 'sm';
    return this;
  }

  makeLarge() {
    this.size = 'lg';
    return this;
  }

  makeIcon() {
    this.flat = true;
    this.round = true;
    return this;
  }

  makeFab() {
    this.fab = true;
    this.round = true;
    return this;
  }
}
