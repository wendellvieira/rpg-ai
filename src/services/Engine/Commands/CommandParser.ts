import { CommandArgs } from './commands/BaseCommand';

/**
 * Parser para comandos do sistema
 *
 * Processa mensagens de entrada e identifica comandos, argumentos,
 * targets e flags. Suporta sintaxe avançada para RPG.
 */
export interface ParsedCommand {
  isCommand: boolean;
  command?: string;
  args?: CommandArgs;
  originalText: string;
}

export interface ParseOptions {
  prefix: string;
  allowInlineCommands: boolean;
  caseSensitive: boolean;
  expandAliases: boolean;
}

/**
 * Parser principal para comandos
 */
export class CommandParser {
  private defaultOptions: ParseOptions = {
    prefix: '/',
    allowInlineCommands: false,
    caseSensitive: false,
    expandAliases: true,
  };

  /**
   * Analisa texto de entrada e determina se é um comando
   */
  parse(input: string, options?: Partial<ParseOptions>): ParsedCommand {
    const opts = { ...this.defaultOptions, ...options };
    const trimmed = input.trim();

    // Verifica se é comando (começa com prefix)
    if (!trimmed.startsWith(opts.prefix)) {
      return {
        isCommand: false,
        originalText: input,
      };
    }

    // Remove prefix e divide em partes
    const commandText = trimmed.substring(opts.prefix.length);
    const parts = this.tokenize(commandText);

    if (parts.length === 0) {
      return {
        isCommand: false,
        originalText: input,
      };
    }

    const command = opts.caseSensitive ? parts[0] : parts[0]?.toLowerCase();

    if (!command) {
      return {
        isCommand: false,
        originalText: input,
      };
    }

    const args = new CommandArgs(parts.slice(1));

    return {
      isCommand: true,
      command,
      args,
      originalText: input,
    };
  }

  /**
   * Tokeniza string de comando respeitando aspas e escapes
   */
  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }

      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }

      if (char === ' ' && !inQuotes) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Extrai comandos inline de texto livre
   */
  parseInlineCommands(input: string, options?: Partial<ParseOptions>): ParsedCommand[] {
    const opts = { ...this.defaultOptions, ...options };
    const commands: ParsedCommand[] = [];

    if (!opts.allowInlineCommands) {
      return [this.parse(input, options)];
    }

    // Procura por padrões de comando no texto
    const commandPattern = new RegExp(`\\${opts.prefix}\\w+[^\\n]*`, 'g');
    const matches = input.match(commandPattern);

    if (!matches) {
      return [
        {
          isCommand: false,
          originalText: input,
        },
      ];
    }

    matches.forEach((match) => {
      const parsed = this.parse(match.trim(), options);
      if (parsed.isCommand) {
        commands.push(parsed);
      }
    });

    return commands;
  }

  /**
   * Valida sintaxe de comando
   */
  validateSyntax(parsed: ParsedCommand): SyntaxValidation {
    if (!parsed.isCommand || !parsed.command || !parsed.args) {
      return {
        isValid: false,
        errors: ['Comando inválido'],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar targets
    if (parsed.args.targets.length > 0) {
      parsed.args.targets.forEach((target) => {
        if (target.length === 0) {
          errors.push('Target vazio encontrado');
        }
        if (target.includes(' ')) {
          warnings.push(`Target "${target}" contém espaços`);
        }
      });
    }

    // Validar flags
    for (const [flag, value] of parsed.args.flags) {
      if (flag.length === 0) {
        errors.push('Flag vazia encontrada');
      }
      if (flag.includes('=') && value === 'true') {
        warnings.push(`Flag "${flag}" pode estar mal formatada`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Gera sugestões de auto-complete para comando parcial
   */
  generateAutoComplete(partialInput: string, availableCommands: string[]): AutoCompleteResult {
    const trimmed = partialInput.trim();

    if (!trimmed.startsWith('/')) {
      return {
        suggestions: [],
        hasCommands: false,
      };
    }

    const commandText = trimmed.substring(1);
    const parts = commandText.split(' ');
    const commandPart = parts[0];

    if (!commandPart) {
      return {
        suggestions: [],
        hasCommands: false,
      };
    }

    // Se ainda está digitando o comando
    if (parts.length === 1) {
      const matches = availableCommands.filter((cmd) =>
        cmd.toLowerCase().startsWith(commandPart.toLowerCase()),
      );

      const result: AutoCompleteResult = {
        suggestions: matches.map((cmd) => `/${cmd}`),
        hasCommands: true,
      };

      if (commandPart) {
        result.commandBeingTyped = commandPart;
      }

      return result;
    }

    // Se está digitando argumentos
    const lastArg = parts[parts.length - 1];

    if (!lastArg) {
      return {
        suggestions: [],
        hasCommands: true,
      };
    }

    // Auto-complete para targets (@)
    if (lastArg.startsWith('@')) {
      const result: AutoCompleteResult = {
        suggestions: [], // Será preenchido pelo CommandRunner com personagens disponíveis
        hasCommands: true,
        isTargetSuggestion: true,
      };

      result.partialTarget = lastArg.substring(1);
      return result;
    }

    // Auto-complete para flags (--)
    if (lastArg.startsWith('--')) {
      const result: AutoCompleteResult = {
        suggestions: [], // Será preenchido pelo CommandRunner com flags disponíveis
        hasCommands: true,
        isFlagSuggestion: true,
      };

      result.partialFlag = lastArg.substring(2);
      return result;
    }

    return {
      suggestions: [],
      hasCommands: true,
    };
  }

  /**
   * Normaliza comando para busca (remove prefixo, converte para lowercase)
   */
  normalizeCommand(command: string): string {
    let normalized = command.trim();

    if (normalized.startsWith('/')) {
      normalized = normalized.substring(1);
    }

    return normalized.toLowerCase();
  }

  /**
   * Converte comando parseado de volta para string
   */
  stringify(parsed: ParsedCommand): string {
    if (!parsed.isCommand || !parsed.command) {
      return parsed.originalText;
    }

    let result = `/${parsed.command}`;

    if (parsed.args) {
      // Adicionar args normais
      const plainArgs = parsed.args.getPlainArgs();
      if (plainArgs.length > 0) {
        result += ' ' + plainArgs.join(' ');
      }

      // Adicionar targets
      if (parsed.args.targets.length > 0) {
        result += ' ' + parsed.args.targets.map((t) => `@${t}`).join(' ');
      }

      // Adicionar flags
      for (const [flag, value] of parsed.args.flags) {
        if (value === 'true') {
          result += ` --${flag}`;
        } else {
          result += ` --${flag}=${value}`;
        }
      }
    }

    return result;
  }
}

export interface SyntaxValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface AutoCompleteResult {
  suggestions: string[];
  hasCommands: boolean;
  commandBeingTyped?: string;
  isTargetSuggestion?: boolean;
  partialTarget?: string;
  isFlagSuggestion?: boolean;
  partialFlag?: string;
}

/**
 * Utilitários para parsing de comandos
 */
export class CommandParserUtils {
  /**
   * Verifica se texto contém comando
   */
  static hasCommand(text: string, prefix = '/'): boolean {
    return text.trim().startsWith(prefix);
  }

  /**
   * Extrai apenas a parte do comando de um texto
   */
  static extractCommand(text: string, prefix = '/'): string {
    const trimmed = text.trim();
    if (!trimmed.startsWith(prefix)) return '';

    const firstSpace = trimmed.indexOf(' ');
    if (firstSpace === -1) {
      return trimmed.substring(prefix.length);
    }

    return trimmed.substring(prefix.length, firstSpace);
  }

  /**
   * Conta quantidade de argumentos em um comando
   */
  static countArgs(parsed: ParsedCommand): number {
    if (!parsed.args) return 0;
    return parsed.args.raw.length;
  }

  /**
   * Verifica se comando tem targets
   */
  static hasTargets(parsed: ParsedCommand): boolean {
    return (parsed.args?.targets.length ?? 0) > 0;
  }

  /**
   * Verifica se comando tem flags
   */
  static hasFlags(parsed: ParsedCommand): boolean {
    return (parsed.args?.flags.size ?? 0) > 0;
  }
}
