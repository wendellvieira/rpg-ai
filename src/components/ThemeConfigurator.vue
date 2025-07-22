<template>
  <div class="theme-configurator">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Configurações de Tema
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Personalize a aparência da interface
        </p>
      </div>

      <QIcon name="palette" class="text-primary-600 dark:text-primary-400" size="24px" />
    </div>

    <!-- Auto-detecção do sistema -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-gray-100">Seguir sistema</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Detectar automaticamente o tema do sistema operacional
          </p>
        </div>

        <QToggle v-model="autoDetectSystemTheme" color="primary" :disable="isChangingTheme" />
      </div>

      <div v-if="autoDetectSystemTheme" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <QIcon name="info" class="mr-1" />
        Sistema detectado: {{ isSystemDarkMode ? 'Escuro' : 'Claro' }}
      </div>
    </div>

    <!-- Seleção manual de temas -->
    <div v-if="!autoDetectSystemTheme" class="mb-6">
      <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">Escolher tema</h4>

      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          :class="[
            'theme-option',
            'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
            currentThemeId === theme.id
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500',
          ]"
          @click="selectTheme(theme.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Preview de cores -->
              <div class="flex space-x-1">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: theme.colors.primary[600] }"
                />
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: theme.colors.secondary[600] }"
                />
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: theme.colors.accent[600] }"
                />
              </div>

              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">
                  {{ theme.name }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ theme.description }}
                </div>
              </div>
            </div>

            <QIcon
              v-if="currentThemeId === theme.id"
              name="check_circle"
              class="text-primary-600"
              size="20px"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Preview do tema atual -->
    <div class="mb-6">
      <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">Preview</h4>

      <div class="theme-preview p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
        <!-- Card de exemplo -->
        <div class="card-rpg p-4 mb-4">
          <div class="flex items-center justify-between mb-3">
            <h5 class="font-semibold text-gray-900 dark:text-gray-100">Card de Exemplo</h5>
            <QIcon name="star" class="text-secondary-600 dark:text-secondary-400" />
          </div>

          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Este é um exemplo de como os componentes ficam com o tema selecionado.
          </p>

          <div class="flex space-x-2">
            <button class="btn-rpg-primary text-sm px-3 py-1">Primário</button>
            <button class="btn-rpg-outline text-sm px-3 py-1">Outline</button>
          </div>
        </div>

        <!-- Paleta de cores -->
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="(color, name) in colorPreview"
            :key="name"
            class="flex items-center space-x-2"
          >
            <div
              class="w-6 h-6 rounded border border-gray-200 dark:border-dark-600"
              :style="{ backgroundColor: color }"
            />
            <span class="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {{ name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle rápido -->
    <div class="flex justify-center mb-6">
      <button
        class="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
        @click="toggleTheme"
        :disabled="autoDetectSystemTheme || isChangingTheme"
      >
        <QIcon :name="isDarkMode ? 'light_mode' : 'dark_mode'" size="16px" />
        <span class="text-sm font-medium">
          {{ isDarkMode ? 'Modo Claro' : 'Modo Escuro' }}
        </span>
        <kbd class="text-xs bg-gray-200 dark:bg-dark-600 px-1.5 py-0.5 rounded"> ⌘T </kbd>
      </button>
    </div>

    <!-- Informações adicionais -->
    <div class="text-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Tema atual: <strong>{{ currentTheme.name }}</strong>
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Pressione ⌘T (Ctrl+T) para alternar rapidamente
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { QIcon, QToggle, QSpinner } from 'quasar';
import { useThemeSystem } from 'src/composables/useThemeSystem';

// Props
interface Props {
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

// Emits
const emit = defineEmits<{
  themeChanged: [themeId: string];
  close: [];
}>();

// Composables
const {
  currentThemeId,
  currentTheme,
  availableThemes,
  isDarkMode,
  isSystemDarkMode,
  autoDetectSystemTheme,
  setTheme,
  toggleTheme,
  generateThemeCSS,
  initializeTheme,
} = useThemeSystem();

// Estado local
const isChangingTheme = ref(false);

// Computed properties
const colorPreview = computed(() => ({
  primary: currentTheme.value.colors.primary[600],
  secondary: currentTheme.value.colors.secondary[600],
  accent: currentTheme.value.colors.accent[600],
}));

// Métodos
const selectTheme = async (themeId: string) => {
  if (isChangingTheme.value || currentThemeId.value === themeId) return;

  isChangingTheme.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simular delay
    setTheme(themeId);
    emit('themeChanged', themeId);
  } finally {
    isChangingTheme.value = false;
  }
};

const resetToDefault = async () => {
  if (isChangingTheme.value) return;

  isChangingTheme.value = true;

  try {
    autoDetectSystemTheme.value = true;
    await new Promise((resolve) => setTimeout(resolve, 300));
  } finally {
    isChangingTheme.value = false;
  }
};

const exportTheme = () => {
  const themeCSS = generateThemeCSS(currentTheme.value);
  const blob = new Blob([themeCSS], { type: 'text/css' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `theme-${currentTheme.value.id}.css`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 't' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    if (!autoDetectSystemTheme.value && !isChangingTheme.value) {
      toggleTheme();
    }
  }
};

// Lifecycle
onMounted(() => {
  initializeTheme();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.theme-configurator {
  @apply max-w-md mx-auto;
}

.theme-option {
  &:hover {
    @apply shadow-sm;
  }

  &:active {
    @apply scale-98;
  }
}

.theme-preview {
  background: var(--color-surface, #f8fafc);

  .dark & {
    background: var(--color-surface, #1e293b);
  }
}

// Animações
.theme-option,
.theme-preview {
  transition: all 0.2s ease-in-out;
}

// Responsive
@media (max-width: 768px) {
  .theme-configurator {
    @apply max-w-full px-4;
  }
}
</style>
