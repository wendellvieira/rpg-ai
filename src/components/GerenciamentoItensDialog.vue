<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" maximized>
    <q-card>
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none bg-primary text-white">
        <q-icon name="inventory_2" size="2rem" class="q-mr-md" />
        <div class="text-h5">Gerenciamento de Itens</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <!-- Toolbar -->
      <q-card-section class="q-pa-md bg-grey-1">
        <div class="row q-gutter-md items-center">
          <!-- Busca -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtros.busca"
              label="Buscar itens..."
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Filtro por Tipo -->
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.tipo"
              :options="tiposDisponiveis"
              label="Tipo"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <!-- Filtro por Raridade -->
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.raridade"
              :options="raridadesDisponiveis"
              label="Raridade"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="star" />
              </template>
            </q-select>
          </div>

          <!-- Filtro Mágico -->
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.magico"
              :options="[
                { label: 'Todos', value: null },
                { label: 'Mágicos', value: true },
                { label: 'Normais', value: false },
              ]"
              label="Mágico"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="auto_awesome" />
              </template>
            </q-select>
          </div>

          <!-- Ordenação -->
          <div class="col-12 col-md-2">
            <q-select
              v-model="ordenacao"
              :options="opcoesOrdenacao"
              label="Ordenar por"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="aplicarOrdenacao"
            >
              <template v-slot:prepend>
                <q-icon name="sort" />
              </template>
            </q-select>
          </div>
        </div>

        <!-- Ações em lote -->
        <div class="row q-gutter-sm q-mt-md">
          <q-btn color="primary" icon="add" label="Novo Item" @click="criarNovoItem" />
          <q-btn
            color="secondary"
            icon="file_download"
            label="Importar Itens D&D"
            @click="importarItensDD"
          />
          <q-btn
            color="accent"
            icon="upload_file"
            label="Importar de Arquivo"
            @click="importarDeArquivo"
          />
          <q-space />
          <q-btn
            v-if="estado.itensSelecionados.length > 0"
            color="negative"
            icon="delete"
            :label="`Excluir ${estado.itensSelecionados.length} selecionado(s)`"
            @click="excluirSelecionados"
          />
        </div>
      </q-card-section>

      <!-- Estatísticas -->
      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md">
          <q-chip icon="inventory_2" color="primary" text-color="white">
            Total: {{ itensFiltrados.length }}
          </q-chip>
          <q-chip icon="security" color="orange" text-color="white">
            Armas: {{ contarPorTipo('arma') }}
          </q-chip>
          <q-chip icon="shield" color="blue" text-color="white">
            Armaduras: {{ contarPorTipo('armadura') }}
          </q-chip>
          <q-chip icon="healing" color="green" text-color="white">
            Consumíveis: {{ contarPorTipo('consumivel') }}
          </q-chip>
          <q-chip icon="auto_awesome" color="purple" text-color="white">
            Mágicos: {{ contarMagicos() }}
          </q-chip>
        </div>
      </q-card-section>

      <!-- Tabela de itens -->
      <q-card-section class="q-pa-none" style="flex: 1; overflow: hidden">
        <q-table
          :rows="itensFiltrados"
          :columns="colunas"
          row-key="id"
          :loading="estado.carregando"
          :pagination="paginacao"
          @update:pagination="paginacao = $event"
          selection="multiple"
          v-model:selected="estado.itensSelecionados"
          class="full-height"
          virtual-scroll
          :rows-per-page-options="[10, 25, 50, 100]"
        >
          <!-- Coluna Nome com ícone -->
          <template #body-cell-nome="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="24px" color="secondary" text-color="white" class="q-mr-sm">
                  <q-icon :name="getIconeItem(props.row.tipo)" size="16px" />
                </q-avatar>
                <div>
                  <div class="text-weight-medium">{{ props.row.nome }}</div>
                  <div class="text-caption text-grey-6">{{ props.row.tipo }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Coluna Raridade com badge -->
          <template #body-cell-raridade="props">
            <q-td :props="props">
              <q-badge :color="getCorRaridade(props.row.raridade)" :label="props.row.raridade" />
            </q-td>
          </template>

          <!-- Coluna Mágico -->
          <template #body-cell-magico="props">
            <q-td :props="props">
              <q-icon v-if="props.row.magico" name="auto_awesome" color="purple" size="20px" />
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>

          <!-- Coluna Valor -->
          <template #body-cell-valor="props">
            <q-td :props="props">
              {{ formatarValor(props.row.valor) }}
            </q-td>
          </template>

          <!-- Coluna Peso -->
          <template #body-cell-peso="props">
            <q-td :props="props"> {{ props.row.peso }} kg </q-td>
          </template>

          <!-- Coluna Ações -->
          <template #body-cell-acoes="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  @click="visualizarItem(props.row)"
                  size="sm"
                >
                  <q-tooltip>Ver detalhes</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="secondary"
                  @click="editarItem(props.row)"
                  size="sm"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  color="accent"
                  @click="duplicarItem(props.row)"
                  size="sm"
                >
                  <q-tooltip>Duplicar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="excluirItem(props.row)"
                  size="sm"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Loading -->
          <template #loading>
            <q-inner-loading showing color="primary" />
          </template>

          <!-- Sem dados -->
          <template #no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" name="inventory_2" />
              <span>Nenhum item encontrado</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog de detalhes do item -->
    <q-dialog v-model="estado.mostrandoDetalhes">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ estado.itemSelecionado?.nome }}</div>
        </q-card-section>

        <q-card-section v-if="estado.itemSelecionado">
          <div v-html="estado.itemSelecionado.getDescricaoCompleta()"></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
          <q-btn flat label="Editar" color="secondary" @click="editarItemDetalhes" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de criação/edição -->
    <template v-if="estado.mostrandoEditor">
      <EditarItemDialog
        v-if="estado.itemParaEdicao"
        v-model="estado.mostrandoEditor"
        :item="estado.itemParaEdicao"
        @item-salvo="onItemSalvo"
      />
      <EditarItemDialog v-else v-model="estado.mostrandoEditor" @item-salvo="onItemSalvo" />
    </template>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useItemStore } from '../stores/itemStore';
import { TipoItem, RaridadeItem } from '../types';
import type { Item } from '../classes/Item';
import EditarItemDialog from './EditarItemDialog.vue';

interface ItemData {
  id?: string;
  nome: string;
  tipo: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade: string;
  magico: boolean;
  propriedades?: Record<string, unknown>;
}

// Dialog setup
defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();

// Store
const itemStore = useItemStore();

const estado = ref({
  carregando: false,
  mostrandoDetalhes: false,
  mostrandoEditor: false,
  itemSelecionado: null as Item | null,
  itemParaEdicao: null as ItemData | null,
  itensSelecionados: [] as Item[],
});

// Filtros
const filtros = ref({
  busca: '',
  tipo: null as TipoItem | null,
  raridade: null as RaridadeItem | null,
  magico: null as boolean | null,
});

const ordenacao = ref('nome');

// Paginação
const paginacao = ref({
  sortBy: 'nome' as string | null,
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

// Opções para selects
const tiposDisponiveis = computed(() => [
  { label: 'Arma', value: TipoItem.ARMA },
  { label: 'Armadura', value: TipoItem.ARMADURA },
  { label: 'Escudo', value: TipoItem.ESCUDO },
  { label: 'Consumível', value: TipoItem.CONSUMIVEL },
  { label: 'Mágico', value: TipoItem.MAGICO },
  { label: 'Ferramenta', value: TipoItem.FERRAMENTA },
  { label: 'Tesouro', value: TipoItem.TESOURO },
  { label: 'Outro', value: TipoItem.OUTRO },
]);

const raridadesDisponiveis = computed(() => [
  { label: 'Comum', value: RaridadeItem.COMUM },
  { label: 'Incomum', value: RaridadeItem.INCOMUM },
  { label: 'Raro', value: RaridadeItem.RARO },
  { label: 'Muito Raro', value: RaridadeItem.MUITO_RARO },
  { label: 'Lendário', value: RaridadeItem.LENDARIO },
  { label: 'Artefato', value: RaridadeItem.ARTEFATO },
]);

const opcoesOrdenacao = computed(() => [
  { label: 'Nome', value: 'nome' },
  { label: 'Tipo', value: 'tipo' },
  { label: 'Raridade', value: 'raridade' },
  { label: 'Valor', value: 'valor' },
  { label: 'Peso', value: 'peso' },
]);

// Colunas da tabela
const colunas = computed(() => [
  {
    name: 'nome',
    label: 'Nome',
    field: 'nome',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'raridade',
    label: 'Raridade',
    field: 'raridade',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'magico',
    label: 'Mágico',
    field: 'magico',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'peso',
    label: 'Peso',
    field: 'peso',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'acoes',
    label: 'Ações',
    field: '',
    align: 'center' as const,
    sortable: false,
  },
]);

// Computed
const itens = computed(() => itemStore.itens);

const itensFiltrados = computed(() => {
  let resultado = [...itens.value];

  // Filtro por busca
  if (filtros.value.busca) {
    const busca = filtros.value.busca.toLowerCase();
    resultado = resultado.filter(
      (item) =>
        item.nome.toLowerCase().includes(busca) || item.descricao.toLowerCase().includes(busca),
    );
  }

  // Filtro por tipo
  if (filtros.value.tipo) {
    resultado = resultado.filter((item) => item.tipo === filtros.value.tipo);
  }

  // Filtro por raridade
  if (filtros.value.raridade) {
    resultado = resultado.filter((item) => item.raridade === filtros.value.raridade);
  }

  // Filtro por mágico
  if (filtros.value.magico !== null) {
    resultado = resultado.filter((item) => item.magico === filtros.value.magico);
  }

  return resultado;
});

const aplicarFiltros = () => {
  // Os filtros são aplicados automaticamente via computed
  estado.value.itensSelecionados = [];
};

const aplicarOrdenacao = () => {
  // A ordenação é feita pela tabela do Quasar
};

const contarPorTipo = (tipo: string) => {
  return itensFiltrados.value.filter((item) => item.tipo === (tipo as TipoItem)).length;
};

const contarMagicos = () => {
  return itensFiltrados.value.filter((item) => item.magico).length;
};

const getIconeItem = (tipo: TipoItem) => {
  const icones = {
    [TipoItem.ARMA]: 'sword',
    [TipoItem.ARMADURA]: 'shield',
    [TipoItem.ESCUDO]: 'security',
    [TipoItem.CONSUMIVEL]: 'healing',
    [TipoItem.MAGICO]: 'auto_awesome',
    [TipoItem.FERRAMENTA]: 'build',
    [TipoItem.TESOURO]: 'diamond',
    [TipoItem.OUTRO]: 'inventory_2',
  };
  return icones[tipo] || 'inventory_2';
};

const getCorRaridade = (raridade: RaridadeItem) => {
  const cores = {
    [RaridadeItem.COMUM]: 'grey',
    [RaridadeItem.INCOMUM]: 'green',
    [RaridadeItem.RARO]: 'blue',
    [RaridadeItem.MUITO_RARO]: 'purple',
    [RaridadeItem.LENDARIO]: 'orange',
    [RaridadeItem.ARTEFATO]: 'red',
  };
  return cores[raridade] || 'grey';
};

const formatarValor = (valor: number) => {
  return `${valor} po`;
};

// Ações
const criarNovoItem = () => {
  estado.value.itemParaEdicao = null;
  estado.value.mostrandoEditor = true;
};

const visualizarItem = (item: Item) => {
  estado.value.itemSelecionado = item;
  estado.value.mostrandoDetalhes = true;
};

const editarItem = (item: Item) => {
  // Converter Item para ItemData
  const itemData: ItemData = {
    id: item.id,
    nome: item.nome,
    tipo: item.tipo,
    descricao: item.descricao,
    valor: item.valor,
    peso: item.peso,
    raridade: item.raridade,
    magico: item.magico,
    propriedades: item.propriedades,
  };
  estado.value.itemParaEdicao = itemData;
  estado.value.mostrandoEditor = true;
};

const editarItemDetalhes = () => {
  if (estado.value.itemSelecionado) {
    estado.value.mostrandoDetalhes = false;
    editarItem(estado.value.itemSelecionado as Item);
  }
};

const duplicarItem = (item: Item) => {
  // Implementar duplicação
  console.log('Duplicar item:', item.nome);
};

const excluirItem = async (item: Item) => {
  try {
    await itemStore.deletarItem(item.id);
  } catch (error) {
    console.error('Erro ao excluir item:', error);
  }
};

const excluirSelecionados = async () => {
  try {
    for (const item of estado.value.itensSelecionados) {
      await itemStore.deletarItem(item.id);
    }
    estado.value.itensSelecionados = [];
  } catch (error) {
    console.error('Erro ao excluir itens:', error);
  }
};

const importarItensDD = () => {
  // Implementar importação de itens D&D padrão
  console.log('Importar itens D&D');
};

const importarDeArquivo = () => {
  // Implementar importação de arquivo
  console.log('Importar de arquivo');
};

const onItemSalvo = () => {
  estado.value.mostrandoEditor = false;
  estado.value.itemParaEdicao = null;
};

// Lifecycle
onMounted(async () => {
  estado.value.carregando = true;
  try {
    await itemStore.carregarItens();
  } finally {
    estado.value.carregando = false;
  }
});
</script>

<style scoped>
.item-card {
  transition: transform 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
}

:deep(.q-table__top) {
  border-bottom: 1px solid #e0e0e0;
}

:deep(.q-table th) {
  font-weight: 600;
}
</style>
