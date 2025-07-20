import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  Magia,
  EscolaMagia,
  ComponenteMagia,
  AlcanceMagia,
  DuracaoMagia,
  TempoConjuracao,
} from '../classes/Magia';

// Interface para dados de magia serializados
export interface DadosMagiaSerializados {
  id: string;
  nome: string;
  descricao: string;
  escola: EscolaMagia;
  nivel: number;
  tempoConjuracao: TempoConjuracao;
  alcance: AlcanceMagia;
  componentes: ComponenteMagia[];
  componenteMaterial?: string;
  duracao: DuracaoMagia;
  concentracao: boolean;
  ritual: boolean;
  efeitos: Array<{
    tipo: 'dano' | 'cura' | 'buff' | 'debuff' | 'utilidade' | 'controle';
    dados?: string;
    condicao?: string;
    duracao?: string;
    descricao: string;
  }>;
  classes: string[];
  valor?: number;
}

export const useMagiaStore = defineStore('magia', () => {
  // Estado
  const magias = ref<DadosMagiaSerializados[]>([]);
  const carregando = ref(false);
  const erro = ref<string | null>(null);

  // Cache para buscas rápidas
  const magiasPorId = ref(new Map<string, DadosMagiaSerializados>());
  const magiasIndexadas = ref(new Map<string, DadosMagiaSerializados[]>());

  // Função para atualizar caches
  function atualizarCaches() {
    // Cache por ID para buscas O(1)
    magiasPorId.value.clear();
    magias.value.forEach((magia) => {
      magiasPorId.value.set(magia.id, magia);
    });

    // Cache de índices de busca por texto
    magiasIndexadas.value.clear();
    const indiceTexto = new Map<string, DadosMagiaSerializados[]>();

    magias.value.forEach((magia) => {
      // Indexar por palavras-chave do nome e descrição
      const palavras = [
        ...magia.nome.toLowerCase().split(' '),
        ...magia.descricao
          .toLowerCase()
          .split(' ')
          .filter((p) => p.length > 3),
      ];

      palavras.forEach((palavra) => {
        if (!indiceTexto.has(palavra)) {
          indiceTexto.set(palavra, []);
        }
        indiceTexto.get(palavra)!.push(magia);
      });
    });

    magiasIndexadas.value = indiceTexto;
  }

  // Computed
  const totalMagias = computed(() => magias.value.length);

  const magiasPorEscola = computed(() => {
    const grupos: Record<EscolaMagia, DadosMagiaSerializados[]> = {
      [EscolaMagia.ABJURACAO]: [],
      [EscolaMagia.ADIVINHACAO]: [],
      [EscolaMagia.CONJURACAO]: [],
      [EscolaMagia.ENCANTAMENTO]: [],
      [EscolaMagia.EVOCACAO]: [],
      [EscolaMagia.ILUSAO]: [],
      [EscolaMagia.NECROMANCIA]: [],
      [EscolaMagia.TRANSMUTACAO]: [],
    };

    magias.value.forEach((magia) => {
      if (grupos[magia.escola]) {
        grupos[magia.escola].push(magia);
      }
    });

    return grupos;
  });

  const magiasPorNivel = computed(() => {
    const grupos: Record<number, DadosMagiaSerializados[]> = {};
    for (let i = 0; i <= 9; i++) {
      grupos[i] = [];
    }

    magias.value.forEach((magia) => {
      const nivel = magia.nivel;
      if (nivel >= 0 && nivel <= 9) {
        grupos[nivel]!.push(magia); // Non-null assertion since we know the array exists
      }
    });

    return grupos;
  });

  // Métodos
  function adicionarMagia(magia: Magia | DadosMagiaSerializados) {
    const dadosMagia =
      magia instanceof Magia ? (magia.serializar() as unknown as DadosMagiaSerializados) : magia;

    const index = magias.value.findIndex((m) => m.id === dadosMagia.id);
    if (index !== -1) {
      magias.value[index] = dadosMagia;
    } else {
      magias.value.push(dadosMagia);
    }

    // Atualizar caches após modificação
    atualizarCaches();
  }

  function removerMagia(id: string) {
    const index = magias.value.findIndex((magia) => magia.id === id);
    if (index !== -1) {
      magias.value.splice(index, 1);
      // Atualizar caches após modificação
      atualizarCaches();
    }
  }

  function obterMagiaPorId(id: string): DadosMagiaSerializados | undefined {
    return magiasPorId.value.get(id);
  }

  function buscarMagiasRapida(termo: string): DadosMagiaSerializados[] {
    if (!termo || termo.length < 2) return magias.value;

    const palavrasChave = termo
      .toLowerCase()
      .split(' ')
      .filter((p) => p.length > 1);
    const resultados = new Set<DadosMagiaSerializados>();

    palavrasChave.forEach((palavra) => {
      const encontradas = magiasIndexadas.value.get(palavra) || [];
      encontradas.forEach((magia) => resultados.add(magia));
    });

    return Array.from(resultados);
  }

  function obterMagia(id: string): DadosMagiaSerializados | undefined {
    return magias.value.find((magia) => magia.id === id);
  }

  function obterMagiaInstancia(id: string): Magia | undefined {
    const dados = obterMagia(id);
    return dados ? new Magia(dados) : undefined;
  }

  function buscarMagias(termo: string): DadosMagiaSerializados[] {
    const termoBusca = termo.toLowerCase();
    return magias.value.filter(
      (magia) =>
        magia.nome.toLowerCase().includes(termoBusca) ||
        magia.descricao.toLowerCase().includes(termoBusca) ||
        magia.escola.toLowerCase().includes(termoBusca),
    );
  }

  function filtrarMagias(filtros: {
    escola?: EscolaMagia;
    nivel?: number;
    classe?: string;
    concentracao?: boolean;
    ritual?: boolean;
  }): DadosMagiaSerializados[] {
    return magias.value.filter((magia) => {
      if (filtros.escola && magia.escola !== filtros.escola) return false;
      if (filtros.nivel !== undefined && magia.nivel !== filtros.nivel) return false;
      if (
        filtros.classe &&
        !magia.classes.some((c) => c.toLowerCase().includes(filtros.classe!.toLowerCase()))
      )
        return false;
      if (filtros.concentracao !== undefined && magia.concentracao !== filtros.concentracao)
        return false;
      if (filtros.ritual !== undefined && magia.ritual !== filtros.ritual) return false;
      return true;
    });
  }

  function carregarMagias() {
    try {
      carregando.value = true;
      erro.value = null;

      // Carregar magias do localStorage
      const dadosSalvos = localStorage.getItem('rpg-ai-magias');
      if (dadosSalvos) {
        const magiasSalvas = JSON.parse(dadosSalvos) as DadosMagiaSerializados[];
        magias.value = magiasSalvas;
      } else {
        // Carregar algumas magias de exemplo
        carregarMagiasExemplo();
      }

      // Atualizar caches após carregamento
      atualizarCaches();
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Erro ao carregar magias';
    } finally {
      carregando.value = false;
    }
  }

  function salvarMagias() {
    try {
      localStorage.setItem('rpg-ai-magias', JSON.stringify(magias.value));
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Erro ao salvar magias';
    }
  }

  function carregarMagiasExemplo() {
    const magiasExemplo: DadosMagiaSerializados[] = [
      {
        id: 'magia-1',
        nome: 'Míssil Mágico',
        escola: EscolaMagia.EVOCACAO,
        nivel: 1,
        concentracao: false,
        ritual: false,
        componentes: [ComponenteMagia.VERBAL, ComponenteMagia.SOMATICO],
        classes: ['Feiticeiro', 'Mago'],
        tempoConjuracao: TempoConjuracao.ACAO,
        alcance: AlcanceMagia.PES_120,
        duracao: DuracaoMagia.INSTANTANEA,
        descricao:
          'Você cria três dardos brilhantes de força mágica. Cada dardo atinge uma criatura à sua escolha que você possa ver dentro do alcance.',
        efeitos: [
          {
            tipo: 'dano',
            dados: '1d4+1',
            condicao: 'por dardo',
            duracao: 'instantânea',
            descricao: 'Dano de força por dardo',
          },
        ],
      },
      {
        id: 'magia-2',
        nome: 'Curar Ferimentos',
        escola: EscolaMagia.EVOCACAO,
        nivel: 1,
        concentracao: false,
        ritual: false,
        componentes: [ComponenteMagia.VERBAL, ComponenteMagia.SOMATICO],
        classes: ['Clérigo', 'Druida', 'Paladino', 'Patrulheiro'],
        tempoConjuracao: TempoConjuracao.ACAO,
        alcance: AlcanceMagia.TOQUE,
        duracao: DuracaoMagia.INSTANTANEA,
        descricao: 'Uma criatura que você tocar recupera pontos de vida.',
        efeitos: [
          {
            tipo: 'cura',
            dados: '1d8',
            condicao: '+modificador de atributo de conjuração',
            duracao: 'instantânea',
            descricao: 'Cura pontos de vida',
          },
        ],
      },
      {
        id: 'magia-3',
        nome: 'Prestidigitação',
        escola: EscolaMagia.TRANSMUTACAO,
        nivel: 0,
        concentracao: false,
        ritual: false,
        componentes: [ComponenteMagia.VERBAL, ComponenteMagia.SOMATICO],
        classes: ['Bardo', 'Feiticeiro', 'Bruxo', 'Mago'],
        tempoConjuracao: TempoConjuracao.ACAO,
        alcance: AlcanceMagia.PES_10,
        duracao: DuracaoMagia.HORA_1,
        descricao:
          'Esta magia é um truque menor usado por conjuradores iniciantes para praticar. Você cria um dos seguintes efeitos mágicos dentro do alcance.',
        efeitos: [
          {
            tipo: 'utilidade',
            condicao: 'múltiplos efeitos',
            duracao: 'até 1 hora',
            descricao: 'Efeitos menores de utilidade',
          },
        ],
      },
    ];

    magias.value = magiasExemplo;
    salvarMagias();
  }

  function limparMagias() {
    magias.value = [];
    localStorage.removeItem('rpg-ai-magias');
  }

  return {
    // Estado
    magias,
    carregando,
    erro,

    // Computed
    totalMagias,
    magiasPorEscola,
    magiasPorNivel,

    // Métodos
    adicionarMagia,
    removerMagia,
    obterMagia,
    obterMagiaPorId,
    buscarMagiasRapida,
    obterMagiaInstancia,
    buscarMagias,
    filtrarMagias,
    carregarMagias,
    salvarMagias,
    carregarMagiasExemplo,
    limparMagias,
  };
});
