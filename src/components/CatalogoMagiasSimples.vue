<template>
  <q-dialog v-model="showDialog" persistent maximized>
    <q-card class="bg-white">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="auto_fix_high" class="q-mr-sm" />
          Catálogo de Magias
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-md">
        <div class="text-center q-py-xl">
          <q-icon name="auto_fix_high" size="64px" color="primary" />
          <div class="text-h5 q-mt-md">Sistema de Magias</div>
          <div class="text-body1 text-grey-6 q-mt-sm">
            Em desenvolvimento - Em breve você poderá gerenciar o catálogo completo de magias
          </div>

          <div class="q-mt-xl">
            <q-btn
              color="primary"
              icon="add"
              label="Nova Magia"
              @click="criarNovaMagia"
              class="q-mr-md"
            />
            <q-btn
              color="secondary"
              icon="library_books"
              label="Importar D&D 5e"
              @click="importarMagiasDD"
            />
          </div>

          <div class="q-mt-lg text-caption text-grey-5">
            Funcionalidades planejadas:<br />
            • Catálogo completo de magias D&D 5e<br />
            • Editor de magias customizadas<br />
            • Filtros por escola, nível e classe<br />
            • Adição de magias aos personagens<br />
            • Sistema de slots de magia
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

// Props
const showDialog = defineModel<boolean>('modelValue', { required: true });

// Quasar
const $q = useQuasar();

// Methods
function criarNovaMagia() {
  $q.notify({
    type: 'info',
    message: 'Editor de magias em desenvolvimento',
    position: 'top',
  });
}

function importarMagiasDD() {
  $q.notify({
    type: 'info',
    message: 'Importação de magias D&D 5e em desenvolvimento',
    position: 'top',
  });
}
</script>
