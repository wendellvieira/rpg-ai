import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /talk para comunicação entre personagens
 *
 * Sintaxe:
 * - /talk [mensagem] - Fala para todos na cena
 * - /talk @npc [mensagem] - Fala especificamente para um NPC
 * - /talk @all [mensagem] - Fala para todos (equivalente ao primeiro)
 */
export class TalkCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'talk',
      aliases: ['say', 'speak', 'falar'],
      description: 'Fala uma mensagem para outros personagens na cena',
      syntax: '/talk [@alvo] [mensagem]',
      category: CommandCategory.COMMUNICATION,
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
      errors.push('É necessário ter um personagem ativo para falar');
    }

    // Verificar se tem mensagem
    if (args.length === 0) {
      errors.push('É necessário fornecer uma mensagem para falar');
    }

    // Verificar se a mensagem não está vazia após processar targets
    const messageWords = args.filter((arg) => !arg.startsWith('@'));
    if (messageWords.length === 0) {
      errors.push('Mensagem não pode estar vazia');
    }

    // Avisar se não há outros participantes
    if (context.environment.participants.length <= 1) {
      warnings.push('Não há outros personagens na cena para ouvir');
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
      const message = this.extractMessage(args);

      const speaker = context.currentCharacter!;
      const timestamp = Date.now();

      // Determinar quem deve receber a mensagem
      const recipients = this.resolveRecipients(targets, context);

      // Criar evento de fala
      const talkEvent = {
        type: 'talk',
        speaker: {
          id: speaker.id,
          name: speaker.nome,
        },
        message,
        targets: targets.length > 0 ? targets : ['all'],
        recipients: recipients.map((r) => r.id),
        timestamp,
        isPrivate: targets.length > 0 && !targets.includes('all'),
      };

      // TODO: Aqui seria enviado para o sistema de eventos/chat
      // Por enquanto, apenas simular o resultado

      let resultMessage = `${speaker.nome} diz: "${message}"`;

      if (targets.length > 0 && !targets.includes('all')) {
        const targetNames = recipients.map((r) => r.nome).join(', ');
        resultMessage = `${speaker.nome} fala para ${targetNames}: "${message}"`;
      }

      return Promise.resolve({
        success: true,
        message: resultMessage,
        data: talkEvent,
        timestamp,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao executar comando talk: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos ainda, sugerir targets comuns
    if (args.length === 0) {
      suggestions.push('@all', '@party');

      // Adicionar NPCs próximos
      context.allCharacters
        .filter((char) => char.id !== context.currentCharacter?.id)
        .slice(0, 5)
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });
    }

    // Se último argumento começa com @, sugerir personagens
    const lastArg = args[args.length - 1];
    if (lastArg?.startsWith('@')) {
      const partial = lastArg.substring(1).toLowerCase();

      context.allCharacters
        .filter(
          (char) =>
            char.id !== context.currentCharacter?.id && char.nome.toLowerCase().includes(partial),
        )
        .forEach((char) => {
          suggestions.push(`@${char.nome}`);
        });

      // Targets especiais
      ['all', 'party', 'npcs', 'players'].forEach((target) => {
        if (target.includes(partial)) {
          suggestions.push(`@${target}`);
        }
      });
    }

    return suggestions;
  }

  /**
   * Extrai targets dos argumentos
   */
  private extractTargets(args: string[]): string[] {
    return args.filter((arg) => arg.startsWith('@')).map((arg) => arg.substring(1));
  }

  /**
   * Extrai mensagem dos argumentos (sem targets)
   */
  private extractMessage(args: string[]): string {
    return args
      .filter((arg) => !arg.startsWith('@'))
      .join(' ')
      .trim();
  }

  /**
   * Resolve targets para personagens reais
   */
  private resolveRecipients(targets: string[], context: CommandExecutionContext) {
    if (targets.length === 0 || targets.includes('all')) {
      // Todos os participantes exceto o speaker
      return context.allCharacters.filter(
        (char) =>
          char.id !== context.currentCharacter?.id &&
          context.environment.participants.includes(char.id),
      );
    }

    const recipients = [];

    for (const target of targets) {
      // Targets especiais
      if (target === 'party') {
        // TODO: Implementar lógica de party
        continue;
      }
      if (target === 'npcs') {
        recipients.push(
          ...context.allCharacters.filter(
            (char) => char.isIA && context.environment.participants.includes(char.id),
          ),
        );
        continue;
      }
      if (target === 'players') {
        recipients.push(
          ...context.allCharacters.filter(
            (char) => !char.isIA && context.environment.participants.includes(char.id),
          ),
        );
        continue;
      }

      // Target específico por nome ou ID
      const character = context.allCharacters.find(
        (char) => char.id === target || char.nome.toLowerCase() === target.toLowerCase(),
      );

      if (character && context.environment.participants.includes(character.id)) {
        recipients.push(character);
      }
    }

    return recipients;
  }
}
