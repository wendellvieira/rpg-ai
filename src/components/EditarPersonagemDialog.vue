<template>
  <q-dialog v-model="showDialog" persistent maximized>
    <q-card class="bg-white">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="person" class="q-mr-sm" />
          Editar Personagem: {{ personagem?.nome || 'Novo Personagem' }}
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-none">
        <q-splitter v-model="splitterModel" style="height: calc(100vh - 100px)">
          <!-- Menu de Navegação -->
          <template v-slot:before>
            <div class="q-pa-md">
              <q-list>
                <q-item
                  v-for="tab in tabs"
                  :key="tab.name"
                  clickable
                  @click="abaAtiva = tab.name"
                  :class="{ 'bg-blue-1': abaAtiva === tab.name }"
                >
                  <q-item-section avatar>
                    <q-icon :name="tab.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ tab.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </template>

          <!-- Conteúdo Principal -->
          <template v-slot:after>
            <div class="q-pa-md full-height scroll">
              <!-- Aba Básico -->
              <div v-if="abaAtiva === 'basico'" class="q-gutter-md">
                <div class="text-h5 q-mb-md">Informações Básicas</div>

                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.nome"
                      label="Nome do Personagem"
                      outlined
                      required
                      :rules="[(val) => !!val || 'Nome é obrigatório']"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.raca" label="Raça" outlined required />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.classe" label="Classe" outlined required />
                  </div>
                </div>

                <q-input
                  v-model="form.descricao"
                  label="Descrição"
                  type="textarea"
                  outlined
                  rows="4"
                />

                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-checkbox v-model="form.isIA" label="Personagem controlado por IA" />
                  </div>
                </div>

                <div v-if="form.isIA" class="q-mt-md">
                  <q-input
                    v-model="form.promptPersonalidade"
                    label="Prompt de Personalidade para IA"
                    type="textarea"
                    outlined
                    rows="3"
                    hint="Descreva como a IA deve interpretar este personagem"
                  />
                </div>
              </div>

              <!-- Aba Atributos -->
              <div v-if="abaAtiva === 'atributos'" class="q-gutter-md">
                <div class="text-h5 q-mb-md">Atributos</div>

                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="text-h6 q-mb-md">Atributos Primários</div>

                    <div
                      v-for="(valor, atributo) in form.atributosPrimarios"
                      :key="atributo"
                      class="q-mb-md"
                    >
                      <div class="row items-center q-gutter-md">
                        <div class="col-3">
                          <div class="text-caption text-grey-6">
                            {{ formatarNomeAtributo(atributo) }}
                          </div>
                        </div>
                        <div class="col-4">
                          <q-input
                            v-model.number="form.atributosPrimarios[atributo]"
                            type="number"
                            outlined
                            dense
                            min="1"
                            max="30"
                          />
                        </div>
                        <div class="col-3">
                          <q-chip
                            :color="getModificadorCor(calcularModificador(valor))"
                            text-color="white"
                            size="sm"
                          >
                            {{ formatarModificador(calcularModificador(valor)) }}
                          </q-chip>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="text-h6 q-mb-md">Atributos Derivados</div>

                    <div class="q-gutter-md">
                      <q-input
                        v-model.number="form.atributosDerivados.hp"
                        label="HP Atual"
                        type="number"
                        outlined
                        dense
                      />
                      <q-input
                        v-model.number="form.atributosDerivados.hpMaximo"
                        label="HP Máximo"
                        type="number"
                        outlined
                        dense
                      />
                      <q-input
                        v-model.number="form.atributosDerivados.mp"
                        label="MP Atual"
                        type="number"
                        outlined
                        dense
                      />
                      <q-input
                        v-model.number="form.atributosDerivados.mpMaximo"
                        label="MP Máximo"
                        type="number"
                        outlined
                        dense
                      />
                      <q-input
                        v-model.number="form.atributosDerivados.ca"
                        label="Classe de Armadura"
                        type="number"
                        outlined
                        dense
                      />
                      <q-input
                        v-model.number="form.atributosDerivados.iniciativa"
                        label="Modificador de Iniciativa"
                        type="number"
                        outlined
                        dense
                      />
                      <q-input
                        v-model.number="form.atributosDerivados.velocidade"
                        label="Velocidade (metros)"
                        type="number"
                        outlined
                        dense
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aba Inventário -->
              <div v-if="abaAtiva === 'inventario'" class="q-gutter-md">
                <div class="text-h5 q-mb-md">Inventário</div>

                <div class="q-mb-md">
                  <q-btn color="primary" icon="add" label="Adicionar Item" @click="adicionarItem" />
                </div>

                <q-list bordered separator>
                  <q-item v-for="(item, index) in form.inventario" :key="index">
                    <q-item-section>
                      <q-item-label>{{ item.nome }} ({{ item.quantidade }}x)</q-item-label>
                      <q-item-label caption>ID: {{ item.id }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        icon="delete"
                        color="negative"
                        @click="removerItem(index)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-if="form.inventario.length === 0" class="text-center q-py-lg">
                  <q-icon name="inventory_2" size="48px" color="grey-5" />
                  <div class="text-caption text-grey-6">Nenhum item no inventário</div>
                </div>
              </div>

              <!-- Aba Magias -->
              <div v-if="abaAtiva === 'magias'" class="q-gutter-md">
                <div class="text-h5 q-mb-md">Sistema de Magias</div>

                <!-- Verificar se personagem pode conjurar -->
                <div v-if="!personagemPodeConjurar" class="q-mb-md">
                  <q-banner rounded class="bg-warning text-white">
                    <template v-slot:avatar>
                      <q-icon name="info" />
                    </template>
                    Este personagem não possui capacidades mágicas. Apenas classes conjuradoras
                    podem aprender magias.
                  </q-banner>
                </div>

                <!-- Sistema de Slots de Magia -->
                <div v-if="personagemPodeConjurar" class="q-mb-lg">
                  <div class="text-h6 q-mb-md">
                    <q-icon name="local_fire_department" class="q-mr-sm" />
                    Slots de Magia por Nível
                  </div>

                  <div class="row q-gutter-md">
                    <div v-for="nivel in 9" :key="nivel" class="col-12 col-sm-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm">
                          <div class="text-subtitle2 q-mb-xs">Nível {{ nivel }}</div>
                          <div class="row items-center q-gutter-sm">
                            <div class="col">
                              <div class="text-caption text-grey-6">Total:</div>
                              <div class="text-h6">{{ getSlotsDisponiveis(nivel).total }}</div>
                            </div>
                            <div class="col">
                              <div class="text-caption text-grey-6">Usados:</div>
                              <div class="text-h6 text-negative">
                                {{ getSlotsDisponiveis(nivel).usados }}
                              </div>
                            </div>
                            <div class="col">
                              <div class="text-caption text-grey-6">Disponíveis:</div>
                              <div class="text-h6 text-positive">
                                {{ getSlotsDisponiveis(nivel).disponiveis }}
                              </div>
                            </div>
                          </div>
                          <q-linear-progress
                            :value="
                              getSlotsDisponiveis(nivel).total > 0
                                ? getSlotsDisponiveis(nivel).usados /
                                  getSlotsDisponiveis(nivel).total
                                : 0
                            "
                            color="negative"
                            class="q-mt-sm"
                          />
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Truques (Nível 0) -->
                    <div class="col-12 col-sm-6 col-md-4">
                      <q-card flat bordered class="bg-blue-1">
                        <q-card-section class="q-pa-sm">
                          <div class="text-subtitle2 q-mb-xs">Truques (Ilimitado)</div>
                          <div class="text-caption text-grey-6">
                            Truques podem ser conjurados ilimitadamente
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>

                <!-- Magias Conhecidas -->
                <div v-if="personagemPodeConjurar" class="q-mb-lg">
                  <div class="text-h6 q-mb-md">
                    <q-icon name="menu_book" class="q-mr-sm" />
                    Magias Conhecidas
                    <q-btn
                      size="sm"
                      color="primary"
                      icon="add"
                      label="Adicionar"
                      @click="abrirCatalogoMagias"
                      class="q-ml-md"
                    />
                  </div>

                  <div v-if="magiasConhecidas.length > 0" class="q-gutter-sm">
                    <q-card v-for="magia in magiasConhecidas" :key="magia.id" flat bordered>
                      <q-card-section class="q-pa-sm">
                        <div class="row items-center">
                          <div class="col">
                            <div class="text-subtitle2">{{ magia.nome }}</div>
                            <div class="text-caption text-grey-6">
                              {{ magia.escola }} • Nível
                              {{ magia.nivel === 0 ? 'Truque' : magia.nivel }}
                              {{ magia.concentracao ? ' • Concentração' : '' }}
                            </div>
                          </div>
                          <div class="col-auto">
                            <q-chip
                              :color="magia.nivel === 0 ? 'blue' : 'purple'"
                              text-color="white"
                              size="sm"
                            >
                              {{ magia.nivel === 0 ? 'T' : magia.nivel }}
                            </q-chip>
                            <q-btn
                              flat
                              round
                              dense
                              icon="close"
                              size="sm"
                              @click="removerMagia(magia.id)"
                              color="negative"
                            />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div v-else class="text-center q-py-lg">
                    <q-icon name="auto_fix_high" size="48px" color="grey-5" />
                    <div class="text-caption text-grey-6">Nenhuma magia conhecida</div>
                    <q-btn
                      color="primary"
                      icon="add"
                      label="Adicionar Primeira Magia"
                      @click="abrirCatalogoMagias"
                      class="q-mt-md"
                    />
                  </div>
                </div>

                <!-- Magias Preparadas -->
                <div v-if="personagemPodeConjurar && magiasConhecidas.length > 0">
                  <div class="text-h6 q-mb-md">
                    <q-icon name="bookmark" class="q-mr-sm" />
                    Magias Preparadas
                    <q-btn
                      size="sm"
                      color="secondary"
                      icon="edit"
                      label="Gerenciar"
                      @click="abrirPrepararMagias"
                      class="q-ml-md"
                    />
                  </div>

                  <div class="q-mb-md">
                    <q-banner rounded class="bg-info text-white">
                      <template v-slot:avatar>
                        <q-icon name="info" />
                      </template>
                      Algumas classes precisam preparar magias antes de conjurá-las. Truques sempre
                      estão preparados.
                    </q-banner>
                  </div>

                  <div class="q-gutter-sm">
                    <q-card
                      v-for="magia in magiasPreparadas"
                      :key="magia.id"
                      flat
                      bordered
                      class="bg-green-1"
                    >
                      <q-card-section class="q-pa-sm">
                        <div class="row items-center">
                          <div class="col">
                            <div class="text-subtitle2">{{ magia.nome }}</div>
                            <div class="text-caption text-grey-6">
                              {{ magia.escola }} • Nível
                              {{ magia.nivel === 0 ? 'Truque' : magia.nivel }}
                            </div>
                          </div>
                          <div class="col-auto">
                            <q-chip color="green" text-color="white" size="sm"> Preparada </q-chip>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Aba Conhecimento -->
              <div v-if="abaAtiva === 'conhecimento'" class="q-gutter-md">
                <!-- Cabeçalho com busca e botão novo -->
                <div class="row q-gutter-md items-center">
                  <div class="col">
                    <q-input
                      v-model="termoBuscaConhecimento"
                      label="Pesquisar conhecimentos..."
                      outlined
                      dense
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-auto">
                    <q-btn color="primary" icon="add" label="Novo" @click="abrirNovoConhecimento" />
                  </div>
                </div>

                <!-- Filtros por categoria -->
                <div class="row q-gutter-xs">
                  <q-chip
                    clickable
                    :outline="categoriaFiltroConhecimento !== ''"
                    :color="categoriaFiltroConhecimento === '' ? 'primary' : 'grey-6'"
                    text-color="white"
                    label="Todos"
                    @click="categoriaFiltroConhecimento = ''"
                  />
                  <q-chip
                    v-for="categoria in categoriasConhecimentoDisponiveis"
                    :key="categoria"
                    clickable
                    :outline="categoriaFiltroConhecimento !== categoria"
                    :color="
                      categoriaFiltroConhecimento === categoria
                        ? getCategoriaColor(categoria)
                        : 'grey-6'
                    "
                    text-color="white"
                    :label="categoria"
                    @click="toggleCategoriaFiltro(categoria)"
                  />
                </div>

                <!-- Lista de conhecimentos com cards ricos -->
                <div v-if="conhecimentosFiltrados.length === 0" class="text-center q-py-xl">
                  <q-icon name="psychology" size="48px" color="grey-5" />
                  <div class="text-h6 text-grey-6 q-mt-md">
                    {{
                      termoBuscaConhecimento || categoriaFiltroConhecimento
                        ? 'Nenhum conhecimento encontrado'
                        : 'Nenhum conhecimento registrado'
                    }}
                  </div>
                  <div class="q-mt-sm text-grey-6">
                    {{
                      termoBuscaConhecimento || categoriaFiltroConhecimento
                        ? 'Tente outros termos de busca'
                        : 'Adicione o primeiro conhecimento!'
                    }}
                  </div>
                </div>

                <div v-else class="q-gutter-sm">
                  <q-card
                    v-for="conhecimento in conhecimentosFiltrados"
                    :key="conhecimento.id"
                    flat
                    bordered
                    class="conhecimento-card"
                  >
                    <q-card-section>
                      <div class="row items-start">
                        <div class="col">
                          <div class="text-h6 q-mb-xs">{{ conhecimento.topico }}</div>
                          <div class="text-body2 q-mb-sm">{{ conhecimento.conteudo }}</div>
                          <div class="row items-center text-caption text-grey-6">
                            <q-badge
                              :color="getCategoriaColor(conhecimento.categoria)"
                              :label="conhecimento.categoria"
                            />
                            <q-space />
                            <q-icon name="source" size="xs" class="q-mr-xs" />
                            {{ conhecimento.fonte }}
                            <q-icon name="schedule" size="xs" class="q-ml-md q-mr-xs" />
                            {{ formatarDataConhecimento(conhecimento.criadoEm) }}
                          </div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            flat
                            dense
                            round
                            icon="edit"
                            size="sm"
                            @click="editarConhecimentoItem(conhecimento)"
                          />
                          <q-btn
                            flat
                            dense
                            round
                            icon="delete"
                            size="sm"
                            color="negative"
                            @click="confirmarExclusaoConhecimento(conhecimento)"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </template>
        </q-splitter>
      </q-card-section>

      <!-- Toolbar inferior -->
      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="Cancelar" color="primary" @click="cancelar" />
        <q-btn flat label="Salvar" color="primary" @click="salvar" :disable="!formValido" />
      </q-card-actions>
    </q-card>

    <!-- Dialogs auxiliares -->
    <PrepararMagiasDialog v-model="mostrarPrepararMagias" :personagem="personagem" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useMagiaStore, type DadosMagiaSerializados } from '../stores/magiaStore';
import PrepararMagiasDialog from './PrepararMagiasDialog.vue';
import NovoConhecimentoDialog from './NovoConhecimentoDialog.vue';
import type { Personagem } from '../classes/Personagem';
import type {
  AtributosPrimarios,
  AtributosDerivados,
  ConhecimentoPersonagem,
  NivelMagia,
} from '../types';

// Props
const showDialog = defineModel<boolean>('modelValue', { required: true });

const props = defineProps<{
  personagem?: Personagem | null | undefined;
}>();

// Emits
const emit = defineEmits<{
  salvar: [
    personagem: {
      id?: string | undefined;
      nome: string;
      raca: string;
      classe: string;
      descricao: string;
      isIA: boolean;
      promptPersonalidade: string;
      atributosPrimarios: AtributosPrimarios;
      atributosDerivados: AtributosDerivados;
      inventario: { id: string; nome: string; quantidade: number }[];
      conhecimento: ConhecimentoPersonagem[];
    },
  ];
  abrirCatalogo: [personagem: Personagem];
  abrirPreparacao: [personagem: Personagem];
  personagemAlterado: [personagem: Personagem];
}>();

// Quasar
const $q = useQuasar();

// Stores
const magiaStore = useMagiaStore();

// Estado local
const splitterModel = ref(25);
const abaAtiva = ref('basico');
const mostrarPrepararMagias = ref(false);

// Estado da aba conhecimento
const termoBuscaConhecimento = ref('');
const categoriaFiltroConhecimento = ref('');

// Categorias disponíveis para conhecimento
const categoriasConhecimentoDisponiveis = [
  'Personagens',
  'Locais',
  'História',
  'Magias',
  'Itens',
  'Criaturas',
  'Organizações',
  'Segredos',
  'Geral',
];

// Tabs de navegação
const tabs = [
  { name: 'basico', label: 'Básico', icon: 'person' },
  { name: 'atributos', label: 'Atributos', icon: 'fitness_center' },
  { name: 'inventario', label: 'Inventário', icon: 'inventory' },
  { name: 'magias', label: 'Magias', icon: 'auto_fix_high' },
  { name: 'conhecimento', label: 'Conhecimento', icon: 'psychology' },
];

// Form data
const form = ref({
  nome: '',
  raca: '',
  classe: '',
  descricao: '',
  isIA: false,
  promptPersonalidade: '',
  atributosPrimarios: {
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10,
  } as AtributosPrimarios,
  atributosDerivados: {
    hp: 10,
    hpMaximo: 10,
    mp: 0,
    mpMaximo: 0,
    ca: 10,
    iniciativa: 0,
    velocidade: 9,
  } as AtributosDerivados,
  inventario: [] as { id: string; nome: string; quantidade: number }[],
  conhecimento: [] as ConhecimentoPersonagem[],
});

// Computed
const formValido = computed(() => {
  return (
    form.value.nome.trim() !== '' &&
    form.value.raca.trim() !== '' &&
    form.value.classe.trim() !== ''
  );
});

// Computed properties para magias
const personagemPodeConjurar = computed(() => {
  if (!props.personagem) return false;
  return props.personagem.podeConjurar;
});

const magiasConhecidas = computed(() => {
  if (!props.personagem || !props.personagem.podeConjurar) return [];

  const idsConhecidas = props.personagem.obterMagiasConhecidas();
  return idsConhecidas
    .map((id) => magiaStore.obterMagia(id))
    .filter((magia): magia is DadosMagiaSerializados => Boolean(magia));
});

const magiasPreparadas = computed(() => {
  if (!props.personagem || !props.personagem.podeConjurar) return [];

  const idsPreparadas = props.personagem.obterMagiasPreparadas();
  return idsPreparadas
    .map((id) => magiaStore.obterMagia(id))
    .filter((magia): magia is DadosMagiaSerializados => Boolean(magia));
});

// Computed para conhecimentos filtrados
const conhecimentosFiltrados = computed(() => {
  let resultados = form.value.conhecimento;

  // Filtrar por busca
  if (termoBuscaConhecimento.value) {
    const termo = termoBuscaConhecimento.value.toLowerCase();
    resultados = resultados.filter(
      (c) => c.topico.toLowerCase().includes(termo) || c.conteudo.toLowerCase().includes(termo),
    );
  }

  // Filtrar por categoria
  if (categoriaFiltroConhecimento.value) {
    resultados = resultados.filter((c) => c.categoria === categoriaFiltroConhecimento.value);
  }

  return resultados;
});

// Methods
function formatarNomeAtributo(atributo: string): string {
  const nomes: Record<string, string> = {
    forca: 'Força',
    destreza: 'Destreza',
    constituicao: 'Constituição',
    inteligencia: 'Inteligência',
    sabedoria: 'Sabedoria',
    carisma: 'Carisma',
  };
  return nomes[atributo] || atributo;
}

function calcularModificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

function formatarModificador(modificador: number): string {
  return modificador >= 0 ? `+${modificador}` : `${modificador}`;
}

function getModificadorCor(modificador: number): string {
  if (modificador >= 3) return 'green';
  if (modificador >= 1) return 'blue';
  if (modificador >= -1) return 'grey';
  if (modificador >= -3) return 'orange';
  return 'red';
}

function adicionarItem() {
  // Removido notificação para reduzir spam
  console.log('Sistema de inventário não implementado ainda');
}

function removerItem(index: number) {
  form.value.inventario.splice(index, 1);
}

function getSlotsDisponiveis(nivel: number) {
  if (!props.personagem || !props.personagem.podeConjurar) {
    return { total: 0, usados: 0, disponiveis: 0 };
  }

  return props.personagem.obterSlotsDisponiveis(nivel as NivelMagia);
}

function abrirCatalogoMagias() {
  if (!props.personagem) return;

  // Implementar via evento para abrir o catálogo no componente pai
  emit('abrirCatalogo', props.personagem);
}

function removerMagia(magiaId: string) {
  if (!props.personagem) return;

  $q.dialog({
    title: 'Remover Magia',
    message: 'Tem certeza que deseja remover esta magia do personagem?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (!props.personagem) return;

    const sucesso = props.personagem.esquecerMagia(magiaId);

    if (sucesso) {
      // Removido notificação para evitar spam - ação já é visível na UI
      console.log('Magia removida:', magiaId);
      // Emitir evento para que o componente pai atualize o personagem
      emit('personagemAlterado', props.personagem);
    } else {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível remover a magia',
        position: 'top',
      });
    }
  });
}

function abrirPrepararMagias() {
  if (!props.personagem) return;

  // Implementar via evento para abrir o dialog de preparação no componente pai
  emit('abrirPreparacao', props.personagem);
}

// Funções para conhecimento
function abrirNovoConhecimento() {
  $q.dialog({
    component: NovoConhecimentoDialog,
  }).onOk((novoConhecimento: Omit<ConhecimentoPersonagem, 'id' | 'criadoEm'>) => {
    const conhecimentoCompleto: ConhecimentoPersonagem = {
      id: gerarId(),
      criadoEm: new Date(),
      ...novoConhecimento,
    };
    form.value.conhecimento.push(conhecimentoCompleto);
  });
}

function editarConhecimentoItem(conhecimento: ConhecimentoPersonagem) {
  $q.dialog({
    component: NovoConhecimentoDialog,
    componentProps: {
      conhecimento,
    },
  }).onOk((conhecimentoEditado: Omit<ConhecimentoPersonagem, 'id' | 'criadoEm'>) => {
    const index = form.value.conhecimento.findIndex((c) => c.id === conhecimento.id);
    if (index !== -1) {
      form.value.conhecimento[index] = {
        ...conhecimento,
        ...conhecimentoEditado,
      };
    }
  });
}

function confirmarExclusaoConhecimento(conhecimento: ConhecimentoPersonagem) {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir o conhecimento "${conhecimento.topico}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = form.value.conhecimento.findIndex((c) => c.id === conhecimento.id);
    if (index !== -1) {
      form.value.conhecimento.splice(index, 1);
    }
  });
}

function toggleCategoriaFiltro(categoria: string) {
  categoriaFiltroConhecimento.value =
    categoriaFiltroConhecimento.value === categoria ? '' : categoria;
}

function getCategoriaColor(categoria: string): string {
  const cores: Record<string, string> = {
    Personagens: 'blue',
    Locais: 'green',
    História: 'orange',
    Magias: 'purple',
    Itens: 'teal',
    Criaturas: 'red',
    Organizações: 'indigo',
    Segredos: 'deep-orange',
    Geral: 'grey',
  };

  return cores[categoria] || 'grey';
}

function formatarDataConhecimento(data: Date): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function cancelar() {
  showDialog.value = false;
}

function salvar() {
  if (!formValido.value) return;

  const personagemData = {
    id: props.personagem?.id,
    ...form.value,
  };

  emit('salvar', personagemData);
  showDialog.value = false;
}

function resetForm() {
  form.value = {
    nome: '',
    raca: '',
    classe: '',
    descricao: '',
    isIA: false,
    promptPersonalidade: '',
    atributosPrimarios: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    },
    atributosDerivados: {
      hp: 10,
      hpMaximo: 10,
      mp: 0,
      mpMaximo: 0,
      ca: 10,
      iniciativa: 0,
      velocidade: 9,
    },
    inventario: [],
    conhecimento: [],
  };
}

function carregarPersonagem(personagem: Personagem) {
  const atributos = personagem.getAtributos;
  const inventarioItens: { id: string; nome: string; quantidade: number }[] = [];

  // Converter o Map do inventário para array de objetos
  for (const [itemId, quantidade] of personagem.getInventario) {
    inventarioItens.push({
      id: itemId,
      nome: itemId, // Será substituído pelo nome real quando integrado com itemStore
      quantidade,
    });
  }

  form.value = {
    nome: personagem.nome,
    raca: personagem.raca,
    classe: personagem.classe,
    descricao: personagem.descricao || '',
    isIA: personagem.isIA,
    promptPersonalidade: personagem.promptPersonalidade || '',
    atributosPrimarios: {
      forca: atributos.forca,
      destreza: atributos.destreza,
      constituicao: atributos.constituicao,
      inteligencia: atributos.inteligencia,
      sabedoria: atributos.sabedoria,
      carisma: atributos.carisma,
    },
    atributosDerivados: {
      hp: atributos.hp,
      hpMaximo: atributos.hpMaximo,
      mp: atributos.mp,
      mpMaximo: atributos.mpMaximo,
      ca: atributos.ca,
      iniciativa: atributos.iniciativa,
      velocidade: atributos.velocidade,
    },
    inventario: inventarioItens,
    conhecimento: personagem.getConhecimentos,
  };
}

// Watchers
watch(
  () => props.personagem,
  (personagem) => {
    if (personagem) {
      carregarPersonagem(personagem);
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

watch(showDialog, (show) => {
  if (!show && !props.personagem) {
    resetForm();
  }
});
</script>

<style scoped>
.scroll {
  overflow-y: auto;
}

.conhecimento-card {
  transition: transform 0.2s;
}

.conhecimento-card:hover {
  transform: translateY(-1px);
}
</style>
