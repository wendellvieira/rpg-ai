import { OpenAIService, type MensagemIA } from './OpenAIService';
import { MCPHandler } from '../mcp/MCPHandler';
import type { MCPContext, MCPRequest } from '../mcp/MCPTypes';
import type { Personagem } from '../domain/entities/Character/Personagem';
import type { SessaoJogo } from '../classes/SessaoJogo';

export interface ConfiguracaoIAPersonagem {
  personagem: Personagem;
  sessao: SessaoJogo;
  frequenciaAcao: number; // Em segundos
  agressividade: 'baixa' | 'media' | 'alta';
  criatividade: 'baixa' | 'media' | 'alta';
  colaborativo: boolean;
}

export interface EstadoIAPersonagem {
  ativo: boolean;
  esperandoTurno: boolean;
  ultimaAcao: Date | null;
  proximaAcaoAgendada: Date | null;
  tentativasAcao: number;
}

/**
 * Wrapper para personagens controlados por IA
 * Gerencia a tomada de decisões autônomas usando OpenAI + MCP
 */
export class IAPersonagem {
  private personagem: Personagem;
  private sessao: SessaoJogo;
  private configuracao: ConfiguracaoIAPersonagem;
  private estado: EstadoIAPersonagem;
  private mcp: MCPHandler;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(config: ConfiguracaoIAPersonagem) {
    this.personagem = config.personagem;
    this.sessao = config.sessao;
    this.configuracao = config;
    this.mcp = MCPHandler.getInstance();

    this.estado = {
      ativo: false,
      esperandoTurno: false,
      ultimaAcao: null,
      proximaAcaoAgendada: null,
      tentativasAcao: 0,
    };

    if (!this.personagem.isIA) {
      throw new Error('Personagem deve ser do tipo IA');
    }
  }

  /**
   * Ativa o personagem IA
   */
  ativar(): void {
    // A verificação de configuração agora é feita na primeira chamada da API
    this.estado.ativo = true;
    this.agendarProximaVerificacao();
  }

  /**
   * Desativa o personagem IA
   */
  desativar(): void {
    this.estado.ativo = false;
    this.estado.esperandoTurno = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Notifica que é o turno do personagem
   */
  notificarTurno(): void {
    if (!this.estado.ativo) return;

    this.estado.esperandoTurno = true;
    this.estado.tentativasAcao = 0;

    // Processa turno imediatamente
    void this.processarTurno();
  }

  /**
   * Processa o turno do personagem IA
   */
  private async processarTurno(): Promise<void> {
    if (!this.estado.ativo || !this.estado.esperandoTurno) return;

    try {
      this.estado.tentativasAcao++;

      // Constrói contexto atual
      const contexto = this.construirContexto();

      // Gera decisão usando IA
      const decisao = await this.gerarDecisao(contexto);

      // Executa ação via MCP
      const resultado = await this.executarAcao(decisao, contexto);

      // Atualiza estado
      this.estado.ultimaAcao = new Date();
      this.estado.esperandoTurno = false;
      this.estado.tentativasAcao = 0;

      // Registra resultado na sessão
      this.registrarResultado(resultado);
    } catch (error) {
      console.error(`Erro no turno do personagem IA ${this.personagem.nome}:`, error);

      if (this.estado.tentativasAcao < 3) {
        // Tenta novamente após um delay
        setTimeout(() => void this.processarTurno(), 2000);
      } else {
        // Desiste e passa o turno
        this.estado.esperandoTurno = false;
        this.estado.tentativasAcao = 0;
        this.passarTurno();
      }
    }
  }

  /**
   * Constrói contexto atual para a IA
   */
  private construirContexto(): MCPContext {
    return {
      sessionId: this.sessao.id,
      personagemId: this.personagem.id,
      turno: this.sessao.turnoAtualIndex,
      rodada: this.sessao.rodadaAtual,
      ambiente: this.obterDescricaoAmbiente(),
      participantes: this.obterParticipantes(),
      equipamentosDisponiveis: this.obterEquipamentosDisponiveis(),
      itensDisponiveis: this.obterItensDisponiveis(),
      statusPersonagem: this.obterStatusPersonagem(),
    };
  }

  /**
   * Gera decisão usando OpenAI
   */
  private async gerarDecisao(
    contexto: MCPContext,
  ): Promise<{ funcao: string; parametros: Record<string, unknown> }> {
    const prompt = this.construirPromptDecisao(contexto);
    const funcoesDisponiveis = this.mcp.getAvailableFunctions();

    const mensagens: MensagemIA[] = [
      {
        role: 'system',
        content: this.construirPromptSistema(funcoesDisponiveis),
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const resposta = await OpenAIService.enviarMensagens(mensagens);

    return this.parsearDecisao(resposta.conteudo);
  }

  /**
   * Constrói prompt do sistema para IA
   */
  private construirPromptSistema(
    funcoes: ReturnType<typeof this.mcp.getAvailableFunctions>,
  ): string {
    const funcoesTexto = funcoes.map((f) => `- ${f.name}: ${f.description}`).join('\n');

    return `Você é um personagem de RPG controlado por IA.

PERSONALIDADE: ${this.personagem.promptPersonalidade || 'Personagem padrão'}

FUNÇÕES DISPONÍVEIS:
${funcoesTexto}

INSTRUÇÕES:
- Você deve tomar decisões baseadas na sua personalidade
- Considere o contexto atual da situação
- Responda SEMPRE no formato JSON: {"funcao": "nome_da_funcao", "parametros": {...}}
- Seja coerente com a situação e seus objetivos
- Se não souber o que fazer, use a função "esperar"

CONFIGURAÇÃO:
- Agressividade: ${this.configuracao.agressividade}
- Criatividade: ${this.configuracao.criatividade}
- Colaborativo: ${this.configuracao.colaborativo ? 'Sim' : 'Não'}`;
  }

  /**
   * Constrói prompt de decisão específico
   */
  private construirPromptDecisao(contexto: MCPContext): string {
    const mensagensRecentes = this.sessao.getMensagensRecentes(5);
    const historico = mensagensRecentes
      .map((m) => {
        if (m.tipo === 'fala') {
          return `${m.personagem}: "${m.conteudo}"`;
        } else if (m.tipo === 'acao') {
          return `${m.personagem} fez: ${m.acao} (${m.sucesso ? 'sucesso' : 'falha'})`;
        }
        return `Sistema: ${m.conteudo}`;
      })
      .join('\n');

    // Construir seção de conhecimentos do personagem
    const conhecimentos = this.personagem.data?.conhecimentos || [];
    let secaoConhecimentos = '';
    if (conhecimentos.length > 0) {
      secaoConhecimentos = `\nCONHECIMENTOS DO SEU PERSONAGEM:
${conhecimentos.map((c) => `- ${c.topico}: ${c.conteudo} (categoria: ${c.categoria})`).join('\n')}`;
    }

    return `SITUAÇÃO ATUAL:
Turno: ${contexto.turno} | Rodada: ${contexto.rodada}
Ambiente: ${contexto.ambiente}
Participantes: ${contexto.participantes.join(', ')}

HISTÓRICO RECENTE:
${historico}

STATUS DO PERSONAGEM:
${JSON.stringify(contexto.statusPersonagem, null, 2)}

EQUIPAMENTOS DISPONÍVEIS: ${contexto.equipamentosDisponiveis.join(', ')}
ITENS DISPONÍVEIS: ${contexto.itensDisponiveis.join(', ')}${secaoConhecimentos}

O que você vai fazer neste turno? Responda em JSON.`;
  }

  /**
   * Parseia resposta da IA em decisão estruturada
   */
  private parsearDecisao(resposta: string): {
    funcao: string;
    parametros: Record<string, unknown>;
  } {
    try {
      // Remove possível texto antes/depois do JSON
      const match = resposta.match(/\{.*\}/s);
      if (!match) {
        throw new Error('JSON não encontrado na resposta');
      }

      const decisao = JSON.parse(match[0]);

      if (!decisao.funcao) {
        throw new Error('Campo "funcao" não encontrado');
      }

      return {
        funcao: decisao.funcao,
        parametros: decisao.parametros || {},
      };
    } catch (error) {
      console.warn('Erro ao parsear decisão da IA, usando ação padrão:', error);

      // Ação padrão em caso de erro
      return {
        funcao: 'esperar',
        parametros: { duracao: 1 },
      };
    }
  }

  /**
   * Executa ação via MCP
   */
  private async executarAcao(
    decisao: { funcao: string; parametros: Record<string, unknown> },
    contexto: MCPContext,
  ): Promise<unknown> {
    const request: MCPRequest = {
      id: `ia_${this.personagem.id}_${Date.now()}`,
      method: decisao.funcao,
      params: decisao.parametros,
      timestamp: new Date(),
    };

    const response = await this.mcp.processRequest(request, contexto);

    if (!response.success) {
      throw new Error(`Ação falhou: ${response.error}`);
    }

    return response.result;
  }

  /**
   * Registra resultado na sessão
   */
  private registrarResultado(resultado: unknown): void {
    // Em uma implementação real, isso integraria com o sistema de mensagens da sessão
    console.log(`IA ${this.personagem.nome} executou ação:`, resultado);
  }

  /**
   * Passa o turno automaticamente
   */
  private passarTurno(): void {
    // Em uma implementação real, isso integraria com o sistema de turnos
    console.log(`IA ${this.personagem.nome} passou o turno`);
  }

  /**
   * Agenda próxima verificação
   */
  private agendarProximaVerificacao(): void {
    if (!this.estado.ativo) return;

    const delay = this.configuracao.frequenciaAcao * 1000;
    this.estado.proximaAcaoAgendada = new Date(Date.now() + delay);

    this.timeoutId = setTimeout(() => {
      if (this.estado.ativo && !this.estado.esperandoTurno) {
        // Verifica se deve tomar alguma ação autônoma
        void this.verificarAcaoAutonoma();
      }
      this.agendarProximaVerificacao();
    }, delay);
  }

  /**
   * Verifica se deve tomar ação autônoma (fora do turno)
   */
  private async verificarAcaoAutonoma(): Promise<void> {
    // Ações autônomas como falar, observar, etc.
    // Por agora, apenas ações sociais simples

    if (Math.random() < 0.1) {
      // 10% de chance
      try {
        const contexto = this.construirContexto();
        const request: MCPRequest = {
          id: `ia_auto_${this.personagem.id}_${Date.now()}`,
          method: 'falar',
          params: {
            conteudo: await this.gerarFalaAleatoria(),
            tom: 'casual',
          },
          timestamp: new Date(),
        };

        await this.mcp.processRequest(request, contexto);
      } catch (error) {
        console.warn('Erro em ação autônoma:', error);
      }
    }
  }

  /**
   * Gera fala aleatória contextual
   */
  private async gerarFalaAleatoria(): Promise<string> {
    const mensagens: MensagemIA[] = [
      {
        role: 'system',
        content: `Você é ${this.personagem.nome}. Gere uma fala curta e contextual (máximo 1 frase) baseada na sua personalidade: ${this.personagem.promptPersonalidade}`,
      },
      {
        role: 'user',
        content: 'Diga algo apropriado para o momento.',
      },
    ];

    const resposta = await OpenAIService.enviarMensagens(mensagens);
    return resposta.conteudo.trim().replace(/['"]/g, '');
  }

  // Métodos auxiliares para obter informações do contexto
  private obterDescricaoAmbiente(): string {
    return 'Ambiente genérico'; // Seria obtido do contexto real
  }

  private obterParticipantes(): string[] {
    return ['participante1', 'participante2']; // Seria obtido da sessão real
  }

  private obterEquipamentosDisponiveis(): string[] {
    return ['espada', 'escudo']; // Seria obtido do personagem real
  }

  private obterItensDisponiveis(): string[] {
    return ['poção de cura', 'pergaminho']; // Seria obtido do inventário real
  }

  private obterStatusPersonagem(): Record<string, unknown> {
    return {
      hp: 100,
      mp: 50,
      estado: 'normal',
    }; // Seria obtido do personagem real
  }

  /**
   * Getters para estado e configuração
   */
  get isAtivo(): boolean {
    return this.estado.ativo;
  }
  get isEsperandoTurno(): boolean {
    return this.estado.esperandoTurno;
  }
  get ultimaAcao(): Date | null {
    return this.estado.ultimaAcao;
  }
  get configuracaoAtual(): ConfiguracaoIAPersonagem {
    return { ...this.configuracao };
  }
  get estadoAtual(): EstadoIAPersonagem {
    return { ...this.estado };
  }

  /**
   * Atualiza configuração
   */
  atualizarConfiguracao(novaConfig: Partial<ConfiguracaoIAPersonagem>): void {
    this.configuracao = { ...this.configuracao, ...novaConfig };
  }

  /**
   * Força ação específica
   */
  async forcarAcao(funcao: string, parametros: Record<string, unknown>): Promise<unknown> {
    const contexto = this.construirContexto();
    const request: MCPRequest = {
      id: `ia_forcada_${this.personagem.id}_${Date.now()}`,
      method: funcao,
      params: parametros,
      timestamp: new Date(),
    };

    const response = await this.mcp.processRequest(request, contexto);

    if (!response.success) {
      throw new Error(`Ação forçada falhou: ${response.error}`);
    }

    return response.result;
  }

  /**
   * Obtém estatísticas da IA
   */
  obterEstatisticas(): {
    tempoAtivo: number;
    totalAcoes: number;
    ultimaAtividade: Date | null;
    eficiencia: number;
  } {
    return {
      tempoAtivo: this.estado.ativo
        ? Date.now() - (this.estado.ultimaAcao?.getTime() || Date.now())
        : 0,
      totalAcoes: 0, // Seria rastreado em implementação real
      ultimaAtividade: this.estado.ultimaAcao,
      eficiencia: this.estado.tentativasAcao > 0 ? 1 / this.estado.tentativasAcao : 1,
    };
  }
}
