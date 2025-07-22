import { DatabaseService } from './DatabaseService';
import { BackupService } from './BackupService';
import { Personagem } from '../../domain/entities/Character/Personagem';
import { SessaoJogo } from '../../classes/SessaoJogo';
import type { Item } from '../../domain/entities/Items/Item';

/**
 * Gerenciador principal de persistência
 * Coordena operações entre diferentes serviços de armazenamento
 */
export class PersistenceManager {
  private static instance: PersistenceManager;
  private dbService: DatabaseService;
  private backupService: BackupService;
  private initialized: boolean = false;

  private constructor() {
    this.dbService = new DatabaseService();
    this.backupService = new BackupService(this.dbService);
  }

  /**
   * Singleton pattern
   */
  static getInstance(): PersistenceManager {
    if (!PersistenceManager.instance) {
      PersistenceManager.instance = new PersistenceManager();
    }
    return PersistenceManager.instance;
  }

  /**
   * Inicializa o sistema de persistência
   */
  async inicializar(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.dbService.inicializar();
      await this.migrarDados();
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar persistência:', error);
      throw error;
    }
  }

  /**
   * Executa migrações de dados se necessário
   */
  private async migrarDados(): Promise<void> {
    const versaoAtual = await this.dbService.getItem('versao_schema');
    const versaoEsperada = '1.0.0';

    if (versaoAtual !== versaoEsperada) {
      console.log(`Migrando dados da versão ${String(versaoAtual)} para ${versaoEsperada}`);
      // Aqui implementaríamos as migrações necessárias
      await this.dbService.setItem('versao_schema', versaoEsperada);
    }
  }

  /**
   * Salva personagem
   */
  async salvarPersonagem(personagem: Personagem): Promise<void> {
    await this.verificarInicializacao();
    const dados = personagem.serializar();
    console.log('🗄️ PersistenceManager: Dados serializados para salvar:', dados);
    console.log('🗄️ PersistenceManager: Conhecimentos nos dados:', dados.conhecimentos);
    await this.dbService.setItem(`personagem_${personagem.id}`, dados);
    await this.atualizarIndicePersonagens(personagem);
    console.log('🗄️ PersistenceManager: Personagem salvo no DB');
  }

  /**
   * Carrega personagem
   */
  async carregarPersonagem(id: string): Promise<Personagem | null> {
    await this.verificarInicializacao();
    const dados = await this.dbService.getItem(`personagem_${id}`);
    console.log('🗄️ PersistenceManager: Dados carregados do DB:', dados);

    if (dados) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const personagem = Personagem.deserializar(dados as any);
      console.log('🗄️ PersistenceManager: Personagem deserializado:', personagem);
      console.log('🗄️ PersistenceManager: Conhecimentos carregados:', personagem.getConhecimentos);
      return personagem;
    }

    return null;
  }

  /**
   * Lista todos os personagens
   */
  async listarPersonagens(): Promise<
    Array<{ id: string; nome: string; classe: string; raca: string }>
  > {
    await this.verificarInicializacao();
    const indice = (await this.dbService.getItem('indice_personagens')) || [];
    return indice as Array<{ id: string; nome: string; classe: string; raca: string }>;
  }

  /**
   * Remove personagem
   */
  async removerPersonagem(id: string): Promise<void> {
    await this.verificarInicializacao();
    await this.dbService.removeItem(`personagem_${id}`);
    await this.removerDoIndicePersonagens(id);
  }

  /**
   * Salva sessão de jogo
   */
  async salvarSessao(sessao: SessaoJogo): Promise<void> {
    await this.verificarInicializacao();

    try {
      const dados = sessao.serializar();

      // Criar uma cópia limpa para evitar problemas de clonagem
      const dadosLimpos = JSON.parse(
        JSON.stringify(dados, (key, value) => {
          // Remove funções e objetos complexos que podem causar problemas
          if (typeof value === 'function') return undefined;
          if (value instanceof Error) return value.message;
          if (value instanceof Date) return value.toISOString();
          return value;
        }),
      );

      await this.dbService.setItem(`sessao_${sessao.id}`, dadosLimpos);
      await this.atualizarIndiceSessoes(sessao);
    } catch (error) {
      console.error('Erro ao serializar sessão:', error);
      throw new Error(`Erro ao salvar sessão: ${String(error)}`);
    }
  }

  /**
   * Carrega sessão de jogo
   */
  async carregarSessao(id: string): Promise<SessaoJogo | null> {
    await this.verificarInicializacao();
    const dados = await this.dbService.getItem(`sessao_${id}`);

    if (dados && typeof dados === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return SessaoJogo.deserializar(dados as any);
    }

    return null;
  }

  /**
   * Lista todas as sessões
   */
  async listarSessoes(): Promise<
    Array<{ id: string; nome: string; status: string; criadaEm: string }>
  > {
    await this.verificarInicializacao();
    const indice = (await this.dbService.getItem('indice_sessoes')) || [];
    return Array.isArray(indice) ? indice : [];
  }

  /**
   * Remove sessão
   */
  async removerSessao(id: string): Promise<void> {
    await this.verificarInicializacao();
    await this.dbService.removeItem(`sessao_${id}`);
    await this.removerDoIndiceSessoes(id);
  }

  /**
   * Salva item
   */
  async salvarItem(item: Item): Promise<void> {
    await this.verificarInicializacao();
    const dados = item.serializar();
    await this.dbService.setItem(`item_${item.id}`, dados);
    await this.atualizarIndiceItens(item);
  }

  /**
   * Carrega item
   */
  async carregarItem(id: string): Promise<Record<string, unknown> | null> {
    await this.verificarInicializacao();
    const dados = await this.dbService.getItem(`item_${id}`);
    return dados && typeof dados === 'object' ? (dados as Record<string, unknown>) : null;
  }

  /**
   * Lista todos os itens
   */
  async listarItens(): Promise<
    Array<{ id: string; nome: string; tipo: string; raridade: string }>
  > {
    await this.verificarInicializacao();
    const indice = (await this.dbService.getItem('indice_itens')) || [];
    return Array.isArray(indice) ? indice : [];
  }

  /**
   * Remove item
   */
  async removerItem(id: string): Promise<void> {
    await this.verificarInicializacao();
    await this.dbService.removeItem(`item_${id}`);
    await this.removerDoIndiceItens(id);
  }

  /**
   * Limpa todos os dados
   */
  async limparTodos(): Promise<void> {
    await this.verificarInicializacao();
    await this.dbService.clear();
  }

  /**
   * Obtém estatísticas de armazenamento
   */
  async getEstatisticas(): Promise<{
    totalPersonagens: number;
    totalSessoes: number;
    totalItens: number;
    tamanhoTotal: number;
  }> {
    await this.verificarInicializacao();

    const personagens = await this.listarPersonagens();
    const sessoes = await this.listarSessoes();
    const itens = await this.listarItens();

    // Estimar tamanho (em um cenário real, isso seria mais preciso)
    const tamanhoTotal = await this.dbService.length();

    return {
      totalPersonagens: personagens.length,
      totalSessoes: sessoes.length,
      totalItens: itens.length,
      tamanhoTotal,
    };
  }

  /**
   * Cria backup completo
   */
  async criarBackup(): Promise<string> {
    await this.verificarInicializacao();
    return await this.backupService.criarBackup();
  }

  /**
   * Restaura backup
   */
  async restaurarBackup(backupData: string): Promise<void> {
    await this.verificarInicializacao();
    await this.backupService.restaurarBackup(backupData);
  }

  /**
   * Exporta dados específicos
   */
  async exportarDados(tipos: string[]): Promise<string> {
    await this.verificarInicializacao();
    return await this.backupService.exportarSeletivo(tipos);
  }

  /**
   * Verifica se o sistema foi inicializado
   */
  private async verificarInicializacao(): Promise<void> {
    if (!this.initialized) {
      await this.inicializar();
    }
  }

  /**
   * Atualiza índice de personagens
   */
  private async atualizarIndicePersonagens(personagem: Personagem): Promise<void> {
    const indiceData = (await this.dbService.getItem('indice_personagens')) || [];
    const indice = Array.isArray(indiceData) ? indiceData : [];
    const entrada = {
      id: personagem.id,
      nome: personagem.nome,
      classe: personagem.classe,
      raca: personagem.raca,
    };

    const indiceExistente = indice.findIndex((p: { id: string }) => p.id === personagem.id);
    if (indiceExistente >= 0) {
      indice[indiceExistente] = entrada;
    } else {
      indice.push(entrada);
    }

    await this.dbService.setItem('indice_personagens', indice);
  }

  /**
   * Remove personagem do índice
   */
  private async removerDoIndicePersonagens(id: string): Promise<void> {
    const indiceData = (await this.dbService.getItem('indice_personagens')) || [];
    const indice = Array.isArray(indiceData) ? indiceData : [];
    const novoIndice = indice.filter((p: { id: string }) => p.id !== id);
    await this.dbService.setItem('indice_personagens', novoIndice);
  }

  /**
   * Atualiza índice de sessões
   */
  private async atualizarIndiceSessoes(sessao: SessaoJogo): Promise<void> {
    const indiceData = (await this.dbService.getItem('indice_sessoes')) || [];
    const indice = Array.isArray(indiceData) ? indiceData : [];
    const entrada = {
      id: sessao.id,
      nome: sessao.nome,
      status: sessao.statusAtual,
      criadaEm: sessao.criadaEm.toISOString(),
    };

    const indiceExistente = indice.findIndex((s: { id: string }) => s.id === sessao.id);
    if (indiceExistente >= 0) {
      indice[indiceExistente] = entrada;
    } else {
      indice.push(entrada);
    }

    await this.dbService.setItem('indice_sessoes', indice);
  }

  /**
   * Remove sessão do índice
   */
  private async removerDoIndiceSessoes(id: string): Promise<void> {
    const indiceData = (await this.dbService.getItem('indice_sessoes')) || [];
    const indice = Array.isArray(indiceData) ? indiceData : [];
    const novoIndice = indice.filter((s: { id: string }) => s.id !== id);
    await this.dbService.setItem('indice_sessoes', novoIndice);
  }

  /**
   * Atualiza índice de itens
   */
  private async atualizarIndiceItens(item: Item): Promise<void> {
    const indiceData = (await this.dbService.getItem('indice_itens')) || [];
    const indice = Array.isArray(indiceData) ? indiceData : [];
    const entrada = {
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      raridade: item.raridade,
    };

    const indiceExistente = indice.findIndex((i: { id: string }) => i.id === item.id);
    if (indiceExistente >= 0) {
      indice[indiceExistente] = entrada;
    } else {
      indice.push(entrada);
    }

    await this.dbService.setItem('indice_itens', indice);
  }

  /**
   * Remove item do índice
   */
  private async removerDoIndiceItens(id: string): Promise<void> {
    const indiceData = (await this.dbService.getItem('indice_itens')) || [];
    const indice = Array.isArray(indiceData) ? indiceData : [];
    const novoIndice = indice.filter((i: { id: string }) => i.id !== id);
    await this.dbService.setItem('indice_itens', novoIndice);
  }
}
