import { defineStore } from 'pinia';
import { transformClass } from '../../../utils/transformClass';
import type { Item } from '../../../domain/entities/Items/Item';
import { Arma } from '../../../domain/entities/Items/Arma';
import { Armadura } from '../../../domain/entities/Items/Armadura';
import { Consumivel } from '../../../domain/entities/Items/Consumivel';
import type { Item_Data, ItemConfig } from '../../../domain/entities/Items/Item_Data';
import type { Arma_Data, ArmaConfig } from '../../../domain/entities/Items/Arma_Data';
import type { Armadura_Data, ArmaduraConfig } from '../../../domain/entities/Items/Armadura_Data';
import type {
  Consumivel_Data,
  ConsumivelConfig,
} from '../../../domain/entities/Items/Consumivel_Data';
import { TipoItem, RaridadeItem } from '../../../domain/entities/Items/Item_Data';
import { PersistenceManager } from '../../../services/Infrastructure/PersistenceManager';

/**
 * ✅ Store moderna para gerenciamento de itens
 *
 * Implementa o padrão enterprise definido nas diretrizes:
 * - Classe TypeScript com métodos e propriedades
 * - Uso das entidades Domain corretas
 * - Padrão transformClass para reatividade Pinia
 * - Separação clara entre estado, getters e actions
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

  get armas(): Item[] {
    return this.itens.filter((item) => item.tipo === TipoItem.ARMA);
  }

  get armaduras(): Item[] {
    return this.itens.filter(
      (item) => item.tipo === TipoItem.ARMADURA || item.tipo === TipoItem.ESCUDO,
    );
  }

  get consumiveis(): Item[] {
    return this.itens.filter((item) => item.tipo === TipoItem.CONSUMIVEL);
  }

  get itensComuns(): Item[] {
    return this.itens.filter((item) => item.raridade === RaridadeItem.COMUM);
  }

  get itensRaros(): Item[] {
    return this.itens.filter(
      (item) =>
        item.raridade === RaridadeItem.RARO ||
        item.raridade === RaridadeItem.MUITO_RARO ||
        item.raridade === RaridadeItem.LENDARIO,
    );
  }

  get itensMagicos(): Item[] {
    return this.itens.filter((item) => item.magico);
  }

  // =====================================
  // 🎯 ACTIONS - Métodos da store
  // =====================================

  /**
   * Carrega todos os itens do sistema de persistência
   */
  async carregarItens(): Promise<void> {
    this.carregando = true;
    this.erro = null;

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();

      // Listar índice dos itens
      const indiceItens = await persistence.listarItens();

      // Carregar cada item completo
      const itensCarregados: Item[] = [];
      for (const indice of indiceItens) {
        const itemData = await persistence.carregarItem(indice.id);
        if (itemData && typeof itemData === 'object' && 'data' in itemData) {
          // Se carregou uma instância de Item
          itensCarregados.push(itemData as Item);
        } else if (itemData) {
          // Se carregou dados brutos, tentar criar item
          const item = this.criarItemDeserializado(itemData);
          if (item) {
            itensCarregados.push(item);
          }
        }
      }

      this.itens = itensCarregados;
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      this.erro = 'Erro ao carregar itens';
    } finally {
      this.carregando = false;
    }
  }

  /**
   * Salva um item no sistema de persistência
   */
  async salvarItem(item: Item): Promise<void> {
    if (!item.data) {
      throw new Error('Item sem dados para salvar');
    }

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.salvarItem(item);

      // Atualizar no array local
      const index = this.itens.findIndex((i) => i.data?.id === item.data?.id);
      if (index >= 0) {
        this.itens[index] = item;
      } else {
        this.itens.push(item);
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      this.erro = 'Erro ao salvar item';
      throw error;
    }
  }

  /**
   * Cria um novo item baseado no tipo e configuração
   */
  async criarItem(config: ItemConfig & { tipo: TipoItem }): Promise<Item> {
    try {
      let item: Item;

      switch (config.tipo) {
        case TipoItem.ARMA:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item = Arma.createArmaFromConfig(config as any);
          break;
        case TipoItem.ARMADURA:
        case TipoItem.ESCUDO:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item = Armadura.createArmaduraFromConfig(config as any);
          break;
        case TipoItem.CONSUMIVEL:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item = Consumivel.createConsumivelFromConfig(config as any);
          break;
        default:
          throw new Error(`Tipo de item não suportado: ${config.tipo}`);
      }

      await this.salvarItem(item);
      return item;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      this.erro = 'Erro ao criar item';
      throw error;
    }
  }

  /**
   * Atualiza dados de um item existente
   */
  async atualizarItem(id: string, updates: Partial<Item_Data>): Promise<void> {
    try {
      const item = this.itens.find((i) => i.data?.id === id);
      if (!item || !item.data) {
        throw new Error(`Item com ID ${id} não encontrado`);
      }

      // Atualizar dados usando método da entidade
      item.updateData(updates);
      await this.salvarItem(item);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      this.erro = 'Erro ao atualizar item';
      throw error;
    }
  }

  /**
   * Remove um item
   */
  async removerItem(id: string): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.removerItem(id);

      // Remover do array local
      const index = this.itens.findIndex((i) => i.data?.id === id);
      if (index >= 0) {
        this.itens.splice(index, 1);
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      this.erro = 'Erro ao remover item';
      throw error;
    }
  }

  /**
   * Busca item por ID
   */
  buscarItem(id: string): Item | null {
    return this.itens.find((i) => i.data?.id === id) || null;
  }

  /**
   * Busca itens por nome (parcial)
   */
  buscarPorNome(nome: string): Item[] {
    const termoBusca = nome.toLowerCase();
    return this.itens.filter((item) => item.nome.toLowerCase().includes(termoBusca));
  }

  /**
   * Filtra itens por critérios
   */
  filtrarItens(filtro: {
    tipo?: TipoItem;
    raridade?: RaridadeItem;
    magico?: boolean;
    valorMin?: number;
    valorMax?: number;
    pesoMax?: number;
  }): Item[] {
    return this.itens.filter((item) => {
      const data = item.data;
      if (!data) return false;

      if (filtro.tipo && data.tipo !== filtro.tipo) {
        return false;
      }
      if (filtro.raridade && data.raridade !== filtro.raridade) {
        return false;
      }
      if (filtro.magico !== undefined && data.magico !== filtro.magico) {
        return false;
      }
      if (filtro.valorMin !== undefined && data.valor < filtro.valorMin) {
        return false;
      }
      if (filtro.valorMax !== undefined && data.valor > filtro.valorMax) {
        return false;
      }
      if (filtro.pesoMax !== undefined && data.peso > filtro.pesoMax) {
        return false;
      }

      return true;
    });
  }

  /**
   * Cria itens a partir de dados serializados (migração)
   */
  criarItemDeserializado(dados: Record<string, unknown>): Item | null {
    try {
      const tipo = dados.tipo as TipoItem;

      switch (tipo) {
        case TipoItem.ARMA:
          return Arma.createArma(dados as unknown as Arma_Data);
        case TipoItem.ARMADURA:
        case TipoItem.ESCUDO:
          return Armadura.createArmadura(dados as unknown as Armadura_Data);
        case TipoItem.CONSUMIVEL:
          return Consumivel.createConsumivel(dados as unknown as Consumivel_Data);
        default:
          console.warn(`Tipo de item desconhecido: ${tipo}`);
          return null;
      }
    } catch (error) {
      console.error('Erro ao deserializar item:', error);
      return null;
    }
  }

  /**
   * Limpa erros
   */
  limparErro(): void {
    this.erro = null;
  }

  /**
   * Reset completo da store
   */
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
