<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 700px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ magia ? 'Editar Magia' : 'Criar Nova Magia' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section style="max-height: 70vh; overflow-y: auto">
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
                  v-model="form.efeitos[0]!.tipo"
                  :options="opcoesEfeito"
                  label="Tipo de Efeito"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.efeitos[0]!.dados"
                  label="Dados (ex: 3d6, 1d8+mod)"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.efeitos[0]!.descricao"
                  label="Descrição do Efeito"
                  outlined
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          unelevated
          label="Salvar"
          color="primary"
          @click="salvarMagia"
          :loading="salvando"
          :disable="!formValido"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useMagiaStore } from '../stores/magiaStore';
import {
  Magia,
  EscolaMagia,
  TempoConjuracao,
  AlcanceMagia,
  DuracaoMagia,
  ComponenteMagia,
} from '../classes/Magia';

// Props
interface Props {
  magia?: DadosMagia; // Dados da magia para edição (opcional)
}

const props = defineProps<Props>();

// Emits
defineEmits([...useDialogPluginComponent.emits]);

// Composables
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const magiaStore = useMagiaStore();

// Interface para dados de magia serializados (para consistência)
interface DadosMagia {
  id: string;
  nome: string;
  descricao: string;
  escola: EscolaMagia;
  nivel: number;
  tempoConjuracao: TempoConjuracao;
  alcance: AlcanceMagia;
  componentes: ComponenteMagia[];
  componenteMaterial?: string;
  duracao: DuracaoMagia;
  concentracao: boolean;
  ritual: boolean;
  efeitos: Array<{
    tipo: 'dano' | 'cura' | 'buff' | 'debuff' | 'utilidade' | 'controle';
    dados?: string;
    condicao?: string;
    duracao?: string;
    descricao: string;
  }>;
  classes: string[];
  valor?: number;
}

// Estado
const salvando = ref(false);

// Form data
const form = reactive({
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
  efeitos: [
    {
      tipo: 'dano' as const,
      dados: '',
      descricao: '',
      condicao: '',
      duracao: '',
    },
  ] as Array<{
    tipo: 'dano' | 'cura' | 'buff' | 'debuff' | 'utilidade' | 'controle';
    dados?: string;
    condicao?: string;
    duracao?: string;
    descricao: string;
  }>,
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
    form.nome.trim() !== '' && form.descricao.trim() !== '' && form.nivel >= 0 && form.nivel <= 9
  );
});

// Methods
function salvarMagia() {
  if (!formValido.value) return;

  salvando.value = true;

  try {
    const novaMagia = new Magia({
      id: props.magia?.id || `magia-${Date.now()}`,
      nome: form.nome,
      escola: form.escola,
      nivel: form.nivel,
      descricao: form.descricao,
      tempoConjuracao: form.tempoConjuracao,
      alcance: form.alcance,
      duracao: form.duracao,
      componentes: form.componentes,
      componenteMaterial: form.componenteMaterial || '',
      concentracao: form.concentracao,
      ritual: form.ritual,
      classes: form.classes,
      efeitos: form.efeitos,
    });

    // Adicionar à store
    magiaStore.adicionarMagia(novaMagia);
    magiaStore.salvarMagias();

    onDialogOK(novaMagia);
  } catch (error) {
    console.error('Erro ao salvar magia:', error);
  } finally {
    salvando.value = false;
  }
}

// Preencher formulário se estiver editando
if (props.magia) {
  Object.assign(form, {
    nome: props.magia.nome || '',
    escola: props.magia.escola || EscolaMagia.EVOCACAO,
    nivel: props.magia.nivel ?? 1,
    descricao: props.magia.descricao || '',
    tempoConjuracao: props.magia.tempoConjuracao || TempoConjuracao.ACAO,
    alcance: props.magia.alcance || AlcanceMagia.PES_30,
    duracao: props.magia.duracao || DuracaoMagia.INSTANTANEA,
    componentes: props.magia.componentes || [],
    componenteMaterial: props.magia.componenteMaterial || '',
    concentracao: props.magia.concentracao || false,
    ritual: props.magia.ritual || false,
    classes: props.magia.classes || [],
    efeitos: props.magia.efeitos?.length
      ? [...props.magia.efeitos]
      : [
          {
            tipo: 'dano' as const,
            dados: '',
            descricao: '',
            condicao: '',
            duracao: '',
          },
        ],
  });
}
</script>
