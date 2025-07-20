<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { pwaService } from '../services/PWAService';

const $q = useQuasar();
const showInstallButton = ref(false);
let installPromptListener: (() => void) | null = null;

onMounted(() => {
  // Verificar se o prompt de instalação está disponível
  checkInstallAvailability();

  // Listener para quando o prompt se torna disponível
  installPromptListener = () => {
    showInstallButton.value = true;
  };
  window.addEventListener('pwa-install-available', installPromptListener);
});

onUnmounted(() => {
  if (installPromptListener) {
    window.removeEventListener('pwa-install-available', installPromptListener);
  }
});

async function checkInstallAvailability() {
  // Verifica se já está instalado como PWA
  if (pwaService.isPWA()) {
    showInstallButton.value = false;
    return;
  }

  // Verifica se o prompt está disponível
  showInstallButton.value = pwaService.canInstall();
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
.pwa-install-btn {
  margin-left: 8px;
}
</style>
