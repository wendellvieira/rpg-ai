/**
 * Utilitários para responsividade e acessibilidade
 */

import { useQuasar } from 'quasar';

/**
 * Hook para detectar tipo de dispositivo
 */
export function useDevice() {
  const $q = useQuasar();

  const isMobile = $q.platform.is.mobile;
  const isTablet = $q.screen.width > 600 && $q.screen.width < 1024;
  const isDesktop = $q.platform.is.desktop;
  const isTouchScreen = $q.platform.has.touch;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchScreen,
    isSmallScreen: isMobile || (isTablet && $q.screen.width < 768),
  };
}

/**
 * Hook para configurações de acessibilidade
 */
export function useAccessibility() {
  // Detectar preferências do usuário
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  /**
   * Anuncia mensagem para leitores de tela
   */
  function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Remove após 1 segundo
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  /**
   * Foca elemento de forma segura
   */
  function focusElement(selector: string | HTMLElement) {
    const element =
      typeof selector === 'string' ? (document.querySelector(selector) as HTMLElement) : selector;

    if (element && element.focus) {
      element.focus();
    }
  }

  /**
   * Trap do foco para modais
   */
  function trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement | undefined;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement && lastElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement && firstElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
    announce,
    focusElement,
    trapFocus,
  };
}

/**
 * Hook para atalhos de teclado
 */
export function useKeyboardShortcuts() {
  function registerShortcut(
    keys: string,
    callback: () => void,
    options: { preventDefault?: boolean; target?: Document | HTMLElement } = {},
  ) {
    const { preventDefault = true, target = document } = options;

    function handleKeyDown(event: Event) {
      const keyEvent = event as KeyboardEvent;
      const keyString = [
        keyEvent.ctrlKey && 'ctrl',
        keyEvent.altKey && 'alt',
        keyEvent.shiftKey && 'shift',
        keyEvent.metaKey && 'meta',
        keyEvent.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      if (keyString === keys.toLowerCase()) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    }

    target.addEventListener('keydown', handleKeyDown);

    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
  }

  return {
    registerShortcut,
  };
}
