<template>
  <q-dialog v-model="showDialog" persistent maximized>
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="bookmark" class="q-mr-sm" />
          Preparar Magias - {{ personagem?.nome }}
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-md">
        <div class="row q-gutter-lg">
          <!-- Magias Conhecidas -->
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md">
              <q-icon name="menu_book" class="q-mr-sm" />
              Magias Conhecidas
            </div>

            <q-input
              v-model="filtroConhecidas"
              label="Buscar magias..."
              outlined
              dense
              clearable
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-list bordered separator>
              <q-item
                v-for="magia in magiasConhecidasFiltradas"
                :key="magia.id"
                clickable
                @click="prepararMagia(magia)"
                :disable="jaPrepaTrada(magia.id) || magia.nivel === 0"
              >
                <q-item-section>
                  <q-item-label>{{ magia.nome }}</q-item-label>
                  <q-item-label caption>
                    {{ magia.escola }} • Nível {{ magia.nivel === 0 ? 'Truque' : magia.nivel }}
                    {{ magia.concentracao ? ' • Concentração' : '' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="magia.nivel === 0 ? 'blue' : 'purple'"
                    text-color="white"
                    size="sm"
                  >
                    {{ magia.nivel === 0 ? 'T' : magia.nivel }}
                  </q-chip>
                  <q-icon
                    v-if="jaPrepaTrada(magia.id)"
                    name="check_circle"
                    color="positive"
                    class="q-ml-sm"
                  />
                  <q-icon
                    v-else-if="magia.nivel === 0"
                    name="all_inclusive"
                    color="blue"
                    class="q-ml-sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="magiasConhecidasFiltradas.length === 0" class="text-center q-py-lg">
              <q-icon name="search_off" size="48px" color="grey-5" />
              <div class="text-caption text-grey-6">Nenhuma magia encontrada</div>
            </div>
          </div>

          <!-- Magias Preparadas -->
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md">
              <q-icon name="bookmark" class="q-mr-sm" />
              Magias Preparadas
            </div>

            <q-banner rounded class="bg-info text-white q-mb-md">
              <template v-slot:avatar>
                <q-icon name="info" />
              </template>
              Truques estão sempre preparados e não contam para o limite.
            </q-banner>

            <q-list bordered separator>
              <q-item
                v-for="magia in magiasPreparadas"
                :key="magia.id"
                :class="magia.nivel === 0 ? 'bg-blue-1' : 'bg-green-1'"
              >
                <q-item-section>
                  <q-item-label>{{ magia.nome }}</q-item-label>
                  <q-item-label caption>
                    {{ magia.escola }} • Nível {{ magia.nivel === 0 ? 'Truque' : magia.nivel }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="magia.nivel === 0 ? 'blue' : 'green'"
                    text-color="white"
                    size="sm"
                  >
                    {{ magia.nivel === 0 ? 'Truque' : 'Preparada' }}
                  </q-chip>
                  <q-btn
                    v-if="magia.nivel > 0"
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    @click="despreparMagia(magia.id)"
                    color="negative"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="magiasPreparadas.length === 0" class="text-center q-py-lg">
              <q-icon name="bookmark_border" size="48px" color="grey-5" />
              <div class="text-caption text-grey-6">Nenhuma magia preparada</div>
            </div>
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
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useMagiaStore, type DadosMagiaSerializados } from '../stores/magiaStore';
import type { Personagem } from '../classes/Personagem';

// Props
const showDialog = defineModel<boolean>('modelValue', { required: true });

const props = defineProps<{
  personagem?: Personagem | null;
}>();

// Stores e composables
const $q = useQuasar();
const magiaStore = useMagiaStore();

// Estado local
const filtroConhecidas = ref('');

// Computed
const magiasConhecidas = computed(() => {
  if (!props.personagem || !props.personagem.podeConjurar) return [];

  const idsConhecidas = props.personagem.obterMagiasConhecidas();
  return idsConhecidas.map((id) => magiaStore.obterMagia(id)).filter(Boolean);
});

const magiasPreparadas = computed(() => {
  if (!props.personagem || !props.personagem.podeConjurar) return [];

  const idsPreparadas = props.personagem.obterMagiasPreparadas();
  const preparadas = idsPreparadas.map((id) => magiaStore.obterMagia(id)).filter(Boolean);

  // Adicionar truques (sempre preparados)
  const truques = magiasConhecidas.value.filter((m) => m.nivel === 0);

  return [...truques, ...preparadas];
});

const magiasConhecidasFiltradas = computed(() => {
  if (!filtroConhecidas.value) return magiasConhecidas.value;

  const filtro = filtroConhecidas.value.toLowerCase();
  return magiasConhecidas.value.filter(
    (m) =>
      m.nome.toLowerCase().includes(filtro) ||
      m.escola.toLowerCase().includes(filtro) ||
      m.descricao.toLowerCase().includes(filtro),
  );
});

// Métodos
function jaPrepaTrada(magiaId: string): boolean {
  if (!props.personagem) return false;
  return props.personagem.temMagiaPreparada(magiaId);
}

function prepararMagia(magia: DadosMagiaSerializados) {
  if (!props.personagem) return;

  if (magia.nivel === 0) {
    $q.notify({
      type: 'info',
      message: 'Truques estão sempre preparados',
      position: 'top',
    });
    return;
  }

  if (jaPrepaTrada(magia.id)) {
    $q.notify({
      type: 'warning',
      message: 'Esta magia já está preparada',
      position: 'top',
    });
    return;
  }

  const sucesso = props.personagem.prepararMagia(magia.id);

  if (sucesso) {
    $q.notify({
      type: 'positive',
      message: `${magia.nome} foi preparada`,
      position: 'top',
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Não foi possível preparar a magia',
      position: 'top',
    });
  }
}

function despreparMagia(magiaId: string) {
  if (!props.personagem) return;

  const sucesso = props.personagem.despreparMagia(magiaId);

  if (sucesso) {
    $q.notify({
      type: 'positive',
      message: 'Magia despreparada',
      position: 'top',
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Não foi possível despreparar a magia',
      position: 'top',
    });
  }
}
</script>
