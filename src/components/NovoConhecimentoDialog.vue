<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="psychology" class="q-mr-sm" />
          {{ editando ? 'Editar Conhecimento' : 'Novo Conhecimento' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="salvar" class="q-gutter-md">
          <q-input
            v-model="formulario.topico"
            label="Tópico"
            outlined
            dense
            :rules="[
              (val) => (val && val.length > 0) || 'Tópico é obrigatório',
              (val) => (val && val.length <= 100) || 'Máximo 100 caracteres',
            ]"
          />

          <q-select
            v-model="formulario.categoria"
            :options="categoriasDisponiveis"
            label="Categoria"
            outlined
            dense
            :rules="[(val) => !!val || 'Categoria é obrigatória']"
          />

          <q-input
            v-model="formulario.conteudo"
            label="Conteúdo"
            type="textarea"
            outlined
            rows="4"
            :rules="[
              (val) => (val && val.length > 0) || 'Conteúdo é obrigatório',
              (val) => (val && val.length <= 1000) || 'Máximo 1000 caracteres',
            ]"
          />

          <q-select
            v-model="formulario.fonte"
            :options="fontesDisponiveis"
            option-label="label"
            option-value="value"
            label="Fonte"
            outlined
            dense
            emit-value
            map-options
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" @click="cancelar" />
        <q-btn flat label="Salvar" color="primary" @click="salvar" :disable="!formularioValido" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import type { ConhecimentoPersonagem } from '../types';

interface Props {
  conhecimento?: ConhecimentoPersonagem | null;
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// Estado reativo
const editando = computed(() => !!props.conhecimento);

// Formulário
const formulario = ref({
  topico: '',
  categoria: 'Geral',
  conteudo: '',
  fonte: 'descoberto' as 'inicial' | 'descoberto' | 'aprendido',
});

// Opções
const categoriasDisponiveis = [
  'Personagens',
  'Locais',
  'História',
  'Magias',
  'Itens',
  'Criaturas',
  'Organizações',
  'Segredos',
  'Geral',
];

const fontesDisponiveis = [
  { label: 'Inicial', value: 'inicial' },
  { label: 'Descoberto', value: 'descoberto' },
  { label: 'Aprendido', value: 'aprendido' },
];

// Computed
const formularioValido = computed(() => {
  return (
    formulario.value.topico.length > 0 &&
    formulario.value.categoria.length > 0 &&
    formulario.value.conteudo.length > 0 &&
    formulario.value.fonte.length > 0
  );
});

// Watchers
watch(
  () => props.conhecimento,
  (novoConhecimento) => {
    if (novoConhecimento) {
      formulario.value = {
        topico: novoConhecimento.topico,
        categoria: novoConhecimento.categoria,
        conteudo: novoConhecimento.conteudo,
        fonte: novoConhecimento.fonte,
      };
    } else {
      // Reset para novo conhecimento
      formulario.value = {
        topico: '',
        categoria: 'Geral',
        conteudo: '',
        fonte: 'descoberto',
      };
    }
  },
  { immediate: true },
);

// Métodos
function cancelar(): void {
  onDialogCancel();
}

function salvar(): void {
  if (!formularioValido.value) return;

  const conhecimentoSalvo: Omit<ConhecimentoPersonagem, 'id' | 'criadoEm'> = {
    topico: formulario.value.topico,
    categoria: formulario.value.categoria,
    conteudo: formulario.value.conteudo,
    fonte: formulario.value.fonte,
  };

  onDialogOK(conhecimentoSalvo);
}
</script>

<style scoped>
/* Estilos específicos se necessário */
</style>
