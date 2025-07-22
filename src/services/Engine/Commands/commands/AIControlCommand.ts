import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /ai para controle de IA dos NPCs
 *
 * Sintaxe:
 * - /ai on @npc - Ativa IA para NPC
 * - /ai off @npc - Desativa IA para NPC
 * - /ai status - Mostra status de todos NPCs com IA
 * - /ai status @npc - Mostra status específico de um NPC
 * - /ai personality @npc [descrição] - Define personalidade do NPC
 * - /ai task @npc [tarefa] - Atribui tarefa específica ao NPC
 */
export class AIControlCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'ai',
      aliases: ['ia', 'bot', 'npc'],
      description: 'Controla comportamento de IA dos NPCs',
      syntax: '/ai [on|off|status|personality|task] [@npc] [parâmetros]',
      category: CommandCategory.AI,
      requiresTarget: false,
      requiresCombat: false,
      adminOnly: true, // Comando administrativo
    };

    super(config);
  }

  validate(args: string[], context: CommandExecutionContext) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar se é admin (GM ou pode controlar NPCs)
    if (!context.permissions.isGM && !context.permissions.canControlNPCs) {
      errors.push('Comando de IA requer privilégios de GM ou controle de NPCs');
    }

    // Verificar se tem argumentos
    if (args.length === 0) {
      errors.push('É necessário especificar uma ação (on, off, status, personality, task)');
      return { isValid: false, errors, warnings };
    }

    const action = args[0]?.toLowerCase() || '';
    const validActions = ['on', 'off', 'status', 'personality', 'task'];

    if (!validActions.includes(action)) {
      errors.push(`Ação "${action}" inválida. Use: ${validActions.join(', ')}`);
    }

    // Validações específicas por ação
    const target = this.extractTarget(args);

    switch (action) {
      case 'on':
      case 'off':
        if (!target) {
          errors.push(`Ação "${action}" requer especificar um NPC (@npc)`);
        }
        break;

      case 'personality':
        if (!target) {
          errors.push('Comando personality requer especificar um NPC (@npc)');
        }
        if (args.length < 3) {
          errors.push('Comando personality requer uma descrição');
        }
        break;

      case 'task':
        if (!target) {
          errors.push('Comando task requer especificar um NPC (@npc)');
        }
        if (args.length < 3) {
          errors.push('Comando task requer uma descrição da tarefa');
        }
        break;

      case 'status':
        // Status pode ser geral ou específico
        break;
    }

    // Verificar se o NPC existe (se especificado)
    if (target) {
      const npcCharacter = context.allCharacters.find(
        (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
      );

      if (!npcCharacter) {
        errors.push(`NPC "${target}" não encontrado`);
      } else if (!npcCharacter.isIA) {
        warnings.push(`Personagem "${target}" não é um NPC controlado por IA`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  execute(args: string[], context: CommandExecutionContext): Promise<CommandResult> {
    try {
      const action = args[0]?.toLowerCase() || '';
      const target = this.extractTarget(args);

      switch (action) {
        case 'on':
          return this.handleAIActivation(target!, context, true);

        case 'off':
          return this.handleAIActivation(target!, context, false);

        case 'status':
          return this.handleAIStatus(target, context);

        case 'personality':
          return this.handlePersonality(target!, args, context);

        case 'task':
          return this.handleTask(target!, args, context);

        default:
          return Promise.resolve({
            success: false,
            message: `Ação "${action}" não implementada`,
            timestamp: Date.now(),
          });
      }
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro no comando AI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir ações
    if (args.length === 0) {
      suggestions.push('on', 'off', 'status', 'personality', 'task');
      return suggestions;
    }

    const action = args[0]?.toLowerCase() || '';
    const lastArg = args[args.length - 1];

    // Se primeiro argumento é ação válida, sugerir NPCs
    if (['on', 'off', 'personality', 'task'].includes(action) && args.length === 1) {
      context.allCharacters
        .filter((char) => char.isIA)
        .slice(0, 5)
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });
    }

    // Se último argumento começa com @, sugerir NPCs
    if (lastArg?.startsWith('@')) {
      const partial = lastArg.substring(1).toLowerCase();

      context.allCharacters
        .filter((char) => char.isIA && char.nome.toLowerCase().includes(partial))
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });
    }

    // Sugestões específicas por comando
    if (action === 'personality' && args.length >= 2) {
      suggestions.push(
        'amigável e prestativo',
        'misterioso e reservado',
        'agressivo e desconfiado',
        'sábio e experiente',
        'jovial e brincalhão',
      );
    }

    if (action === 'task' && args.length >= 2) {
      suggestions.push(
        'patrulhar a área',
        'guardar este local',
        'conversar com viajantes',
        'vender itens',
        'fornecer informações',
      );
    }

    return suggestions;
  }

  /**
   * Ativa/desativa IA para um NPC
   */
  private handleAIActivation(
    target: string,
    context: CommandExecutionContext,
    activate: boolean,
  ): Promise<CommandResult> {
    const npc = context.allCharacters.find(
      (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
    );

    if (!npc) {
      return Promise.resolve({
        success: false,
        message: `NPC "${target}" não encontrado`,
        timestamp: Date.now(),
      });
    }

    const action = activate ? 'ativada' : 'desativada';
    const emoji = activate ? '🤖' : '💤';

    // TODO: Implementar ativação/desativação real da IA
    // npc.setIAAtiva(activate);

    const aiEvent = {
      type: 'ai_control',
      npc: {
        id: npc.id,
        name: npc.nome,
      },
      action: activate ? 'activate' : 'deactivate',
      timestamp: Date.now(),
    };

    return Promise.resolve({
      success: true,
      message: `${emoji} IA ${action} para ${npc.nome}`,
      data: aiEvent,
      timestamp: Date.now(),
    });
  }

  /**
   * Mostra status da IA
   */
  private handleAIStatus(
    target: string | null,
    context: CommandExecutionContext,
  ): Promise<CommandResult> {
    if (target) {
      // Status específico de um NPC
      const npc = context.allCharacters.find(
        (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
      );

      if (!npc) {
        return Promise.resolve({
          success: false,
          message: `NPC "${target}" não encontrado`,
          timestamp: Date.now(),
        });
      }

      // TODO: Obter status real da IA
      const statusInfo = this.getNPCStatus(npc);

      return Promise.resolve({
        success: true,
        message: `📊 Status de ${npc.nome}:\n${statusInfo}`,
        timestamp: Date.now(),
      });
    } else {
      // Status geral de todos NPCs
      const npcs = context.allCharacters.filter((char) => char.isIA);

      if (npcs.length === 0) {
        return Promise.resolve({
          success: true,
          message: '📊 Nenhum NPC com IA encontrado na cena',
          timestamp: Date.now(),
        });
      }

      const statusList = npcs
        .map((npc) => {
          const status = this.getNPCStatus(npc);
          return `• ${npc.nome}: ${status}`;
        })
        .join('\n');

      return Promise.resolve({
        success: true,
        message: `📊 Status de NPCs com IA:\n${statusList}`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Define personalidade do NPC
   */
  private handlePersonality(
    target: string,
    args: string[],
    context: CommandExecutionContext,
  ): Promise<CommandResult> {
    const npc = context.allCharacters.find(
      (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
    );

    if (!npc) {
      return Promise.resolve({
        success: false,
        message: `NPC "${target}" não encontrado`,
        timestamp: Date.now(),
      });
    }

    const personality = args.slice(2).join(' ');

    // TODO: Implementar definição real de personalidade
    // npc.setPersonalidade(personality);

    return Promise.resolve({
      success: true,
      message: `🎭 Personalidade de ${npc.nome} definida como: "${personality}"`,
      data: {
        type: 'personality_update',
        npc: { id: npc.id, name: npc.nome },
        personality,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Atribui tarefa ao NPC
   */
  private handleTask(
    target: string,
    args: string[],
    context: CommandExecutionContext,
  ): Promise<CommandResult> {
    const npc = context.allCharacters.find(
      (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
    );

    if (!npc) {
      return Promise.resolve({
        success: false,
        message: `NPC "${target}" não encontrado`,
        timestamp: Date.now(),
      });
    }

    const task = args.slice(2).join(' ');

    // TODO: Implementar atribuição real de tarefa
    // npc.setTarefa(task);

    return Promise.resolve({
      success: true,
      message: `📋 Tarefa atribuída a ${npc.nome}: "${task}"`,
      data: {
        type: 'task_assignment',
        npc: { id: npc.id, name: npc.nome },
        task,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Extrai alvo dos argumentos
   */
  private extractTarget(args: string[]): string | null {
    const targetArg = args.find((arg) => arg.startsWith('@'));
    return targetArg ? targetArg.substring(1) : null;
  }

  /**
   * Obtém informações de status de um NPC
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getNPCStatus(_npc: unknown): string {
    // TODO: Implementar obtenção real de status
    // const isActive = npc.isIAAtiva();
    // const personality = npc.getPersonalidade();
    // const currentTask = npc.getTarefaAtual();

    // Placeholder
    return `IA Ativa: ✅ | Personalidade: Padrão | Tarefa: Nenhuma`;
  }
}
