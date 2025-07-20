import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Item } from '../classes/Item';
import { Arma, type CategoriaArma, type TipoDano, type PropriedadeArma } from '../classes/Arma';
import { Armadura, type CategoriaArmadura } from '../classes/Armadura';
import { Consumivel, type TipoConsumivel } from '../classes/Consumivel';
import { TipoItem, RaridadeItem } from '../types';
import { PersistenceManager } from '../services/PersistenceManager';

/**
 * Cria uma instância de Item baseada nos dados serializados
 */
function criarItemDeserializado(dados: Record<string, unknown>): Item | null {
  try {
    const tipo = dados.tipo as TipoItem;

    switch (tipo) {
      case TipoItem.ARMA: {
        const propriedades = (dados.propriedades as Record<string, unknown>) || {};
        return new Arma({
          id: dados.id as string,
          nome: dados.nome as string,
          descricao: dados.descricao as string,
          valor: dados.valor as number,
          peso: dados.peso as number,
          raridade: dados.raridade as RaridadeItem,
          magico: dados.magico as boolean,
          imagemUrl: dados.imagemUrl as string,
          categoria: (propriedades.categoria as CategoriaArma) || 'corpo-a-corpo',
          dano: (propriedades.dano as string) || '1d4',
          tipoDano: (propriedades.tipoDano as TipoDano) || 'cortante',
          alcance: (propriedades.alcance as number) || 1.5,
          propriedades: (propriedades.propriedadesArma as PropriedadeArma[]) || [],
          critico: (propriedades.critico as number) || 2,
          bonusAtaque: (propriedades.bonusAtaque as number) || 0,
          bonusDano: (propriedades.bonusDano as number) || 0,
        });
      }

      case TipoItem.ARMADURA:
      case TipoItem.ESCUDO: {
        const propriedades = (dados.propriedades as Record<string, unknown>) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const armaduraData: any = {
          id: dados.id as string,
          nome: dados.nome as string,
          descricao: dados.descricao as string,
          valor: dados.valor as number,
          peso: dados.peso as number,
          raridade: dados.raridade as RaridadeItem,
          magico: dados.magico as boolean,
          imagemUrl: dados.imagemUrl as string,
          categoria: (propriedades.categoria as CategoriaArmadura) || 'leve',
          bonusCA: (propriedades.bonusCA as number) || 0,
        };

        // Adicionar propriedades opcionais apenas se existirem
        if (propriedades.maxDestreza !== undefined) {
          armaduraData.maxDestreza = propriedades.maxDestreza as number;
        }
        if (propriedades.forcaMinima !== undefined) {
          armaduraData.forcaMinima = propriedades.forcaMinima as number;
        }

        return new Armadura(armaduraData);
      }

      case TipoItem.CONSUMIVEL: {
        const propriedades = (dados.propriedades as Record<string, unknown>) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const consumivelData: any = {
          id: dados.id as string,
          nome: dados.nome as string,
          descricao: dados.descricao as string,
          valor: dados.valor as number,
          peso: dados.peso as number,
          raridade: dados.raridade as RaridadeItem,
          magico: dados.magico as boolean,
          imagemUrl: dados.imagemUrl as string,
          tipoConsumivel: (propriedades.tipoConsumivel as TipoConsumivel) || 'pocao',
          efeito: (propriedades.efeito as string) || '',
        };

        // Adicionar propriedades opcionais apenas se existirem
        if (propriedades.duracao !== undefined) {
          consumivelData.duracao = propriedades.duracao as string;
        }
        if (propriedades.cura !== undefined) {
          consumivelData.cura = propriedades.cura as number;
        }
        if (propriedades.usos !== undefined) {
          consumivelData.usos = propriedades.usos as number;
        }

        return new Consumivel(consumivelData);
      }

      default:
        // Para outros tipos, criar uma implementação genérica
        console.warn(`Tipo de item não implementado para deserialização: ${tipo}`);
        return null;
    }
  } catch (error) {
    console.error('Erro ao deserializar item:', error, dados);
    return null;
  }
}

/**
 * Cria uma instância de Item a partir de dados do formulário
 */
function criarItemDoFormulario(dados: Record<string, unknown>): Item | null {
  try {
    const tipo = dados.tipo as TipoItem;
    const id =
      (dados.id as string) || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const dadosBase = {
      id,
      nome: dados.nome as string,
      descricao: (dados.descricao as string) || '',
      valor: (dados.valor as number) || 0,
      peso: (dados.peso as number) || 0,
      raridade: (dados.raridade as RaridadeItem) || RaridadeItem.COMUM,
      magico: (dados.magico as boolean) || false,
      imagemUrl: (dados.imagemUrl as string) || '',
    };

    const propriedades = (dados.propriedades as Record<string, unknown>) || {};

    switch (tipo) {
      case TipoItem.ARMA:
        return new Arma({
          ...dadosBase,
          categoria: (propriedades.categoriaArma as CategoriaArma) || 'corpo-a-corpo',
          dano: (propriedades.dano as string) || '1d4',
          tipoDano: (propriedades.tipoDano as TipoDano) || 'cortante',
          alcance: (propriedades.alcance as number) || 1.5,
          propriedades: (propriedades.propriedadesArma as PropriedadeArma[]) || [],
          critico: (propriedades.critico as number) || 2,
          bonusAtaque: (propriedades.bonusAtaque as number) || 0,
          bonusDano: (propriedades.bonusDano as number) || 0,
        });

      case TipoItem.ARMADURA:
      case TipoItem.ESCUDO:
        return new Armadura({
          ...dadosBase,
          categoria: (propriedades.categoriaArmadura as CategoriaArmadura) || 'leve',
          bonusCA: (propriedades.bonusCA as number) || 0,
          maxDestreza: propriedades.maxDestreza as number,
          forcaMinima: propriedades.forcaMinima as number,
        });

      case TipoItem.CONSUMIVEL:
        return new Consumivel({
          ...dadosBase,
          tipoConsumivel: (propriedades.tipoConsumivel as TipoConsumivel) || 'pocao',
          efeito: (propriedades.efeito as string) || '',
          duracao: propriedades.duracao as string,
          cura: propriedades.cura as number,
          usos: propriedades.usos as number,
        });

      default:
        console.warn(`Tipo de item não suportado para criação: ${tipo}`);
        return null;
    }
  } catch (error) {
    console.error('Erro ao criar item do formulário:', error, dados);
    return null;
  }
}

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
  async function carregarItens(): Promise<void> {
    carregando.value = true;
    erro.value = null;

    try {
      const persistenceManager = PersistenceManager.getInstance();
      await persistenceManager.inicializar();

      const indiceItens = await persistenceManager.listarItens();
      const itensCarregados: Item[] = [];

      for (const itemInfo of indiceItens) {
        try {
          const itemData = await persistenceManager.carregarItem(itemInfo.id);
          if (itemData) {
            // Criar instância do item baseado no tipo
            const itemInstance = criarItemDeserializado(itemData);
            if (itemInstance) {
              itensCarregados.push(itemInstance);
            }
          }
        } catch (itemError) {
          console.warn(`Erro ao carregar item ${itemInfo.id}:`, itemError);
        }
      }

      itens.value = itensCarregados;
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      erro.value = 'Erro ao carregar itens';
      throw new Error('Erro ao carregar itens');
    } finally {
      carregando.value = false;
    }
  }

  async function salvarItem(item: Item): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.salvarItem(item);

      // Atualizar no array local
      const index = itens.value.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        itens.value[index] = item;
      } else {
        itens.value.push(item);
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      erro.value = 'Erro ao salvar item';
      throw new Error('Erro ao salvar item');
    }
  }

  async function salvarItemFormulario(dados: Record<string, unknown>): Promise<void> {
    const item = criarItemDoFormulario(dados);
    if (!item) {
      throw new Error('Não foi possível criar o item com os dados fornecidos');
    }
    await salvarItem(item);
  }

  async function deletarItem(id: string): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.removerItem(id);

      // Remover do array local
      const index = itens.value.findIndex((i) => i.id === id);
      if (index >= 0) {
        itens.value.splice(index, 1);
      }
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      erro.value = 'Erro ao deletar item';
      throw new Error('Erro ao deletar item');
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
    salvarItemFormulario,
    deletarItem,
    limparErro,
    obterItemPorId,
    obterItemPorNome,
    filtrarItens,
    buscarItens,
    ordenarItens,
  };
});
