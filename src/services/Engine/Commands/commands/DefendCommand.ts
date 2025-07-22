import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /defend para ações defensivas em combate
 *
 * Sintaxe:
 * - /defend - Ação defensiva básica (aumenta AC)
 * - /defend @aliado - Defende um aliado específico
 * - /defend --dodge - Foco em esquiva
 * - /defend --block - Usar escudo para bloquear
 * - /defend --parry - Aparar com arma
 */
export class DefendCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'defend',
      aliases: ['def', 'defender', 'defesa'],
      description: 'Realiza ação defensiva em combate',
      syntax: '/defend [@aliado] [--dodge|--block|--parry]',
      category: CommandCategory.COMBAT,
      requiresTarget: false,
      requiresCombat: true,
      adminOnly: false,
    };

    super(config);
  }

  validate(args: string[], context: CommandExecutionContext) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar se tem personagem ativo
    if (!context.currentCharacter) {
      errors.push('É necessário ter um personagem ativo para defender');
    }

    // Verificar se está em combate
    if (!context.environment.combatActive) {
      errors.push('Comando de defesa só pode ser usado em combate');
    }

    // Verificar se é o turno do personagem
    if (
      context.currentCharacter &&
      context.environment.currentTurn !== context.currentCharacter.id
    ) {
      warnings.push('Não é o seu turno');
    }

    // Verificar aliado protegido (se especificado)
    const target = this.extractTarget(args);
    if (target) {
      const targetCharacter = context.allCharacters.find(
        (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
      );

      if (!targetCharacter) {
        errors.push(`Aliado "${target}" não encontrado`);
      } else if (!context.environment.participants.includes(targetCharacter.id)) {
        warnings.push(`Aliado "${target}" não está na cena atual`);
      } else if (targetCharacter.id === context.currentCharacter?.id) {
        warnings.push('Não é necessário especificar a si mesmo como alvo de defesa');
      }
    }

    // Verificar tipo de defesa
    const defenseType = this.extractDefenseType(args);
    if (defenseType && context.currentCharacter) {
      const validationResult = this.validateDefenseType(defenseType, context.currentCharacter);
      if (!validationResult.isValid) {
        warnings.push(validationResult.message);
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
      const defender = context.currentCharacter!;
      const targetName = this.extractTarget(args);
      const defenseType = this.extractDefenseType(args) || 'basic';

      // Encontrar aliado protegido (se especificado)
      let protectedAlly = null;
      if (targetName) {
        protectedAlly = context.allCharacters.find(
          (char) => char.id === targetName || char.nome.toLowerCase() === targetName.toLowerCase(),
        );
      }

      // Calcular efeito defensivo
      const defenseResult = this.calculateDefense(defenseType, defender, protectedAlly);

      const defendEvent = {
        type: 'defend',
        defender: {
          id: defender.id,
          name: defender.nome,
        },
        protectedAlly: protectedAlly
          ? {
              id: protectedAlly.id,
              name: protectedAlly.nome,
            }
          : null,
        defenseType,
        bonus: defenseResult.bonus,
        duration: defenseResult.duration,
        effects: defenseResult.effects,
        timestamp: Date.now(),
      };

      // Construir mensagem de resultado
      let resultMessage = `🛡️ ${defender.nome} assume postura defensiva`;

      if (protectedAlly) {
        resultMessage += ` protegendo ${protectedAlly.nome}`;
      }

      resultMessage += `! ${defenseResult.description}`;

      if (defenseResult.bonus > 0) {
        resultMessage += ` (+${defenseResult.bonus} AC`;
        if (defenseResult.duration > 1) {
          resultMessage += ` por ${defenseResult.duration} turnos`;
        }
        resultMessage += ')';
      }

      // TODO: Aplicar efeitos defensivos reais
      // defender.aplicarEfeitoDefensivo(defenseResult);
      // if (protectedAlly) {
      //   protectedAlly.aplicarProtecao(defender, defenseResult);
      // }

      return Promise.resolve({
        success: true,
        message: resultMessage,
        data: defendEvent,
        timestamp: Date.now(),
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao defender: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir aliados e tipos de defesa
    if (args.length === 0) {
      // Aliados próximos
      context.allCharacters
        .filter(
          (char) =>
            char.id !== context.currentCharacter?.id &&
            context.environment.participants.includes(char.id),
        )
        .slice(0, 3)
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });

      // Tipos de defesa
      suggestions.push('--dodge', '--block', '--parry');
    }

    const lastArg = args[args.length - 1];

    // Se último argumento começa com @, sugerir aliados
    if (lastArg?.startsWith('@')) {
      const partial = lastArg.substring(1).toLowerCase();

      context.allCharacters
        .filter(
          (char) =>
            char.id !== context.currentCharacter?.id &&
            char.nome.toLowerCase().includes(partial) &&
            context.environment.participants.includes(char.id),
        )
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });
    }

    // Sugerir tipos de defesa se não foram usados
    const defenseTypes = ['--dodge', '--block', '--parry'];
    defenseTypes.forEach((type) => {
      if (!args.includes(type)) {
        if (!lastArg || type.includes(lastArg)) {
          suggestions.push(type);
        }
      }
    });

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
   * Extrai tipo de defesa dos argumentos
   */
  private extractDefenseType(args: string[]): DefenseType | null {
    if (args.includes('--dodge')) return 'dodge';
    if (args.includes('--block')) return 'block';
    if (args.includes('--parry')) return 'parry';
    return null;
  }

  /**
   * Valida se o personagem pode usar o tipo de defesa especificado
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private validateDefenseType(_defenseType: DefenseType, _character: unknown): ValidationResult {
    // TODO: Implementar validação real baseada no personagem
    // switch (defenseType) {
    //   case 'block':
    //     const hasShield = character.equipamentos.temEscudo();
    //     return { isValid: hasShield, message: hasShield ? '' : 'Escudo necessário para bloquear' };
    //   case 'parry':
    //     const hasWeapon = character.equipamentos.temArmaAparar();
    //     return { isValid: hasWeapon, message: hasWeapon ? '' : 'Arma apropriada necessária para aparar' };
    //   case 'dodge':
    //     return { isValid: true, message: '' };
    // }

    // Placeholder - sempre válido
    return { isValid: true, message: '' };
  }

  /**
   * Calcula efeito defensivo baseado no tipo e personagem
   */
  private calculateDefense(
    defenseType: DefenseType,
    defender: unknown,
    protectedAlly: unknown | null,
  ): DefenseResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _defender = defender; // Para evitar warning de unused
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _protectedAlly = protectedAlly; // Para evitar warning de unused

    let bonus = 0;
    const duration = 1;
    let description = '';
    const effects: string[] = [];

    switch (defenseType) {
      case 'dodge':
        bonus = 2;
        description = 'Foco total em esquiva, aumentando agilidade';
        effects.push('Esquiva aprimorada');
        break;

      case 'block':
        bonus = 3;
        description = 'Escudo posicionado para bloquear ataques';
        effects.push('Bloqueio com escudo');
        // TODO: Verificar se tem escudo e calcular bonus real
        break;

      case 'parry':
        bonus = 2;
        description = 'Arma preparada para aparar golpes';
        effects.push('Aparar com arma');
        // TODO: Verificar tipo de arma e calcular bonus
        break;

      default: // 'basic'
        bonus = 1;
        description = 'Postura defensiva básica';
        effects.push('Defesa básica');
        break;
    }

    // TODO: Aplicar modificadores do personagem
    // const dexBonus = defender.getModificadorAtributo('destreza');
    // bonus += Math.max(0, dexBonus);

    return {
      bonus,
      duration,
      description,
      effects,
    };
  }
}

/**
 * Tipos de defesa disponíveis
 */
type DefenseType = 'basic' | 'dodge' | 'block' | 'parry';

/**
 * Resultado de validação
 */
interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Resultado de ação defensiva
 */
interface DefenseResult {
  bonus: number;
  duration: number;
  description: string;
  effects: string[];
}
