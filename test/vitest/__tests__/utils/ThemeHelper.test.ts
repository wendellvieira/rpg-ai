import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { ThemeHelper } from '../../../../src/utils/ThemeHelper';

describe('ThemeHelper', () => {
  beforeEach(() => {
    // Limpar variáveis CSS antes de cada teste
    document.documentElement.style.cssText = '';
  });

  afterEach(() => {
    // Limpar após cada teste
    document.documentElement.style.cssText = '';
  });

  describe('hexToRgb', () => {
    it('should convert valid hex colors to RGB', () => {
      expect(ThemeHelper.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(ThemeHelper.hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(ThemeHelper.hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(ThemeHelper.hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(ThemeHelper.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should return null for invalid hex colors', () => {
      expect(ThemeHelper.hexToRgb('invalid')).toBeNull();
      expect(ThemeHelper.hexToRgb('#gg0000')).toBeNull();
      expect(ThemeHelper.hexToRgb('')).toBeNull();
      expect(ThemeHelper.hexToRgb('#12345')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB values to hex', () => {
      expect(ThemeHelper.rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(ThemeHelper.rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(ThemeHelper.rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(ThemeHelper.rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(ThemeHelper.rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should handle edge cases', () => {
      expect(ThemeHelper.rgbToHex(128, 128, 128)).toBe('#808080');
      expect(ThemeHelper.rgbToHex(15, 15, 15)).toBe('#0f0f0f');
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratios', () => {
      // Branco vs Preto = máximo contraste
      expect(ThemeHelper.getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);

      // Mesma cor = sem contraste
      expect(ThemeHelper.getContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 1);
      expect(ThemeHelper.getContrastRatio('#000000', '#000000')).toBeCloseTo(1, 1);

      // Cores intermediárias
      expect(ThemeHelper.getContrastRatio('#ff0000', '#ffffff')).toBeGreaterThan(3);
    });

    it('should handle invalid colors correctly', () => {
      // Quando ambas cores são inválidas, o resultado é 1
      expect(ThemeHelper.getContrastRatio('invalid', 'invalid')).toBe(1);

      // Quando uma cor é inválida e outra válida, o resultado é calculado
      const ratio1 = ThemeHelper.getContrastRatio('invalid', '#ffffff');
      const ratio2 = ThemeHelper.getContrastRatio('#ffffff', 'invalid');
      expect(ratio1).toBeGreaterThan(1);
      expect(ratio2).toBeGreaterThan(1);
    });
  });

  describe('meetsAccessibilityStandards', () => {
    it('should detect accessible combinations', () => {
      expect(ThemeHelper.meetsAccessibilityStandards('#ffffff', '#000000')).toBe(true);
      expect(ThemeHelper.meetsAccessibilityStandards('#000000', '#ffffff')).toBe(true);
    });

    it('should detect non-accessible combinations', () => {
      expect(ThemeHelper.meetsAccessibilityStandards('#ffffff', '#ffffff')).toBe(false);
      expect(ThemeHelper.meetsAccessibilityStandards('#000000', '#000000')).toBe(false);
      expect(ThemeHelper.meetsAccessibilityStandards('#cccccc', '#dddddd')).toBe(false);
    });

    it('should handle AAA level correctly', () => {
      expect(ThemeHelper.meetsAccessibilityStandards('#ffffff', '#000000', 'AAA')).toBe(true);
      expect(ThemeHelper.meetsAccessibilityStandards('#cccccc', '#444444', 'AAA')).toBe(false);
    });
  });

  describe('generateColorPalette', () => {
    it('should generate a valid color palette', () => {
      const palette = ThemeHelper.generateColorPalette('#3498db');

      expect(palette).toHaveProperty('50');
      expect(palette).toHaveProperty('100');
      expect(palette).toHaveProperty('500');
      expect(palette).toHaveProperty('900');

      // Verificar se todas as cores são válidas
      Object.values(palette).forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should handle base color as 500 shade', () => {
      const baseColor = '#3498db';
      const palette = ThemeHelper.generateColorPalette(baseColor);
      expect(palette[500]).toBe(baseColor);
    });
  });

  describe('darken and lighten', () => {
    it('should darken colors correctly', () => {
      const darkened = ThemeHelper.darken('#ffffff', 50);
      expect(darkened).not.toBe('#ffffff');
      expect(darkened).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should lighten colors correctly', () => {
      const lightened = ThemeHelper.lighten('#000000', 50);
      expect(lightened).not.toBe('#000000');
      expect(lightened).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should handle invalid colors', () => {
      expect(ThemeHelper.darken('invalid', 50)).toBe('invalid');
      expect(ThemeHelper.lighten('invalid', 50)).toBe('invalid');
    });
  });

  describe('isLightColor', () => {
    it('should detect light colors', () => {
      expect(ThemeHelper.isLightColor('#ffffff')).toBe(true);
      expect(ThemeHelper.isLightColor('#f0f0f0')).toBe(true);
    });

    it('should detect dark colors', () => {
      expect(ThemeHelper.isLightColor('#000000')).toBe(false);
      expect(ThemeHelper.isLightColor('#333333')).toBe(false);
    });

    it('should handle invalid colors', () => {
      expect(ThemeHelper.isLightColor('invalid')).toBe(true);
    });
  });

  describe('getContrastColor', () => {
    it('should return black for light backgrounds', () => {
      expect(ThemeHelper.getContrastColor('#ffffff')).toBe('#000000');
      expect(ThemeHelper.getContrastColor('#f0f0f0')).toBe('#000000');
    });

    it('should return white for dark backgrounds', () => {
      expect(ThemeHelper.getContrastColor('#000000')).toBe('#ffffff');
      expect(ThemeHelper.getContrastColor('#333333')).toBe('#ffffff');
    });
  });

  describe('setCSSVariable', () => {
    it('should set CSS custom properties', () => {
      ThemeHelper.setCSSVariable('--test-color', '#ff0000');

      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--test-color')
        .trim();

      expect(value).toBe('#ff0000');
    });

    it('should handle element scope', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      ThemeHelper.setCSSVariable('--test-color', '#00ff00', testElement);

      const value = getComputedStyle(testElement).getPropertyValue('--test-color').trim();

      expect(value).toBe('#00ff00');

      document.body.removeChild(testElement);
    });
  });

  describe('getCSSVariable', () => {
    it('should get CSS custom properties', () => {
      ThemeHelper.setCSSVariable('--test-get', '#0000ff');

      const value = ThemeHelper.getCSSVariable('--test-get');
      expect(value).toBe('#0000ff');
    });

    it('should return empty string for non-existent variables', () => {
      const value = ThemeHelper.getCSSVariable('--non-existent');
      expect(value).toBe('');
    });
  });

  describe('addAlpha', () => {
    it('should add alpha channel to colors', () => {
      expect(ThemeHelper.addAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(ThemeHelper.addAlpha('#00ff00', 0.8)).toBe('rgba(0, 255, 0, 0.8)');
    });

    it('should handle invalid colors', () => {
      expect(ThemeHelper.addAlpha('invalid', 0.5)).toBe('invalid');
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate CSS variables from color object', () => {
      const colors = {
        primary: '#3498db',
        secondary: '#2ecc71',
      };

      const variables = ThemeHelper.generateCSSVariables(colors);

      expect(variables).toHaveProperty('--color-primary', '#3498db');
      expect(variables).toHaveProperty('--color-secondary', '#2ecc71');
    });

    it('should handle nested color palettes', () => {
      const colors = {
        primary: {
          500: '#3498db',
          600: '#2980b9',
        },
      };

      const variables = ThemeHelper.generateCSSVariables(colors);

      expect(variables).toHaveProperty('--color-primary-500', '#3498db');
      expect(variables).toHaveProperty('--color-primary-600', '#2980b9');
    });
  });
});
