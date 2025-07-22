<template>
  <div class="personagens-tab">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Personagens</div>
        <div class="text-caption text-grey-6">Gerencie seus personagens</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Novo Personagem"
          @click="ctrl.dialogNovoPersonagem.value = true"
        />
      </div>
    </div>

    <div v-if="ctrl.carregandoPersonagens.value" class="text-center q-py-lg">
      <q-spinner size="2rem" />
      <div class="q-mt-sm">Carregando personagens...</div>
    </div>

    <div v-else-if="ctrl.personagens.value.length === 0" class="text-center q-py-xl text-grey-6">
      <q-icon name="people_outline" size="4rem" class="q-mb-md" />
      <div class="text-h6">Nenhum personagem criado</div>
      <div class="q-mt-sm">Crie seu primeiro personagem para começar!</div>
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="personagem in ctrl.personagens.value"
        :key="personagem.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="personagem-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <q-avatar size="40px" color="primary" text-color="white">
                {{ personagem.nome?.[0]?.toUpperCase() || '?' }}
              </q-avatar>
              <div class="col q-ml-md">
                <div class="text-h6">{{ personagem.nome }}</div>
                <div class="text-caption text-grey-6">
                  {{ personagem.raca }} {{ personagem.classe }}
                </div>
              </div>
              <q-badge v-if="personagem.isIA" color="purple" label="IA" />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              size="sm"
              icon="content_copy"
              label="Duplicar"
              @click="ctrl.duplicarPersonagem(personagem)"
            />
            <q-btn
              flat
              size="sm"
              icon="edit"
              label="Editar"
              @click="ctrl.editarPersonagem(personagem)"
            />
            <q-btn
              flat
              size="sm"
              icon="delete"
              color="negative"
              label="Excluir"
              @click="ctrl.confirmarExclusaoPersonagem(personagem)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SetupPage_PageCtrl } from '../SetupPage_PageCtrl';

interface Props {
  ctrl: SetupPage_PageCtrl;
}

defineProps<Props>();
</script>

<style scoped>
.personagem-card {
  height: 100%;
  transition: transform 0.2s;
}

.personagem-card:hover {
  transform: translateY(-2px);
}
</style>
