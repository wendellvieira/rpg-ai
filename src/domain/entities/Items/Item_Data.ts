import type { TipoItem, RaridadeItem } from '../../../types';

/**
 * Interface para dados de persistência do Item
 */
export interface Item_Data {
  id: string;
  nome: string;
  tipo: TipoItem;
  descricao: string;
  valor: number;
  peso: number;
  raridade: RaridadeItem;
  magico: boolean;
  propriedades: Record<string, unknown>;
  imagemUrl?: string;
}

/**
 * Configuração para criação de Item via factory
 */
export interface ItemConfig {
  id?: string;
  nome: string;
  tipo: TipoItem;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  propriedades?: Record<string, unknown>;
  imagemUrl?: string;
}

// Re-exports dos enums necessários
export { TipoItem, RaridadeItem } from '../../../types';
