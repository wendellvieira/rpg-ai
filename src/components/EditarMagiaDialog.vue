<template>
  <q-dialog v-model="showDialog" persistent maximized>
    <q-card>
      <q-toolbar class="bg-secondary text-white">
        <q-toolbar-title> {{ magia ? 'Editar' : 'Nova' }} Magia </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-md" style="max-height: 80vh; overflow-y: auto">
        <div class="row q-gutter-md">
          <!-- Informações Básicas -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.nome"
              label="Nome da Magia"
              outlined
              required
              :rules="[(val) => !!val || 'Nome é obrigatório']"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="form.escola"
              :options="opcoesEscola"
              label="Escola de Magia"
              outlined
              required
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model.number="form.nivel"
              type="number"
              label="Nível (0-9)"
              outlined
              min="0"
              max="9"
              required
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="form.descricao"
              label="Descrição"
              type="textarea"
              outlined
              rows="4"
              required
            />
          </div>

          <!-- Mecânicas -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="form.tempoConjuracao"
              :options="opcoesTempoConjuracao"
              label="Tempo de Conjuração"
              outlined
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.alcance"
              :options="opcoesAlcance"
              label="Alcance"
              outlined
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.duracao"
              :options="opcoesDuracao"
              label="Duração"
              outlined
              emit-value
              map-options
            />
          </div>

          <!-- Componentes -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.componentes"
              :options="opcoesComponentes"
              label="Componentes"
              outlined
              multiple
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.componenteMaterial"
              label="Material (se necessário)"
              outlined
              :disable="!form.componentes.includes(ComponenteMagia.MATERIAL)"
            />
          </div>

          <!-- Flags -->
          <div class="col-12">
            <q-checkbox v-model="form.concentracao" label="Requer Concentração" />
            <q-checkbox v-model="form.ritual" label="Pode ser Ritual" class="q-ml-md" />
          </div>

          <!-- Classes -->
          <div class="col-12">
            <q-select
              v-model="form.classes"
              :options="opcoesClasses"
              label="Classes que podem aprender"
              outlined
              multiple
              use-chips
            />
          </div>

          <!-- Efeito Básico -->
          <div class="col-12">
            <div class="text-h6 q-mb-md">Efeito Principal</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.efeito.tipo"
                  :options="opcoesEfeito"
                  label="Tipo de Efeito"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.efeito.dados" label="Dados (ex: 3d6, 1d8+mod)" outlined />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.efeito.descricao" label="Descrição do Efeito" outlined />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn flat label="Salvar" color="primary" @click="salvar" :disable="!formValido" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  EscolaMagia,
  TempoConjuracao,
  AlcanceMagia,
  DuracaoMagia,
  ComponenteMagia,
} from '../classes/Magia';
import type { Magia } from '../classes/Magia';

// Props
const showDialog = defineModel<boolean>('modelValue', { required: true });

const props = defineProps<{
  magia?: Magia | null;
}>();

// Emits
const emit = defineEmits<{
  salvar: [magia: Record<string, unknown>]; // Using Record instead of any
}>();

// Form data
const form = ref({
  nome: '',
  escola: EscolaMagia.EVOCACAO,
  nivel: 1,
  descricao: '',
  tempoConjuracao: TempoConjuracao.ACAO,
  alcance: AlcanceMagia.PES_30,
  duracao: DuracaoMagia.INSTANTANEA,
  componentes: [] as ComponenteMagia[],
  componenteMaterial: '',
  concentracao: false,
  ritual: false,
  classes: [] as string[],
  efeito: {
    tipo: 'dano',
    dados: '',
    descricao: '',
  },
});

// Opções para selects
const opcoesEscola = Object.values(EscolaMagia).map((escola) => ({
  label: escola.charAt(0).toUpperCase() + escola.slice(1),
  value: escola,
}));

const opcoesTempoConjuracao = Object.values(TempoConjuracao).map((tempo) => ({
  label: tempo,
  value: tempo,
}));

const opcoesAlcance = Object.values(AlcanceMagia).map((alcance) => ({
  label: alcance,
  value: alcance,
}));

const opcoesDuracao = Object.values(DuracaoMagia).map((duracao) => ({
  label: duracao,
  value: duracao,
}));

const opcoesComponentes = Object.values(ComponenteMagia).map((comp) => ({
  label: comp.charAt(0).toUpperCase() + comp.slice(1),
  value: comp,
}));

const opcoesEfeito = [
  { label: 'Dano', value: 'dano' },
  { label: 'Cura', value: 'cura' },
  { label: 'Buff', value: 'buff' },
  { label: 'Debuff', value: 'debuff' },
  { label: 'Utilidade', value: 'utilidade' },
  { label: 'Controle', value: 'controle' },
];

const opcoesClasses = [
  'Artífice',
  'Bárbaro',
  'Bardo',
  'Bruxo',
  'Clérigo',
  'Druida',
  'Feiticeiro',
  'Guerreiro',
  'Ladino',
  'Mago',
  'Paladino',
  'Patrulheiro',
  'Xamã',
];

// Computed
const formValido = computed(() => {
  return (
    form.value.nome.trim() !== '' &&
    form.value.descricao.trim() !== '' &&
    form.value.nivel >= 0 &&
    form.value.nivel <= 9
  );
});

// Methods
function salvar() {
  if (!formValido.value) return;

  const magiaData = {
    id: props.magia?.id,
    nome: form.value.nome,
    escola: form.value.escola,
    nivel: form.value.nivel,
    descricao: form.value.descricao,
    tempoConjuracao: form.value.tempoConjuracao,
    alcance: form.value.alcance,
    duracao: form.value.duracao,
    componentes: form.value.componentes,
    componenteMaterial: form.value.componenteMaterial || undefined,
    concentracao: form.value.concentracao,
    ritual: form.value.ritual,
    classes: form.value.classes,
    efeitos: [form.value.efeito],
    valor: 0,
  };

  emit('salvar', magiaData);
}

function resetForm() {
  form.value = {
    nome: '',
    escola: EscolaMagia.EVOCACAO,
    nivel: 1,
    descricao: '',
    tempoConjuracao: TempoConjuracao.ACAO,
    alcance: AlcanceMagia.PES_30,
    duracao: DuracaoMagia.INSTANTANEA,
    componentes: [],
    componenteMaterial: '',
    concentracao: false,
    ritual: false,
    classes: [],
    efeito: {
      tipo: 'dano',
      dados: '',
      descricao: '',
    },
  };
}

// Watchers
watch(
  () => props.magia,
  (magia) => {
    if (magia) {
      form.value = {
        nome: magia.nome,
        escola: magia.escola,
        nivel: magia.nivel,
        descricao: magia.descricao,
        tempoConjuracao: magia.tempoConjuracao,
        alcance: magia.alcance,
        duracao: magia.duracao,
        componentes: [...magia.componentes],
        componenteMaterial: magia.componenteMaterial || '',
        concentracao: magia.concentracao,
        ritual: magia.ritual,
        classes: [...magia.classes],
        efeito: magia.efeitos[0]
          ? {
              tipo: magia.efeitos[0].tipo,
              dados: magia.efeitos[0].dados || '',
              descricao: magia.efeitos[0].descricao,
            }
          : {
              tipo: 'dano',
              dados: '',
              descricao: '',
            },
      };
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

watch(showDialog, (show) => {
  if (!show && !props.magia) {
    resetForm();
  }
});
</script>
