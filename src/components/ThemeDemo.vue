<!--
  🎨 Demo do Sistema de Temas
  Componente para demonstrar o funcionamento do sistema de temas
-->
<template>
  <div class="theme-demo">
    <!-- Header -->
    <div class="demo-header">
      <h1 class="demo-title">🎨 Sistema de Temas RPG-AI</h1>
      <p class="demo-subtitle">Demonstração do sistema de design tokens e temas dinâmicos</p>

      <!-- Controles -->
      <div class="demo-controls">
        <QBtn
          icon="palette"
          label="Configurar Tema"
          @click="showThemeConfig = true"
          color="primary"
        />

        <QBtn
          :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
          :label="isDarkMode ? 'Modo Claro' : 'Modo Escuro'"
          @click="toggleDarkMode"
          flat
        />
      </div>
    </div>

    <!-- Theme Info -->
    <QCard class="demo-card q-mb-md">
      <QCardSection>
        <div class="text-h6 q-mb-sm">📋 Status do Tema</div>
        <div class="row q-gutter-md">
          <div class="col">
            <div class="text-caption text-grey-6">Tema Atual</div>
            <div class="text-body1">{{ currentTheme.name }}</div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-6">Modo</div>
            <div class="text-body1">{{ isDarkMode ? 'Escuro' : 'Claro' }}</div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-6">Sistema</div>
            <div class="text-body1">
              {{ systemPrefersDark ? 'Prefere Escuro' : 'Prefere Claro' }}
            </div>
          </div>
        </div>
      </QCardSection>
    </QCard>

    <!-- Color Palette Demo -->
    <QCard class="demo-card q-mb-md">
      <QCardSection>
        <div class="text-h6 q-mb-sm">🎨 Paleta de Cores</div>
        <div class="color-grid">
          <div v-for="colorDemo in colorDemos" :key="colorDemo.name" class="color-demo-item">
            <div class="color-swatch" :style="{ backgroundColor: colorDemo.color }" />
            <div class="color-info">
              <div class="color-name">{{ colorDemo.name }}</div>
              <div class="color-value">{{ colorDemo.color }}</div>
            </div>
          </div>
        </div>
      </QCardSection>
    </QCard>

    <!-- Component Examples -->
    <QCard class="demo-card q-mb-md">
      <QCardSection>
        <div class="text-h6 q-mb-sm">🧩 Exemplos de Componentes</div>

        <!-- Buttons -->
        <div class="demo-section">
          <div class="text-subtitle1 q-mb-sm">Botões</div>
          <div class="row q-gutter-sm">
            <QBtn label="Primary" color="primary" />
            <QBtn label="Secondary" color="secondary" />
            <QBtn label="Accent" color="accent" />
            <QBtn label="Outline" outline color="primary" />
            <QBtn label="Flat" flat color="primary" />
          </div>
        </div>

        <!-- Cards -->
        <div class="demo-section">
          <div class="text-subtitle1 q-mb-sm">Cards</div>
          <div class="row q-gutter-md">
            <QCard class="demo-small-card">
              <QCardSection>
                <div class="text-h6">Card Exemplo</div>
                <div class="text-subtitle2">Com background da surface</div>
              </QCardSection>
            </QCard>

            <QCard class="demo-small-card" bordered>
              <QCardSection>
                <div class="text-h6">Card Bordered</div>
                <div class="text-subtitle2">Com borda do tema</div>
              </QCardSection>
            </QCard>
          </div>
        </div>

        <!-- Typography -->
        <div class="demo-section">
          <div class="text-subtitle1 q-mb-sm">Tipografia</div>
          <div class="typography-demo">
            <div class="text-h4">Heading 4</div>
            <div class="text-h5">Heading 5</div>
            <div class="text-h6">Heading 6</div>
            <div class="text-body1">Body 1 - Texto principal do conteúdo</div>
            <div class="text-body2">Body 2 - Texto secundário</div>
            <div class="text-caption">Caption - Texto auxiliar</div>
          </div>
        </div>
      </QCardSection>
    </QCard>

    <!-- CSS Variables Demo -->
    <QCard class="demo-card q-mb-md">
      <QCardSection>
        <div class="text-h6 q-mb-sm">🔧 Variáveis CSS Ativas</div>
        <div class="css-vars-demo">
          <div class="css-var-item">
            <code>--color-background</code>
            <div class="css-var-preview" :style="{ backgroundColor: 'var(--color-background)' }" />
          </div>
          <div class="css-var-item">
            <code>--color-surface</code>
            <div class="css-var-preview" :style="{ backgroundColor: 'var(--color-surface)' }" />
          </div>
          <div class="css-var-item">
            <code>--color-text-primary</code>
            <div
              class="css-var-preview"
              :style="{ backgroundColor: 'var(--color-text-primary)' }"
            />
          </div>
          <div class="css-var-item">
            <code>--color-border</code>
            <div class="css-var-preview" :style="{ backgroundColor: 'var(--color-border)' }" />
          </div>
        </div>
      </QCardSection>
    </QCard>

    <!-- Theme Configurator Modal -->
    <ThemeConfiguratorSimple v-model="showThemeConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QCard, QCardSection, QBtn } from 'quasar';
import { useThemeSystem } from 'src/composables/useThemeSystem';
import ThemeConfiguratorSimple from './ThemeConfiguratorSimple.vue';

// Usar o sistema de temas
const { currentTheme, isDarkMode, applyTheme } = useThemeSystem();

// Estado local
const showThemeConfig = ref(false);
const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

// Demo das cores
const colorDemos = computed(() => [
  { name: 'Primary', color: currentTheme.value.colors.primary[600] },
  { name: 'Secondary', color: currentTheme.value.colors.secondary[600] },
  { name: 'Accent', color: currentTheme.value.colors.accent[600] },
  { name: 'Success', color: currentTheme.value.colors.success[500] },
  { name: 'Warning', color: currentTheme.value.colors.warning[500] },
  { name: 'Error', color: currentTheme.value.colors.error[500] },
  { name: 'Background', color: currentTheme.value.colors.background },
  { name: 'Surface', color: currentTheme.value.colors.surface },
]);

// Methods
const toggleDarkMode = () => {
  const body = document.body;
  body.classList.toggle('dark');
  applyTheme();
};
</script>

<style scoped>
.theme-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: var(--color-background);
  color: var(--color-text-primary);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;
}

.demo-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.demo-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.demo-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

.demo-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.color-demo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.color-info {
  flex: 1;
}

.color-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.color-value {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
}

.demo-section {
  margin-bottom: 24px;
}

.demo-small-card {
  flex: 1;
  min-width: 200px;
}

.typography-demo > * {
  margin-bottom: 8px;
}

.css-vars-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.css-var-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
}

.css-var-item code {
  font-family: var(--font-family-mono);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.css-var-preview {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border);
}
</style>
