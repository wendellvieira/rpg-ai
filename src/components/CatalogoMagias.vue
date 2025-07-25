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

      <q-card-section class="q-pa-none">
        <q-splitter v-model="splitterModel" style="height: calc(100vh - 100px)">
          <!-- Lista de Magias -->
          <template v-slot:before>
            <div class="q-pa-md">
              <!-- Filtros -->
              <div class="row q-gutter-md q-mb-md">
                <q-select
                  v-model="filtroEscola"
                  :options="opcoesEscola"
                  label="Escola de Magia"
                  outlined
                  dense
                  clearable
                  style="min-width: 180px"
                />
                <q-select
                  v-model="filtroNivel"
                  :options="opcoesNivel"
                  label="Nível"
                  outlined
                  dense
                  clearable
                  style="min-width: 120px"
                />
                <q-select
                  v-model="filtroClasse"
                  :options="opcoesClasse"
                  label="Classe"
                  outlined
                  dense
                  clearable
                  style="min-width: 140px"
                />
                <q-input
                  v-model="textoBusca"
                  label="Buscar magia..."
                  outlined
                  dense
                  debounce="300"
                  style="min-width: 200px"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
                <q-space />
                <q-btn
                  color="primary"
                  icon="add"
                  label="Nova Magia"
                  @click="abrirDialogNovaMagia"
                  unelevated
                />
              </div>

              <!-- Lista de Magias -->
              <q-list bordered separator>
                <q-item
                  v-for="magia in magiasFiltradas"
                  :key="magia.id"
                  clickable
                  @click="selecionarMagia(magia)"
                  :class="{ 'bg-blue-1': magiaSelecionada?.id === magia.id }"
                >
                  <q-item-section>
                    <q-item-label class="text-h6">{{ magia.nome }}</q-item-label>
                    <q-item-label caption>
                      {{ magia.escola || 'Evocação' }} • Nível
                      {{ magia.nivel === 0 ? 'Truque' : magia.nivel }}
                      {{ magia.concentracao ? ' • Concentração' : '' }}
                      {{ magia.ritual ? ' • Ritual' : '' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip :color="getCorNivel(magia.nivel)" text-color="white" size="sm">
                      {{ magia.nivel === 0 ? 'T' : magia.nivel }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>

              <!-- Estado Vazio -->
              <div v-if="magiasFiltradas.length === 0" class="text-center q-pa-xl">
                <q-icon name="search_off" size="48px" color="grey-5" />
                <div class="text-h6 q-mt-md text-grey-6">Nenhuma magia encontrada</div>
                <div class="text-caption text-grey-5">
                  Tente ajustar os filtros ou termo de busca
                </div>
              </div>
            </div>
          </template>

          <!-- Detalhes da Magia -->
          <template v-slot:after>
            <div class="q-pa-md">
              <div v-if="magiaSelecionada" class="magia-detalhes">
                <!-- Header da Magia -->
                <div class="row items-center q-mb-md">
                  <div class="col">
                    <h4 class="q-my-none">{{ magiaSelecionada.nome }}</h4>
                    <div class="text-subtitle2 text-grey-7">
                      {{ magiaSelecionada.escola }} de
                      {{
                        magiaSelecionada.nivel === 0 ? 'truque' : `nível ${magiaSelecionada.nivel}`
                      }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn-group flat>
                      <q-btn
                        icon="add"
                        color="primary"
                        label="Adicionar"
                        @click="adicionarMagia"
                        :disable="!personagemSelecionado"
                      />
                      <q-btn icon="edit" color="secondary" label="Editar" @click="editarMagia" />
                    </q-btn-group>
                  </div>
                </div>

                <!-- Informações Básicas -->
                <q-list>
                  <q-item dense>
                    <q-item-section avatar><q-icon name="schedule" /></q-item-section>
                    <q-item-section>
                      <q-item-label caption>Tempo de Conjuração</q-item-label>
                      <q-item-label>{{
                        magiaSelecionada.tempoConjuracao || 'Não informado'
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item dense>
                    <q-item-section avatar><q-icon name="straighten" /></q-item-section>
                    <q-item-section>
                      <q-item-label caption>Alcance</q-item-label>
                      <q-item-label>{{ magiaSelecionada.alcance || 'Não informado' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item dense>
                    <q-item-section avatar><q-icon name="gesture" /></q-item-section>
                    <q-item-section>
                      <q-item-label caption>Componentes</q-item-label>
                      <q-item-label>{{
                        magiaSelecionada ? getComponentesTexto(magiaSelecionada) : ''
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item dense>
                    <q-item-section avatar><q-icon name="timelapse" /></q-item-section>
                    <q-item-section>
                      <q-item-label caption>Duração</q-item-label>
                      <q-item-label>{{ magiaSelecionada.duracao || 'Não informado' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <!-- Descrição -->
                <q-separator class="q-my-md" />
                <div class="q-mb-md">
                  <div class="text-h6 q-mb-sm">Descrição</div>
                  <div class="text-body2 whitespace-pre-line">
                    {{ magiaSelecionada.descricao }}
                  </div>
                </div>

                <!-- Efeitos -->
                <div
                  v-if="magiaSelecionada.efeitos && magiaSelecionada.efeitos.length > 0"
                  class="q-mb-md"
                >
                  <div class="text-h6 q-mb-sm">Efeitos</div>
                  <q-list>
                    <q-item v-for="(efeito, index) in magiaSelecionada.efeitos" :key="index" dense>
                      <q-item-section avatar>
                        <q-chip :color="getCorEfeito(efeito.tipo)" text-color="white" size="sm">
                          {{ efeito.tipo }}
                        </q-chip>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-if="efeito.dados">
                          {{ efeito.dados }} {{ efeito.condicao ? `(${efeito.condicao})` : '' }}
                        </q-item-label>
                        <q-item-label caption>{{ efeito.descricao }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Classes que podem aprender -->
                <div
                  v-if="magiaSelecionada.classes && magiaSelecionada.classes.length > 0"
                  class="q-mb-md"
                >
                  <div class="text-h6 q-mb-sm">Classes</div>
                  <div class="row q-gutter-sm">
                    <q-chip
                      v-for="classe in magiaSelecionada.classes"
                      :key="classe"
                      color="blue-grey"
                      text-color="white"
                      size="sm"
                    >
                      {{ classe }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <!-- Estado sem seleção -->
              <div v-else class="text-center q-pa-xl">
                <q-icon name="auto_fix_high" size="64px" color="grey-5" />
                <div class="text-h6 q-mt-md text-grey-6">Selecione uma magia</div>
                <div class="text-caption text-grey-5">
                  Escolha uma magia da lista ao lado para ver os detalhes
                </div>
              </div>
            </div>
          </template>
        </q-splitter>
      </q-card-section>

      <!-- Toolbar inferior -->
      <q-card-actions align="right" class="bg-grey-1">
        <q-select
          v-model="personagemSelecionado"
          :options="personagensDisponiveis"
          option-label="nome"
          option-value="id"
          label="Personagem para adicionar magia"
          outlined
          dense
          style="min-width: 250px"
          class="q-mr-md"
        />
        <q-btn flat label="Nova Magia" color="primary" @click="novaMagia" />
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog de Edição/Criação de Magia -->
  <EditarMagiaDialog v-model="mostrarEdicaoMagia" :magia="magiaParaEditar" @ok="salvarMagia" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { usePersonagemStore } from '../stores/personagemStore';
import { useMagiaStore } from '../stores/magiaStore';
import {
  EscolaMagia,
  ComponenteMagia,
  type TempoConjuracao,
  type AlcanceMagia,
  type DuracaoMagia,
} from '../classes/Magia';
import EditarMagiaDialog from './EditarMagiaDialog.vue';

// Interface local para dados de magia
interface DadosMagiaSerializados {
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
  areaEfeito?: string;
  salvaguarda?: string;
}
// Props
const showDialog = defineModel<boolean>('modelValue', { required: true });

// Stores
const personagemStore = usePersonagemStore();
const magiaStore = useMagiaStore();
const $q = useQuasar();

// Estado local
const splitterModel = ref(40);
const magiaSelecionada = ref<DadosMagiaSerializados | null>(null);
const personagemSelecionado = ref<{ id: string; nome: string } | null>(null);
const mostrarEdicaoMagia = ref(false);
const magiaParaEditar = ref<DadosMagiaSerializados | null>(null);

// Filtros
const filtroEscola = ref<EscolaMagia | null>(null);
const filtroNivel = ref<number | null>(null);
const filtroClasse = ref<string | null>(null);
const textoBusca = ref('');
const textoBuscaDebounced = ref('');

// Debounce para a busca de texto (300ms)
watchDebounced(
  textoBusca,
  (novoTexto: string) => {
    textoBuscaDebounced.value = novoTexto;
  },
  { debounce: 300, maxWait: 1000 },
);

// Opções para filtros
const opcoesEscola = Object.values(EscolaMagia).map((escola) => ({
  label: escola.charAt(0).toUpperCase() + escola.slice(1),
  value: escola,
}));

const opcoesNivel = Array.from({ length: 10 }, (_, i) => ({
  label: i === 0 ? 'Truque' : `Nível ${i}`,
  value: i,
}));

const opcoesClasse = [
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
const magias = computed(() => {
  return magiaStore.magias;
});

const magiasFiltradas = computed(() => {
  let resultado = [...magias.value];

  // Filtro por escola
  if (filtroEscola.value) {
    resultado = resultado.filter((m) => m.escola === filtroEscola.value);
  }

  // Filtro por nível
  if (filtroNivel.value !== null) {
    resultado = resultado.filter((m) => m.nivel === filtroNivel.value);
  }

  // Filtro por classe
  if (filtroClasse.value) {
    resultado = resultado.filter((m) =>
      m.classes?.some((c: string) => c.toLowerCase().includes(filtroClasse.value!.toLowerCase())),
    );
  }

  // Filtro por texto (com debounce)
  if (textoBuscaDebounced.value) {
    const termo = textoBuscaDebounced.value.toLowerCase();
    resultado = resultado.filter(
      (m) => m.nome.toLowerCase().includes(termo) || m.descricao.toLowerCase().includes(termo),
    );
  }

  return resultado.sort((a, b) => {
    if (a.nivel !== b.nivel) return a.nivel - b.nivel;
    return a.nome.localeCompare(b.nome);
  });
});

const personagensDisponiveis = computed(() => {
  return personagemStore.personagens;
});

// Methods
function selecionarMagia(magia: DadosMagiaSerializados) {
  magiaSelecionada.value = magia;
}

function getCorNivel(nivel: number): string {
  const cores = [
    'grey-6', // Truque
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

function getCorEfeito(tipo: string): string {
  const cores: Record<string, string> = {
    dano: 'red-6',
    cura: 'green-6',
    buff: 'blue-6',
    debuff: 'orange-6',
    utilidade: 'purple-6',
    controle: 'pink-6',
  };
  return cores[tipo] || 'grey-6';
}

function getComponentesTexto(magia: {
  componentes?: ComponenteMagia[] | undefined;
  componenteMaterial?: string | undefined;
}): string {
  if (!magia.componentes || !Array.isArray(magia.componentes)) return '';

  const simbolos = magia.componentes.map((c: ComponenteMagia) => {
    switch (c) {
      case ComponenteMagia.VERBAL:
        return 'V';
      case ComponenteMagia.SOMATICO:
        return 'S';
      case ComponenteMagia.MATERIAL:
        return 'M';
      default:
        return '';
    }
  });

  let resultado = simbolos.join(', ');

  if (magia.componenteMaterial) {
    resultado += ` (${magia.componenteMaterial})`;
  }

  return resultado;
}

async function adicionarMagia() {
  if (!magiaSelecionada.value || !personagemSelecionado.value) return;

  // Buscar o personagem completo no store
  const personagemCompleto = personagemStore.obterPersonagemPorId(personagemSelecionado.value.id);
  if (!personagemCompleto) {
    $q.notify({
      type: 'negative',
      message: 'Personagem não encontrado',
      position: 'top',
    });
    return;
  }

  // Tentar aprender a magia
  const sucesso = personagemCompleto.aprenderMagia(magiaSelecionada.value.id);

  if (sucesso) {
    $q.notify({
      type: 'positive',
      message: `${magiaSelecionada.value.nome} foi adicionada ao grimório de ${personagemSelecionado.value.nome}`,
      position: 'top',
    });

    // Salvar alterações no personagem
    await personagemStore.salvarPersonagem(personagemCompleto);
  } else {
    $q.notify({
      type: 'warning',
      message: `${personagemSelecionado.value.nome} já conhece a magia ${magiaSelecionada.value.nome}`,
      position: 'top',
    });
  }
}

function editarMagia() {
  if (!magiaSelecionada.value) return;

  magiaParaEditar.value = magiaSelecionada.value;
  mostrarEdicaoMagia.value = true;
}

function novaMagia() {
  magiaParaEditar.value = null;
  mostrarEdicaoMagia.value = true;
}

function abrirDialogNovaMagia() {
  magiaParaEditar.value = null;
  mostrarEdicaoMagia.value = true;
}

function salvarMagia(novaMagia: DadosMagiaSerializados) {
  console.log('Magia salva:', novaMagia);
  mostrarEdicaoMagia.value = false;
  magiaParaEditar.value = null;
}

// Lifecycle
onMounted(() => {
  // Carregar magias se necessário
  magiaStore.carregarMagias();
});
</script>

<style scoped>
.magia-detalhes {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.whitespace-pre-line {
  white-space: pre-line;
}
</style>
