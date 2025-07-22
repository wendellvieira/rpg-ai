import type { BaseCommand, CommandResult, CommandCategory } from './commands/BaseCommand';
import { CommandParser, type ParsedCommand, type AutoCompleteResult } from './CommandParser';
import type { CommandExecutionContext } from './CommandContext';

// Importar comandos disponíveis
import { TalkCommand, AttackCommand } from './commands';
import { RollCommand } from './commands/RollCommand';
import { CastCommand } from './commands/CastCommand';
import { MoveCommand } from './commands/MoveCommand';
import { HealCommand } from './commands/HealCommand';
import { DefendCommand } from './commands/DefendCommand';
import { AIControlCommand } from './commands/AIControlCommand';

/**
 * Executor centralizado para sistema de comandos
 *
 * Gerencia registro, validação, execução e histórico de comandos.
 * Implementa padrão Registry + Command Pattern para extensibilidade.
 */
export class CommandRunner {
  private commands = new Map<string, BaseCommand>();
  private aliases = new Map<string, string>();
  private parser = new CommandParser();
  private executionHistory: CommandExecution[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.registerDefaultCommands();
  }

  /**
   * Registra comandos padrão do sistema
   */
  private registerDefaultCommands(): void {
    // Comandos de comunicação
    this.registerCommand(new TalkCommand());

    // Comandos de combate
    this.registerCommand(new AttackCommand());
    this.registerCommand(new DefendCommand());

    // Comandos de mecânicas
    this.registerCommand(new RollCommand());

    // Comandos de ação
    this.registerCommand(new CastCommand());
    this.registerCommand(new MoveCommand());
    this.registerCommand(new HealCommand());

    // Comandos de IA
    this.registerCommand(new AIControlCommand());

    console.log(`🎮 Comandos padrão registrados: ${this.commands.size} comandos`);
  } /**
   * Registra um comando no sistema
   */
  registerCommand(command: BaseCommand): void {
    // Registrar comando principal
    this.commands.set(command.name, command);

    // Registrar aliases
    command.aliases.forEach((alias) => {
      this.aliases.set(alias, command.name);
    });

    console.log(`🎮 Comando registrado: ${command.name} (aliases: ${command.aliases.join(', ')})`);
  }

  /**
   * Remove comando do sistema
   */
  unregisterCommand(commandName: string): boolean {
    const command = this.commands.get(commandName);
    if (!command) return false;

    // Remover aliases
    command.aliases.forEach((alias) => {
      this.aliases.delete(alias);
    });

    // Remover comando
    this.commands.delete(commandName);

    console.log(`🎮 Comando removido: ${commandName}`);
    return true;
  }

  /**
   * Obtém comando por nome ou alias
   */
  private getCommand(name: string): BaseCommand | undefined {
    const commandName = this.aliases.get(name) || name;
    return this.commands.get(commandName);
  }

  /**
   * Executa comando a partir de texto de entrada
   */
  async executeText(
    input: string,
    context: CommandExecutionContext,
    options?: ExecutionOptions,
  ): Promise<CommandExecutionResult> {
    const startTime = Date.now();
    const parsed = this.parser.parse(input, options?.parseOptions);

    try {
      if (!parsed.isCommand || !parsed.command) {
        return {
          success: false,
          type: 'not_command',
          message: 'Entrada não é um comando válido',
          originalInput: input,
          executionTime: Date.now() - startTime,
        };
      }

      return await this.executeCommand(parsed, context, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      return {
        success: false,
        type: 'execution_error',
        message: `Erro na execução: ${errorMessage}`,
        originalInput: input,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  }

  /**
   * Executa comando já parseado
   */
  async executeCommand(
    parsed: ParsedCommand,
    context: CommandExecutionContext,
    options?: ExecutionOptions,
  ): Promise<CommandExecutionResult> {
    const startTime = Date.now();

    if (!parsed.command) {
      return {
        success: false,
        type: 'invalid_command',
        message: 'Comando inválido',
        originalInput: parsed.originalText,
        executionTime: Date.now() - startTime,
      };
    }

    // Buscar comando
    const command = this.getCommand(parsed.command);
    if (!command) {
      const suggestions = this.getSimilarCommands(parsed.command);
      return {
        success: false,
        type: 'command_not_found',
        message: `Comando '${parsed.command}' não encontrado`,
        originalInput: parsed.originalText,
        executionTime: Date.now() - startTime,
        suggestions,
      };
    }

    // Validar sintaxe
    const syntaxValidation = this.parser.validateSyntax(parsed);
    if (!syntaxValidation.isValid) {
      return {
        success: false,
        type: 'syntax_error',
        message: `Erro de sintaxe: ${syntaxValidation.errors.join(', ')}`,
        originalInput: parsed.originalText,
        executionTime: Date.now() - startTime,
        validationErrors: syntaxValidation.errors,
      };
    }

    // Validar comando
    const args = parsed.args?.raw || [];
    const commandValidation = command.validate(args, context);
    if (!commandValidation.isValid) {
      return {
        success: false,
        type: 'validation_error',
        message: `Validação falhou: ${commandValidation.errors.join(', ')}`,
        originalInput: parsed.originalText,
        executionTime: Date.now() - startTime,
        validationErrors: commandValidation.errors,
        validationWarnings: commandValidation.warnings,
      };
    }

    // Verificar permissões
    const permissionCheck = this.checkPermissions(command, context);
    if (!permissionCheck.allowed) {
      return {
        success: false,
        type: 'permission_denied',
        message: permissionCheck.reason || 'Permissão negada',
        originalInput: parsed.originalText,
        executionTime: Date.now() - startTime,
      };
    }

    // Executar comando
    try {
      const result = await command.execute(args, context);
      const executionTime = Date.now() - startTime;

      // Registrar no histórico
      if (options?.recordHistory !== false) {
        this.addToHistory({
          command: parsed.command,
          args,
          context,
          result,
          timestamp: startTime,
          executionTime,
        });
      }

      return {
        success: result.success,
        type: result.success ? 'success' : 'command_failed',
        message: result.message,
        data: result.data,
        originalInput: parsed.originalText,
        executionTime,
        commandResult: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na execução do comando';

      return {
        success: false,
        type: 'execution_error',
        message: errorMessage,
        originalInput: parsed.originalText,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  }

  /**
   * Verifica permissões para executar comando
   */
  private checkPermissions(
    command: BaseCommand,
    context: CommandExecutionContext,
  ): PermissionCheck {
    // Verificar se é admin only
    if (command.adminOnly && !context.permissions.isGM) {
      return {
        allowed: false,
        reason: 'Este comando é restrito a Game Masters',
      };
    }

    // Verificar se requer combate
    if (command.requiresCombat && !context.environment.combatActive) {
      return {
        allowed: false,
        reason: 'Este comando só pode ser usado durante combate',
      };
    }

    // Verificar se requer target mas não tem personagem ativo
    if (command.requiresTarget && !context.currentCharacter) {
      return {
        allowed: false,
        reason: 'Este comando requer um personagem ativo',
      };
    }

    return { allowed: true };
  }

  /**
   * Gera sugestões de auto-complete
   */
  generateAutoComplete(partialInput: string, context: CommandExecutionContext): AutoCompleteResult {
    const availableCommands = Array.from(this.commands.keys());
    const baseResult = this.parser.generateAutoComplete(partialInput, availableCommands);

    // Expandir sugestões para targets
    if (baseResult.isTargetSuggestion && baseResult.partialTarget !== undefined) {
      const targetSuggestions = this.generateTargetSuggestions(baseResult.partialTarget, context);
      baseResult.suggestions = targetSuggestions;
    }

    // Expandir sugestões para flags (seria específico por comando)
    if (baseResult.isFlagSuggestion) {
      const parsed = this.parser.parse(partialInput);
      if (parsed.command) {
        const command = this.getCommand(parsed.command);
        if (command) {
          baseResult.suggestions = command.getAutoComplete([], context);
        }
      }
    }

    return baseResult;
  }

  /**
   * Gera sugestões de targets baseado nos personagens disponíveis
   */
  private generateTargetSuggestions(partial: string, context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Adicionar personagens da sessão
    context.allCharacters.forEach((char) => {
      if (char.nome.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.push(`@${char.nome}`);
      }
      if (char.id.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.push(`@${char.id}`);
      }
    });

    // Adicionar targets especiais
    const specialTargets = ['all', 'self', 'target', 'enemy', 'ally'];
    specialTargets.forEach((target) => {
      if (target.includes(partial.toLowerCase())) {
        suggestions.push(`@${target}`);
      }
    });

    return suggestions.slice(0, 10); // Limitar resultados
  }

  /**
   * Busca comandos similares para sugestões
   */
  private getSimilarCommands(command: string): string[] {
    const allCommands = Array.from(this.commands.keys());
    const similar: string[] = [];

    // Busca por comandos que começam com as mesmas letras
    allCommands.forEach((cmd) => {
      if (cmd.startsWith(command.substring(0, 2))) {
        similar.push(cmd);
      }
    });

    // Busca por distância de edição simples
    allCommands.forEach((cmd) => {
      if (this.calculateSimpleDistance(command, cmd) <= 2) {
        if (!similar.includes(cmd)) {
          similar.push(cmd);
        }
      }
    });

    return similar.slice(0, 5);
  }

  /**
   * Calcula distância simples entre strings (Levenshtein simplificado)
   */
  private calculateSimpleDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0]![j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!;
        } else {
          matrix[i]![j] = Math.min(
            matrix[i - 1]![j - 1]! + 1,
            matrix[i]![j - 1]! + 1,
            matrix[i - 1]![j]! + 1,
          );
        }
      }
    }

    return matrix[b.length]![a.length]!;
  }

  /**
   * Adiciona execução ao histórico
   */
  private addToHistory(execution: CommandExecution): void {
    this.executionHistory.unshift(execution);

    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Obtém histórico de comandos
   */
  getHistory(limit?: number): CommandExecution[] {
    return limit ? this.executionHistory.slice(0, limit) : [...this.executionHistory];
  }

  /**
   * Lista todos os comandos disponíveis
   */
  listCommands(category?: CommandCategory): CommandInfo[] {
    const commands: CommandInfo[] = [];

    for (const command of this.commands.values()) {
      if (!category || command.category === category) {
        commands.push({
          name: command.name,
          aliases: command.aliases,
          description: command.description,
          syntax: command.syntax,
          category: command.category,
          requiresTarget: command.requiresTarget,
          requiresCombat: command.requiresCombat,
          adminOnly: command.adminOnly,
        });
      }
    }

    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtém ajuda para comando específico
   */
  getCommandHelp(commandName: string): string | undefined {
    const command = this.getCommand(commandName);
    return command?.getHelp();
  }

  /**
   * Limpa histórico de comandos
   */
  clearHistory(): void {
    this.executionHistory = [];
  }
}

// Interfaces e tipos para o CommandRunner

export interface ExecutionOptions {
  parseOptions?: {
    caseSensitive?: boolean;
    expandAliases?: boolean;
  };
  recordHistory?: boolean;
  confirmDestructive?: boolean;
}

export interface CommandExecutionResult {
  success: boolean;
  type: ExecutionResultType;
  message: string;
  data?: unknown;
  originalInput: string;
  executionTime: number;
  commandResult?: CommandResult;
  error?: Error;
  suggestions?: string[];
  validationErrors?: string[];
  validationWarnings?: string[];
}

export type ExecutionResultType =
  | 'success'
  | 'not_command'
  | 'invalid_command'
  | 'command_not_found'
  | 'syntax_error'
  | 'validation_error'
  | 'permission_denied'
  | 'command_failed'
  | 'execution_error';

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export interface CommandExecution {
  command: string;
  args: string[];
  context: CommandExecutionContext;
  result: CommandResult;
  timestamp: number;
  executionTime: number;
}

export interface CommandInfo {
  name: string;
  aliases: string[];
  description: string;
  syntax: string;
  category: CommandCategory;
  requiresTarget: boolean;
  requiresCombat: boolean;
  adminOnly: boolean;
}
