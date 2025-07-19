import type {
  MCPFunction,
  MCPFunctionHandler,
  MCPContext,
  MCPActionResult,
  AtaqueResult,
  MagiaResult,
  MovimentoResult,
} from './MCPTypes';
import { Dados } from '../classes/Dados';

/**
 * Implementação das funções MCP disponíveis para as IAs
 */
export class MCPFunctions {
  private handlers: Map<string, MCPFunctionHandler> = new Map();

  constructor() {
    this.registrarFuncoes();
  }

  /**
   * Registra todas as funções MCP disponíveis
   */
  private registrarFuncoes(): void {
    // Funções de combate
    this.handlers.set('atacar', new AtacarHandler());
    this.handlers.set('defender', new DefenderHandler());
    this.handlers.set('aparar', new ApararHandler());

    // Funções de movimento
    this.handlers.set('mover', new MoverHandler());
    this.handlers.set('correr', new CorrerHandler());
    this.handlers.set('furtivo', new FurtivoHandler());

    // Funções de magia
    this.handlers.set('lancar_magia', new LancarMagiaHandler());
    this.handlers.set('cancelar_concentracao', new CancelarConcentracaoHandler());

    // Funções de itens
    this.handlers.set('usar_item', new UsarItemHandler());
    this.handlers.set('equipar', new EquiparHandler());
    this.handlers.set('desequipar', new DesequiparHandler());

    // Funções sociais
    this.handlers.set('falar', new FalarHandler());
    this.handlers.set('intimidar', new IntimidarHandler());
    this.handlers.set('persuadir', new PersuadirHandler());
    this.handlers.set('enganar', new EnganarHandler());

    // Funções utilitárias
    this.handlers.set('investigar', new InvestigarHandler());
    this.handlers.set('perceber', new PerceberHandler());
    this.handlers.set('ajudar', new AjudarHandler());
    this.handlers.set('esperar', new EsperarHandler());
  }

  /**
   * Obtém lista de todas as funções disponíveis
   */
  getFuncoes(): MCPFunction[] {
    return [
      // Combate
      {
        name: 'atacar',
        description: 'Realiza um ataque contra um alvo',
        category: 'combate',
        requiresTarget: true,
        parameters: [
          { name: 'alvo', type: 'string', description: 'ID do alvo', required: true },
          { name: 'arma', type: 'string', description: 'ID da arma (opcional)', required: false },
          {
            name: 'tipoAtaque',
            type: 'string',
            description: 'Tipo de ataque',
            required: true,
            enum: ['corpo_a_corpo', 'distancia', 'magia'],
          },
          {
            name: 'vantagem',
            type: 'boolean',
            description: 'Atacar com vantagem',
            required: false,
            default: false,
          },
          {
            name: 'desvantagem',
            type: 'boolean',
            description: 'Atacar com desvantagem',
            required: false,
            default: false,
          },
        ],
      },
      {
        name: 'defender',
        description: 'Assume postura defensiva',
        category: 'combate',
        parameters: [
          {
            name: 'tipoDefesa',
            type: 'string',
            description: 'Tipo de defesa',
            required: true,
            enum: ['esquiva', 'bloqueio', 'aparar'],
          },
          { name: 'item', type: 'string', description: 'Item usado na defesa', required: false },
        ],
      },

      // Movimento
      {
        name: 'mover',
        description: 'Move o personagem para uma posição',
        category: 'movimento',
        parameters: [
          { name: 'destino', type: 'string', description: 'Destino do movimento', required: true },
          {
            name: 'tipoMovimento',
            type: 'string',
            description: 'Tipo de movimento',
            required: false,
            enum: ['normal', 'corrida', 'furtivo', 'escalada'],
            default: 'normal',
          },
          { name: 'distancia', type: 'number', description: 'Distância em metros', required: true },
        ],
      },

      // Magia
      {
        name: 'lancar_magia',
        description: 'Lança uma magia',
        category: 'magia',
        parameters: [
          { name: 'magia', type: 'string', description: 'Nome da magia', required: true },
          { name: 'nivel', type: 'number', description: 'Nível da magia', required: true },
          { name: 'alvo', type: 'string', description: 'Alvo da magia', required: false },
          { name: 'slot', type: 'number', description: 'Slot de magia usado', required: false },
          {
            name: 'componentes',
            type: 'array',
            description: 'Componentes necessários',
            required: true,
          },
        ],
      },

      // Itens
      {
        name: 'usar_item',
        description: 'Usa um item do inventário',
        category: 'utilidade',
        requiresItem: true,
        parameters: [
          { name: 'item', type: 'string', description: 'ID do item', required: true },
          { name: 'alvo', type: 'string', description: 'Alvo do item', required: false },
          {
            name: 'quantidade',
            type: 'number',
            description: 'Quantidade a usar',
            required: false,
            default: 1,
          },
        ],
      },

      // Social
      {
        name: 'falar',
        description: 'Fala com outros personagens',
        category: 'social',
        parameters: [
          { name: 'conteudo', type: 'string', description: 'O que dizer', required: true },
          { name: 'alvo', type: 'string', description: 'Para quem falar', required: false },
          {
            name: 'tom',
            type: 'string',
            description: 'Tom da fala',
            required: false,
            enum: ['normal', 'sussurro', 'grito', 'formal', 'casual'],
          },
        ],
      },

      // Utilitário
      {
        name: 'investigar',
        description: 'Investiga uma área ou objeto',
        category: 'utilidade',
        parameters: [
          { name: 'alvo', type: 'string', description: 'O que investigar', required: true },
          { name: 'foco', type: 'string', description: 'Aspecto específico', required: false },
        ],
      },

      {
        name: 'esperar',
        description: 'Espera e observa por mudanças',
        category: 'utilidade',
        parameters: [
          {
            name: 'duracao',
            type: 'number',
            description: 'Turnos a esperar',
            required: false,
            default: 1,
          },
          { name: 'condicao', type: 'string', description: 'Condição para agir', required: false },
        ],
      },
    ];
  }

  /**
   * Executa uma função MCP
   */
  async executar(
    nome: string,
    params: Record<string, unknown>,
    context: MCPContext,
  ): Promise<MCPActionResult> {
    const handler = this.handlers.get(nome);

    if (!handler) {
      throw new Error(`Função MCP '${nome}' não encontrada`);
    }

    // Valida parâmetros
    const validacao = handler.validate(params);
    if (!validacao.valid) {
      throw new Error(`Parâmetros inválidos: ${validacao.errors.join(', ')}`);
    }

    // Executa a função
    return await handler.execute(params, context);
  }

  /**
   * Verifica se uma função existe
   */
  temFuncao(nome: string): boolean {
    return this.handlers.has(nome);
  }

  /**
   * Obtém handler de uma função
   */
  getHandler(nome: string): MCPFunctionHandler | undefined {
    return this.handlers.get(nome);
  }
}

/**
 * Handler para ataques
 */
class AtacarHandler implements MCPFunctionHandler {
  execute(params: Record<string, unknown>): Promise<AtaqueResult> {
    const alvo = params.alvo as string;
    const arma = params.arma as string | undefined;
    const vantagem = params.vantagem as boolean | undefined;
    const desvantagem = params.desvantagem as boolean | undefined;

    // Simula rolagem de ataque
    let rolagemAtaque = Dados.rolar('d20');

    if (vantagem && !desvantagem) {
      const segundaRolagem = Dados.rolar('d20');
      rolagemAtaque = rolagemAtaque.total >= segundaRolagem.total ? rolagemAtaque : segundaRolagem;
    } else if (desvantagem && !vantagem) {
      const segundaRolagem = Dados.rolar('d20');
      rolagemAtaque = rolagemAtaque.total <= segundaRolagem.total ? rolagemAtaque : segundaRolagem;
    }

    const hit = rolagemAtaque.total >= 10; // CA simplificada
    const critico = rolagemAtaque.resultados.includes(20);

    let dano = 0;
    let tipoDano = 'físico';

    if (hit) {
      const rolagemDano = Dados.rolar('d6');
      dano = rolagemDano.total;

      if (critico) {
        const danoExtra = Dados.rolar('d6');
        dano += danoExtra.total;
      }

      if (arma === 'espada') {
        const danoArma = Dados.rolar('d8');
        dano += danoArma.total;
        tipoDano = 'cortante';
      }
    }

    return {
      success: hit,
      hit,
      critico,
      dano,
      tipoDano,
      description: hit
        ? `Ataque ${critico ? 'crítico ' : ''}bem-sucedido contra ${alvo}, causando ${dano} pontos de dano ${tipoDano}`
        : `Ataque falhou contra ${alvo}`,
      effects: hit
        ? [
            {
              type: 'dano',
              target: alvo,
              value: dano,
              description: `${dano} de dano ${tipoDano}`,
            },
          ]
        : [],
      dados: {
        rolagem: rolagemAtaque.tipo,
        resultado: rolagemAtaque.resultados[0] || 0,
        modificadores: rolagemAtaque.modificador,
        total: rolagemAtaque.total,
      },
    };
  }

  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.alvo) {
      errors.push('Alvo é obrigatório');
    }

    if (
      params.tipoAtaque &&
      !['corpo_a_corpo', 'distancia', 'magia'].includes(params.tipoAtaque as string)
    ) {
      errors.push('Tipo de ataque inválido');
    }

    return { valid: errors.length === 0, errors };
  }

  getRequiredContext(): string[] {
    return ['personagemId', 'equipamentosDisponiveis'];
  }
}

/**
 * Handler para movimento
 */
class MoverHandler implements MCPFunctionHandler {
  execute(params: Record<string, unknown>, context: MCPContext): Promise<MovimentoResult> {
    const destino = params.destino as string;
    const tipoMovimento = (params.tipoMovimento as string) || 'normal';
    const distancia = params.distancia as number;

    const velocidadeBase = 9; // metros por turno
    let velocidade = velocidadeBase;

    if (tipoMovimento === 'corrida') {
      velocidade *= 2;
    } else if (tipoMovimento === 'furtivo') {
      velocidade /= 2;
    }

    const sucesso = distancia <= velocidade;
    const movimentoRestante = Math.max(0, velocidade - distancia);

    return Promise.resolve({
      success: sucesso,
      description: sucesso
        ? `Moveu-se ${distancia}m para ${destino} (${tipoMovimento})`
        : `Movimento falhou: distância muito grande (máximo ${velocidade}m)`,
      effects: sucesso
        ? [
            {
              type: 'movimento',
              target: context.personagemId,
              value: destino,
              description: `Moveu para ${destino}`,
            },
          ]
        : [],
      posicaoAnterior: 'posição_atual', // Seria obtido do contexto real
      novaPosicao: sucesso ? destino : 'posição_atual',
      distanciaPercorrida: sucesso ? distancia : 0,
      movimentoRestante,
    });
  }

  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.destino) {
      errors.push('Destino é obrigatório');
    }

    if (typeof params.distancia !== 'number' || params.distancia <= 0) {
      errors.push('Distância deve ser um número positivo');
    }

    return { valid: errors.length === 0, errors };
  }

  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}

// Implementações básicas para outros handlers
class DefenderHandler implements MCPFunctionHandler {
  execute(): Promise<MCPActionResult> {
    return Promise.resolve({
      success: true,
      description: 'Assumiu postura defensiva (+2 CA até próximo turno)',
      effects: [
        {
          type: 'status',
          target: 'self',
          value: 'defendendo',
          duration: 1,
          description: '+2 CA',
        },
      ],
    });
  }

  validate(): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }

  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}

class ApararHandler extends DefenderHandler {}
class CorrerHandler extends MoverHandler {}
class FurtivoHandler extends MoverHandler {}

class LancarMagiaHandler implements MCPFunctionHandler {
  execute(params: Record<string, unknown>): Promise<MagiaResult> {
    const magia = params.magia as string;
    const nivel = params.nivel as number;
    const alvo = params.alvo as string | undefined;

    // Simula lançamento de magia
    const sucesso = Math.random() > 0.1; // 90% de sucesso base

    return Promise.resolve({
      success: sucesso,
      description: sucesso
        ? `Lançou ${magia} (nível ${nivel})${alvo ? ` em ${alvo}` : ''}`
        : `Falhou ao lançar ${magia}`,
      effects: sucesso
        ? [
            {
              type: 'magia',
              target: alvo || 'self',
              value: magia,
              description: `Efeito de ${magia}`,
            },
          ]
        : [],
      magiaLancada: magia,
      slotsUsados: 1,
      componentsConsumidos: [],
      alcance: 9,
    });
  }

  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.magia) {
      errors.push('Nome da magia é obrigatório');
    }

    if (typeof params.nivel !== 'number' || params.nivel < 1 || params.nivel > 9) {
      errors.push('Nível da magia deve ser entre 1 e 9');
    }

    return { valid: errors.length === 0, errors };
  }

  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}

// Handlers simples para outras funções
class CancelarConcentracaoHandler implements MCPFunctionHandler {
  execute(): Promise<MCPActionResult> {
    return Promise.resolve({
      success: true,
      description: 'Concentração cancelada',
      effects: [
        {
          type: 'status',
          target: 'self',
          value: 'sem_concentracao',
          description: 'Cancelou concentração',
        },
      ],
    });
  }
  validate(): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }
  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}

class UsarItemHandler implements MCPFunctionHandler {
  execute(params: Record<string, unknown>): Promise<MCPActionResult> {
    const item = params.item as string;
    return Promise.resolve({
      success: true,
      description: `Usou ${item}`,
      effects: [
        {
          type: 'item',
          target: 'self',
          value: item,
          description: `Efeito de ${item}`,
        },
      ],
    });
  }
  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    return { valid: !!params.item, errors: params.item ? [] : ['Item é obrigatório'] };
  }
  getRequiredContext(): string[] {
    return ['personagemId', 'itensDisponiveis'];
  }
}

class EquiparHandler extends UsarItemHandler {}
class DesequiparHandler extends UsarItemHandler {}

class FalarHandler implements MCPFunctionHandler {
  execute(params: Record<string, unknown>): Promise<MCPActionResult> {
    const conteudo = params.conteudo as string;
    return Promise.resolve({
      success: true,
      description: `Disse: "${String(conteudo)}"`,
      effects: [],
    });
  }
  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    return { valid: !!params.conteudo, errors: params.conteudo ? [] : ['Conteúdo é obrigatório'] };
  }
  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}

class IntimidarHandler extends FalarHandler {}
class PersuadirHandler extends FalarHandler {}
class EnganarHandler extends FalarHandler {}

class InvestigarHandler implements MCPFunctionHandler {
  execute(params: Record<string, unknown>): Promise<MCPActionResult> {
    const alvo = params.alvo as string;
    const resultado = Dados.rolar('d20').total + 2; // +2 de modificador de INT

    return Promise.resolve({
      success: resultado >= 15,
      description: `Investigou ${String(alvo)} (resultado: ${resultado})`,
      effects: [],
      dados: {
        rolagem: 'd20+2',
        resultado: resultado - 2,
        modificadores: 2,
        total: resultado,
      },
    });
  }
  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    return { valid: !!params.alvo, errors: params.alvo ? [] : ['Alvo é obrigatório'] };
  }
  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}

class PerceberHandler extends InvestigarHandler {}
class AjudarHandler extends InvestigarHandler {}

class EsperarHandler implements MCPFunctionHandler {
  execute(): Promise<MCPActionResult> {
    return Promise.resolve({
      success: true,
      description: 'Esperando e observando...',
      effects: [],
    });
  }
  validate(): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }
  getRequiredContext(): string[] {
    return ['personagemId'];
  }
}
