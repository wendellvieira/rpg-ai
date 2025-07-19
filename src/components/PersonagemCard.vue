<template>
  <q-card class="personagem-card" flat bordered>
    <q-card-section>
      <div class="row items-center no-wrap">
        <q-avatar size="48px" :color="personagem.isIA ? 'purple' : 'primary'" text-color="white">
          {{ personagem.nome[0].toUpperCase() }}
        </q-avatar>
        <div class="col q-ml-md">
          <div class="text-h6">{{ personagem.nome }}</div>
          <div class="text-caption text-grey-6">
            {{ personagem.raca }} {{ personagem.classe }}
            <q-badge v-if="personagem.isIA" color="purple" label="IA" class="q-ml-sm" />
          </div>
        </div>
        <q-space />
        <q-btn-dropdown flat round icon="more_vert" size="sm">
          <q-list>
            <q-item clickable v-close-popup @click="$emit('editar', personagem)">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>Editar</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('visualizar', personagem)">
              <q-item-section avatar>
                <q-icon name="visibility" />
              </q-item-section>
              <q-item-section>Visualizar</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="$emit('excluir', personagem)">
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>
              <q-item-section>Excluir</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>

    <!-- Atributos básicos -->
    <q-card-section v-if="mostrarDetalhes" class="q-pt-none">
      <div class="row q-gutter-sm">
        <div class="col-4">
          <div class="text-caption text-grey-6">HP</div>
          <q-linear-progress
            :value="
              personagem.atributos?.derivados?.hp / personagem.atributos?.derivados?.hpMaximo || 0
            "
            color="red"
            size="6px"
            class="q-mb-xs"
          />
          <div class="text-caption">
            {{ personagem.atributos?.derivados?.hp || 0 }}/{{
              personagem.atributos?.derivados?.hpMaximo || 0
            }}
          </div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-6">MP</div>
          <q-linear-progress
            :value="
              personagem.atributos?.derivados?.mp / personagem.atributos?.derivados?.mpMaximo || 0
            "
            color="blue"
            size="6px"
            class="q-mb-xs"
          />
          <div class="text-caption">
            {{ personagem.atributos?.derivados?.mp || 0 }}/{{
              personagem.atributos?.derivados?.mpMaximo || 0
            }}
          </div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-6">CA</div>
          <div class="text-h6">{{ personagem.atributos?.derivados?.ca || 10 }}</div>
        </div>
      </div>
    </q-card-section>

    <!-- Ações rápidas -->
    <q-card-actions v-if="mostrarAcoes" align="right">
      <q-btn
        flat
        size="sm"
        icon="add_circle"
        label="Adicionar à Sessão"
        @click="$emit('adicionar', personagem)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  personagem: any;
  mostrarDetalhes?: boolean;
  mostrarAcoes?: boolean;
}

interface Emits {
  editar: [personagem: any];
  visualizar: [personagem: any];
  excluir: [personagem: any];
  adicionar: [personagem: any];
}

withDefaults(defineProps<Props>(), {
  mostrarDetalhes: false,
  mostrarAcoes: false,
});

defineEmits<Emits>();
</script>

<style scoped>
.personagem-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.personagem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
