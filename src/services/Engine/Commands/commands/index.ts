// Índice de comandos disponíveis no sistema
export { BaseCommand } from './BaseCommand';
export { TalkCommand } from './TalkCommand';
export { AttackCommand } from './AttackCommand';
export { RollCommand } from './RollCommand';
export { CastCommand } from './CastCommand';
export { MoveCommand } from './MoveCommand';
export { HealCommand } from './HealCommand';
export { DefendCommand } from './DefendCommand';
export { AIControlCommand } from './AIControlCommand';

// Re-exportar tipos importantes
export type { CommandConfig, CommandResult, CommandValidation } from './BaseCommand';
