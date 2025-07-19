import localforage from 'localforage';

/**
 * Serviço de banco de dados usando LocalForage/IndexedDB
 */
export class DatabaseService {
  private store: LocalForage;
  private initialized: boolean = false;

  constructor() {
    this.store = localforage.createInstance({
      name: 'RPG-AI',
      storeName: 'gamedata',
      description: 'Dados do jogo RPG-AI',
    });
  }

  /**
   * Inicializa o banco de dados
   */
  async inicializar(): Promise<void> {
    if (this.initialized) return;

    try {
      // Testa se o LocalForage está funcionando
      await this.store.ready();
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      throw new Error('Falha ao inicializar banco de dados');
    }
  }

  /**
   * Salva um item no banco
   */
  async setItem<T>(key: string, value: T): Promise<T> {
    await this.verificarInicializacao();
    return await this.store.setItem(key, value);
  }

  /**
   * Carrega um item do banco
   */
  async getItem<T>(key: string): Promise<T | null> {
    await this.verificarInicializacao();
    return await this.store.getItem<T>(key);
  }

  /**
   * Remove um item do banco
   */
  async removeItem(key: string): Promise<void> {
    await this.verificarInicializacao();
    await this.store.removeItem(key);
  }

  /**
   * Lista todas as chaves
   */
  async keys(): Promise<string[]> {
    await this.verificarInicializacao();
    return await this.store.keys();
  }

  /**
   * Limpa todo o banco
   */
  async clear(): Promise<void> {
    await this.verificarInicializacao();
    await this.store.clear();
  }

  /**
   * Retorna o número de itens
   */
  async length(): Promise<number> {
    await this.verificarInicializacao();
    return await this.store.length();
  }

  /**
   * Itera sobre todos os itens
   */
  async iterate<T, U>(
    iteratee: (value: T, key: string, iterationNumber: number) => U,
  ): Promise<U | undefined> {
    await this.verificarInicializacao();
    return await this.store.iterate(iteratee);
  }

  /**
   * Obtém todos os itens que correspondem a um padrão de chave
   */
  async getItemsByPattern<T>(pattern: string): Promise<Array<{ key: string; value: T }>> {
    await this.verificarInicializacao();

    const results: Array<{ key: string; value: T }> = [];
    const regex = new RegExp(pattern);

    await this.store.iterate<T, void>((value, key) => {
      if (regex.test(key)) {
        results.push({ key, value });
      }
    });

    return results;
  }

  /**
   * Salva múltiplos itens em batch
   */
  async setMultiple<T>(items: Array<{ key: string; value: T }>): Promise<void> {
    await this.verificarInicializacao();

    const promises = items.map(({ key, value }) => this.store.setItem(key, value));
    await Promise.all(promises);
  }

  /**
   * Carrega múltiplos itens
   */
  async getMultiple<T>(keys: string[]): Promise<Array<{ key: string; value: T | null }>> {
    await this.verificarInicializacao();

    const promises = keys.map(async (key) => ({
      key,
      value: await this.store.getItem<T>(key),
    }));

    return await Promise.all(promises);
  }

  /**
   * Remove múltiplos itens
   */
  async removeMultiple(keys: string[]): Promise<void> {
    await this.verificarInicializacao();

    const promises = keys.map((key) => this.store.removeItem(key));
    await Promise.all(promises);
  }

  /**
   * Verifica se uma chave existe
   */
  async hasKey(key: string): Promise<boolean> {
    await this.verificarInicializacao();
    const value = await this.store.getItem(key);
    return value !== null;
  }

  /**
   * Obtém tamanho aproximado do banco em bytes
   */
  async estimarTamanho(): Promise<number> {
    await this.verificarInicializacao();

    let tamanhoTotal = 0;

    await this.store.iterate<unknown, void>((value, key) => {
      // Estimativa simples do tamanho
      const tamanhoChave = new Blob([key]).size;
      const tamanhoValor = new Blob([JSON.stringify(value)]).size;
      tamanhoTotal += tamanhoChave + tamanhoValor;
    });

    return tamanhoTotal;
  }

  /**
   * Cria backup de todos os dados
   */
  async criarBackup(): Promise<Record<string, unknown>> {
    await this.verificarInicializacao();

    const backup: Record<string, unknown> = {};

    await this.store.iterate<unknown, void>((value, key) => {
      backup[key] = value;
    });

    return backup;
  }

  /**
   * Restaura dados de um backup
   */
  async restaurarBackup(backup: Record<string, unknown>): Promise<void> {
    await this.verificarInicializacao();

    // Limpa dados existentes
    await this.store.clear();

    // Restaura dados do backup
    const items = Object.entries(backup).map(([key, value]) => ({ key, value }));
    await this.setMultiple(items);
  }

  /**
   * Compacta o banco removendo itens órfãos ou inválidos
   */
  async compactar(): Promise<{ removidos: number; tamanhoAnterior: number; tamanhoNovo: number }> {
    await this.verificarInicializacao();

    const tamanhoAnterior = await this.length();
    const chavesParaRemover: string[] = [];

    // Identifica chaves órfãs ou inválidas
    await this.store.iterate<unknown, void>((value, key) => {
      if (value === null || value === undefined) {
        chavesParaRemover.push(key);
      }

      // Pode adicionar outras verificações de integridade aqui
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        if (!obj.id && key.includes('_')) {
          // Itens sem ID que deveriam ter
          chavesParaRemover.push(key);
        }
      }
    });

    // Remove as chaves identificadas
    await this.removeMultiple(chavesParaRemover);

    const tamanhoNovo = await this.length();

    return {
      removidos: chavesParaRemover.length,
      tamanhoAnterior,
      tamanhoNovo,
    };
  }

  /**
   * Obtém informações sobre o banco
   */
  async getInfo(): Promise<{
    nome: string;
    driver: string;
    tamanho: number;
    totalItens: number;
    chaves: string[];
  }> {
    await this.verificarInicializacao();

    return {
      nome: this.store.config().name || 'RPG-AI',
      driver: this.store.driver(),
      tamanho: await this.estimarTamanho(),
      totalItens: await this.length(),
      chaves: await this.keys(),
    };
  }

  /**
   * Verifica se o banco foi inicializado
   */
  private async verificarInicializacao(): Promise<void> {
    if (!this.initialized) {
      await this.inicializar();
    }
  }

  /**
   * Força reinicialização do banco
   */
  async reinicializar(): Promise<void> {
    this.initialized = false;
    await this.inicializar();
  }
}
