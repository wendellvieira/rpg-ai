import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /roll para rolagem de dados
 *
 * Sintaxe:
 * - /roll 1d20 - Rola um dado de 20 lados
 * - /roll 3d6+2 - Rola três dados de 6 lados e soma 2
 * - /roll str - Rola teste de atributo de força
 * - /roll advantage 1d20 - Rola com vantagem (2d20, pega o maior)
 * - /roll disadvantage 1d20 - Rola com desvantagem (2d20, pega o menor)
 */
export class RollCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'roll',
      aliases: ['r', 'rolar', 'dado'],
      description: 'Rola dados usando notação padrão (ex: 3d6+2)',
      syntax: '/roll [notação] ou /roll [atributo] ou /roll [advantage|disadvantage] [notação]',
      category: CommandCategory.MECHANICS,
      requiresTarget: false,
      requiresCombat: false,
      adminOnly: false,
    };

    super(config);
  }

  validate(args: string[], context: CommandExecutionContext) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (args.length === 0) {
      errors.push('É necessário especificar o que rolar (ex: 1d20, str, 3d6+2)');
      return { isValid: false, errors, warnings };
    }

    const diceExpression = this.buildDiceExpression(args);

    // Validar se é uma expressão de dados válida ou atributo
    if (!this.isValidDiceExpression(diceExpression) && !this.isValidAttribute(diceExpression)) {
      errors.push(
        `Expressão inválida: "${diceExpression}". Use formato como 1d20, 3d6+2, ou nomes de atributos`,
      );
    }

    // Verificar se tem personagem para rolagem de atributos
    if (this.isValidAttribute(diceExpression) && !context.currentCharacter) {
      warnings.push('Rolagem de atributo requer personagem ativo. Será usado valor padrão.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  execute(args: string[], context: CommandExecutionContext): Promise<CommandResult> {
    try {
      const hasAdvantage = args.includes('advantage') || args.includes('vantagem');
      const hasDisadvantage = args.includes('disadvantage') || args.includes('desvantagem');

      // Filtrar modificadores especiais dos argumentos
      const cleanArgs = args.filter(
        (arg) => !['advantage', 'disadvantage', 'vantagem', 'desvantagem'].includes(arg),
      );

      const expression = this.buildDiceExpression(cleanArgs);
      const roller = context.currentCharacter?.nome || 'Sistema';

      let result: DiceRollResult;

      if (this.isValidAttribute(expression)) {
        result = this.rollAttribute(expression, context, hasAdvantage, hasDisadvantage);
      } else {
        result = this.rollDice(expression, hasAdvantage, hasDisadvantage);
      }

      const resultMessage = this.formatRollResult(
        roller,
        expression,
        result,
        hasAdvantage,
        hasDisadvantage,
      );

      return Promise.resolve({
        success: true,
        message: resultMessage,
        data: {
          type: 'dice_roll',
          roller,
          expression,
          result,
          hasAdvantage,
          hasDisadvantage,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao rolar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir opções comuns
    if (args.length === 0) {
      suggestions.push('1d20', '1d12', '1d10', '1d8', '1d6', '1d4');
      suggestions.push('advantage', 'disadvantage');

      // Adicionar atributos se há personagem
      if (context.currentCharacter) {
        suggestions.push('str', 'dex', 'con', 'int', 'wis', 'cha');
        suggestions.push('for', 'des', 'res', 'int', 'sab', 'car'); // Versões em português
      }

      return suggestions;
    }

    const lastArg = args[args.length - 1]?.toLowerCase() || '';

    // Sugestões de modificadores
    if (!args.includes('advantage') && !args.includes('vantagem')) {
      if ('advantage'.includes(lastArg) || 'vantagem'.includes(lastArg)) {
        suggestions.push('advantage', 'vantagem');
      }
    }

    if (!args.includes('disadvantage') && !args.includes('desvantagem')) {
      if ('disadvantage'.includes(lastArg) || 'desvantagem'.includes(lastArg)) {
        suggestions.push('disadvantage', 'desvantagem');
      }
    }

    // Sugestões de dados comuns
    if (lastArg.endsWith('d') || lastArg.match(/\d+d$/)) {
      ['4', '6', '8', '10', '12', '20', '100'].forEach((sides) => {
        suggestions.push(`${lastArg}${sides}`);
      });
    }

    return suggestions;
  }

  /**
   * Constrói expressão de dados a partir dos argumentos
   */
  private buildDiceExpression(args: string[]): string {
    return args.join(' ').trim();
  }

  /**
   * Valida se é uma expressão de dados válida
   */
  private isValidDiceExpression(expression: string): boolean {
    // Regex para validar notação de dados: 1d20, 3d6+2, 2d8-1, etc.
    const diceRegex = /^\d+d\d+([+-]\d+)?$/i;
    return diceRegex.test(expression.replace(/\s/g, ''));
  }

  /**
   * Valida se é um atributo válido
   */
  private isValidAttribute(expression: string): boolean {
    const attributes = [
      'str',
      'dex',
      'con',
      'int',
      'wis',
      'cha',
      'for',
      'des',
      'res',
      'sab',
      'car',
    ];
    return attributes.includes(expression.toLowerCase().trim());
  }

  /**
   * Rola dados básicos
   */
  private rollDice(
    expression: string,
    hasAdvantage: boolean,
    hasDisadvantage: boolean,
  ): DiceRollResult {
    const cleanExpression = expression.replace(/\s/g, '');
    const match = cleanExpression.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

    if (!match) {
      throw new Error(`Expressão de dados inválida: ${expression}`);
    }

    const count = parseInt(match[1] || '1');
    const sides = parseInt(match[2] || '20');
    const modifier = match[3] ? parseInt(match[3]) : 0;

    if (count <= 0 || count > 100) {
      throw new Error('Número de dados deve ser entre 1 e 100');
    }

    if (sides <= 0 || sides > 1000) {
      throw new Error('Número de lados deve ser entre 1 e 1000');
    }

    const rolls: number[] = [];

    // Para vantagem/desvantagem em d20, rolar 2 dados mesmo se especificado 1
    const actualCount =
      (hasAdvantage || hasDisadvantage) && sides === 20 && count === 1 ? 2 : count;

    for (let i = 0; i < actualCount; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    let total: number;
    let usedRolls: number[];

    if ((hasAdvantage || hasDisadvantage) && sides === 20 && count === 1) {
      // Para vantagem/desvantagem, usar o maior/menor dos dois d20
      usedRolls = hasAdvantage ? [Math.max(...rolls)] : [Math.min(...rolls)];
      total = (usedRolls[0] || 0) + modifier;
    } else {
      usedRolls = rolls;
      total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    }

    return {
      expression: cleanExpression,
      rolls,
      usedRolls,
      modifier,
      total,
      isAdvantage: hasAdvantage,
      isDisadvantage: hasDisadvantage,
    };
  }

  /**
   * Rola teste de atributo
   */
  private rollAttribute(
    attribute: string,
    context: CommandExecutionContext,
    hasAdvantage: boolean,
    hasDisadvantage: boolean,
  ): DiceRollResult {
    // Mapeamento de atributos
    const attrMap: Record<string, string> = {
      str: 'força',
      for: 'força',
      dex: 'destreza',
      des: 'destreza',
      con: 'resistencia',
      res: 'resistencia',
      int: 'inteligencia',
      wis: 'sabedoria',
      sab: 'sabedoria',
      cha: 'carisma',
      car: 'carisma',
    };

    const attrName = attrMap[attribute.toLowerCase()] || attribute;
    let bonus = 0;

    // Tentar obter bônus do personagem se disponível
    if (context.currentCharacter) {
      // TODO: Implementar obtenção real de bônus do personagem
      // bonus = context.currentCharacter.getModificadorAtributo(attrName);
      bonus = Math.floor((10 - 10) / 2); // Placeholder: assumir 10 base = +0
    }

    // Rolar 1d20 + bônus
    const roll =
      hasAdvantage || hasDisadvantage
        ? [Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1]
        : [Math.floor(Math.random() * 20) + 1];

    const usedRoll = hasAdvantage
      ? Math.max(...roll)
      : hasDisadvantage
        ? Math.min(...roll)
        : roll[0] || 0;

    return {
      expression: `${attrName} (1d20${bonus >= 0 ? '+' : ''}${bonus})`,
      rolls: roll,
      usedRolls: [usedRoll],
      modifier: bonus,
      total: usedRoll + bonus,
      isAdvantage: hasAdvantage,
      isDisadvantage: hasDisadvantage,
      attribute: attrName,
    };
  }

  /**
   * Formata resultado da rolagem para exibição
   */
  private formatRollResult(
    roller: string,
    expression: string,
    result: DiceRollResult,
    hasAdvantage: boolean,
    hasDisadvantage: boolean,
  ): string {
    let message = `🎲 ${roller} rola ${expression}: `;

    if (result.rolls.length > 1 && (hasAdvantage || hasDisadvantage)) {
      const advantageText = hasAdvantage ? 'vantagem' : 'desvantagem';
      message += `[${result.rolls.join(', ')}] ${advantageText} → `;
    } else if (result.rolls.length > 1) {
      message += `[${result.rolls.join(' + ')}]`;
    } else {
      message += `${result.rolls[0]}`;
    }

    if (result.modifier !== 0) {
      message += ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}`;
    }

    message += ` = **${result.total}**`;

    // Adicionar comentário para d20s especiais
    if (result.usedRolls.includes(20) && expression.includes('d20')) {
      message += ' 🎯 (Crítico!)';
    } else if (result.usedRolls.includes(1) && expression.includes('d20')) {
      message += ' 💥 (Falha crítica!)';
    }

    return message;
  }
}

/**
 * Interface para resultado de rolagem de dados
 */
interface DiceRollResult {
  expression: string;
  rolls: number[];
  usedRolls: number[];
  modifier: number;
  total: number;
  isAdvantage: boolean;
  isDisadvantage: boolean;
  attribute?: string;
}
