<template>
  <q-dialog v-model="mostrarDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Sistema de Combate</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Seleção de Atacante -->
        <div class="q-mb-md">
          <q-select
            v-model="atacanteSelecionado"
            :options="personagensDisponiveis"
            option-label="nome"
            option-value="id"
            label="Atacante"
            filled
            emit-value
            map-options
          />
        </div>

        <!-- Seleção de Alvo -->
        <div class="q-mb-md">
          <q-select
            v-model="alvoSelecionado"
            :options="
              personagensDisponiveis.filter((p: Personagem) => p.id !== atacanteSelecionado)
            "
            option-label="nome"
            option-value="id"
            label="Alvo"
            filled
            emit-value
            map-options
          />
        </div>

        <!-- Seleção de Arma -->
        <div class="q-mb-md" v-if="armasDisponiveis.length > 0">
          <q-select
            v-model="armaSelecionada"
            :options="armasDisponiveis"
            option-label="nome"
            option-value="id"
            label="Arma (opcional)"
            filled
            emit-value
            map-options
            clearable
          />
        </div>

        <!-- Modifiers -->
        <div class="q-mb-md">
          <q-checkbox v-model="vantagem" label="Vantagem" />
          <q-checkbox v-model="desvantagem" label="Desvantagem" class="q-ml-md" />
        </div>

        <!-- Resultado do Último Ataque -->
        <div v-if="ultimoResultado" class="q-mb-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2">Resultado do Ataque:</div>
              <div class="q-mt-sm">
                <q-chip
                  :color="ultimoResultado.sucesso ? 'positive' : 'negative'"
                  text-color="white"
                  :label="ultimoResultado.sucesso ? 'ACERTO' : 'ERRO'"
                />
                <q-chip
                  v-if="ultimoResultado.critico"
                  color="orange"
                  text-color="white"
                  label="CRÍTICO"
                />
              </div>
              <div class="q-mt-sm text-body2">
                {{ ultimoResultado.descricao }}
              </div>
              <div v-if="ultimoResultado.sucesso" class="q-mt-sm">
                <strong>Dano:</strong> {{ ultimoResultado.dano }} ({{ ultimoResultado.tipoDano }})
              </div>
              <div class="q-mt-sm">
                <strong>Rolagem:</strong>
                {{ ultimoResultado.rolagemAtaque.tipo }} = {{ ultimoResultado.rolagemAtaque.total }}
                <span class="text-caption">
                  ({{ ultimoResultado.rolagemAtaque.resultados.join(', ') }})
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn :disabled="!podeAtacar" label="Atacar" color="negative" @click="executarAtaque" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePersonagemStore } from '../stores/personagemStore';
import { useItemStore } from '../stores/itemStore';
import { useSessaoStore } from '../stores/sessaoStore';
import { SistemaCombate, type ResultadoAtaque } from '../classes/SistemaCombate';
import type { SessaoJogo } from '../classes/SessaoJogo';
import type { MensagemAcao } from '../types';
import { Arma } from '../classes/Arma';
import type { Personagem } from '../classes/Personagem';

// Props
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'ataque-executado', resultado: ResultadoAtaque): void;
}

const emit = defineEmits<Emits>();

// Stores
const personagemStore = usePersonagemStore();
const itemStore = useItemStore();
const sessaoStore = useSessaoStore();

// Reactive refs
const atacanteSelecionado = ref<string>('');
const alvoSelecionado = ref<string>('');
const armaSelecionada = ref<string>('');
const vantagem = ref(false);
const desvantagem = ref(false);
const ultimoResultado = ref<ResultadoAtaque | null>(null);

// Sistema de combate
const sistemaCombate = new SistemaCombate();

// Computed
const mostrarDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const personagensDisponiveis = computed(() => {
  if (!sessaoStore.sessaoAtual) return [];

  return sessaoStore.sessaoAtual
    .getParticipantes()
    .map((id: string) => personagemStore.obterPersonagemPorId(id))
    .filter((p: Personagem | undefined): p is Personagem => p !== undefined);
});

const armasDisponiveis = computed(() => {
  if (!atacanteSelecionado.value) return [];

  const atacante = personagemStore.obterPersonagemPorId(atacanteSelecionado.value);
  if (!atacante) return [];

  // Obtém armas do inventário do atacante
  const armas: Arma[] = [];
  for (const [itemId] of atacante.getInventario) {
    const item = itemStore.obterItemPorId(itemId);
    if (item instanceof Arma) {
      armas.push(item);
    }
  }

  return armas;
});

const podeAtacar = computed(() => {
  return (
    atacanteSelecionado.value &&
    alvoSelecionado.value &&
    atacanteSelecionado.value !== alvoSelecionado.value
  );
});

// Methods
async function executarAtaque() {
  if (!podeAtacar.value) return;

  const atacante = personagemStore.obterPersonagemPorId(atacanteSelecionado.value);
  const alvo = personagemStore.obterPersonagemPorId(alvoSelecionado.value);

  if (!atacante || !alvo) return;

  let arma: Arma | undefined;
  if (armaSelecionada.value) {
    const item = itemStore.obterItemPorId(armaSelecionada.value);
    if (item instanceof Arma) {
      arma = item;
    }
  }

  // Executa o ataque
  const resultado = sistemaCombate.atacar(atacante, alvo, arma, vantagem.value, desvantagem.value);

  ultimoResultado.value = resultado;

  // Atualiza o personagem no store
  await personagemStore.salvarPersonagem(alvo);

  // Adicionar mensagem ao chat
  if (sessaoStore.sessaoAtual) {
    sessaoStore.sessaoAtual.adicionarMensagem({
      tipo: 'acao',
      personagem: atacante.nome,
      acao: 'atacar',
      resultado: `${atacante.nome} atacou ${alvo.nome}${arma ? ` com ${arma.nome}` : ''}. ${resultado.descricao}`,
      dados: resultado.rolagemAtaque,
      sucesso: resultado.sucesso,
    } as Omit<MensagemAcao, 'id' | 'timestamp' | 'turno' | 'rodada'>);

    // Salvar a sessão com a nova mensagem
    await sessaoStore.salvarSessao(sessaoStore.sessaoAtual as SessaoJogo);
  }

  // Emite evento
  emit('ataque-executado', resultado);

  // Reset vantagem/desvantagem
  vantagem.value = false;
  desvantagem.value = false;
}

// Watchers
watch([atacanteSelecionado, alvoSelecionado], () => {
  ultimoResultado.value = null;
});

// Evita vantagem e desvantagem simultâneas
watch([vantagem, desvantagem], ([novaVantagem, novaDesvantagem]) => {
  if (novaVantagem && novaDesvantagem) {
    if (vantagem.value) {
      desvantagem.value = false;
    } else {
      vantagem.value = false;
    }
  }
});
</script>

<style scoped>
.q-chip {
  margin-right: 8px;
}
</style>
