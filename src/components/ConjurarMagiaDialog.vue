<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Conjurar Magia</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Seleção de Magia -->
        <q-select
          v-model="magiaSelecionada"
          :options="magiasDisponiveis"
          option-label="nome"
          option-value="id"
          label="Selecione uma Magia"
          outlined
          class="q-mb-md"
          @update:model-value="onMagiaChange"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.nome }}</q-item-label>
                <q-item-label caption>
                  {{ scope.opt.escola }} • Nível
                  {{ scope.opt.nivel === 0 ? 'Truque' : scope.opt.nivel }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :color="getCorNivel(scope.opt.nivel)" text-color="white" size="sm">
                  {{ scope.opt.nivel === 0 ? 'T' : scope.opt.nivel }}
                </q-chip>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Detalhes da Magia Selecionada -->
        <div v-if="magiaSelecionada" class="q-mb-md q-pa-md bg-grey-1 rounded-borders">
          <div class="text-subtitle2 q-mb-sm">{{ magiaSelecionada.nome }}</div>
          <div class="text-caption q-mb-sm">{{ magiaSelecionada.descricao }}</div>

          <div class="row q-gutter-sm">
            <q-chip size="sm" outline>{{ magiaSelecionada.tempoConjuracao }}</q-chip>
            <q-chip size="sm" outline>{{ magiaSelecionada.alcance }}</q-chip>
            <q-chip size="sm" outline>{{ magiaSelecionada.duracao }}</q-chip>
            <q-chip
              v-if="magiaSelecionada.concentracao"
              size="sm"
              color="orange"
              text-color="white"
            >
              Concentração
            </q-chip>
          </div>
        </div>

        <!-- Nível de Conjuração -->
        <div v-if="magiaSelecionada && magiaSelecionada.nivel > 0" class="q-mb-md">
          <q-select
            v-model="nivelConjuracao"
            :options="niveisDisponiveis"
            label="Nível de Conjuração"
            outlined
            dense
          />
        </div>

        <!-- Seleção de Alvos -->
        <div class="q-mb-md">
          <q-select
            v-model="alvosEscolhidos"
            :options="alvosDisponiveis"
            option-label="nome"
            label="Selecionar Alvos"
            outlined
            multiple
            use-chips
            :rules="[(val) => val.length > 0 || 'Selecione pelo menos um alvo']"
          />
        </div>

        <!-- Efeitos da Magia -->
        <div v-if="magiaSelecionada && magiaSelecionada.efeitos.length > 0" class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Efeitos</div>
          <q-list dense>
            <q-item v-for="(efeito, index) in magiaSelecionada.efeitos" :key="index">
              <q-item-section avatar>
                <q-chip :color="getCorEfeito(efeito.tipo)" text-color="white" size="sm">
                  {{ efeito.tipo }}
                </q-chip>
              </q-item-section>
              <q-item-section>
                <q-item-label v-if="efeito.dados">
                  {{ efeito.dados }} {{ efeito.condicao ? `(${efeito.condicao})` : '' }}
                </q-item-label>
                <q-item-label caption>{{ efeito.descricao }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          unelevated
          label="Conjurar"
          color="primary"
          @click="conjurarMagia"
          :loading="conjurando"
          :disable="!podeConjurar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useMagiaStore, type DadosMagiaSerializados } from '../stores/magiaStore';
import { SistemaCombate } from '../classes/SistemaCombate';
import { Magia } from '../classes/Magia';
import type { Personagem } from '../classes/Personagem';
import type { NivelMagia } from '../types';

// Props
interface Props {
  conjurador: Personagem;
  alvosDisponiveis: Personagem[];
}

const props = defineProps<Props>();

// Emits
defineEmits([...useDialogPluginComponent.emits]);

// Composables
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const magiaStore = useMagiaStore();

// Estado local
const conjurando = ref(false);
const magiaSelecionada = ref<DadosMagiaSerializados | null>(null);
const nivelConjuracao = ref(1);
const alvosEscolhidos = ref<Personagem[]>([]);

// Sistema de combate
const sistemaCombate = new SistemaCombate();

// Computed
const magiasDisponiveis = computed(() => {
  if (!props.conjurador || !props.conjurador.podeConjurar) {
    return [];
  }

  const capacidades = props.conjurador.capacidadesMagicas;
  if (!capacidades) return [];

  // Filtra magias conhecidas/preparadas pelo personagem
  return magiaStore.magias.filter(() => {
    // Para simplicidade, incluir todas as magias por enquanto
    // No futuro, filtrar por magias conhecidas/preparadas
    return true;
  });
});

const niveisDisponiveis = computed(() => {
  if (!magiaSelecionada.value || !props.conjurador) return [];

  const nivelBase = magiaSelecionada.value.nivel;
  if (nivelBase === 0) return []; // Truques não gastam slots

  const opcoes = [];

  // Verifica slots disponíveis para cada nível de magia
  for (let i = nivelBase; i <= 9; i++) {
    const slotsInfo = props.conjurador.obterSlotsDisponiveis(i as NivelMagia);
    if (slotsInfo.disponiveis > 0) {
      opcoes.push({
        label: `Nível ${i} (${slotsInfo.disponiveis}/${slotsInfo.total} slots)`,
        value: i,
        disable: false,
      });
    } else if (slotsInfo.total > 0) {
      // Mostra o nível mesmo sem slots disponíveis, mas desabilitado
      opcoes.push({
        label: `Nível ${i} (0/${slotsInfo.total} slots)`,
        value: i,
        disable: true,
      });
    }
  }

  return opcoes;
});

const podeConjurar = computed(() => {
  if (!magiaSelecionada.value || alvosEscolhidos.value.length === 0) return false;

  // Truques sempre podem ser conjurados
  if (magiaSelecionada.value.nivel === 0) return true;

  // Verificar se há slots disponíveis para o nível selecionado
  if (!props.conjurador) return false;

  const nivelMagia = nivelConjuracao.value as NivelMagia;
  return props.conjurador.temSlotDisponivel(nivelMagia);
});

// Métodos
function onMagiaChange(magia: DadosMagiaSerializados | null) {
  if (magia) {
    nivelConjuracao.value = magia.nivel > 0 ? magia.nivel : 1;
    alvosEscolhidos.value = [];
  }
}

function getCorNivel(nivel: number): string {
  const cores = [
    'grey-6', // Truque
    'green-6', // 1
    'blue-6', // 2
    'purple-6', // 3
    'orange-6', // 4
    'red-6', // 5
    'pink-6', // 6
    'indigo-6', // 7
    'teal-6', // 8
    'amber-6', // 9
  ];
  return cores[nivel] || 'grey-6';
}

function getCorEfeito(tipo: string): string {
  const cores: Record<string, string> = {
    dano: 'red-6',
    cura: 'green-6',
    buff: 'blue-6',
    debuff: 'orange-6',
    utilidade: 'purple-6',
    controle: 'pink-6',
  };
  return cores[tipo] || 'grey-6';
}

function conjurarMagia() {
  if (!magiaSelecionada.value || alvosEscolhidos.value.length === 0) return;

  conjurando.value = true;

  try {
    // Verificar se é um truque (não gasta slot)
    const isTruque = magiaSelecionada.value.nivel === 0;

    // Se não é truque, verificar e gastar slot de magia
    if (!isTruque) {
      const nivelMagia = nivelConjuracao.value as NivelMagia;

      if (!props.conjurador.temSlotDisponivel(nivelMagia)) {
        throw new Error(`Não há slots de nível ${nivelMagia} disponíveis.`);
      }

      // Gasta o slot de magia
      const slotGasto = props.conjurador.gastarSlotMagia(nivelMagia);
      if (!slotGasto) {
        throw new Error('Não foi possível gastar o slot de magia.');
      }
    }

    // Converter dados serializados para instância de Magia
    const magia = new Magia(magiaSelecionada.value);

    // Executar conjuração
    const resultado = sistemaCombate.conjurarMagia(
      props.conjurador,
      magia,
      alvosEscolhidos.value as Personagem[],
      nivelConjuracao.value,
    );

    // Retornar resultado
    onDialogOK({
      magia: magiaSelecionada.value,
      alvos: alvosEscolhidos.value,
      nivel: nivelConjuracao.value,
      resultado,
      slotGasto: !isTruque,
    });
  } catch (error) {
    console.error('Erro ao conjurar magia:', error);
    // Mostrar erro para o usuário (pode implementar um toast aqui)
  } finally {
    conjurando.value = false;
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
