<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="library_books" class="q-mr-sm" />
          Base de Conhecimento - {{ personagem.nome }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row q-gutter-md">
          <!-- Painel de Busca e Filtros -->
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  <q-icon name="search" class="q-mr-sm" />
                  Buscar Conhecimento
                </div>

                <q-input
                  v-model="termoBusca"
                  label="Pesquisar..."
                  outlined
                  dense
                  clearable
                  @input="buscarConhecimentos"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-select
                  v-model="categoriaFiltro"
                  :options="categoriasDisponiveis"
                  label="Categoria"
                  outlined
                  dense
                  clearable
                  class="q-mt-md"
                  @update:model-value="filtrarPorCategoria"
                />

                <q-btn
                  color="primary"
                  icon="add"
                  label="Novo Conhecimento"
                  class="full-width q-mt-md"
                  @click="abrirFormularioNovo"
                />
              </q-card-section>
            </q-card>

            <!-- Formulário de Novo Conhecimento -->
            <q-card v-if="mostrarFormulario" flat bordered class="q-mt-md">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  <q-icon name="add_circle" class="q-mr-sm" />
                  {{ editandoConhecimento ? 'Editar' : 'Novo' }} Conhecimento
                </div>

                <q-form @submit="salvarConhecimento" class="q-gutter-md">
                  <q-input
                    v-model="formulario.topico"
                    label="Tópico *"
                    outlined
                    dense
                    :rules="[(val: string) => !!val || 'Tópico é obrigatório']"
                    maxlength="100"
                  />

                  <q-select
                    v-model="formulario.categoria"
                    :options="categoriasDisponiveis"
                    label="Categoria *"
                    outlined
                    dense
                    :rules="[(val: string) => !!val || 'Categoria é obrigatória']"
                  />

                  <q-textarea
                    v-model="formulario.conteudo"
                    label="Conteúdo *"
                    outlined
                    rows="4"
                    :rules="[(val: string) => !!val || 'Conteúdo é obrigatório']"
                    maxlength="1000"
                  />

                  <q-select
                    v-model="formulario.fonte"
                    :options="fontesDisponiveis"
                    label="Fonte"
                    outlined
                    dense
                  />

                  <div class="row q-gutter-sm">
                    <q-btn
                      type="submit"
                      color="primary"
                      :label="editandoConhecimento ? 'Atualizar' : 'Adicionar'"
                      :loading="salvando"
                    />
                    <q-btn flat label="Cancelar" @click="cancelarFormulario" />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </div>

          <!-- Lista de Conhecimentos -->
          <div class="col">
            <q-card flat bordered style="height: 70vh">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <div class="text-subtitle1">
                    <q-icon name="list" class="q-mr-sm" />
                    Conhecimentos ({{ conhecimentosFiltrados.length }})
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    icon="refresh"
                    @click="recarregarConhecimentos"
                    :loading="carregando"
                  />
                </div>

                <div v-if="carregando" class="text-center q-py-lg">
                  <q-spinner size="2rem" />
                  <div class="q-mt-sm">Carregando conhecimentos...</div>
                </div>

                <div
                  v-else-if="conhecimentosFiltrados.length === 0"
                  class="text-center q-py-xl text-grey-6"
                >
                  <q-icon name="library_books" size="4rem" class="q-mb-md" />
                  <div class="text-h6">
                    {{
                      termoBusca || categoriaFiltro
                        ? 'Nenhum resultado encontrado'
                        : 'Nenhum conhecimento registrado'
                    }}
                  </div>
                  <div class="q-mt-sm">
                    {{
                      termoBusca || categoriaFiltro
                        ? 'Tente outros termos de busca'
                        : 'Adicione o primeiro conhecimento!'
                    }}
                  </div>
                </div>

                <q-scroll-area v-else style="height: calc(70vh - 120px)">
                  <div class="q-gutter-sm">
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
                              {{ formatarData(conhecimento.criadoEm) }}
                            </div>
                          </div>
                          <div class="col-auto">
                            <q-btn
                              flat
                              dense
                              round
                              icon="edit"
                              size="sm"
                              @click="editarConhecimento(conhecimento)"
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
                </q-scroll-area>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import type { ConhecimentoPersonagem } from '../types';
import type { Personagem } from '../classes/Personagem';

interface Props {
  personagem: Personagem;
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();
const $q = useQuasar();

// Estado reativo
const carregando = ref(false);
const salvando = ref(false);
const mostrarFormulario = ref(false);
const editandoConhecimento = ref<ConhecimentoPersonagem | null>(null);
const termoBusca = ref('');
const categoriaFiltro = ref('');
const conhecimentos = ref<ConhecimentoPersonagem[]>([]);

// Formulário
const formulario = ref({
  topico: '',
  categoria: '',
  conteudo: '',
  fonte: 'descoberto' as 'inicial' | 'descoberto' | 'aprendido',
});

// Opções
const categoriasDisponiveis = [
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

const fontesDisponiveis = [
  { label: 'Inicial', value: 'inicial' },
  { label: 'Descoberto', value: 'descoberto' },
  { label: 'Aprendido', value: 'aprendido' },
];

// Computed
const conhecimentosFiltrados = computed(() => {
  let resultados = conhecimentos.value;

  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase();
    resultados = resultados.filter(
      (c) => c.topico.toLowerCase().includes(termo) || c.conteudo.toLowerCase().includes(termo),
    );
  }

  if (categoriaFiltro.value) {
    resultados = resultados.filter((c) => c.categoria === categoriaFiltro.value);
  }

  return resultados.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
});

// Lifecycle
onMounted(() => {
  recarregarConhecimentos();
});

// Métodos
function recarregarConhecimentos() {
  carregando.value = true;
  try {
    conhecimentos.value = [...props.personagem.getConhecimentos];
  } catch (error) {
    console.error('Erro ao carregar conhecimentos:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar conhecimentos',
      caption: String(error),
    });
  } finally {
    carregando.value = false;
  }
}

function buscarConhecimentos() {
  // O filtro é reativo via computed
}

function filtrarPorCategoria() {
  // O filtro é reativo via computed
}

function abrirFormularioNovo() {
  editandoConhecimento.value = null;
  formulario.value = {
    topico: '',
    categoria: '',
    conteudo: '',
    fonte: 'descoberto',
  };
  mostrarFormulario.value = true;
}

function editarConhecimento(conhecimento: ConhecimentoPersonagem) {
  editandoConhecimento.value = conhecimento;
  formulario.value = {
    topico: conhecimento.topico,
    categoria: conhecimento.categoria,
    conteudo: conhecimento.conteudo,
    fonte: conhecimento.fonte,
  };
  mostrarFormulario.value = true;
}

function salvarConhecimento() {
  salvando.value = true;
  try {
    if (editandoConhecimento.value) {
      // Edição - precisaríamos de um método na classe Personagem para isso
      $q.notify({
        type: 'warning',
        message: 'Edição de conhecimentos não implementada ainda',
      });
    } else {
      // Novo conhecimento
      props.personagem.adicionarConhecimento(
        formulario.value.topico,
        formulario.value.conteudo,
        formulario.value.categoria,
        formulario.value.fonte,
      );

      // Removido notificação para reduzir spam - adição é visível na lista
      console.log('Conhecimento adicionado:', formulario.value.topico);
    }

    recarregarConhecimentos();
    cancelarFormulario();
  } catch (error) {
    console.error('Erro ao salvar conhecimento:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar conhecimento',
      caption: String(error),
    });
  } finally {
    salvando.value = false;
  }
}

function cancelarFormulario() {
  mostrarFormulario.value = false;
  editandoConhecimento.value = null;
  formulario.value = {
    topico: '',
    categoria: '',
    conteudo: '',
    fonte: 'descoberto',
  };
}

function confirmarExclusaoConhecimento(conhecimento: ConhecimentoPersonagem) {
  $q.dialog({
    title: 'Excluir Conhecimento',
    message: `Tem certeza que deseja excluir o conhecimento "${conhecimento.topico}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      // Precisaríamos de um método na classe Personagem para remover conhecimento
      $q.notify({
        type: 'warning',
        message: 'Remoção de conhecimentos não implementada ainda',
      });
    } catch (error) {
      console.error('Erro ao excluir conhecimento:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao excluir conhecimento',
        caption: String(error),
      });
    }
  });
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

function formatarData(data: Date): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.conhecimento-card {
  transition: transform 0.2s;
}

.conhecimento-card:hover {
  transform: translateY(-1px);
}
</style>
