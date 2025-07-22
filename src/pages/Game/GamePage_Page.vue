<template>
  <q-page class="game-page">
    <GameSplitter :ctrl="ctrl" />

    <!-- Diálogos e Modais -->
    <EditarPersonagemDialog
      v-if="ctrl.mostrarEditarPersonagem.value"
      v-model="ctrl.mostrarEditarPersonagem.value"
      :personagem="ctrl.personagemParaEditar.value"
      @salvar="ctrl.salvarPersonagemEditado"
    />

    <CatalogoMagias
      v-if="ctrl.mostrarCatalogoMagias.value"
      v-model="ctrl.mostrarCatalogoMagias.value"
      :personagem="ctrl.personagemParaMagiasTyped"
      @aprender-magia="ctrl.abrirCatalogoMagiasParaPersonagem"
      @preparar-magias="ctrl.abrirPreparacaoMagiasParaPersonagem"
      @salvar="ctrl.salvarAlteracaoPersonagem"
    />

    <PrepararMagiasDialog
      v-if="ctrl.mostrarPrepararMagias.value"
      v-model="ctrl.mostrarPrepararMagias.value"
      :personagem="ctrl.personagemParaMagiasTyped"
      @salvar="ctrl.salvarAlteracaoPersonagem"
    />

    <!-- Dialog de Dados -->
    <q-dialog v-model="ctrl.mostrarDialogDados.value">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Rolar Dados</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-sm">
            <q-select
              v-model="ctrl.tipoRolagem.value"
              :options="ctrl.tiposRolagem"
              label="Tipo de Dado"
              outlined
              dense
            />

            <q-input
              v-model.number="ctrl.quantidadeDados.value"
              type="number"
              label="Quantidade"
              outlined
              dense
              min="1"
              max="10"
            />

            <q-input
              v-model.number="ctrl.modificadorRolagem.value"
              type="number"
              label="Modificador"
              outlined
              dense
              min="-10"
              max="10"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Rolar" @click="ctrl.rolarDados" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, watch, defineAsyncComponent } from 'vue';
import { GamePage_PageCtrl } from './GamePage_PageCtrl';
import GameSplitter from './components/GameSplitter.vue';

// Lazy loading para diálogos pesados
const EditarPersonagemDialog = defineAsyncComponent(
  () => import('../../components/EditarPersonagemDialog.vue'),
);
const PrepararMagiasDialog = defineAsyncComponent(
  () => import('../../components/PrepararMagiasDialog.vue'),
);
const CatalogoMagias = defineAsyncComponent(() => import('../../components/CatalogoMagias.vue'));

const ctrl = GamePage_PageCtrl.reactive();

// Expor o controller para o template e para componentes pais
defineExpose({ ctrl });

onMounted(async (): Promise<void> => {
  await ctrl.mount();
});

// Watchers para sincronizar com as mudanças
watch(
  () => ctrl.sessaoAtual?.id,
  (novoId, antigoId): void => {
    if (novoId && novoId !== antigoId) {
      // Sessão carregada ou trocada, fazer setup necessário
      console.log('📋 Sessão carregada/trocada:', novoId);
      // Auto-scroll após carregar sessão
      setTimeout((): void => {
        console.log('🎯 Auto-scroll após troca de sessão');
        void ctrl.scrollToBottom();
      }, 500); // Delay maior para troca de sessão
    }
  },
);

// Watcher para auto-scroll quando novas mensagens chegam
watch(
  () => ctrl.mensagensChat.length,
  (novoTamanho, tamanhoAnterior): void => {
    console.log(`📝 Mensagens: ${tamanhoAnterior || 0} → ${novoTamanho}`);
    if (novoTamanho > (tamanhoAnterior || 0)) {
      // Auto-scroll para a última mensagem quando nova mensagem é adicionada
      setTimeout((): void => {
        console.log('🎯 Auto-scroll por nova mensagem');
        void ctrl.scrollToBottom();
      }, 250); // Delay moderado para novas mensagens
    }
  },
);

// Watcher para auto-scroll quando mensagens são carregadas pela primeira vez
watch(
  () => ctrl.mensagensChat,
  (novasMensagens, mensagensAnteriores): void => {
    const isFirstLoad = !mensagensAnteriores || mensagensAnteriores.length === 0;
    const hasMessages = novasMensagens && novasMensagens.length > 0;

    if (hasMessages) {
      console.log(
        `📥 Mensagens ${isFirstLoad ? 'carregadas' : 'atualizadas'}: ${novasMensagens.length} itens`,
      );

      // Delay maior para carregamento inicial
      const delay = isFirstLoad ? 600 : 300;

      setTimeout((): void => {
        console.log(
          `🎯 Auto-scroll por ${isFirstLoad ? 'carregamento inicial' : 'atualização'} de mensagens`,
        );
        void ctrl.scrollToBottom();
      }, delay);
    }
  },
  { immediate: true, deep: false },
);
</script>

<style scoped lang="scss">
.game-page {
  height: calc(100vh - 64px); /* Ajuste para cabeçalho */
}
</style>
