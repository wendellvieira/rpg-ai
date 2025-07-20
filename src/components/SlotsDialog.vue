<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Slots de Magia - {{ personagem?.nome }}</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          aria-label="Fechar dialog de slots de magia"
        />
      </q-card-section>

      <q-card-section v-if="!personagem?.podeConjurar" class="text-center">
        <q-icon name="block" size="48px" color="grey-5" class="q-mb-sm" />
        <div class="text-grey-6">Este personagem não possui capacidades mágicas.</div>
      </q-card-section>

      <q-card-section v-else>
        <div class="text-subtitle2 q-mb-md">Classe: {{ personagem?.classe }}</div>

        <!-- Slots por Nível -->
        <q-list bordered>
          <q-item-label header>Slots de Magia</q-item-label>

          <q-item v-for="nivel in niveisComSlots" :key="nivel">
            <q-item-section side>
              <q-chip :color="getCorNivel(nivel)" text-color="white" size="md">
                {{ nivel }}
              </q-chip>
            </q-item-section>

            <q-item-section>
              <q-item-label>Nível {{ nivel }}</q-item-label>
              <q-item-label caption>
                {{ getSlotsInfo(nivel).disponiveis }} disponíveis de {{ getSlotsInfo(nivel).total }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <!-- Slots visuais -->
                <div
                  v-for="i in getSlotsInfo(nivel).total"
                  :key="i"
                  class="slot-visual"
                  :class="{
                    'slot-usado': i <= getSlotsInfo(nivel).usados,
                    'slot-disponivel': i > getSlotsInfo(nivel).usados,
                  }"
                >
                  <q-tooltip>
                    Slot {{ i }} - {{ i <= getSlotsInfo(nivel).usados ? 'Usado' : 'Disponível' }}
                  </q-tooltip>
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="niveisComSlots.length === 0">
            <q-item-section>
              <q-item-label class="text-grey-6">Nenhum slot de magia disponível</q-item-label>
              <q-item-label caption
                >Personagem de nível muito baixo ou classe não-conjuradora</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-if="personagem?.podeConjurar"
          flat
          label="Recuperar Slots"
          color="primary"
          @click="recuperarSlots"
          :disable="!temSlotsGastos"
          aria-label="Recuperar todos os slots de magia gastos"
        />
        <q-btn flat label="Fechar" color="primary" v-close-popup aria-label="Fechar dialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import type { Personagem } from '../classes/Personagem';
import type { NivelMagia } from '../types';

// Props
interface Props {
  personagem?: Personagem | null;
}

const props = defineProps<Props>();

// Emits
defineEmits([...useDialogPluginComponent.emits]);

// Composables
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

// Computed
const niveisComSlots = computed(() => {
  if (!props.personagem?.podeConjurar) return [];

  const niveis: NivelMagia[] = [];
  for (let i = 1; i <= 9; i++) {
    const nivel = i as NivelMagia;
    const slots = props.personagem.obterSlotsDisponiveis(nivel);
    if (slots.total > 0) {
      niveis.push(nivel);
    }
  }

  return niveis;
});

const temSlotsGastos = computed(() => {
  if (!props.personagem?.podeConjurar) return false;

  return niveisComSlots.value.some((nivel) => {
    const slots = props.personagem!.obterSlotsDisponiveis(nivel);
    return slots.usados > 0;
  });
});

// Métodos
function getSlotsInfo(nivel: NivelMagia) {
  if (!props.personagem) {
    return { total: 0, usados: 0, disponiveis: 0 };
  }
  return props.personagem.obterSlotsDisponiveis(nivel);
}

function getCorNivel(nivel: number): string {
  const cores = [
    '', // 0 (não usado)
    'green-6', // 1
    'blue-6', // 2
    'purple-6', // 3
    'orange-6', // 4
    'red-6', // 5
    'pink-6', // 6
    'indigo-6', // 7
    'teal-6', // 8
    'amber-6', // 9
  ];
  return cores[nivel] || 'grey-6';
}

function recuperarSlots() {
  if (!props.personagem?.podeConjurar) return;

  props.personagem.recuperarSlotsMagia();

  // Emit para notificar a atualização
  onDialogOK({
    action: 'slots-recuperados',
    personagem: props.personagem,
  });
}
</script>

<style scoped>
.slot-visual {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid;
}

.slot-disponivel {
  border-color: #1976d2;
  background-color: #1976d2;
}

.slot-usado {
  border-color: #9e9e9e;
  background-color: transparent;
}
</style>
