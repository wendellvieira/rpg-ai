import { reactive, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSessaoStore } from '../../stores/sessaoStore';
import { usePersonagemStore } from '../../stores/personagemStore';
import { useConfigStore } from '../../stores/configStore';
import { PersistenceManager } from '../../services/PersistenceManager';
import { OpenAIService } from '../../services/OpenAIService';
import { GameCommandService } from '../../services/GameCommandService';
import { Dados } from '../../classes/Dados';
import type { Personagem } from '../../classes/Personagem';
import { StatusSessao, type SessaoJogo } from '../../classes/SessaoJogo';
import type {
  MensagemMestre,
  MensagemFala,
  AtributosPrimarios,
  AtributosDerivados,
  ConhecimentoPersonagem,
} from '../../types';

interface PersonagemData {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  isIA: boolean;
  descricao?: string;
}

export class GamePage_PageCtrl {
  static reactive() {
    return reactive(new GamePage_PageCtrl()) as GamePage_PageCtrl;
  }

  // Stores (inicializadas no construtor)
  public router!: ReturnType<typeof useRouter>;
  public $q!: ReturnType<typeof useQuasar>;
  public sessaoStore!: ReturnType<typeof useSessaoStore>;
  public personagemStore!: ReturnType<typeof usePersonagemStore>;
  public configStore!: ReturnType<typeof useConfigStore>;

  constructor() {
    // Inicializar os composables apenas quando necessário
    this.router = useRouter();
    this.$q = useQuasar();
    this.sessaoStore = useSessaoStore();
    this.personagemStore = usePersonagemStore();
    this.configStore = useConfigStore();
  }

  // Estado reativo
  public splitterModel = ref(30);
  public abaRecursos = ref('personagens');
  public carregandoRecursos = ref(false);
  public personagensDisponiveis = ref<PersonagemData[]>([]);
  public novaMensagem = ref('');
  public iaProcessando = ref(false);
  public mostrarCatalogoMagias = ref(false);
  public mostrarEditarPersonagem = ref(false);
  public mostrarPrepararMagias = ref(false);
  public personagemParaEditar = ref<PersonagemData | null>(null);
  public personagemParaMagias = ref<Personagem | null>(null);

  // Ref para controle do chat scroll
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public chatVirtualScroll = ref<any>(null);

  // Estado de personificação
  public personagemPersonificado = ref<PersonagemData | null>(null);

  // Controles de dados
  public mostrarDialogDados = ref(false);
  public tipoRolagem = ref('d20');
  public quantidadeDados = ref(1);
  public modificadorRolagem = ref(0);

  // Opções
  public tiposRolagem = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  // Sistema de Comandos
  public commandService = new GameCommandService();
  public mostrarAutoComplete = ref(false);
  public sugestoesComando = ref<Array<{ command: string; description: string; icon: string }>>([]);

  // Computed
  get sessaoAtual() {
    return this.sessaoStore.sessaoAtual;
  }

  get personagemParaMagiasTyped() {
    return this.personagemParaMagias.value as Personagem | null;
  }

  get participantesAtivos() {
    return this.sessaoAtual?.getParticipantes() || [];
  }

  get participanteAtual() {
    if (!this.sessaoAtual || this.participantesAtivos.length === 0) return null;
    const personagemId = this.sessaoAtual.getPersonagemTurnoAtual();
    return this.personagensDisponiveis.value.find((p) => p.id === personagemId) || null;
  }

  get mensagensChat() {
    return this.sessaoAtual?.historicoMensagens || [];
  }

  // Métodos de inicialização
  async mount() {
    try {
      console.log('🎯 GamePage montado - iniciando carregamento...');

      // Garantir que configurações sejam carregadas primeiro
      if (!this.configStore.carregado) {
        console.log('🔧 Carregando configurações no GamePage...');
        this.configStore.carregarConfiguracoes();
      }

      // Carregar recursos primeiro
      await this.carregarRecursos();
      console.log('👥 Recursos carregados');

      // Se não há sessão ativa, tentar carregar a última
      if (!this.sessaoAtual) {
        await this.tentarCarregarUltimaSessao();
        console.log('📂 Tentativa de carregar última sessão concluída');
      }

      // Aguardar renderização completa
      await nextTick();

      // Auto-scroll inicial com delay progressivo
      setTimeout((): void => {
        console.log('🎯 Executando auto-scroll inicial...');
        void this.scrollToBottom();

        // Tentativa adicional após um delay maior
        setTimeout((): void => {
          if (this.mensagensChat.length > 0) {
            console.log('🎯 Auto-scroll de confirmação...');
            void this.scrollToBottom();
          }
        }, 500);
      }, 1000); // Delay inicial maior para garantir renderização
    } catch (error) {
      console.error('❌ Erro no mount:', error);
    }

    return this;
  }

  // Auto-scroll do chat
  async scrollToBottom(): Promise<void> {
    if (!this.chatVirtualScroll.value || this.mensagensChat.length === 0) {
      console.log('📜 Auto-scroll cancelado: sem virtual scroll ou mensagens');
      return;
    }

    try {
      const virtualScrollElement = this.chatVirtualScroll.value;
      const totalItems = this.mensagensChat.length;

      if (!virtualScrollElement || totalItems === 0) {
        return;
      }

      // Aguardar DOM updates
      await nextTick();

      // Aguardar um tempo maior para garantir que o virtual scroll renderizou
      await new Promise((resolve) => setTimeout(resolve, 150));

      const lastIndex = totalItems - 1;

      // Método principal: usar scrollTo do QVirtualScroll
      if (typeof virtualScrollElement.scrollTo === 'function') {
        console.log(`📜 Scrolling para índice ${lastIndex} de ${totalItems}`);
        virtualScrollElement.scrollTo(lastIndex, 'end');

        // Aguardar o scroll processar
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verificar se o scroll funcionou - tentar fallback se necessário
        const container = virtualScrollElement.$el;
        if (container && container.scrollTop !== undefined) {
          const isAtBottom =
            container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

          if (!isAtBottom) {
            console.log('📜 Fallback: scroll direto no container');
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth',
            });
          }
        }
      } else {
        // Fallback: scroll direto no elemento
        console.log('📜 Fallback: scrollTo não disponível');
        const container = virtualScrollElement.$el || virtualScrollElement;
        if (container && container.scrollTo) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }

      console.log(`📜 Auto-scroll executado para mensagem ${lastIndex + 1}/${totalItems}`);
    } catch (error) {
      console.error('📜 Erro ao fazer scroll do chat:', error);
    }
  }

  // Carregamento de recursos
  async carregarRecursos() {
    this.carregandoRecursos.value = true;
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();

      const personagensIndice = await persistence.listarPersonagens();
      const personagensCompletos = [];

      for (const indice of personagensIndice) {
        const personagem = await persistence.carregarPersonagem(indice.id);
        if (personagem) {
          personagensCompletos.push(personagem);
        }
      }

      this.personagensDisponiveis.value = personagensCompletos;
      console.log(`👥 Carregados ${personagensCompletos.length} personagens`);

      // Se há uma sessão ativa, forçar scroll após carregar personagens
      if (this.sessaoAtual && this.mensagensChat.length > 0) {
        setTimeout((): void => {
          console.log('🎯 Auto-scroll após carregar personagens');
          void this.scrollToBottom();
        }, 400);
      }
    } catch (error) {
      console.error('Erro ao carregar recursos:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao carregar recursos',
        caption: String(error),
      });
    } finally {
      this.carregandoRecursos.value = false;
    }
  }

  async tentarCarregarUltimaSessao(): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      const sessoes = await persistence.listarSessoes();

      if (sessoes.length > 0) {
        // Carregar a sessão mais recente
        const ultimaSessao = sessoes[0];
        if (ultimaSessao) {
          console.log('📂 Carregando última sessão:', ultimaSessao.id);
          await this.sessaoStore.carregarSessao(ultimaSessao.id);

          // Aguardar um pouco para que a sessão seja processada
          await nextTick();

          // Forçar scroll após carregar sessão com delay maior
          setTimeout((): void => {
            console.log('🎯 Auto-scroll após carregar última sessão');
            void this.scrollToBottom();
          }, 700); // Delay maior para garantir carregamento completo da sessão
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar última sessão:', error);
    }
  }

  atualizarRecursos() {
    void this.carregarRecursos();
  }

  // Métodos de personagem
  visualizarPersonagem(personagem: PersonagemData) {
    console.log('Visualizando personagem:', personagem.nome);
  }

  adicionarPersonagemASessao() {
    void this.router.push('/setup');
  }

  adicionarPersonagemNaSessao(personagem: PersonagemData) {
    if (!this.sessaoAtual) {
      this.$q.notify({
        type: 'warning',
        message: 'Nenhuma sessão ativa',
      });
      return;
    }

    try {
      this.sessaoAtual.adicionarParticipante(personagem.id);
      console.log(`${personagem.nome} adicionado à sessão`);
    } catch (error) {
      console.error('Erro ao adicionar personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao adicionar personagem',
        caption: String(error),
      });
    }
  }

  editarPersonagem(personagem: PersonagemData) {
    this.personagemParaEditar.value = personagem;

    // Buscar o objeto Personagem real no store
    const personagemReal = this.personagemStore.obterPersonagemPorId(personagem.id) as Personagem;
    this.personagemParaMagias.value = personagemReal || null;

    this.mostrarEditarPersonagem.value = true;
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
        // Editando personagem existente
        const personagemExistente = this.personagemStore.personagens.find(
          (p) => p.id === dadosPersonagem.id,
        );
        if (personagemExistente) {
          // Atualizar personagem com todos os dados do formulário
          await this.personagemStore.atualizarPersonagem(dadosPersonagem.id, {
            nome: dadosPersonagem.nome,
            raca: dadosPersonagem.raca,
            classe: dadosPersonagem.classe,
            descricao: dadosPersonagem.descricao,
            isIA: dadosPersonagem.isIA,
            promptPersonalidade: dadosPersonagem.promptPersonalidade,
            atributosPrimarios: dadosPersonagem.atributosPrimarios,
            atributosDerivados: dadosPersonagem.atributosDerivados,
            inventario: dadosPersonagem.inventario,
            conhecimento: dadosPersonagem.conhecimento,
          });
        }
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
      void this.carregarRecursos(); // Recarregar lista de personagens
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao salvar personagem',
        position: 'top',
      });
    }
  }

  abrirCatalogoMagiasParaPersonagem(personagem: Personagem) {
    this.personagemParaMagias.value = personagem;
    this.mostrarCatalogoMagias.value = true;
  }

  abrirPreparacaoMagiasParaPersonagem(personagem: Personagem) {
    this.personagemParaMagias.value = personagem;
    this.mostrarPrepararMagias.value = true;
  }

  salvarAlteracaoPersonagem() {
    try {
      console.log('Personagem alterado automaticamente');
    } catch (error) {
      console.error('Erro ao salvar alterações do personagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao salvar alterações do personagem',
        position: 'top',
      });
    }
  }

  abrirCatalogoMagias() {
    this.mostrarCatalogoMagias.value = true;
  }

  // Métodos de comandos e auto-complete
  atualizarAutoComplete() {
    const input = this.novaMensagem.value;

    if (!input.startsWith('/')) {
      this.mostrarAutoComplete.value = false;
      this.sugestoesComando.value = [];
      return;
    }

    try {
      const sugestoes = this.commandService.getAutoComplete(input);
      this.sugestoesComando.value = sugestoes.map((s) => ({
        command: s.command,
        description: s.description,
        icon: s.icon,
      }));
      this.mostrarAutoComplete.value = sugestoes.length > 0;
    } catch (error) {
      console.error('Erro ao gerar auto-complete:', error);
      this.mostrarAutoComplete.value = false;
    }
  }

  selecionarComando(comando: string) {
    this.novaMensagem.value = comando;
    this.mostrarAutoComplete.value = false;
  }

  // Métodos de chat e mensagens
  async enviarMensagem() {
    if (!this.novaMensagem.value.trim() || !this.sessaoAtual) return;

    try {
      const mensagem = this.novaMensagem.value.trim();

      // Verificar se é um comando primeiro
      if (this.commandService.isCommand(mensagem)) {
        console.log('🎯 Processando comando:', mensagem);

        const resultado = await this.commandService.processCommand(mensagem);

        if (resultado.success && resultado.result) {
          // Comando executado com sucesso - adicionar resultado ao chat
          this.sessaoAtual.adicionarMensagem({
            tipo: 'mestre',
            conteudo: `${mensagem}\n\n✅ ${resultado.result.message}`,
          } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);

          // Mostrar feedback visual se disponível
          if (resultado.visualFeedback) {
            this.$q.notify({
              type: resultado.visualFeedback.type === 'error' ? 'negative' : 'positive',
              message: resultado.visualFeedback.message,
              icon: resultado.visualFeedback.icon,
              timeout: 3000,
            });
          }
        } else {
          // Comando falhou - mostrar erro
          const errorMsg = resultado.error || 'Comando não reconhecido';
          this.sessaoAtual.adicionarMensagem({
            tipo: 'mestre',
            conteudo: `${mensagem}\n\n❌ ${errorMsg}`,
          } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);

          this.$q.notify({
            type: 'negative',
            message: errorMsg,
            icon: 'error',
            timeout: 3000,
          });
        }

        this.novaMensagem.value = '';
        await this.sessaoStore.salvarSessao(this.sessaoAtual as SessaoJogo);

        setTimeout((): void => {
          void this.scrollToBottom();
        }, 200);
        return;
      }

      // Processamento normal de mensagens
      // Verificar se a mensagem contém personificação usando @player
      const matchPersonificacao = mensagem.match(/^@(\w+)\s+(.+)$/);
      if (matchPersonificacao) {
        const nomePersonagem = matchPersonificacao[1];
        const conteudoMensagem = matchPersonificacao[2];

        // Verificar se o personagem existe na sessão
        const personagemEncontrado = this.personagensDisponiveis.value.find(
          (p) =>
            nomePersonagem &&
            p.nome.toLowerCase() === nomePersonagem.toLowerCase() &&
            this.sessaoAtual?.getParticipantes().includes(p.id),
        );

        if (personagemEncontrado) {
          // Adicionar como fala do personagem
          this.sessaoAtual.adicionarMensagem({
            tipo: 'fala',
            personagem: personagemEncontrado.id,
            conteudo: conteudoMensagem,
          } as Omit<MensagemFala, 'id' | 'timestamp' | 'turno' | 'rodada'>);
        } else {
          // Personagem não encontrado, adicionar como mensagem do mestre
          this.sessaoAtual.adicionarMensagem({
            tipo: 'mestre',
            conteudo: mensagem,
            personagem: nomePersonagem, // Indica tentativa de personificação
          } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);
        }
      } else {
        // Mensagem normal do mestre
        this.sessaoAtual.adicionarMensagem({
          tipo: 'mestre',
          conteudo: mensagem,
        } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);
      }

      this.novaMensagem.value = '';

      // Salvar a sessão com a nova mensagem
      await this.sessaoStore.salvarSessao(this.sessaoAtual as SessaoJogo);

      console.log('📤 Mensagem adicionada e sessão salva');

      // Auto-scroll para mostrar a nova mensagem
      setTimeout((): void => {
        console.log('🎯 Auto-scroll após envio de mensagem');
        void this.scrollToBottom();
      }, 200); // Delay moderado após envio
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        caption: String(error),
      });
    }
  }

  // Métodos de turno e IA
  avancarTurno() {
    if (!this.sessaoAtual) return;

    try {
      this.sessaoAtual.avancarTurno();
      const novoPersonagem = this.sessaoAtual.getPersonagemTurnoAtual();

      // Verificar se o novo personagem é controlado por IA
      if (novoPersonagem) {
        const personagemData = this.personagensDisponiveis.value.find(
          (p) => p.id === novoPersonagem,
        );
        if (personagemData?.isIA) {
          // Processar turno da IA automaticamente
          setTimeout(() => {
            void this.processarTurnoIA(personagemData);
          }, 1000); // Delay de 1 segundo para simular "pensamento"
        }
      }

      const notificacao: { type: string; message: string; caption?: string } = {
        type: 'info',
        message: 'Turno avançado',
      };

      if (novoPersonagem) {
        const nomePersonagem = this.personagensDisponiveis.value.find(
          (p) => p.id === novoPersonagem,
        )?.nome;
        if (nomePersonagem) {
          notificacao.caption = `Agora é a vez de ${nomePersonagem}`;
        }
      }

      this.$q.notify(notificacao);
    } catch (error) {
      console.error('Erro ao avançar turno:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao avançar turno',
        caption: String(error),
      });
    }
  }

  // Função para executar IA manualmente
  async executarIAManual() {
    console.log('🤖 [DEBUG] executarIAManual - Iniciando...');
    console.log('🤖 [DEBUG] executarIAManual - sessaoAtual existe:', !!this.sessaoAtual);
    console.log('🤖 [DEBUG] executarIAManual - participanteAtual:', this.participanteAtual);
    console.log(
      '🤖 [DEBUG] executarIAManual - participanteAtual.isIA:',
      this.participanteAtual?.isIA,
    );

    if (!this.sessaoAtual) {
      console.log('🤖 [ERROR] executarIAManual - Nenhuma sessão ativa');
      return;
    }

    if (!this.participanteAtual) {
      console.log('🤖 [ERROR] executarIAManual - Nenhum participante no turno atual');
      return;
    }

    if (!this.participanteAtual.isIA) {
      console.log(
        '🤖 [ERROR] executarIAManual - Participante atual não é IA:',
        this.participanteAtual.nome,
      );
      return;
    }

    try {
      console.log(
        '🤖 [DEBUG] executarIAManual - Processando IA para:',
        this.participanteAtual.nome,
      );
      const personagemAtual = this.participanteAtual;
      await this.processarTurnoIA(personagemAtual);
    } catch (error) {
      console.error('🤖 [ERROR] executarIAManual - Erro:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao executar IA',
        caption: String(error),
      });
    }
  }

  // Função para processar turno específico de IA
  async processarTurnoIA(personagemData: { id: string; nome: string; isIA: boolean }) {
    console.log('🤖 [DEBUG] processarTurnoIA - Iniciando para:', personagemData.nome);

    if (!this.sessaoAtual) {
      console.log('🤖 [ERROR] processarTurnoIA - Nenhuma sessão ativa');
      return;
    }

    if (!personagemData.isIA) {
      console.log('🤖 [ERROR] processarTurnoIA - Personagem não é IA:', personagemData.nome);
      return;
    }

    try {
      this.iaProcessando.value = true;

      let personagemCompleto = this.personagemStore.obterPersonagemPorId(
        personagemData.id,
      ) as Personagem;

      // Se não encontrou no store, tentar carregar do persistence
      if (!personagemCompleto) {
        console.log('🤖 [DEBUG] processarTurnoIA - Carregando personagem do persistence...');
        try {
          const persistence = PersistenceManager.getInstance();
          const personagemCarregado = await persistence.carregarPersonagem(personagemData.id);

          if (personagemCarregado) {
            console.log(
              '🤖 [DEBUG] processarTurnoIA - Personagem carregado do persistence:',
              personagemCarregado.nome,
            );
            personagemCompleto = personagemCarregado;
          } else {
            console.log(
              '🤖 [ERROR] processarTurnoIA - Personagem não encontrado nem no store nem no persistence:',
              personagemData.id,
            );
            return;
          }
        } catch (error) {
          console.error('🤖 [ERROR] processarTurnoIA - Erro ao carregar do persistence:', error);
          return;
        }
      }

      // Primeiro, tentar usar a IA avançada (OpenAI)
      let acaoIA = await this.tentarIAAvancada(personagemCompleto);

      // Se falhar, usar IA básica (local)
      if (!acaoIA) {
        console.log('🤖 [DEBUG] processarTurnoIA - Usando IA básica...');
        acaoIA = this.gerarAcaoIA(personagemCompleto);
      }

      if (acaoIA) {
        console.log('🤖 [DEBUG] processarTurnoIA - Adicionando mensagem ao chat:', acaoIA);
        this.sessaoAtual.adicionarMensagem({
          tipo: 'fala',
          personagem: personagemCompleto.id,
          conteudo: acaoIA,
        } as Omit<MensagemFala, 'id' | 'timestamp' | 'turno' | 'rodada'>);

        await this.sessaoStore.salvarSessao(this.sessaoAtual as SessaoJogo);

        // Após IA agir, avançar turno automaticamente
        this.sessaoAtual.avancarTurno();

        console.log(`🤖 [DEBUG] ${personagemData.nome} agiu e passou o turno:`, acaoIA);

        // Auto-scroll para mostrar a nova mensagem da IA
        setTimeout(() => {
          void this.scrollToBottom();
        }, 100);

        // Verificar se o próximo participante também é IA
        const proximoPersonagemId = this.sessaoAtual.getPersonagemTurnoAtual();
        if (proximoPersonagemId) {
          const proximoPersonagem = this.personagensDisponiveis.value.find(
            (p) => p.id === proximoPersonagemId,
          );
          if (proximoPersonagem?.isIA) {
            // Delay maior para dar tempo do usuário ver a ação anterior
            setTimeout(() => {
              void this.processarTurnoIA(proximoPersonagem);
            }, 1500);
          }
        }
      } else {
        console.log('🤖 [ERROR] processarTurnoIA - Nenhuma ação gerada pela IA');
        this.$q.notify({
          type: 'warning',
          message: `${personagemData.nome} não conseguiu agir`,
          caption: 'IA não gerou nenhuma ação',
          icon: 'psychology',
        });
      }
    } catch (error) {
      console.error(`🤖 [ERROR] processarTurnoIA - Erro para ${personagemData.nome}:`, error);
      this.$q.notify({
        type: 'negative',
        message: `Erro na IA de ${personagemData.nome}`,
        caption: String(error),
      });
    } finally {
      this.iaProcessando.value = false;
    }
  }

  // Função para tentar usar IA avançada (OpenAI)
  async tentarIAAvancada(personagem: Personagem): Promise<string | null> {
    try {
      console.log('🤖 [DEBUG] Tentando IA avançada para:', personagem.nome);

      // FORÇAR carregamento das configurações PRIMEIRO
      if (!this.configStore.carregado) {
        console.log('🤖 [DEBUG] Forçando carregamento do ConfigStore...');
        this.configStore.carregarConfiguracoes();

        // Aguardar um pouco para o carregamento processar
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (
        !this.configStore.configuracao.openaiApiKey ||
        this.configStore.configuracao.openaiApiKey.trim() === ''
      ) {
        console.log('🤖 [DEBUG] OpenAI Key não configurada, usando IA básica');
        return null;
      }
      if (!this.sessaoAtual) {
        console.log('🤖 [ERROR] Nenhuma sessão ativa para contexto');
        return null;
      }

      console.log('🤖 [DEBUG] Configurando OpenAI Service...');
      const openaiService = new OpenAIService();
      // await openaiService.configure(this.configStore.configuracao.openaiApiKey);

      // Construir contexto da sessão
      const contextoSessao = this.construirContextoSessao();

      console.log('🤖 [DEBUG] Solicitando ação da IA via OpenAI...');
      // const acaoIA = await openaiService.gerarAcaoPersonagem(personagem, contextoSessao);

      // Por enquanto, retornar null para usar IA básica
      return null;
    } catch (error) {
      console.error('🤖 [ERROR] Erro na IA avançada:', error);
      return null;
    }
  }

  // Função auxiliar para construir contexto da sessão
  construirContextoSessao(personagem: Personagem): string {
    if (!this.sessaoAtual) return '';

    try {
      const mensagensRecentes = this.sessaoAtual.historicoMensagens.slice(-10);

      let contexto = `Sessão: ${this.sessaoAtual.nome}\n`;
      contexto += `Descrição: ${this.sessaoAtual.descricao || 'Nenhuma descrição'}\n\n`;

      if (mensagensRecentes.length > 0) {
        contexto += 'Histórico recente:\n';
        mensagensRecentes.forEach((msg) => {
          if (msg.tipo === 'mestre') {
            contexto += `[Mestre]: ${msg.conteudo}\n`;
          } else if (msg.tipo === 'fala' && msg.personagem) {
            const nomePersonagem =
              this.personagensDisponiveis.value.find((p) => p.id === msg.personagem)?.nome ||
              'Desconhecido';
            contexto += `[${nomePersonagem}]: ${msg.conteudo}\n`;
          }
        });
      }

      return contexto;
    } catch (error) {
      console.error('Erro ao construir contexto:', error);
      return '';
    }
  }

  // Função para gerar ação de IA básica (local)
  gerarAcaoIA(personagem: Personagem): string | null {
    try {
      const acoesPossiveisPadrao = [
        'Observo os arredores com atenção.',
        'Mantenho-me em posição defensiva.',
        'Analiso a situação antes de agir.',
        'Verifico meu equipamento.',
        'Espero pelo próximo movimento.',
        'Concentro-me no que está acontecendo.',
        'Fico alerta a qualquer movimento suspeito.',
        'Preparo-me para o que vem pela frente.',
      ];

      const acoesBaseadaClasse = this.obterAcoesPorClasse(personagem.classe);
      const todasAcoes = [...acoesPossiveisPadrao, ...acoesBaseadaClasse];

      const acaoEscolhida = todasAcoes[Math.floor(Math.random() * todasAcoes.length)];

      // Adicionar personalidade se disponível
      if (personagem.promptPersonalidade && personagem.promptPersonalidade.trim()) {
        const personalidade = personagem.promptPersonalidade.trim();
        return `*${personalidade}* ${acaoEscolhida}`;
      }

      return acaoEscolhida || null;
    } catch (error) {
      console.error('Erro ao gerar ação de IA básica:', error);
      return 'Aguardo instruções.';
    }
  }

  // Função auxiliar para obter ações específicas por classe
  obterAcoesPorClasse(classe: string): string[] {
    const acoesPorClasse: Record<string, string[]> = {
      guerreiro: [
        'Ajusto a empunhadura da minha arma.',
        'Verifico a integridade da minha armadura.',
        'Assumo uma postura de combate.',
        'Observo as possíveis rotas de escape.',
      ],
      mago: [
        'Murmuro alguns componentes verbais suavemente.',
        'Verifico meus componentes materiais.',
        'Concentro-me em minhas magias preparadas.',
        'Analiso as energias mágicas ao redor.',
      ],
      ladino: [
        'Procuro por armadilhas ou passagens ocultas.',
        'Movo-me silenciosamente pelas sombras.',
        'Verifico se há algo de valor por perto.',
        'Mantenho-me pronto para agir rapidamente.',
      ],
      clerigo: [
        'Murmuro uma prece silenciosa.',
        'Verifico o estado dos meus companheiros.',
        'Preparo-me para auxiliar quem precisar.',
        'Mantenho meu símbolo sagrado à mão.',
      ],
    };

    const classeLower = classe.toLowerCase();
    return acoesPorClasse[classeLower] || [];
  }

  // Métodos de status e utilitários
  getCorStatus(status?: StatusSessao): string {
    switch (status) {
      case StatusSessao.ATIVA:
        return 'positive';
      case StatusSessao.PAUSADA:
        return 'warning';
      case StatusSessao.FINALIZADA:
        return 'negative';
      default:
        return 'grey';
    }
  }

  getIconeStatus(status?: StatusSessao): string {
    switch (status) {
      case StatusSessao.ATIVA:
        return 'play_arrow';
      case StatusSessao.PAUSADA:
        return 'pause';
      case StatusSessao.FINALIZADA:
        return 'stop';
      default:
        return 'help';
    }
  }

  getTextoStatus(status?: StatusSessao): string {
    switch (status) {
      case StatusSessao.ATIVA:
        return 'Ativa';
      case StatusSessao.PAUSADA:
        return 'Pausada';
      case StatusSessao.FINALIZADA:
        return 'Finalizada';
      default:
        return 'Indefinido';
    }
  }

  // Métodos de dados
  async rolarDados() {
    if (!this.sessaoAtual) return;

    try {
      const resultado = Dados.rolar(
        `${this.quantidadeDados.value}${this.tipoRolagem.value}${this.modificadorRolagem.value >= 0 ? '+' : ''}${this.modificadorRolagem.value}`,
      );

      const mensagemRolagem = `🎲 Rolando ${this.quantidadeDados.value}${this.tipoRolagem.value}${this.modificadorRolagem.value !== 0 ? (this.modificadorRolagem.value > 0 ? '+' : '') + this.modificadorRolagem.value : ''}: **${resultado.total}**`;

      this.sessaoAtual.adicionarMensagem({
        tipo: 'mestre',
        conteudo: mensagemRolagem,
      } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);

      await this.sessaoStore.salvarSessao(this.sessaoAtual as SessaoJogo);

      this.mostrarDialogDados.value = false;

      // Auto-scroll para mostrar resultado
      setTimeout(() => {
        void this.scrollToBottom();
      }, 200);
    } catch (error) {
      console.error('Erro ao rolar dados:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Erro ao rolar dados',
        caption: String(error),
      });
    }
  }
}
