/**
 * Tipos e definições para o sistema de layout
 */

/**
 * Valores de gap predefinidos
 */
export type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';

/**
 * Breakpoints responsivos
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Alinhamento do grid/flex
 */
export type AlignContent =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';
export type JustifyContent =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';
export type AlignItems = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type JustifyItems = 'start' | 'end' | 'center' | 'stretch';

/**
 * Props responsivas para colunas do grid
 */
export interface ResponsiveColumns {
  cols?: string;
  colsMobile?: string;
  colsTablet?: string;
  colsDesktop?: string;
  colsWide?: string;
}

/**
 * Props responsivas para gap
 */
export interface ResponsiveGap {
  gap?: GapSize;
  gapMobile?: GapSize;
  gapTablet?: GapSize;
  gapDesktop?: GapSize;
  gapWide?: GapSize;
  gapX?: GapSize;
  gapY?: GapSize;
}

/**
 * Props de posicionamento para GridItem
 */
export interface GridItemProps {
  colStart?: number;
  colEnd?: number;
  colSpan?: number;
  rowStart?: number;
  rowEnd?: number;
  rowSpan?: number;
  area?: string;
  alignSelf?: AlignItems;
  justifySelf?: JustifyItems;
}

/**
 * Props para Grid
 */
export interface GridProps extends ResponsiveColumns, ResponsiveGap {
  // Grid template
  rows?: string;
  rowsMobile?: string;
  rowsTablet?: string;
  rowsDesktop?: string;
  rowsWide?: string;

  // Grid areas
  areas?: string[];
  areasMobile?: string[];
  areasTablet?: string[];
  areasDesktop?: string[];
  areasWide?: string[];

  // Alinhamento
  alignContent?: AlignContent;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  justifyItems?: JustifyItems;

  // Dimensões
  minHeight?: string;
  maxHeight?: string;
  height?: string;

  // Utilidades
  inline?: boolean;
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  dense?: boolean;

  // Classes customizadas
  class?: string | string[] | Record<string, boolean>;
}

/**
 * Props de flex para FlexItem
 */
export interface FlexItemProps {
  flex?: number | string;
  grow?: number;
  shrink?: number;
  basis?: string;
  alignSelf?: AlignItems;
  order?: number;
}

/**
 * Mapeamento de gaps para valores CSS
 */
export const GAP_VALUES: Record<GapSize, string> = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

/**
 * Breakpoints CSS
 */
export const BREAKPOINTS: Record<Breakpoint, string> = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};

/**
 * Utilitários para geração de CSS responsivo
 */
export class LayoutUtils {
  /**
   * Gera CSS para grid-template-columns responsivo
   */
  static generateGridColumns(props: ResponsiveColumns): Record<string, string> {
    const styles: Record<string, string> = {};

    if (props.cols) {
      styles['grid-template-columns'] = props.cols;
    }

    return styles;
  }

  /**
   * Gera CSS para gap responsivo
   */
  static generateGap(props: ResponsiveGap): Record<string, string> {
    const styles: Record<string, string> = {};

    if (props.gap) {
      styles['gap'] = GAP_VALUES[props.gap];
    }

    if (props.gapX) {
      styles['column-gap'] = GAP_VALUES[props.gapX];
    }

    if (props.gapY) {
      styles['row-gap'] = GAP_VALUES[props.gapY];
    }

    return styles;
  }

  /**
   * Gera classes CSS responsivas
   */
  static generateResponsiveClasses(
    prefix: string,
    props: ResponsiveColumns | ResponsiveGap,
  ): string[] {
    const classes: string[] = [];

    Object.entries(props).forEach(([key, value]) => {
      if (value && key.startsWith(prefix)) {
        const breakpoint = key.replace(prefix, '').toLowerCase();
        if (breakpoint) {
          classes.push(`${prefix}-${breakpoint}-${value}`);
        } else {
          classes.push(`${prefix}-${value}`);
        }
      }
    });

    return classes;
  }

  /**
   * Converte valor de gap para CSS
   */
  static getGapValue(gap: GapSize): string {
    return GAP_VALUES[gap];
  }

  /**
   * Gera media query para breakpoint
   */
  static getMediaQuery(breakpoint: Breakpoint): string {
    return `@media (min-width: ${BREAKPOINTS[breakpoint]})`;
  }
}
