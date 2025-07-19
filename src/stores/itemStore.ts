import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Item } from '../classes/Item';
import type { Arma } from '../classes/Arma';
import type { Armadura } from '../classes/Armadura';
import { TipoItem, RaridadeItem } from '../types';

export const useItemStore = defineStore('item', () => {
  // Estado
  const itens = ref<Item[]>([]);
  const carregando = ref(false);
  const erro = ref<string | null>(null);

  // Computed
  const totalItens = computed(() => itens.value.length);

  const itensPorTipo = computed(() => {
    const grupos: Record<TipoItem, Item[]> = {
      [TipoItem.ARMA]: [],
      [TipoItem.ARMADURA]: [],
      [TipoItem.ESCUDO]: [],
      [TipoItem.CONSUMIVEL]: [],
      [TipoItem.MAGICO]: [],
      [TipoItem.FERRAMENTA]: [],
      [TipoItem.TESOURO]: [],
      [TipoItem.OUTRO]: [],
    };

    itens.value.forEach((item) => {
      grupos[item.tipo].push(item as Item);
    });

    return grupos;
  });

  const itensPorRaridade = computed(() => {
    const grupos: Record<RaridadeItem, Item[]> = {
      [RaridadeItem.COMUM]: [],
      [RaridadeItem.INCOMUM]: [],
      [RaridadeItem.RARO]: [],
      [RaridadeItem.MUITO_RARO]: [],
      [RaridadeItem.LENDARIO]: [],
      [RaridadeItem.ARTEFATO]: [],
    };

    itens.value.forEach((item) => {
      grupos[item.raridade].push(item as Item);
    });

    return grupos;
  });

  const armas = computed(() => itens.value.filter((item) => item.tipo === TipoItem.ARMA) as Arma[]);

  const armaduras = computed(
    () => itens.value.filter((item) => item.tipo === TipoItem.ARMADURA) as Armadura[],
  );

  // Actions
  function carregarItens(): Promise<void> {
    carregando.value = true;
    erro.value = null;

    try {
      // TODO: Implementar carregamento quando PersistenceManager suportar itens
      console.warn(
        'carregarItens: Funcionalidade não implementada - PersistenceManager precisa suportar itens',
      );
      itens.value = [];
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      erro.value = 'Erro ao carregar itens';
      return Promise.reject(new Error('Erro ao carregar itens'));
    } finally {
      carregando.value = false;
    }
  }

  function salvarItem(item: Item): Promise<void> {
    try {
      // TODO: Implementar salvamento quando PersistenceManager suportar itens
      console.warn(
        'salvarItem: Funcionalidade não implementada - PersistenceManager precisa suportar itens',
      );

      // Atualizar no array local
      const index = itens.value.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        itens.value[index] = item;
      } else {
        itens.value.push(item);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      erro.value = 'Erro ao salvar item';
      return Promise.reject(new Error('Erro ao salvar item'));
    }
  }

  function deletarItem(id: string): Promise<void> {
    try {
      // TODO: Implementar remoção quando PersistenceManager suportar itens
      console.warn(
        'deletarItem: Funcionalidade não implementada - PersistenceManager precisa suportar itens',
      );

      // Remover do array local
      const index = itens.value.findIndex((i) => i.id === id);
      if (index >= 0) {
        itens.value.splice(index, 1);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      erro.value = 'Erro ao deletar item';
      return Promise.reject(new Error('Erro ao deletar item'));
    }
  }

  function limparErro(): void {
    erro.value = null;
  }

  function obterItemPorId(id: string): Item | undefined {
    return itens.value.find((i) => i.id === id) as Item | undefined;
  }

  function obterItemPorNome(nome: string): Item | undefined {
    return itens.value.find((i) => i.nome.toLowerCase() === nome.toLowerCase()) as Item | undefined;
  }

  function filtrarItens(filtro: {
    nome?: string;
    tipo?: TipoItem;
    raridade?: RaridadeItem;
    valorMin?: number;
    valorMax?: number;
    pesoMax?: number;
  }): Item[] {
    return itens.value.filter((item) => {
      if (filtro.nome && !item.nome.toLowerCase().includes(filtro.nome.toLowerCase())) {
        return false;
      }

      if (filtro.tipo && item.tipo !== filtro.tipo) {
        return false;
      }

      if (filtro.raridade && item.raridade !== filtro.raridade) {
        return false;
      }

      if (filtro.valorMin !== undefined && item.valor < filtro.valorMin) {
        return false;
      }

      if (filtro.valorMax !== undefined && item.valor > filtro.valorMax) {
        return false;
      }

      if (filtro.pesoMax !== undefined && item.peso > filtro.pesoMax) {
        return false;
      }

      return true;
    }) as Item[];
  }

  function buscarItens(termo: string): Item[] {
    const termoLower = termo.toLowerCase();
    return itens.value.filter(
      (item) =>
        item.nome.toLowerCase().includes(termoLower) ||
        item.descricao.toLowerCase().includes(termoLower),
    ) as Item[];
  }

  function ordenarItens(
    campo: 'nome' | 'tipo' | 'raridade' | 'valor' | 'peso',
    direcao: 'asc' | 'desc' = 'asc',
  ): void {
    itens.value.sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (campo) {
        case 'nome':
          valueA = a.nome.toLowerCase();
          valueB = b.nome.toLowerCase();
          break;
        case 'tipo':
          valueA = a.tipo;
          valueB = b.tipo;
          break;
        case 'raridade':
          valueA = a.raridade;
          valueB = b.raridade;
          break;
        case 'valor':
          valueA = a.valor;
          valueB = b.valor;
          break;
        case 'peso':
          valueA = a.peso;
          valueB = b.peso;
          break;
      }

      if (direcao === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }

  return {
    // Estado
    itens,
    carregando,
    erro,

    // Computed
    totalItens,
    itensPorTipo,
    itensPorRaridade,
    armas,
    armaduras,

    // Actions
    carregarItens,
    salvarItem,
    deletarItem,
    limparErro,
    obterItemPorId,
    obterItemPorNome,
    filtrarItens,
    buscarItens,
    ordenarItens,
  };
});
