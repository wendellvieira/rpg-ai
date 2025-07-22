import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /attack para ataques básicos em combate
 *
 * Sintaxe:
 * - /attack [alvo] - Ataque físico básico
 * - /attack [alvo] --weapon [arma] - Ataque com arma específica
 * - /attack [alvo] --power [valor] - Ataque com força específica
 */
export class AttackCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'attack',
      aliases: ['att', 'ataque', 'atacar'],
      description: 'Realiza um ataque físico contra um alvo',
      syntax: '/attack [alvo] [--weapon arma] [--power valor]',
      category: CommandCategory.COMBAT,
      requiresTarget: true,
      requiresCombat: true,
      adminOnly: false,
    };

    super(config);
  }

  validate(args: string[], context: CommandExecutionContext) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar se está em combate
    if (!context.environment.combatActive) {
      errors.push('Comando de ataque só pode ser usado em combate');
    }

    // Verificar se tem personagem ativo
    if (!context.currentCharacter) {
      errors.push('É necessário ter um personagem ativo para atacar');
    }

    // Verificar se tem alvo
    const targets = this.extractTargets(args);
    if (targets.length === 0) {
      errors.push('É necessário especificar um alvo para atacar');
    }

    // Verificar se o alvo existe
    if (targets.length > 0) {
      const targetName = targets[0];
      if (targetName) {
        const target = context.allCharacters.find(
          (char) => char.id === targetName || char.nome.toLowerCase() === targetName.toLowerCase(),
        );

        if (!target) {
          errors.push(`Alvo "${targetName}" não encontrado`);
        } else if (target.id === context.currentCharacter?.id) {
          errors.push('Não é possível atacar a si mesmo');
        }
      }
    }

    // Verificar se é o turno do personagem
    if (
      context.currentCharacter &&
      context.environment.currentTurn !== context.currentCharacter.id
    ) {
      warnings.push('Não é o seu turno');
    }

    // Verificar arma especificada
    const weaponFlag = this.getFlag(args, 'weapon');
    if (weaponFlag && context.currentCharacter) {
      // TODO: Verificar se o personagem possui a arma
      // const hasWeapon = context.currentCharacter.inventario.temItem(weaponFlag);
      // if (!hasWeapon) {
      //   warnings.push(`Arma "${weaponFlag}" não encontrada no inventário`);
      // }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  execute(args: string[], context: CommandExecutionContext): Promise<CommandResult> {
    try {
      const targets = this.extractTargets(args);
      const attacker = context.currentCharacter!;
      const targetName = targets[0];

      if (!targetName) {
        return Promise.resolve({
          success: false,
          message: 'Alvo não especificado',
          timestamp: Date.now(),
        });
      }

      // Encontrar o alvo
      const target = context.allCharacters.find(
        (char) => char.id === targetName || char.nome.toLowerCase() === targetName.toLowerCase(),
      );

      if (!target) {
        return Promise.resolve({
          success: false,
          message: `Alvo "${targetName}" não encontrado`,
          timestamp: Date.now(),
        });
      }

      // Extrair parâmetros do ataque
      const weaponName = this.getFlag(args, 'weapon') || 'ataque básico';
      const powerModifier = parseInt(this.getFlag(args, 'power') || '0');

      // Simular cálculo de ataque (implementação básica)
      const attackRoll = Math.floor(Math.random() * 20) + 1; // d20
      const damage = Math.max(1, Math.floor(Math.random() * 8) + 1 + powerModifier); // d8 + modifier

      const attackEvent = {
        type: 'attack',
        attacker: {
          id: attacker.id,
          name: attacker.nome,
        },
        target: {
          id: target.id,
          name: target.nome,
        },
        weapon: weaponName,
        attackRoll,
        damage,
        timestamp: Date.now(),
        hit: attackRoll >= 10, // AC básico de 10
      };

      let resultMessage: string;

      if (attackEvent.hit) {
        resultMessage = `${attacker.nome} ataca ${target.nome} com ${weaponName} e acerta! Rolagem: ${attackRoll}, Dano: ${damage}`;

        // TODO: Aplicar dano ao alvo
        // target.receberDano(damage);
      } else {
        resultMessage = `${attacker.nome} ataca ${target.nome} com ${weaponName} mas erra! Rolagem: ${attackRoll}`;
      }

      return Promise.resolve({
        success: true,
        message: resultMessage,
        data: attackEvent,
        timestamp: Date.now(),
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao executar ataque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir inimigos próximos
    if (args.length === 0) {
      context.allCharacters
        .filter(
          (char) =>
            char.id !== context.currentCharacter?.id &&
            context.environment.participants.includes(char.id),
        )
        .slice(0, 5)
        .forEach((char) => {
          suggestions.push(char.nome);
        });
    }

    // Se último argumento é um flag, sugerir valores
    const lastArg = args[args.length - 1];
    const secondLastArg = args[args.length - 2];

    if (secondLastArg === '--weapon') {
      // TODO: Sugerir armas do inventário
      suggestions.push('espada', 'arco', 'machado', 'adaga');
    } else if (secondLastArg === '--power') {
      suggestions.push('1', '2', '3', '4', '5');
    } else if (lastArg === '--weapon' || lastArg === '--power') {
      // Não sugerir nada, aguardando valor do flag
      return [];
    }

    // Sugerir flags disponíveis
    if (!args.some((arg) => arg === '--weapon')) {
      suggestions.push('--weapon');
    }
    if (!args.some((arg) => arg === '--power')) {
      suggestions.push('--power');
    }

    return suggestions;
  }

  /**
   * Extrai nomes de alvos dos argumentos (sem flags)
   */
  private extractTargets(args: string[]): string[] {
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (!arg) continue;

      // Pular flags e seus valores
      if (arg.startsWith('--')) {
        i++; // Pular também o valor do flag
        continue;
      }

      targets.push(arg);
    }

    return targets;
  }

  /**
   * Extrai valor de um flag específico
   */
  private getFlag(args: string[], flagName: string): string | null {
    const flagIndex = args.indexOf(`--${flagName}`);
    if (flagIndex !== -1 && flagIndex + 1 < args.length) {
      const value = args[flagIndex + 1];
      return value || null;
    }
    return null;
  }
}
