<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="swords" class="q-mr-sm" />
        Iniciativa de Combate
      </div>

      <!-- Botões de Controle -->
      <div class="q-mb-md">
        <q-btn
          color="primary"
          icon="calculate"
          label="Calcular Iniciativa"
          @click="calcularIniciativaTodos"
          class="q-mr-sm"
          :disable="!temPersonagens"
        />
        <q-btn
          color="negative"
          icon="swords"
          label="Combate"
          @click="abrirCombate"
          :disable="!temPersonagens"
        />
      </div>

      <!-- Lista de Iniciativa -->
      <div v-if="ordemIniciativa.length > 0">
        <q-list bordered>
          <q-item-label header>Ordem de Iniciativa</q-item-label>
          <q-item
            v-for="(entrada, index) in ordemIniciativa"
            :key="entrada.personagem.id"
            :class="{
              'bg-green-1': entrada.personagem.id === personagemTurnoAtual,
              'bg-red-1': entrada.personagem.hp <= 0,
            }"
          >
            <q-item-section side>
              <q-chip
                :color="entrada.personagem.id === personagemTurnoAtual ? 'green' : 'primary'"
                text-color="white"
                :label="index + 1"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ entrada.personagem.nome }}</q-item-label>
              <q-item-label caption>
                {{ entrada.personagem.raca }} {{ entrada.personagem.classe }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-center">
                <div class="text-h6">{{ entrada.iniciativa }}</div>
                <div class="text-caption">Iniciativa</div>
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="text-center">
                <div class="text-body1">
                  <span :class="{ 'text-red': entrada.personagem.hp <= 0 }">
                    {{ entrada.personagem.hp }}
                  </span>
                  /{{ entrada.personagem.hpMaximo }}
                </div>
                <div class="text-caption">HP</div>
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn-group flat>
                <q-btn
                  icon="auto_fix_high"
                  color="purple"
                  size="sm"
                  @click="abrirConjuracao(entrada.personagem)"
                  :disable="entrada.personagem.hp <= 0 || !entrada.personagem.podeConjurar"
                >
                  <q-tooltip>Conjurar Magia</q-tooltip>
                </q-btn>
                <q-btn
                  icon="flash_on"
                  color="indigo"
                  size="sm"
                  @click="abrirSlots(entrada.personagem)"
                  :disable="entrada.personagem.hp <= 0 || !entrada.personagem.podeConjurar"
                >
                  <q-tooltip>Ver Slots de Magia</q-tooltip>
                </q-btn>
                <q-btn
                  icon="healing"
                  color="positive"
                  size="sm"
                  @click="aplicarCura(entrada.personagem)"
                  :disable="entrada.personagem.hp >= entrada.personagem.hpMaximo"
                >
                  <q-tooltip>Aplicar Cura</q-tooltip>
                </q-btn>
                <q-btn
                  icon="heart_broken"
                  color="negative"
                  size="sm"
                  @click="aplicarDano(entrada.personagem)"
                  :disable="entrada.personagem.hp <= 0"
                >
                  <q-tooltip>Aplicar Dano</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Estado Vazio -->
      <div v-else class="text-center q-pa-md text-grey-6">
        <q-icon name="info" size="48px" class="q-mb-sm" />
        <div>Nenhuma iniciativa calculada</div>
        <div class="text-caption">Adicione personagens e calcule a iniciativa</div>
      </div>
    </q-card-section>
  </q-card>

  <!-- Dialog de Combate -->
  <CombateDialog v-model="mostrarCombate" @ataque-executado="onAtaqueExecutado" />

  <!-- Dialog de Conjuração de Magias -->
  <ConjurarMagiaDialog
    v-model="mostrarConjuracao"
    :conjurador="conjuradorSelecionado"
    :alvos-disponiveis="personagensDisponiveis"
  />

  <!-- Dialog de Slots de Magia -->
  <SlotsDialog v-model="mostrarSlots" :personagem="personagemSlots" />

  <!-- Dialog de Aplicar Dano/Cura -->
  <q-dialog v-model="mostrarDanoCura" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">{{ tipoDanoCura }} - {{ personagemSelecionado?.nome }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model.number="quantidadeDanoCura"
          type="number"
          :label="tipoDanoCura === 'Dano' ? 'Pontos de Dano' : 'Pontos de Cura'"
          filled
          min="1"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn
          flat
          :label="tipoDanoCura === 'Dano' ? 'Aplicar Dano' : 'Curar'"
          :color="tipoDanoCura === 'Dano' ? 'negative' : 'positive'"
          @click="confirmarDanoCura"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePersonagemStore } from '../stores/personagemStore';
import { useSessaoStore } from '../stores/sessaoStore';
import { SistemaCombate, type ResultadoAtaque } from '../classes/SistemaCombate';
import type { Personagem } from '../classes/Personagem';
import CombateDialog from './CombateDialog.vue';
import ConjurarMagiaDialog from './ConjurarMagiaDialog.vue';
import SlotsDialog from './SlotsDialog.vue';

// Stores
const personagemStore = usePersonagemStore();
const sessaoStore = useSessaoStore();

// Reactive refs
const ordemIniciativa = ref<Array<{ personagem: Personagem; iniciativa: number }>>([]);
const mostrarCombate = ref(false);
const mostrarDanoCura = ref(false);
const mostrarConjuracao = ref(false);
const mostrarSlots = ref(false);
const personagemSelecionado = ref<Personagem | null>(null);
const conjuradorSelecionado = ref<Personagem | null>(null);
const personagemSlots = ref<Personagem | null>(null);
const tipoDanoCura = ref<'Dano' | 'Cura'>('Dano');
const quantidadeDanoCura = ref(1);

// Sistema de combate
const sistemaCombate = new SistemaCombate();

// Computed
const temPersonagens = computed(() => {
  return sessaoStore.sessaoAtual && sessaoStore.sessaoAtual.getParticipantes().length > 0;
});

const personagemTurnoAtual = computed(() => {
  return sessaoStore.sessaoAtual?.getPersonagemTurnoAtual() || null;
});

const personagensDisponiveis = computed(() => {
  if (!sessaoStore.sessaoAtual) return [];
  return sessaoStore.sessaoAtual.getParticipantes();
});

// Methods
function calcularIniciativaTodos() {
  if (!sessaoStore.sessaoAtual) return;

  const personagens = sessaoStore.sessaoAtual
    .getParticipantes()
    .map((id: string) => personagemStore.obterPersonagemPorId(id))
    .filter((p: Personagem | undefined): p is Personagem => p !== undefined);

  ordemIniciativa.value = sistemaCombate.ordernarIniciativa(personagens);
}

function abrirCombate() {
  mostrarCombate.value = true;
}

function abrirConjuracao(personagemRef: { id: string }) {
  const personagem = personagemStore.obterPersonagemPorId(personagemRef.id);
  if (!personagem) return;

  conjuradorSelecionado.value = personagem;
  mostrarConjuracao.value = true;
}

function abrirSlots(personagemRef: { id: string }) {
  const personagem = personagemStore.obterPersonagemPorId(personagemRef.id);
  if (!personagem) return;

  personagemSlots.value = personagem;
  mostrarSlots.value = true;
}

function aplicarDano(personagemRef: { id: string }) {
  const personagem = personagemStore.obterPersonagemPorId(personagemRef.id);
  if (!personagem) return;

  personagemSelecionado.value = personagem;
  tipoDanoCura.value = 'Dano';
  quantidadeDanoCura.value = 1;
  mostrarDanoCura.value = true;
}

function aplicarCura(personagemRef: { id: string }) {
  const personagem = personagemStore.obterPersonagemPorId(personagemRef.id);
  if (!personagem) return;

  personagemSelecionado.value = personagem;
  tipoDanoCura.value = 'Cura';
  quantidadeDanoCura.value = 1;
  mostrarDanoCura.value = true;
}

async function confirmarDanoCura() {
  if (!personagemSelecionado.value || quantidadeDanoCura.value <= 0) return;

  if (tipoDanoCura.value === 'Dano') {
    await personagemStore.aplicarDano(personagemSelecionado.value.id, quantidadeDanoCura.value);
  } else {
    await personagemStore.aplicarCura(personagemSelecionado.value.id, quantidadeDanoCura.value);
  }

  // Atualiza a lista de iniciativa com os HPs atualizados
  for (const entrada of ordemIniciativa.value) {
    const personagemAtualizado = personagemStore.obterPersonagemPorId(entrada.personagem.id);
    if (personagemAtualizado) {
      Object.assign(entrada.personagem, personagemAtualizado);
    }
  }

  mostrarDanoCura.value = false;
}

function onAtaqueExecutado(resultado: ResultadoAtaque) {
  // Atualiza a lista de iniciativa com os HPs atualizados
  for (const entrada of ordemIniciativa.value) {
    const personagemAtualizado = personagemStore.obterPersonagemPorId(entrada.personagem.id);
    if (personagemAtualizado) {
      entrada.personagem = personagemAtualizado;
    }
  }

  console.log('Ataque executado:', resultado);
}
</script>

<style scoped>
.bg-green-1 {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.bg-red-1 {
  background-color: rgba(244, 67, 54, 0.1) !important;
}
</style>
