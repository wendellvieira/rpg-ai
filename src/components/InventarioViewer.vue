<template>
  <div class="inventario-viewer">
    <q-card flat>
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Inventário</div>
        <div class="text-center text-caption text-grey-6">
          {{ pesoTotal.toFixed(1) }} / {{ inventario.getCapacidadeMaxima() }} kg
        </div>
        <q-linear-progress
          :value="pesoTotal / inventario.getCapacidadeMaxima()"
          color="primary"
          class="q-mt-sm"
          :class="{
            'text-negative': pesoTotal > inventario.getCapacidadeMaxima(),
          }"
        />
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-sm">
          <!-- Lista de itens do inventário -->
          <div class="col-12" v-if="itensInventario.length > 0">
            <q-list>
              <q-item
                v-for="itemInfo in itensInventario"
                :key="itemInfo.itemId"
                clickable
                @click="() => selecionarItem(itemInfo)"
                :class="{ 'bg-blue-1': itemSelecionado?.itemId === itemInfo.itemId }"
              >
                <q-item-section avatar>
                  <q-icon :name="getIconeItem(itemInfo.itemId)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ itemInfo.itemId }}</q-item-label>
                  <q-item-label caption> Quantidade: {{ itemInfo.quantidade }} </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">{{ itemInfo.quantidade }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Mensagem caso não tenha itens -->
          <div class="col-12" v-if="itensInventario.length === 0">
            <q-card flat class="text-center q-pa-md">
              <q-icon name="mdi-package-variant-closed" size="3rem" color="grey-5" />
              <div class="text-grey-6 q-mt-sm">Inventário vazio</div>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Ações do item selecionado -->
      <q-card-actions v-if="itemSelecionado" align="center">
        <q-btn flat icon="mdi-information" label="Detalhes" @click="mostrarDetalhes" />
        <q-btn
          flat
          icon="mdi-play"
          label="Usar"
          color="primary"
          @click="usarItem"
          :disable="readonly"
        />
        <q-btn
          flat
          icon="mdi-delete"
          label="Remover"
          color="negative"
          @click="removerItem"
          :disable="readonly"
        />
      </q-card-actions>
    </q-card>

    <!-- Dialog de detalhes do item -->
    <q-dialog v-model="mostrandoDetalhes">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ itemSelecionado?.itemId }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-sm"><strong>ID do Item:</strong> {{ itemSelecionado?.itemId }}</div>
          <div class="q-mb-sm"><strong>Quantidade:</strong> {{ itemSelecionado?.quantidade }}</div>
          <div class="q-mt-md text-caption text-grey-6">
            Para ver detalhes completos do item, será necessário implementar um catálogo de itens.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Inventario } from '../classes/Inventario';

interface Props {
  inventario: Inventario;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});

const emit = defineEmits<{
  usarItem: [itemId: string, quantidade: number];
  removerItem: [itemId: string, quantidade: number];
}>();

const itemSelecionado = ref<{ itemId: string; quantidade: number } | null>(null);
const mostrandoDetalhes = ref(false);

const itensInventario = computed(() => props.inventario.listarItens());

const pesoTotal = computed(() => {
  // Por enquanto, retorna 0 já que não temos acesso aos itens reais
  // Em uma implementação completa, isso seria calculado baseado nos itens
  return 0;
});

function selecionarItem(itemInfo: { itemId: string; quantidade: number }) {
  itemSelecionado.value = itemSelecionado.value?.itemId === itemInfo.itemId ? null : itemInfo;
}

function mostrarDetalhes() {
  mostrandoDetalhes.value = true;
}

function usarItem() {
  if (itemSelecionado.value && !props.readonly) {
    emit('usarItem', itemSelecionado.value.itemId, 1);
    itemSelecionado.value = null;
  }
}

function removerItem() {
  if (itemSelecionado.value && !props.readonly) {
    emit('removerItem', itemSelecionado.value.itemId, 1);
    itemSelecionado.value = null;
  }
}

function getIconeItem(itemId: string): string {
  // Mapeamento básico de ícones baseado no ID
  const id = itemId.toLowerCase();

  if (id.includes('espada') || id.includes('sword')) return 'mdi-sword';
  if (id.includes('arco') || id.includes('bow')) return 'mdi-bow-arrow';
  if (id.includes('machado') || id.includes('axe')) return 'mdi-axe';
  if (id.includes('armadura') || id.includes('armor')) return 'mdi-shield';
  if (id.includes('pocao') || id.includes('potion')) return 'mdi-bottle-tonic';
  if (id.includes('escudo') || id.includes('shield')) return 'mdi-shield';

  return 'mdi-package-variant';
}
</script>

<style scoped>
.inventario-viewer {
  width: 100%;
  max-width: 400px;
}

.q-item {
  border-radius: 4px;
  margin-bottom: 2px;
}

.q-item.bg-blue-1 {
  background-color: var(--q-primary-light);
}
</style>
