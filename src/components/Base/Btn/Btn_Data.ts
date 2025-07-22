/**
 * Interface para dados de persistência do Btn
 */
export interface Btn_Data {
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
}

/**
 * Configuração para criação de Btn via controller
 */
export interface BtnConfig {
  id?: string;
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
  onClick?: () => void | Promise<void>;
}
