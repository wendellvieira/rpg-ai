import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SessaoJogo, StatusSessao } from '../classes/SessaoJogo';
import { PersistenceManager } from '../services/PersistenceManager';

export const useSessaoStore = defineStore('sessao', () => {
  // Estado
  const sessoes = ref<SessaoJogo[]>([]);
  const sessaoAtual = ref<SessaoJogo | null>(null);
  const carregando = ref(false);
  const erro = ref<string | null>(null);

  // Computed
  const totalSessoes = computed(() => sessoes.value.length);
  const sessoesAtivas = computed(() =>
    sessoes.value.filter((s) => s.statusAtual === StatusSessao.ATIVA),
  );
  const sessoesPausadas = computed(() =>
    sessoes.value.filter((s) => s.statusAtual === StatusSessao.PAUSADA),
  );
  const sessoesFinalizadas = computed(() =>
    sessoes.value.filter((s) => s.statusAtual === StatusSessao.FINALIZADA),
  );

  // Actions
  async function carregarSessoes(): Promise<void> {
    carregando.value = true;
    erro.value = null;

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();

      const sessoesIndice = await persistence.listarSessoes();

      // Carregar cada sessão completa
      const sessoesCarregadas: SessaoJogo[] = [];
      for (const indice of sessoesIndice) {
        const sessao = await persistence.carregarSessao(indice.id);
        if (sessao) {
          sessoesCarregadas.push(sessao);
        }
      }

      sessoes.value = sessoesCarregadas;
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      erro.value = 'Erro ao carregar sessões';
    } finally {
      carregando.value = false;
    }
  }

  async function salvarSessao(sessao: SessaoJogo): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.salvarSessao(sessao);

      // Atualizar no array local
      const index = sessoes.value.findIndex((s) => s.id === sessao.id);
      if (index >= 0) {
        sessoes.value[index] = sessao;
      } else {
        sessoes.value.push(sessao);
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      erro.value = 'Erro ao salvar sessão';
      throw error;
    }
  }

  async function criarSessao(config: {
    nome: string;
    descricao: string;
    participantes?: string[];
  }): Promise<SessaoJogo> {
    try {
      const novaSessao = new SessaoJogo(config);
      await salvarSessao(novaSessao);
      return novaSessao;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      erro.value = 'Erro ao criar sessão';
      throw error;
    }
  }

  async function carregarSessao(id: string): Promise<SessaoJogo | null> {
    carregando.value = true;
    erro.value = null;

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      const sessao = await persistence.carregarSessao(id);

      if (sessao) {
        sessaoAtual.value = sessao;
        return sessao;
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      erro.value = 'Erro ao carregar sessão';
      return null;
    } finally {
      carregando.value = false;
    }
  }

  async function deletarSessao(id: string): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.removerSessao(id);

      // Remover do array local
      const index = sessoes.value.findIndex((s) => s.id === id);
      if (index >= 0) {
        sessoes.value.splice(index, 1);
      }

      // Se era a sessão atual, limpar
      if (sessaoAtual.value?.id === id) {
        sessaoAtual.value = null;
      }
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      erro.value = 'Erro ao deletar sessão';
      throw error;
    }
  }

  function definirSessaoAtual(sessao: SessaoJogo | null): void {
    sessaoAtual.value = sessao;
  }

  function limparErro(): void {
    erro.value = null;
  }

  async function duplicarSessao(id: string): Promise<SessaoJogo> {
    try {
      const sessaoOriginal = sessoes.value.find((s) => s.id === id);
      if (!sessaoOriginal) {
        throw new Error('Sessão não encontrada');
      }

      const novaSessao = new SessaoJogo({
        nome: `${sessaoOriginal.nome} (Cópia)`,
        descricao: sessaoOriginal.descricao,
        participantes: sessaoOriginal.getParticipantes(),
      });

      await salvarSessao(novaSessao);
      return novaSessao;
    } catch (error) {
      console.error('Erro ao duplicar sessão:', error);
      erro.value = 'Erro ao duplicar sessão';
      throw error;
    }
  }

  function exportarSessao(id: string): string {
    try {
      const sessao = sessoes.value.find((s) => s.id === id);
      if (!sessao) {
        throw new Error('Sessão não encontrada');
      }

      return JSON.stringify(sessao.serializar(), null, 2);
    } catch (error) {
      console.error('Erro ao exportar sessão:', error);
      erro.value = 'Erro ao exportar sessão';
      throw error;
    }
  }

  async function importarSessao(dadosJson: string): Promise<SessaoJogo> {
    try {
      const dados = JSON.parse(dadosJson);
      const sessao = SessaoJogo.deserializar(dados);

      // Gerar novo ID para evitar conflitos
      const novaSessao = new SessaoJogo({
        nome: `${sessao.nome} (Importada)`,
        descricao: sessao.descricao,
        participantes: sessao.getParticipantes(),
      });

      await salvarSessao(novaSessao);
      return novaSessao;
    } catch (error) {
      console.error('Erro ao importar sessão:', error);
      erro.value = 'Erro ao importar sessão';
      throw error;
    }
  }

  function obterSessaoPorId(id: string): SessaoJogo | undefined {
    return sessoes.value.find((s) => s.id === id) as SessaoJogo | undefined;
  }

  function ordenarSessoes(
    campo: 'nome' | 'criadaEm' | 'atualizadaEm',
    direcao: 'asc' | 'desc' = 'desc',
  ): void {
    sessoes.value.sort((a, b) => {
      let valueA: string | Date;
      let valueB: string | Date;

      switch (campo) {
        case 'nome':
          valueA = a.nome.toLowerCase();
          valueB = b.nome.toLowerCase();
          break;
        case 'criadaEm':
          valueA = a.criadaEm;
          valueB = b.criadaEm;
          break;
        case 'atualizadaEm':
          valueA = a.atualizadaEm;
          valueB = b.atualizadaEm;
          break;
      }

      if (direcao === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }

  function filtrarSessoes(filtro: {
    nome?: string;
    status?: string;
    participante?: string;
  }): SessaoJogo[] {
    return sessoes.value.filter((sessao) => {
      if (filtro.nome && !sessao.nome.toLowerCase().includes(filtro.nome.toLowerCase())) {
        return false;
      }

      if (filtro.status && String(sessao.statusAtual) !== filtro.status) {
        return false;
      }

      if (filtro.participante && !sessao.getParticipantes().includes(filtro.participante)) {
        return false;
      }

      return true;
    }) as SessaoJogo[];
  }

  return {
    // Estado
    sessoes,
    sessaoAtual,
    carregando,
    erro,

    // Computed
    totalSessoes,
    sessoesAtivas,
    sessoesPausadas,
    sessoesFinalizadas,

    // Actions
    carregarSessoes,
    salvarSessao,
    criarSessao,
    carregarSessao,
    deletarSessao,
    definirSessaoAtual,
    limparErro,
    duplicarSessao,
    exportarSessao,
    importarSessao,
    obterSessaoPorId,
    ordenarSessoes,
    filtrarSessoes,
  };
});
