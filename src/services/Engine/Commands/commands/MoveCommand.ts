import {
  BaseCommand,
  CommandCategory,
  type CommandConfig,
  type CommandResult,
} from './BaseCommand';
import type { CommandExecutionContext } from '../CommandContext';

/**
 * Comando /move para movimentação entre locais
 *
 * Sintaxe:
 * - /move [local] - Move para um local específico
 * - /move [direção] - Move em uma direção (norte, sul, leste, oeste)
 * - /move back - Volta para o local anterior
 */
export class MoveCommand extends BaseCommand {
  constructor() {
    const config: CommandConfig = {
      name: 'move',
      aliases: ['go', 'ir', 'mover', 'andar'],
      description: 'Move o personagem para um novo local ou direção',
      syntax: '/move [local/direção] ou /move back',
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
      errors.push('É necessário ter um personagem ativo para se mover');
    }

    // Verificar se especificou destino
    if (args.length === 0) {
      errors.push('É necessário especificar para onde se mover');
    }

    const destination = args.join(' ').trim().toLowerCase();

    // Verificar se está em combate
    if (context.environment.combatActive) {
      warnings.push('Movimento em combate pode provocar ataques de oportunidade');
    }

    // Verificar se o destino é válido
    if (destination) {
      const validDestinations = this.getValidDestinations(context);
      const isValidDestination = validDestinations.some(
        (dest) => dest.toLowerCase() === destination || dest.toLowerCase().includes(destination),
      );

      if (!isValidDestination && destination !== 'back' && destination !== 'voltar') {
        warnings.push(
          `Local "${destination}" pode não estar disponível. Use auto-complete para ver opções.`,
        );
      }
    }

    // Verificar se não está em combate crítico
    if (context.environment.combatActive && context.currentCharacter) {
      // TODO: Verificar se o personagem está em combate direto
      // const inDirectCombat = checkDirectCombat(context.currentCharacter);
      // if (inDirectCombat) {
      //   warnings.push('Sair de combate direto pode ser perigoso');
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
      const character = context.currentCharacter!;
      const destination = args.join(' ').trim();

      if (!destination) {
        return Promise.resolve({
          success: false,
          message: 'Destino não especificado',
          timestamp: Date.now(),
        });
      }

      // Processar movimento especial "back"
      if (destination.toLowerCase() === 'back' || destination.toLowerCase() === 'voltar') {
        return this.handleBackMovement(character, context);
      }

      // Processar movimento normal
      const moveResult = this.processMovement(character, destination, context);

      const moveEvent = {
        type: 'movement',
        character: {
          id: character.id,
          name: character.nome,
        },
        from: context.environment.currentScene || 'Local Desconhecido',
        to: destination,
        success: moveResult.success,
        timestamp: Date.now(),
      };

      return Promise.resolve({
        success: moveResult.success,
        message: moveResult.message,
        data: moveEvent,
        timestamp: Date.now(),
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Erro ao se mover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }

  getAutoComplete(args: string[], context: CommandExecutionContext): string[] {
    const suggestions: string[] = [];

    // Se não tem argumentos, sugerir destinos disponíveis
    if (args.length === 0 || (args.length === 1 && !args[0]?.includes(' '))) {
      const validDestinations = this.getValidDestinations(context);
      const partial = args[0]?.toLowerCase() || '';

      // Filtrar destinos que começam com o que foi digitado
      validDestinations
        .filter((dest) => dest.toLowerCase().includes(partial))
        .forEach((dest) => suggestions.push(dest));

      // Direções básicas
      const directions = [
        'norte',
        'sul',
        'leste',
        'oeste',
        'nordeste',
        'noroeste',
        'sudeste',
        'sudoeste',
      ];
      directions.filter((dir) => dir.includes(partial)).forEach((dir) => suggestions.push(dir));

      // Comandos especiais
      if ('back'.includes(partial) || 'voltar'.includes(partial)) {
        suggestions.push('back', 'voltar');
      }
    }

    return suggestions;
  }

  /**
   * Processa movimento para destino específico
   */
  private processMovement(
    character: unknown,
    destination: string,
    context: CommandExecutionContext,
  ): MovementResult {
    const currentLocation = context.environment.currentScene || 'Local Desconhecido';

    // Validar se o destino existe
    const validDestinations = this.getValidDestinations(context);
    const normalizedDestination = destination.toLowerCase();

    const matchingDestination = validDestinations.find(
      (dest) =>
        dest.toLowerCase() === normalizedDestination ||
        dest.toLowerCase().includes(normalizedDestination),
    );

    if (!matchingDestination) {
      return {
        success: false,
        message: `❌ Não foi possível encontrar o local "${destination}". Locais disponíveis: ${validDestinations.join(', ')}`,
      };
    }

    // Simular movimento
    const character_name = (character as { nome?: string })?.nome || 'Personagem';

    // TODO: Aqui seria atualizado o estado real do mapa/cena
    // context.environment.currentScene = matchingDestination;

    return {
      success: true,
      message: `🚶 ${character_name} se move de ${currentLocation} para ${matchingDestination}`,
    };
  }

  /**
   * Processa movimento "voltar"
   */
  private handleBackMovement(
    character: unknown,
    context: CommandExecutionContext,
  ): Promise<CommandResult> {
    const character_name = (character as { nome?: string })?.nome || 'Personagem';
    const currentLocation = context.environment.currentScene || 'Local Atual';

    // TODO: Implementar histórico de movimentos
    // const previousLocation = context.movementHistory?.getPrevious();
    const previousLocation = 'Local Anterior'; // Placeholder

    return Promise.resolve({
      success: true,
      message: `🔄 ${character_name} retorna de ${currentLocation} para ${previousLocation}`,
      data: {
        type: 'movement',
        character: {
          id: (character as { id?: string })?.id || 'unknown',
          name: character_name,
        },
        from: currentLocation,
        to: previousLocation,
        isBack: true,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Obtém destinos válidos baseado no contexto atual
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getValidDestinations(_context: CommandExecutionContext): string[] {
    // TODO: Obter destinos reais do mapa/cena atual
    // if (context.environment.currentScene) {
    //   return context.gameState.mapa.getDestinosDisponiveis(context.environment.currentScene);
    // }

    // Locais placeholder para demonstração
    const defaultLocations = [
      'Taverna do Javali Dourado',
      'Praça Central',
      'Mercado',
      'Templo',
      'Biblioteca',
      'Arsenal',
      'Muralhas da Cidade',
      'Portão Norte',
      'Portão Sul',
      'Floresta Sombria',
      'Cavernas Antigas',
    ];

    return defaultLocations;
  }
}

/**
 * Resultado de uma tentativa de movimento
 */
interface MovementResult {
  success: boolean;
  message: string;
}
