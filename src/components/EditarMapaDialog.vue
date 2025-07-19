<template>
  <q-dialog v-model="dialogVisible" persistent maximized>
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">{{ editMode ? 'Editar Mapa' : 'Novo Mapa' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-tabs
          v-model="abaAtiva"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="propriedades" icon="settings" label="Propriedades" />
          <q-tab name="geracao" icon="auto_awesome" label="Geração IA" />
          <q-tab name="paint" icon="brush" label="Modo Paint" :disable="!temImagemBase" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="abaAtiva" animated>
          <!-- Aba Propriedades -->
          <q-tab-panel name="propriedades" class="q-pa-md">
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

              <!-- URL da imagem ou imagem gerada -->
              <q-input
                v-model="formulario.imagemUrl"
                label="URL da Imagem de Fundo"
                filled
                hint="Opcional - Use geração IA ou deixe vazio"
                readonly
              >
                <template v-slot:append>
                  <q-btn icon="upload" flat @click="selecionarImagem" />
                  <q-btn icon="clear" flat @click="limparImagem" v-if="formulario.imagemUrl" />
                </template>
              </q-input>

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
                    :label-value="`Opacidade: ${Math.round(formulario.grade.opacidade * 100)}%`"
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

                  <q-toggle
                    v-model="formulario.configuracoes.mostrarReguas"
                    label="Mostrar réguas"
                  />

                  <q-toggle
                    v-model="formulario.configuracoes.snap"
                    label="Encaixar objetos na grade"
                  />
                </div>
              </q-expansion-item>
            </q-form>
          </q-tab-panel>

          <!-- Aba Geração IA -->
          <q-tab-panel name="geracao" class="q-pa-md">
            <div class="row q-gutter-lg">
              <!-- Controles de geração -->
              <div class="col-md-6 col-sm-12">
                <div class="text-h6 q-mb-md">Geração de Mapa com IA</div>

                <!-- Template -->
                <q-select
                  v-model="geracao.template"
                  :options="templateOptions"
                  label="Template de Mapa"
                  filled
                  emit-value
                  map-options
                  @update:model-value="aplicarTemplate"
                />

                <!-- Prompt principal -->
                <q-input
                  v-model="geracao.prompt"
                  label="Descrição do Mapa"
                  type="textarea"
                  filled
                  rows="3"
                  hint="Ex: dungeon subterrâneo com lagos de lava"
                  class="q-mt-md"
                />

                <!-- Estilo artístico -->
                <q-select
                  v-model="geracao.estilo"
                  :options="estiloOptions"
                  label="Estilo Artístico"
                  filled
                  emit-value
                  map-options
                  class="q-mt-md"
                />

                <!-- Configurações de qualidade -->
                <q-expansion-item icon="tune" label="Configurações Avançadas" class="q-mt-md">
                  <div class="q-pa-md q-gutter-md">
                    <q-select
                      v-model="geracao.qualidade"
                      :options="qualidadeOptions"
                      label="Qualidade"
                      filled
                      emit-value
                      map-options
                    />

                    <div class="row q-gutter-md">
                      <div class="col">
                        <q-input
                          v-model.number="geracao.steps"
                          label="Steps"
                          type="number"
                          filled
                          hint="20-50 (qualidade vs velocidade)"
                        />
                      </div>
                      <div class="col">
                        <q-input
                          v-model.number="geracao.cfgScale"
                          label="CFG Scale"
                          type="number"
                          filled
                          hint="5-15 (aderência ao prompt)"
                        />
                      </div>
                    </div>

                    <q-input
                      v-model="geracao.negativePrompt"
                      label="Prompt Negativo"
                      type="textarea"
                      filled
                      rows="2"
                      hint="O que NÃO deve aparecer na imagem"
                    />
                  </div>
                </q-expansion-item>

                <!-- Botões de ação -->
                <div class="q-mt-md">
                  <q-btn
                    color="primary"
                    icon="auto_awesome"
                    label="Gerar Mapa"
                    :loading="gerandoImagem"
                    @click="gerarImagem"
                    :disable="!geracao.prompt.trim()"
                  />

                  <q-btn
                    flat
                    icon="refresh"
                    label="Limpar"
                    @click="limparGeracao"
                    class="q-ml-sm"
                  />
                </div>
              </div>

              <!-- Preview -->
              <div class="col">
                <div class="text-h6 q-mb-md">Preview</div>
                <div class="preview-container">
                  <q-img
                    v-if="previewImagem"
                    :src="previewImagem"
                    class="preview-image"
                    fit="contain"
                  >
                    <template v-slot:loading>
                      <q-spinner-gears color="primary" size="50px" />
                    </template>
                  </q-img>

                  <div v-else class="preview-placeholder">
                    <q-icon name="image" size="60px" color="grey-5" />
                    <div class="text-grey-5 q-mt-sm">Preview aparecerá aqui</div>
                  </div>
                </div>

                <!-- Ações do preview -->
                <div class="q-mt-md" v-if="previewImagem">
                  <q-btn
                    color="positive"
                    icon="check"
                    label="Usar Esta Imagem"
                    @click="usarImagemGerada"
                  />

                  <q-btn
                    flat
                    icon="refresh"
                    label="Gerar Nova"
                    @click="gerarImagem"
                    class="q-ml-sm"
                  />
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Aba Modo Paint -->
          <q-tab-panel name="paint" class="q-pa-md">
            <div class="row q-gutter-lg">
              <!-- Controles do Paint -->
              <div class="col-md-4 col-sm-12">
                <div class="text-h6 q-mb-md">Controles de Pintura</div>

                <!-- Brush settings -->
                <div class="q-gutter-md">
                  <q-slider
                    v-model="paint.brushSize"
                    :min="5"
                    :max="100"
                    :step="5"
                    :label-value="`Tamanho: ${paint.brushSize}px`"
                    label-always
                  />

                  <q-slider
                    v-model="paint.brushOpacity"
                    :min="0"
                    :max="100"
                    :step="10"
                    :label-value="`Opacidade: ${paint.brushOpacity}%`"
                    label-always
                  />

                  <q-btn-toggle
                    v-model="paint.tool"
                    :options="[
                      { label: 'Pincel', value: 'brush', icon: 'brush' },
                      { label: 'Borracha', value: 'eraser', icon: 'auto_fix_normal' },
                    ]"
                    color="primary"
                    toggle-color="accent"
                  />
                </div>

                <!-- Prompt para área -->
                <q-input
                  v-model="paint.areaPrompt"
                  label="Modificação da Área"
                  type="textarea"
                  filled
                  rows="3"
                  hint="Ex: cadeia de montanhas"
                  class="q-mt-md"
                />

                <!-- Controles de ação -->
                <div class="q-mt-md q-gutter-sm">
                  <q-btn
                    color="primary"
                    icon="preview"
                    label="Preview"
                    :loading="processandoPaint"
                    @click="gerarPreviewPaint"
                    :disable="!temMascaraAtiva || !paint.areaPrompt.trim()"
                  />

                  <q-btn
                    color="positive"
                    icon="check"
                    label="Aplicar"
                    :disable="!temPreviewPaint"
                    @click="aplicarPaint"
                  />

                  <q-btn
                    flat
                    icon="undo"
                    label="Desfazer"
                    :disable="!paintHistory.canUndo"
                    @click="undoPaint"
                  />

                  <q-btn
                    flat
                    icon="redo"
                    label="Refazer"
                    :disable="!paintHistory.canRedo"
                    @click="redoPaint"
                  />

                  <q-btn flat icon="clear" label="Limpar Máscara" @click="limparMascara" />
                </div>
              </div>

              <!-- Canvas de pintura -->
              <div class="col">
                <div class="text-h6 q-mb-md">Canvas de Edição</div>
                <div class="paint-canvas-container">
                  <canvas
                    ref="paintCanvas"
                    @mousedown="iniciarPintura"
                    @mousemove="pintar"
                    @mouseup="finalizarPintura"
                    @mouseleave="finalizarPintura"
                    class="paint-canvas"
                  />

                  <canvas ref="maskCanvas" class="mask-overlay" />
                </div>

                <!-- Controles de zoom -->
                <div class="q-mt-md">
                  <q-btn flat icon="zoom_out" @click="zoomOut" />
                  <span class="q-mx-md">{{ Math.round(paintZoom * 100) }}%</span>
                  <q-btn flat icon="zoom_in" @click="zoomIn" />
                  <q-btn flat icon="center_focus_strong" @click="resetZoom" class="q-ml-md" />
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useMapaStore } from '../stores/mapaStore';
import { imageGenerationService } from '../services/ImageGenerationService';
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

// Refs para canvas
const paintCanvas = ref<HTMLCanvasElement>();
const maskCanvas = ref<HTMLCanvasElement>();

// Estado local
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const editMode = computed(() => !!props.mapa);
const salvando = ref(false);
const abaAtiva = ref('propriedades');

// Formulário
const formulario = ref({
  nome: '',
  descricao: '',
  largura: 1024,
  altura: 1024,
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

// Estado da geração de imagens
const gerandoImagem = ref(false);
const previewImagem = ref<string>('');

const geracao = ref({
  template: '',
  prompt: '',
  estilo: 'fantasy-realistic',
  qualidade: 'standard',
  steps: 30,
  cfgScale: 7,
  negativePrompt: '',
});

// Estado do modo paint
const processandoPaint = ref(false);
const paint = ref({
  brushSize: 20,
  brushOpacity: 80,
  tool: 'brush' as 'brush' | 'eraser',
  areaPrompt: '',
});

const paintZoom = ref(1);
const temMascaraAtiva = ref(false);
const temPreviewPaint = ref(false);
const isPainting = ref(false);
const lastPoint = ref<{ x: number; y: number } | null>(null);

const paintHistory = ref({
  canUndo: false,
  canRedo: false,
  history: [] as ImageData[],
  currentIndex: -1,
});

// Computeds
const temImagemBase = computed(() => {
  return !!(formulario.value.imagemUrl || previewImagem.value);
});

const formularioValido = computed(() => {
  return (
    formulario.value.nome.trim().length > 0 &&
    formulario.value.largura > 0 &&
    formulario.value.altura > 0 &&
    formulario.value.escala > 0
  );
});

// Options para selects
const templateOptions = computed(() => {
  return imageGenerationService.getMapTemplates().map((template) => ({
    label: template.name,
    value: template.id,
    description: template.prompt,
  }));
});

const estiloOptions = computed(() => {
  return imageGenerationService.getArtStyles().map((style) => ({
    label: style.label,
    value: style.value,
    description: style.description,
  }));
});

const qualidadeOptions = computed(() => [
  { label: 'Rápida', value: 'draft', description: 'Menor qualidade, mais rápido' },
  { label: 'Padrão', value: 'standard', description: 'Qualidade equilibrada' },
  { label: 'Alta', value: 'high', description: 'Alta qualidade, mais lento' },
]);

// Métodos de geração de imagem
async function gerarImagem(): Promise<void> {
  if (!geracao.value.prompt.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Digite uma descrição para o mapa',
    });
    return;
  }

  gerandoImagem.value = true;

  try {
    const result = await imageGenerationService.generateImage({
      prompt: geracao.value.prompt,
      negativePrompt: geracao.value.negativePrompt || '',
      width: formulario.value.largura,
      height: formulario.value.altura,
      steps: geracao.value.steps,
      cfgScale: geracao.value.cfgScale,
      style: geracao.value.estilo,
    });

    if (result.success && result.imageUrl) {
      previewImagem.value = result.imageUrl;

      $q.notify({
        type: 'positive',
        message: 'Imagem gerada com sucesso!',
      });
    } else {
      throw new Error(result.error || 'Erro desconhecido na geração');
    }
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Erro ao gerar imagem',
    });
  } finally {
    gerandoImagem.value = false;
  }
}

function aplicarTemplate(): void {
  const template = imageGenerationService
    .getMapTemplates()
    .find((t) => t.id === geracao.value.template);

  if (template) {
    geracao.value.prompt = template.prompt;
    geracao.value.negativePrompt = template.negativePrompt;
  }
}

function limparGeracao(): void {
  geracao.value = {
    template: '',
    prompt: '',
    estilo: 'fantasy-realistic',
    qualidade: 'standard',
    steps: 30,
    cfgScale: 7,
    negativePrompt: '',
  };
  previewImagem.value = '';
}

function usarImagemGerada(): void {
  if (previewImagem.value) {
    formulario.value.imagemUrl = previewImagem.value;
    abaAtiva.value = 'propriedades';

    $q.notify({
      type: 'positive',
      message: 'Imagem aplicada ao mapa!',
    });
  }
}

function selecionarImagem(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        formulario.value.imagemUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  input.click();
}

function limparImagem(): void {
  formulario.value.imagemUrl = '';
  previewImagem.value = '';
}

// Métodos do modo paint
function iniciarPintura(event: MouseEvent): void {
  if (!paintCanvas.value) return;

  isPainting.value = true;
  const rect = paintCanvas.value.getBoundingClientRect();
  lastPoint.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // Salvar estado para undo
  salvarEstadoPaint();
}

function pintar(event: MouseEvent): void {
  if (!isPainting.value || !paintCanvas.value || !maskCanvas.value) return;

  const rect = paintCanvas.value.getBoundingClientRect();
  const currentPoint = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  const ctx = maskCanvas.value.getContext('2d');
  if (!ctx || !lastPoint.value) return;

  ctx.globalCompositeOperation = paint.value.tool === 'brush' ? 'source-over' : 'destination-out';
  ctx.strokeStyle = `rgba(255, 0, 0, ${paint.value.brushOpacity / 100})`;
  ctx.lineWidth = paint.value.brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(lastPoint.value.x, lastPoint.value.y);
  ctx.lineTo(currentPoint.x, currentPoint.y);
  ctx.stroke();

  lastPoint.value = currentPoint;
  temMascaraAtiva.value = true;
}

function finalizarPintura(): void {
  isPainting.value = false;
  lastPoint.value = null;
}

function salvarEstadoPaint(): void {
  if (!maskCanvas.value) return;

  const ctx = maskCanvas.value.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, maskCanvas.value.width, maskCanvas.value.height);

  // Remover estados futuros se estamos no meio do histórico
  paintHistory.value.history = paintHistory.value.history.slice(
    0,
    paintHistory.value.currentIndex + 1,
  );

  // Adicionar novo estado
  paintHistory.value.history.push(imageData);
  paintHistory.value.currentIndex++;

  // Limitar histórico a 20 estados
  if (paintHistory.value.history.length > 20) {
    paintHistory.value.history.shift();
    paintHistory.value.currentIndex--;
  }

  // Atualizar flags
  paintHistory.value.canUndo = paintHistory.value.currentIndex > 0;
  paintHistory.value.canRedo =
    paintHistory.value.currentIndex < paintHistory.value.history.length - 1;
}

function undoPaint(): void {
  if (!paintHistory.value.canUndo || !maskCanvas.value) return;

  paintHistory.value.currentIndex--;
  const ctx = maskCanvas.value.getContext('2d');
  if (!ctx) return;

  const imageData = paintHistory.value.history[paintHistory.value.currentIndex];
  if (imageData) {
    ctx.putImageData(imageData, 0, 0);
  }

  paintHistory.value.canUndo = paintHistory.value.currentIndex > 0;
  paintHistory.value.canRedo = true;
}

function redoPaint(): void {
  if (!paintHistory.value.canRedo || !maskCanvas.value) return;

  paintHistory.value.currentIndex++;
  const ctx = maskCanvas.value.getContext('2d');
  if (!ctx) return;

  const imageData = paintHistory.value.history[paintHistory.value.currentIndex];
  if (imageData) {
    ctx.putImageData(imageData, 0, 0);
  }

  paintHistory.value.canRedo =
    paintHistory.value.currentIndex < paintHistory.value.history.length - 1;
  paintHistory.value.canUndo = true;
}

function limparMascara(): void {
  if (!maskCanvas.value) return;

  const ctx = maskCanvas.value.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, maskCanvas.value.width, maskCanvas.value.height);
  temMascaraAtiva.value = false;
  temPreviewPaint.value = false;

  // Salvar estado limpo
  salvarEstadoPaint();
}

async function gerarPreviewPaint(): Promise<void> {
  if (!temMascaraAtiva.value || !paint.value.areaPrompt.trim()) return;

  processandoPaint.value = true;

  try {
    // Implementar preview do inpainting
    $q.notify({
      type: 'info',
      message: 'Gerando preview da modificação...',
    });

    // Aqui seria feita a chamada para o inpainting
    // Por enquanto, vamos simular
    await new Promise((resolve) => setTimeout(resolve, 2000));

    temPreviewPaint.value = true;

    $q.notify({
      type: 'positive',
      message: 'Preview gerado! Verifique o resultado.',
    });
  } catch (error) {
    console.error('Erro ao gerar preview:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao gerar preview da modificação',
    });
  } finally {
    processandoPaint.value = false;
  }
}

function aplicarPaint(): void {
  if (!temPreviewPaint.value) return;

  $q.notify({
    type: 'positive',
    message: 'Modificação aplicada ao mapa!',
  });

  // Limpar estado do paint
  limparMascara();
}

function zoomIn(): void {
  paintZoom.value = Math.min(paintZoom.value * 1.2, 5);
}

function zoomOut(): void {
  paintZoom.value = Math.max(paintZoom.value / 1.2, 0.1);
}

function resetZoom(): void {
  paintZoom.value = 1;
}

// Métodos originais do mapa
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
    largura: 1024,
    altura: 1024,
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

function inicializarCanvas(): void {
  void nextTick(() => {
    if (paintCanvas.value && maskCanvas.value) {
      const paintCtx = paintCanvas.value.getContext('2d');
      const maskCtx = maskCanvas.value.getContext('2d');

      if (paintCtx && maskCtx) {
        // Configurar canvas
        paintCanvas.value.width = formulario.value.largura;
        paintCanvas.value.height = formulario.value.altura;
        maskCanvas.value.width = formulario.value.largura;
        maskCanvas.value.height = formulario.value.altura;

        // Desenhar imagem base se houver
        if (formulario.value.imagemUrl) {
          const img = new Image();
          img.onload = () => {
            paintCtx.drawImage(img, 0, 0, formulario.value.largura, formulario.value.altura);
          };
          img.src = formulario.value.imagemUrl;
        }

        // Configurar máscara
        maskCtx.fillStyle = 'rgba(255, 255, 255, 0)';
        maskCtx.fillRect(0, 0, maskCanvas.value.width, maskCanvas.value.height);

        // Salvar estado inicial
        salvarEstadoPaint();
      }
    }
  });
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
      abaAtiva.value = 'propriedades';
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

watch(
  () => abaAtiva.value,
  (novaAba) => {
    if (novaAba === 'paint') {
      inicializarCanvas();
    }
  },
);

// Lifecycle
onMounted(() => {
  // Verificar se o serviço está configurado
  if (!imageGenerationService.isConfigured()) {
    $q.notify({
      type: 'warning',
      message: 'API do Stability AI não configurada. Configure a chave no arquivo .env',
      timeout: 5000,
    });
  }
});
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.preview-container {
  min-height: 400px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.preview-placeholder {
  text-align: center;
  padding: 40px;
}

.paint-canvas-container {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paint-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  border-radius: 4px;
}

.mask-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0.5;
  mix-blend-mode: multiply;
}

.paint-canvas:hover {
  cursor: crosshair;
}

.paint-canvas.eraser-mode {
  cursor: alias;
}

/* Responsividade */
@media (max-width: 768px) {
  .preview-container,
  .paint-canvas-container {
    min-height: 250px;
  }

  .preview-image {
    max-height: 250px;
  }
}
</style>
