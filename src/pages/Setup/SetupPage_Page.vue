<template>
  <q-page class="setup-page">
    <div class="q-pa-md">
      <div class="text-h4 q-mb-md">Configuração do Jogo</div>
      <div class="text-subtitle1 text-grey-6 q-mb-lg">
        Configure personagens, itens, mapas e ajustes do sistema
      </div>

      <SetupTabs :ctrl="ctrl" />
    </div>

    <!-- Dialogs -->
    <CriarPersonagemDialog
      v-model="ctrl.dialogNovoPersonagem.value"
      @personagem-criado="ctrl.adicionarPersonagem"
    />

    <EditarPersonagemDialog
      v-model="ctrl.dialogEditarPersonagem.value"
      :personagem="ctrl.personagemEditando.value"
      @personagem-editado="ctrl.salvarPersonagemEditado"
    />

    <EditarItemDialog
      v-model="ctrl.dialogEditarItem.value"
      :item="ctrl.itemEditando.value"
      @item-editado="ctrl.salvarItemEditado"
    />

    <GerenciamentoItensDialog
      v-model="ctrl.dialogNovoItem.value"
      @item-criado="ctrl.adicionarItem"
    />

    <ConfigurarAPIDialog v-if="ctrl.mostrarDialogAPI.value" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { SetupPage_PageCtrl } from './SetupPage_PageCtrl';
import SetupTabs from './components/SetupTabs.vue';
import CriarPersonagemDialog from 'src/components/CriarPersonagemDialog.vue';
import EditarPersonagemDialog from 'src/components/EditarPersonagemDialog.vue';
import EditarItemDialog from 'src/components/EditarItemDialog.vue';
import GerenciamentoItensDialog from 'src/components/GerenciamentoItensDialog.vue';
import ConfigurarAPIDialog from 'src/components/ConfigurarAPIDialog.vue';

const ctrl = SetupPage_PageCtrl.reactive();

onMounted(async () => {
  await ctrl.carregarDados();
});

defineExpose({ ctrl });
</script>

<style scoped>
.setup-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
