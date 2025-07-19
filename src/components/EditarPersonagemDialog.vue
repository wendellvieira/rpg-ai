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
                <div class="text-h5 q-mb-md">Magias Conhecidas</div>

                <div class="q-mb-md">
                  <q-btn
                    color="primary"
                    icon="auto_fix_high"
                    label="Adicionar Magia"
                    @click="adicionarMagia"
                  />
                </div>

                <div class="text-center q-py-lg">
                  <q-icon name="auto_fix_high" size="48px" color="grey-5" />
                  <div class="text-caption text-grey-6">Sistema de magias em desenvolvimento</div>
                </div>
              </div>

              <!-- Aba Conhecimento -->
              <div v-if="abaAtiva === 'conhecimento'" class="q-gutter-md">
                <div class="text-h5 q-mb-md">Base de Conhecimento</div>

                <div class="q-mb-md">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Adicionar Conhecimento"
                    @click="adicionarConhecimento"
                  />
                </div>

                <q-list bordered separator>
                  <q-item v-for="(conhecimento, index) in form.conhecimento" :key="index">
                    <q-item-section>
                      <q-item-label>{{ conhecimento.topico }}</q-item-label>
                      <q-item-label caption>{{ conhecimento.conteudo }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round icon="edit" color="primary" @click="editarConhecimento()" />
                      <q-btn
                        flat
                        round
                        icon="delete"
                        color="negative"
                        @click="removerConhecimento(index)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-if="form.conhecimento.length === 0" class="text-center q-py-lg">
                  <q-icon name="psychology" size="48px" color="grey-5" />
                  <div class="text-caption text-grey-6">Nenhum conhecimento registrado</div>
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
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { Personagem } from '../classes/Personagem';
import type { AtributosPrimarios, AtributosDerivados, ConhecimentoPersonagem } from '../types';

// Props
const showDialog = defineModel<boolean>('modelValue', { required: true });

const props = defineProps<{
  personagem?: Personagem | null;
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
}>();

// Quasar
const $q = useQuasar();

// Estado local
const splitterModel = ref(25);
const abaAtiva = ref('basico');

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
  $q.notify({
    type: 'info',
    message: 'Sistema de inventário em desenvolvimento',
    position: 'top',
  });
}

function removerItem(index: number) {
  form.value.inventario.splice(index, 1);
}

function adicionarMagia() {
  $q.notify({
    type: 'info',
    message: 'Sistema de magias em desenvolvimento',
    position: 'top',
  });
}

function adicionarConhecimento() {
  const novoConhecimento: ConhecimentoPersonagem = {
    id: `conhecimento_${Date.now()}`,
    topico: 'Novo Conhecimento',
    conteudo: 'Adicione o conteúdo aqui...',
    categoria: 'geral',
    criadoEm: new Date(),
    fonte: 'aprendido' as const,
  };
  form.value.conhecimento.push(novoConhecimento);
}

function editarConhecimento() {
  $q.notify({
    type: 'info',
    message: 'Editor de conhecimento em desenvolvimento',
    position: 'top',
  });
}

function removerConhecimento(index: number) {
  form.value.conhecimento.splice(index, 1);
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
</style>
