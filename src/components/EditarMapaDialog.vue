<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ editMode ? 'Editar Mapa' : 'Novo Mapa' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="salvarMapa" class="q-gutter-md">
          <!-- Nome do mapa -->
          <q-input
            v-model="formulario.nome"
            label="Nome do Mapa *"
            filled
            :rules="[(val) => !!val || 'Nome é obrigatório']"
          />

          <!-- Descrição -->
          <q-input
            v-model="formulario.descricao"
            label="Descrição"
            type="textarea"
            filled
            rows="3"
          />

          <!-- Dimensões -->
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model.number="formulario.largura"
                label="Largura (pixels) *"
                type="number"
                filled
                :rules="[(val) => val > 0 || 'Largura deve ser positiva']"
              />
            </div>
            <div class="col">
              <q-input
                v-model.number="formulario.altura"
                label="Altura (pixels) *"
                type="number"
                filled
                :rules="[(val) => val > 0 || 'Altura deve ser positiva']"
              />
            </div>
          </div>

          <!-- Escala -->
          <q-input
            v-model.number="formulario.escala"
            label="Escala (pixels por quadrado) *"
            type="number"
            filled
            hint="Ex: 30 pixels = 1 quadrado de 5 pés"
            :rules="[(val) => val > 0 || 'Escala deve ser positiva']"
          />

          <!-- URL da imagem -->
          <q-input
            v-model="formulario.imagemUrl"
            label="URL da Imagem de Fundo"
            filled
            hint="Opcional - Deixe vazio para mapa sem imagem"
          />

          <!-- Configurações da grade -->
          <q-expansion-item icon="grid_on" label="Configurações da Grade" default-opened>
            <div class="q-pa-md q-gutter-md">
              <q-toggle v-model="formulario.grade.ativa" label="Exibir grade" />

              <div class="row q-gutter-md">
                <div class="col">
                  <q-input
                    v-model.number="formulario.grade.tamanho"
                    label="Tamanho da Grade (pixels)"
                    type="number"
                    filled
                    :disable="!formulario.grade.ativa"
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="formulario.grade.cor"
                    label="Cor da Grade"
                    filled
                    :disable="!formulario.grade.ativa"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="formulario.grade.cor" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>

              <q-slider
                v-model="formulario.grade.opacidade"
                :min="0"
                :max="1"
                :step="0.1"
                :label="`Opacidade: ${Math.round(formulario.grade.opacidade * 100)}%`"
                label-always
                :disable="!formulario.grade.ativa"
                class="q-mt-md"
              />
            </div>
          </q-expansion-item>

          <!-- Configurações gerais -->
          <q-expansion-item icon="settings" label="Configurações Gerais">
            <div class="q-pa-md q-gutter-md">
              <q-toggle
                v-model="formulario.configuracoes.mostrarGrade"
                label="Mostrar grade por padrão"
              />

              <q-toggle v-model="formulario.configuracoes.mostrarReguas" label="Mostrar réguas" />

              <q-toggle v-model="formulario.configuracoes.snap" label="Encaixar objetos na grade" />
            </div>
          </q-expansion-item>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          color="primary"
          label="Salvar"
          :loading="salvando"
          @click="salvarMapa"
          :disable="!formularioValido"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useMapaStore } from '../stores/mapaStore';
import type { DadosMapaSerializados } from '../classes/Mapa';

// Props
interface Props {
  modelValue: boolean;
  mapa?: DadosMapaSerializados | null;
}

const props = withDefaults(defineProps<Props>(), {
  mapa: null,
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'mapa-salvo': [mapa: DadosMapaSerializados];
}>();

// Composables
const $q = useQuasar();
const mapaStore = useMapaStore();

// Estado local
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const editMode = computed(() => !!props.mapa);
const salvando = ref(false);

// Formulário
const formulario = ref({
  nome: '',
  descricao: '',
  largura: 800,
  altura: 600,
  escala: 30,
  imagemUrl: '',
  grade: {
    ativa: true,
    tamanho: 30,
    cor: '#000000',
    opacidade: 0.3,
  },
  configuracoes: {
    modoEdicao: false,
    mostrarGrade: true,
    mostrarReguas: true,
    snap: true,
  },
});

// Validação
const formularioValido = computed(() => {
  return (
    formulario.value.nome.trim().length > 0 &&
    formulario.value.largura > 0 &&
    formulario.value.altura > 0 &&
    formulario.value.escala > 0
  );
});

// Métodos
async function salvarMapa(): Promise<void> {
  if (!formularioValido.value) {
    $q.notify({
      type: 'negative',
      message: 'Preencha todos os campos obrigatórios',
    });
    return;
  }

  salvando.value = true;

  try {
    const dadosMapa: Partial<DadosMapaSerializados> = {
      nome: formulario.value.nome.trim(),
      descricao: formulario.value.descricao.trim(),
      dimensoes: {
        largura: formulario.value.largura,
        altura: formulario.value.altura,
      },
      escala: formulario.value.escala,
      imagemUrl: formulario.value.imagemUrl.trim() || undefined,
      grade: { ...formulario.value.grade },
      configuracoes: { ...formulario.value.configuracoes },
      objetos: props.mapa?.objetos || [],
    };

    if (editMode.value && props.mapa) {
      // Editar mapa existente
      dadosMapa.id = props.mapa.id;
      await mapaStore.editarMapa(props.mapa.id, dadosMapa);

      $q.notify({
        type: 'positive',
        message: 'Mapa editado com sucesso!',
      });
    } else {
      // Criar novo mapa
      const novoMapa = await mapaStore.adicionarMapa(dadosMapa);

      $q.notify({
        type: 'positive',
        message: 'Mapa criado com sucesso!',
      });

      emit('mapa-salvo', novoMapa.paraJSON());
    }

    dialogVisible.value = false;
  } catch (error) {
    console.error('Erro ao salvar mapa:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Erro ao salvar mapa',
    });
  } finally {
    salvando.value = false;
  }
}

function resetFormulario(): void {
  formulario.value = {
    nome: '',
    descricao: '',
    largura: 800,
    altura: 600,
    escala: 30,
    imagemUrl: '',
    grade: {
      ativa: true,
      tamanho: 30,
      cor: '#000000',
      opacidade: 0.3,
    },
    configuracoes: {
      modoEdicao: false,
      mostrarGrade: true,
      mostrarReguas: true,
      snap: true,
    },
  };
}

function carregarDadosEdicao(): void {
  if (props.mapa) {
    formulario.value = {
      nome: props.mapa.nome,
      descricao: props.mapa.descricao,
      largura: props.mapa.dimensoes.largura,
      altura: props.mapa.dimensoes.altura,
      escala: props.mapa.escala,
      imagemUrl: props.mapa.imagemUrl || '',
      grade: { ...props.mapa.grade },
      configuracoes: { ...props.mapa.configuracoes },
    };
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      if (editMode.value) {
        carregarDadosEdicao();
      } else {
        resetFormulario();
      }
    }
  },
  { immediate: true },
);

watch(
  () => formulario.value.grade.ativa,
  (ativa) => {
    if (ativa && formulario.value.grade.tamanho <= 0) {
      formulario.value.grade.tamanho = formulario.value.escala;
    }
  },
);
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
