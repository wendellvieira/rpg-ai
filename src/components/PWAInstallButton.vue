<template>
  <div class="pwa-controls">
    <!-- Botão de instalação -->
    <q-btn
      v-if="showInstallButton"
      flat
      round
      dense
      icon="download"
      color="primary"
      @click="installPWA"
      class="pwa-install-btn"
    >
      <q-tooltip>Instalar Aplicativo</q-tooltip>
    </q-btn>

    <!-- Indicador PWA Status -->
    <q-chip
      v-if="isPWAInstalled"
      color="positive"
      text-color="white"
      icon="phone_android"
      dense
      class="pwa-status-chip"
    >
      PWA Instalado
    </q-chip>

    <!-- Botão de atualização (quando disponível) -->
    <q-btn
      v-if="updateAvailable"
      flat
      round
      dense
      icon="system_update"
      color="orange"
      @click="updatePWA"
      class="pwa-update-btn"
    >
      <q-tooltip>Atualizar Aplicativo</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { pwaService } from '../services/PWAService';

const $q = useQuasar();
const showInstallButton = ref(false);
const isPWAInstalled = ref(false);
const updateAvailable = ref(false);
let installPromptListener: (() => void) | null = null;
let updateListener: (() => void) | null = null;
let serviceWorkerUpdateListener: (() => void) | null = null;

onMounted(() => {
  // Verificar status inicial
  checkPWAStatus();

  // Listener para quando o prompt se torna disponível
  installPromptListener = () => {
    showInstallButton.value = true;
  };
  window.addEventListener('pwa-install-available', installPromptListener);

  // Listener para quando PWA é instalado
  updateListener = () => {
    isPWAInstalled.value = true;
    showInstallButton.value = false;
  };
  window.addEventListener('pwa-installed', updateListener);

  // Listener para atualizações disponíveis
  serviceWorkerUpdateListener = () => {
    updateAvailable.value = true;
  };
  window.addEventListener('pwa-update-available', serviceWorkerUpdateListener);
});

onUnmounted(() => {
  if (installPromptListener) {
    window.removeEventListener('pwa-install-available', installPromptListener);
  }
  if (updateListener) {
    window.removeEventListener('pwa-installed', updateListener);
  }
  if (serviceWorkerUpdateListener) {
    window.removeEventListener('pwa-update-available', serviceWorkerUpdateListener);
  }
});

function checkPWAStatus() {
  // Verifica se já está instalado como PWA
  isPWAInstalled.value = pwaService.isPWA();

  if (isPWAInstalled.value) {
    showInstallButton.value = false;
    return;
  }

  // Verifica se o prompt está disponível
  showInstallButton.value = pwaService.canInstall();
}

async function updatePWA() {
  try {
    await pwaService.updateServiceWorker();
    $q.notify({
      type: 'positive',
      message: 'Aplicativo atualizado com sucesso!',
      icon: 'system_update',
    });
    updateAvailable.value = false;
  } catch (error) {
    console.error('Erro na atualização PWA:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar aplicativo',
      icon: 'error',
    });
  }
}

async function installPWA() {
  try {
    const installed = await pwaService.showInstallPrompt();
    if (installed) {
      $q.notify({
        type: 'positive',
        message: 'Aplicativo instalado com sucesso!',
        icon: 'check_circle',
      });
      showInstallButton.value = false;
    } else {
      $q.notify({
        type: 'info',
        message: 'Instalação cancelada pelo usuário',
        icon: 'info',
      });
    }
  } catch (error) {
    console.error('Erro na instalação PWA:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao instalar aplicativo',
      icon: 'error',
    });
  }
}
</script>

<style scoped>
.pwa-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pwa-install-btn,
.pwa-update-btn {
  margin-left: 4px;
}

.pwa-status-chip {
  font-size: 0.75rem;
  height: 24px;
}

.pwa-update-btn {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}
</style>
