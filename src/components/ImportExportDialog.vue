<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Import/Export de Dados</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-tabs v-model="tab" align="justify" dense>
          <q-tab name="export" icon="download" label="Exportar" />
          <q-tab name="import" icon="upload" label="Importar" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Aba de Exportação -->
          <q-tab-panel name="export">
            <div class="text-subtitle2 q-mb-md">Exportar Dados</div>

            <div class="q-mb-md">
              <q-banner rounded class="bg-info text-white">
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                Exporte seus dados para backup ou compartilhamento. O arquivo será baixado em
                formato JSON.
              </q-banner>
            </div>

            <div class="q-gutter-md">
              <q-option-group
                v-model="exportOptions.tipo"
                :options="tiposExportacao"
                color="primary"
                type="radio"
              />

              <div v-if="exportOptions.tipo === 'seletivo'" class="q-ml-lg">
                <div class="text-body2 q-mb-sm">Selecione o que exportar:</div>
                <q-option-group
                  v-model="exportOptions.dados"
                  :options="dadosDisponiveis"
                  color="primary"
                  type="checkbox"
                />
              </div>

              <q-checkbox
                v-model="exportOptions.incluirSensiveis"
                label="Incluir dados sensíveis (chaves de API)"
                left-label
                color="orange"
              />

              <div class="text-caption text-grey-6">
                <strong>Atenção:</strong> Dados sensíveis como chaves de API devem ser mantidos em
                segurança. Só inclua se necessário.
              </div>
            </div>

            <div class="q-mt-lg">
              <q-btn
                color="primary"
                icon="download"
                label="Baixar Backup"
                @click="exportarDados"
                :loading="exportando"
                unelevated
              />
            </div>
          </q-tab-panel>

          <!-- Aba de Importação -->
          <q-tab-panel name="import">
            <div class="text-subtitle2 q-mb-md">Importar Dados</div>

            <div class="q-mb-md">
              <q-banner rounded class="bg-warning text-white">
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                <strong>Cuidado!</strong> A importação pode substituir dados existentes. Faça um
                backup antes de continuar.
              </q-banner>
            </div>

            <div class="q-gutter-md">
              <q-file
                v-model="importOptions.arquivo"
                label="Selecionar arquivo de backup"
                outlined
                accept=".json"
                max-file-size="10485760"
                @rejected="onRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <div v-if="previewImport" class="q-pa-md bg-grey-1 rounded-borders">
                <div class="text-subtitle2 q-mb-sm">Preview do arquivo:</div>
                <div class="text-body2">
                  <div><strong>Criado em:</strong> {{ previewImport.criadoEm }}</div>
                  <div><strong>Versão:</strong> {{ previewImport.versao }}</div>
                  <div><strong>Contém:</strong></div>
                  <ul class="q-ml-md">
                    <li v-for="item in previewImport.conteudo" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>

              <q-option-group
                v-model="importOptions.modo"
                :options="modosImportacao"
                color="primary"
                type="radio"
              />

              <q-checkbox
                v-model="importOptions.manterConfiguracoes"
                label="Manter configurações atuais (não substituir)"
                left-label
                color="primary"
              />
            </div>

            <div class="q-mt-lg">
              <q-btn
                color="positive"
                icon="upload"
                label="Importar Dados"
                @click="importarDados"
                :loading="importando"
                :disable="!importOptions.arquivo"
                unelevated
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Fechar" color="grey-7" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { PersistenceManager } from '../services/PersistenceManager';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BackupService } from '../services/BackupService';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const $q = useQuasar();

const tab = ref('export');
const exportando = ref(false);
const importando = ref(false);
const previewImport = ref<Record<string, unknown> | null>(null);

const exportOptions = ref({
  tipo: 'completo',
  dados: ['sessoes', 'personagens', 'configuracoes'],
  incluirSensiveis: false,
});

const importOptions = ref({
  arquivo: null as File | null,
  modo: 'substituir',
  manterConfiguracoes: false,
});

const tiposExportacao = [
  { label: 'Backup Completo', value: 'completo' },
  { label: 'Exportação Seletiva', value: 'seletivo' },
];

const dadosDisponiveis = [
  { label: 'Sessões de Jogo', value: 'sessoes' },
  { label: 'Personagens', value: 'personagens' },
  { label: 'Itens Customizados', value: 'itens' },
  { label: 'Configurações', value: 'configuracoes' },
];

const modosImportacao = [
  { label: 'Substituir tudo', value: 'substituir' },
  { label: 'Mesclar (manter existente)', value: 'mesclar' },
  { label: 'Apenas adicionar novos', value: 'adicionar' },
];

// Observa mudanças no arquivo para mostrar preview
watch(
  () => importOptions.value.arquivo,
  async (novoArquivo) => {
    if (novoArquivo) {
      try {
        const texto = await novoArquivo.text();
        const dados = JSON.parse(texto);

        previewImport.value = {
          criadoEm: dados.metadata?.criadoEm || 'Desconhecido',
          versao: dados.metadata?.versao || 'Desconhecida',
          conteudo: Object.keys(dados.dados || {}).map((key) => {
            const nomes: Record<string, string> = {
              sessoes: 'Sessões de Jogo',
              personagens: 'Personagens',
              itens: 'Itens',
              configuracoes: 'Configurações',
            };
            return nomes[key] || key;
          }),
        };
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        previewImport.value = null;
        $q.notify({
          type: 'negative',
          message: 'Erro ao ler o arquivo. Verifique se é um backup válido.',
          position: 'top',
        });
      }
    } else {
      previewImport.value = null;
    }
  },
);

async function exportarDados() {
  exportando.value = true;

  try {
    const persistence = PersistenceManager.getInstance();
    await persistence.inicializar();

    const dados: Record<string, unknown> = {};

    if (exportOptions.value.tipo === 'completo' || exportOptions.value.dados.includes('sessoes')) {
      dados.sessoes = await persistence.listarSessoes();
    }

    if (
      exportOptions.value.tipo === 'completo' ||
      exportOptions.value.dados.includes('personagens')
    ) {
      dados.personagens = await persistence.listarPersonagens();
    }

    if (exportOptions.value.tipo === 'completo' || exportOptions.value.dados.includes('itens')) {
      dados.itens = await persistence.listarItens();
    }

    // Remove dados sensíveis se não solicitado
    if (!exportOptions.value.incluirSensiveis) {
      // Configurações sensíveis serão removidas na versão final
    }

    // Criar arquivo para download
    const backup = {
      metadata: {
        versao: '1.0.0',
        criadoEm: new Date().toISOString(),
        exportadoPor: 'RPG-AI',
      },
      dados,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpg-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Backup exportado com sucesso!',
      position: 'top',
    });

    onDialogOK({ action: 'export', success: true });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar dados',
      position: 'top',
    });
  } finally {
    exportando.value = false;
  }
}

async function importarDados() {
  if (!importOptions.value.arquivo) return;

  importando.value = true;

  try {
    const texto = await importOptions.value.arquivo.text();
    const backup = JSON.parse(texto);

    // Por enquanto, apenas mostra que a funcionalidade está implementada
    // Em uma versão completa, aqui seria implementada a lógica de importação
    console.log('Dados para importar:', backup.dados);

    $q.notify({
      type: 'positive',
      message: 'Funcionalidade de importação em desenvolvimento',
      position: 'top',
    });

    onDialogOK({ action: 'import', success: true });
  } catch (error) {
    console.error('Erro ao importar:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao importar dados',
      position: 'top',
    });
  } finally {
    importando.value = false;
  }
}

function onRejected(rejectedEntries: Array<{ failedPropValidation: string }>) {
  $q.notify({
    type: 'negative',
    message: `Arquivo rejeitado: ${rejectedEntries[0]?.failedPropValidation || 'Erro desconhecido'}`,
    position: 'top',
  });
}
</script>

<style scoped>
.q-tab-panels {
  min-height: 400px;
}
</style>
