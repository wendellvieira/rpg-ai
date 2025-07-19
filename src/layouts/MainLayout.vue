<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-icon name="casino" class="q-mr-sm" />
          RPG-AI
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- Status da API -->
          <q-chip
            :color="apiStatus === 'connected' ? 'positive' : 'negative'"
            text-color="white"
            :icon="apiStatus === 'connected' ? 'wifi' : 'wifi_off'"
            size="sm"
          >
            {{ apiStatus === 'connected' ? 'API Conectada' : 'API Desconectada' }}
          </q-chip>

          <!-- Menu de configurações -->
          <q-btn flat round dense icon="settings" @click="openConfigDialog">
            <q-tooltip>Configurações</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <!-- Navegação principal -->
        <q-item-label header>Navegação</q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />

        <q-separator />

        <!-- Sessões recentes -->
        <q-item-label header>Sessões Recentes</q-item-label>

        <q-item
          v-for="session in recentSessions"
          :key="session.id"
          clickable
          @click="openSession(session.id)"
        >
          <q-item-section avatar>
            <q-icon name="play_circle" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ session.nome }}</q-item-label>
            <q-item-label caption>
              {{ formatDate(session.atualizadaEm) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="more_vert"
              @click.stop="showSessionMenu(session)"
            />
          </q-item-section>
        </q-item>

        <q-item v-if="recentSessions.length === 0">
          <q-item-section>
            <q-item-label caption>Nenhuma sessão encontrada</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer com informações do turno (se em jogo) -->
    <q-footer v-if="currentSession && $route.name === 'game'" elevated>
      <q-toolbar class="bg-primary text-white">
        <q-space />

        <div class="text-center">
          <div class="text-body2">
            Turno {{ currentTurn + 1 }} / {{ totalParticipants }} - Rodada {{ currentRound }}
          </div>
          <div class="text-caption">
            {{ currentPlayerName || 'Aguardando...' }}
          </div>
        </div>

        <q-space />

        <!-- Controles do mestre -->
        <div class="q-gutter-sm">
          <q-btn flat icon="skip_next" label="Próximo" @click="nextTurn" :disable="!isMaster" />
          <q-btn flat icon="pause" label="Pausar" @click="pauseGame" :disable="!isMaster" />
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import EssentialLink from 'components/EssentialLink.vue';
import { useConfigStore } from '../stores/configStore';
import { useSessaoStore } from '../stores/sessaoStore';

// Tipos
interface RecentSession {
  id: string;
  nome: string;
  atualizadaEm: Date;
}

interface EssentialLinkProps {
  title: string;
  caption?: string;
  icon?: string;
  link?: string;
  to?: string;
}

// Estado local
const leftDrawerOpen = ref(false);
const router = useRouter();

// Stores
const configStore = useConfigStore();
const sessaoStore = useSessaoStore();

// Estado computado
const apiStatus = computed(() => (configStore.isApiConfigured ? 'connected' : 'disconnected'));
const recentSessions = computed(() => sessaoStore.sessoes.slice(0, 5));
const currentSession = computed(() => sessaoStore.sessaoAtual);
const currentTurn = computed(() => currentSession.value?.turnoAtualIndex ?? 0);
const currentRound = computed(() => currentSession.value?.rodadaAtual ?? 1);
const totalParticipants = computed(() => currentSession.value?.totalParticipantes ?? 0);
const currentPlayerName = computed(() => {
  if (!currentSession.value) return null;
  const playerId = currentSession.value.getPersonagemTurnoAtual();
  return playerId ? `Personagem ${playerId}` : null; // Em implementação real, buscar nome do personagem
});
const isMaster = computed(() => true); // Em implementação real, verificar se é o mestre

// Links essenciais de navegação
const essentialLinks: EssentialLinkProps[] = [
  {
    title: 'Início',
    caption: 'Lista de sessões',
    icon: 'home',
    to: '/',
  },
  {
    title: 'Nova Sessão',
    caption: 'Criar nova sessão',
    icon: 'add_circle',
    to: '/setup',
  },
  {
    title: 'Personagens',
    caption: 'Gerenciar personagens',
    icon: 'people',
    to: '/setup?tab=personagens',
  },
  {
    title: 'Itens',
    caption: 'Gerenciar itens',
    icon: 'inventory',
    to: '/setup?tab=itens',
  },
  {
    title: 'Mapas',
    caption: 'Gerenciar mapas e geração IA',
    icon: 'map',
    to: '/setup?tab=mapas',
  },
  {
    title: 'Configurações',
    caption: 'API e preferências',
    icon: 'settings',
    to: '/setup?tab=config',
  },
];

// Métodos
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function openConfigDialog() {
  void router.push('/setup?tab=config');
}

function openSession(sessionId: string) {
  void router.push({ name: 'game', params: { id: sessionId } });
}

function showSessionMenu(session: RecentSession) {
  // TODO: Implementar menu de contexto da sessão
  console.log('Menu da sessão:', session);
}

function nextTurn() {
  if (currentSession.value) {
    currentSession.value.avancarTurno();
  }
}

function pauseGame() {
  // TODO: Implementar pausa do jogo
  console.log('Pausar jogo');
}

function formatDate(dateValue: Date): string {
  return date.formatDate(dateValue, 'DD/MM/YYYY HH:mm');
}

// Lifecycle
onMounted(() => {
  // Carregar configurações e sessões
  configStore.carregarConfiguracoes();
  void sessaoStore.carregarSessoes();

  // Listener para fechar drawer quando um link é clicado
  document.addEventListener('close-drawer', () => {
    leftDrawerOpen.value = false;
  });
});
</script>

<style lang="scss" scoped>
.q-layout {
  min-height: 100vh;
}

.q-toolbar-title {
  font-weight: 600;
}

.q-drawer {
  .q-item {
    border-radius: 0 32px 32px 0;
    margin-right: 12px;
  }
}

.q-footer {
  .q-toolbar {
    min-height: 60px;
  }
}
</style>
