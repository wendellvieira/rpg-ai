<template>
  <q-card v-if="sessao && participantes.length > 0" flat bordered class="turno-indicator">
    <q-card-section class="q-pa-md">
      <div class="row items-center">
        <div class="col-auto">
          <q-avatar size="40px" :color="corPersonagemAtual" text-color="white">
            <q-icon v-if="personagemAtual?.isIA" name="smart_toy" />
            <span v-else>{{ personagemAtual?.nome?.[0] || '?' }}</span>
          </q-avatar>
        </div>
        <div class="col q-ml-md">
          <div class="text-h6">{{ personagemAtual?.nome || 'Aguardando...' }}</div>
          <div class="text-caption text-grey-6">
            {{ personagemAtual?.raca }} {{ personagemAtual?.classe }}
            <q-badge v-if="personagemAtual?.isIA" color="purple" label="IA" class="q-ml-sm" />
          </div>
        </div>
        <div class="col-auto text-right">
          <div class="text-caption text-grey-6">Turno</div>
          <div class="text-h6">{{ turnoAtual + 1 }}/{{ participantes.length }}</div>
          <div class="text-caption text-grey-6">Rodada {{ rodadaAtual }}</div>
        </div>
      </div>

      <!-- Barra de progresso -->
      <q-linear-progress
        :value="(turnoAtual + 1) / participantes.length"
        color="primary"
        size="4px"
        class="q-mt-sm"
      />

      <!-- Lista de participantes -->
      <div v-if="mostrarParticipantes" class="q-mt-md">
        <div class="text-caption text-grey-6 q-mb-sm">Ordem de Iniciativa:</div>
        <div class="row q-gutter-xs">
          <q-chip
            v-for="(participante, index) in participantes"
            :key="participante.id"
            :color="index === turnoAtual ? 'primary' : 'grey'"
            :text-color="index === turnoAtual ? 'white' : 'grey-8'"
            :icon="participante.isIA ? 'smart_toy' : 'person'"
            :label="participante.nome"
            size="sm"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Ações rápidas -->
    <q-card-actions v-if="mostrarAcoes" class="q-pa-md q-pt-none">
      <q-btn icon="skip_next" label="Próximo" size="sm" @click="$emit('avancar')" />
      <q-btn icon="refresh" label="Reiniciar Rodada" size="sm" flat @click="$emit('reiniciar')" />
      <q-space />
      <q-btn
        icon="more_horiz"
        flat
        round
        size="sm"
        @click="mostrarParticipantes = !mostrarParticipantes"
      >
        <q-tooltip>{{ mostrarParticipantes ? 'Ocultar' : 'Mostrar' }} participantes</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>

  <!-- Estado vazio -->
  <q-card v-else flat bordered class="text-center q-pa-lg">
    <q-icon name="people_outline" size="3rem" color="grey-5" />
    <div class="text-h6 text-grey-6 q-mt-sm">Nenhum participante</div>
    <div class="text-caption text-grey-6">Adicione personagens à sessão para começar</div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Participante {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  isIA: boolean;
}

interface Props {
  sessao?: any;
  participantes: Participante[];
  turnoAtual: number;
  rodadaAtual: number;
  mostrarAcoes?: boolean;
}

interface Emits {
  avancar: [];
  reiniciar: [];
}

const props = withDefaults(defineProps<Props>(), {
  mostrarAcoes: true,
});

defineEmits<Emits>();

// Estado local
const mostrarParticipantes = ref(false);

// Computed
const personagemAtual = computed(() => {
  return props.participantes[props.turnoAtual] || null;
});

const corPersonagemAtual = computed(() => {
  return personagemAtual.value?.isIA ? 'purple' : 'primary';
});
</script>

<style scoped>
.turno-indicator {
  border-left: 4px solid var(--q-primary);
}
</style>
