<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Configurar APIs</div>
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
          <q-tab name="openai" icon="psychology" label="OpenAI" />
          <q-tab name="stability" icon="image" label="Stability AI" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="abaAtiva" animated class="q-pa-md">
          <!-- Aba OpenAI -->
          <q-tab-panel name="openai">
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
          </q-tab-panel>

          <!-- Aba Stability AI -->
          <q-tab-panel name="stability">
            <div class="q-mb-md">
              <q-banner rounded class="bg-info text-white">
                <template v-slot:avatar>
                  <q-icon name="image" />
                </template>
                Configure sua chave de API da Stability AI para habilitar geração de imagens de mapas.
                <br />Usado para criar mapas automáticos via inteligência artificial.
              </q-banner>
            </div>

            <q-form class="q-gutter-md">
              <q-input
                v-model="formStability.apiKey"
                label="Chave da API Stability AI"
                outlined
                :type="mostrarChaveStability ? 'text' : 'password'"
                placeholder="sk-..."
                hint="Opcional - para geração de imagens de mapas"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="mostrarChaveStability ? 'visibility_off' : 'visibility'"
                    @click="mostrarChaveStability = !mostrarChaveStability"
                  />
                </template>
              </q-input>

              <q-select
                v-model="formStability.modelo"
                :options="modelosStabilityDisponiveis"
                label="Modelo de Imagem"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="auto_awesome" />
                </template>
              </q-select>

              <div class="q-mb-md">
                <div class="text-h6 q-mb-sm">Configurações de Imagem Padrão</div>

                <div class="row q-gutter-md">
                  <div class="col">
                    <q-input
                      v-model.number="formStability.larguraPadrao"
                      label="Largura (pixels)"
                      type="number"
                      outlined
                      dense
                      min="512"
                      max="2048"
                      step="64"
                    />
                  </div>
                  <div class="col">
                    <q-input
                      v-model.number="formStability.alturaPadrao"
                      label="Altura (pixels)"
                      type="number"
                      outlined
                      dense
                      min="512"
                      max="2048"
                      step="64"
                    />
                  </div>
                </div>

                <div class="row q-gutter-md q-mt-sm">
                  <div class="col">
                    <q-slider
                      v-model="formStability.steps"
                      :min="10"
                      :max="50"
                      :step="1"
                      label
                      label-always
                      :label-value="`Steps: ${formStability.steps}`"
                      color="primary"
                    />
                    <div class="text-caption text-grey-6">
                      Qualidade da imagem (10 = rápido, 50 = alta qualidade)
                    </div>
                  </div>
                </div>

                <div class="row q-gutter-md q-mt-sm">
                  <div class="col">
                    <q-slider
                      v-model="formStability.cfgScale"
                      :min="1"
                      :max="20"
                      :step="0.5"
                      label
                      label-always
                      :label-value="`CFG Scale: ${formStability.cfgScale}`"
                      color="primary"
                    />
                    <div class="text-caption text-grey-6">
                      Fidelidade ao prompt (1 = criativo, 20 = literal)
                    </div>
                  </div>
                </div>
              </div>

              <div class="q-mt-md">
                <q-btn
                  outline
                  color="primary"
                  icon="test_tube"
                  label="Testar Stability AI"
                  @click="testarStabilityAI"
                  :loading="testandoStability"
                  :disable="!formStability.apiKey"
                />

                <div v-if="resultadoTesteStability" class="q-mt-sm">
                  <q-banner
                    :class="resultadoTesteStability.sucesso ? 'bg-positive' : 'bg-negative'"
                    text-color="white"
                    rounded
                  >
                    <template v-slot:avatar>
                      <q-icon :name="resultadoTesteStability.sucesso ? 'check_circle' : 'error'" />
                    </template>
                    {{ resultadoTesteStability.mensagem }}
                  </q-banner>
                </div>
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>

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

// Stability AI
const testandoStability = ref(false);
const mostrarChaveStability = ref(false);
const resultadoTesteStability = ref<{ sucesso: boolean; mensagem: string } | null>(null);

// Abas
const abaAtiva = ref('openai');

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

// Formulário Stability AI
const formStability = ref({
  apiKey: '',
  modelo: 'sd3-large-turbo',
  larguraPadrao: 1024,
  alturaPadrao: 1024,
  steps: 30,
  cfgScale: 7.0,
});

const modelosStabilityDisponiveis = [
  { label: 'SD3 Large Turbo (Recomendado)', value: 'sd3-large-turbo' },
  { label: 'SD3 Large', value: 'sd3-large' },
  { label: 'SD3 Medium', value: 'sd3-medium' },
  { label: 'Stable Image Core', value: 'stable-image-core' },
  { label: 'Stable Image Ultra', value: 'stable-image-ultra' },
];

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

// Carrega configurações da Stability AI se existirem
if (configAtual.stabilityApiKey) {
  formStability.value.apiKey = configAtual.stabilityApiKey;
  formStability.value.modelo = configAtual.stabilityModel || 'sd3-large-turbo';
  formStability.value.larguraPadrao = configAtual.stabilityDefaultWidth || 1024;
  formStability.value.alturaPadrao = configAtual.stabilityDefaultHeight || 1024;
  formStability.value.steps = configAtual.stabilityDefaultSteps || 30;
  formStability.value.cfgScale = configAtual.stabilityDefaultCfgScale || 7.0;
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

async function testarStabilityAI() {
  if (!formStability.value.apiKey) return;

  testandoStability.value = true;
  resultadoTesteStability.value = null;

  try {
    // Fazer uma chamada de teste para verificar se a API key está válida
    const response = await fetch('https://api.stability.ai/v1/user/account', {
      headers: {
        Authorization: `Bearer ${formStability.value.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      resultadoTesteStability.value = {
        sucesso: true,
        mensagem: `Conexão estabelecida! Créditos disponíveis: ${data.credits || 'N/A'}`,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      resultadoTesteStability.value = {
        sucesso: false,
        mensagem: `Erro na conexão: ${errorData.message || 'API key inválida'}`,
      };
    }
  } catch (error) {
    resultadoTesteStability.value = {
      sucesso: false,
      mensagem: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  } finally {
    testandoStability.value = false;
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

    // Salvar configurações da Stability AI se preenchidas
    if (formStability.value.apiKey) {
      configUpdate.stabilityApiKey = formStability.value.apiKey.trim();
      configUpdate.stabilityModel = formStability.value.modelo;
      configUpdate.stabilityDefaultWidth = formStability.value.larguraPadrao;
      configUpdate.stabilityDefaultHeight = formStability.value.alturaPadrao;
      configUpdate.stabilityDefaultSteps = formStability.value.steps;
      configUpdate.stabilityDefaultCfgScale = formStability.value.cfgScale;
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
