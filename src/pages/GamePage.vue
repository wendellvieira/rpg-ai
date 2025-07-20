<template>
  <q-page class="game-page">
    <q-splitter v-model="splitterModel" :limits="[20, 80]" class="full-height">
      <!-- Painel Esquerdo - Recursos -->
      <template v-slot:before>
        <div class="container-header-aside">
          <!-- Cabeçalho do painel -->
          <div class="left-side-header q-px-md q-py-sm">
            <div class="text-h6">Recursos</div>

            <q-btn
              flat
              round
              icon="refresh"
              size="sm"
              @click="atualizarRecursos"
              :loading="carregandoRecursos"
            >
              <q-tooltip>Atualizar</q-tooltip>
            </q-btn>
          </div>

          <!-- Abas de recursos -->
          <div class="cnt-game-context">
            <q-tabs
              v-model="abaRecursos"
              vertical
              class="tabs-area text-grey-6 q-pt-md"
              active-color="primary"
              indicator-color="primary"
              dense
            >
              <q-tab name="personagens" icon="people">
                <q-tooltip>Personagens</q-tooltip>
              </q-tab>
              <q-tab name="itens" icon="inventory">
                <q-tooltip>Itens</q-tooltip>
              </q-tab>
              <q-tab name="magias" icon="auto_fix_high">
                <q-tooltip>Magias</q-tooltip>
              </q-tab>
              <q-tab name="combate" icon="local_fire_department">
                <q-tooltip>Combate</q-tooltip>
              </q-tab>
              <q-tab name="mapas" icon="map">
                <q-tooltip>Mapas</q-tooltip>
              </q-tab>
            </q-tabs>

            <!-- Conteúdo das abas -->
            <q-tab-panels
              v-model="abaRecursos"
              animated
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
              class="full-height scroll q-pa-md"
            >
              <!-- Aba Personagens -->
              <q-tab-panel name="personagens" class="q-pa-none">
                <div class="q-mb-sm">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Adicionar"
                    size="sm"
                    class="full-width"
                    @click="adicionarPersonagemASessao"
                  />
                </div>

                <q-list dense>
                  <q-item
                    v-for="personagem in personagensDisponiveis"
                    :key="personagem.id"
                    clickable
                    @click="visualizarPersonagem(personagem)"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        size="32px"
                        :color="personagem.isIA ? 'purple' : 'primary'"
                        text-color="white"
                      >
                        {{ personagem.nome[0] }}
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ personagem.nome }}</q-item-label>
                      <q-item-label caption
                        >{{ personagem.raca }} {{ personagem.classe }}</q-item-label
                      >
                    </q-item-section>

                    <q-item-section side>
                      <div class="row q-gutter-xs">
                        <q-btn
                          flat
                          round
                          icon="edit"
                          size="sm"
                          @click.stop="editarPersonagem(personagem)"
                        >
                          <q-tooltip>Editar personagem</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          icon="add_circle"
                          size="sm"
                          @click.stop="adicionarPersonagemNaSessao(personagem)"
                        >
                          <q-tooltip>Adicionar à sessão</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="personagensDisponiveis.length === 0">
                    <q-item-section>
                      <div class="text-center text-grey-6">
                        <q-icon name="people_outline" size="2rem" />
                        <div class="text-caption">Nenhum personagem</div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>

              <!-- Aba Itens -->
              <q-tab-panel name="itens" class="q-pa-none">
                <div class="text-center text-grey-6 q-py-lg">
                  <q-icon name="inventory_2" size="3rem" />
                  <div class="text-caption">Em desenvolvimento</div>
                </div>
              </q-tab-panel>

              <!-- Aba Magias -->
              <q-tab-panel name="magias" class="q-pa-none">
                <div class="q-pa-md">
                  <q-btn
                    color="primary"
                    icon="auto_fix_high"
                    label="Abrir Catálogo de Magias"
                    class="full-width"
                    @click="abrirCatalogoMagias"
                  />
                  <div class="text-center text-grey-6 q-py-lg">
                    <q-icon name="auto_fix_high" size="3rem" />
                    <div class="text-caption">Gerencie magias conhecidas</div>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Aba Combate -->
              <q-tab-panel name="combate" class="q-pa-none">
                <IniciativaCombate />
              </q-tab-panel>

              <!-- Aba Mapas -->
              <q-tab-panel name="mapas" class="q-pa-none">
                <MapaCanvas />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </template>

      <!-- Painel Direito - Chat e Controles -->
      <template v-slot:after>
        <div class="full-height column">
          <!-- Cabeçalho da sessão -->
          <div class="q-pa-md bg-grey-1">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ sessaoAtual?.nome || 'Nenhuma Sessão' }}</div>
                <div class="text-caption text-grey-6">
                  {{ sessaoAtual?.descricao || 'Selecione ou crie uma sessão' }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getCorStatus(sessaoAtual?.statusAtual)"
                  text-color="white"
                  :icon="getIconeStatus(sessaoAtual?.statusAtual)"
                  size="sm"
                >
                  {{ getTextoStatus(sessaoAtual?.statusAtual) }}
                </q-chip>
              </div>
            </div>

            <!-- Indicador de turno -->
            <div v-if="sessaoAtual && participantesAtivos.length > 0" class="q-mt-sm">
              <div class="text-caption text-grey-6 q-mb-xs">Turno atual:</div>
              <div class="row items-center">
                <q-avatar
                  size="24px"
                  :color="participanteAtual?.isIA ? 'purple' : 'primary'"
                  text-color="white"
                  class="q-mr-sm"
                >
                  {{ participanteAtual?.nome?.[0] || '?' }}
                </q-avatar>
                <div class="column q-mr-sm">
                  <span class="text-weight-medium">{{
                    participanteAtual?.nome || 'Aguardando...'
                  }}</span>
                  <span v-if="participanteAtual?.isIA" class="text-caption text-purple">
                    Personagem IA
                  </span>
                </div>

                <!-- Botão para executar IA manualmente -->
                <q-btn
                  v-if="participanteAtual?.isIA"
                  flat
                  round
                  icon="psychology"
                  size="sm"
                  color="purple"
                  :loading="iaProcessando"
                  @click="executarIAManual"
                  class="q-mr-sm"
                >
                  <q-tooltip>Executar ação da IA</q-tooltip>
                </q-btn>

                <q-space />
                <div class="text-caption">
                  Rodada {{ sessaoAtual.rodadaAtual }} • Turno
                  {{ sessaoAtual.turnoAtualIndex + 1 }}/{{ participantesAtivos.length }}
                </div>
              </div>
            </div>
          </div>

          <q-separator />

          <!-- Área do chat -->
          <div class="col scroll q-pa-md chat-area">
            <div v-if="!sessaoAtual" class="text-center text-grey-6 q-py-xl">
              <q-icon name="chat_bubble_outline" size="4rem" class="q-mb-md" />
              <div class="text-h6">Nenhuma sessão ativa</div>
              <div class="q-mt-sm">Volte ao início para criar ou carregar uma sessão</div>
              <q-btn
                color="primary"
                label="Voltar ao Início"
                class="q-mt-md"
                @click="$router.push('/')"
              />
            </div>

            <div v-else>
              <!-- Mensagens do chat com virtual scrolling -->
              <q-virtual-scroll
                :items="mensagensChat"
                separator
                v-slot="{ item: mensagem, index }"
                style="max-height: calc(100vh - 300px)"
                class="chat-container"
              >
                <div :key="index" class="q-mb-md">
                  <q-chat-message
                    :text="[getMensagemConteudo(mensagem)]"
                    :sent="mensagem.tipo === 'mestre'"
                    :bg-color="getCorMensagem(mensagem.tipo)"
                    :text-color="getCorTextoMensagem(mensagem.tipo)"
                    :name="getMensagemPersonagem(mensagem)"
                    :stamp="formatarHoraMensagem(mensagem.timestamp)"
                  >
                    <template v-slot:avatar>
                      <q-avatar
                        :color="getCorAvatar(mensagem.tipo, getMensagemPersonagem(mensagem))"
                        text-color="white"
                        size="32px"
                      >
                        {{ getInicialAvatar(getMensagemPersonagem(mensagem) || mensagem.tipo) }}
                      </q-avatar>
                    </template>
                  </q-chat-message>
                </div>
              </q-virtual-scroll>

              <!-- Mensagem de carregamento quando IA está pensando -->
              <div v-if="iaProcessando" class="q-mb-md">
                <q-chat-message
                  :text="['🤔 Analisando situação...']"
                  :sent="false"
                  bg-color="blue-grey-2"
                  text-color="blue-grey-8"
                  name="IA Mestre"
                >
                  <template v-slot:avatar>
                    <q-avatar color="blue-grey-6" text-color="white" size="32px">
                      <q-icon name="psychology" />
                      <q-spinner-dots size="16px" class="absolute-center" color="white" />
                    </q-avatar>
                  </template>
                </q-chat-message>
              </div>
            </div>
          </div>

          <!-- Controles do mestre -->
          <div v-if="sessaoAtual" class="q-pa-md bg-grey-1">
            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="novaMensagem"
                  placeholder="Digite uma mensagem ou ação... (Use @nome para personificar)"
                  outlined
                  dense
                  @keyup.enter="enviarMensagem"
                >
                  <template v-slot:prepend v-if="personagemPersonificado">
                    <q-avatar
                      size="24px"
                      :color="personagemPersonificado.isIA ? 'purple' : 'blue'"
                      text-color="white"
                    >
                      {{ personagemPersonificado.nome[0] }}
                    </q-avatar>
                  </template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      icon="send"
                      @click="enviarMensagem"
                      :disable="!novaMensagem.trim()"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-gutter-sm q-mt-sm">
              <q-btn
                size="sm"
                icon="skip_next"
                label="Próximo Turno"
                @click="avancarTurno"
                :disable="participantesAtivos.length === 0"
              />
              <q-btn
                size="sm"
                icon="casino"
                label="Rolar Dados"
                @click="mostrarDialogDados = true"
              />
              <q-btn
                size="sm"
                :icon="sessaoAtual.statusAtual === 'ativa' ? 'pause' : 'play_arrow'"
                :label="sessaoAtual.statusAtual === 'ativa' ? 'Pausar' : 'Continuar'"
                @click="alternarStatusSessao"
              />
              <q-btn
                size="sm"
                icon="stop"
                label="Finalizar"
                color="negative"
                @click="finalizarSessao"
              />
            </div>

            <!-- Feedback de personificação -->
            <div v-if="personagemPersonificado" class="q-mt-sm">
              <q-chip
                :color="personagemPersonificado.isIA ? 'purple' : 'blue'"
                text-color="white"
                size="sm"
                removable
                @remove="limparPersonificacao"
              >
                <q-avatar>
                  {{ personagemPersonificado.nome[0] }}
                </q-avatar>
                Falando como {{ personagemPersonificado.nome }}
                {{ personagemPersonificado.isIA ? '(IA)' : '(Jogador)' }}
              </q-chip>
            </div>
          </div>
        </div>
      </template>
    </q-splitter>

    <!-- Dialog para rolar dados -->
    <q-dialog v-model="mostrarDialogDados">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Rolar Dados</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="tipoRolagem"
            :options="tiposRolagem"
            label="Tipo de Dado"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model.number="quantidadeDados"
            label="Quantidade"
            type="number"
            min="1"
            max="10"
            outlined
            class="q-mb-md"
          />

          <q-input v-model.number="modificadorRolagem" label="Modificador" type="number" outlined />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="mostrarDialogDados = false" />
          <q-btn flat label="Rolar" color="primary" @click="rolarDados" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para o catálogo de magias -->
    <CatalogoMagias v-model="mostrarCatalogoMagias" />

    <!-- Dialog para editar personagem -->
    <EditarPersonagemDialog
      v-model="mostrarEditarPersonagem"
      :personagem="personagemParaMagiasTyped"
      @salvar="salvarPersonagemEditado"
      @abrirCatalogo="abrirCatalogoMagiasParaPersonagem"
      @abrirPreparacao="abrirPreparacaoMagiasParaPersonagem"
      @personagemAlterado="salvarAlteracaoPersonagem"
    />

    <!-- Dialog para preparar magias -->
    <PrepararMagiasDialog v-model="mostrarPrepararMagias" :personagem="personagemParaMagiasTyped" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSessaoStore } from '../stores/sessaoStore';
import { usePersonagemStore } from '../stores/personagemStore';
import { useConfigStore } from '../stores/configStore';
import { PersistenceManager } from '../services/PersistenceManager';
import { OpenAIService } from '../services/OpenAIService';
import { Dados } from '../classes/Dados';
import type { Personagem } from '../classes/Personagem';
import { StatusSessao, type SessaoJogo } from '../classes/SessaoJogo';
import type { MensagemMestre, MensagemFala } from '../types';
import IniciativaCombate from '../components/IniciativaCombate.vue';
import CatalogoMagias from '../components/CatalogoMagias.vue';
import MapaCanvas from '../components/MapaCanvas.vue';

// Lazy loading para diálogos pesados
const EditarPersonagemDialog = defineAsyncComponent(
  () => import('../components/EditarPersonagemDialog.vue'),
);
const PrepararMagiasDialog = defineAsyncComponent(
  () => import('../components/PrepararMagiasDialog.vue'),
);

interface PersonagemData {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  isIA: boolean;
  descricao?: string;
}

const router = useRouter();
const $q = useQuasar();
const sessaoStore = useSessaoStore();
const personagemStore = usePersonagemStore();
const configStore = useConfigStore();

// Estado reativo
const splitterModel = ref(30);
const abaRecursos = ref('personagens');
const carregandoRecursos = ref(false);
const personagensDisponiveis = ref<PersonagemData[]>([]);
const novaMensagem = ref('');
const iaProcessando = ref(false);
const mostrarCatalogoMagias = ref(false);
const mostrarEditarPersonagem = ref(false);
const mostrarPrepararMagias = ref(false);
const personagemParaEditar = ref<PersonagemData | null>(null);
const personagemParaMagias = ref<Personagem | null>(null);

// Estado de personificação
const personagemPersonificado = ref<PersonagemData | null>(null);

// Controles de dados
const mostrarDialogDados = ref(false);
const tipoRolagem = ref('d20');
const quantidadeDados = ref(1);
const modificadorRolagem = ref(0);

// Opções
const tiposRolagem = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

// Computed
const sessaoAtual = computed(() => sessaoStore.sessaoAtual);

// Cast do personagem para o tipo correto
const personagemParaMagiasTyped = computed(() => personagemParaMagias.value as Personagem | null);

const participantesAtivos = computed(() => {
  return sessaoAtual.value?.getParticipantes() || [];
});

const participanteAtual = computed(() => {
  if (!sessaoAtual.value || participantesAtivos.value.length === 0) return null;
  const personagemId = sessaoAtual.value.getPersonagemTurnoAtual();
  return personagensDisponiveis.value.find((p) => p.id === personagemId) || null;
});

const mensagensChat = computed(() => {
  return sessaoAtual.value?.historicoMensagens || [];
});

// Lifecycle
onMounted(() => {
  // Garantir que configurações sejam carregadas primeiro
  if (!configStore.carregado) {
    console.log('🔧 Carregando configurações no GamePage...');
    configStore.carregarConfiguracoes();
  }

  void carregarRecursos();

  // Se não há sessão ativa, tentar carregar a última
  if (!sessaoAtual.value) {
    void tentarCarregarUltimaSessao();
  }
});

// Watchers
watch(
  () => sessaoAtual.value?.id,
  (novoId) => {
    if (novoId) {
      // Sessão carregada, fazer setup necessário
      console.log('Sessão carregada:', novoId);
    }
  },
);

// Métodos
async function carregarRecursos() {
  carregandoRecursos.value = true;
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

    personagensDisponiveis.value = personagensCompletos;
  } catch (error) {
    console.error('Erro ao carregar recursos:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar recursos',
      caption: String(error),
    });
  } finally {
    carregandoRecursos.value = false;
  }
}

async function tentarCarregarUltimaSessao() {
  try {
    const persistence = PersistenceManager.getInstance();
    const sessoes = await persistence.listarSessoes();

    if (sessoes.length > 0) {
      // Carregar a sessão mais recente
      const ultimaSessao = sessoes[0];
      if (ultimaSessao) {
        await sessaoStore.carregarSessao(ultimaSessao.id);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar última sessão:', error);
  }
}

function atualizarRecursos() {
  void carregarRecursos();
}

function visualizarPersonagem(personagem: PersonagemData) {
  $q.notify({
    type: 'info',
    message: `Visualizando ${personagem.nome}`,
    caption: 'Funcionalidade em desenvolvimento',
  });
}

function adicionarPersonagemASessao() {
  void router.push('/setup');
}

function adicionarPersonagemNaSessao(personagem: PersonagemData) {
  if (!sessaoAtual.value) {
    $q.notify({
      type: 'warning',
      message: 'Nenhuma sessão ativa',
    });
    return;
  }

  try {
    sessaoAtual.value.adicionarParticipante(personagem.id);

    $q.notify({
      type: 'positive',
      message: `${personagem.nome} adicionado à sessão!`,
    });
  } catch (error) {
    console.error('Erro ao adicionar personagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao adicionar personagem',
      caption: String(error),
    });
  }
}

function editarPersonagem(personagem: PersonagemData) {
  personagemParaEditar.value = personagem;

  // Buscar o objeto Personagem real no store
  const personagemReal = personagemStore.obterPersonagemPorId(personagem.id) as Personagem;
  personagemParaMagias.value = personagemReal || null;

  mostrarEditarPersonagem.value = true;
}

async function salvarPersonagemEditado(dadosPersonagem: {
  id?: string | undefined;
  nome: string;
  raca: string;
  classe: string;
  descricao: string;
  isIA: boolean;
  promptPersonalidade: string;
}) {
  try {
    if (dadosPersonagem.id) {
      // Editando personagem existente
      const personagemExistente = personagemStore.personagens.find(
        (p) => p.id === dadosPersonagem.id,
      );
      if (personagemExistente) {
        // Atualizar propriedades do personagem existente
        // Como as propriedades são readonly, precisamos criar um novo personagem
        // Para isso, usamos o método de atualização do store
        await personagemStore.atualizarPersonagem(dadosPersonagem.id, {
          nome: dadosPersonagem.nome,
          raca: dadosPersonagem.raca,
          classe: dadosPersonagem.classe,
          descricao: dadosPersonagem.descricao,
          isIA: dadosPersonagem.isIA,
          promptPersonalidade: dadosPersonagem.promptPersonalidade,
        });
      }
    } else {
      // Criando novo personagem
      await personagemStore.criarPersonagem({
        nome: dadosPersonagem.nome,
        raca: dadosPersonagem.raca,
        classe: dadosPersonagem.classe,
      });
    }

    $q.notify({
      type: 'positive',
      message: 'Personagem salvo com sucesso!',
      position: 'top',
    });

    mostrarEditarPersonagem.value = false;
    void carregarRecursos(); // Recarregar lista de personagens
  } catch (error) {
    console.error('Erro ao salvar personagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar personagem',
      position: 'top',
    });
  }
}

function abrirCatalogoMagiasParaPersonagem(personagem: Personagem) {
  personagemParaMagias.value = personagem;
  mostrarCatalogoMagias.value = true;
}

function abrirPreparacaoMagiasParaPersonagem(personagem: Personagem) {
  personagemParaMagias.value = personagem;
  mostrarPrepararMagias.value = true;
}

function salvarAlteracaoPersonagem() {
  try {
    // Note: The personagem is already saved when methods like aprenderMagia are called
    // This method is mainly for UI feedback

    $q.notify({
      type: 'positive',
      message: 'Personagem atualizado com sucesso!',
      position: 'top',
    });
  } catch (error) {
    console.error('Erro ao salvar alterações do personagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar alterações do personagem',
      position: 'top',
    });
  }
}

async function enviarMensagem() {
  if (!novaMensagem.value.trim() || !sessaoAtual.value) return;

  try {
    const mensagem = novaMensagem.value.trim();

    // Verificar se a mensagem contém personificação usando @player
    const matchPersonificacao = mensagem.match(/^@(\w+)\s+(.+)$/);
    if (matchPersonificacao) {
      const nomePersonagem = matchPersonificacao[1];
      const conteudoMensagem = matchPersonificacao[2];

      // Verificar se o personagem existe na sessão
      const personagemEncontrado = personagensDisponiveis.value.find(
        (p) =>
          nomePersonagem &&
          p.nome.toLowerCase() === nomePersonagem.toLowerCase() &&
          sessaoAtual.value?.getParticipantes().includes(p.id),
      );

      if (personagemEncontrado) {
        // Adicionar como fala do personagem
        sessaoAtual.value.adicionarMensagem({
          tipo: 'fala',
          personagem: personagemEncontrado.id,
          conteudo: conteudoMensagem,
        } as Omit<MensagemFala, 'id' | 'timestamp' | 'turno' | 'rodada'>);
      } else {
        // Personagem não encontrado, adicionar como mensagem do mestre
        sessaoAtual.value.adicionarMensagem({
          tipo: 'mestre',
          conteudo: mensagem,
          personagem: nomePersonagem, // Indica tentativa de personificação
        } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);
      }
    } else {
      // Mensagem normal do mestre
      sessaoAtual.value.adicionarMensagem({
        tipo: 'mestre',
        conteudo: mensagem,
      } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);
    }

    novaMensagem.value = '';

    // Salvar a sessão com a nova mensagem
    await sessaoStore.salvarSessao(sessaoAtual.value as SessaoJogo);

    // Processar resposta automática de personagens IA
    void processarRespostasIA();

    console.log('Mensagem adicionada e sessão salva');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar mensagem',
      caption: String(error),
    });
  }
}

// Função para processar respostas automáticas de personagens IA
async function processarRespostasIA() {
  if (!sessaoAtual.value || iaProcessando.value) return;

  try {
    iaProcessando.value = true;

    // Buscar personagens IA na sessão atual
    const personagensIA = personagensDisponiveis.value.filter(
      (p) => p.isIA && sessaoAtual.value?.getParticipantes().includes(p.id),
    );

    // Para cada personagem IA, verificar se deve responder
    for (const personagemData of personagensIA) {
      try {
        const personagemCompleto = personagemStore.obterPersonagemPorId(
          personagemData.id,
        ) as Personagem;
        if (!personagemCompleto) continue;

        // Verificar se deve gerar resposta (probabilidade de 30%)
        if (Math.random() < 0.3) {
          // Simular resposta da IA
          const respostaIA = gerarRespostaIA(personagemCompleto);

          if (respostaIA) {
            sessaoAtual.value.adicionarMensagem({
              tipo: 'fala',
              personagem: personagemCompleto.id,
              conteudo: respostaIA,
            } as Omit<MensagemFala, 'id' | 'timestamp' | 'turno' | 'rodada'>);
          }
        }
      } catch (error) {
        console.error(`Erro ao processar IA do personagem ${personagemData.nome}:`, error);
      }
    }

    // Salvar novamente se houve novas mensagens
    await sessaoStore.salvarSessao(sessaoAtual.value as SessaoJogo);
  } catch (error) {
    console.error('Erro ao processar respostas IA:', error);
  } finally {
    iaProcessando.value = false;
  }
}

// Função auxiliar para gerar resposta de IA
function gerarRespostaIA(personagem: Personagem): string | null {
  // Respostas simples baseadas na personalidade
  const respostasComuns = [
    'Interessante...',
    'Concordo com essa abordagem.',
    'Talvez devêssemos considerar outras opções.',
    'Estou observando a situação.',
    'Que pensam sobre isso?',
    'Mantenham-se alertas.',
    'Preciso refletir sobre isso.',
  ];

  // Se tem prompt de personalidade, usar respostas mais específicas
  if (personagem.promptPersonalidade) {
    const respostasPersonalizadas = [
      `${personagem.promptPersonalidade} Isso me faz pensar...`,
      'Baseado na minha experiência, acredito que...',
      'Minha intuição me diz que...',
    ];

    const resposta =
      respostasPersonalizadas[Math.floor(Math.random() * respostasPersonalizadas.length)];
    return resposta || null;
  }

  const resposta = respostasComuns[Math.floor(Math.random() * respostasComuns.length)];
  return resposta || null;
}

function avancarTurno() {
  if (!sessaoAtual.value) return;

  try {
    sessaoAtual.value.avancarTurno();
    const novoPersonagem = sessaoAtual.value.getPersonagemTurnoAtual();

    // Verificar se o novo personagem é controlado por IA
    if (novoPersonagem) {
      const personagemData = personagensDisponiveis.value.find((p) => p.id === novoPersonagem);
      if (personagemData?.isIA) {
        // Processar turno da IA automaticamente
        setTimeout(() => {
          void processarTurnoIA(personagemData);
        }, 1000); // Delay de 1 segundo para simular "pensamento"
      }
    }

    const notificacao: { type: string; message: string; caption?: string } = {
      type: 'info',
      message: 'Turno avançado',
    };

    if (novoPersonagem) {
      const nomePersonagem = personagensDisponiveis.value.find(
        (p) => p.id === novoPersonagem,
      )?.nome;
      if (nomePersonagem) {
        notificacao.caption = `Agora é a vez de ${nomePersonagem}`;
      }
    }

    $q.notify(notificacao);
  } catch (error) {
    console.error('Erro ao avançar turno:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao avançar turno',
      caption: String(error),
    });
  }
}

// Função para executar IA manualmente
async function executarIAManual() {
  if (!sessaoAtual.value || !participanteAtual.value?.isIA) return;

  try {
    const personagemAtual = participanteAtual.value;
    await processarTurnoIA(personagemAtual);
  } catch (error) {
    console.error('Erro ao executar IA manual:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao executar IA',
      caption: String(error),
    });
  }
}

// Função para processar turno específico de IA
async function processarTurnoIA(personagemData: { id: string; nome: string; isIA: boolean }) {
  if (!sessaoAtual.value || !personagemData.isIA) return;

  try {
    iaProcessando.value = true;

    const personagemCompleto = personagemStore.obterPersonagemPorId(
      personagemData.id,
    ) as Personagem;
    if (!personagemCompleto) return;

    // Primeiro, tentar usar a IA avançada (OpenAI)
    let acaoIA = await tentarIAAvancada(personagemCompleto);

    // Se falhar, usar IA básica (local)
    if (!acaoIA) {
      acaoIA = gerarAcaoIA(personagemCompleto);
    }

    if (acaoIA) {
      sessaoAtual.value.adicionarMensagem({
        tipo: 'fala',
        personagem: personagemCompleto.id,
        conteudo: acaoIA,
      } as Omit<MensagemFala, 'id' | 'timestamp' | 'turno' | 'rodada'>);

      await sessaoStore.salvarSessao(sessaoAtual.value as SessaoJogo);

      $q.notify({
        type: 'positive',
        message: `${personagemData.nome} agiu`,
        caption: acaoIA,
        icon: 'psychology',
      });
    }
  } catch (error) {
    console.error(`Erro ao processar turno IA de ${personagemData.nome}:`, error);
    $q.notify({
      type: 'negative',
      message: `Erro na IA de ${personagemData.nome}`,
      caption: String(error),
    });
  } finally {
    iaProcessando.value = false;
  }
}

// Função para tentar usar IA avançada (OpenAI)
async function tentarIAAvancada(personagem: Personagem): Promise<string | null> {
  try {
    const openAIService = OpenAIService.getInstance();
    const configStore = useConfigStore();

    console.log('🤖 [DEBUG] Tentando IA avançada para:', personagem.nome);
    console.log('🤖 [DEBUG] Config Store carregado:', configStore.carregado);
    console.log('🤖 [DEBUG] API configurada (store):', configStore.isApiConfigured);
    console.log('🤖 [DEBUG] API Key presente (store):', !!configStore.configuracao.openaiApiKey);
    console.log('🤖 [DEBUG] OpenAI Service configurado:', openAIService.estaConfigurado());

    // Verificar se não está carregado ainda
    if (!configStore.carregado) {
      console.log('🤖 [DEBUG] ConfigStore não carregado ainda, carregando...');
      configStore.carregarConfiguracoes();
    }

    // Verificar se a API está configurada no store OU no serviço
    const apiConfigurada = configStore.isApiConfigured || openAIService.estaConfigurado();

    if (!apiConfigurada) {
      console.log('🤖 [DEBUG] OpenAI não configurada em lugar nenhum, usando IA básica');
      return null;
    }

    console.log('🤖 [DEBUG] Iniciando chamada para OpenAI...');

    // Construir contexto para a IA
    const contexto = construirContextoIA();
    const prompt = `Você é ${personagem.nome}, um ${personagem.raca} ${personagem.classe}.

${personagem.promptPersonalidade ? `Personalidade: ${personagem.promptPersonalidade}` : ''}

Contexto atual:
${contexto}

Decida sua ação neste turno. Responda como o personagem falaria, em primeira pessoa, de forma concisa (máximo 2 frases).`;

    console.log('🤖 [DEBUG] Prompt criado:', prompt.substring(0, 100) + '...');

    const resposta = await openAIService.enviarMensagem([{ role: 'user', content: prompt }]);

    console.log('🤖 [DEBUG] Resposta recebida da OpenAI:', resposta);

    return resposta.conteudo || null;
  } catch (error) {
    console.error('🤖 [ERROR] Erro na IA avançada:', error);
    console.error('🤖 [ERROR] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return null;
  }
}

// Função para construir contexto para IA
function construirContextoIA(): string {
  if (!sessaoAtual.value) return '';

  const mensagensRecentes = sessaoAtual.value.getMensagensRecentes(3);
  const participantesInfo = personagensDisponiveis.value
    .filter((p) => participantesAtivos.value.includes(p.id))
    .map((p) => `${p.nome} (${p.isIA ? 'IA' : 'Jogador'})`)
    .join(', ');

  let contexto = `Turno ${sessaoAtual.value.turnoAtualIndex + 1}, Rodada ${sessaoAtual.value.rodadaAtual}\n`;
  contexto += `Participantes: ${participantesInfo}\n`;

  if (mensagensRecentes.length > 0) {
    contexto += `\nÚltimas ações:\n`;
    mensagensRecentes.forEach((msg) => {
      if (msg.tipo === 'fala') {
        const nomePers =
          personagensDisponiveis.value.find((p) => p.id === msg.personagem)?.nome || 'Alguém';
        contexto += `- ${nomePers}: "${msg.conteudo}"\n`;
      } else if (msg.tipo === 'mestre') {
        contexto += `- Mestre: ${msg.conteudo}\n`;
      }
    });
  }

  return contexto;
}

// Função para gerar ação específica de turno da IA (versão melhorada)
function gerarAcaoIA(personagem: Personagem): string | null {
  const ultimasMensagens = sessaoAtual.value?.getMensagensRecentes(2) || [];
  const temMensagensRecentes = ultimasMensagens.length > 0;

  // Respostas baseadas na personalidade e contexto
  let acoesContextuais: string[] = [];

  if (personagem.promptPersonalidade) {
    // Gerar respostas baseadas na personalidade
    const personalidade = personagem.promptPersonalidade.toLowerCase();

    if (personalidade.includes('corajoso') || personalidade.includes('guerreiro')) {
      acoesContextuais = [
        'Avanço com determinação, pronto para enfrentar qualquer perigo.',
        'Mantenho minha arma preparada e olhos atentos.',
        'Lidero o grupo com coragem, indicando o caminho.',
      ];
    } else if (personalidade.includes('sábio') || personalidade.includes('estudioso')) {
      acoesContextuais = [
        'Analiso cuidadosamente a situação antes de agir.',
        'Procuro por pistas ou conhecimentos que possam nos ajudar.',
        'Consulto meus conhecimentos sobre esta situação.',
      ];
    } else if (personalidade.includes('furtivo') || personalidade.includes('ladino')) {
      acoesContextuais = [
        'Movo-me silenciosamente, verificando por armadilhas.',
        'Observo as sombras e procuro por rotas alternativas.',
        'Mantenho-me nas sombras, atento a qualquer movimento.',
      ];
    } else if (personalidade.includes('social') || personalidade.includes('carismático')) {
      acoesContextuais = [
        'Tento estabelecer comunicação e entender as intenções.',
        'Procuro mediar a situação com diplomacia.',
        'Observo as expressões e linguagem corporal ao redor.',
      ];
    }
  }

  // Se não tem personalidade específica, usar ações baseadas na classe
  if (acoesContextuais.length === 0) {
    const classe = personagem.classe.toLowerCase();

    if (classe.includes('guerreiro') || classe.includes('lutador')) {
      acoesContextuais = [
        'Preparo-me para o combate, checando meu equipamento.',
        'Posiciono-me estrategicamente para proteger o grupo.',
        'Avalio as ameaças potenciais ao nosso redor.',
      ];
    } else if (classe.includes('mago') || classe.includes('feiticeiro')) {
      acoesContextuais = [
        'Concentro-me, sentindo as energias mágicas ao redor.',
        'Preparo um feitiço que pode ser útil nesta situação.',
        'Analiso os padrões mágicos presentes no ambiente.',
      ];
    } else if (classe.includes('ladino') || classe.includes('batedor')) {
      acoesContextuais = [
        'Verifico discretamente por armadilhas e perigos ocultos.',
        'Examino o ambiente em busca de informações úteis.',
        'Mantenho-me alerta para sinais de perigo.',
      ];
    } else if (classe.includes('clérigo') || classe.includes('paladino')) {
      acoesContextuais = [
        'Ofereço uma oração silenciosa por proteção.',
        'Verifico o bem-estar dos companheiros.',
        'Mantenho-me vigilante contra forças malignas.',
      ];
    }
  }

  // Ações genéricas como fallback
  const acoesGenericas = [
    'Observo atentamente os arredores.',
    'Aguardo o momento certo para agir.',
    'Mantenho-me preparado para qualquer eventualidade.',
    'Analiso a situação com cuidado.',
    'Procuro por algo que possa nos ajudar.',
  ];

  // Escolher lista de ações
  const acoesDisponiveis = acoesContextuais.length > 0 ? acoesContextuais : acoesGenericas;

  // Se há mensagens recentes, pode reagir a elas
  if (temMensagensRecentes && Math.random() < 0.4) {
    const reacoes = [
      'Concordo com essa abordagem.',
      'Interessante... vamos ver no que dá.',
      'Mantenho-me atento ao que foi dito.',
      'Boa observação.',
      'Vamos prosseguir com cautela.',
    ];
    const indice = Math.floor(Math.random() * reacoes.length);
    return reacoes[indice] || null;
  }

  const indice = Math.floor(Math.random() * acoesDisponiveis.length);
  return acoesDisponiveis[indice] || null;
}

function rolarDados() {
  try {
    const notacao = `${quantidadeDados.value}${tipoRolagem.value}${modificadorRolagem.value >= 0 ? '+' : ''}${modificadorRolagem.value}`;
    const resultado = Dados.rolar(notacao);

    $q.notify({
      type: 'positive',
      message: `🎲 Resultado: ${resultado.total}`,
      caption: `${notacao} = ${resultado.resultados.join(', ')}${modificadorRolagem.value ? ` ${modificadorRolagem.value >= 0 ? '+' : ''}${modificadorRolagem.value}` : ''}`,
    });

    mostrarDialogDados.value = false;
  } catch (error) {
    console.error('Erro ao rolar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao rolar dados',
      caption: String(error),
    });
  }
}

function alternarStatusSessao() {
  if (!sessaoAtual.value) return;

  try {
    if (sessaoAtual.value.statusAtual === StatusSessao.ATIVA) {
      sessaoAtual.value.pausar();
    } else if (sessaoAtual.value.statusAtual === StatusSessao.PAUSADA) {
      sessaoAtual.value.retomar();
    }

    $q.notify({
      type: 'info',
      message: 'Status da sessão alterado',
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao alterar status da sessão',
      caption: String(error),
    });
  }
}

function finalizarSessao() {
  if (!sessaoAtual.value) return;

  $q.dialog({
    title: 'Finalizar Sessão',
    message: 'Tem certeza que deseja finalizar esta sessão?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      sessaoAtual.value?.finalizar();

      $q.notify({
        type: 'positive',
        message: 'Sessão finalizada com sucesso!',
      });

      void router.push('/');
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao finalizar sessão',
        caption: String(error),
      });
    }
  });
}

function abrirCatalogoMagias() {
  mostrarCatalogoMagias.value = true;
}

// Função para limpar personificação
function limparPersonificacao() {
  personagemPersonificado.value = null;
}

// Watcher para detectar personificação no input
watch(novaMensagem, (novaMensagemValue) => {
  const matchPersonificacao = novaMensagemValue.match(/^@(\w+)\s/);
  if (matchPersonificacao) {
    const nomePersonagem = matchPersonificacao[1];
    const personagemEncontrado = personagensDisponiveis.value.find(
      (p) =>
        nomePersonagem &&
        p.nome.toLowerCase() === nomePersonagem.toLowerCase() &&
        sessaoAtual.value?.getParticipantes().includes(p.id),
    );

    personagemPersonificado.value = personagemEncontrado || null;
  } else {
    personagemPersonificado.value = null;
  }
});

// Utilidades
function getCorStatus(status?: string): string {
  switch (status) {
    case StatusSessao.ATIVA:
      return 'positive';
    case StatusSessao.PAUSADA:
      return 'warning';
    case StatusSessao.FINALIZADA:
      return 'grey';
    default:
      return 'grey';
  }
}

function getIconeStatus(status?: string): string {
  switch (status) {
    case StatusSessao.ATIVA:
      return 'play_circle';
    case StatusSessao.PAUSADA:
      return 'pause_circle';
    case StatusSessao.FINALIZADA:
      return 'check_circle';
    default:
      return 'radio_button_unchecked';
  }
}

function getTextoStatus(status?: string): string {
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

function getCorMensagem(tipo: string): string {
  switch (tipo) {
    case 'mestre':
      return 'blue-1';
    case 'fala':
      return 'orange-1';
    case 'acao':
      return 'green-1';
    case 'sistema':
      return 'grey-2';
    default:
      return 'grey-1';
  }
}

function getCorTextoMensagem(tipo: string): string {
  switch (tipo) {
    case 'mestre':
      return 'blue-8';
    case 'fala':
      return 'orange-8';
    case 'acao':
      return 'green-8';
    case 'sistema':
      return 'grey-8';
    default:
      return 'grey-9';
  }
}

function getCorAvatar(tipo: string, personagem?: string): string {
  // Verificar se é um personagem específico
  if (tipo === 'fala' && personagem) {
    const personagemData = personagensDisponiveis.value.find(
      (p) => p.nome === personagem || `${p.nome} (IA)` === personagem || p.id === personagem,
    );

    if (personagemData) {
      return personagemData.isIA ? 'purple' : 'blue';
    }
  }

  switch (tipo) {
    case 'mestre':
      return 'indigo';
    case 'fala':
      return 'blue';
    case 'acao':
      return 'green';
    case 'sistema':
      return 'grey';
    default:
      return 'primary';
  }
}

function getInicialAvatar(texto: string): string {
  return texto[0]?.toUpperCase() || '?';
}

function formatarHoraMensagem(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helpers para mensagens
function getMensagemConteudo(mensagem: Record<string, unknown>): string {
  if ('conteudo' in mensagem) {
    const conteudo = mensagem.conteudo;
    if (typeof conteudo === 'string') return conteudo;
    if (typeof conteudo === 'number' || typeof conteudo === 'boolean') return String(conteudo);
    if (conteudo != null) return JSON.stringify(conteudo);
    return '';
  }
  if ('acao' in mensagem) {
    const acao = mensagem.acao;
    const resultado = mensagem.resultado;

    let acaoStr = '';
    if (typeof acao === 'string') acaoStr = acao;
    else if (typeof acao === 'number' || typeof acao === 'boolean') acaoStr = String(acao);
    else if (acao != null) acaoStr = JSON.stringify(acao);

    let resultadoStr = '';
    if (typeof resultado === 'string') resultadoStr = resultado;
    else if (typeof resultado === 'number' || typeof resultado === 'boolean')
      resultadoStr = String(resultado);
    else if (resultado != null) resultadoStr = JSON.stringify(resultado);

    return `${acaoStr}: ${resultadoStr}`;
  }
  return 'Mensagem sem conteúdo';
}

function getMensagemPersonagem(mensagem: Record<string, unknown>): string {
  if ('personagem' in mensagem) {
    const personagemId = mensagem.personagem;
    if (typeof personagemId === 'string') {
      // Buscar nome do personagem pelo ID
      const personagemData = personagensDisponiveis.value.find((p) => p.id === personagemId);
      if (personagemData) {
        return personagemData.isIA ? `${personagemData.nome} (IA)` : personagemData.nome;
      }
      return personagemId;
    }
    if (typeof personagemId === 'number' || typeof personagemId === 'boolean')
      return String(personagemId);
    if (personagemId != null) return JSON.stringify(personagemId);
    return '';
  }

  // Para mensagens do mestre, verificar se há personificação
  if (mensagem.tipo === 'mestre' && 'personagem' in mensagem) {
    const personagemPersonificado = mensagem.personagem;
    if (typeof personagemPersonificado === 'string') {
      return `Mestre (como ${personagemPersonificado})`;
    }
  }

  return mensagem.tipo === 'mestre' ? 'Mestre' : 'Sistema';
}
</script>

<style scoped lang="scss">
.container-header-aside {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.left-side-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid $grey-5;
}

.cnt-game-context {
  display: grid;
  grid-template-columns: 50px 1fr;
  height: 100%;
}
.game-page {
  height: calc(100vh - 64px); /* Ajuste para cabeçalho */
}

.chat-area {
  background-color: #fafafa;
}
.tabs-area {
  border-right: 1px solid $grey-5;
}

.full-height {
  height: 100%;
}

.scroll {
  overflow-y: auto;
}

.chat-container {
  padding: 8px;
}

.chat-container .q-virtual-scroll__content {
  padding-bottom: 16px;
}
</style>
