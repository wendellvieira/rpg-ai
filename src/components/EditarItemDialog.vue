<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ item ? 'Editar Item' : 'Criar Novo Item' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="salvarItem" class="q-gutter-md">
          <!-- Informações Básicas -->
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="form.nome"
                label="Nome do Item *"
                outlined
                dense
                :rules="[(val) => !!val || 'Nome é obrigatório']"
                maxlength="50"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory_2" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    dense
                    flat
                    icon="auto_awesome"
                    color="primary"
                    @click="gerarComIA"
                    :disable="!form.nome.trim() || gerandoComIA"
                    :loading="gerandoComIA"
                  >
                    <q-tooltip>Gerar propriedades com IA</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-select
                v-model="form.tipo"
                :options="tiposDisponiveis"
                label="Tipo *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(val) => !!val || 'Tipo é obrigatório']"
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>
          </div>

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            type="textarea"
            rows="3"
            maxlength="300"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <!-- Propriedades Básicas -->
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model.number="form.peso"
                label="Peso (kg)"
                type="number"
                outlined
                dense
                :min="0"
                step="0.1"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-weight" />
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-input
                v-model.number="form.valor"
                label="Valor (mo)"
                type="number"
                outlined
                dense
                :min="0"
              >
                <template v-slot:prepend>
                  <q-icon name="monetization_on" />
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-select
                v-model="form.raridade"
                :options="raridadesDisponiveis"
                label="Raridade"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-star" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Seção de Imagem -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Imagem do Item</div>

            <div v-if="form.imagemUrl" class="q-mb-md text-center">
              <q-img
                :src="form.imagemUrl"
                style="max-width: 200px; max-height: 200px"
                class="rounded-borders"
                fit="contain"
              />
              <div class="q-mt-sm">
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="delete"
                  label="Remover"
                  @click="form.imagemUrl = ''"
                />
              </div>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                outline
                color="primary"
                icon="auto_awesome"
                label="Gerar com IA"
                @click="gerarImagemItem"
                :loading="gerandoImagem"
                :disable="!form.nome.trim() || gerandoImagem"
              />

              <q-btn
                outline
                color="secondary"
                icon="upload"
                label="Carregar"
                @click="imageUpload?.click()"
              />

              <input
                ref="imageUpload"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
              />
            </div>
          </div>

          <!-- Propriedades Específicas por Tipo -->
          <q-separator v-if="form.tipo" />

          <!-- Propriedades de Arma -->
          <template v-if="form.tipo === 'arma'">
            <div class="text-subtitle2">Propriedades de Arma</div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model="form.dano"
                  label="Dano (ex: 1d8)"
                  outlined
                  dense
                  placeholder="1d8"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-sword" />
                  </template>
                </q-input>
              </div>
              <div class="col">
                <q-select
                  v-model="form.tipoDano"
                  :options="tiposDanoDisponiveis"
                  label="Tipo de Dano"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="form.alcance"
                  label="Alcance (m)"
                  type="number"
                  outlined
                  dense
                  :min="0"
                />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="form.categoriaArma"
                  :options="categoriasArmaDisponiveis"
                  label="Categoria"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="form.critico"
                  label="Multiplicador Crítico"
                  type="number"
                  outlined
                  dense
                  :min="2"
                  :max="4"
                />
              </div>
            </div>
          </template>

          <!-- Propriedades de Armadura -->
          <template v-if="form.tipo === 'armadura' || form.tipo === 'escudo'">
            <div class="text-subtitle2">Propriedades de Armadura</div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model.number="form.bonusCA"
                  label="Bônus CA"
                  type="number"
                  outlined
                  dense
                  :min="0"
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="form.maxDestreza"
                  label="Máx. Destreza"
                  type="number"
                  outlined
                  dense
                  :min="0"
                  placeholder="Deixe vazio se não houver limite"
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="form.forcaMinima"
                  label="Força Mínima"
                  type="number"
                  outlined
                  dense
                  :min="0"
                />
              </div>
            </div>
          </template>

          <!-- Propriedades de Consumível -->
          <template v-if="form.tipo === 'consumivel'">
            <div class="text-subtitle2">Propriedades de Consumível</div>

            <q-input
              v-model="form.efeito"
              label="Efeito"
              outlined
              dense
              placeholder="ex: Restaura 2d4+2 pontos de vida"
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model.number="form.usos"
                  label="Número de Usos"
                  type="number"
                  outlined
                  dense
                  :min="1"
                />
              </div>
              <div class="col">
                <q-select
                  v-model="form.tempoUso"
                  :options="temposUsoDisponiveis"
                  label="Tempo de Uso"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>
          </template>

          <!-- Propriedades Mágicas -->
          <q-separator />
          <div class="text-subtitle2">Propriedades Mágicas</div>

          <q-checkbox v-model="form.magico" label="Item Mágico" left-label />

          <div v-if="form.magico" class="q-ml-lg">
            <q-checkbox v-model="form.sintonizacao" label="Requer Sintonização" left-label />

            <div class="row q-gutter-md q-mt-sm">
              <div class="col">
                <q-input
                  v-model.number="form.cargas"
                  label="Cargas Mágicas"
                  type="number"
                  outlined
                  dense
                  :min="0"
                />
              </div>
              <div class="col">
                <q-select
                  v-model="form.recarga"
                  :options="recargasDisponiveis"
                  label="Recarga"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="onDialogCancel" />
        <q-btn
          unelevated
          :label="item ? 'Salvar Alterações' : 'Criar Item'"
          color="primary"
          icon="save"
          @click="salvarItem"
          :loading="salvando"
          :disable="!formularioValido"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { imageGenerationService } from '../services/ImageGenerationService';

interface ItemForm {
  nome: string;
  tipo: string;
  descricao: string;
  peso: number;
  valor: number;
  raridade: string;
  magico: boolean;
  imagemUrl?: string;

  // Propriedades de arma
  dano: string;
  tipoDano: string;
  alcance: number;
  categoriaArma: string;
  critico: number;

  // Propriedades de armadura
  bonusCA: number;
  maxDestreza: number | null;
  forcaMinima: number | null;

  // Propriedades de consumível
  efeito: string;
  usos: number;
  tempoUso: string;

  // Propriedades mágicas
  sintonizacao: boolean;
  cargas: number | null;
  recarga: string;
}

interface ItemData {
  id?: string;
  nome: string;
  tipo: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade: string;
  magico: boolean;
  imagemUrl?: string;
  propriedades?: Record<string, unknown>;
}

interface Props {
  item?: ItemData; // Item existente para edição
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();

const salvando = ref(false);
const gerandoComIA = ref(false);
const gerandoImagem = ref(false);
const imageUpload = ref<HTMLInputElement>();

const form = ref<ItemForm>({
  nome: '',
  tipo: '',
  descricao: '',
  peso: 0,
  valor: 0,
  raridade: 'comum',
  magico: false,
  imagemUrl: '',

  // Arma
  dano: '',
  tipoDano: '',
  alcance: 1.5,
  categoriaArma: '',
  critico: 2,

  // Armadura
  bonusCA: 0,
  maxDestreza: null,
  forcaMinima: null,

  // Consumível
  efeito: '',
  usos: 1,
  tempoUso: 'acao',

  // Mágico
  sintonizacao: false,
  cargas: null,
  recarga: '',
});

// Opções para selects
const tiposDisponiveis = [
  { label: 'Arma', value: 'arma' },
  { label: 'Armadura', value: 'armadura' },
  { label: 'Escudo', value: 'escudo' },
  { label: 'Consumível', value: 'consumivel' },
  { label: 'Ferramenta', value: 'ferramenta' },
  { label: 'Equipamento', value: 'equipamento' },
  { label: 'Tesouro', value: 'tesouro' },
  { label: 'Outro', value: 'outro' },
];

const raridadesDisponiveis = [
  { label: 'Comum', value: 'comum' },
  { label: 'Incomum', value: 'incomum' },
  { label: 'Raro', value: 'raro' },
  { label: 'Muito Raro', value: 'muito-raro' },
  { label: 'Lendário', value: 'lendario' },
];

const tiposDanoDisponiveis = [
  { label: 'Cortante', value: 'cortante' },
  { label: 'Perfurante', value: 'perfurante' },
  { label: 'Contundente', value: 'contundente' },
  { label: 'Fogo', value: 'fogo' },
  { label: 'Gelo', value: 'gelo' },
  { label: 'Raio', value: 'raio' },
  { label: 'Ácido', value: 'acido' },
  { label: 'Veneno', value: 'veneno' },
  { label: 'Psíquico', value: 'psiquico' },
  { label: 'Necrótico', value: 'necrotico' },
  { label: 'Radiante', value: 'radiante' },
];

const categoriasArmaDisponiveis = [
  { label: 'Corpo a Corpo', value: 'corpo-a-corpo' },
  { label: 'Distância', value: 'distancia' },
  { label: 'Arremesso', value: 'arremesso' },
];

const temposUsoDisponiveis = [
  { label: 'Ação', value: 'acao' },
  { label: 'Ação Bônus', value: 'acao-bonus' },
  { label: 'Reação', value: 'reacao' },
  { label: 'Livre', value: 'livre' },
  { label: '1 minuto', value: '1-minuto' },
  { label: '10 minutos', value: '10-minutos' },
];

const recargasDisponiveis = [
  { label: 'Ao Amanhecer', value: 'amanhecer' },
  { label: 'Ao Anoitecer', value: 'anoitecer' },
  { label: 'Lua Cheia', value: 'lua-cheia' },
  { label: '1d6 dias', value: '1d6-dias' },
  { label: 'Nunca', value: 'nunca' },
];

const formularioValido = computed(() => {
  return form.value.nome.trim() !== '' && form.value.tipo !== '';
});

// Preenche o formulário se está editando um item existente
if (props.item) {
  Object.assign(form.value, props.item);
}

// Limpa campos irrelevantes quando muda o tipo
watch(
  () => form.value.tipo,
  (novoTipo) => {
    if (novoTipo !== 'arma') {
      form.value.dano = '';
      form.value.tipoDano = '';
      form.value.alcance = 1.5;
      form.value.categoriaArma = '';
      form.value.critico = 2;
    }

    if (novoTipo !== 'armadura' && novoTipo !== 'escudo') {
      form.value.bonusCA = 0;
      form.value.maxDestreza = null;
      form.value.forcaMinima = null;
    }

    if (novoTipo !== 'consumivel') {
      form.value.efeito = '';
      form.value.usos = 1;
      form.value.tempoUso = 'acao';
    }
  },
);

function salvarItem() {
  if (!formularioValido.value) return;

  salvando.value = true;

  try {
    // Criar objeto com apenas os campos relevantes
    const itemData: ItemData = {
      nome: form.value.nome.trim(),
      tipo: form.value.tipo,
      descricao: form.value.descricao.trim(),
      peso: form.value.peso,
      valor: form.value.valor,
      raridade: form.value.raridade,
      magico: form.value.magico,
      propriedades: {},
    };

    // Adicionar imagemUrl se houver
    if (form.value.imagemUrl) {
      itemData.imagemUrl = form.value.imagemUrl;
    }

    // Adicionar propriedades específicas baseadas no tipo
    if (form.value.tipo === 'arma') {
      itemData.propriedades!.dano = form.value.dano;
      itemData.propriedades!.tipoDano = form.value.tipoDano;
      itemData.propriedades!.alcance = form.value.alcance;
      itemData.propriedades!.categoriaArma = form.value.categoriaArma;
      itemData.propriedades!.critico = form.value.critico;
    }

    if (form.value.tipo === 'armadura' || form.value.tipo === 'escudo') {
      itemData.propriedades!.bonusCA = form.value.bonusCA;
      if (form.value.maxDestreza !== null)
        itemData.propriedades!.maxDestreza = form.value.maxDestreza;
      if (form.value.forcaMinima !== null)
        itemData.propriedades!.forcaMinima = form.value.forcaMinima;
    }

    if (form.value.tipo === 'consumivel') {
      itemData.propriedades!.efeito = form.value.efeito;
      itemData.propriedades!.usos = form.value.usos;
      itemData.propriedades!.tempoUso = form.value.tempoUso;
    }

    // Propriedades mágicas
    if (form.value.magico) {
      itemData.propriedades!.sintonizacao = form.value.sintonizacao;
      if (form.value.cargas !== null) itemData.propriedades!.cargas = form.value.cargas;
      if (form.value.recarga) itemData.propriedades!.recarga = form.value.recarga;
    }

    // Retornar o item criado/editado
    onDialogOK(itemData);
  } catch (error) {
    console.error('Erro ao salvar item:', error);
  } finally {
    salvando.value = false;
  }
}

async function gerarComIA() {
  if (!form.value.nome.trim()) return;

  gerandoComIA.value = true;

  try {
    // Importar dinamicamente o OpenAIService
    const { OpenAIService } = await import('../services/OpenAIService');
    const openAIService = OpenAIService.getInstance();

    // Verificar se a IA está configurada
    if (!openAIService.estaConfigurado()) {
      $q.notify({
        type: 'warning',
        message: 'Configure a API da OpenAI nas configurações antes de usar a IA.',
      });
      return;
    }

    const prompt = `Analise o item "${form.value.nome}" e determine suas propriedades para um RPG D&D 5e.

Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "tipo": "arma|armadura|escudo|consumivel|ferramenta|equipamento|tesouro|outro",
  "descricao": "Descrição detalhada do item",
  "peso": número_em_kg,
  "valor": valor_em_moedas_de_ouro,
  "raridade": "comum|incomum|raro|muito-raro|lendario",
  "magico": true|false,
  "propriedades": {
    // Para armas:
    "dano": "XdY" (se for arma),
    "tipoDano": "cortante|perfurante|contundente|fogo|gelo|raio|acido|veneno|psiquico|necrotico|radiante",
    "alcance": número_em_metros,
    "categoriaArma": "corpo-a-corpo|distancia|arremesso",
    "critico": 2,

    // Para armaduras:
    "bonusCA": número (se for armadura/escudo),
    "maxDestreza": número_ou_null,
    "forcaMinima": número_ou_null,

    // Para consumíveis:
    "efeito": "descrição do efeito",
    "usos": número,
    "tempoUso": "acao|acao-bonus|reacao|livre|1-minuto|10-minutos",

    // Para itens mágicos:
    "sintonizacao": true|false,
    "cargas": número_ou_null,
    "recarga": "amanhecer|anoitecer|lua-cheia|1d6-dias|nunca"
  }
}

Seja criativo mas equilibrado. Para itens lendários como "Excalibur", torne-os poderosos mas não quebrados.`;

    const response = await openAIService.enviarMensagem([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    try {
      const itemData = JSON.parse(response.conteudo);

      // Aplicar os dados gerados ao formulário
      if (itemData.tipo) form.value.tipo = itemData.tipo;
      if (itemData.descricao) form.value.descricao = itemData.descricao;
      if (itemData.peso !== undefined) form.value.peso = itemData.peso;
      if (itemData.valor !== undefined) form.value.valor = itemData.valor;
      if (itemData.raridade) form.value.raridade = itemData.raridade;
      if (itemData.magico !== undefined) form.value.magico = itemData.magico;

      // Aplicar propriedades específicas
      if (itemData.propriedades) {
        const props = itemData.propriedades;

        // Propriedades de arma
        if (props.dano) form.value.dano = props.dano;
        if (props.tipoDano) form.value.tipoDano = props.tipoDano;
        if (props.alcance !== undefined) form.value.alcance = props.alcance;
        if (props.categoriaArma) form.value.categoriaArma = props.categoriaArma;
        if (props.critico !== undefined) form.value.critico = props.critico;

        // Propriedades de armadura
        if (props.bonusCA !== undefined) form.value.bonusCA = props.bonusCA;
        if (props.maxDestreza !== undefined) form.value.maxDestreza = props.maxDestreza;
        if (props.forcaMinima !== undefined) form.value.forcaMinima = props.forcaMinima;

        // Propriedades de consumível
        if (props.efeito) form.value.efeito = props.efeito;
        if (props.usos !== undefined) form.value.usos = props.usos;
        if (props.tempoUso) form.value.tempoUso = props.tempoUso;

        // Propriedades mágicas
        if (props.sintonizacao !== undefined) form.value.sintonizacao = props.sintonizacao;
        if (props.cargas !== undefined) form.value.cargas = props.cargas;
        if (props.recarga) form.value.recarga = props.recarga;
      }

      // Mostrar notificação de sucesso
      $q.notify({
        type: 'positive',
        message: 'Item gerado com sucesso pela IA!',
        icon: 'auto_awesome',
      });
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      $q.notify({
        type: 'negative',
        message: 'Erro ao processar resposta da IA. Tente novamente.',
      });
    }
  } catch (error) {
    console.error('Erro ao gerar item com IA:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao conectar com a IA. Verifique sua configuração.',
    });
  } finally {
    gerandoComIA.value = false;
  }
}

async function gerarImagemItem() {
  if (!form.value.nome.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Informe o nome do item primeiro.',
    });
    return;
  }

  // Verificar se o serviço está configurado
  if (!imageGenerationService.isConfigured()) {
    $q.notify({
      type: 'warning',
      message: 'Configure a API da Stability AI no arquivo .env para gerar imagens.',
    });
    return;
  }

  gerandoImagem.value = true;

  try {
    // Criar prompt específico para o item
    let prompt = `Fantasy RPG item: ${form.value.nome}`;

    // Adicionar detalhes baseados no tipo
    if (form.value.tipo) {
      switch (form.value.tipo) {
        case 'arma':
          prompt += `, ${form.value.categoriaArma || 'melee'} weapon`;
          if (form.value.tipoDano) {
            prompt += `, ${form.value.tipoDano} damage type`;
          }
          break;
        case 'armadura':
          prompt += ', armor, protective gear';
          break;
        case 'escudo':
          prompt += ', shield, defensive equipment';
          break;
        case 'consumivel':
          prompt += ', consumable item, potion or scroll';
          break;
        default:
          prompt += `, ${form.value.tipo} equipment`;
      }
    }

    // Adicionar raridade ao prompt
    if (form.value.raridade && form.value.raridade !== 'comum') {
      prompt += `, ${form.value.raridade} rarity`;
    }

    // Adicionar se é mágico
    if (form.value.magico) {
      prompt += ', magical, glowing, enchanted';
    }

    // Adicionar descrição se houver
    if (form.value.descricao) {
      prompt += `, ${form.value.descricao}`;
    }

    // Completar o prompt com estilo
    prompt +=
      ', detailed illustration, fantasy art style, D&D style, high quality, item portrait, clean background';

    const request = {
      prompt,
      negativePrompt:
        'blurry, low quality, multiple items, cluttered, people, characters, text, watermark',
      width: 512,
      height: 512,
      steps: 30,
      cfgScale: 7,
      style: 'fantasy-realistic',
    };

    const result = await imageGenerationService.generateImage(request);

    if (result.success && result.imageUrl) {
      form.value.imagemUrl = result.imageUrl;

      $q.notify({
        type: 'positive',
        message: 'Imagem do item gerada com sucesso!',
        icon: 'image',
      });
    } else {
      throw new Error(result.error || 'Falha ao gerar imagem');
    }
  } catch (error) {
    console.error('Erro ao gerar imagem do item:', error);
    $q.notify({
      type: 'negative',
      message: `Erro ao gerar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    });
  } finally {
    gerandoImagem.value = false;
  }
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // Verificar se é uma imagem
  if (!file.type.startsWith('image/')) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, selecione apenas arquivos de imagem.',
    });
    return;
  }

  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    $q.notify({
      type: 'negative',
      message: 'Arquivo muito grande. Máximo permitido: 5MB.',
    });
    return;
  }

  // Converter para base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    form.value.imagemUrl = result;

    $q.notify({
      type: 'positive',
      message: 'Imagem carregada com sucesso!',
    });
  };

  reader.onerror = () => {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar a imagem.',
    });
  };

  reader.readAsDataURL(file);
}
</script>

<style scoped>
.q-form {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
