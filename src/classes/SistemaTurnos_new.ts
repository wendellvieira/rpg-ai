/**
 * Interface para participantes que podem agir em turnos
 */
export interface ParticipanteTurno {
  id: string;
  nome: string;
  isIA: boolean;
  iniciativa: number;
  jaAgiu: boolean;
  ativo: boolean;
}

/**
 * Interface para ações que podem ser executadas
 */
export interface AcaoTurno {
  id: string;
  participante: string;
  tipo: 'movimento' | 'acao' | 'acao_bonus' | 'reacao' | 'livre';
  descricao: string;
  timestamp: Date;
  turno: number;
  rodada: number;
}

/**
 * Gerencia o sistema de turnos do jogo
 */
export class SistemaTurnos {
  private participantes: Map<string, ParticipanteTurno>;
  private ordemTurnos: string[];
  private turnoAtual: number;
  private rodadaAtual: number;
  private participanteAtivo: string | null;
  private historicoAcoes: AcaoTurno[];
  private pausado: boolean;

  constructor() {
    this.participantes = new Map();
    this.ordemTurnos = [];
    this.turnoAtual = 0;
    this.rodadaAtual = 1;
    this.participanteAtivo = null;
    this.historicoAcoes = [];
    this.pausado = false;
  }

  // Getters
  get participanteAtualId(): string | null {
    return this.participanteAtivo;
  }

  get numeroTurno(): number {
    return this.turnoAtual;
  }

  get numeroRodada(): number {
    return this.rodadaAtual;
  }

  get estaAtivo(): boolean {
    return !this.pausado;
  }

  get totalParticipantes(): number {
    return this.participantes.size;
  }

  /**
   * Adiciona um participante ao sistema de turnos
   */
  adicionarParticipante(participante: ParticipanteTurno): void {
    this.participantes.set(participante.id, {
      ...participante,
      jaAgiu: false,
      ativo: true,
    });

    // Reorganizar ordem por iniciativa
    this.reorganizarOrdem();
  }

  /**
   * Remove um participante do sistema
   */
  removerParticipante(id: string): void {
    if (this.participantes.has(id)) {
      this.participantes.delete(id);
      this.ordemTurnos = this.ordemTurnos.filter((pid) => pid !== id);

      // Se era o participante ativo, avançar para o próximo
      if (this.participanteAtivo === id) {
        this.proximoTurno();
      }
    }
  }

  /**
   * Reorganiza a ordem dos turnos por iniciativa
   */
  private reorganizarOrdem(): void {
    this.ordemTurnos = Array.from(this.participantes.values())
      .filter((p) => p.ativo)
      .sort((a, b) => b.iniciativa - a.iniciativa)
      .map((p) => p.id);

    // Se não há participante ativo, definir o primeiro
    if (!this.participanteAtivo && this.ordemTurnos.length > 0) {
      this.participanteAtivo = this.ordemTurnos[0] || null;
      this.turnoAtual = 0;
    }
  }

  /**
   * Avança para o próximo turno
   */
  proximoTurno(): void {
    if (this.ordemTurnos.length === 0) return;

    // Marcar participante atual como já tendo agido
    if (this.participanteAtivo) {
      const participante = this.participantes.get(this.participanteAtivo);
      if (participante) {
        participante.jaAgiu = true;
      }
    }

    // Avançar índice do turno
    this.turnoAtual++;

    // Se chegou ao fim da rodada, iniciar nova rodada
    if (this.turnoAtual >= this.ordemTurnos.length) {
      this.novaRodada();
      return;
    }

    // Definir próximo participante
    this.participanteAtivo = this.ordemTurnos[this.turnoAtual] || null;
  }

  /**
   * Inicia uma nova rodada
   */
  private novaRodada(): void {
    this.rodadaAtual++;
    this.turnoAtual = 0;

    // Resetar estado "já agiu" de todos os participantes
    this.participantes.forEach((participante) => {
      participante.jaAgiu = false;
    });

    // Definir primeiro participante da nova rodada
    if (this.ordemTurnos.length > 0) {
      this.participanteAtivo = this.ordemTurnos[0] || null;
    }
  }

  /**
   * Pausa/despausa o sistema de turnos
   */
  alternarPausa(): void {
    this.pausado = !this.pausado;
  }

  /**
   * Obtém o participante ativo atual
   */
  obterParticipanteAtivo(): ParticipanteTurno | null {
    if (!this.participanteAtivo) return null;
    return this.participantes.get(this.participanteAtivo) || null;
  }

  /**
   * Obtém informações de um participante
   */
  obterParticipante(id: string): ParticipanteTurno | null {
    return this.participantes.get(id) || null;
  }

  /**
   * Lista todos os participantes
   */
  listarParticipantes(): ParticipanteTurno[] {
    return Array.from(this.participantes.values());
  }

  /**
   * Obtém a ordem atual dos turnos
   */
  obterOrdemTurnos(): string[] {
    return [...this.ordemTurnos];
  }

  /**
   * Registra uma ação no histórico
   */
  registrarAcao(acao: Omit<AcaoTurno, 'id' | 'timestamp' | 'turno' | 'rodada'>): void {
    const acaoCompleta: AcaoTurno = {
      ...acao,
      id: `acao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      turno: this.turnoAtual,
      rodada: this.rodadaAtual,
    };

    this.historicoAcoes.push(acaoCompleta);
  }

  /**
   * Obtém o histórico de ações
   */
  obterHistorico(): AcaoTurno[] {
    return [...this.historicoAcoes];
  }

  /**
   * Obtém ações da rodada atual
   */
  obterAcoesRodadaAtual(): AcaoTurno[] {
    return this.historicoAcoes.filter((acao) => acao.rodada === this.rodadaAtual);
  }

  /**
   * Reinicia o sistema de turnos
   */
  reiniciar(): void {
    this.turnoAtual = 0;
    this.rodadaAtual = 1;
    this.participanteAtivo = null;
    this.historicoAcoes = [];
    this.pausado = false;

    // Resetar estado dos participantes
    this.participantes.forEach((participante) => {
      participante.jaAgiu = false;
      participante.ativo = true;
    });

    this.reorganizarOrdem();
  }

  /**
   * Força o turno para um participante específico
   */
  forcarTurno(participanteId: string): void {
    if (!this.participantes.has(participanteId)) return;

    const index = this.ordemTurnos.indexOf(participanteId);
    if (index >= 0) {
      this.turnoAtual = index;
      this.participanteAtivo = participanteId;
    }
  }

  /**
   * Verifica se todos os participantes já agiram na rodada
   */
  todosJaAgiram(): boolean {
    return Array.from(this.participantes.values()).every((p) => !p.ativo || p.jaAgiu);
  }

  /**
   * Obtém estatísticas do sistema
   */
  obterEstatisticas(): Record<string, number> {
    const stats: Record<string, number> = {
      totalParticipantes: this.participantes.size,
      participantesAtivos: Array.from(this.participantes.values()).filter((p) => p.ativo).length,
      rodadaAtual: this.rodadaAtual,
      turnoAtual: this.turnoAtual,
      totalAcoes: this.historicoAcoes.length,
    };

    // Contar ações por participante
    const acoesPorParticipante: Record<string, number> = {};
    this.historicoAcoes.forEach((acao) => {
      acoesPorParticipante[acao.participante] = (acoesPorParticipante[acao.participante] || 0) + 1;
    });

    return { ...stats, ...acoesPorParticipante };
  }

  /**
   * Serializa estado para persistência
   */
  serializar(): Record<string, unknown> {
    // Converte o Map para objeto simples para evitar problemas de serialização
    const participantesObj: Record<string, ParticipanteTurno> = {};
    this.participantes.forEach((participante, id) => {
      participantesObj[id] = { ...participante };
    });

    return {
      participantes: participantesObj,
      ordemTurnos: [...this.ordemTurnos],
      turnoAtual: this.turnoAtual,
      rodadaAtual: this.rodadaAtual,
      participanteAtivo: this.participanteAtivo,
      historicoAcoes: [...this.historicoAcoes],
      pausado: this.pausado,
    };
  }

  /**
   * Carrega estado de dados serializados
   */
  static deserializar(dados: Record<string, unknown>): SistemaTurnos {
    const sistema = new SistemaTurnos();

    // Restaurar participantes do objeto
    if (dados.participantes && typeof dados.participantes === 'object') {
      const participantesObj = dados.participantes as Record<string, ParticipanteTurno>;
      Object.entries(participantesObj).forEach(([id, participante]) => {
        sistema.participantes.set(id, participante);
      });
    }

    if (Array.isArray(dados.ordemTurnos)) {
      sistema.ordemTurnos = dados.ordemTurnos as string[];
    }

    sistema.turnoAtual = (dados.turnoAtual as number) || 0;
    sistema.rodadaAtual = (dados.rodadaAtual as number) || 1;
    sistema.participanteAtivo = (dados.participanteAtivo as string | null) || null;
    sistema.pausado = Boolean(dados.pausado);

    if (Array.isArray(dados.historicoAcoes)) {
      sistema.historicoAcoes = dados.historicoAcoes as AcaoTurno[];
    }

    return sistema;
  }
}
