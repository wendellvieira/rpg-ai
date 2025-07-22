import { CommandRunner } from './Engine/Commands/CommandRunner';
import type { CommandExecutionResult } from './Engine/Commands/CommandRunner';

/**
 * ✅ Serviço de integração entre Commands e GamePage
 *
 * Serviço simplificado para integrar comandos no chat do GamePage
 */
export class GameCommandService {
  private commandRunner: CommandRunner;

  constructor() {
    this.commandRunner = new CommandRunner();
  }

  /**
   * Verifica se uma mensagem é um comando
   */
  isCommand(message: string): boolean {
    return message.trim().startsWith('/');
  }

  /**
   * Processa uma mensagem como comando
   */
  async processCommand(message: string): Promise<CommandProcessResult> {
    if (!this.isCommand(message)) {
      return {
        isCommand: false,
        success: false,
        error: 'Mensagem não é um comando',
      };
    }

    try {
      // Criar contexto básico
      const context = {
        userId: 'gm',
        sessionId: 'default',
        timestamp: Date.now(),
        environment: {
          participants: [],
          combatActive: false,
        },
        allCharacters: [],
        permissions: {
          allowCombat: true,
          allowMagic: true,
          allowMovement: true,
          allowAI: true,
          isGM: true,
          canControlNPCs: true,
          canModifyEnvironment: true,
          canUseCheats: true,
          canAccessDebugCommands: true,
        },
        settings: {
          autoComplete: true,
          confirmDestructiveActions: true,
          showDetailedFeedback: true,
          logCommands: true,
          privateMode: false,
        },
      };

      // Executar comando
      const result = await this.commandRunner.executeText(message, context);

      return {
        isCommand: true,
        success: result.success,
        result: result,
        visualFeedback: this.generateVisualFeedback(result),
      };
    } catch (error) {
      console.error('Erro ao processar comando:', error);
      return {
        isCommand: true,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        visualFeedback: {
          type: 'error',
          message: 'Erro ao executar comando',
          icon: 'error',
        },
      };
    }
  }

  /**
   * Gera sugestões de auto-complete para o input
   */
  getAutoComplete(input: string): AutoCompleteResult[] {
    if (!input.startsWith('/')) {
      return [];
    }

    try {
      const context = {
        userId: 'gm',
        sessionId: 'default',
        timestamp: Date.now(),
        environment: {
          participants: [],
          combatActive: false,
        },
        allCharacters: [],
        permissions: {
          allowCombat: true,
          allowMagic: true,
          allowMovement: true,
          allowAI: true,
          isGM: true,
          canControlNPCs: true,
          canModifyEnvironment: true,
          canUseCheats: true,
          canAccessDebugCommands: true,
        },
        settings: {
          autoComplete: true,
          confirmDestructiveActions: true,
          showDetailedFeedback: true,
          logCommands: true,
          privateMode: false,
        },
      };

      const suggestions = this.commandRunner.generateAutoComplete(input, context);

      return suggestions.suggestions.map((suggestion: string) => {
        return {
          command: suggestion,
          description: `Comando: ${suggestion}`,
          category: 'general',
          example: suggestion,
          icon: this.getCommandIcon('general'),
        };
      });
    } catch (error) {
      console.error('Erro ao gerar auto-complete:', error);
      return [];
    }
  }

  /**
   * Lista todos os comandos disponíveis
   */
  getAllCommands(): CommandInfo[] {
    const commands = this.commandRunner.listCommands();

    return commands.map((cmd) => {
      return {
        name: cmd.name,
        description: cmd.description,
        category: cmd.category,
        usage: cmd.syntax,
        examples: [cmd.syntax],
        icon: this.getCommandIcon(cmd.category),
      };
    });
  }

  /**
   * Gera feedback visual baseado no resultado do comando
   */
  private generateVisualFeedback(result: CommandExecutionResult): VisualFeedback {
    if (!result.success) {
      return {
        type: 'error',
        message: result.message || 'Comando falhou',
        icon: 'error',
        color: 'negative',
      };
    }

    // Feedback baseado no tipo de comando
    if (result.type === 'success') {
      return {
        type: 'success',
        message: result.message,
        icon: 'check_circle',
        color: 'positive',
      };
    }

    return {
      type: 'success',
      message: result.message,
      icon: 'terminal',
      color: 'primary',
    };
  }

  /**
   * Obtém ícone apropriado para categoria de comando
   */
  private getCommandIcon(category: string): string {
    const icons: Record<string, string> = {
      communication: 'chat',
      combat: 'local_fire_department',
      mechanics: 'casino',
      action: 'flash_on',
      ai: 'psychology',
    };

    return icons[category] || 'terminal';
  }
}

// =====================================
// 📋 INTERFACES
// =====================================

export interface CommandProcessResult {
  isCommand: boolean;
  success: boolean;
  result?: CommandExecutionResult;
  error?: string;
  visualFeedback?: VisualFeedback;
}

export interface AutoCompleteResult {
  command: string;
  description: string;
  category: string;
  example?: string;
  icon: string;
}

export interface CommandInfo {
  name: string;
  description: string;
  category: string;
  usage: string;
  examples: string[];
  icon: string;
}

export interface VisualFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon: string;
  color?: string;
  animation?: string;
  sound?: string;
  highlight?: unknown;
}
