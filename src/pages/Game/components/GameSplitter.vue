<template>
  <q-splitter v-model="ctrl.splitterModel.value" :limits="[20, 80]" class="full-height">
    <!-- Painel Esquerdo - Recursos -->
    <template v-slot:before>
      <ResourceTabs :ctrl="ctrl" />
    </template>

    <!-- Painel Direito - Chat e Controles -->
    <template v-slot:after>
      <ChatInterface :ctrl="ctrl" />
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import type { GamePage_PageCtrl } from '../GamePage_PageCtrl';
import ResourceTabs from './ResourceTabs.vue';
import ChatInterface from './ChatInterface.vue';

interface Props {
  ctrl: GamePage_PageCtrl;
}

defineProps<Props>();
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
