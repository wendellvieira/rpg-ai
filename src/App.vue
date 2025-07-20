<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
// import { pwaService } from './services/PWAService'; // TEMPORARIAMENTE DESABILITADO
import { themeService } from './services/ThemeService';

onMounted(() => {
  // Inicializa o PWA service para registrar o service worker
  // console.log('PWA Service initialized:', pwaService); // TEMPORARIAMENTE DESABILITADO

  // Inicializa o tema
  console.log('Theme Service initialized:', themeService);
});
</script>
