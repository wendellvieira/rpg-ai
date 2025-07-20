<template>
  <q-btn-dropdown flat round dense :icon="currentThemeIcon" class="theme-selector">
    <q-tooltip>Alterar Tema</q-tooltip>
    <q-list>
      <q-item-label header>Tema da Interface</q-item-label>
      <q-item
        v-for="themeOption in availableThemes"
        :key="themeOption.value"
        clickable
        v-close-popup
        @click="setTheme(themeOption.value)"
        :active="theme === themeOption.value"
      >
        <q-item-section avatar>
          <q-icon :name="themeOption.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ themeOption.label }}</q-item-label>
          <q-item-label v-if="themeOption.value === 'auto'" caption>
            Segue preferência do sistema
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon v-if="theme === themeOption.value" name="check" color="primary" />
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable v-close-popup @click="toggleTheme">
        <q-item-section avatar>
          <q-icon name="swap_horiz" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Alternar Tema</q-item-label>
          <q-item-label caption> Ctrl + Shift + T </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from '../services/ThemeService';
import { useKeyboardShortcuts } from '../composables/useAccessibility';

const { theme, isDark, setTheme, toggleTheme, availableThemes } = useTheme();
const { registerShortcut } = useKeyboardShortcuts();

// Ícone do tema atual
const currentThemeIcon = computed(() => {
  if (theme.value === 'auto') {
    return 'brightness_auto';
  }
  return isDark.value ? 'dark_mode' : 'light_mode';
});

// Registrar atalho de teclado
let unregisterShortcut: (() => void) | null = null;

onMounted(() => {
  unregisterShortcut = registerShortcut('ctrl+shift+t', () => {
    toggleTheme();
  });
});

onUnmounted(() => {
  if (unregisterShortcut) {
    unregisterShortcut();
  }
});
</script>

<style scoped>
.theme-selector {
  margin-left: 4px;
}
</style>
