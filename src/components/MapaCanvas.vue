<template>
  <div class="mapa-canvas full-height">
    <div v-if="!mapaAtivo" class="mapa-placeholder">
      <div class="text-center text-grey-6">
        <q-icon name="map" size="4rem" class="q-mb-md" />
        <div class="text-h6">Nenhum mapa ativo</div>
        <div class="q-mt-sm">Selecione um mapa na aba Mapas para começar</div>
      </div>
    </div>

    <div v-else class="mapa-container">
      <!-- Cabeçalho do mapa -->
      <div class="mapa-header q-pa-md bg-grey-1">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">{{ mapaAtivo.nome }}</div>
            <div class="text-caption text-grey-6">
              {{ mapaAtivo.dimensoes.largura }}×{{ mapaAtivo.dimensoes.altura }}px •
              {{ mapaAtivo.objetos.length }} objetos
            </div>
          </div>
          <div class="col-auto">
            <q-btn-group>
              <q-btn
                :color="configuracoes.mostrarGrade ? 'primary' : 'grey-6'"
                icon="grid_on"
                @click="toggleGrade"
                :title="configuracoes.mostrarGrade ? 'Ocultar grade' : 'Mostrar grade'"
              />
              <q-btn
                :color="configuracoes.mostrarReguas ? 'primary' : 'grey-6'"
                icon="straighten"
                @click="toggleReguas"
                :title="configuracoes.mostrarReguas ? 'Ocultar réguas' : 'Mostrar réguas'"
              />
              <q-btn
                :color="configuracoes.modoEdicao ? 'primary' : 'grey-6'"
                icon="edit"
                @click="toggleModoEdicao"
                :title="configuracoes.modoEdicao ? 'Sair do modo edição' : 'Entrar em modo edição'"
              />
            </q-btn-group>
          </div>
        </div>
      </div>

      <!-- Canvas do mapa -->
      <div class="mapa-canvas-container" ref="canvasContainer">
        <div
          class="mapa-viewport"
          :style="viewportStyle"
          @wheel="onWheel"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <!-- Imagem de fundo -->
          <img
            v-if="mapaAtivo.imagemUrl"
            :src="mapaAtivo.imagemUrl"
            class="mapa-imagem"
            :style="imagemStyle"
            @load="onImageLoad"
            @error="onImageError"
          />

          <!-- Grade -->
          <svg
            v-if="configuracoes.mostrarGrade && mapaAtivo.grade.ativa"
            class="mapa-grade"
            :style="svgStyle"
            :viewBox="`0 0 ${mapaAtivo.dimensoes.largura} ${mapaAtivo.dimensoes.altura}`"
          >
            <defs>
              <pattern
                :id="`grid-${mapaAtivo.id}`"
                :width="mapaAtivo.grade.tamanho"
                :height="mapaAtivo.grade.tamanho"
                patternUnits="userSpaceOnUse"
              >
                <path
                  :d="`M ${mapaAtivo.grade.tamanho} 0 L 0 0 0 ${mapaAtivo.grade.tamanho}`"
                  fill="none"
                  :stroke="mapaAtivo.grade.cor"
                  :stroke-opacity="mapaAtivo.grade.opacidade"
                  stroke-width="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" :fill="`url(#grid-${mapaAtivo.id})`" />
          </svg>

          <!-- Objetos do mapa -->
          <div
            v-for="objeto in mapaAtivo.objetos"
            :key="objeto.id"
            class="mapa-objeto"
            :class="{
              'objeto-selecionado': objetoSelecionado?.id === objeto.id,
              'objeto-editavel': configuracoes.modoEdicao,
            }"
            :style="getObjetoStyle(objeto)"
            @click="selecionarObjeto(objeto)"
            @mousedown.stop="iniciarArrastoObjeto(objeto, $event)"
          >
            <!-- Ícone do objeto -->
            <q-icon
              v-if="objeto.icone"
              :name="objeto.icone"
              :color="objeto.cor || 'primary'"
              size="1.5rem"
            />

            <!-- Nome do objeto -->
            <div v-if="objeto.nome" class="objeto-nome">
              {{ objeto.nome }}
            </div>
          </div>

          <!-- Indicador de posição do mouse (modo edição) -->
          <div
            v-if="configuracoes.modoEdicao && posicaoMouse"
            class="mouse-indicator"
            :style="getMouseIndicatorStyle()"
          >
            {{ Math.round(posicaoMouse.x / mapaAtivo.escala) }},
            {{ Math.round(posicaoMouse.y / mapaAtivo.escala) }}
          </div>
        </div>

        <!-- Réguas -->
        <div v-if="configuracoes.mostrarReguas" class="mapa-reguas">
          <!-- Régua horizontal -->
          <div class="regua regua-horizontal">
            <!-- Marcações da régua serão implementadas aqui -->
          </div>

          <!-- Régua vertical -->
          <div class="regua regua-vertical">
            <!-- Marcações da régua serão implementadas aqui -->
          </div>
        </div>
      </div>

      <!-- Informações do objeto selecionado -->
      <div v-if="objetoSelecionado" class="objeto-info q-pa-md bg-grey-1">
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1">{{ objetoSelecionado.nome }}</div>
            <div class="text-caption text-grey-6">
              {{ objetoSelecionado.tipo }} • Posição: {{ objetoSelecionado.posicao.x }},
              {{ objetoSelecionado.posicao.y }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              v-if="configuracoes.modoEdicao"
              flat
              size="sm"
              icon="delete"
              color="negative"
              @click="removerObjeto"
            />
            <q-btn flat size="sm" icon="close" @click="objetoSelecionado = null" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMapaStore } from '../stores/mapaStore';
import type { ObjetoMapa } from '../classes/Mapa';

// Composables
const mapaStore = useMapaStore();

// Estado local
const canvasContainer = ref<HTMLElement>();
const configuracoes = ref({
  mostrarGrade: true,
  mostrarReguas: true,
  modoEdicao: false,
});

const zoom = ref(1);
const pan = ref({ x: 0, y: 0 });
const arrastando = ref(false);
const ultimaPosicaoMouse = ref({ x: 0, y: 0 });
const posicaoMouse = ref<{ x: number; y: number } | null>(null);

const objetoSelecionado = ref<ObjetoMapa | null>(null);
const arrastandoObjeto = ref<ObjetoMapa | null>(null);

// Computed
const mapaAtivo = computed(() => mapaStore.mapaAtivo);

const viewportStyle = computed(() => ({
  transform: `scale(${zoom.value}) translate(${pan.value.x}px, ${pan.value.y}px)`,
  transformOrigin: '0 0',
}));

const imagemStyle = computed(() => {
  if (!mapaAtivo.value) return {};

  return {
    width: `${mapaAtivo.value.dimensoes.largura}px`,
    height: `${mapaAtivo.value.dimensoes.altura}px`,
    objectFit: 'cover' as const,
  };
});

const svgStyle = computed(() => {
  if (!mapaAtivo.value) return {};

  return {
    width: `${mapaAtivo.value.dimensoes.largura}px`,
    height: `${mapaAtivo.value.dimensoes.altura}px`,
    position: 'absolute' as const,
    top: '0',
    left: '0',
    pointerEvents: 'none' as const,
  };
});

// Métodos
function toggleGrade(): void {
  configuracoes.value.mostrarGrade = !configuracoes.value.mostrarGrade;
}

function toggleReguas(): void {
  configuracoes.value.mostrarReguas = !configuracoes.value.mostrarReguas;
}

function toggleModoEdicao(): void {
  configuracoes.value.modoEdicao = !configuracoes.value.modoEdicao;
  if (!configuracoes.value.modoEdicao) {
    objetoSelecionado.value = null;
  }
}

function onWheel(event: WheelEvent): void {
  event.preventDefault();

  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  const novoZoom = Math.max(0.1, Math.min(3, zoom.value * delta));

  zoom.value = novoZoom;
}

function onMouseDown(event: MouseEvent): void {
  if (event.button === 1 || (event.button === 0 && !configuracoes.value.modoEdicao)) {
    // Botão do meio ou botão esquerdo fora do modo edição - arrastar canvas
    arrastando.value = true;
    ultimaPosicaoMouse.value = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }
}

function onMouseMove(event: MouseEvent): void {
  if (!mapaAtivo.value) return;

  // Atualizar posição do mouse para indicador
  if (configuracoes.value.modoEdicao) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    posicaoMouse.value = {
      x: (event.clientX - rect.left) / zoom.value,
      y: (event.clientY - rect.top) / zoom.value,
    };
  }

  // Arrastar canvas
  if (arrastando.value) {
    const deltaX = event.clientX - ultimaPosicaoMouse.value.x;
    const deltaY = event.clientY - ultimaPosicaoMouse.value.y;

    pan.value.x += deltaX / zoom.value;
    pan.value.y += deltaY / zoom.value;

    ultimaPosicaoMouse.value = { x: event.clientX, y: event.clientY };
  }

  // Arrastar objeto
  if (arrastandoObjeto.value && configuracoes.value.modoEdicao) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const novaPosicao = {
      x: (event.clientX - rect.left) / zoom.value,
      y: (event.clientY - rect.top) / zoom.value,
    };

    // Aplicar snap se ativo
    if (mapaAtivo.value.configuracoes.snap && mapaAtivo.value.grade.ativa) {
      const tamanhoGrade = mapaAtivo.value.grade.tamanho;
      novaPosicao.x = Math.round(novaPosicao.x / tamanhoGrade) * tamanhoGrade;
      novaPosicao.y = Math.round(novaPosicao.y / tamanhoGrade) * tamanhoGrade;
    }

    // Atualizar posição do objeto
    void mapaStore.moverObjetoNoMapa(mapaAtivo.value.id, arrastandoObjeto.value.id, novaPosicao);
  }
}

function onMouseUp(): void {
  arrastando.value = false;
  arrastandoObjeto.value = null;
}

function onImageLoad(): void {
  console.log('Imagem do mapa carregada');
}

function onImageError(): void {
  console.error('Erro ao carregar imagem do mapa');
}

function selecionarObjeto(objeto: ObjetoMapa): void {
  if (configuracoes.value.modoEdicao) {
    objetoSelecionado.value = objetoSelecionado.value?.id === objeto.id ? null : objeto;
  }
}

function iniciarArrastoObjeto(objeto: ObjetoMapa, event: MouseEvent): void {
  if (configuracoes.value.modoEdicao) {
    arrastandoObjeto.value = objeto;
    selecionarObjeto(objeto);
    event.stopPropagation();
  }
}

async function removerObjeto(): Promise<void> {
  if (!objetoSelecionado.value || !mapaAtivo.value) return;

  try {
    await mapaStore.removerObjetoDoMapa(mapaAtivo.value.id, objetoSelecionado.value.id);
    objetoSelecionado.value = null;
  } catch (error) {
    console.error('Erro ao remover objeto:', error);
  }
}

function getObjetoStyle(objeto: ObjetoMapa): Record<string, string> {
  const dimensoes = objeto.dimensoes || {
    largura: mapaAtivo.value?.grade.tamanho || 30,
    altura: mapaAtivo.value?.grade.tamanho || 30,
  };

  return {
    position: 'absolute',
    left: `${objeto.posicao.x}px`,
    top: `${objeto.posicao.y}px`,
    width: `${dimensoes.largura}px`,
    height: `${dimensoes.altura}px`,
    backgroundColor: objeto.cor || 'rgba(33, 150, 243, 0.3)',
    border: `2px solid ${objeto.cor || '#2196F3'}`,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: configuracoes.value.modoEdicao ? 'move' : 'pointer',
    zIndex: '10',
  };
}

function getMouseIndicatorStyle(): Record<string, string> {
  if (!posicaoMouse.value) return {};

  return {
    position: 'absolute',
    left: `${posicaoMouse.value.x}px`,
    top: `${posicaoMouse.value.y}px`,
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    pointerEvents: 'none',
    zIndex: '100',
    transform: 'translate(-50%, -100%)',
  };
}

// Watchers
watch(
  mapaAtivo,
  (novoMapa) => {
    if (novoMapa) {
      // Sincronizar configurações com o mapa
      configuracoes.value.mostrarGrade = novoMapa.configuracoes.mostrarGrade;
      configuracoes.value.mostrarReguas = novoMapa.configuracoes.mostrarReguas;
      configuracoes.value.modoEdicao = novoMapa.configuracoes.modoEdicao;

      // Resetar view
      zoom.value = 1;
      pan.value = { x: 0, y: 0 };
      objetoSelecionado.value = null;
    }
  },
  { immediate: true },
);

// Lifecycle
onMounted(() => {
  // Adicionar event listeners globais se necessário
});

onUnmounted(() => {
  // Remover event listeners globais se necessário
});
</script>

<style scoped>
.mapa-canvas {
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.mapa-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mapa-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mapa-canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
}

.mapa-viewport {
  position: relative;
  width: fit-content;
  height: fit-content;
  cursor: grab;
}

.mapa-viewport:active {
  cursor: grabbing;
}

.mapa-imagem {
  display: block;
  max-width: none;
}

.mapa-objeto {
  transition: all 0.2s ease;
  font-size: 12px;
  text-align: center;
  user-select: none;
}

.objeto-editavel:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.objeto-selecionado {
  box-shadow: 0 0 0 3px #2196f3;
  transform: scale(1.1);
}

.objeto-nome {
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  color: white;
  margin-top: 2px;
}

.mouse-indicator {
  font-family: monospace;
  white-space: nowrap;
}

.mapa-reguas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.regua {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
}

.regua-horizontal {
  top: 0;
  left: 20px;
  right: 0;
  height: 20px;
}

.regua-vertical {
  top: 20px;
  left: 0;
  bottom: 0;
  width: 20px;
}

.objeto-info {
  border-top: 1px solid #e0e0e0;
}
</style>
