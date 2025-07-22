import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /heal para cura de personagens
 *
 * Sintaxe:
 * - /heal @alvo - Cura básica no alvo
 * - /heal @alvo [quantidade] - Cura quantidade específica
 * - /heal self - Cura a si mesmo
 * - /heal @alvo --potion [nome] - Usar poção específica
 */
export class HealCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'heal',
      aliases: ['cure', 'curar', 'cura'],
      description: 'Cura pontos de vida de um personagem',
      syntax: '/heal [@alvo] [quantidade] [--potion nome]',
      category: CommandCategory.ACTION,
      requiresTarget: true,
      requiresCombat: false,
      adminOnly: false,
    };

    super(config);
  }

  validate(args: string[], context: CommandExecutionContext) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar se tem personagem ativo
    if (!context.currentCharacter) {
      errors.push('É necessário ter um personagem ativo para curar');
    }

    const target = this.extractTarget(args);
    const isSelfHeal = args.includes('self') || args.includes('eu');

    // Verificar se tem alvo (exceto self-heal)
    if (!target && !isSelfHeal) {
      errors.push('É necessário especificar um alvo para curar (use @alvo ou "self")');
    }

    // Verificar se o alvo existe
    if (target) {
      const targetCharacter = context.allCharacters.find(
        (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
      );

      if (!targetCharacter) {
        errors.push(`Alvo "${target}" não encontrado`);
      } else if (!context.environment.participants.includes(targetCharacter.id)) {
        warnings.push(`Alvo "${target}" não está na cena atual`);
      }
    }

    // Verificar quantidade de cura (se especificada)
    const healAmount = this.extractHealAmount(args);
    if (healAmount !== null && healAmount <= 0) {
      errors.push('Quantidade de cura deve ser maior que zero');
    }

    // Verificar poção (se especificada)
    const potionName = this.extractPotion(args);
    if (potionName && context.currentCharacter) {
      // TODO: Verificar se o personagem tem a poção
      // const hasPotion = context.currentCharacter.inventario.temItem(potionName);
      // if (!hasPotion) {
      //   errors.push(`Poção "${potionName}" não encontrada no inventário`);
      // }
      warnings.push(`Verificação de inventário não implementada para poção "${potionName}"`);
    }

    // Verificar se é turno do personagem em combate
    if (
      context.environment.combatActive &&
      context.currentCharacter &&
      context.environment.currentTurn !== context.currentCharacter.id
    ) {
      warnings.push('Não é o seu turno');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  execute(args: string[], context: CommandExecutionContext): Promise<CommandResult> {
    try {
      const healer = context.currentCharacter!;
      const targetName = this.extractTarget(args);
      const isSelfHeal = args.includes('self') || args.includes('eu');
      const healAmount = this.extractHealAmount(args);
      const potionName = this.extractPotion(args);

      // Determinar o alvo
      let target = null;
      if (isSelfHeal) {
        target = healer;
      } else if (targetName) {
        target = context.allCharacters.find(
          (char) => char.id === targetName || char.nome.toLowerCase() === targetName.toLowerCase(),
        );
      }

      if (!target) {
        return Promise.resolve({
          success: false,
          message: 'Alvo para cura não encontrado',
          timestamp: Date.now(),
        });
      }

      // Calcular cura
      const healResult = this.calculateHealing(healAmount, potionName, healer);

      const healEvent = {
        type: 'heal',
        healer: {
          id: healer.id,
          name: healer.nome,
        },
        target: {
          id: target.id,
          name: target.nome,
        },
        healing: healResult.amount,
        method: healResult.method,
        potionUsed: potionName || null,
        timestamp: Date.now(),
      };

      // Aplicar cura (simulação)
      const targetName_display = target.nome;
      const healerName = healer.nome;

      let resultMessage: string;

      if (isSelfHeal) {
        resultMessage = `💚 ${healerName} se cura por ${healResult.amount} pontos de vida`;
      } else {
        resultMessage = `💚 ${healerName} cura ${targetName_display} por ${healResult.amount} pontos de vida`;
      }

      if (potionName) {
        resultMessage += ` usando ${potionName}`;
      }

      resultMessage += `! ${healResult.description}`;

      // TODO: Aplicar cura real ao personagem
      // target.curar(healResult.amount);

      return Promise.resolve({
        success: true,
        message: resultMessage,
        data: healEvent,
        timestamp: Date.now(),
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao curar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir alvos e self
    if (args.length === 0) {
      suggestions.push('self', 'eu');

      context.allCharacters
        .filter((char) => context.environment.participants.includes(char.id))
        .slice(0, 5)
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });
    }

    const lastArg = args[args.length - 1];
    const secondLastArg = args[args.length - 2];

    // Se último argumento começa com @, sugerir personagens
    if (lastArg?.startsWith('@')) {
      const partial = lastArg.substring(1).toLowerCase();

      context.allCharacters
        .filter(
          (char) =>
            char.nome.toLowerCase().includes(partial) &&
            context.environment.participants.includes(char.id),
        )
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });
    }

    // Se último argumento é --potion, sugerir poções
    if (secondLastArg === '--potion') {
      // TODO: Obter poções do inventário
      // if (context.currentCharacter) {
      //   const potions = context.currentCharacter.inventario.getPoções();
      //   potions.forEach(potion => suggestions.push(potion.nome));
      // }

      // Poções comuns como placeholder
      suggestions.push('Poção de Cura', 'Poção Superior', 'Elixir Divino');
    }

    // Sugerir flags se não foram usados
    if (!args.some((arg) => arg === '--potion')) {
      suggestions.push('--potion');
    }

    // Sugerir quantidades comuns
    if (!args.some((arg) => /^\d+$/.test(arg))) {
      suggestions.push('10', '20', '30', '50');
    }

    return suggestions;
  }

  /**
   * Extrai alvo dos argumentos
   */
  private extractTarget(args: string[]): string | null {
    const targetArg = args.find((arg) => arg.startsWith('@'));
    return targetArg ? targetArg.substring(1) : null;
  }

  /**
   * Extrai quantidade de cura dos argumentos
   */
  private extractHealAmount(args: string[]): number | null {
    const numberArg = args.find((arg) => /^\d+$/.test(arg));
    return numberArg ? parseInt(numberArg) : null;
  }

  /**
   * Extrai nome da poção dos argumentos
   */
  private extractPotion(args: string[]): string | null {
    const potionIndex = args.indexOf('--potion');
    if (potionIndex !== -1 && potionIndex + 1 < args.length) {
      return args[potionIndex + 1] || null;
    }
    return null;
  }

  /**
   * Calcula quantidade de cura baseada nos parâmetros
   */
  private calculateHealing(
    amount: number | null,
    potionName: string | null,
    healer: unknown,
  ): HealResult {
    let healAmount: number;
    let method: string;
    let description: string;

    if (potionName) {
      // Cura usando poção
      const potionData = this.getPotionData(potionName);
      healAmount = potionData.healing;
      method = 'potion';
      description = potionData.description;
    } else if (amount !== null) {
      // Cura com quantidade específica
      healAmount = amount;
      method = 'specific';
      description = 'Cura direcionada aplicada';
    } else {
      // Cura básica
      healAmount = Math.floor(Math.random() * 8) + 1 + this.getHealerBonus(healer); // 1d8 + bonus
      method = 'basic';
      description = 'Energia curativa básica aplicada';
    }

    return {
      amount: healAmount,
      method,
      description,
    };
  }

  /**
   * Obtém dados de uma poção
   */
  private getPotionData(potionName: string): { healing: number; description: string } {
    const potions: Record<string, { healing: number; description: string }> = {
      'poção de cura': {
        healing: Math.floor(Math.random() * 8) + 2, // 1d8+1
        description: 'Poção vermelha borbulhante restaura vitalidade',
      },
      'poção superior': {
        healing: Math.floor(Math.random() * 16) + 4, // 2d8+2
        description: 'Poção mágica superior acelera regeneração',
      },
      'elixir divino': {
        healing: Math.floor(Math.random() * 24) + 8, // 3d8+5
        description: 'Elixir abençoado por divindades restaura completamente',
      },
    };

    const normalizedName = potionName.toLowerCase();
    return (
      potions[normalizedName] || {
        healing: Math.floor(Math.random() * 6) + 1,
        description: 'Poção desconhecida com efeito incerto',
      }
    );
  }

  /**
   * Obtém bônus de cura do curandeiro
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getHealerBonus(_healer: unknown): number {
    // TODO: Implementar obtenção real de bônus
    // const wisdomBonus = healer.getModificadorAtributo('sabedoria');
    // return wisdomBonus;

    return 0; // Placeholder
  }
}

/**
 * Resultado de cura
 */
interface HealResult {
  amount: number;
  method: string;
  description: string;
}
