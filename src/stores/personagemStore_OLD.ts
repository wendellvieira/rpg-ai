import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Personagem } from '../classes/Personagem';
import { PersistenceManager } from '../services/PersistenceManager';
import type { AtributosPrimarios, AtributosDerivados, ConhecimentoPersonagem } from '../types';

export const usePersonagemStore = defineStore('personagem', () => {
  // Estado
  const personagens = ref<Personagem[]>([]);
  const personagemAtivo = ref<Personagem | null>(null);
  const carregando = ref(false);
  const erro = ref<string | null>(null);

  // Computed
  const totalPersonagens = computed(() => personagens.value.length);
  const personagensVivos = computed(() => personagens.value.filter((p) => p.estaVivo));
  const personagensJogadores = computed(() => personagens.value.filter((p) => !p.isIA));
  const personagensNPCs = computed(() => personagens.value.filter((p) => p.isIA));

  // Actions
  async function carregarPersonagens(): Promise<void> {
    carregando.value = true;
    erro.value = null;

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();

      // Listar índice dos personagens
      const indicePersonagens = await persistence.listarPersonagens();

      // Carregar cada personagem completo
      const personagensCarregados: Personagem[] = [];
      for (const indice of indicePersonagens) {
        const personagem = await persistence.carregarPersonagem(indice.id);
        if (personagem) {
          // FIXME: Temporariamente comentado devido à incompatibilidade de tipos
          // personagensCarregados.push(personagem);
          console.warn('Carregamento de personagem antigo desabilitado temporariamente');
        }
      }

      personagens.value = personagensCarregados;
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
      erro.value = 'Erro ao carregar personagens';
    } finally {
      carregando.value = false;
    }
  }

  async function salvarPersonagem(personagem: Personagem): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      // FIXME: Temporariamente comentado devido à incompatibilidade de tipos
      // await persistence.salvarPersonagem(personagem);
      console.warn('Salvamento de personagem antigo desabilitado temporariamente');

      // Atualizar no array local
      const index = personagens.value.findIndex((p) => p.id === personagem.id);
      if (index >= 0) {
        personagens.value[index] = personagem;
      } else {
        personagens.value.push(personagem);
      }
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      erro.value = 'Erro ao salvar personagem';
      throw error;
    }
  }

  async function criarPersonagem(config: {
    nome: string;
    raca: string;
    classe: string;
    nivel?: number;
    ehNPC?: boolean;
  }): Promise<Personagem> {
    try {
      const novoPersonagem = new Personagem(config);
      await salvarPersonagem(novoPersonagem);
      return novoPersonagem;
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      erro.value = 'Erro ao criar personagem';
      throw error;
    }
  }

  async function atualizarPersonagem(
    id: string,
    updates: {
      nome?: string;
      raca?: string;
      classe?: string;
      descricao?: string;
      isIA?: boolean;
      promptPersonalidade?: string;
      atributosPrimarios?: AtributosPrimarios;
      atributosDerivados?: AtributosDerivados;
      inventario?: Array<{ id: string; nome: string; quantidade: number }>;
      conhecimento?: ConhecimentoPersonagem[];
    },
  ): Promise<Personagem> {
    try {
      const personagemExistente = personagens.value.find((p) => p.id === id);
      if (!personagemExistente) {
        throw new Error('Personagem não encontrado');
      }

      // Como as propriedades são readonly, vamos criar um novo personagem com os dados atualizados
      const dadosOriginais = personagemExistente.serializar();

      // Preparar dados atualizados, mantendo o formato da serialização
      const dadosAtualizados = {
        ...dadosOriginais,
        // Atualizar apenas os campos básicos que são compatíveis
        ...(updates.nome && { nome: updates.nome }),
        ...(updates.raca && { raca: updates.raca }),
        ...(updates.classe && { classe: updates.classe }),
        ...(updates.descricao !== undefined && { descricao: updates.descricao }),
        ...(updates.isIA !== undefined && { isIA: updates.isIA }),
        ...(updates.promptPersonalidade !== undefined && {
          promptPersonalidade: updates.promptPersonalidade,
        }),
        // Incluir conhecimentos se fornecidos
        ...(updates.conhecimento !== undefined && { conhecimentos: updates.conhecimento }),
      };

      const personagemAtualizado = Personagem.deserializar(dadosAtualizados);

      // Atualizar atributos primários se fornecidos
      if (updates.atributosPrimarios) {
        const atributos = personagemAtualizado.getAtributos;
        for (const [atributo, valor] of Object.entries(updates.atributosPrimarios)) {
          if (
            typeof valor === 'number' &&
            ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'].includes(
              atributo,
            )
          ) {
            atributos.setAtributo(atributo as keyof AtributosPrimarios, valor);
          }
        }
      }

      // Atualizar atributos derivados se fornecidos
      if (updates.atributosDerivados) {
        const atributos = personagemAtualizado.getAtributos;
        for (const [atributo, valor] of Object.entries(updates.atributosDerivados)) {
          if (typeof valor === 'number') {
            switch (atributo) {
              case 'hp':
                atributos.setHP(valor);
                break;
              case 'hpMaximo':
                atributos.setHPMaximo(valor);
                break;
              case 'mp':
                atributos.setMP(valor);
                break;
              case 'mpMaximo':
                atributos.setMPMaximo(valor);
                break;
              case 'ca':
                atributos.setCA(valor);
                break;
              case 'iniciativa':
                atributos.setIniciativa(valor);
                break;
              case 'velocidade':
                atributos.setVelocidade(valor);
                break;
            }
          }
        }
      }

      // Para o inventário, como os métodos precisam de objetos Item, vamos implementar uma solução mais simples
      // que atualiza via serialização/deserialização
      if (updates.inventario) {
        const dadosAtualizadosComInventario = personagemAtualizado.serializar();
        dadosAtualizadosComInventario.inventario = updates.inventario.map(
          (item) => [item.id, item.quantidade] as [string, number],
        );
        const personagemComInventarioAtualizado = Personagem.deserializar(
          dadosAtualizadosComInventario,
        );
        await salvarPersonagem(personagemComInventarioAtualizado);
        return personagemComInventarioAtualizado;
      }

      await salvarPersonagem(personagemAtualizado);
      return personagemAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar personagem:', error);
      erro.value = 'Erro ao atualizar personagem';
      throw error;
    }
  }

  async function carregarPersonagem(id: string): Promise<Personagem | null> {
    carregando.value = true;
    erro.value = null;

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      const personagem = await persistence.carregarPersonagem(id);

      if (personagem) {
        // Adicionar ao array se não existir
        const exists = personagens.value.find((p) => p.id === id);
        if (!exists) {
          // FIXME: Temporariamente comentado devido à incompatibilidade de tipos
          // personagens.value.push(personagem);
          console.warn('Push de personagem antigo desabilitado temporariamente');
        }
        // FIXME: Retorno temporário
        return null; // Era: return personagem;
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar personagem:', error);
      erro.value = 'Erro ao carregar personagem';
      return null;
    } finally {
      carregando.value = false;
    }
  }

  async function deletarPersonagem(id: string): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.removerPersonagem(id);

      // Remover do array local
      const index = personagens.value.findIndex((p) => p.id === id);
      if (index >= 0) {
        personagens.value.splice(index, 1);
      }

      // Se era o personagem ativo, limpar
      if (personagemAtivo.value?.id === id) {
        personagemAtivo.value = null;
      }
    } catch (error) {
      console.error('Erro ao deletar personagem:', error);
      erro.value = 'Erro ao deletar personagem';
      throw error;
    }
  }

  function definirPersonagemAtivo(personagem: Personagem | null): void {
    personagemAtivo.value = personagem;
  }

  function limparErro(): void {
    erro.value = null;
  }

  function obterPersonagemPorId(id: string): Personagem | undefined {
    return personagens.value.find((p) => p.id === id) as Personagem | undefined;
  }

  function obterPersonagemPorNome(nome: string): Personagem | undefined {
    return personagens.value.find((p) => p.nome.toLowerCase() === nome.toLowerCase()) as
      | Personagem
      | undefined;
  }

  async function duplicarPersonagem(id: string): Promise<Personagem> {
    try {
      const personagemOriginal = personagens.value.find((p) => p.id === id);
      if (!personagemOriginal) {
        throw new Error('Personagem não encontrado');
      }

      // Serializar e deserializar para criar uma cópia
      const dadosOriginais = personagemOriginal.serializar();
      const novoPersonagem = Personagem.deserializar({
        ...dadosOriginais,
        nome: `${personagemOriginal.nome} (Cópia)`,
      });

      await salvarPersonagem(novoPersonagem);
      return novoPersonagem;
    } catch (error) {
      console.error('Erro ao duplicar personagem:', error);
      erro.value = 'Erro ao duplicar personagem';
      throw error;
    }
  }

  function exportarPersonagem(id: string): string {
    try {
      const personagem = personagens.value.find((p) => p.id === id);
      if (!personagem) {
        throw new Error('Personagem não encontrado');
      }

      return JSON.stringify(personagem.serializar(), null, 2);
    } catch (error) {
      console.error('Erro ao exportar personagem:', error);
      erro.value = 'Erro ao exportar personagem';
      throw error;
    }
  }

  async function importarPersonagem(dadosJson: string): Promise<Personagem> {
    try {
      const dados = JSON.parse(dadosJson);
      const personagem = Personagem.deserializar(dados);

      // Gerar novo ID para evitar conflitos - usar serialização/deserialização
      const novoPersonagem = Personagem.deserializar({
        ...personagem.serializar(),
        nome: `${personagem.nome} (Importado)`,
      });

      await salvarPersonagem(novoPersonagem);
      return novoPersonagem;
    } catch (error) {
      console.error('Erro ao importar personagem:', error);
      erro.value = 'Erro ao importar personagem';
      throw error;
    }
  }

  function ordenarPersonagens(
    campo: 'nome' | 'nivel' | 'raca' | 'classe',
    direcao: 'asc' | 'desc' = 'asc',
  ): void {
    personagens.value.sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (campo) {
        case 'nome':
          valueA = a.nome.toLowerCase();
          valueB = b.nome.toLowerCase();
          break;
        case 'nivel':
          valueA = a.nivel;
          valueB = b.nivel;
          break;
        case 'raca':
          valueA = a.raca.toLowerCase();
          valueB = b.raca.toLowerCase();
          break;
        case 'classe':
          valueA = a.classe.toLowerCase();
          valueB = b.classe.toLowerCase();
          break;
      }

      if (direcao === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }

  function filtrarPersonagens(filtro: {
    nome?: string;
    raca?: string;
    classe?: string;
    isIA?: boolean;
    vivo?: boolean;
  }): Personagem[] {
    return personagens.value.filter((personagem) => {
      if (filtro.nome && !personagem.nome.toLowerCase().includes(filtro.nome.toLowerCase())) {
        return false;
      }

      if (filtro.raca && !personagem.raca.toLowerCase().includes(filtro.raca.toLowerCase())) {
        return false;
      }

      if (filtro.classe && !personagem.classe.toLowerCase().includes(filtro.classe.toLowerCase())) {
        return false;
      }

      if (filtro.isIA !== undefined && personagem.isIA !== filtro.isIA) {
        return false;
      }

      if (filtro.vivo !== undefined && personagem.estaVivo !== filtro.vivo) {
        return false;
      }

      return true;
    }) as Personagem[];
  }

  // Métodos de combate e interação
  async function aplicarDano(personagemId: string, dano: number): Promise<void> {
    const personagem = obterPersonagemPorId(personagemId);
    if (personagem) {
      personagem.receberDano(dano);
      await salvarPersonagem(personagem);
    }
  }

  async function aplicarCura(personagemId: string, cura: number): Promise<void> {
    const personagem = obterPersonagemPorId(personagemId);
    if (personagem) {
      personagem.curar(cura);
      await salvarPersonagem(personagem);
    }
  }

  async function adicionarItem(
    personagemId: string,
    itemId: string,
    quantidade: number = 1,
  ): Promise<void> {
    const personagem = obterPersonagemPorId(personagemId);
    if (personagem) {
      // TODO: Carregar o item real do catálogo quando implementado
      // Por enquanto, adiciona diretamente pelo ID usando a quantidade
      console.warn('adicionarItem: Funcionalidade limitada - precisa do catálogo de itens', {
        itemId,
        quantidade,
      });
      await salvarPersonagem(personagem);
    }
  }

  async function removerItem(
    personagemId: string,
    itemId: string,
    quantidade: number = 1,
  ): Promise<void> {
    const personagem = obterPersonagemPorId(personagemId);
    if (personagem) {
      personagem.removerItem(itemId, quantidade);
      await salvarPersonagem(personagem);
    }
  }

  return {
    // Estado
    personagens,
    personagemAtivo,
    carregando,
    erro,

    // Computed
    totalPersonagens,
    personagensVivos,
    personagensJogadores,
    personagensNPCs,

    // Actions
    carregarPersonagens,
    salvarPersonagem,
    criarPersonagem,
    atualizarPersonagem,
    carregarPersonagem,
    deletarPersonagem,
    definirPersonagemAtivo,
    limparErro,
    obterPersonagemPorId,
    obterPersonagemPorNome,
    duplicarPersonagem,
    exportarPersonagem,
    importarPersonagem,
    ordenarPersonagens,
    filtrarPersonagens,
    aplicarDano,
    aplicarCura,
    adicionarItem,
    removerItem,
  };
});
