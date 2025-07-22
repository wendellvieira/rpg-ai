<template>
  <div class="mapas-tab">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Mapas</div>
        <div class="text-caption text-grey-6">Visualize e gerencie os mapas</div>
      </div>
    </div>

    <MapaViewer />
  </div>
</template>

<script setup lang="ts">
import MapaViewer from 'src/components/MapaViewer.vue';
import type { SetupPage_PageCtrl } from '../SetupPage_PageCtrl';

interface Props {
  ctrl: SetupPage_PageCtrl;
}

defineProps<Props>();
</script>
