<template>
  <div class="chat-interface">
    <!-- Cabeçalho da sessão -->
    <div class="q-pa-md bg-grey-1">
      <div class="row items-center">
        <div class="col">
          <div class="text-h6">{{ ctrl.sessaoAtual?.nome || 'Nenhuma Sessão' }}</div>
          <div class="text-caption text-grey-6">
            {{ ctrl.sessaoAtual?.descricao || 'Selecione ou crie uma sessão' }}
          </div>
        </div>
        <div class="col-auto">
          <q-chip
            :color="ctrl.getCorStatus(ctrl.sessaoAtual?.statusAtual)"
            text-color="white"
            :icon="ctrl.getIconeStatus(ctrl.sessaoAtual?.statusAtual)"
            size="sm"
          >
            {{ ctrl.getTextoStatus(ctrl.sessaoAtual?.statusAtual) }}
          </q-chip>
        </div>
      </div>

      <!-- Indicador de turno -->
      <div v-if="ctrl.sessaoAtual && ctrl.participantesAtivos.length > 0" class="q-mt-sm">
        <div class="text-caption text-grey-6 q-mb-xs">Turno atual:</div>
        <div class="row items-center">
          <q-avatar
            size="24px"
            :color="ctrl.participanteAtual?.isIA ? 'purple' : 'primary'"
            text-color="white"
            class="q-mr-sm"
          >
            {{ ctrl.participanteAtual?.nome?.[0] || '?' }}
          </q-avatar>
          <div class="column q-mr-sm">
            <span class="text-weight-medium">{{
              ctrl.participanteAtual?.nome || 'Aguardando...'
            }}</span>
            <span v-if="ctrl.participanteAtual?.isIA" class="text-caption text-purple">
              Personagem IA
            </span>
          </div>

          <!-- Botão para executar IA manualmente -->
          <q-btn
            v-if="ctrl.participanteAtual?.isIA"
            flat
            round
            icon="psychology"
            size="sm"
            color="purple"
            :loading="ctrl.iaProcessando.value"
            @click="ctrl.executarIAManual"
            class="q-mr-sm"
          >
            <q-tooltip>Executar ação da IA</q-tooltip>
          </q-btn>

          <q-space />
          <div class="text-caption">
            Rodada {{ ctrl.sessaoAtual.rodadaAtual }} • Turno
            {{ ctrl.sessaoAtual.turnoAtualIndex + 1 }}/{{ ctrl.participantesAtivos.length }}
          </div>
        </div>
      </div>
    </div>

    <q-separator />

    <!-- Área do chat -->
    <div class="col scroll q-pa-md chat-area">
      <div v-if="!ctrl.sessaoAtual" class="text-center text-grey-6 q-py-xl">
        <q-icon name="chat_bubble_outline" size="4rem" class="q-mb-md" />
        <div class="text-h6">Nenhuma sessão ativa</div>
        <div class="q-mt-sm">Volte ao início para criar ou carregar uma sessão</div>
        <q-btn
          color="primary"
          label="Voltar ao Início"
          class="q-mt-md"
          @click="$router.push('/')"
        />
      </div>

      <div v-else>
        <!-- Mensagens do chat com virtual scrolling -->
        <q-virtual-scroll
          :ref="(el) => (ctrl.chatVirtualScroll.value = el)"
          :items="ctrl.mensagensChat"
          separator
          v-slot="{ item: mensagem, index }"
          style="max-height: calc(100vh - 300px)"
          class="chat-container"
        >
          <div :key="index" class="q-mb-md">
            <MessageBubble :mensagem="mensagem" :ctrl="ctrl" />
          </div>
        </q-virtual-scroll>

        <!-- Mensagem de carregamento quando IA está pensando -->
        <div v-if="ctrl.iaProcessando.value" class="q-mb-md">
          <q-chat-message
            :text="['🤔 Analisando situação...']"
            :sent="false"
            bg-color="blue-grey-2"
            text-color="blue-grey-8"
            name="IA Mestre"
          >
            <template v-slot:avatar>
              <q-avatar color="blue-grey-6" text-color="white" size="32px">
                <q-icon name="psychology" />
                <q-spinner-dots size="16px" class="absolute-center" color="white" />
              </q-avatar>
            </template>
          </q-chat-message>
        </div>
      </div>
    </div>

    <!-- Controles do mestre -->
    <div v-if="ctrl.sessaoAtual" class="q-pa-md bg-grey-1">
      <div class="row q-gutter-sm">
        <div class="col relative-position">
          <q-input
            v-model="ctrl.novaMensagem.value"
            placeholder="Digite uma mensagem, ação ou comando (/help para ajuda)"
            outlined
            dense
            @keyup.enter="ctrl.enviarMensagem"
            @input="ctrl.atualizarAutoComplete"
          >
            <template v-slot:prepend v-if="ctrl.personagemPersonificado.value">
              <q-avatar
                size="24px"
                :color="ctrl.personagemPersonificado.value.isIA ? 'purple' : 'blue'"
                text-color="white"
              >
                {{ ctrl.personagemPersonificado.value.nome[0] }}
              </q-avatar>
            </template>
            <template v-slot:append>
              <q-btn
                flat
                round
                icon="send"
                @click="ctrl.enviarMensagem"
                :disable="!ctrl.novaMensagem.value.trim()"
              />
            </template>
          </q-input>

          <!-- Auto-complete dropdown -->
          <q-menu
            v-model="ctrl.mostrarAutoComplete.value"
            no-focus
            no-refocus
            anchor="bottom left"
            self="top left"
            class="q-mt-xs"
            style="min-width: 300px"
          >
            <q-list dense>
              <q-item
                v-for="sugestao in ctrl.sugestoesComando.value"
                :key="sugestao.command"
                clickable
                @click="ctrl.selecionarComando(sugestao.command)"
                class="q-py-sm"
              >
                <q-item-section avatar>
                  <q-icon :name="sugestao.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ sugestao.command }}</q-item-label>
                  <q-item-label caption>{{ sugestao.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="ctrl.sugestoesComando.value.length === 0">
                <q-item-section>
                  <q-item-label class="text-grey-6">Nenhum comando encontrado</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>

      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          size="sm"
          icon="skip_next"
          label="Próximo Turno"
          @click="ctrl.avancarTurno"
          :disable="ctrl.participantesAtivos.length === 0"
        />
        <q-btn
          size="sm"
          icon="casino"
          label="Rolar Dados"
          @click="ctrl.mostrarDialogDados.value = true"
        />
        <q-btn
          size="sm"
          :icon="ctrl.sessaoAtual.statusAtual === 'ativa' ? 'pause' : 'play_arrow'"
          :label="ctrl.sessaoAtual.statusAtual === 'ativa' ? 'Pausar' : 'Continuar'"
          @click="alternarStatusSessao"
        />
        <q-btn size="sm" icon="stop" label="Finalizar" @click="finalizarSessao" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { GamePage_PageCtrl } from '../GamePage_PageCtrl';
import MessageBubble from './MessageBubble.vue';
import { StatusSessao } from '../../../classes/SessaoJogo';

interface Props {
  ctrl: GamePage_PageCtrl;
}

const props = defineProps<Props>();
const $router = useRouter();

// Métodos auxiliares do chat
function alternarStatusSessao() {
  if (!props.ctrl.sessaoAtual) return;

  const novoStatus =
    props.ctrl.sessaoAtual.statusAtual === StatusSessao.ATIVA
      ? StatusSessao.PAUSADA
      : StatusSessao.ATIVA;

  props.ctrl.sessaoAtual.statusAtual = novoStatus;
  void props.ctrl.sessaoStore.salvarSessao(props.ctrl.sessaoAtual);
}

function finalizarSessao() {
  if (!props.ctrl.sessaoAtual) return;

  props.ctrl.sessaoAtual.statusAtual = StatusSessao.FINALIZADA;
  void props.ctrl.sessaoStore.salvarSessao(props.ctrl.sessaoAtual);
}
</script>

<style scoped>
.chat-interface {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-area {
  flex: 1;
  overflow: hidden;
}

.chat-container {
  height: 100%;
}
</style>
