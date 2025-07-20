/**
 * Serviço para gerenciar PWA (Progressive Web App)
 * Registra service worker e gerencia atualizações
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export class PWAService {
  private static instance: PWAService;
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    void this.init();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  /**
   * Inicializa o serviço PWA
   */
  private async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdateListener();
      } catch (error) {
        console.error('Erro ao inicializar PWA:', error);
      }
    }
  }

  /**
   * Registra o service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado:', this.registration.scope);

      // Verifica por atualizações
      this.registration.addEventListener('updatefound', () => {
        console.log('Nova versão do Service Worker encontrada');
        this.handleServiceWorkerUpdate();
      });

    } catch (error) {
      console.error('Falha ao registrar Service Worker:', error);
    }
  }

  /**
   * Configura o prompt de instalação
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('Prompt de instalação PWA disponível');
      event.preventDefault();
      this.installPrompt = event as unknown as PWAInstallPrompt;
      
      // Disparar evento customizado para componentes
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso');
      this.installPrompt = null;
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  /**
   * Configura listener para atualizações
   */
  private setupUpdateListener(): void {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker atualizado, recarregando página...');
      window.location.reload();
    });
  }

  /**
   * Trata atualizações do service worker
   */
  private handleServiceWorkerUpdate(): void {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('Nova versão disponível');
        
        // Disparar evento para mostrar notificação de atualização
        window.dispatchEvent(new CustomEvent('pwa-update-available', {
          detail: { registration: this.registration }
        }));
      }
    });
  }

  /**
   * Verifica se PWA pode ser instalado
   */
  public canInstall(): boolean {
    return this.installPrompt !== null;
  }

  /**
   * Mostra prompt de instalação
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('Prompt de instalação não disponível');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      
      console.log('Resultado da instalação:', result.outcome);
      
      if (result.outcome === 'accepted') {
        this.installPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
      return false;
    }
  }

  /**
   * Força atualização do service worker
   */
  public async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      console.warn('Service Worker não registrado');
      return;
    }

    try {
      await this.registration.update();
      
      // Pular waiting e ativar nova versão
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Erro ao atualizar Service Worker:', error);
    }
  }

  /**
   * Verifica se está rodando como PWA
   */
  public isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as NavigatorWithStandalone).standalone === true;
  }

  /**
   * Obtém informações sobre o PWA
   */
  public getInfo(): {
    isPWA: boolean;
    canInstall: boolean;
    isOnline: boolean;
    hasServiceWorker: boolean;
  } {
    return {
      isPWA: this.isPWA(),
      canInstall: this.canInstall(),
      isOnline: navigator.onLine,
      hasServiceWorker: !!this.registration
    };
  }

  /**
   * Registra listener para eventos PWA
   */
  public addEventListener(type: string, listener: EventListener): void {
    window.addEventListener(type, listener);
  }

  /**
   * Remove listener para eventos PWA
   */
  public removeEventListener(type: string, listener: EventListener): void {
    window.removeEventListener(type, listener);
  }
}

// Instância global
export const pwaService = PWAService.getInstance();
