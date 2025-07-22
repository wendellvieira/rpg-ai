<!--
  🎨 Theme Configurator
  Componente para configuração de temas do sistema
-->
<template>
  <QDialog v-model="isDialogVisible" persistent>
    <QCard class="theme-configurator-card" style="min-width: 400px; max-width: 600px">
      <!-- Header -->
      <QCardSection class="row items-center q-pb-none">
        <div class="text-h6">🎨 Configurar Tema</div>
        <QSpace />
        <QBtn icon="close" flat round dense v-close-popup />
      </QCardSection>

      <QSeparator />

      <!-- Content -->
      <QCardSection class="q-pt-md">
        <!-- Modo de tema -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 q-mb-sm">Modo do tema</div>
          <QSelect
            v-model="themeMode"
            :options="modeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            @update:model-value="handleModeChange"
          >
            <template v-slot:prepend>
              <QIcon :name="modeOptions.find((o) => o.value === themeMode)?.icon || 'settings'" />
            </template>
          </QSelect>

          <div class="text-caption text-grey-6 q-mt-xs">
            {{ systemPrefersDark ? '🌙 Sistema prefere escuro' : '☀️ Sistema prefere claro' }}
          </div>
        </div>

        <!-- Seleção de tema -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 q-mb-sm">Tema</div>
          <QSelect
            :model-value="currentTheme.name"
            :options="availableThemes"
            option-label="name"
            option-value="name"
            emit-value
            outlined
            @update:model-value="handleThemeChange"
          >
            <template v-slot:prepend>
              <QIcon name="palette" />
            </template>

            <template v-slot:option="scope">
              <QItem v-bind="scope.itemProps">
                <QItemSection avatar>
                  <div class="row q-gutter-xs">
                    <div
                      v-for="(color, index) in [
                        scope.opt.colors.primary[600],
                        scope.opt.colors.secondary[600],
                        scope.opt.colors.accent[600],
                      ]"
                      :key="index"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                    />
                  </div>
                </QItemSection>
                <QItemSection>
                  <QItemLabel>{{ scope.opt.name }}</QItemLabel>
                  <QItemLabel caption>{{ scope.opt.description }}</QItemLabel>
                </QItemSection>
              </QItem>
            </template>
          </QSelect>
        </div>

        <!-- Preview de cores -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 q-mb-sm">Preview das cores</div>
          <div class="color-preview-grid">
            <div v-for="demo in colorDemos" :key="demo.name" class="color-preview-item">
              <div class="color-preview-swatch" :style="{ backgroundColor: demo.color }" />
              <div class="text-caption">{{ demo.name }}</div>
            </div>
          </div>
        </div>

        <!-- Toggle rápido -->
        <div class="text-center q-mb-md">
          <QBtn
            :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
            :label="isDarkMode ? 'Modo Claro' : 'Modo Escuro'"
            @click="toggleDarkMode"
            flat
            class="toggle-btn"
          >
            <QTooltip>Atalho: ⌘T ou Ctrl+T</QTooltip>
          </QBtn>
        </div>

        <!-- Info atual -->
        <div class="theme-info">
          <div class="text-body2"><strong>Tema atual:</strong> {{ currentTheme.name }}</div>
          <div class="text-body2"><strong>Modo:</strong> {{ isDarkMode ? 'Escuro' : 'Claro' }}</div>
          <div class="text-caption text-grey-6">As configurações são salvas automaticamente</div>
        </div>
      </QCardSection>

      <!-- Actions -->
      <QCardSection class="row items-center justify-end q-pt-none">
        <QBtn label="Fechar" color="primary" v-close-popup />
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  QDialog,
  QCard,
  QCardSection,
  QBtn,
  QSelect,
  QSeparator,
  QSpace,
  QIcon,
  QTooltip,
  QItem,
  QItemSection,
  QItemLabel,
} from 'quasar';
import { useThemeSystem } from 'src/composables/useThemeSystem';

interface Props {
  modelValue?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<Emits>();

// Usar o sistema de temas
const { currentTheme, availableThemes, isDarkMode, setTheme, applyTheme } = useThemeSystem();

// Estado local para modo de tema
const themeMode = ref<'system' | 'light' | 'dark'>('system');
const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

// Computeds
const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const modeOptions = [
  { label: 'Sistema', value: 'system', icon: 'settings' },
  { label: 'Claro', value: 'light', icon: 'light_mode' },
  { label: 'Escuro', value: 'dark', icon: 'dark_mode' },
];

// Demo das cores do tema atual
const colorDemos = computed(() => [
  { name: 'Primary', color: currentTheme.value.colors.primary[600] },
  { name: 'Secondary', color: currentTheme.value.colors.secondary[600] },
  { name: 'Accent', color: currentTheme.value.colors.accent[600] },
  { name: 'Success', color: currentTheme.value.colors.success[500] },
  { name: 'Warning', color: currentTheme.value.colors.warning[500] },
  { name: 'Error', color: currentTheme.value.colors.error[500] },
]);

// Methods
const toggleDarkMode = () => {
  // Simple toggle implementation
  const body = document.body;
  body.classList.toggle('dark');
};

const handleThemeChange = (themeName: string) => {
  setTheme(themeName);
  applyTheme();
};

const handleModeChange = (mode: 'system' | 'light' | 'dark') => {
  themeMode.value = mode;
  if (mode === 'dark') {
    document.body.classList.add('dark');
  } else if (mode === 'light') {
    document.body.classList.remove('dark');
  } else {
    // system mode
    if (systemPrefersDark.value) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
  applyTheme();
};
</script>

<style scoped>
.theme-configurator-card {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
}

.color-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.color-preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.color-preview-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.toggle-btn {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.theme-info {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-top: 8px;
}
</style>
