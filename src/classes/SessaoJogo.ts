import type { Mensagem } from '../types';
import { SistemaTurnos } from './SistemaTurnos';

export enum StatusSessao {
  ATIVA = 'ativa',
  PAUSADA = 'pausada',
  FINALIZADA = 'finalizada',
}

interface ConfiguracaoSessao {
  id?: string;
  nome: string;
  descricao: string;
  participantes?: string[]; // IDs dos personagens
  turnoAtual?: number;
  rodada?: number;
  status?: StatusSessao;
}

interface SessaoSerializada {
  id: string;
  nome: string;
  descricao: string;
  criadaEm: Date;
  atualizadaEm: Date;
  participantes: string[];
  mensagens: Array<Record<string, unknown>>; // Mensagens serializadas como objeto simples
  turnoAtual: number;
  rodada: number;
  status: StatusSessao;
  sistemaTurnos?: Record<string, unknown>; // Estado serializado do SistemaTurnos
}

/**
 * Gerencia uma sessão de jogo RPG
 */
export class SessaoJogo {
  public readonly id: string;
  public readonly nome: string;
  public readonly descricao: string;
  public readonly criadaEm: Date;
  public atualizadaEm: Date;

  private participantes: string[];
  private mensagens: Mensagem[];
  private turnoAtual: number;
  private rodada: number;
  private status: StatusSessao;
  private sistemaTurnos: SistemaTurnos;

  constructor(config: ConfiguracaoSessao) {
    this.id = config.id ?? this.gerarId();
    this.nome = config.nome;
    this.descricao = config.descricao;
    this.criadaEm = new Date();
    this.atualizadaEm = new Date();

    this.participantes = config.participantes ?? [];
    this.mensagens = [];
    this.turnoAtual = config.turnoAtual ?? 0;
    this.rodada = config.rodada ?? 1;
    this.status = config.status ?? StatusSessao.ATIVA;
    this.sistemaTurnos = new SistemaTurnos();
  }

  // Getters
  get statusAtual(): StatusSessao {
    return this.status;
  }
  get turnoAtualIndex(): number {
    return this.turnoAtual;
  }
  get rodadaAtual(): number {
    return this.rodada;
  }
  get totalParticipantes(): number {
    return this.participantes.length;
  }
  get historicoMensagens(): Mensagem[] {
    return [...this.mensagens];
  }
  get getSistemaTurnos(): SistemaTurnos {
    return this.sistemaTurnos;
  }

  /**
   * Obtém lista de participantes da sessão
   */
  getParticipantes(): string[] {
    return [...this.participantes];
  }

  /**
   * Obtém contexto atual da sessão
   */
  get contextoAtual(): string {
    return `Sessão: ${this.nome} - ${this.descricao}`;
  }

  /**
   * Adiciona um personagem à sessão
   */
  adicionarParticipante(personagemId: string): void {
    if (!this.participantes.includes(personagemId)) {
      this.participantes.push(personagemId);
      this.atualizarTimestamp();
    }
  }

  /**
   * Remove um personagem da sessão
   */
  removerParticipante(personagemId: string): void {
    const index = this.participantes.indexOf(personagemId);
    if (index !== -1) {
      this.participantes.splice(index, 1);

      // Ajusta o turno se necessário
      if (this.turnoAtual >= this.participantes.length && this.participantes.length > 0) {
        this.turnoAtual = 0;
      }

      this.atualizarTimestamp();
    }
  }

  /**
   * Obtém ID do personagem no turno atual
   */
  getPersonagemTurnoAtual(): string | null {
    if (this.participantes.length === 0) return null;
    return this.participantes[this.turnoAtual] || null;
  }

  /**
   * Avança para o próximo turno
   */
  avancarTurno(): void {
    if (this.participantes.length === 0) return;

    this.turnoAtual++;

    if (this.turnoAtual >= this.participantes.length) {
      this.turnoAtual = 0;
      this.rodada++;
    }

    this.atualizarTimestamp();
  }

  /**
   * Define manualmente o turno atual
   */
  definirTurno(indice: number): void {
    if (indice >= 0 && indice < this.participantes.length) {
      this.turnoAtual = indice;
      this.atualizarTimestamp();
    }
  }

  /**
   * Adiciona mensagem ao histórico
   */
  adicionarMensagem(mensagem: Omit<Mensagem, 'id' | 'timestamp' | 'turno' | 'rodada'>): void {
    const mensagemCompleta = {
      ...mensagem,
      id: this.gerarId(),
      timestamp: new Date(),
      turno: this.turnoAtual,
      rodada: this.rodada,
    } as Mensagem;

    this.mensagens.push(mensagemCompleta);
    this.atualizarTimestamp();
  }

  /**
   * Obtém mensagens recentes
   */
  getMensagensRecentes(quantidade: number = 20): Mensagem[] {
    return this.mensagens.slice(-quantidade);
  }

  /**
   * Obtém mensagens de um personagem específico
   */
  getMensagensPersonagem(personagemId: string): Mensagem[] {
    return this.mensagens.filter(
      (msg) => (msg.tipo === 'fala' || msg.tipo === 'acao') && msg.personagem === personagemId,
    );
  }

  /**
   * Limpa histórico de mensagens (mantém apenas as N mais recentes)
   */
  limparHistorico(manterUltimas: number = 100): void {
    if (this.mensagens.length > manterUltimas) {
      this.mensagens = this.mensagens.slice(-manterUltimas);
      this.atualizarTimestamp();
    }
  }

  /**
   * Pausa a sessão
   */
  pausar(): void {
    this.status = StatusSessao.PAUSADA;
    this.atualizarTimestamp();
  }

  /**
   * Retoma a sessão
   */
  retomar(): void {
    this.status = StatusSessao.ATIVA;
    this.atualizarTimestamp();
  }

  /**
   * Finaliza a sessão
   */
  finalizar(): void {
    this.status = StatusSessao.FINALIZADA;
    this.atualizarTimestamp();
  }

  /**
   * Verifica se a sessão está ativa
   */
  estaAtiva(): boolean {
    return this.status === StatusSessao.ATIVA;
  }

  /**
   * Verifica se a sessão está pausada
   */
  estaPausada(): boolean {
    return this.status === StatusSessao.PAUSADA;
  }

  /**
   * Verifica se a sessão foi finalizada
   */
  foiFinalizada(): boolean {
    return this.status === StatusSessao.FINALIZADA;
  }

  /**
   * Reordena participantes (útil para iniciativa)
   */
  reordenarParticipantes(novaOrdem: string[]): void {
    // Verifica se todos os IDs são válidos
    const idsValidos = novaOrdem.every((id) => this.participantes.includes(id));
    const mesmaQuantidade = novaOrdem.length === this.participantes.length;

    if (idsValidos && mesmaQuantidade) {
      const personagemAtual = this.getPersonagemTurnoAtual();
      this.participantes = [...novaOrdem];

      // Ajusta o turno atual para manter o mesmo personagem
      if (personagemAtual) {
        this.turnoAtual = this.participantes.indexOf(personagemAtual);
      }

      this.atualizarTimestamp();
    }
  }

  /**
   * Gera um resumo da sessão atual
   */
  gerarResumo(): string {
    const totalMensagens = this.mensagens.length;
    const personagemAtual = this.getPersonagemTurnoAtual();

    let resumo = `**Sessão: ${this.nome}**\n`;
    resumo += `Status: ${this.status}\n`;
    resumo += `Rodada: ${this.rodada} | Turno: ${this.turnoAtual + 1}/${this.participantes.length}\n`;

    if (personagemAtual) {
      resumo += `Personagem atual: ${personagemAtual}\n`;
    }

    resumo += `Participantes: ${this.participantes.length}\n`;
    resumo += `Mensagens: ${totalMensagens}\n`;
    resumo += `Criada em: ${this.criadaEm.toLocaleDateString()}\n`;
    resumo += `Última atualização: ${this.atualizadaEm.toLocaleString()}\n`;

    return resumo;
  }

  /**
   * Atualiza timestamp de modificação
   */
  private atualizarTimestamp(): void {
    this.atualizadaEm = new Date();
  }

  /**
   * Gera ID único
   */
  private gerarId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa sessão para persistência
   */
  serializar(): SessaoSerializada {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      criadaEm: this.criadaEm,
      atualizadaEm: this.atualizadaEm,
      participantes: [...this.participantes],
      mensagens: this.mensagens.map((msg) => this.serializarMensagem(msg)),
      turnoAtual: this.turnoAtual,
      rodada: this.rodada,
      status: this.status,
      sistemaTurnos: this.sistemaTurnos.serializar(),
    };
  }

  /**
   * Serializa uma mensagem de forma segura
   */
  private serializarMensagem(msg: Mensagem): Record<string, unknown> {
    // Cria uma cópia limpa usando JSON para remover referências
    const msgLimpa = JSON.parse(
      JSON.stringify(msg, (key, value) => {
        // Remove propriedades que podem causar referências circulares
        if (typeof value === 'function') return undefined;
        if (value instanceof Error) return value.message;

        // Garante que timestamps sejam convertidos para strings ISO
        if (value instanceof Date) return value.toISOString();

        return value;
      }),
    );

    return msgLimpa;
  }

  /**
   * Cria sessão a partir de dados serializados
   */
  static deserializar(dados: SessaoSerializada): SessaoJogo {
    const sessao = new SessaoJogo({
      id: dados.id,
      nome: dados.nome,
      descricao: dados.descricao,
      participantes: dados.participantes,
      turnoAtual: dados.turnoAtual,
      rodada: dados.rodada,
      status: dados.status,
    });

    // Restaura dados temporais
    Object.defineProperty(sessao, 'criadaEm', {
      value: new Date(dados.criadaEm),
      writable: false,
    });
    sessao.atualizadaEm = new Date(dados.atualizadaEm);

    // Restaura mensagens
    sessao.mensagens = dados.mensagens.map((msg) => {
      const mensagem = { ...msg } as unknown as Mensagem;
      // Reconverter timestamp se for string
      if (typeof msg.timestamp === 'string') {
        mensagem.timestamp = new Date(msg.timestamp);
      } else if (msg.timestamp instanceof Date) {
        mensagem.timestamp = msg.timestamp;
      } else {
        mensagem.timestamp = new Date();
      }
      return mensagem;
    });

    // Restaura sistema de turnos se disponível
    if (dados.sistemaTurnos) {
      sessao.sistemaTurnos = SistemaTurnos.deserializar(dados.sistemaTurnos);
    }

    return sessao;
  }

  /**
   * Cria uma nova sessão de exemplo
   */
  static criarExemplo(): SessaoJogo {
    return new SessaoJogo({
      nome: 'Aventura na Taverna',
      descricao: 'Uma sessão de RPG épica onde os heróis se encontram numa taverna misteriosa.',
    });
  }
}
