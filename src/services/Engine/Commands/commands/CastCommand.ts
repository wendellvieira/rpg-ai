import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /cast para conjuração de magias
 *
 * Sintaxe:
 * - /cast [magia] - Conjura magia sem alvo
 * - /cast [magia] @alvo - Conjura magia em alvo específico
 * - /cast [magia] --level [nível] - Conjura em nível específico
 * - /cast [magia] @alvo --level [nível] - Conjura em alvo com nível específico
 */
export class CastCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'cast',
      aliases: ['conjurar', 'magia', 'spell'],
      description: 'Conjura uma magia do repertório do personagem',
      syntax: '/cast [magia] [@alvo] [--level nível]',
      category: CommandCategory.ACTION,
      requiresTarget: false,
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
      errors.push('É necessário ter um personagem ativo para conjurar magias');
    }

    // Verificar se especificou a magia
    const spellName = this.extractSpellName(args);
    if (!spellName) {
      errors.push('É necessário especificar o nome da magia');
    }

    // Verificar se a magia existe no repertório (placeholder)
    if (spellName && context.currentCharacter) {
      // TODO: Verificar se o personagem conhece a magia
      // const knownSpells = context.currentCharacter.getMagiasConhecidas();
      // if (!knownSpells.some(spell => spell.nome.toLowerCase() === spellName.toLowerCase())) {
      //   errors.push(`Magia "${spellName}" não encontrada no repertório`);
      // }
    }

    // Verificar se o alvo existe (se especificado)
    const target = this.extractTarget(args);
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

    // Verificar nível da magia (se especificado)
    const spellLevel = this.extractSpellLevel(args);
    if (spellLevel !== null) {
      if (spellLevel < 1 || spellLevel > 9) {
        errors.push('Nível de magia deve ser entre 1 e 9');
      }

      // TODO: Verificar se o personagem tem slots do nível
      // if (context.currentCharacter) {
      //   const availableSlots = context.currentCharacter.getSlotsDisponiveis(spellLevel);
      //   if (availableSlots <= 0) {
      //     errors.push(`Não há slots de magia de nível ${spellLevel} disponíveis`);
      //   }
      // }
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
      const caster = context.currentCharacter!;
      const spellName = this.extractSpellName(args);
      const target = this.extractTarget(args);
      const spellLevel = this.extractSpellLevel(args);

      if (!spellName) {
        return Promise.resolve({
          success: false,
          message: 'Nome da magia não especificado',
          timestamp: Date.now(),
        });
      }

      // Encontrar alvo se especificado
      let targetCharacter = null;
      if (target) {
        targetCharacter = context.allCharacters.find(
          (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
        );
      }

      // Simular conjuração da magia
      const castResult = this.simulateSpellCasting(spellName, caster, targetCharacter, spellLevel);

      const castEvent = {
        type: 'spell_cast',
        caster: {
          id: caster.id,
          name: caster.nome,
        },
        spell: {
          name: spellName,
          level: spellLevel || 1,
        },
        target: targetCharacter
          ? {
              id: targetCharacter.id,
              name: targetCharacter.nome,
            }
          : null,
        result: castResult,
        timestamp: Date.now(),
      };

      let resultMessage = `✨ ${caster.nome} conjura ${spellName}`;

      if (spellLevel && spellLevel > 1) {
        resultMessage += ` (nível ${spellLevel})`;
      }

      if (targetCharacter) {
        resultMessage += ` em ${targetCharacter.nome}`;
      }

      resultMessage += `! ${castResult.description}`;

      // Adicionar efeitos da magia
      if (castResult.damage > 0) {
        resultMessage += ` Dano: ${castResult.damage}`;
      }

      if (castResult.healing > 0) {
        resultMessage += ` Cura: ${castResult.healing}`;
      }

      return Promise.resolve({
        success: true,
        message: resultMessage,
        data: castEvent,
        timestamp: Date.now(),
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao conjurar magia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir magias conhecidas
    if (args.length === 0) {
      // TODO: Obter magias conhecidas do personagem
      // if (context.currentCharacter) {
      //   const knownSpells = context.currentCharacter.getMagiasConhecidas();
      //   knownSpells.forEach(spell => suggestions.push(spell.nome));
      // }

      // Magias comuns como placeholder
      suggestions.push('Míssil Mágico', 'Cura', 'Bola de Fogo', 'Escudo', 'Luz');
    }

    const lastArg = args[args.length - 1];
    const secondLastArg = args[args.length - 2];

    // Se último argumento começa com @, sugerir alvos
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

    // Se último argumento é --level, sugerir níveis
    if (secondLastArg === '--level') {
      for (let i = 1; i <= 9; i++) {
        suggestions.push(i.toString());
      }
    }

    // Sugerir flags se não foram usados
    if (!args.some((arg) => arg === '--level')) {
      suggestions.push('--level');
    }

    // Sugerir targets se não foi especificado
    if (!args.some((arg) => arg.startsWith('@'))) {
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
    }

    return suggestions;
  }

  /**
   * Extrai nome da magia dos argumentos
   */
  private extractSpellName(args: string[]): string | null {
    const spellWords: string[] = [];

    for (const arg of args) {
      // Parar em targets ou flags
      if (arg.startsWith('@') || arg.startsWith('--')) {
        break;
      }
      spellWords.push(arg);
    }

    return spellWords.length > 0 ? spellWords.join(' ') : null;
  }

  /**
   * Extrai alvo dos argumentos
   */
  private extractTarget(args: string[]): string | null {
    const targetArg = args.find((arg) => arg.startsWith('@'));
    return targetArg ? targetArg.substring(1) : null;
  }

  /**
   * Extrai nível da magia dos argumentos
   */
  private extractSpellLevel(args: string[]): number | null {
    const levelIndex = args.indexOf('--level');
    if (levelIndex !== -1 && levelIndex + 1 < args.length) {
      const level = parseInt(args[levelIndex + 1] || '1');
      return isNaN(level) ? null : level;
    }
    return null;
  }

  /**
   * Simula conjuração de magia
   */
  private simulateSpellCasting(
    spellName: string,
    caster: unknown,
    target: unknown,
    level?: number | null,
  ): SpellCastResult {
    const actualLevel = level || 1;

    // Database de magias simples para demonstração
    const spellDatabase: Record<string, SpellTemplate> = {
      'míssil mágico': {
        damage: (lvl) => lvl * 3 + 1,
        description: 'Projéteis mágicos atingem o alvo automaticamente',
        needsTarget: true,
      },
      cura: {
        healing: (lvl) => Math.floor(Math.random() * 8) + lvl,
        description: 'Energia divina restaura pontos de vida',
        needsTarget: true,
      },
      'bola de fogo': {
        damage: (lvl) => Math.floor(Math.random() * 6 * lvl) + lvl,
        description: 'Explosão flamejante causa dano em área',
        needsTarget: true,
      },
      escudo: {
        description: 'Campo de força protege contra ataques',
        needsTarget: false,
      },
      luz: {
        description: 'Objeto brilha como uma tocha',
        needsTarget: false,
      },
    };

    const spellKey = spellName.toLowerCase();
    const spell = spellDatabase[spellKey];

    if (!spell) {
      return {
        success: false,
        description: 'Magia desconhecida',
        damage: 0,
        healing: 0,
      };
    }

    // Verificar se precisa de alvo
    if (spell.needsTarget && !target) {
      return {
        success: false,
        description: 'Esta magia requer um alvo',
        damage: 0,
        healing: 0,
      };
    }

    // Calcular efeitos
    const damage = spell.damage ? spell.damage(actualLevel) : 0;
    const healing = spell.healing ? spell.healing(actualLevel) : 0;

    return {
      success: true,
      description: spell.description,
      damage,
      healing,
    };
  }
}

/**
 * Template para magias simples
 */
interface SpellTemplate {
  damage?: (level: number) => number;
  healing?: (level: number) => number;
  description: string;
  needsTarget: boolean;
}

/**
 * Resultado da conjuração de magia
 */
interface SpellCastResult {
  success: boolean;
  description: string;
  damage: number;
  healing: number;
}
