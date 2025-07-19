<template>
  <div class="mensagem-chat" :class="{ 'mensagem-mestre': mensagem.tipo === 'mestre' }">
    <q-chat-message
      :text="[conteudoMensagem]"
      :sent="mensagem.tipo === 'mestre'"
      :bg-color="corFundo"
      :text-color="corTexto"
      :name="nomePersonagem"
      :stamp="formatarHora(mensagem.timestamp)"
    >
      <template v-slot:avatar>
        <q-avatar :color="corAvatar" text-color="white" size="32px">
          <q-icon v-if="iconeAvatar" :name="iconeAvatar" />
          <span v-else>{{ inicialAvatar }}</span>
        </q-avatar>
      </template>
    </q-chat-message>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Mensagem } from '../types';

interface Props {
  mensagem: Mensagem;
}

const props = defineProps<Props>();

// Computed properties
const conteudoMensagem = computed(() => {
  switch (props.mensagem.tipo) {
    case 'fala':
      return props.mensagem.conteudo;
    case 'acao':
      return `${props.mensagem.acao}: ${props.mensagem.resultado}`;
    case 'sistema':
      return props.mensagem.conteudo;
    case 'mestre':
      return props.mensagem.conteudo;
    default:
      return 'Mensagem sem conteúdo';
  }
});

const nomePersonagem = computed(() => {
  switch (props.mensagem.tipo) {
    case 'fala':
    case 'acao':
      return props.mensagem.personagem;
    case 'mestre':
      return props.mensagem.personagem || 'Mestre';
    case 'sistema':
      return 'Sistema';
    default:
      return 'Desconhecido';
  }
});

const corFundo = computed(() => {
  switch (props.mensagem.tipo) {
    case 'mestre':
      return 'blue-1';
    case 'fala':
      return 'orange-1';
    case 'acao':
      return 'green-1';
    case 'sistema':
      return 'grey-2';
    default:
      return 'grey-1';
  }
});

const corTexto = computed(() => {
  switch (props.mensagem.tipo) {
    case 'mestre':
      return 'blue-8';
    case 'fala':
      return 'orange-8';
    case 'acao':
      return 'green-8';
    case 'sistema':
      return 'grey-8';
    default:
      return 'grey-9';
  }
});

const corAvatar = computed(() => {
  switch (props.mensagem.tipo) {
    case 'mestre':
      return 'blue';
    case 'fala':
      return 'orange';
    case 'acao':
      return 'green';
    case 'sistema':
      return 'grey';
    default:
      return 'primary';
  }
});

const iconeAvatar = computed(() => {
  switch (props.mensagem.tipo) {
    case 'sistema':
      return 'settings';
    case 'acao':
      return 'flash_on';
    default:
      return null;
  }
});

const inicialAvatar = computed(() => {
  if (iconeAvatar.value) return '';
  return nomePersonagem.value[0]?.toUpperCase() || '?';
});

// Métodos
function formatarHora(timestamp: Date): string {
  return timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.mensagem-chat {
  margin-bottom: 12px;
}
</style>
