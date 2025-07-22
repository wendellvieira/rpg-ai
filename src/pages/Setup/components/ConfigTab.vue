<template>
  <div class="config-tab">
    <div class="text-h6 q-mb-md">Configurações do Sistema</div>

    <!-- Configurações da API OpenAI -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          <q-icon name="key" class="q-mr-sm" />
          OpenAI API
        </div>

        <div v-if="ctrl.temApiKeyNoEnv" class="q-mb-md">
          <q-banner rounded class="bg-positive text-white">
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            ✅ API Key configurada via arquivo .env
            <br />
            <small>••••••••••••••••••••••••••••••••••••••••••••••••••••</small>
          </q-banner>
        </div>

        <q-input
          v-if="!ctrl.temApiKeyNoEnv"
          v-model="ctrl.configuracoes.value.apiKey"
          label="API Key"
          type="password"
          outlined
          class="q-mb-md"
          hint="Sua chave de API da OpenAI"
        />

        <q-select
          v-model="ctrl.configuracoes.value.modelo"
          :options="ctrl.modelosDisponiveis"
          label="Modelo"
          outlined
          class="q-mb-md"
          hint="Modelo de IA a ser utilizado"
        />

        <div class="row q-gutter-md">
          <div class="col">
            <q-slider
              v-model="ctrl.configuracoes.value.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              label
              label-always
              class="q-mb-md"
            />
            <div class="text-caption">Temperature ({{ ctrl.configuracoes.value.temperature }})</div>
          </div>
          <div class="col">
            <q-slider
              v-model="ctrl.configuracoes.value.maxTokens"
              :min="100"
              :max="4000"
              :step="100"
              label
              label-always
              class="q-mb-md"
            />
            <div class="text-caption">Max Tokens ({{ ctrl.configuracoes.value.maxTokens }})</div>
          </div>
        </div>

        <div class="row q-gutter-md">
          <q-btn
            color="positive"
            label="Testar Conexão"
            @click="ctrl.testarAPI"
            :loading="ctrl.testandoAPI.value"
          />
          <q-btn color="primary" label="Salvar Configurações" @click="ctrl.salvarConfiguracoes" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Configurações Gerais -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          <q-icon name="tune" class="q-mr-sm" />
          Configurações Gerais
        </div>

        <q-toggle
          v-model="ctrl.configuracoes.value.autoSave"
          label="Auto-save ativado"
          class="q-mb-md"
        />

        <q-select
          v-model="ctrl.configuracoes.value.tema"
          :options="['claro', 'escuro']"
          label="Tema"
          outlined
          class="q-mb-md"
        />

        <q-btn color="primary" label="Salvar Configurações" @click="ctrl.salvarConfiguracoes" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type { SetupPage_PageCtrl } from '../SetupPage_PageCtrl';

interface Props {
  ctrl: SetupPage_PageCtrl;
}

defineProps<Props>();
</script>
