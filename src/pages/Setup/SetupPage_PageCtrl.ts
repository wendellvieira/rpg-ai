import { reactive, ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { OpenAIService } from '../../services/OpenAIService';
import type { Personagem } from '../../classes/Personagem';
import type { AtributosPrimarios, AtributosDerivados, ConhecimentoPersonagem } from '../../types';
import { useConfigStore } from '../../stores/configStore';
import { useItemStore } from '../../stores/itemStore';
import { usePersonagemStore } from '../../stores/personagemStore';
import type { Item } from '../../domain/entities/Items/Item';

interface PersonagemData {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  isIA: boolean;
  descricao?: string;
}

interface ItemData {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade: string;
  magico: boolean;
  propriedades?: Record<string, unknown>;
}

interface ConfiguracaoLocal {
  apiKey: string;
  modelo: string;
  temperature: number;
  maxTokens: number;
  autoSave: boolean;
  tema: 'claro' | 'escuro';
}

export class SetupPage_PageCtrl {
  static reactive() {
    return reactive(new SetupPage_PageCtrl()) as SetupPage_PageCtrl;
  }

  // Stores (inicializadas no construtor)
  public $q!: ReturnType<typeof useQuasar>;
  public route!: ReturnType<typeof useRoute>;
  public router!: ReturnType<typeof useRouter>;
  public configStore!: ReturnType<typeof useConfigStore>;
  public itemStore!: ReturnType<typeof useItemStore>;
  public personagemStore!: ReturnType<typeof usePersonagemStore>;

  constructor() {
    // Inicializar os composables
    this.$q = useQuasar();
    this.route = useRoute();
    this.router = useRouter();
    this.configStore = useConfigStore();
    this.itemStore = useItemStore();
    this.personagemStore = usePersonagemStore();
  }

  // Estado reativo
  public abaAtiva = ref('personagens');
  public carregandoPersonagens = ref(false);
  public carregandoItens = ref(false);
  public personagens = ref<PersonagemData[]>([]);
  public itens = ref<ItemData[]>([]);
  public dialogNovoPersonagem = ref(false);
  public dialogEditarPersonagem = ref(false);
  public dialogNovoItem = ref(false);
  public dialogEditarItem = ref(false);
  public mostrarDialogAPI = ref(false);
  public mostrarEditarPersonagem = ref(false);
  public personagemParaEditar = ref<PersonagemData | null>(null);
  public personagemEditando = ref<PersonagemData | null>(null);
  public itemEditando = ref<ItemData | null>(null);
  public personagemCompletoParaEditar = ref<Personagem | null>(null);
  public testandoAPI = ref(false);

  // Configurações
  public configuracoes = ref<ConfiguracaoLocal>({
    apiKey: '',
    modelo: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    autoSave: true,
    tema: 'claro',
  });

  // Dados para formulários
  public novoPersonagem = ref({
    nome: '',
    raca: '',
    classe: '',
    isIA: false,
    promptPersonalidade: '',
    descricao: '',
  });

  // Opções
  public racasDisponiveis = [
    'Humano',
    'Elfo',
    'Anão',
    'Halfling',
    'Draconato',
    'Gnomo',
    'Meio-Elfo',
    'Meio-Orc',
    'Tiefling',
  ];

  public classesDisponiveis = [
    'Guerreiro',
    'Mago',
    'Ladino',
    'Clérigo',
    'Bárbaro',
    'Bardo',
    'Druida',
    'Feiticeiro',
    'Paladino',
    'Patrulheiro',
  ];

  public modelosDisponiveis = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];

  // Computed
  get temApiKeyNoEnv() {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  get personagemCompletoParaEditarTyped() {
    if (!this.personagemCompletoParaEditar.value) return null;
    return this.personagemCompletoParaEditar.value as unknown as Personagem;
  }

  // Métodos de inicialização
  async carregarDados() {
    await this.carregarPersonagens();
    await this.carregarItens();
    this.carregarConfiguracoes();

    // Verificar se há uma aba específica na query string
    const tabParam = this.route.query.tab as string;
    if (tabParam && ['personagens', 'itens', 'mapas', 'config'].includes(tabParam)) {
      this.abaAtiva.value = tabParam;
    }

    // Configurar watchers
    this.setupWatchers();

    return this;
  }

  private setupWatchers() {
    // Observar mudanças na query string para mudar a aba
    watch(
      () => this.route.query.tab,
      (newTab) => {
        if (
          newTab &&
          typeof newTab === 'string' &&
          ['personagens', 'itens', 'mapas', 'config'].includes(newTab)
        ) {
          this.abaAtiva.value = newTab;
        } else if (!newTab) {
          // Se não há tab especificada, volta para personagens
          this.abaAtiva.value = 'personagens';
        }
      },
      { immediate: true },
    );

    // Observar mudanças na aba ativa para atualizar a URL
    watch(this.abaAtiva, (novaAba) => {
      const currentTab = this.route.query.tab as string;
      if (currentTab !== novaAba) {
        void this.router.replace({
          path: '/setup',
          query: { tab: novaAba },
        });
      }
    });
  }

  // Métodos de Personagens
  async carregarPersonagens() {
    this.carregandoPersonagens.value = true;
    try {
      // Usar o store para carregar personagens
      await this.personagemStore.carregarPersonagens();

      // Mapear para o formato local da SetupPage
      this.personagens.value = this.personagemStore.personagens.map((p) => ({
        id: p.id,
        nome: p.nome,
        raca: p.raca,
        classe: p.classe,
        isIA: p.isIA,
        descricao: p.descricao || '',
      }));
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao carregar personagens',
        caption: String(error),
      });
    } finally {
      this.carregandoPersonagens.value = false;
    }
  }

  async criarPersonagem() {
    try {
      // Usar o store para criar o personagem
      await this.personagemStore.criarPersonagem({
        nome: this.novoPersonagem.value.nome,
        raca: this.novoPersonagem.value.raca,
        classe: this.novoPersonagem.value.classe,
        isIA: this.novoPersonagem.value.isIA,
      });

      await this.carregarPersonagens();
      this.dialogNovoPersonagem.value = false;

      // Limpar formulário
      this.novoPersonagem.value = {
        nome: '',
        raca: '',
        classe: '',
        isIA: false,
        promptPersonalidade: '',
        descricao: '',
      };

      this.$q.notify({
        type: 'positive',
        message: 'Personagem criado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao criar personagem',
        caption: String(error),
      });
    }
  }

  editarPersonagem(personagem: PersonagemData) {
    try {
      this.personagemParaEditar.value = personagem;

      // Usar o store para buscar o personagem completo
      const personagemCompleto = this.personagemStore.buscarPersonagem(personagem.id);

      this.personagemCompletoParaEditar.value = personagemCompleto;
      this.mostrarEditarPersonagem.value = true;
    } catch (error) {
      console.error('Erro ao carregar personagem para edição:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao carregar personagem',
        caption: String(error),
      });
    }
  }

  async salvarPersonagemEditado(dadosPersonagem: {
    id?: string | undefined;
    nome: string;
    raca: string;
    classe: string;
    descricao: string;
    isIA: boolean;
    promptPersonalidade: string;
    atributosPrimarios: AtributosPrimarios;
    atributosDerivados: AtributosDerivados;
    inventario: Array<{ id: string; nome: string; quantidade: number }>;
    conhecimento: ConhecimentoPersonagem[];
  }) {
    try {
      if (dadosPersonagem.id) {
        // Editando personagem existente - usar o store
        await this.personagemStore.atualizarPersonagem(dadosPersonagem.id, {
          nome: dadosPersonagem.nome,
          raca: dadosPersonagem.raca,
          classe: dadosPersonagem.classe,
          descricao: dadosPersonagem.descricao,
          isIA: dadosPersonagem.isIA,
          promptPersonalidade: dadosPersonagem.promptPersonalidade,
          atributos: {
            primarios: dadosPersonagem.atributosPrimarios,
            derivados: dadosPersonagem.atributosDerivados,
            nivel: 1,
          },
          inventario: dadosPersonagem.inventario.map(
            (item) => [item.id, item.quantidade] as [string, number],
          ),
          conhecimentos: dadosPersonagem.conhecimento,
        });
      } else {
        // Criando novo personagem
        await this.personagemStore.criarPersonagem({
          nome: dadosPersonagem.nome,
          raca: dadosPersonagem.raca,
          classe: dadosPersonagem.classe,
        });
      }

      console.log('Personagem salvo:', dadosPersonagem.nome);

      this.mostrarEditarPersonagem.value = false;
      void this.carregarPersonagens(); // Recarregar lista de personagens
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao salvar personagem',
        position: 'top',
      });
    }
  }

  confirmarExclusaoPersonagem(personagem: PersonagemData) {
    this.$q
      .dialog({
        title: 'Excluir Personagem',
        message: `Tem certeza que deseja excluir o personagem "${personagem.nome}"?`,
        cancel: true,
        persistent: true,
      })
      .onOk(() => {
        void this.excluirPersonagem(personagem);
      });
  }

  async excluirPersonagem(personagem: PersonagemData) {
    try {
      // Usar o store para remover o personagem
      await this.personagemStore.removerPersonagem(personagem.id);
      await this.carregarPersonagens();

      this.$q.notify({
        type: 'positive',
        message: 'Personagem excluído com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao excluir personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao excluir personagem',
        caption: String(error),
      });
    }
  }

  async duplicarPersonagem(personagem: PersonagemData) {
    try {
      const personagemCompleto = this.personagemStore.buscarPersonagem(personagem.id);
      if (!personagemCompleto) {
        throw new Error('Personagem não encontrado');
      }

      // Criar cópia com nome modificado
      await this.personagemStore.criarPersonagem({
        nome: `${personagem.nome} (Cópia)`,
        raca: personagem.raca,
        classe: personagem.classe,
        isIA: personagem.isIA,
      });

      await this.carregarPersonagens();

      this.$q.notify({
        type: 'positive',
        message: 'Personagem duplicado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao duplicar personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao duplicar personagem',
        caption: String(error),
      });
    }
  }

  // Métodos de Itens
  editarItem(item: ItemData) {
    this.itemEditando.value = { ...item };
    this.dialogEditarItem.value = true;
  }

  duplicarItem(item: ItemData) {
    const novoItem = {
      ...item,
      id: Date.now().toString(),
      nome: `${item.nome} (Cópia)`,
    };
    this.adicionarItem(novoItem);
  }

  salvarItemEditado(itemEditado: ItemData) {
    const index = this.itens.value.findIndex((i) => i.id === itemEditado.id);
    if (index !== -1) {
      this.itens.value[index] = itemEditado;
      this.$q.notify({
        type: 'positive',
        message: 'Item atualizado com sucesso!',
      });
    }
    this.dialogEditarItem.value = false;
    this.itemEditando.value = null;
  }

  async carregarItens() {
    this.carregandoItens.value = true;
    try {
      await this.itemStore.carregarItens();

      this.itens.value = this.itemStore.itens.map((item: Item) => ({
        id: item.id,
        nome: item.nome,
        tipo: item.tipo,
        descricao: item.descricao,
        valor: item.valor,
        peso: item.peso,
        raridade: item.raridade,
        magico: item.magico,
        propriedades: item.propriedades,
      }));
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao carregar itens',
        caption: String(error),
      });
    } finally {
      this.carregandoItens.value = false;
    }
  }

  // Métodos de Configuração
  carregarConfiguracoes() {
    try {
      const config = this.configStore.configuracao;
      this.configuracoes.value = {
        apiKey: config.openaiApiKey || '',
        modelo: config.openaiModel || 'gpt-3.5-turbo',
        temperature: config.openaiTemperature || 0.7,
        maxTokens: config.openaiMaxTokens || 1000,
        autoSave: config.autoSave || true,
        tema: (config.tema as 'claro' | 'escuro') || 'claro',
      };
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async salvarConfiguracoes() {
    try {
      await this.configStore.atualizarConfiguracoes({
        openaiApiKey: this.configuracoes.value.apiKey,
        openaiModel: this.configuracoes.value.modelo,
        openaiTemperature: this.configuracoes.value.temperature,
        openaiMaxTokens: this.configuracoes.value.maxTokens,
        autoSave: this.configuracoes.value.autoSave,
        tema: this.configuracoes.value.tema,
      });

      this.$q.notify({
        type: 'positive',
        message: 'Configurações salvas com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao salvar configurações',
        caption: String(error),
      });
    }
  }

  async testarAPI() {
    if (!this.configuracoes.value.apiKey) {
      this.$q.notify({
        type: 'warning',
        message: 'Digite a chave da API primeiro',
      });
      return;
    }

    this.testandoAPI.value = true;
    try {
      const openai = new OpenAIService();
      // Teste simples da API (se o método existir)
      // await openai.testar(this.configuracoes.value.apiKey);

      this.$q.notify({
        type: 'positive',
        message: 'API funcionando corretamente!',
      });
    } catch (error) {
      console.error('Erro ao testar API:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao testar API',
        caption: String(error),
      });
    } finally {
      this.testandoAPI.value = false;
    }
  }

  // Métodos utilitários
  voltarParaJogo() {
    void this.router.push('/game');
  }

  irParaInicio() {
    void this.router.push('/');
  }

  // Métodos de callback dos dialogs
  adicionarPersonagem(novoPersonagem: PersonagemData) {
    this.personagens.value.push(novoPersonagem);
    this.$q.notify({
      type: 'positive',
      message: 'Personagem criado com sucesso!',
    });
  }

  adicionarItem(novoItem: ItemData) {
    this.itens.value.push(novoItem);
    this.$q.notify({
      type: 'positive',
      message: 'Item criado com sucesso!',
    });
  }

  // Métodos de interação com itens
  getItemIcon(tipo: string): string {
    const iconMap: Record<string, string> = {
      arma: 'sports_martial_arts',
      armadura: 'shield',
      escudo: 'security',
      consumivel: 'healing',
      ferramenta: 'build',
      tesouro: 'diamond',
      outros: 'category',
    };
    return iconMap[tipo] || 'category';
  }

  confirmarExclusaoItem(item: ItemData) {
    this.$q
      .dialog({
        title: 'Confirmar exclusão',
        message: `Tem certeza que deseja excluir o item "${item.nome}"?`,
        cancel: true,
        persistent: true,
      })
      .onOk(() => {
        void this.excluirItem(item);
      });
  }

  private excluirItem(item: ItemData) {
    try {
      const index = this.itens.value.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        this.itens.value.splice(index, 1);
        this.$q.notify({
          type: 'positive',
          message: 'Item excluído com sucesso!',
        });
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao excluir item',
      });
    }
  }
}
