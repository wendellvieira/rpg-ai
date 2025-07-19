<template>
  <div class="mapas-viewer full-height">
    <!-- Cabeçalho -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Mapas</div>
        <div class="text-caption text-grey-6">
          {{ totalMapas }} {{ totalMapas === 1 ? 'mapa' : 'mapas' }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Novo Mapa" @click="abrirDialogNovoMapa" />
      </div>
    </div>

    <!-- Barra de busca e filtros -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col">
        <q-input v-model="filtro" label="Buscar mapas..." filled dense clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-auto">
        <q-btn-dropdown
          color="grey-6"
          icon="sort"
          label="Ordenar"
          dropdown-icon="keyboard_arrow_down"
        >
          <q-list>
            <q-item clickable v-close-popup @click="ordenacao = 'nome'">
              <q-item-section>
                <q-item-label>Por Nome</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon v-if="ordenacao === 'nome'" name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="ordenacao = 'criacao'">
              <q-item-section>
                <q-item-label>Por Data de Criação</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon v-if="ordenacao === 'criacao'" name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="ordenacao = 'atualizacao'">
              <q-item-section>
                <q-item-label>Por Última Atualização</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon v-if="ordenacao === 'atualizacao'" name="check" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="text-center q-py-lg">
      <q-spinner size="2rem" />
      <div class="q-mt-sm">Carregando mapas...</div>
    </div>

    <!-- Lista vazia -->
    <div v-else-if="mapasExibidos.length === 0 && !filtro" class="text-center q-py-xl text-grey-6">
      <q-icon name="map" size="4rem" class="q-mb-md" />
      <div class="text-h6">Nenhum mapa criado</div>
      <div class="q-mt-sm">Crie seu primeiro mapa para começar!</div>
      <q-btn
        color="primary"
        icon="add"
        label="Criar Primeiro Mapa"
        class="q-mt-md"
        @click="abrirDialogNovoMapa"
      />
    </div>

    <!-- Nenhum resultado na busca -->
    <div v-else-if="mapasExibidos.length === 0 && filtro" class="text-center q-py-xl text-grey-6">
      <q-icon name="search_off" size="3rem" class="q-mb-md" />
      <div class="text-h6">Nenhum mapa encontrado</div>
      <div class="q-mt-sm">Tente alterar os critérios de busca</div>
    </div>

    <!-- Grade de mapas -->
    <div v-else class="row q-gutter-md">
      <div v-for="mapa in mapasExibidos" :key="mapa.id" class="col-12 col-md-6 col-lg-4">
        <q-card
          class="mapa-card cursor-pointer"
          :class="{ 'mapa-ativo': mapa.id === mapaAtualId }"
          @click="ativarMapa(mapa)"
        >
          <!-- Imagem de preview -->
          <div class="mapa-preview">
            <q-img
              v-if="mapa.imagemUrl"
              :src="mapa.imagemUrl"
              :ratio="mapa.dimensoes.largura / mapa.dimensoes.altura"
              loading="lazy"
              class="mapa-imagem"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                  <q-icon name="broken_image" size="2rem" />
                </div>
              </template>
            </q-img>
            <div v-else class="mapa-sem-imagem">
              <q-icon name="map" size="3rem" class="text-grey-4" />
              <div class="text-caption text-grey-6">Sem imagem</div>
            </div>

            <!-- Overlay com informações -->
            <div class="mapa-overlay">
              <div class="mapa-info">
                <q-chip
                  v-if="mapa.objetos.length > 0"
                  color="primary"
                  text-color="white"
                  icon="place"
                  size="sm"
                >
                  {{ mapa.objetos.length }} objetos
                </q-chip>
                <q-chip
                  v-if="mapa.grade.ativa"
                  color="secondary"
                  text-color="white"
                  icon="grid_on"
                  size="sm"
                >
                  Grade {{ mapa.grade.tamanho }}px
                </q-chip>
              </div>
            </div>

            <!-- Indicador de mapa ativo -->
            <div v-if="mapa.id === mapaAtualId" class="mapa-ativo-indicator">
              <q-icon name="play_arrow" size="1.5rem" />
            </div>
          </div>

          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 ellipsis">{{ mapa.nome }}</div>
                <div class="text-caption text-grey-6 ellipsis">
                  {{ mapa.dimensoes.largura }}×{{ mapa.dimensoes.altura }}px • Escala
                  {{ mapa.escala }}px
                </div>
              </div>
              <q-badge v-if="mapa.id === mapaAtualId" color="positive" label="Ativo" />
            </div>

            <div v-if="mapa.descricao" class="q-mt-sm text-body2 ellipsis-2-lines">
              {{ mapa.descricao }}
            </div>

            <div class="q-mt-sm text-caption text-grey-6">
              Criado em {{ formatarData(mapa.criadoEm) }}
              <span v-if="mapa.atualizadoEm !== mapa.criadoEm">
                • Editado em {{ formatarData(mapa.atualizadoEm) }}
              </span>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat size="sm" icon="edit" label="Editar" @click.stop="editarMapa(mapa)" />
            <q-btn
              flat
              size="sm"
              icon="content_copy"
              label="Duplicar"
              @click.stop="duplicarMapa(mapa)"
            />
            <q-btn
              flat
              size="sm"
              icon="delete"
              color="negative"
              label="Excluir"
              @click.stop="confirmarExclusao(mapa)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Dialog de novo/editar mapa -->
    <EditarMapaDialog v-model="dialogMapa" :mapa="mapaEdicao" @mapa-salvo="onMapaSalvo" />

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="dialogExclusao">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Tem certeza que deseja excluir este mapa?</span>
        </q-card-section>

        <q-card-section>
          <div class="text-weight-bold">{{ mapaExclusao?.nome }}</div>
          <div class="text-caption text-grey-6">Esta ação não pode ser desfeita.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Excluir" :loading="excluindo" @click="excluirMapa" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useMapaStore } from '../stores/mapaStore';
import type { Mapa } from '../classes/Mapa';
import { type DadosMapaSerializados } from '../classes/Mapa';
import EditarMapaDialog from './EditarMapaDialog.vue';

// Composables
const $q = useQuasar();
const mapaStore = useMapaStore();

// Estado local
const filtro = ref('');
const ordenacao = ref<'nome' | 'criacao' | 'atualizacao'>('nome');
const dialogMapa = ref(false);
const mapaEdicao = ref<DadosMapaSerializados | null>(null);
const dialogExclusao = ref(false);
const mapaExclusao = ref<Mapa | null>(null);
const excluindo = ref(false);

// Computed
const mapas = computed(() => mapaStore.mapas);
const carregando = computed(() => mapaStore.carregando);
const totalMapas = computed(() => mapaStore.totalMapas);
const mapaAtualId = computed(() => mapaStore.mapaAtualId);

const mapasExibidos = computed(() => {
  let mapasFilter = filtro.value ? mapaStore.filtrarMapas(filtro.value) : mapas.value;

  // Ordenação
  switch (ordenacao.value) {
    case 'nome':
      mapasFilter = mapasFilter.slice().sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    case 'criacao':
      mapasFilter = mapasFilter
        .slice()
        .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      break;
    case 'atualizacao':
      mapasFilter = mapasFilter
        .slice()
        .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());
      break;
  }

  return mapasFilter;
});

// Métodos
function abrirDialogNovoMapa(): void {
  mapaEdicao.value = null;
  dialogMapa.value = true;
}

function editarMapa(mapa: Mapa): void {
  mapaEdicao.value = mapa.paraJSON();
  dialogMapa.value = true;
}

async function duplicarMapa(mapa: Mapa): Promise<void> {
  try {
    const resultado = $q.dialog({
      title: 'Duplicar Mapa',
      message: 'Digite o nome para o novo mapa:',
      prompt: {
        model: `${mapa.nome} (Cópia)`,
        type: 'text',
      },
      cancel: true,
      persistent: true,
    });

    const nome = (await Promise.resolve(resultado)) as unknown as string;

    if (nome) {
      await mapaStore.duplicarMapa(mapa.id, nome);
      $q.notify({
        type: 'positive',
        message: 'Mapa duplicado com sucesso!',
      });
    }
  } catch (error) {
    if (error !== null) {
      // usuário não cancelou
      console.error('Erro ao duplicar mapa:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao duplicar mapa',
      });
    }
  }
}

function confirmarExclusao(mapa: Mapa): void {
  mapaExclusao.value = mapa;
  dialogExclusao.value = true;
}

async function excluirMapa(): Promise<void> {
  if (!mapaExclusao.value) return;

  excluindo.value = true;

  try {
    await mapaStore.removerMapa(mapaExclusao.value.id);

    $q.notify({
      type: 'positive',
      message: 'Mapa excluído com sucesso!',
    });

    dialogExclusao.value = false;
    mapaExclusao.value = null;
  } catch (error) {
    console.error('Erro ao excluir mapa:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir mapa',
    });
  } finally {
    excluindo.value = false;
  }
}

function ativarMapa(mapa: Mapa): void {
  mapaStore.ativarMapa(mapa);
  $q.notify({
    type: 'info',
    message: `Mapa "${mapa.nome}" ativado`,
  });
}

function onMapaSalvo(): void {
  // Mapa foi salvo, não precisa fazer nada adicional
  // O store já foi atualizado
}

function formatarData(dataISO: string | Date): string {
  const data = typeof dataISO === 'string' ? new Date(dataISO) : dataISO;
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Lifecycle
onMounted(async () => {
  try {
    await mapaStore.carregarMapas();
  } catch (error) {
    console.error('Erro ao carregar mapas:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar mapas',
    });
  }
});
</script>

<style scoped>
.mapa-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.mapa-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mapa-ativo {
  border-color: var(--q-positive) !important;
}

.mapa-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.mapa-imagem {
  height: 100%;
  object-fit: cover;
}

.mapa-sem-imagem {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
    linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
}

.mapa-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mapa-card:hover .mapa-overlay {
  opacity: 1;
}

.mapa-info {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  flex-direction: column;
}

.mapa-ativo-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--q-positive);
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
