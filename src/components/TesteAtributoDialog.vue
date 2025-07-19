<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Teste de Atributo</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="column q-gutter-md">
          <!-- Seleção do Personagem -->
          <q-select
            v-model="personagemSelecionado"
            :options="personagensDisponiveis"
            option-value="id"
            option-label="nome"
            label="Personagem"
            emit-value
            map-options
            :disable="!personagensDisponiveis.length"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> Nenhum personagem disponível </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Seleção do Atributo -->
          <q-select
            v-model="atributoSelecionado"
            :options="atributosDisponiveis"
            label="Atributo"
            :disable="!personagemSelecionado"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption v-if="personagemAtual">
                    Valor: {{ getValorAtributo(scope.opt.value) }} (Mod:
                    {{ getModificadorAtributo(scope.opt.value) >= 0 ? '+' : ''
                    }}{{ getModificadorAtributo(scope.opt.value) }})
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Dificuldade -->
          <q-select
            v-model="dificuldadeSelecionada"
            :options="dificuldadesDisponiveis"
            label="Dificuldade"
          />

          <!-- Modificadores -->
          <div class="row q-gutter-md">
            <q-input
              v-model.number="modificadorAdicional"
              type="number"
              label="Modificador Adicional"
              style="min-width: 150px"
              dense
            />
            <q-toggle v-model="comVantagem" label="Vantagem" :disable="comDesvantagem" />
            <q-toggle v-model="comDesvantagem" label="Desvantagem" :disable="comVantagem" />
          </div>

          <!-- Proficiência -->
          <q-toggle v-model="proficiente" label="Proficiente" :disable="!personagemSelecionado" />

          <!-- Resultado (se já testado) -->
          <div v-if="ultimoResultado" class="q-pa-md bg-grey-2 rounded-borders">
            <div class="text-subtitle2 q-mb-sm">Resultado:</div>
            <div class="row items-center q-gutter-sm">
              <q-chip
                :color="ultimoResultado.sucesso ? 'positive' : 'negative'"
                text-color="white"
                :label="ultimoResultado.sucesso ? 'SUCESSO' : 'FALHA'"
              />
              <span class="text-body1">
                {{ ultimoResultado.total }}
                {{ ultimoResultado.sucesso ? '≥' : '<' }}
                {{ ultimoResultado.dificuldade }}
              </span>
            </div>
            <div class="text-caption q-mt-xs">
              {{ formatarDetalhes(ultimoResultado) }}
            </div>
            <div v-if="ultimoResultado.critico" class="text-positive text-weight-bold q-mt-xs">
              🎲 CRÍTICO!
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" @click="onCancelClick" />
        <q-btn
          unelevated
          label="Testar"
          color="primary"
          :disable="!podeTestar"
          @click="realizarTeste"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useSessaoStore } from '../stores/sessaoStore';
import { usePersonagemStore } from '../stores/personagemStore';
import { Dados } from '../classes/Dados';
import { Atributos } from '../classes/Atributos';
import type { AtributoTipo, ResultadoDados, MensagemAcao } from '../types';

// Tipos para o resultado do teste
interface ResultadoTeste {
  atributo: AtributoTipo;
  valorAtributo: number;
  modificador: number;
  modificadorAdicional: number;
  proficiente: boolean;
  dificuldade: number;
  comVantagem: boolean;
  comDesvantagem: boolean;
  dadosResult: ResultadoDados;
  total: number;
  sucesso: boolean;
  critico: boolean;
}

// Props
interface Props {
  personagemId?: string;
  atributo?: AtributoTipo;
  dificuldade?: number;
}

const props = withDefaults(defineProps<Props>(), {
  dificuldade: Dados.DIFICULDADES.MEDIO,
});

// Emits
defineEmits([...useDialogPluginComponent.emits]);

// Plugin de diálogo
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// Store
const sessaoStore = useSessaoStore();
const personagemStore = usePersonagemStore();

// Estado reativo
const personagemSelecionado = ref<string>(props.personagemId || '');
const atributoSelecionado = ref<{ label: string; value: AtributoTipo } | null>(null);
const dificuldadeSelecionada = ref<{ label: string; value: number }>({
  label: 'Médio (15)',
  value: props.dificuldade,
});
const modificadorAdicional = ref(0);
const comVantagem = ref(false);
const comDesvantagem = ref(false);
const proficiente = ref(false);
const ultimoResultado = ref<ResultadoTeste | null>(null);

// Opções disponíveis
const personagensDisponiveis = computed(() => {
  return personagemStore.personagens.map((p) => ({
    id: p.id,
    nome: p.nome,
  }));
});

const atributosDisponiveis = computed(() => [
  { label: 'Força', value: 'forca' as AtributoTipo },
  { label: 'Destreza', value: 'destreza' as AtributoTipo },
  { label: 'Constituição', value: 'constituicao' as AtributoTipo },
  { label: 'Inteligência', value: 'inteligencia' as AtributoTipo },
  { label: 'Sabedoria', value: 'sabedoria' as AtributoTipo },
  { label: 'Carisma', value: 'carisma' as AtributoTipo },
]);

const dificuldadesDisponiveis = computed(() => [
  { label: 'Muito Fácil (5)', value: Dados.DIFICULDADES.MUITO_FACIL },
  { label: 'Fácil (10)', value: Dados.DIFICULDADES.FACIL },
  { label: 'Médio (15)', value: Dados.DIFICULDADES.MEDIO },
  { label: 'Difícil (20)', value: Dados.DIFICULDADES.DIFICIL },
  { label: 'Muito Difícil (25)', value: Dados.DIFICULDADES.MUITO_DIFICIL },
  { label: 'Quase Impossível (30)', value: Dados.DIFICULDADES.QUASE_IMPOSSIVEL },
]);

// Computed
const personagemAtual = computed(() => {
  if (!personagemSelecionado.value) return null;
  return personagemStore.obterPersonagemPorId(personagemSelecionado.value);
});

const podeTestar = computed(() => {
  return !!(
    personagemSelecionado.value &&
    atributoSelecionado.value &&
    dificuldadeSelecionada.value
  );
});

// Métodos
const getValorAtributo = (atributo: AtributoTipo): number => {
  if (!personagemAtual.value) return 10; // Valor padrão
  return personagemAtual.value.getAtributos[atributo];
};

const getModificadorAtributo = (atributo: AtributoTipo): number => {
  const valor = getValorAtributo(atributo);
  return Dados.calcularModificador(valor);
};

const getBonusProficiencia = (): number => {
  if (!personagemAtual.value || !proficiente.value) return 0;
  return personagemAtual.value.bonusProficiencia;
};

const realizarTeste = async () => {
  if (!podeTestar.value || !atributoSelecionado.value) return;

  const valorAtributo = getValorAtributo(atributoSelecionado.value.value);
  const modificadorBase = Dados.calcularModificador(valorAtributo);
  const bonusProficiencia = getBonusProficiencia();
  const modificadorTotal = modificadorBase + bonusProficiencia + modificadorAdicional.value;

  let dadosResult: ResultadoDados;

  if (comVantagem.value) {
    dadosResult = Dados.rolarComVantagem(modificadorTotal);
  } else if (comDesvantagem.value) {
    dadosResult = Dados.rolarComDesvantagem(modificadorTotal);
  } else {
    dadosResult = Dados.rolarD20(modificadorTotal);
  }

  const sucesso = Dados.testarDificuldade(dadosResult.total, dificuldadeSelecionada.value.value);

  ultimoResultado.value = {
    atributo: atributoSelecionado.value.value,
    valorAtributo,
    modificador: modificadorBase,
    modificadorAdicional: modificadorAdicional.value,
    proficiente: proficiente.value,
    dificuldade: dificuldadeSelecionada.value.value,
    comVantagem: comVantagem.value,
    comDesvantagem: comDesvantagem.value,
    dadosResult,
    total: dadosResult.total,
    sucesso,
    critico: dadosResult.critico,
  };

  // Adicionar mensagem ao chat se houver sessão ativa
  if (sessaoStore.sessaoAtual) {
    const atributoNome =
      atributosDisponiveis.value.find((a) => a.value === atributoSelecionado.value?.value)?.label ||
      '';
    const dificuldadeNome =
      dificuldadesDisponiveis.value.find((d) => d.value === dificuldadeSelecionada.value.value)
        ?.label || '';

    sessaoStore.sessaoAtual.adicionarMensagem({
      tipo: 'acao',
      personagem: personagemSelecionado.value || 'Personagem',
      acao: `Teste de ${atributoNome} (${dificuldadeNome})`,
      resultado: sucesso ? 'Sucesso' : 'Falha',
      dados: dadosResult,
      sucesso,
    } as Omit<MensagemAcao, 'id' | 'timestamp' | 'turno' | 'rodada'>);

    // Salvar sessão com a nova mensagem
    // Nota: Para implementação futura quando o sistema de persistência for integrado
    // try {
    //   await sessaoStore.salvarSessao(sessaoAtual);
    // } catch (error) {
    //   console.error('Erro ao salvar sessão após teste:', error);
    // }
  }
};

const formatarDetalhes = (resultado: ResultadoTeste): string => {
  const partes: string[] = [];

  if (resultado.comVantagem) partes.push('Vantagem');
  if (resultado.comDesvantagem) partes.push('Desvantagem');
  if (resultado.proficiente) partes.push('Proficiente');
  if (resultado.modificadorAdicional !== 0) {
    partes.push(
      `Mod. ${resultado.modificadorAdicional >= 0 ? '+' : ''}${resultado.modificadorAdicional}`,
    );
  }

  const detalhes = `Dados: ${resultado.dadosResult.tipo}`;
  return partes.length > 0 ? `${detalhes} | ${partes.join(', ')}` : detalhes;
};

// Handlers de diálogo
const onOKClick = () => {
  onDialogOK(ultimoResultado.value);
};

const onCancelClick = () => {
  onDialogCancel();
};

// Inicialização
onMounted(() => {
  // Carregar personagens se não estiverem carregados
  if (personagemStore.personagens.length === 0) {
    personagemStore.carregarPersonagens();
  }

  // Se um atributo foi passado como prop, selecionar automaticamente
  if (props.atributo) {
    atributoSelecionado.value =
      atributosDisponiveis.value.find((a) => a.value === props.atributo) || null;
  }

  // Se apenas um personagem disponível, selecionar automaticamente
  if (personagensDisponiveis.value.length === 1) {
    personagemSelecionado.value = personagensDisponiveis.value[0]!.id;
  }
});
</script>
