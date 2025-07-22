/**
 * Interface base para todos os comandos do sistema
 *
 * Implementa o Command Pattern para permitir execução de comandos
 * extensível, histórico, desfazer/refazer e processamento assíncrono.
 */
export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp: number;
}

export interface CommandContext {
  userId: string;
  sessionId: string;
  characterId?: string;
  timestamp: number;
  environment: {
    currentScene?: string;
    participants: string[];
    turnOrder?: string[];
    combatActive: boolean;
  };
}

export interface CommandValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Classe abstrata base para todos os comandos
 */
export abstract class BaseCommand {
  public readonly name: string;
  public readonly aliases: string[];
  public readonly description: string;
  public readonly syntax: string;
  public readonly category: CommandCategory;
  public readonly requiresTarget: boolean;
  public readonly requiresCombat: boolean;
  public readonly adminOnly: boolean;

  constructor(config: CommandConfig) {
    this.name = config.name;
    this.aliases = config.aliases || [];
    this.description = config.description;
    this.syntax = config.syntax;
    this.category = config.category;
    this.requiresTarget = config.requiresTarget || false;
    this.requiresCombat = config.requiresCombat || false;
    this.adminOnly = config.adminOnly || false;
  }

  /**
   * Valida se o comando pode ser executado no contexto atual
   */
  abstract validate(args: string[], context: CommandContext): CommandValidation;

  /**
   * Executa o comando
   */
  abstract execute(args: string[], context: CommandContext): Promise<CommandResult>;

  /**
   * Retorna sugestões de auto-complete para o comando
   */
  abstract getAutoComplete(args: string[], context: CommandContext): string[];

  /**
   * Retorna help detalhado do comando
   */
  getHelp(): string {
    return `${this.syntax}\n${this.description}`;
  }

  /**
   * Verifica se o comando corresponde ao nome/alias fornecido
   */
  matches(commandName: string): boolean {
    return this.name === commandName || this.aliases.includes(commandName);
  }
}

export interface CommandConfig {
  name: string;
  aliases?: string[];
  description: string;
  syntax: string;
  category: CommandCategory;
  requiresTarget?: boolean;
  requiresCombat?: boolean;
  adminOnly?: boolean;
}

export enum CommandCategory {
  COMMUNICATION = 'communication',
  ACTION = 'action',
  COMBAT = 'combat',
  AI = 'ai',
  SYSTEM = 'system',
  UTILITY = 'utility',
  DEBUG = 'debug',
}

/**
 * Parser para argumentos de comando
 */
export class CommandArgs {
  public readonly raw: string[];
  public readonly targets: string[] = [];
  public readonly flags: Map<string, string> = new Map();
  public readonly text: string;

  constructor(args: string[]) {
    this.raw = [...args];
    this.text = args.join(' ');
    this.parseArgs(args);
  }

  private parseArgs(args: string[]): void {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (!arg) continue; // Skip undefined args

      // Parse targets (@npc, @player)
      if (arg.startsWith('@')) {
        this.targets.push(arg.substring(1));
      }
      // Parse flags (--flag=value, -f value)
      else if (arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        this.flags.set(key || '', value || 'true');
      } else if (arg.startsWith('-') && args[i + 1] && !args[i + 1]?.startsWith('-')) {
        const nextArg = args[i + 1];
        if (nextArg) {
          this.flags.set(arg.substring(1), nextArg);
          i++; // Skip next arg as it's the value
        }
      }
    }
  }

  /**
   * Obtém argumentos sem targets e flags
   */
  getPlainArgs(): string[] {
    return this.raw.filter(
      (arg) => !arg.startsWith('@') && !arg.startsWith('-') && !this.isValueOfPreviousFlag(arg),
    );
  }

  private isValueOfPreviousFlag(arg: string): boolean {
    const index = this.raw.indexOf(arg);
    if (index === 0) return false;
    const prev = this.raw[index - 1];
    if (!prev) return false;
    return prev.startsWith('-') && !prev.startsWith('--') && !prev.includes('=');
  }

  /**
   * Retorna primeiro target encontrado
   */
  getFirstTarget(): string | undefined {
    return this.targets[0];
  }

  /**
   * Retorna texto sem targets e flags
   */
  getPlainText(): string {
    return this.getPlainArgs().join(' ');
  }

  /**
   * Verifica se contém flag específica
   */
  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  /**
   * Obtém valor de flag ou default
   */
  getFlag(flag: string, defaultValue?: string): string | undefined {
    return this.flags.get(flag) || defaultValue;
  }
}
