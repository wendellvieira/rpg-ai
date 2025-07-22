<template>
  <q-chat-message
    :text="[getMensagemConteudo(mensagem)]"
    :sent="mensagem.tipo === 'mestre'"
    :bg-color="getCorMensagem(String(mensagem.tipo))"
    :text-color="getCorTextoMensagem(String(mensagem.tipo))"
    :name="getMensagemPersonagem(mensagem)"
    :stamp="formatarHoraMensagem(mensagem.timestamp as Date | string)"
  >
    <template v-slot:avatar>
      <q-avatar
        :color="getCorAvatar(String(mensagem.tipo), getMensagemPersonagem(mensagem))"
        text-color="white"
        size="32px"
      >
        {{ getInicialAvatar(getMensagemPersonagem(mensagem) || String(mensagem.tipo)) }}
      </q-avatar>
    </template>
  </q-chat-message>
</template>

<script setup lang="ts">
import type { GamePage_PageCtrl } from '../GamePage_PageCtrl';

interface Props {
  mensagem: Record<string, unknown>;
  ctrl: GamePage_PageCtrl;
}

const props = defineProps<Props>();

// Helpers para mensagens
function getMensagemConteudo(mensagem: Record<string, unknown>): string {
  if ('conteudo' in mensagem) {
    const conteudo = mensagem.conteudo;
    if (typeof conteudo === 'string') return conteudo;
    if (typeof conteudo === 'number' || typeof conteudo === 'boolean') return String(conteudo);
    if (conteudo != null) return JSON.stringify(conteudo);
    return '';
  }
  if ('acao' in mensagem) {
    const acao = mensagem.acao;
    const resultado = mensagem.resultado;

    let acaoStr = '';
    if (typeof acao === 'string') acaoStr = acao;
    else if (typeof acao === 'number' || typeof acao === 'boolean') acaoStr = String(acao);
    else if (acao != null) acaoStr = JSON.stringify(acao);

    let resultadoStr = '';
    if (typeof resultado === 'string') resultadoStr = resultado;
    else if (typeof resultado === 'number' || typeof resultado === 'boolean')
      resultadoStr = String(resultado);
    else if (resultado != null) resultadoStr = JSON.stringify(resultado);

    return `${acaoStr}: ${resultadoStr}`;
  }
  return 'Mensagem sem conteúdo';
}

function getMensagemPersonagem(mensagem: Record<string, unknown>): string {
  if ('personagem' in mensagem) {
    const personagemId = mensagem.personagem;
    if (typeof personagemId === 'string') {
      // Buscar nome do personagem pelo ID
      const personagemData = props.ctrl.personagensDisponiveis.value.find(
        (p) => p.id === personagemId,
      );
      if (personagemData) {
        return personagemData.isIA ? `${personagemData.nome} (IA)` : personagemData.nome;
      }
      return personagemId;
    }
    if (typeof personagemId === 'number' || typeof personagemId === 'boolean')
      return String(personagemId);
    if (personagemId != null) return JSON.stringify(personagemId);
    return '';
  }

  // Para mensagens do mestre, verificar se há personificação
  if (mensagem.tipo === 'mestre' && 'personagem' in mensagem) {
    const personagemPersonificado = mensagem.personagem;
    if (typeof personagemPersonificado === 'string') {
      return `Mestre (como ${personagemPersonificado})`;
    }
  }

  return mensagem.tipo === 'mestre' ? 'Mestre' : 'Sistema';
}

function formatarHoraMensagem(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCorMensagem(tipo: string): string {
  switch (tipo) {
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
}

function getCorTextoMensagem(tipo: string): string {
  switch (tipo) {
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
}

function getCorAvatar(tipo: string, personagem?: string): string {
  // Verificar se é um personagem específico
  if (tipo === 'fala' && personagem) {
    const personagemData = props.ctrl.personagensDisponiveis.value.find(
      (p) => p.nome === personagem || `${p.nome} (IA)` === personagem || p.id === personagem,
    );

    if (personagemData) {
      return personagemData.isIA ? 'purple' : 'blue';
    }
  }

  switch (tipo) {
    case 'mestre':
      return 'indigo';
    case 'fala':
      return 'blue';
    case 'acao':
      return 'green';
    case 'sistema':
      return 'grey';
    default:
      return 'primary';
  }
}

function getInicialAvatar(texto: string): string {
  return texto[0]?.toUpperCase() || '?';
}
</script>
