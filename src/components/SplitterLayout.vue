<template>
  <div class="splitter-layout" :class="orientationClass">
    <div class="splitter-container" ref="containerRef">
      <!-- Painel esquerdo/superior -->
      <div class="splitter-panel panel-first" :style="firstPanelStyle">
        <slot name="first" />
      </div>

      <!-- Divisor redimensionável -->
      <div
        class="splitter-divider"
        :class="{ 'divider-dragging': dragging }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <div class="divider-handle">
          <q-icon
            :name="orientation === 'horizontal' ? 'mdi-drag-vertical' : 'mdi-drag-horizontal'"
            size="sm"
          />
        </div>
      </div>

      <!-- Painel direito/inferior -->
      <div class="splitter-panel panel-second" :style="secondPanelStyle">
        <slot name="second" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

interface Props {
  orientation?: 'horizontal' | 'vertical';
  initialSplit?: number; // Porcentagem (0-100)
  minSize?: number; // Tamanho mínimo em pixels
  maxSize?: number; // Tamanho máximo em pixels
  disabled?: boolean;
  persistent?: boolean; // Salva posição no localStorage
  storageKey?: string; // Chave para o localStorage
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
  initialSplit: 50,
  minSize: 100,
  maxSize: Infinity,
  disabled: false,
  persistent: false,
  storageKey: 'splitter-position',
});

const emit = defineEmits<{
  resize: [firstSize: number, secondSize: number];
  resizeStart: [];
  resizeEnd: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const dragging = ref(false);
const splitPosition = ref(props.initialSplit);

// Carrega posição salva se persistent estiver habilitado
onMounted(() => {
  if (props.persistent && props.storageKey) {
    const saved = localStorage.getItem(`splitter-${props.storageKey}`);
    if (saved) {
      const position = parseFloat(saved);
      if (!isNaN(position) && position >= 0 && position <= 100) {
        splitPosition.value = position;
      }
    }
  }
});

const orientationClass = computed(() => ({
  'splitter-horizontal': props.orientation === 'horizontal',
  'splitter-vertical': props.orientation === 'vertical',
  'splitter-disabled': props.disabled,
}));

const firstPanelStyle = computed(() => {
  const size = `${splitPosition.value}%`;
  return props.orientation === 'vertical' ? { width: size } : { height: size };
});

const secondPanelStyle = computed(() => {
  const size = `${100 - splitPosition.value}%`;
  return props.orientation === 'vertical' ? { width: size } : { height: size };
});

function startDrag(event: MouseEvent | TouchEvent) {
  if (props.disabled) return;

  event.preventDefault();
  dragging.value = true;
  emit('resizeStart');

  const moveHandler = (e: MouseEvent | TouchEvent) => handleDrag(e);
  const upHandler = () => endDrag();

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
  document.addEventListener('touchmove', moveHandler);
  document.addEventListener('touchend', upHandler);

  // Previne seleção de texto durante o drag
  document.body.style.userSelect = 'none';
  document.body.style.cursor = props.orientation === 'vertical' ? 'col-resize' : 'row-resize';
}

function handleDrag(event: MouseEvent | TouchEvent) {
  if (!dragging.value || !containerRef.value) return;

  const container = containerRef.value;
  const rect = container.getBoundingClientRect();

  let clientPos: number;
  if (event instanceof MouseEvent) {
    clientPos = props.orientation === 'vertical' ? event.clientX : event.clientY;
  } else {
    const touch = event.touches[0];
    if (!touch) return;
    clientPos = props.orientation === 'vertical' ? touch.clientX : touch.clientY;
  }

  const containerStart = props.orientation === 'vertical' ? rect.left : rect.top;
  const containerSize = props.orientation === 'vertical' ? rect.width : rect.height;

  const position = clientPos - containerStart;
  let percentage = (position / containerSize) * 100;

  // Aplicar limites
  const minPercent = (props.minSize / containerSize) * 100;
  const maxPercent =
    props.maxSize === Infinity ? 100 - minPercent : (props.maxSize / containerSize) * 100;

  percentage = Math.max(minPercent, Math.min(maxPercent, percentage));

  splitPosition.value = percentage;

  // Emitir evento de resize com tamanhos em pixels
  const firstSize = (containerSize * percentage) / 100;
  const secondSize = containerSize - firstSize;
  emit('resize', firstSize, secondSize);
}

function endDrag() {
  if (!dragging.value) return;

  dragging.value = false;
  emit('resizeEnd');

  // Salvar posição se persistent estiver habilitado
  if (props.persistent && props.storageKey) {
    localStorage.setItem(`splitter-${props.storageKey}`, splitPosition.value.toString());
  }

  // Restaurar cursor e seleção de texto
  document.body.style.userSelect = '';
  document.body.style.cursor = '';

  // Remover event listeners
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', endDrag);
}

// Cleanup
onUnmounted(() => {
  if (dragging.value) {
    endDrag();
  }
});

// Método público para redefinir posição
function resetSplit() {
  splitPosition.value = props.initialSplit;
  if (props.persistent && props.storageKey) {
    localStorage.removeItem(`splitter-${props.storageKey}`);
  }
}

// Método público para definir posição
function setSplit(percentage: number) {
  if (percentage >= 0 && percentage <= 100) {
    splitPosition.value = percentage;
  }
}

defineExpose({
  resetSplit,
  setSplit,
});
</script>

<style scoped>
.splitter-layout {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.splitter-container {
  display: flex;
  width: 100%;
  height: 100%;
}

/* Orientação vertical (painéis lado a lado) */
.splitter-vertical .splitter-container {
  flex-direction: row;
}

.splitter-vertical .splitter-divider {
  width: 8px;
  cursor: col-resize;
  flex-shrink: 0;
}

/* Orientação horizontal (painéis empilhados) */
.splitter-horizontal .splitter-container {
  flex-direction: column;
}

.splitter-horizontal .splitter-divider {
  height: 8px;
  cursor: row-resize;
  flex-shrink: 0;
}

.splitter-panel {
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.splitter-divider {
  background-color: var(--q-border-color, #e0e0e0);
  border: 1px solid var(--q-separator-color, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.splitter-divider:hover {
  background-color: var(--q-primary-light, #1976d2);
}

.splitter-divider.divider-dragging {
  background-color: var(--q-primary, #1976d2);
}

.divider-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--q-primary, #1976d2);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.splitter-divider:hover .divider-handle {
  opacity: 1;
}

.splitter-disabled .splitter-divider {
  cursor: default;
  background-color: var(--q-border-color, #e0e0e0);
  pointer-events: none;
}

.splitter-disabled .divider-handle {
  opacity: 0.3;
}

/* Responsividade */
@media (max-width: 768px) {
  .splitter-divider {
    background-color: var(--q-primary-light, #1976d2);
  }

  .splitter-vertical .splitter-divider {
    width: 12px;
  }

  .splitter-horizontal .splitter-divider {
    height: 12px;
  }
}

/* Modo escuro */
.body--dark .splitter-divider {
  background-color: var(--q-dark-border-color, #424242);
  border-color: var(--q-dark-separator-color, #424242);
}

.body--dark .splitter-divider:hover {
  background-color: var(--q-primary-dark, #1565c0);
}
</style>
