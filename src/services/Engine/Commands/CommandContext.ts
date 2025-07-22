import type { Personagem } from '../../../domain/entities/Character/Personagem';
import type { SessaoJogo } from '../../../classes/SessaoJogo';

/**
 * Contexto de execução para comandos
 *
 * Fornece todas as informações necessárias para que um comando
 * possa ser executado, incluindo dados da sessão, personagens
 * e estado atual do jogo.
 */
export interface CommandExecutionContext {
  // Identificadores básicos
  userId: string;
  sessionId: string;
  characterId?: string;
  timestamp: number;

  // Estado do ambiente de jogo
  environment: GameEnvironment;

  // Dados da sessão
  session?: SessaoJogo;
  currentCharacter?: Personagem;
  allCharacters: Personagem[];

  // Configurações de execução
  permissions: UserPermissions;
  settings: CommandSettings;
}

export interface GameEnvironment {
  currentScene?: string;
  participants: string[];
  turnOrder?: string[];
  combatActive: boolean;
  currentTurn?: string;
  mapId?: string;
  ambientConditions?: AmbientConditions;
}

export interface AmbientConditions {
  lighting: 'bright' | 'dim' | 'dark' | 'magical';
  weather?: 'clear' | 'rain' | 'storm' | 'fog' | 'snow';
  temperature?: 'cold' | 'cool' | 'warm' | 'hot';
  noise?: 'silent' | 'quiet' | 'normal' | 'loud' | 'deafening';
}

export interface UserPermissions {
  isGM: boolean;
  canControlNPCs: boolean;
  canModifyEnvironment: boolean;
  canUseCheats: boolean;
  canAccessDebugCommands: boolean;
}

export interface CommandSettings {
  autoComplete: boolean;
  confirmDestructiveActions: boolean;
  showDetailedFeedback: boolean;
  logCommands: boolean;
  privateMode: boolean;
}

/**
 * Builder para criar contextos de comando facilmente
 */
export class CommandContextBuilder {
  private context: Partial<CommandExecutionContext> = {};

  static create(): CommandContextBuilder {
    return new CommandContextBuilder();
  }

  withUser(userId: string): CommandContextBuilder {
    this.context.userId = userId;
    return this;
  }

  withSession(sessionId: string, session?: SessaoJogo): CommandContextBuilder {
    this.context.sessionId = sessionId;
    if (session) {
      this.context.session = session;
    }
    return this;
  }

  withCharacter(characterId: string, character?: Personagem): CommandContextBuilder {
    this.context.characterId = characterId;
    if (character) {
      this.context.currentCharacter = character;
    }
    return this;
  }

  withEnvironment(environment: Partial<GameEnvironment>): CommandContextBuilder {
    this.context.environment = {
      participants: [],
      combatActive: false,
      ...environment,
    };
    return this;
  }

  withPermissions(permissions: Partial<UserPermissions>): CommandContextBuilder {
    this.context.permissions = {
      isGM: false,
      canControlNPCs: false,
      canModifyEnvironment: false,
      canUseCheats: false,
      canAccessDebugCommands: false,
      ...permissions,
    };
    return this;
  }

  withSettings(settings: Partial<CommandSettings>): CommandContextBuilder {
    this.context.settings = {
      autoComplete: true,
      confirmDestructiveActions: true,
      showDetailedFeedback: true,
      logCommands: true,
      privateMode: false,
      ...settings,
    };
    return this;
  }

  withAllCharacters(characters: Personagem[]): CommandContextBuilder {
    this.context.allCharacters = characters;
    return this;
  }

  build(): CommandExecutionContext {
    // Validar campos obrigatórios
    if (!this.context.userId) {
      throw new Error('UserId é obrigatório no contexto de comando');
    }
    if (!this.context.sessionId) {
      throw new Error('SessionId é obrigatório no contexto de comando');
    }

    // Definir defaults
    const defaultContext: CommandExecutionContext = {
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      timestamp: Date.now(),
      environment: {
        participants: [],
        combatActive: false,
        ...this.context.environment,
      },
      allCharacters: this.context.allCharacters || [],
      permissions: {
        isGM: false,
        canControlNPCs: false,
        canModifyEnvironment: false,
        canUseCheats: false,
        canAccessDebugCommands: false,
        ...this.context.permissions,
      },
      settings: {
        autoComplete: true,
        confirmDestructiveActions: true,
        showDetailedFeedback: true,
        logCommands: true,
        privateMode: false,
        ...this.context.settings,
      },
    };

    // Adicionar propriedades opcionais se existirem
    if (this.context.characterId) {
      defaultContext.characterId = this.context.characterId;
    }
    if (this.context.session) {
      defaultContext.session = this.context.session;
    }
    if (this.context.currentCharacter) {
      defaultContext.currentCharacter = this.context.currentCharacter;
    }

    return defaultContext;
  }
}

/**
 * Utilitários para trabalhar com contexto de comando
 */
export class CommandContextUtils {
  /**
   * Verifica se o usuário tem permissão para executar um comando
   */
  static hasPermission(
    context: CommandExecutionContext,
    requirement: keyof UserPermissions,
  ): boolean {
    return context.permissions[requirement] === true;
  }

  /**
   * Encontra personagem por ID ou nome
   */
  static findCharacter(
    context: CommandExecutionContext,
    identifier: string,
  ): Personagem | undefined {
    return context.allCharacters.find(
      (char) =>
        char.id === identifier || char.nome.toLowerCase().includes(identifier.toLowerCase()),
    );
  }

  /**
   * Verifica se um personagem está participando da cena atual
   */
  static isParticipant(context: CommandExecutionContext, characterId: string): boolean {
    return context.environment.participants.includes(characterId);
  }

  /**
   * Verifica se está em combate
   */
  static isInCombat(context: CommandExecutionContext): boolean {
    return context.environment.combatActive;
  }

  /**
   * Verifica se é o turno do personagem
   */
  static isCharacterTurn(context: CommandExecutionContext, characterId: string): boolean {
    return context.environment.currentTurn === characterId;
  }

  /**
   * Obtém próximo personagem na ordem de turnos
   */
  static getNextInTurnOrder(context: CommandExecutionContext): string | undefined {
    const { turnOrder, currentTurn } = context.environment;
    if (!turnOrder || !currentTurn) return undefined;

    const currentIndex = turnOrder.indexOf(currentTurn);
    if (currentIndex === -1) return turnOrder[0];

    const nextIndex = (currentIndex + 1) % turnOrder.length;
    return turnOrder[nextIndex];
  }

  /**
   * Cria cópia do contexto com modificações
   */
  static modify(
    context: CommandExecutionContext,
    changes: Partial<CommandExecutionContext>,
  ): CommandExecutionContext {
    return {
      ...context,
      ...changes,
      environment: {
        ...context.environment,
        ...(changes.environment || {}),
      },
      permissions: {
        ...context.permissions,
        ...(changes.permissions || {}),
      },
      settings: {
        ...context.settings,
        ...(changes.settings || {}),
      },
    };
  }
}
