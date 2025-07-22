/**
 * 🎨 Theme Helper - Utilitários para gerenciamento de temas
 *
 * Helper estático com funções puras para manipulação de temas,
 * cores e CSS. Substituí o ThemeService por uma abordagem mais funcional.
 */

export class ThemeHelper {
  /**
   * Detecta se o sistema prefere modo escuro
   */
  static getSystemPrefersDark(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Converte uma cor hexadecimal para RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && result[1] && result[2] && result[3]
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Converte RGB para hexadecimal
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')}`;
  }

  /**
   * Converte uma cor para formato RGBA com alpha
   */
  static addAlpha(color: string, alpha: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  /**
   * Escurece uma cor em uma porcentagem específica
   */
  static darken(color: string, percentage: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const factor = 1 - percentage / 100;
    return this.rgbToHex(
      Math.round(rgb.r * factor),
      Math.round(rgb.g * factor),
      Math.round(rgb.b * factor),
    );
  }

  /**
   * Clareia uma cor em uma porcentagem específica
   */
  static lighten(color: string, percentage: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const factor = percentage / 100;
    return this.rgbToHex(
      Math.round(rgb.r + (255 - rgb.r) * factor),
      Math.round(rgb.g + (255 - rgb.g) * factor),
      Math.round(rgb.b + (255 - rgb.b) * factor),
    );
  }

  /**
   * Gera uma paleta de cores baseada em uma cor principal
   */
  static generateColorPalette(baseColor: string): Record<number, string> {
    const palette: Record<number, string> = {};

    // Tons mais claros (50-400)
    palette[50] = this.lighten(baseColor, 95);
    palette[100] = this.lighten(baseColor, 90);
    palette[200] = this.lighten(baseColor, 75);
    palette[300] = this.lighten(baseColor, 50);
    palette[400] = this.lighten(baseColor, 25);

    // Tom base
    palette[500] = baseColor;

    // Tons mais escuros (600-950)
    palette[600] = this.darken(baseColor, 15);
    palette[700] = this.darken(baseColor, 30);
    palette[800] = this.darken(baseColor, 45);
    palette[900] = this.darken(baseColor, 60);
    palette[950] = this.darken(baseColor, 75);

    return palette;
  }

  /**
   * Verifica se uma cor é clara ou escura
   */
  static isLightColor(color: string): boolean {
    const rgb = this.hexToRgb(color);
    if (!rgb) return true;

    // Calcula a luminância relativa
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5;
  }

  /**
   * Obtém uma cor de texto adequada (preto ou branco) para uma cor de fundo
   */
  static getContrastColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
  }

  /**
   * Aplica uma classe CSS ao body do documento
   */
  static applyBodyClass(className: string, condition: boolean): void {
    if (typeof document === 'undefined') return;

    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  /**
   * Define uma variável CSS customizada
   */
  static setCSSVariable(property: string, value: string, element?: HTMLElement): void {
    const target = element || document.documentElement;
    target.style.setProperty(property, value);
  }

  /**
   * Remove uma variável CSS customizada
   */
  static removeCSSVariable(property: string, element?: HTMLElement): void {
    const target = element || document.documentElement;
    target.style.removeProperty(property);
  }

  /**
   * Obtém o valor de uma variável CSS
   */
  static getCSSVariable(property: string, element?: HTMLElement): string {
    const target = element || document.documentElement;
    return getComputedStyle(target).getPropertyValue(property).trim();
  }

  /**
   * Gera CSS variables a partir de um objeto de cores
   */
  static generateCSSVariables(
    colors: Record<string, string | Record<number, string>>,
    prefix: string = '--color',
  ): Record<string, string> {
    const variables: Record<string, string> = {};

    Object.entries(colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'string') {
        variables[`${prefix}-${colorName}`] = colorValue;
      } else {
        // É uma paleta de cores com números
        Object.entries(colorValue).forEach(([shade, value]) => {
          variables[`${prefix}-${colorName}-${shade}`] = value;
        });
      }
    });

    return variables;
  }

  /**
   * Calcula o contraste entre duas cores
   */
  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.hexToRgb(color);
      if (!rgb) return 0;

      const colorValues = [rgb.r, rgb.g, rgb.b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      const [r = 0, g = 0, b = 0] = colorValues;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Verifica se o contraste atende aos padrões de acessibilidade
   */
  static meetsAccessibilityStandards(
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
  ): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }

  /**
   * Cria um listener para mudanças na preferência de tema do sistema
   */
  static createSystemThemeListener(callback: (isDark: boolean) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => callback(e.matches);

    mediaQuery.addEventListener('change', listener);

    // Retorna função para remover o listener
    return () => mediaQuery.removeEventListener('change', listener);
  }
}
