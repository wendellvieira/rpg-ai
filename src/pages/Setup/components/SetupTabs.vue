<template>
  <q-card>
    <q-tabs
      v-model="ctrl.abaAtiva.value"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="personagens" icon="people" label="Personagens" />
      <q-tab name="itens" icon="inventory" label="Itens" />
      <q-tab name="mapas" icon="map" label="Mapas" />
      <q-tab name="config" icon="settings" label="Configurações" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="ctrl.abaAtiva.value" animated>
      <!-- Aba Personagens -->
      <q-tab-panel name="personagens">
        <PersonagensTab :ctrl="ctrl" />
      </q-tab-panel>

      <!-- Aba Itens -->
      <q-tab-panel name="itens">
        <ItensTab :ctrl="ctrl" />
      </q-tab-panel>

      <!-- Aba Mapas -->
      <q-tab-panel name="mapas">
        <MapasTab :ctrl="ctrl" />
      </q-tab-panel>

      <!-- Aba Configurações -->
      <q-tab-panel name="config">
        <ConfigTab :ctrl="ctrl" />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup lang="ts">
import type { SetupPage_PageCtrl } from '../SetupPage_PageCtrl';
import PersonagensTab from './PersonagensTab.vue';
import ItensTab from './ItensTab.vue';
import MapasTab from './MapasTab.vue';
import ConfigTab from './ConfigTab.vue';

interface Props {
  ctrl: SetupPage_PageCtrl;
}

defineProps<Props>();
</script>
