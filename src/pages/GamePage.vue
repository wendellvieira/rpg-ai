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
                <q-avatar size="24px" color="primary" text-color="white" class="q-mr-sm">
                  {{ participanteAtual?.nome?.[0] || '?' }}
                </q-avatar>
                <span class="text-weight-medium">{{
                  participanteAtual?.nome || 'Aguardando...'
                }}</span>
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
              <!-- Mensagens do chat -->
              <div v-for="(mensagem, index) in mensagensChat" :key="index" class="q-mb-md">
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

              <!-- Mensagem de carregamento quando IA está pensando -->
              <div v-if="iaProcessando" class="q-mb-md">
                <q-chat-message
                  :text="['Pensando...']"
                  :sent="false"
                  bg-color="grey-3"
                  text-color="grey-8"
                  name="IA"
                >
                  <template v-slot:avatar>
                    <q-avatar color="purple" text-color="white" size="32px">
                      <q-spinner />
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
                  placeholder="Digite uma mensagem ou ação..."
                  outlined
                  dense
                  @keyup.enter="enviarMensagem"
                >
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
      :personagem="null"
      @salvar="salvarPersonagemEditado"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSessaoStore } from '../stores/sessaoStore';
import { PersistenceManager } from '../services/PersistenceManager';
import { Dados } from '../classes/Dados';
import { StatusSessao } from '../classes/SessaoJogo';
import type { MensagemMestre } from '../types';
import IniciativaCombate from '../components/IniciativaCombate.vue';
import CatalogoMagias from '../components/CatalogoMagias.vue';
import EditarPersonagemDialog from '../components/EditarPersonagemDialog.vue';
import MapaCanvas from '../components/MapaCanvas.vue';

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

// Estado reativo
const splitterModel = ref(30);
const abaRecursos = ref('personagens');
const carregandoRecursos = ref(false);
const personagensDisponiveis = ref<PersonagemData[]>([]);
const novaMensagem = ref('');
const iaProcessando = ref(false);
const mostrarCatalogoMagias = ref(false);
const mostrarEditarPersonagem = ref(false);
const personagemParaEditar = ref<PersonagemData | null>(null);

// Controles de dados
const mostrarDialogDados = ref(false);
const tipoRolagem = ref('d20');
const quantidadeDados = ref(1);
const modificadorRolagem = ref(0);

// Opções
const tiposRolagem = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

// Computed
const sessaoAtual = computed(() => sessaoStore.sessaoAtual);
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
  mostrarEditarPersonagem.value = true;
}

function salvarPersonagemEditado(dadosPersonagem: {
  id?: string | undefined;
  nome: string;
  raca: string;
  classe: string;
  descricao: string;
  isIA: boolean;
  promptPersonalidade: string;
}) {
  // TODO: Implementar salvamento do personagem editado
  console.log('Salvando personagem editado:', dadosPersonagem);

  $q.notify({
    type: 'positive',
    message: 'Personagem salvo com sucesso!',
    position: 'top',
  });

  mostrarEditarPersonagem.value = false;
  void carregarRecursos(); // Recarregar lista de personagens
}

function enviarMensagem() {
  if (!novaMensagem.value.trim() || !sessaoAtual.value) return;

  try {
    sessaoAtual.value.adicionarMensagem({
      tipo: 'mestre',
      conteudo: novaMensagem.value.trim(),
    } as Omit<MensagemMestre, 'id' | 'timestamp' | 'turno' | 'rodada'>);

    novaMensagem.value = '';

    // TODO: Implementar salvamento quando store estiver funcionando
    console.log('Mensagem adicionada');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar mensagem',
      caption: String(error),
    });
  }
}

function avancarTurno() {
  if (!sessaoAtual.value) return;

  try {
    sessaoAtual.value.avancarTurno();

    $q.notify({
      type: 'info',
      message: `Turno avançado`,
    });
  } catch (error) {
    console.error('Erro ao avançar turno:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao avançar turno',
      caption: String(error),
    });
  }
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
  if (personagem && personagensDisponiveis.value.find((p) => p.nome === personagem)?.isIA) {
    return 'purple';
  }

  switch (tipo) {
    case 'mestre':
      return 'blue';
    case 'fala':
      return 'orange';
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
    const personagem = mensagem.personagem;
    if (typeof personagem === 'string') return personagem;
    if (typeof personagem === 'number' || typeof personagem === 'boolean')
      return String(personagem);
    if (personagem != null) return JSON.stringify(personagem);
    return '';
  }
  return 'Sistema';
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
</style>
