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

  /**
   * Adiciona participante ao sistema de turnos
   */
  adicionarParticipante(participante: ParticipanteTurno): void {
    this.participantes.set(participante.id, { ...participante });
    this.recalcularOrdem();
  }

  /**
   * Remove participante do sistema
   */
  removerParticipante(participanteId: string): void {
    this.participantes.delete(participanteId);
    this.recalcularOrdem();

    // Se era o participante ativo, avança para o próximo
    if (this.participanteAtivo === participanteId) {
      this.proximoTurno();
    }
  }

  /**
   * Atualiza dados de um participante
   */
  atualizarParticipante(participanteId: string, dados: Partial<ParticipanteTurno>): void {
    const participante = this.participantes.get(participanteId);
    if (participante) {
      Object.assign(participante, dados);

      // Se mudou a iniciativa, recalcula ordem
      if ('iniciativa' in dados) {
        this.recalcularOrdem();
      }
    }
  }

  /**
   * Recalcula ordem dos turnos baseada na iniciativa
   */
  private recalcularOrdem(): void {
    this.ordemTurnos = Array.from(this.participantes.entries())
      .filter(([, p]) => p.ativo)
      .sort(([, a], [, b]) => b.iniciativa - a.iniciativa)
      .map(([id]) => id);
  }

  /**
   * Inicia o sistema de turnos
   */
  iniciar(): void {
    if (this.ordemTurnos.length === 0) {
      throw new Error('Nenhum participante ativo para iniciar turnos');
    }

    this.turnoAtual = 0;
    this.rodadaAtual = 1;
    this.participanteAtivo = this.ordemTurnos[0] ?? null;
    this.pausado = false;
    this.resetarAcoesTurno();
  }

  /**
   * Pausa o sistema de turnos
   */
  pausar(): void {
    this.pausado = true;
  }

  /**
   * Retoma o sistema de turnos
   */
  retomar(): void {
    this.pausado = false;
  }

  /**
   * Avança para o próximo turno
   */
  proximoTurno(): void {
    if (this.pausado) return;

    // Marca participante atual como tendo agido
    if (this.participanteAtivo) {
      const participante = this.participantes.get(this.participanteAtivo);
      if (participante) {
        participante.jaAgiu = true;
      }
    }

    this.turnoAtual++;

    // Se passou de todos os participantes, nova rodada
    if (this.turnoAtual >= this.ordemTurnos.length) {
      this.novaRodada();
    } else {
      this.participanteAtivo = this.ordemTurnos[this.turnoAtual] ?? null;
    }
  }

  /**
   * Força o fim do turno atual
   */
  finalizarTurno(): void {
    this.proximoTurno();
  }

  /**
   * Inicia nova rodada
   */
  private novaRodada(): void {
    this.rodadaAtual++;
    this.turnoAtual = 0;
    this.participanteAtivo = this.ordemTurnos[0] ?? null;
    this.resetarAcoesTurno();
  }

  /**
   * Reseta flags de ação de todos os participantes
   */
  private resetarAcoesTurno(): void {
    for (const participante of this.participantes.values()) {
      participante.jaAgiu = false;
    }
  }

  /**
   * Registra uma ação no turno
   */
  registrarAcao(acao: Omit<AcaoTurno, 'id' | 'timestamp' | 'turno' | 'rodada'>): void {
    const acaoCompleta: AcaoTurno = {
      ...acao,
      id: this.gerarIdAcao(),
      timestamp: new Date(),
      turno: this.turnoAtual,
      rodada: this.rodadaAtual,
    };

    this.historicoAcoes.push(acaoCompleta);
  }

  /**
   * Gera ID único para ação
   */
  private gerarIdAcao(): string {
    return `acao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém participante ativo atual
   */
  getParticipanteAtivo(): ParticipanteTurno | null {
    return this.participanteAtivo ? (this.participantes.get(this.participanteAtivo) ?? null) : null;
  }

  /**
   * Obtém todos os participantes
   */
  getParticipantes(): ParticipanteTurno[] {
    return Array.from(this.participantes.values());
  }

  /**
   * Obtém participantes ativos
   */
  getParticipantesAtivos(): ParticipanteTurno[] {
    return Array.from(this.participantes.values()).filter((p) => p.ativo);
  }

  /**
   * Obtém ordem atual dos turnos
   */
  getOrdemTurnos(): string[] {
    return [...this.ordemTurnos];
  }

  /**
   * Obtém número do turno atual
   */
  getTurnoAtual(): number {
    return this.turnoAtual;
  }

  /**
   * Obtém número da rodada atual
   */
  getRodadaAtual(): number {
    return this.rodadaAtual;
  }

  /**
   * Verifica se está pausado
   */
  estaPausado(): boolean {
    return this.pausado;
  }

  /**
   * Verifica se é o turno de um participante específico
   */
  ehTurnoDe(participanteId: string): boolean {
    return this.participanteAtivo === participanteId && !this.pausado;
  }

  /**
   * Obtém próximo participante na ordem
   */
  getProximoParticipante(): ParticipanteTurno | null {
    const proximoIndice = (this.turnoAtual + 1) % this.ordemTurnos.length;
    const proximoId = this.ordemTurnos[proximoIndice];
    return proximoId ? (this.participantes.get(proximoId) ?? null) : null;
  }

  /**
   * Obtém histórico de ações da rodada atual
   */
  getAcoesRodadaAtual(): AcaoTurno[] {
    return this.historicoAcoes.filter((acao) => acao.rodada === this.rodadaAtual);
  }

  /**
   * Obtém histórico completo de ações
   */
  getHistoricoAcoes(): AcaoTurno[] {
    return [...this.historicoAcoes];
  }

  /**
   * Limpa histórico de ações
   */
  limparHistorico(): void {
    this.historicoAcoes = [];
  }

  /**
   * Verifica se todos os participantes já agiram na rodada
   */
  todosAgiram(): boolean {
    return this.getParticipantesAtivos().every((p) => p.jaAgiu);
  }

  /**
   * Calcula estatísticas dos turnos
   */
  getEstatisticas(): {
    totalRodadas: number;
    totalTurnos: number;
    totalAcoes: number;
    participantesAtivos: number;
    acoesPorParticipante: Record<string, number>;
  } {
    const acoesPorParticipante: Record<string, number> = {};

    for (const acao of this.historicoAcoes) {
      acoesPorParticipante[acao.participante] = (acoesPorParticipante[acao.participante] || 0) + 1;
    }

    return {
      totalRodadas: this.rodadaAtual,
      totalTurnos: this.turnoAtual + (this.rodadaAtual - 1) * this.ordemTurnos.length,
      totalAcoes: this.historicoAcoes.length,
      participantesAtivos: this.getParticipantesAtivos().length,
      acoesPorParticipante,
    };
  }

  /**
   * Serializa o estado do sistema
   */
  serializar(): Record<string, unknown> {
    return {
      participantes: Array.from(this.participantes.entries()),
      ordemTurnos: this.ordemTurnos,
      turnoAtual: this.turnoAtual,
      rodadaAtual: this.rodadaAtual,
      participanteAtivo: this.participanteAtivo,
      historicoAcoes: this.historicoAcoes,
      pausado: this.pausado,
    };
  }

  /**
   * Carrega estado de dados serializados
   */
  static deserializar(dados: Record<string, unknown>): SistemaTurnos {
    const sistema = new SistemaTurnos();

    if (Array.isArray(dados.participantes)) {
      for (const [id, participante] of dados.participantes as Array<[string, ParticipanteTurno]>) {
        sistema.participantes.set(id, participante);
      }
    }

    if (Array.isArray(dados.ordemTurnos)) {
      sistema.ordemTurnos = dados.ordemTurnos as string[];
    }

    sistema.turnoAtual = (dados.turnoAtual as number) || 0;
    sistema.rodadaAtual = (dados.rodadaAtual as number) || 1;
    sistema.participanteAtivo = (dados.participanteAtivo as string) || null;
    sistema.historicoAcoes = (dados.historicoAcoes as AcaoTurno[]) || [];
    sistema.pausado = (dados.pausado as boolean) || false;

    return sistema;
  }
}
