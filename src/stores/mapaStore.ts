import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  Mapa,
  type DadosMapaSerializados,
  type TipoObjetoMapa,
  type ObjetoMapa,
} from '../classes/Mapa';
import { DatabaseService } from '../services/DatabaseService';

const STORE_PREFIX = 'mapa_';
const INDEX_KEY = 'indice_mapas';

export const useMapaStore = defineStore('mapa', () => {
  // Estado
  const mapas = ref<Mapa[]>([]);
  const mapaAtivo = ref<Mapa | null>(null);
  const carregando = ref(false);
  const erro = ref<string | null>(null);

  // Serviços
  const dbService = new DatabaseService();

  // Computed
  const totalMapas = computed(() => mapas.value.length);

  const mapasPorNome = computed(() => {
    return mapas.value.slice().sort((a, b) => a.nome.localeCompare(b.nome));
  });

  const mapaAtualId = computed(() => mapaAtivo.value?.id || null);

  // Actions - Carregamento
  async function carregarMapas(): Promise<void> {
    carregando.value = true;
    erro.value = null;

    try {
      await dbService.inicializar();

      // Carregar índice de mapas
      const indice =
        (await dbService.getItem<Array<{ id: string; nome: string }>>(INDEX_KEY)) || [];

      // Carregar cada mapa
      const mapasCarregados: Mapa[] = [];
      for (const entrada of indice) {
        try {
          const dadosMapa = await dbService.getItem<DadosMapaSerializados>(
            STORE_PREFIX + entrada.id,
          );
          if (dadosMapa) {
            mapasCarregados.push(Mapa.fromJSON(dadosMapa));
          }
        } catch (error) {
          console.warn(`Erro ao carregar mapa ${entrada.id}:`, error);
        }
      }

      mapas.value = mapasCarregados;
      console.log(`Carregados ${mapas.value.length} mapas`);
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Erro ao carregar mapas';
      console.error('Erro ao carregar mapas:', error);
    } finally {
      carregando.value = false;
    }
  }

  // Actions - CRUD
  async function adicionarMapa(dados: Partial<DadosMapaSerializados>): Promise<Mapa> {
    const novoMapa = new Mapa(dados);

    // Validar mapa
    const validacao = novoMapa.validar();
    if (!validacao.valido) {
      throw new Error(`Mapa inválido: ${validacao.erros.join(', ')}`);
    }

    try {
      await dbService.inicializar();

      // Salvar mapa
      await dbService.setItem(STORE_PREFIX + novoMapa.id, novoMapa.paraJSON());

      // Atualizar índice
      await atualizarIndice(novoMapa);

      // Adicionar ao estado
      mapas.value.push(novoMapa);

      console.log(`Mapa adicionado: ${novoMapa.nome}`);
      return novoMapa;
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Erro ao adicionar mapa';
      throw error;
    }
  }

  async function editarMapa(id: string, dados: Partial<DadosMapaSerializados>): Promise<boolean> {
    const index = mapas.value.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error('Mapa não encontrado');
    }

    try {
      const mapaOriginal = mapas.value[index];
      if (!mapaOriginal) {
        throw new Error('Mapa não encontrado no estado');
      }

      // Criar nova instância com dados atualizados
      const dadosCompletos = {
        ...mapaOriginal.paraJSON(),
        ...dados,
        atualizadoEm: new Date().toISOString(),
      };

      const mapaAtualizado = new Mapa(dadosCompletos);

      // Validar mapa atualizado
      const validacao = mapaAtualizado.validar();
      if (!validacao.valido) {
        throw new Error(`Mapa inválido: ${validacao.erros.join(', ')}`);
      }

      await dbService.inicializar();

      // Salvar mapa atualizado
      await dbService.setItem(STORE_PREFIX + id, mapaAtualizado.paraJSON());

      // Atualizar índice
      await atualizarIndice(mapaAtualizado);

      // Atualizar estado
      mapas.value[index] = mapaAtualizado;

      // Se é o mapa ativo, atualizar também
      if (mapaAtivo.value?.id === id) {
        mapaAtivo.value = mapaAtualizado;
      }

      console.log(`Mapa editado: ${mapaAtualizado.nome}`);
      return true;
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Erro ao editar mapa';
      throw error;
    }
  }

  async function removerMapa(id: string): Promise<boolean> {
    const index = mapas.value.findIndex((m) => m.id === id);
    if (index === -1) {
      return false;
    }

    try {
      await dbService.inicializar();

      // Remover do banco
      await dbService.removeItem(STORE_PREFIX + id);

      // Remover do índice
      await removerDoIndice(id);

      // Remover do estado
      const mapaRemovido = mapas.value.splice(index, 1)[0];

      // Se era o mapa ativo, limpar
      if (mapaAtivo.value?.id === id) {
        mapaAtivo.value = null;
      }

      if (mapaRemovido) {
        console.log(`Mapa removido: ${mapaRemovido.nome}`);
      }
      return true;
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Erro ao remover mapa';
      throw error;
    }
  }

  async function duplicarMapa(id: string, novoNome?: string): Promise<Mapa> {
    const mapaOriginal = obterMapa(id);
    if (!mapaOriginal) {
      throw new Error('Mapa não encontrado');
    }

    const mapaDuplicado = mapaOriginal.clonar(novoNome);
    return await adicionarMapa(mapaDuplicado.paraJSON());
  }

  // Actions - Navegação
  function ativarMapa(mapa: Mapa | null): void {
    mapaAtivo.value = mapa;
  }

  function ativarMapaPorId(id: string): boolean {
    const mapa = obterMapa(id);
    if (mapa) {
      ativarMapa(mapa);
      return true;
    }
    return false;
  }

  // Actions - Objetos do mapa
  async function adicionarObjetoNoMapa(
    mapaId: string,
    objeto: Omit<ObjetoMapa, 'id'>,
  ): Promise<string> {
    const mapa = obterMapa(mapaId);
    if (!mapa) {
      throw new Error('Mapa não encontrado');
    }

    const objetoId = mapa.adicionarObjeto(objeto);

    // Salvar mapa atualizado
    await salvarMapa(mapa);

    return objetoId;
  }

  async function removerObjetoDoMapa(mapaId: string, objetoId: string): Promise<boolean> {
    const mapa = obterMapa(mapaId);
    if (!mapa) {
      return false;
    }

    const removido = mapa.removerObjeto(objetoId);

    if (removido) {
      await salvarMapa(mapa);
    }

    return removido;
  }

  async function editarObjetoNoMapa(
    mapaId: string,
    objetoId: string,
    dados: Partial<ObjetoMapa>,
  ): Promise<boolean> {
    const mapa = obterMapa(mapaId);
    if (!mapa) {
      return false;
    }

    const editado = mapa.editarObjeto(objetoId, dados);

    if (editado) {
      await salvarMapa(mapa);
    }

    return editado;
  }

  async function moverObjetoNoMapa(
    mapaId: string,
    objetoId: string,
    novaPosicao: { x: number; y: number },
  ): Promise<boolean> {
    const mapa = obterMapa(mapaId);
    if (!mapa) {
      return false;
    }

    const movido = mapa.moverObjeto(objetoId, novaPosicao);

    if (movido) {
      await salvarMapa(mapa);
    }

    return movido;
  }

  // Helpers privados
  async function salvarMapa(mapa: Mapa): Promise<void> {
    await dbService.inicializar();
    await dbService.setItem(STORE_PREFIX + mapa.id, mapa.paraJSON());
    await atualizarIndice(mapa);
  }

  async function atualizarIndice(mapa: Mapa): Promise<void> {
    const indice = (await dbService.getItem<Array<{ id: string; nome: string }>>(INDEX_KEY)) || [];

    const entrada = {
      id: mapa.id,
      nome: mapa.nome,
    };

    const indiceExistente = indice.findIndex((m) => m.id === mapa.id);
    if (indiceExistente >= 0) {
      indice[indiceExistente] = entrada;
    } else {
      indice.push(entrada);
    }

    await dbService.setItem(INDEX_KEY, indice);
  }

  async function removerDoIndice(id: string): Promise<void> {
    const indice = (await dbService.getItem<Array<{ id: string; nome: string }>>(INDEX_KEY)) || [];
    const novoIndice = indice.filter((m) => m.id !== id);
    await dbService.setItem(INDEX_KEY, novoIndice);
  }

  // Getters
  function obterMapa(id: string): Mapa | undefined {
    return mapas.value.find((m) => m.id === id) as Mapa | undefined;
  }

  function obterMapaPorNome(nome: string): Mapa | undefined {
    return mapas.value.find((m) => m.nome.toLowerCase() === nome.toLowerCase()) as Mapa | undefined;
  }

  function filtrarMapas(filtro: string): Mapa[] {
    if (!filtro.trim()) {
      return mapas.value as Mapa[];
    }

    const termo = filtro.toLowerCase();
    return mapas.value.filter(
      (mapa) =>
        mapa.nome.toLowerCase().includes(termo) || mapa.descricao.toLowerCase().includes(termo),
    ) as Mapa[];
  }

  // Utilitários
  function limparErro(): void {
    erro.value = null;
  }

  function reset(): void {
    mapas.value = [];
    mapaAtivo.value = null;
    carregando.value = false;
    erro.value = null;
  }

  // Estatísticas
  const estatisticas = computed(() => {
    if (mapas.value.length === 0) {
      return {
        totalMapas: 0,
        totalObjetos: 0,
        objetosPorTipo: {} as Record<TipoObjetoMapa, number>,
        mapaComMaisObjetos: null as Mapa | null,
      };
    }

    const objetosPorTipo: Record<TipoObjetoMapa, number> = {} as Record<TipoObjetoMapa, number>;
    let totalObjetos = 0;
    let mapaComMaisObjetos = mapas.value[0];

    for (const mapa of mapas.value) {
      totalObjetos += mapa.objetos.length;

      if (mapaComMaisObjetos && mapa.objetos.length > mapaComMaisObjetos.objetos.length) {
        mapaComMaisObjetos = mapa;
      }

      for (const objeto of mapa.objetos) {
        objetosPorTipo[objeto.tipo] = (objetosPorTipo[objeto.tipo] || 0) + 1;
      }
    }

    return {
      totalMapas: mapas.value.length,
      totalObjetos,
      objetosPorTipo,
      mapaComMaisObjetos,
    };
  });

  return {
    // Estado
    mapas: computed(() => mapas.value as Mapa[]),
    mapaAtivo: computed(() => mapaAtivo.value),
    carregando: computed(() => carregando.value),
    erro: computed(() => erro.value),

    // Computed
    totalMapas,
    mapasPorNome,
    mapaAtualId,
    estatisticas,

    // Actions
    carregarMapas,
    adicionarMapa,
    editarMapa,
    removerMapa,
    duplicarMapa,
    ativarMapa,
    ativarMapaPorId,
    adicionarObjetoNoMapa,
    removerObjetoDoMapa,
    editarObjetoNoMapa,
    moverObjetoNoMapa,

    // Getters
    obterMapa,
    obterMapaPorNome,
    filtrarMapas,

    // Utilitários
    limparErro,
    reset,
  };
});
