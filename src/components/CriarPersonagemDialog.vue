<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Criar Novo Personagem</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="criarPersonagem" class="q-gutter-md">
          <!-- Informações Básicas -->
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="form.nome"
                label="Nome do Personagem *"
                outlined
                dense
                :rules="[(val) => !!val || 'Nome é obrigatório']"
                maxlength="50"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-select
                v-model="form.classe"
                :options="classesDisponiveis"
                label="Classe *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(val) => !!val || 'Classe é obrigatória']"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-sword-cross" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-select
                v-model="form.raca"
                :options="racasDisponiveis"
                label="Raça *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(val) => !!val || 'Raça é obrigatória']"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-account-group" />
                </template>
              </q-select>
            </div>
            <div class="col">
              <q-input
                v-model.number="form.nivel"
                label="Nível"
                type="number"
                outlined
                dense
                :min="1"
                :max="20"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-star" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Atributos -->
          <q-separator />
          <div class="text-subtitle2">Atributos</div>

          <div class="row q-gutter-sm">
            <div class="col-6 col-md-4" v-for="(valor, atributo) in form.atributos" :key="atributo">
              <q-input
                v-model.number="form.atributos[atributo]"
                :label="nomeAtributo(atributo)"
                type="number"
                outlined
                dense
                :min="3"
                :max="20"
                :hint="`Mod: ${calcularModificador(valor)}`"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="casino"
                    @click="rolarAtributo(atributo)"
                    title="Rolar 4d6, descartar menor"
                  />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-gutter-md">
            <q-btn
              color="secondary"
              outline
              icon="casino"
              label="Rolar Todos"
              @click="rolarTodosAtributos"
              class="col-auto"
            />
            <q-btn
              color="grey"
              outline
              icon="refresh"
              label="Array Padrão (15, 14, 13, 12, 10, 8)"
              @click="usarArrayPadrao"
              class="col-auto"
            />
          </div>

          <!-- Detalhes Adicionais -->
          <q-separator />

          <q-input
            v-model="form.antecedente"
            label="Antecedente"
            outlined
            dense
            placeholder="ex: Soldado, Nobre, Criminoso..."
          >
            <template v-slot:prepend>
              <q-icon name="mdi-book-account" />
            </template>
          </q-input>

          <q-textarea
            v-model="form.descricao"
            label="Descrição/História"
            outlined
            rows="3"
            placeholder="Descreva brevemente a aparência e história do personagem..."
            maxlength="500"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-textarea>

          <!-- Configurações -->
          <q-separator />
          <div class="text-subtitle2">Configurações</div>

          <div class="row q-gutter-md">
            <q-checkbox v-model="form.jogador" label="Personagem do Jogador" left-label />
            <q-checkbox v-model="form.npc" label="NPC (controlado pela IA)" left-label />
          </div>

          <div v-if="form.npc" class="q-mt-md">
            <q-textarea
              v-model="form.personalidade"
              label="Personalidade (para IA)"
              outlined
              rows="2"
              placeholder="Descreva a personalidade do NPC para a IA interpretar..."
              maxlength="300"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="onDialogCancel" />
        <q-btn
          unelevated
          label="Criar Personagem"
          color="primary"
          icon="add"
          @click="criarPersonagem"
          :loading="criando"
          :disable="!formularioValido"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { Personagem, type PersonagemConfig } from '../classes/Personagem';
import { Dados } from '../classes/Dados';
import type { AtributosPrimarios } from '../types';

interface FormPersonagem {
  nome: string;
  classe: string;
  raca: string;
  nivel: number;
  atributos: Record<string, number>;
  antecedente: string;
  descricao: string;
  personalidade: string;
  jogador: boolean;
  npc: boolean;
}

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const criando = ref(false);

const form = ref<FormPersonagem>({
  nome: '',
  classe: '',
  raca: '',
  nivel: 1,
  atributos: {
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10,
  },
  antecedente: '',
  descricao: '',
  personalidade: '',
  jogador: true,
  npc: false,
});

const classesDisponiveis = [
  { label: 'Bárbaro', value: 'barbaro' },
  { label: 'Bardo', value: 'bardo' },
  { label: 'Bruxo', value: 'bruxo' },
  { label: 'Clérigo', value: 'clerigo' },
  { label: 'Druida', value: 'druida' },
  { label: 'Feiticeiro', value: 'feiticeiro' },
  { label: 'Guerreiro', value: 'guerreiro' },
  { label: 'Ladino', value: 'ladino' },
  { label: 'Mago', value: 'mago' },
  { label: 'Monge', value: 'monge' },
  { label: 'Paladino', value: 'paladino' },
  { label: 'Patrulheiro', value: 'patrulheiro' },
];

const racasDisponiveis = [
  { label: 'Humano', value: 'humano' },
  { label: 'Elfo', value: 'elfo' },
  { label: 'Anão', value: 'anao' },
  { label: 'Halfling', value: 'halfling' },
  { label: 'Meio-elfo', value: 'meio-elfo' },
  { label: 'Meio-orc', value: 'meio-orc' },
  { label: 'Tiefling', value: 'tiefling' },
  { label: 'Draconato', value: 'draconato' },
  { label: 'Gnomo', value: 'gnomo' },
];

const formularioValido = computed(() => {
  return form.value.nome.trim() !== '' && form.value.classe !== '' && form.value.raca !== '';
});

function nomeAtributo(atributo: string): string {
  const nomes: Record<string, string> = {
    forca: 'Força',
    destreza: 'Destreza',
    constituicao: 'Constituição',
    inteligencia: 'Inteligência',
    sabedoria: 'Sabedoria',
    carisma: 'Carisma',
  };
  return nomes[atributo] || atributo;
}

function calcularModificador(valor: number): string {
  const mod = Math.floor((valor - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function rolarAtributo(atributo: string) {
  // Usa o método específico da classe Dados para rolar atributos
  form.value.atributos[atributo] = Dados.rolarAtributoInicial();
}

function rolarTodosAtributos() {
  Object.keys(form.value.atributos).forEach((atributo) => {
    rolarAtributo(atributo);
  });
}

function usarArrayPadrao() {
  const valores = [15, 14, 13, 12, 10, 8];
  const atributos = Object.keys(form.value.atributos);

  atributos.forEach((atributo, index) => {
    form.value.atributos[atributo] = valores[index] || 10;
  });
}

function criarPersonagem() {
  if (!formularioValido.value) return;

  criando.value = true;

  try {
    // Criar atributos primários
    const atributosPrimarios: AtributosPrimarios = {
      forca: form.value.atributos.forca || 10,
      destreza: form.value.atributos.destreza || 10,
      constituicao: form.value.atributos.constituicao || 10,
      inteligencia: form.value.atributos.inteligencia || 10,
      sabedoria: form.value.atributos.sabedoria || 10,
      carisma: form.value.atributos.carisma || 10,
    };

    // Configuração do personagem
    const config: PersonagemConfig = {
      nome: form.value.nome.trim(),
      classe: form.value.classe,
      raca: form.value.raca,
      nivel: form.value.nivel,
      atributos: atributosPrimarios,
      descricao: form.value.descricao.trim(),
      isIA: form.value.npc,
    };

    // Adicionar prompt de personalidade apenas se for NPC
    if (form.value.npc && form.value.personalidade.trim()) {
      config.promptPersonalidade = form.value.personalidade.trim();
    }

    // Criar personagem
    const personagem = new Personagem(config);

    // Retornar o personagem criado
    onDialogOK(personagem);
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    // Aqui você poderia mostrar uma notificação de erro
  } finally {
    criando.value = false;
  }
}
</script>

<style scoped>
.q-form {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
