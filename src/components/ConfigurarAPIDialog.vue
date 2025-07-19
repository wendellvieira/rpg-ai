<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Configurar API OpenAI</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <q-banner rounded class="bg-info text-white">
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            <div v-if="!apiKeyNoEnv">
              Configure sua chave de API da OpenAI para habilitar funcionalidades de IA. Sua chave
              será armazenada apenas localmente no seu navegador.
            </div>
            <div v-else>
              ✅ API Key encontrada no arquivo .env - OpenAI configurado automaticamente!
              <br />Você pode ajustar apenas as configurações adicionais abaixo.
            </div>
          </q-banner>
        </div>

        <q-form @submit="salvarConfiguracao" class="q-gutter-md">
          <q-input
            v-if="!apiKeyNoEnv"
            v-model="form.apiKey"
            label="Chave da API OpenAI *"
            outlined
            :type="mostrarChave ? 'text' : 'password'"
            placeholder="sk-..."
            :rules="[(val) => !!val || 'Chave da API é obrigatória']"
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                :icon="mostrarChave ? 'visibility_off' : 'visibility'"
                @click="mostrarChave = !mostrarChave"
              />
            </template>
          </q-input>

          <div v-if="apiKeyNoEnv" class="q-mb-md">
            <q-banner rounded class="bg-positive text-white">
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              API Key: ••••••••••••••••••••••••••••••••••••••••••••••••••••
              <br />
              <small>Usando chave do arquivo .env</small>
            </q-banner>
          </div>

          <q-select
            v-model="form.modelo"
            :options="modelosDisponiveis"
            label="Modelo"
            outlined
            dense
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="psychology" />
            </template>
          </q-select>

          <div class="row q-gutter-md">
            <div class="col">
              <q-slider
                v-model="form.temperatura"
                :min="0"
                :max="2"
                :step="0.1"
                label
                label-always
                :label-value="`Temperatura: ${form.temperatura}`"
                color="primary"
              />
              <div class="text-caption text-grey-6">
                Controla a criatividade das respostas (0 = conservador, 2 = criativo)
              </div>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model.number="form.maxTokens"
                label="Máximo de Tokens"
                type="number"
                outlined
                dense
                :min="100"
                :max="4000"
              >
                <template v-slot:prepend>
                  <q-icon name="data_usage" />
                </template>
              </q-input>
              <div class="text-caption text-grey-6">
                Limite de tokens por resposta (maior = respostas mais longas)
              </div>
            </div>
          </div>

          <q-separator />

          <div class="text-subtitle2">Configurações Avançadas</div>

          <q-input
            v-model="form.organizacao"
            label="ID da Organização (opcional)"
            outlined
            dense
            placeholder="org-..."
          >
            <template v-slot:prepend>
              <q-icon name="business" />
            </template>
          </q-input>

          <q-input
            v-model="form.baseUrl"
            label="URL Base (opcional)"
            outlined
            dense
            placeholder="https://api.openai.com/v1"
          >
            <template v-slot:prepend>
              <q-icon name="link" />
            </template>
          </q-input>

          <q-checkbox v-model="form.habilitarLog" label="Habilitar logs detalhados" left-label />
        </q-form>

        <div class="q-mt-md">
          <q-btn
            outline
            color="primary"
            icon="test_tube"
            label="Testar Conexão"
            @click="testarConexao"
            :loading="testando"
            :disable="!apiKeyNoEnv && !form.apiKey"
          />

          <div v-if="resultadoTeste" class="q-mt-sm">
            <q-banner
              :class="resultadoTeste.sucesso ? 'bg-positive' : 'bg-negative'"
              text-color="white"
              rounded
            >
              <template v-slot:avatar>
                <q-icon :name="resultadoTeste.sucesso ? 'check_circle' : 'error'" />
              </template>
              {{ resultadoTeste.mensagem }}
            </q-banner>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="onDialogCancel" />
        <q-btn
          unelevated
          label="Salvar Configuração"
          color="primary"
          icon="save"
          @click="salvarConfiguracao"
          :loading="salvando"
          :disable="!formularioValido"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useConfigStore } from '../stores/configStore';

interface ConfigAPI {
  apiKey: string;
  modelo: string;
  temperatura: number;
  maxTokens: number;
  organizacao: string;
  baseUrl: string;
  habilitarLog: boolean;
}

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const configStore = useConfigStore();
const salvando = ref(false);
const testando = ref(false);
const mostrarChave = ref(false);
const resultadoTeste = ref<{ sucesso: boolean; mensagem: string } | null>(null);

// Verifica se há API key no .env
const temApiKeyNoEnv = !!import.meta.env.VITE_OPENAI_API_KEY;
const apiKeyNoEnv = ref(temApiKeyNoEnv);

const form = ref<ConfigAPI>({
  apiKey: '',
  modelo: 'gpt-3.5-turbo',
  temperatura: 0.7,
  maxTokens: 1000,
  organizacao: '',
  baseUrl: 'https://api.openai.com/v1',
  habilitarLog: false,
});

const modelosDisponiveis = [
  { label: 'GPT-3.5 Turbo (Recomendado)', value: 'gpt-3.5-turbo' },
  { label: 'GPT-3.5 Turbo 16k', value: 'gpt-3.5-turbo-16k' },
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-1106-preview' },
  { label: 'GPT-4 32k', value: 'gpt-4-32k' },
];

const formularioValido = computed(() => {
  // Se a API key está no .env, não precisa validar o campo
  if (apiKeyNoEnv.value) {
    return true;
  }
  return form.value.apiKey.trim() !== '' && form.value.apiKey.startsWith('sk-');
});

// Carrega configuração atual se existir
const configAtual = configStore.configuracao;
if (configAtual.openaiApiKey) {
  form.value.apiKey = configAtual.openaiApiKey;
  form.value.modelo = configAtual.openaiModel || 'gpt-3.5-turbo';
  form.value.temperatura = configAtual.openaiTemperature || 0.7;
  form.value.maxTokens = 1000; // Não está no store ainda
  form.value.organizacao = ''; // Não está no store ainda
  form.value.baseUrl = 'https://api.openai.com/v1'; // Não está no store ainda
  form.value.habilitarLog = configAtual.debug || false;
}

async function testarConexao() {
  if (!formularioValido.value) return;

  testando.value = true;
  resultadoTeste.value = null;

  try {
    // Usar a API key do .env se disponível, senão usar a do formulário
    const apiKeyParaTeste = apiKeyNoEnv.value
      ? import.meta.env.VITE_OPENAI_API_KEY
      : form.value.apiKey;

    // Simular teste de conexão com a API
    // Em uma implementação real, isso faria uma chamada de teste para a OpenAI
    const response = await fetch(`${form.value.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKeyParaTeste}`,
        'Content-Type': 'application/json',
        ...(form.value.organizacao && { 'OpenAI-Organization': form.value.organizacao }),
      },
    });

    if (response.ok) {
      resultadoTeste.value = {
        sucesso: true,
        mensagem: 'Conexão estabelecida com sucesso! A API está funcionando.',
      };
    } else {
      const errorData = await response.json();
      resultadoTeste.value = {
        sucesso: false,
        mensagem: `Erro na conexão: ${errorData.error?.message || 'Erro desconhecido'}`,
      };
    }
  } catch (error) {
    resultadoTeste.value = {
      sucesso: false,
      mensagem: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  } finally {
    testando.value = false;
  }
}

function salvarConfiguracao() {
  if (!formularioValido.value) return;

  salvando.value = true;

  try {
    // Atualizar configurações no store
    const configUpdate: Partial<{
      openaiApiKey: string;
      openaiModel: string;
      openaiTemperature: number;
      debug: boolean;
    }> = {
      openaiModel: form.value.modelo,
      openaiTemperature: form.value.temperatura,
      debug: form.value.habilitarLog,
    };

    // Só salvar a API key se não estiver no .env
    if (!apiKeyNoEnv.value) {
      configUpdate.openaiApiKey = form.value.apiKey.trim();
    }

    configStore.atualizarConfiguracao(configUpdate);

    onDialogOK({
      success: true,
      message: apiKeyNoEnv.value
        ? 'Configurações salvas! API Key sendo usada do arquivo .env'
        : 'Configurações salvas com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    onDialogOK({
      success: false,
      message: 'Erro ao salvar configurações',
    });
  } finally {
    salvando.value = false;
  }
}
</script>

<style scoped>
.q-slider {
  margin-top: 1rem;
}
</style>
