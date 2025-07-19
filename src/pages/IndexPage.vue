<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Header da página -->
        <div class="text-center q-mb-xl">
          <h3 class="text-h3 q-my-md">
            <q-icon name="casino" size="3rem" class="q-mr-md" color="primary" />
            RPG-AI
          </h3>
          <p class="text-h6 text-grey-6">Simulador de RPG com múltiplas IAs</p>
        </div>

        <!-- Ações rápidas -->
        <div class="row q-gutter-lg q-mb-xl">
          <div class="col">
            <q-card class="text-center cursor-pointer" @click="criarNovaSessao">
              <q-card-section>
                <q-icon name="add_circle" size="4rem" color="primary" />
                <div class="text-h6 q-mt-md">Nova Sessão</div>
                <div class="text-caption text-grey-6">Começar uma nova aventura</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col">
            <q-card class="text-center cursor-pointer" @click="abrirGerenciamento">
              <q-card-section>
                <q-icon name="tune" size="4rem" color="secondary" />
                <div class="text-h6 q-mt-md">Gerenciar Recursos</div>
                <div class="text-caption text-grey-6">Personagens, itens e mapas</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col">
            <q-card class="text-center cursor-pointer" @click="abrirConfiguracoes">
              <q-card-section>
                <q-icon name="settings" size="4rem" color="accent" />
                <div class="text-h6 q-mt-md">Configurações</div>
                <div class="text-caption text-grey-6">API e preferências</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Lista de sessões salvas -->
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">
                  <q-icon name="history" class="q-mr-sm" />
                  Sessões Salvas
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  icon="refresh"
                  @click="carregarSessoes"
                  :loading="carregandoSessoes"
                >
                  <q-tooltip>Atualizar lista</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="carregandoSessoes" class="text-center">
            <q-spinner size="2rem" />
            <div class="q-mt-sm">Carregando sessões...</div>
          </q-card-section>

          <q-card-section v-else-if="sessoes.length === 0" class="text-center text-grey-6">
            <q-icon name="inbox" size="4rem" class="q-mb-md" />
            <div class="text-h6">Nenhuma sessão encontrada</div>
            <div class="q-mt-sm">Crie uma nova sessão para começar!</div>
          </q-card-section>

          <q-list v-else separator>
            <q-item
              v-for="sessao in sessoes"
              :key="sessao.id"
              clickable
              @click="abrirSessao(sessao.id)"
            >
              <q-item-section avatar>
                <q-avatar :color="getCorStatus(sessao.statusAtual)" text-color="white">
                  <q-icon :name="getIconeStatus(sessao.statusAtual)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ sessao.nome }}</q-item-label>
                <q-item-label caption lines="2">{{ sessao.descricao }}</q-item-label>
                <q-item-label caption>
                  <q-icon name="people" size="xs" class="q-mr-xs" />
                  {{ sessao.getParticipantes().length }} personagens •
                  <q-icon name="schedule" size="xs" class="q-ml-sm q-mr-xs" />
                  {{ formatarData(sessao.atualizadaEm) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn-group flat>
                  <q-btn
                    flat
                    round
                    icon="play_arrow"
                    size="sm"
                    color="positive"
                    @click.stop="abrirSessao(sessao.id)"
                  >
                    <q-tooltip>Continuar sessão</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="edit"
                    size="sm"
                    color="primary"
                    @click.stop="editarSessao(sessao)"
                  >
                    <q-tooltip>Editar sessão</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    size="sm"
                    color="negative"
                    @click.stop="confirmarExclusao(sessao)"
                  >
                    <q-tooltip>Excluir sessão</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Import/Export -->
        <div class="row q-gutter-md q-mt-lg">
          <div class="col">
            <q-btn
              outline
              color="primary"
              icon="cloud_upload"
              label="Importar Backup"
              @click="importarBackup"
              class="full-width"
            />
          </div>
          <div class="col">
            <q-btn
              outline
              color="secondary"
              icon="cloud_download"
              label="Exportar Backup"
              @click="exportarBackup"
              class="full-width"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog para nova sessão -->
    <q-dialog v-model="dialogNovaSessao" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Nova Sessão</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="novaSessao.nome"
            label="Nome da Sessão"
            outlined
            autofocus
            :rules="[(val) => !!val || 'Nome é obrigatório']"
            class="q-mb-md"
          />
          <q-input
            v-model="novaSessao.descricao"
            label="Descrição"
            type="textarea"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="dialogNovaSessao = false" />
          <q-btn
            flat
            label="Criar"
            color="primary"
            @click="confirmarNovaSessao"
            :disable="!novaSessao.nome"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para editar sessão -->
    <q-dialog v-model="dialogEditarSessao" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Editar Sessão</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="sessaoEdicao.nome"
            label="Nome da Sessão"
            outlined
            :rules="[(val) => !!val || 'Nome é obrigatório']"
            class="q-mb-md"
          />
          <q-input
            v-model="sessaoEdicao.descricao"
            label="Descrição"
            type="textarea"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="dialogEditarSessao = false" />
          <q-btn
            flat
            label="Salvar"
            color="primary"
            @click="confirmarEdicaoSessao"
            :disable="!sessaoEdicao.nome"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Input de arquivo para import -->
    <input
      ref="inputArquivo"
      type="file"
      accept=".json"
      style="display: none"
      @change="processarImport"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSessaoStore } from '../stores/sessaoStore';
import { PersistenceManager } from '../services/PersistenceManager';
import { DatabaseService } from '../services/DatabaseService';
import { BackupService } from '../services/BackupService';
import type { SessaoJogo } from '../classes/SessaoJogo';

const router = useRouter();
const $q = useQuasar();
const sessaoStore = useSessaoStore();

// Estado reativo
const carregandoSessoes = ref(false);
const sessoes = ref<SessaoJogo[]>([]);
const dialogNovaSessao = ref(false);
const dialogEditarSessao = ref(false);
const inputArquivo = ref<HTMLInputElement>();

// Dados dos dialogs
const novaSessao = ref({
  nome: '',
  descricao: '',
});

const sessaoEdicao = ref({
  id: '',
  nome: '',
  descricao: '',
});

// Lifecycle
onMounted(() => {
  void carregarSessoes();
});

// Métodos
async function carregarSessoes() {
  carregandoSessoes.value = true;
  try {
    const persistence = PersistenceManager.getInstance();
    await persistence.inicializar();
    const sessoesIndice = await persistence.listarSessoes();

    // Carregar dados completos das sessões
    const sessoesCompletas = [];
    for (const indice of sessoesIndice) {
      const sessao = await persistence.carregarSessao(indice.id);
      if (sessao) {
        sessoesCompletas.push(sessao);
      }
    }

    sessoes.value = sessoesCompletas.sort(
      (a: SessaoJogo, b: SessaoJogo) =>
        new Date(b.atualizadaEm).getTime() - new Date(a.atualizadaEm).getTime(),
    );
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar sessões',
      caption: String(error),
    });
  } finally {
    carregandoSessoes.value = false;
  }
}

function criarNovaSessao() {
  novaSessao.value = { nome: '', descricao: '' };
  dialogNovaSessao.value = true;
}

async function confirmarNovaSessao() {
  try {
    await sessaoStore.criarSessao({
      nome: novaSessao.value.nome,
      descricao: novaSessao.value.descricao,
    });
    dialogNovaSessao.value = false;

    $q.notify({
      type: 'positive',
      message: 'Sessão criada com sucesso!',
    });

    // Ir para a página do jogo
    void router.push('/game');
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao criar sessão',
      caption: String(error),
    });
  }
}

async function abrirSessao(sessaoId: string) {
  try {
    await sessaoStore.carregarSessao(sessaoId);
    void router.push('/game');
  } catch (error) {
    console.error('Erro ao abrir sessão:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao abrir sessão',
      caption: String(error),
    });
  }
}

function editarSessao(sessao: { id: string; nome: string; descricao: string }) {
  sessaoEdicao.value = {
    id: sessao.id,
    nome: sessao.nome,
    descricao: sessao.descricao,
  };
  dialogEditarSessao.value = true;
}

function confirmarEdicaoSessao() {
  try {
    // Por enquanto, vamos apenas notificar que a funcionalidade está em desenvolvimento
    // Isso será implementado quando tivermos métodos específicos para edição
    $q.notify({
      type: 'info',
      message: 'Edição de sessões em desenvolvimento',
    });

    dialogEditarSessao.value = false;
  } catch (error) {
    console.error('Erro ao editar sessão:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao editar sessão',
      caption: String(error),
    });
  }
}

function confirmarExclusao(sessao: { id: string; nome: string }) {
  $q.dialog({
    title: 'Excluir Sessão',
    message: `Tem certeza que deseja excluir a sessão "${sessao.nome}"? Esta ação não pode ser desfeita.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const persistence = PersistenceManager.getInstance();
        await persistence.removerSessao(sessao.id);
        await carregarSessoes();

        $q.notify({
          type: 'positive',
          message: 'Sessão excluída com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao excluir sessão:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir sessão',
          caption: String(error),
        });
      }
    })();
  });
}

function abrirGerenciamento() {
  void router.push('/setup');
}

function abrirConfiguracoes() {
  // TODO: Implementar dialog de configurações
  $q.notify({
    type: 'info',
    message: 'Configurações em desenvolvimento',
  });
}

async function exportarBackup() {
  try {
    const dbService = new DatabaseService();
    const backupService = new BackupService(dbService);
    await dbService.inicializar();

    const backup = await backupService.criarBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `rpg-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Backup exportado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao exportar backup:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar backup',
      caption: String(error),
    });
  }
}

function importarBackup() {
  inputArquivo.value?.click();
}

async function processarImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    const dbService = new DatabaseService();
    const backupService = new BackupService(dbService);
    await dbService.inicializar();

    await backupService.restaurarBackup(text);
    await carregarSessoes();

    $q.notify({
      type: 'positive',
      message: 'Backup importado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao importar backup:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao importar backup',
      caption: String(error),
    });
  } finally {
    // Limpar o input
    if (input) input.value = '';
  }
}

// Utilidades
function getCorStatus(status: string): string {
  switch (status) {
    case 'ativa':
      return 'positive';
    case 'pausada':
      return 'warning';
    case 'finalizada':
      return 'grey';
    default:
      return 'primary';
  }
}

function getIconeStatus(status: string): string {
  switch (status) {
    case 'ativa':
      return 'play_circle';
    case 'pausada':
      return 'pause_circle';
    case 'finalizada':
      return 'check_circle';
    default:
      return 'radio_button_unchecked';
  }
}

function formatarData(data: Date | string): string {
  const dateObj = typeof data === 'string' ? new Date(data) : data;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
}
</style>
