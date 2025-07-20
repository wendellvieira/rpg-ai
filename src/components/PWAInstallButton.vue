&lt;template&gt; &lt;q-btn v-if="showInstallButton" flat round dense icon="download" color="primary"
@click="installPWA" class="pwa-install-btn" &gt; &lt;q-tooltip&gt;Instalar
Aplicativo&lt;/q-tooltip&gt; &lt;/q-btn&gt; &lt;/template&gt; &lt;script setup lang="ts"&gt; import
{ ref, onMounted, onUnmounted } from 'vue'; import { useQuasar } from 'quasar'; import { pwaService
} from '../services/PWAService'; const $q = useQuasar(); const showInstallButton = ref(false); let
installPromptListener: (() =&gt; void) | null = null; onMounted(() =&gt; { // Verificar se o prompt
de instalação está disponível checkInstallAvailability(); // Listener para quando o prompt se torna
disponível installPromptListener = () =&gt; { showInstallButton.value = true; };
window.addEventListener('pwa-install-available', installPromptListener); }); onUnmounted(() =&gt; {
if (installPromptListener) { window.removeEventListener('pwa-install-available',
installPromptListener); } }); async function checkInstallAvailability() { // Verifica se já está
instalado como PWA if (pwaService.isPWA()) { showInstallButton.value = false; return; } // Verifica
se o prompt está disponível showInstallButton.value = pwaService.canInstall(); } async function
installPWA() { try { const result = await pwaService.install(); if (result.installed) { $q.notify({
type: 'positive', message: 'Aplicativo instalado com sucesso!', icon: 'check_circle' });
showInstallButton.value = false; } else if (result.userChoice === 'dismissed') { $q.notify({ type:
'info', message: 'Instalação cancelada pelo usuário', icon: 'info' }); } } catch (error) {
console.error('Erro na instalação PWA:', error); $q.notify({ type: 'negative', message: 'Erro ao
instalar aplicativo', icon: 'error' }); } } &lt;/script&gt; &lt;style scoped&gt; .pwa-install-btn {
margin-left: 8px; } &lt;/style&gt;
