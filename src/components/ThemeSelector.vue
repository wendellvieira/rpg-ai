&lt;template&gt; &lt;q-btn-dropdown flat round dense :icon="currentThemeIcon" class="theme-selector"
&gt; &lt;q-tooltip&gt;Alterar Tema&lt;/q-tooltip&gt; &lt;q-list&gt; &lt;q-item-label header&gt;Tema
da Interface&lt;/q-item-label&gt; &lt;q-item v-for="themeOption in availableThemes"
:key="themeOption.value" clickable v-close-popup @click="setTheme(themeOption.value)" :active="theme
=== themeOption.value" &gt; &lt;q-item-section avatar&gt; &lt;q-icon :name="themeOption.icon" /&gt;
&lt;/q-item-section&gt; &lt;q-item-section&gt; &lt;q-item-label&gt;{{
  themeOption.label
}}&lt;/q-item-label&gt; &lt;q-item-label v-if="themeOption.value === 'auto'" caption &gt; Segue
preferência do sistema &lt;/q-item-label&gt; &lt;/q-item-section&gt; &lt;q-item-section side&gt;
&lt;q-icon v-if="theme === themeOption.value" name="check" color="primary" /&gt;
&lt;/q-item-section&gt; &lt;/q-item&gt; &lt;q-separator /&gt; &lt;q-item clickable v-close-popup
@click="toggleTheme"&gt; &lt;q-item-section avatar&gt; &lt;q-icon name="swap_horiz" /&gt;
&lt;/q-item-section&gt; &lt;q-item-section&gt; &lt;q-item-label&gt;Alternar
Tema&lt;/q-item-label&gt; &lt;q-item-label caption&gt; Ctrl + Shift + T &lt;/q-item-label&gt;
&lt;/q-item-section&gt; &lt;/q-item&gt; &lt;/q-list&gt; &lt;/q-btn-dropdown&gt; &lt;/template&gt;
&lt;script setup lang="ts"&gt; import { computed, onMounted, onUnmounted } from 'vue'; import {
useTheme } from '../services/ThemeService'; import { useKeyboardShortcuts } from
'../composables/useAccessibility'; const { theme, isDark, setTheme, toggleTheme, availableThemes } =
useTheme(); const { registerShortcut } = useKeyboardShortcuts(); // Ícone do tema atual const
currentThemeIcon = computed(() =&gt; { if (theme.value === 'auto') { return 'brightness_auto'; }
return isDark.value ? 'dark_mode' : 'light_mode'; }); // Registrar atalho de teclado let
unregisterShortcut: (() =&gt; void) | null = null; onMounted(() =&gt; { unregisterShortcut =
registerShortcut('ctrl+shift+t', () =&gt; { toggleTheme(); }); }); onUnmounted(() =&gt; { if
(unregisterShortcut) { unregisterShortcut(); } }); &lt;/script&gt; &lt;style scoped&gt;
.theme-selector { margin-left: 4px; } &lt;/style&gt;
