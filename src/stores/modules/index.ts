/**
 * ✅ Stores Modules Index - Exportações centralizadas das stores modernas
 *
 * Arquivo central para importar todas as stores modernas do sistema
 * seguindo o padrão enterprise definido nas diretrizes.
 */

// Store de Personagens (Enterprise Pattern)
export { usePersonagemStore, Personagem_Store } from './personagem/Personagem_Store';

// Store de Itens (Enterprise Pattern)
export { useItemStore, Item_Store } from './item/Item_Store';
