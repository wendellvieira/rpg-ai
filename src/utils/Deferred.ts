/**
 * Helper para implementar padrão de promessas diferidas (Deferred Pattern)
 * Útil para modais que precisam retornar valores de forma assíncrona
 */
export class Deferred<T = unknown> {
  public promise: Promise<T>;
  public resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason?: Error) => void;
  public isResolved = false;
  public isRejected = false;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = (value: T | PromiseLike<T>) => {
        this.isResolved = true;
        resolve(value);
      };
      this.reject = (reason?: Error) => {
        this.isRejected = true;
        reject(reason || new Error('Deferred rejected'));
      };
    });
  }

  get isSettled(): boolean {
    return this.isResolved || this.isRejected;
  }

  get isPending(): boolean {
    return !this.isSettled;
  }

  /**
   * Método de conveniência para aguardar o resultado
   */
  async wait(): Promise<T> {
    return this.promise;
  }

  /**
   * Resolve com timeout
   */
  async waitWithTimeout(timeoutMs: number, timeoutValue?: T): Promise<T> {
    return Promise.race([
      this.promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          if (timeoutValue !== undefined) {
            this.resolve(timeoutValue);
          } else {
            reject(new Error(`Deferred timeout after ${timeoutMs}ms`));
          }
        }, timeoutMs);
      }),
    ]);
  }

  /**
   * Factory method para criar uma nova instância
   */
  static create<T = unknown>(): Deferred<T> {
    return new Deferred<T>();
  }
}

/**
 * Tipo helper para controllers de modal que retornam valores
 */
export interface ModalController<TResult = unknown> {
  open(): Promise<TResult>;
  close(result?: TResult): void;
  cancel(): void;
}

/**
 * Base class para implementar controllers de modal com Deferred
 */
export abstract class BaseModalController<TResult = unknown> implements ModalController<TResult> {
  protected deferred: Deferred<TResult> | null = null;
  public isOpen = false;

  async open(): Promise<TResult> {
    if (this.isOpen && this.deferred) {
      throw new Error('Modal already open');
    }

    this.isOpen = true;
    this.deferred = Deferred.create<TResult>();
    
    // Hook para subclasses implementarem lógica de abertura
    this.onOpen();
    
    return this.deferred.wait();
  }

  close(result?: TResult): void {
    if (!this.isOpen || !this.deferred) {
      return;
    }

    this.isOpen = false;
    
    // Hook para subclasses implementarem lógica de fechamento
    this.onClose(result);
    
    if (result !== undefined) {
      this.deferred.resolve(result);
    } else {
      this.deferred.resolve({} as TResult);
    }
    
    this.deferred = null;
  }

  cancel(): void {
    if (!this.isOpen || !this.deferred) {
      return;
    }

    this.isOpen = false;
    
    // Hook para subclasses implementarem lógica de cancelamento
    this.onCancel();
    
    this.deferred.reject(new Error('Modal cancelled'));
    this.deferred = null;
  }

  // Hooks para subclasses
  protected abstract onOpen(): void;
  protected abstract onClose(result?: TResult): void;
  protected abstract onCancel(): void;
}
