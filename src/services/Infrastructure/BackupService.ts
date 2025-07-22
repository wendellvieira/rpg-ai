import type { DatabaseService } from './DatabaseService';

export interface BackupMetadata {
  versao: string;
  criadoEm: string;
  totalItens: number;
  tipos: string[];
  tamanho: number;
}

export interface BackupCompleto {
  metadata: BackupMetadata;
  dados: Record<string, unknown>;
}

/**
 * Serviço de backup e restauração de dados
 */
export class BackupService {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Cria backup completo de todos os dados
   */
  async criarBackup(): Promise<string> {
    const dados = await this.dbService.criarBackup();
    const chaves = Object.keys(dados);

    const metadata: BackupMetadata = {
      versao: '1.0.0',
      criadoEm: new Date().toISOString(),
      totalItens: chaves.length,
      tipos: this.extrairTipos(chaves),
      tamanho: this.calcularTamanho(dados),
    };

    const backup: BackupCompleto = {
      metadata,
      dados,
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restaura backup completo
   */
  async restaurarBackup(backupData: string): Promise<void> {
    try {
      const backup: BackupCompleto = JSON.parse(backupData);

      // Valida estrutura do backup
      this.validarBackup(backup);

      // Restaura os dados
      await this.dbService.restaurarBackup(backup.dados);
    } catch (error) {
      throw new Error(
        `Erro ao restaurar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Cria backup seletivo de tipos específicos
   */
  async exportarSeletivo(tipos: string[]): Promise<string> {
    const todosOsDados = await this.dbService.criarBackup();
    const dadosFiltrados: Record<string, unknown> = {};

    for (const [chave, valor] of Object.entries(todosOsDados)) {
      const tipo = this.extrairTipoDaChave(chave);
      if (tipos.includes(tipo)) {
        dadosFiltrados[chave] = valor;
      }
    }

    const chaves = Object.keys(dadosFiltrados);
    const metadata: BackupMetadata = {
      versao: '1.0.0',
      criadoEm: new Date().toISOString(),
      totalItens: chaves.length,
      tipos: this.extrairTipos(chaves),
      tamanho: this.calcularTamanho(dadosFiltrados),
    };

    const backup: BackupCompleto = {
      metadata,
      dados: dadosFiltrados,
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Importa backup seletivo mantendo dados existentes
   */
  async importarSeletivo(backupData: string, tipos: string[]): Promise<void> {
    try {
      const backup: BackupCompleto = JSON.parse(backupData);
      this.validarBackup(backup);

      const dadosParaImportar: Array<{ key: string; value: unknown }> = [];

      for (const [chave, valor] of Object.entries(backup.dados)) {
        const tipo = this.extrairTipoDaChave(chave);
        if (tipos.includes(tipo)) {
          dadosParaImportar.push({ key: chave, value: valor });
        }
      }

      await this.dbService.setMultiple(dadosParaImportar);
    } catch (error) {
      throw new Error(
        `Erro ao importar backup seletivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Exporta apenas personagens
   */
  async exportarPersonagens(): Promise<string> {
    return await this.exportarSeletivo(['personagem']);
  }

  /**
   * Exporta apenas sessões
   */
  async exportarSessoes(): Promise<string> {
    return await this.exportarSeletivo(['sessao']);
  }

  /**
   * Exporta apenas itens
   */
  async exportarItens(): Promise<string> {
    return await this.exportarSeletivo(['item']);
  }

  /**
   * Cria backup incremental (apenas mudanças desde último backup)
   */
  async criarBackupIncremental(ultimoBackup?: string): Promise<string> {
    const dadosAtuais = await this.dbService.criarBackup();

    if (!ultimoBackup) {
      return await this.criarBackup();
    }

    try {
      const backupAnterior: BackupCompleto = JSON.parse(ultimoBackup);
      const diferencas: Record<string, unknown> = {};

      // Encontra itens novos ou modificados
      for (const [chave, valor] of Object.entries(dadosAtuais)) {
        const valorAnterior = backupAnterior.dados[chave];
        if (!valorAnterior || JSON.stringify(valor) !== JSON.stringify(valorAnterior)) {
          diferencas[chave] = valor;
        }
      }

      // Marca itens removidos
      for (const chave of Object.keys(backupAnterior.dados)) {
        if (!dadosAtuais[chave]) {
          diferencas[chave] = null; // Marca como removido
        }
      }

      const chaves = Object.keys(diferencas);
      const metadata: BackupMetadata = {
        versao: '1.0.0',
        criadoEm: new Date().toISOString(),
        totalItens: chaves.length,
        tipos: this.extrairTipos(chaves),
        tamanho: this.calcularTamanho(diferencas),
      };

      const backup: BackupCompleto = {
        metadata,
        dados: diferencas,
      };

      return JSON.stringify(backup, null, 2);
    } catch {
      // Se não conseguir processar backup anterior, cria completo
      return await this.criarBackup();
    }
  }

  /**
   * Aplica backup incremental
   */
  async aplicarBackupIncremental(backupIncremental: string): Promise<void> {
    try {
      const backup: BackupCompleto = JSON.parse(backupIncremental);
      this.validarBackup(backup);

      const operacoes: Array<{ key: string; value: unknown }> = [];
      const remocoes: string[] = [];

      for (const [chave, valor] of Object.entries(backup.dados)) {
        if (valor === null) {
          remocoes.push(chave);
        } else {
          operacoes.push({ key: chave, value: valor });
        }
      }

      // Aplica as operações
      if (operacoes.length > 0) {
        await this.dbService.setMultiple(operacoes);
      }

      if (remocoes.length > 0) {
        await this.dbService.removeMultiple(remocoes);
      }
    } catch (error) {
      throw new Error(
        `Erro ao aplicar backup incremental: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Valida estrutura do backup
   */
  private validarBackup(backup: BackupCompleto): void {
    if (!backup.metadata || !backup.dados) {
      throw new Error('Estrutura de backup inválida');
    }

    if (!backup.metadata.versao || !backup.metadata.criadoEm) {
      throw new Error('Metadata de backup inválida');
    }

    // Verifica compatibilidade de versão
    if (backup.metadata.versao !== '1.0.0') {
      console.warn(`Versão do backup (${backup.metadata.versao}) pode não ser compatível`);
    }
  }

  /**
   * Extrai tipos de dados a partir das chaves
   */
  private extrairTipos(chaves: string[]): string[] {
    const tipos = new Set<string>();

    for (const chave of chaves) {
      const tipo = this.extrairTipoDaChave(chave);
      tipos.add(tipo);
    }

    return Array.from(tipos);
  }

  /**
   * Extrai tipo de dado de uma chave
   */
  private extrairTipoDaChave(chave: string): string {
    if (chave.startsWith('personagem_')) return 'personagem';
    if (chave.startsWith('sessao_')) return 'sessao';
    if (chave.startsWith('item_')) return 'item';
    if (chave.startsWith('indice_')) return 'indice';
    return 'sistema';
  }

  /**
   * Calcula tamanho aproximado dos dados
   */
  private calcularTamanho(dados: Record<string, unknown>): number {
    return new Blob([JSON.stringify(dados)]).size;
  }

  /**
   * Obtém informações sobre um backup
   */
  analisarBackup(backupData: string): BackupMetadata | null {
    try {
      const backup: BackupCompleto = JSON.parse(backupData);
      return backup.metadata;
    } catch {
      return null;
    }
  }

  /**
   * Compara dois backups e retorna diferenças
   */
  compararBackups(
    backup1: string,
    backup2: string,
  ): {
    adicionados: string[];
    modificados: string[];
    removidos: string[];
  } {
    try {
      const b1: BackupCompleto = JSON.parse(backup1);
      const b2: BackupCompleto = JSON.parse(backup2);

      const chaves1 = new Set(Object.keys(b1.dados));
      const chaves2 = new Set(Object.keys(b2.dados));

      const adicionados = Array.from(chaves2).filter((k) => !chaves1.has(k));
      const removidos = Array.from(chaves1).filter((k) => !chaves2.has(k));
      const modificados: string[] = [];

      for (const chave of chaves1) {
        if (chaves2.has(chave)) {
          if (JSON.stringify(b1.dados[chave]) !== JSON.stringify(b2.dados[chave])) {
            modificados.push(chave);
          }
        }
      }

      return { adicionados, modificados, removidos };
    } catch {
      return { adicionados: [], modificados: [], removidos: [] };
    }
  }
}
