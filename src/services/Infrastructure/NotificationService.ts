/**
 * Serviço para notificações e feedback melhorado
 */

import { Notify, Loading, Dialog } from 'quasar';
import { useAccessibility } from '../../composables/useAccessibility';

export interface NotificationOptions {
  message: string;
  type?: 'positive' | 'negative' | 'warning' | 'info';
  timeout?: number;
  actions?: Array<{
    label: string;
    color?: string;
    handler: () => void;
  }>;
  position?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'right'
    | 'center';
  multiLine?: boolean;
  html?: boolean;
  caption?: string;
  avatar?: string;
  icon?: string;
  progress?: boolean;
  persistent?: boolean;
  announceToScreenReader?: boolean;
}

export interface LoadingOptions {
  message?: string;
  delay?: number;
  spinnerSize?: string;
  spinnerColor?: string;
  backgroundColor?: string;
  messageColor?: string;
  customClass?: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  ok?: string | { label: string; color?: string; flat?: boolean };
  cancel?: string | { label: string; color?: string; flat?: boolean };
  persistent?: boolean;
  html?: boolean;
  position?: 'standard' | 'top';
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Mostra uma notificação
   */
  public notify(options: NotificationOptions): void {
    const { announce } = useAccessibility();
    const {
      message,
      type = 'info',
      timeout = 5000,
      position = 'top',
      announceToScreenReader = true,
      ...rest
    } = options;

    // Configurações padrão por tipo
    const typeDefaults = {
      positive: { icon: 'check_circle', color: 'positive' },
      negative: { icon: 'error', color: 'negative' },
      warning: { icon: 'warning', color: 'warning' },
      info: { icon: 'info', color: 'info' },
    };

    const defaults = typeDefaults[type];

    Notify.create({
      message,
      type,
      timeout,
      position,
      icon: rest.icon || defaults.icon,
      color: defaults.color,
      textColor: 'white',
      ...rest,
    });

    // Anunciar para leitores de tela se solicitado
    if (announceToScreenReader) {
      const priority = type === 'negative' ? 'assertive' : 'polite';
      announce(message, priority);
    }
  }

  /**
   * Notificação de sucesso
   */
  public success(message: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ ...options, message, type: 'positive' });
  }

  /**
   * Notificação de erro
   */
  public error(message: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ ...options, message, type: 'negative' });
  }

  /**
   * Notificação de aviso
   */
  public warning(message: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ ...options, message, type: 'warning' });
  }

  /**
   * Notificação informativa
   */
  public info(message: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ ...options, message, type: 'info' });
  }

  /**
   * Mostra loading com opções customizadas
   */
  public showLoading(message = 'Carregando...'): void {
    Loading.show({
      message,
      spinnerColor: 'primary',
    });
  }

  /**
   * Esconde loading
   */
  public hideLoading(): void {
    Loading.hide();
  }

  /**
   * Mostra dialog de confirmação
   */
  public async confirm(options: ConfirmOptions): Promise<boolean> {
    const {
      title = 'Confirmação',
      message,
      ok = 'Confirmar',
      cancel = 'Cancelar',
      persistent = false,
      html = false,
      position = 'standard',
    } = options;

    return new Promise((resolve) => {
      Dialog.create({
        title,
        message,
        ok,
        cancel,
        persistent,
        html,
        position,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false));
    });
  }

  /**
   * Mostra dialog de prompt para entrada de texto
   */
  public async prompt(message: string, title = 'Entrada de Dados'): Promise<string | null> {
    return new Promise((resolve) => {
      Dialog.create({
        title,
        message,
        prompt: {
          model: '',
          type: 'text',
        },
        ok: 'Confirmar',
        cancel: 'Cancelar',
        persistent: true,
      })
        .onOk((data) => resolve(data))
        .onCancel(() => resolve(null))
        .onDismiss(() => resolve(null));
    });
  }
}

// Exportar instância singleton
export const notificationService = NotificationService.getInstance();

// Composable para usar em componentes Vue
export function useNotifications() {
  return {
    notify: notificationService.notify.bind(notificationService),
    success: notificationService.success.bind(notificationService),
    error: notificationService.error.bind(notificationService),
    warning: notificationService.warning.bind(notificationService),
    info: notificationService.info.bind(notificationService),
    showLoading: notificationService.showLoading.bind(notificationService),
    hideLoading: notificationService.hideLoading.bind(notificationService),
    confirm: notificationService.confirm.bind(notificationService),
    prompt: notificationService.prompt.bind(notificationService),
  };
}
