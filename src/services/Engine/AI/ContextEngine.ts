import type { Personagem } from '../../../domain/entities/Character/Personagem';
import type { SessaoJogo } from '../../../classes/SessaoJogo';
import type { MCPContext } from '../../../mcp/MCPTypes';
import type { Mensagem, MensagemAcao, MensagemFala } from '../../../types';

export interface ContextoCompleto extends MCPContext {
  historico: HistoricoResumo;
  relacionamentos: Relacionamentos;
  objetivos: Objetivos;
  mundo: ContextoMundo;
}

export interface HistoricoResumo {
  eventosImportantes: EventoImportante[];
  decisoesAnteriores: DecisaoAnterior[];
  resultadosAcoes: ResultadoAcao[];
  conversasRelevantes: ConversaRelevante[];
}

export interface EventoImportante {
  id: string;
  descricao: string;
  timestamp: Date;
  participantes: string[];
  impacto: 'baixo' | 'medio' | 'alto';
  tags: string[];
}

export interface DecisaoAnterior {
  decisao: string;
  contexto: string;
  resultado: 'sucesso' | 'falha' | 'parcial';
  aprendizado: string;
  timestamp: Date;
}

export interface ResultadoAcao {
  acao: string;
  parametros: Record<string, unknown>;
  sucesso: boolean;
  efeitos: string[];
  timestamp: Date;
}

export interface ConversaRelevante {
  participantes: string[];
  resumo: string;
  temas: string[];
  timestamp: Date;
}

export interface Relacionamentos {
  aliados: RelacionamentoPersonagem[];
  inimigos: RelacionamentoPersonagem[];
  neutros: RelacionamentoPersonagem[];
  historico: InteracaoRelacionamento[];
}

export interface RelacionamentoPersonagem {
  personagemId: string;
  nome: string;
  nivel: number; // -10 (inimigo) a +10 (aliado)
  confianca: number; // 0 a 10
  respeito: number; // 0 a 10
  caracteristicas: string[];
}

export interface InteracaoRelacionamento {
  personagemId: string;
  tipo: 'positiva' | 'negativa' | 'neutra';
  descricao: string;
  impacto: number; // -5 a +5
  timestamp: Date;
}

export interface Objetivos {
  principais: Objetivo[];
  secundarios: Objetivo[];
  pessoais: Objetivo[];
  completados: Objetivo[];
}

export interface Objetivo {
  id: string;
  descricao: string;
  prioridade: number; // 1 a 10
  prazo?: Date;
  status: 'ativo' | 'pausado' | 'completado' | 'falhado';
  progresso: number; // 0 a 100
  prerequisitos: string[];
  recompensas: string[];
}

export interface ContextoMundo {
  localizacao: Localizacao;
  tempo: TempoJogo;
  clima: string;
  eventos: EventoMundo[];
  npcs: NPCContexto[];
  perigos: Perigo[];
}

export interface Localizacao {
  nome: string;
  tipo: string;
  descricao: string;
  saidas: string[];
  pontos_interesse: string[];
  recursos_disponiveis: string[];
}

export interface TempoJogo {
  hora: number;
  dia: number;
  mes: string;
  ano: number;
  estacao: string;
  turno_combate?: number;
}

export interface EventoMundo {
  nome: string;
  descricao: string;
  ativo: boolean;
  efeitos: string[];
}

export interface NPCContexto {
  id: string;
  nome: string;
  funcao: string;
  disposicao: 'amigavel' | 'neutro' | 'hostil';
  localizacao: string;
  disponibilidade: boolean;
}

export interface Perigo {
  tipo: string;
  nivel: number; // 1 a 10
  descricao: string;
  ativo: boolean;
}

/**
 * Constrói contexto completo para a IA
 * Centraliza toda a lógica de coleta e formatação de contexto
 */
export class ContextBuilder {
  private static instance: ContextBuilder;

  private constructor() {}

  static getInstance(): ContextBuilder {
    if (!ContextBuilder.instance) {
      ContextBuilder.instance = new ContextBuilder();
    }
    return ContextBuilder.instance;
  }

  /**
   * Constrói contexto completo para um personagem IA
   */
  construirContextoCompleto(
    personagem: Personagem,
    sessao: SessaoJogo,
    incluirHistoricoCompleto = false,
  ): ContextoCompleto {
    const contextoBase = this.construirContextoBase(personagem, sessao);

    return {
      ...contextoBase,
      historico: this.construirHistorico(sessao, incluirHistoricoCompleto),
      relacionamentos: this.construirRelacionamentos(personagem, sessao),
      objetivos: this.construirObjetivos(personagem),
      mundo: this.construirContextoMundo(sessao),
    };
  }

  /**
   * Constrói contexto básico do MCP
   */
  construirContextoBase(personagem: Personagem, sessao: SessaoJogo): MCPContext {
    return {
      sessionId: sessao.id,
      personagemId: personagem.id,
      turno: sessao.turnoAtualIndex,
      rodada: sessao.rodadaAtual,
      ambiente: this.obterDescricaoAmbiente(sessao),
      participantes: this.obterParticipantes(sessao),
      equipamentosDisponiveis: this.obterEquipamentos(personagem),
      itensDisponiveis: this.obterItens(personagem),
      statusPersonagem: this.obterStatusPersonagem(personagem),
    };
  }

  /**
   * Constrói resumo do histórico
   */
  private construirHistorico(sessao: SessaoJogo, completo: boolean): HistoricoResumo {
    const limite = completo ? 100 : 10;
    const mensagens = sessao.getMensagensRecentes(limite);

    return {
      eventosImportantes: this.extrairEventosImportantes(mensagens),
      decisoesAnteriores: this.extrairDecisoes(mensagens),
      resultadosAcoes: this.extrairResultados(mensagens),
      conversasRelevantes: this.extrairConversas(mensagens),
    };
  }

  /**
   * Constrói mapa de relacionamentos
   */
  private construirRelacionamentos(personagem: Personagem, sessao: SessaoJogo): Relacionamentos {
    // Em uma implementação real, isso viria de um sistema persistente
    const relacionamentos: Relacionamentos = {
      aliados: [],
      inimigos: [],
      neutros: [],
      historico: [],
    };

    // Analisar participantes da sessão
    sessao.getParticipantes().forEach((participanteId) => {
      if (participanteId !== personagem.id) {
        const rel: RelacionamentoPersonagem = {
          personagemId: participanteId,
          nome: `Personagem_${participanteId}`, // Em uma implementação real, seria obtido do personagem
          nivel: 0,
          confianca: 5,
          respeito: 5,
          caracteristicas: [],
        };

        relacionamentos.neutros.push(rel);
      }
    });

    return relacionamentos;
  }

  /**
   * Constrói lista de objetivos
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private construirObjetivos(personagem: Personagem): Objetivos {
    // Em uma implementação real, isso viria de um sistema de quests
    return {
      principais: [],
      secundarios: [],
      pessoais: [],
      completados: [],
    };
  }

  /**
   * Constrói contexto do mundo
   */
  private construirContextoMundo(sessao: SessaoJogo): ContextoMundo {
    return {
      localizacao: {
        nome: 'Local Genérico',
        tipo: 'área',
        descricao: 'Um local onde a aventura acontece',
        saidas: ['norte', 'sul', 'leste', 'oeste'],
        pontos_interesse: [],
        recursos_disponiveis: [],
      },
      tempo: {
        hora: new Date().getHours(),
        dia: new Date().getDate(),
        mes: 'Mês Atual',
        ano: 2024,
        estacao: 'verão',
        turno_combate: sessao.rodadaAtual,
      },
      clima: 'tempereado',
      eventos: [],
      npcs: [],
      perigos: [],
    };
  }

  /**
   * Formata contexto para prompt de IA
   */
  formatarParaPrompt(contexto: ContextoCompleto): string {
    const seções: string[] = [];

    // Informações básicas
    seções.push(`TURNO: ${contexto.turno} | RODADA: ${contexto.rodada}`);
    seções.push(`AMBIENTE: ${contexto.ambiente}`);
    seções.push(`PARTICIPANTES: ${contexto.participantes.join(', ')}`);

    // Status do personagem
    seções.push(`STATUS PERSONAGEM:`);
    const status = contexto.statusPersonagem;
    seções.push(
      `HP: ${String(status.hp)} | MP: ${String(status.mp)} | Nível: ${String(status.nivel)} | CA: ${String(status.ca)}`,
    );
    seções.push(`Iniciativa: ${String(status.iniciativa)}`);

    // Atributos
    seções.push(`ATRIBUTOS:`);
    const attrs = status.atributos as Record<string, number>;
    const mods = status.modificadores as Record<string, number>;
    if (attrs && mods) {
      Object.keys(attrs).forEach((attr) => {
        const modValue = mods[attr];
        if (modValue !== undefined) {
          seções.push(`${attr}: ${attrs[attr]} (mod: ${modValue >= 0 ? '+' : ''}${modValue})`);
        }
      });
    }

    // Conhecimentos do personagem
    const conhecimentos = status.conhecimentos as Array<{
      topico: string;
      conteudo: string;
      categoria: string;
      fonte: string;
    }>;
    if (conhecimentos && conhecimentos.length > 0) {
      seções.push(`CONHECIMENTOS DO PERSONAGEM:`);
      conhecimentos.forEach((conhecimento) => {
        seções.push(
          `- ${conhecimento.topico}: ${conhecimento.conteudo} (${conhecimento.categoria})`,
        );
      });
    }

    // Equipamentos e itens
    if (contexto.equipamentosDisponiveis.length > 0) {
      seções.push(`EQUIPAMENTOS: ${contexto.equipamentosDisponiveis.join(', ')}`);
    }
    if (contexto.itensDisponiveis.length > 0) {
      seções.push(`ITENS: ${contexto.itensDisponiveis.join(', ')}`);
    }

    // Relacionamentos importantes
    if (contexto.relacionamentos.aliados.length > 0) {
      seções.push(`ALIADOS: ${contexto.relacionamentos.aliados.map((a) => a.nome).join(', ')}`);
    }
    if (contexto.relacionamentos.inimigos.length > 0) {
      seções.push(`INIMIGOS: ${contexto.relacionamentos.inimigos.map((i) => i.nome).join(', ')}`);
    }

    // Objetivos ativos
    const objetivosAtivos = contexto.objetivos.principais.filter((o) => o.status === 'ativo');
    if (objetivosAtivos.length > 0) {
      seções.push(`OBJETIVOS:`);
      objetivosAtivos.forEach((obj) => {
        seções.push(`- ${obj.descricao} (${obj.progresso}%)`);
      });
    }

    // Eventos importantes recentes
    if (contexto.historico.eventosImportantes.length > 0) {
      seções.push(`EVENTOS RECENTES:`);
      contexto.historico.eventosImportantes.slice(-3).forEach((evento) => {
        seções.push(`- ${evento.descricao}`);
      });
    }

    return seções.join('\n\n');
  }

  // Métodos auxiliares para extrair informações

  private obterDescricaoAmbiente(sessao: SessaoJogo): string {
    return sessao.contextoAtual || 'Ambiente de RPG';
  }

  private obterParticipantes(sessao: SessaoJogo): string[] {
    return sessao.getParticipantes().map((id) => `Personagem_${id}`); // Em uma implementação real, seria obtido do personagem
  }

  private obterEquipamentos(personagem: Personagem): string[] {
    const equipamentos: string[] = [];

    if (personagem.data?.equipamentos) {
      personagem.data.equipamentos.forEach(([slot, itemId]) => {
        equipamentos.push(`${slot}: ${itemId}`); // Em uma implementação real, seria obtido o nome do item
      });
    }

    return equipamentos;
  }

  private obterItens(personagem: Personagem): string[] {
    if (!personagem.data?.inventario) return [];

    return personagem.data.inventario.map(([itemId, quantidade]) => `${itemId} (x${quantidade})`); // Em uma implementação real, seria obtido o nome do item
  }

  private obterStatusPersonagem(personagem: Personagem): Record<string, unknown> {
    if (!personagem.data || !personagem.atributos) {
      return {};
    }

    const attrs = personagem.atributos;
    return {
      hp: personagem.data.atributos.derivados.hp,
      mp: personagem.data.atributos.derivados.mp,
      nivel: personagem.nivel,
      ca: personagem.data.atributos.derivados.ca,
      iniciativa: personagem.data.atributos.derivados.iniciativa,
      atributos: {
        força: attrs.forca,
        destreza: attrs.destreza,
        constituição: attrs.constituicao,
        inteligência: attrs.inteligencia,
        sabedoria: attrs.sabedoria,
        carisma: attrs.carisma,
      },
      modificadores: {
        força: attrs.getModificador('forca'),
        destreza: attrs.getModificador('destreza'),
        constituição: attrs.getModificador('constituicao'),
        inteligência: attrs.getModificador('inteligencia'),
        sabedoria: attrs.getModificador('sabedoria'),
        carisma: attrs.getModificador('carisma'),
      },
      conhecimentos: personagem.data.conhecimentos,
    };
  }

  private extrairEventosImportantes(mensagens: Mensagem[]): EventoImportante[] {
    // Implementação simplificada - em uma versão real seria mais sofisticada
    return mensagens
      .filter((m): m is MensagemAcao => m.tipo === 'acao' && !m.sucesso)
      .map((m, index) => ({
        id: `evento_${index}`,
        descricao: `${m.personagem} falhou em: ${m.acao}`,
        timestamp: m.timestamp || new Date(),
        participantes: [m.personagem],
        impacto: 'medio' as const,
        tags: ['falha', 'acao'],
      }));
  }

  private extrairDecisoes(mensagens: Mensagem[]): DecisaoAnterior[] {
    return mensagens
      .filter((m): m is MensagemAcao => m.tipo === 'acao')
      .map((m) => ({
        decisao: m.acao || 'Ação desconhecida',
        contexto: 'Contexto da decisão',
        resultado: m.sucesso ? ('sucesso' as const) : ('falha' as const),
        aprendizado: m.sucesso ? 'Ação bem-sucedida' : 'Ação falhou',
        timestamp: m.timestamp || new Date(),
      }));
  }

  private extrairResultados(mensagens: Mensagem[]): ResultadoAcao[] {
    return mensagens
      .filter((m): m is MensagemAcao => m.tipo === 'acao')
      .map((m) => ({
        acao: m.acao || 'Ação desconhecida',
        parametros: {}, // MCP params would be stored elsewhere in a real implementation
        sucesso: m.sucesso || false,
        efeitos: [m.resultado], // Use resultado as effect
        timestamp: m.timestamp || new Date(),
      }));
  }

  private extrairConversas(mensagens: Mensagem[]): ConversaRelevante[] {
    const conversas: ConversaRelevante[] = [];
    let conversaAtual: MensagemFala[] = [];
    const participantesAtuais = new Set<string>();

    mensagens.forEach((m) => {
      if (m.tipo === 'fala') {
        conversaAtual.push(m);
        participantesAtuais.add(m.personagem);
      } else {
        if (conversaAtual.length > 1 && conversaAtual[0]) {
          conversas.push({
            participantes: Array.from(participantesAtuais),
            resumo: `Conversa entre ${Array.from(participantesAtuais).join(', ')}`,
            temas: ['geral'],
            timestamp: conversaAtual[0].timestamp || new Date(),
          });
        }
        conversaAtual = [];
        participantesAtuais.clear();
      }
    });

    return conversas;
  }
}
