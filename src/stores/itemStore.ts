import { defineStore } from 'pinia';
import { transformClass } from '../utils/transformClass';
import type { Item } from '../domain/entities/Items/Item';

/**
 * Store para gerenciamento de itens
 */
export class Item_Store {
  // =====================================
  // 🏗️ STATE - Estado da store
  // =====================================
  public itens: Item[] = [];
  public carregando = false;
  public erro: string | null = null;

  // =====================================
  // 🔍 GETTERS - Propriedades computadas
  // =====================================
  get totalItens(): number {
    return this.itens.length;
  }

  // =====================================
  // 🎯 ACTIONS - Métodos da store
  // =====================================
  async carregarItens(): Promise<void> {
    this.carregando = true;
    this.erro = null;

    try {
      // TODO: Implementar carregamento de itens
      this.itens = [];
      await Promise.resolve(); // Temporário para resolver o lint
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      this.erro = 'Erro ao carregar itens';
    } finally {
      this.carregando = false;
    }
  }

  async salvarItem(item: Item): Promise<void> {
    try {
      // TODO: Implementar salvamento de item
      const index = this.itens.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        this.itens[index] = item;
      } else {
        this.itens.push(item);
      }
      await Promise.resolve(); // Temporário para resolver o lint
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      this.erro = 'Erro ao salvar item';
      throw error;
    }
  }

  async deletarItem(id: string): Promise<void> {
    try {
      const index = this.itens.findIndex((i) => i.id === id);
      if (index >= 0) {
        this.itens.splice(index, 1);
      }
      await Promise.resolve(); // Temporário para resolver o lint
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      this.erro = 'Erro ao deletar item';
      throw error;
    }
  }

  async salvarItemFormulario(data: Record<string, unknown>): Promise<void> {
    try {
      // TODO: Implementar salvamento de formulário de item
      console.log('Salvando item do formulário:', data);
      await Promise.resolve(); // Temporário para resolver o lint
    } catch (error) {
      console.error('Erro ao salvar item do formulário:', error);
      this.erro = 'Erro ao salvar item do formulário';
      throw error;
    }
  }

  obterItemPorId(id: string): Item | undefined {
    return this.itens.find((i) => i.id === id);
  }

  reset(): void {
    this.itens = [];
    this.carregando = false;
    this.erro = null;
  }
}

// =====================================
// 🏪 EXPORT PINIA STORE
// =====================================
export const useItemStore = defineStore('item', () => {
  return transformClass(Item_Store);
});
