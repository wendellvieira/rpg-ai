<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12">
        <!-- Header da página -->
        <div class="text-center q-mb-lg">
          <h4 class="text-h4 q-my-md">
            <q-icon name="tune" size="2rem" class="q-mr-md" color="primary" />
            Gerenciamento de Recursos
          </h4>
          <p class="text-subtitle1 text-grey-6">
            Configure personagens, itens e configurações do sistema
          </p>
        </div>

        <!-- Abas principais -->
        <q-card>
          <q-tabs
            v-model="abaAtiva"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="personagens" icon="people" label="Personagens" />
            <q-tab name="itens" icon="inventory" label="Itens" />
            <q-tab name="mapas" icon="map" label="Mapas" />
            <q-tab name="config" icon="settings" label="Configurações" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="abaAtiva" animated>
            <!-- Aba Personagens -->
            <q-tab-panel name="personagens">
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Personagens</div>
                  <div class="text-caption text-grey-6">Gerencie seus personagens</div>
                </div>
                <div class="col-auto">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Novo Personagem"
                    @click="dialogNovoPersonagem = true"
                  />
                </div>
              </div>

              <div v-if="carregandoPersonagens" class="text-center q-py-lg">
                <q-spinner size="2rem" />
                <div class="q-mt-sm">Carregando personagens...</div>
              </div>

              <div v-else-if="personagens.length === 0" class="text-center q-py-xl text-grey-6">
                <q-icon name="people_outline" size="4rem" class="q-mb-md" />
                <div class="text-h6">Nenhum personagem criado</div>
                <div class="q-mt-sm">Crie seu primeiro personagem para começar!</div>
              </div>

              <div v-else class="row q-gutter-md">
                <div
                  v-for="personagem in personagens"
                  :key="personagem.id"
                  class="col-12 col-md-6 col-lg-4"
                >
                  <q-card class="personagem-card">
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <q-avatar size="40px" color="primary" text-color="white">
                          {{ personagem.nome?.[0]?.toUpperCase() || '?' }}
                        </q-avatar>
                        <div class="col q-ml-md">
                          <div class="text-h6">{{ personagem.nome }}</div>
                          <div class="text-caption text-grey-6">
                            {{ personagem.raca }} {{ personagem.classe }}
                          </div>
                        </div>
                        <q-badge v-if="personagem.isIA" color="purple" label="IA" />
                      </div>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn
                        flat
                        size="sm"
                        icon="edit"
                        label="Editar"
                        @click="editarPersonagem(personagem)"
                      />
                      <q-btn
                        flat
                        size="sm"
                        icon="delete"
                        color="negative"
                        label="Excluir"
                        @click="confirmarExclusaoPersonagem(personagem)"
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Aba Itens -->
            <q-tab-panel name="itens">
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Itens</div>
                  <div class="text-caption text-grey-6">
                    Catálogo de armas, armaduras e consumíveis
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Novo Item"
                    @click="abrirDialogNovoItem"
                    class="q-mr-sm"
                  />
                  <q-btn
                    color="secondary"
                    icon="tune"
                    label="Gerenciar Itens"
                    @click="abrirGerenciamentoItens"
                  />
                </div>
              </div>

              <div v-if="carregandoItens" class="text-center q-py-lg">
                <q-spinner size="2rem" />
                <div class="q-mt-sm">Carregando itens...</div>
              </div>

              <div v-else-if="itens.length === 0" class="text-center q-py-xl text-grey-6">
                <q-icon name="inventory_2" size="4rem" class="q-mb-md" />
                <div class="text-h6">Nenhum item criado</div>
                <div class="q-mt-sm">Crie seu primeiro item para o catálogo!</div>
              </div>

              <div v-else class="row q-gutter-md">
                <div v-for="item in itens" :key="item.id" class="col-12 col-md-6 col-lg-4">
                  <q-card class="item-card">
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <q-avatar size="40px" color="secondary" text-color="white">
                          <q-icon :name="getItemIcon(item.tipo)" />
                        </q-avatar>
                        <div class="col q-ml-md">
                          <div class="text-h6">{{ item.nome }}</div>
                          <div class="text-caption text-grey-6">
                            {{ item.tipo }} - {{ item.raridade }}
                          </div>
                        </div>
                        <q-badge v-if="item.magico" color="purple" label="Mágico" />
                      </div>
                      <div v-if="item.descricao" class="q-mt-sm text-body2">
                        {{ item.descricao }}
                      </div>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat size="sm" icon="edit" label="Editar" @click="editarItem(item)" />
                      <q-btn
                        flat
                        size="sm"
                        icon="delete"
                        color="negative"
                        label="Excluir"
                        @click="confirmarExclusaoItem(item)"
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Aba Mapas -->
            <q-tab-panel name="mapas">
              <MapaViewer />
            </q-tab-panel>

            <!-- Aba Configurações -->
            <q-tab-panel name="config">
              <div class="text-h6 q-mb-md">Configurações do Sistema</div>

              <!-- Configurações da API OpenAI -->
              <q-card class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    <q-icon name="key" class="q-mr-sm" />
                    OpenAI API
                  </div>

                  <div v-if="temApiKeyNoEnv" class="q-mb-md">
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
                    v-if="!temApiKeyNoEnv"
                    v-model="configuracoes.apiKey"
                    label="API Key"
                    type="password"
                    outlined
                    class="q-mb-md"
                    hint="Sua chave de API da OpenAI"
                  />

                  <q-select
                    v-model="configuracoes.modelo"
                    :options="modelosDisponiveis"
                    label="Modelo"
                    outlined
                    class="q-mb-md"
                    hint="Modelo de IA a ser utilizado"
                  />

                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-slider
                        v-model="configuracoes.temperature"
                        :min="0"
                        :max="2"
                        :step="0.1"
                        label
                        label-always
                        class="q-mb-md"
                      />
                      <div class="text-caption">Temperature ({{ configuracoes.temperature }})</div>
                    </div>
                    <div class="col">
                      <q-slider
                        v-model="configuracoes.maxTokens"
                        :min="100"
                        :max="4000"
                        :step="100"
                        label
                        label-always
                        class="q-mb-md"
                      />
                      <div class="text-caption">Max Tokens ({{ configuracoes.maxTokens }})</div>
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <q-btn
                      color="positive"
                      label="Testar Conexão"
                      @click="testarConexaoAPI"
                      :loading="testandoAPI"
                    />
                    <q-btn
                      color="primary"
                      label="Salvar Configurações"
                      @click="salvarConfiguracoes"
                    />
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
                    v-model="configuracoes.autoSave"
                    label="Auto-save ativado"
                    class="q-mb-md"
                  />

                  <q-select
                    v-model="configuracoes.tema"
                    :options="['claro', 'escuro']"
                    label="Tema"
                    outlined
                    class="q-mb-md"
                  />

                  <q-btn
                    color="primary"
                    label="Salvar Configurações"
                    @click="salvarConfiguracoes"
                  />
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Dialog para novo personagem -->
    <q-dialog v-model="dialogNovoPersonagem" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Criar Novo Personagem</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="novoPersonagem.nome" label="Nome" outlined autofocus class="q-mb-md" />

          <div class="row q-gutter-md q-mb-md">
            <div class="col">
              <q-select
                v-model="novoPersonagem.raca"
                :options="racasDisponiveis"
                label="Raça"
                outlined
              />
            </div>
            <div class="col">
              <q-select
                v-model="novoPersonagem.classe"
                :options="classesDisponiveis"
                label="Classe"
                outlined
              />
            </div>
          </div>

          <q-toggle v-model="novoPersonagem.isIA" label="Controlado por IA" class="q-mb-md" />

          <q-input
            v-if="novoPersonagem.isIA"
            v-model="novoPersonagem.promptPersonalidade"
            label="Prompt de Personalidade"
            type="textarea"
            outlined
            rows="3"
            hint="Descreva a personalidade e características do personagem para a IA"
            class="q-mb-md"
          />

          <q-input
            v-model="novoPersonagem.descricao"
            label="Descrição"
            type="textarea"
            outlined
            rows="2"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="dialogNovoPersonagem = false" />
          <q-btn
            flat
            label="Criar"
            color="primary"
            @click="criarPersonagem"
            :disable="!novoPersonagem.nome || !novoPersonagem.raca || !novoPersonagem.classe"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para editar personagem -->
    <EditarPersonagemDialog
      v-model="mostrarEditarPersonagem"
      :personagem="personagemCompletoParaEditarTyped"
      @salvar="salvarPersonagemEditado"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineAsyncComponent, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { OpenAIService } from '../services/OpenAIService';
import type { Personagem } from '../classes/Personagem';
import type { AtributosPrimarios, AtributosDerivados, ConhecimentoPersonagem } from '../types';
import { useConfigStore } from '../stores/configStore';
import { useItemStore } from '../stores/itemStore';
import { usePersonagemStore } from '../stores/personagemStore';
import type { Item } from '../domain/entities/Items/Item';
import MapaViewer from '../components/MapaViewer.vue';

// Lazy loading para diálogos pesados
const EditarItemDialog = defineAsyncComponent(() => import('../components/EditarItemDialog.vue'));
const EditarPersonagemDialog = defineAsyncComponent(
  () => import('../components/EditarPersonagemDialog.vue'),
);
const GerenciamentoItensDialog = defineAsyncComponent(
  () => import('../components/GerenciamentoItensDialog.vue'),
);

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const configStore = useConfigStore();
const itemStore = useItemStore();
const personagemStore = usePersonagemStore();

interface PersonagemData {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  isIA: boolean;
  descricao?: string;
}

interface ItemData {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade: string;
  magico: boolean;
  propriedades?: Record<string, unknown>;
}

// Estado reativo
const abaAtiva = ref('personagens');
const carregandoPersonagens = ref(false);
const carregandoItens = ref(false);
const personagens = ref<PersonagemData[]>([]);
const itens = ref<ItemData[]>([]);
const dialogNovoPersonagem = ref(false);
const mostrarEditarPersonagem = ref(false);
const personagemParaEditar = ref<PersonagemData | null>(null);
const personagemCompletoParaEditar = ref<Personagem | null>(null);
const testandoAPI = ref(false);

// Cast do personagem para o tipo correto
const personagemCompletoParaEditarTyped = computed(() => {
  if (!personagemCompletoParaEditar.value) return null;
  return personagemCompletoParaEditar.value as unknown as Personagem;
});

// Configurações
interface ConfiguracaoLocal {
  apiKey: string;
  modelo: string;
  temperature: number;
  maxTokens: number;
  autoSave: boolean;
  tema: 'claro' | 'escuro';
}

const configuracoes = ref<ConfiguracaoLocal>({
  apiKey: '',
  modelo: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  autoSave: true,
  tema: 'claro',
});

// Verifica se há API key no .env
const temApiKeyNoEnv = !!import.meta.env.VITE_OPENAI_API_KEY;

// Dados para formulários
const novoPersonagem = ref({
  nome: '',
  raca: '',
  classe: '',
  isIA: false,
  promptPersonalidade: '',
  descricao: '',
});

// Opções
const racasDisponiveis = [
  'Humano',
  'Elfo',
  'Anão',
  'Halfling',
  'Draconato',
  'Gnomo',
  'Meio-Elfo',
  'Meio-Orc',
  'Tiefling',
];

const classesDisponiveis = [
  'Guerreiro',
  'Mago',
  'Ladino',
  'Clérigo',
  'Bárbaro',
  'Bardo',
  'Druida',
  'Feiticeiro',
  'Paladino',
  'Patrulheiro',
];

const modelosDisponiveis = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];

// Lifecycle
onMounted(() => {
  void carregarPersonagens();
  void carregarItens();
  carregarConfiguracoes();

  // Verificar se há uma aba específica na query string
  const tabParam = route.query.tab as string;
  if (tabParam && ['personagens', 'itens', 'mapas', 'config'].includes(tabParam)) {
    abaAtiva.value = tabParam;
  }
});

// Observar mudanças na query string para mudar a aba
watch(
  () => route.query.tab,
  (newTab) => {
    if (
      newTab &&
      typeof newTab === 'string' &&
      ['personagens', 'itens', 'mapas', 'config'].includes(newTab)
    ) {
      abaAtiva.value = newTab;
    } else if (!newTab) {
      // Se não há tab especificada, volta para personagens
      abaAtiva.value = 'personagens';
    }
  },
  { immediate: true },
);

// Observar mudanças na aba ativa para atualizar a URL (apenas se necessário)
watch(abaAtiva, (novaAba) => {
  const currentTab = route.query.tab as string;
  if (currentTab !== novaAba) {
    void router.replace({
      path: '/setup',
      query: { tab: novaAba },
    });
  }
});

// Métodos
async function carregarPersonagens() {
  carregandoPersonagens.value = true;
  try {
    // Usar o store para carregar personagens (que também popula o store.personagens)
    await personagemStore.carregarPersonagens();

    // Mapear para o formato local da SetupPage
    personagens.value = personagemStore.personagens.map((p) => ({
      id: p.id,
      nome: p.nome,
      raca: p.raca,
      classe: p.classe,
      isIA: p.isIA,
      descricao: p.descricao || '',
    }));
  } catch (error) {
    console.error('Erro ao carregar personagens:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar personagens',
      caption: String(error),
    });
  } finally {
    carregandoPersonagens.value = false;
  }
}

async function criarPersonagem() {
  try {
    // Usar o store para criar o personagem
    await personagemStore.criarPersonagem({
      nome: novoPersonagem.value.nome,
      raca: novoPersonagem.value.raca,
      classe: novoPersonagem.value.classe,
      isIA: novoPersonagem.value.isIA,
    });

    await carregarPersonagens();
    dialogNovoPersonagem.value = false;

    // Limpar formulário
    novoPersonagem.value = {
      nome: '',
      raca: '',
      classe: '',
      isIA: false,
      promptPersonalidade: '',
      descricao: '',
    };

    $q.notify({
      type: 'positive',
      message: 'Personagem criado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao criar personagem',
      caption: String(error),
    });
  }
}

function editarPersonagem(personagem: PersonagemData) {
  try {
    personagemParaEditar.value = personagem;

    // Usar o store para buscar o personagem completo
    const personagemCompleto = personagemStore.buscarPersonagem(personagem.id);

    personagemCompletoParaEditar.value = personagemCompleto;
    mostrarEditarPersonagem.value = true;
  } catch (error) {
    console.error('Erro ao carregar personagem para edição:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar personagem',
      caption: String(error),
    });
  }
}

async function salvarPersonagemEditado(dadosPersonagem: {
  id?: string | undefined;
  nome: string;
  raca: string;
  classe: string;
  descricao: string;
  isIA: boolean;
  promptPersonalidade: string;
  atributosPrimarios: AtributosPrimarios;
  atributosDerivados: AtributosDerivados;
  inventario: Array<{ id: string; nome: string; quantidade: number }>;
  conhecimento: ConhecimentoPersonagem[];
}) {
  try {
    if (dadosPersonagem.id) {
      // Editando personagem existente - usar o store
      await personagemStore.atualizarPersonagem(dadosPersonagem.id, {
        nome: dadosPersonagem.nome,
        raca: dadosPersonagem.raca,
        classe: dadosPersonagem.classe,
        descricao: dadosPersonagem.descricao,
        isIA: dadosPersonagem.isIA,
        promptPersonalidade: dadosPersonagem.promptPersonalidade,
        atributos: {
          primarios: dadosPersonagem.atributosPrimarios,
          derivados: dadosPersonagem.atributosDerivados,
          nivel: 1,
        },
        inventario: dadosPersonagem.inventario.map(
          (item) => [item.id, item.quantidade] as [string, number],
        ),
        conhecimentos: dadosPersonagem.conhecimento,
      });
    } else {
      // Criando novo personagem
      await personagemStore.criarPersonagem({
        nome: dadosPersonagem.nome,
        raca: dadosPersonagem.raca,
        classe: dadosPersonagem.classe,
      });
    }

    console.log('Personagem salvo:', dadosPersonagem.nome);

    mostrarEditarPersonagem.value = false;
    void carregarPersonagens(); // Recarregar lista de personagens
  } catch (error) {
    console.error('Erro ao salvar personagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar personagem',
      position: 'top',
    });
  }
}

function confirmarExclusaoPersonagem(personagem: PersonagemData) {
  $q.dialog({
    title: 'Excluir Personagem',
    message: `Tem certeza que deseja excluir o personagem "${personagem.nome}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        // Usar o store para remover o personagem
        await personagemStore.removerPersonagem(personagem.id);
        await carregarPersonagens();

        $q.notify({
          type: 'positive',
          message: 'Personagem excluído com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao excluir personagem:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir personagem',
          caption: String(error),
        });
      }
    })();
  });
}

async function carregarItens() {
  carregandoItens.value = true;
  try {
    await itemStore.carregarItens();
    itens.value = itemStore.itens.map((item: Item) => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      descricao: item.descricao || '',
      valor: item.valor,
      peso: item.peso,
      raridade: item.raridade,
      magico: item.magico || false,
      propriedades: item.propriedades,
    }));
  } catch (error) {
    console.error('Erro ao carregar itens:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar itens',
      caption: String(error),
    });
  } finally {
    carregandoItens.value = false;
  }
}

function abrirDialogNovoItem() {
  const dialogRef = $q.dialog({
    component: EditarItemDialog,
  });

  dialogRef.onOk((novoItem: ItemData) => {
    // Usar Promise.resolve para lidar com a função async corretamente
    void Promise.resolve().then(async () => {
      try {
        // Usar a store para persistir o item
        const itemCompleto = {
          ...novoItem,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        // Salvar na store (que persiste automaticamente)
        await itemStore.salvarItemFormulario(itemCompleto as unknown as Record<string, unknown>);

        // Recarregar itens da store
        await carregarItens();

        $q.notify({
          type: 'positive',
          message: 'Item criado com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao criar item:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao criar item',
          caption: String(error),
        });
      }
    });
  });
}

function editarItem(item: ItemData) {
  $q.dialog({
    component: EditarItemDialog,
    componentProps: {
      item: item,
    },
  }).onOk((itemEditado: ItemData) => {
    void Promise.resolve().then(async () => {
      try {
        // Salvar na store em vez de apenas atualizar localmente
        await itemStore.salvarItemFormulario(itemEditado as unknown as Record<string, unknown>);

        // Recarregar itens da store
        await carregarItens();

        $q.notify({
          type: 'positive',
          message: 'Item atualizado com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao editar item:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao editar item',
          caption: String(error),
        });
      }
    });
  });
}

function confirmarExclusaoItem(item: ItemData) {
  $q.dialog({
    title: 'Excluir Item',
    message: `Tem certeza que deseja excluir o item "${item.nome}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      const index = itens.value.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        itens.value.splice(index, 1);
      }

      $q.notify({
        type: 'positive',
        message: 'Item excluído com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao excluir item',
        caption: String(error),
      });
    }
  });
}

function getItemIcon(tipo: string): string {
  const icones: Record<string, string> = {
    arma: 'sword',
    armadura: 'shield',
    escudo: 'shield',
    consumivel: 'healing',
    ferramenta: 'build',
    equipamento: 'inventory',
    tesouro: 'diamond',
    outro: 'category',
  };

  return icones[tipo] || 'inventory_2';
}

function carregarConfiguracoes() {
  // Carregar configurações da store
  configuracoes.value = {
    apiKey: configStore.configuracao.openaiApiKey || '',
    modelo: configStore.configuracao.openaiModel || 'gpt-3.5-turbo',
    temperature: configStore.configuracao.openaiTemperature || 0.7,
    maxTokens: 1000, // Campo não existe na store, usar valor padrão
    autoSave: configStore.configuracao.autoSave ?? true,
    tema: configStore.configuracao.tema === 'light' ? 'claro' : 'escuro',
  };
}

function salvarConfiguracoes() {
  try {
    interface ConfigUpdate {
      openaiApiKey?: string;
      openaiModel: string;
      openaiTemperature: number;
      autoSave: boolean;
      tema: 'dark' | 'auto' | 'light';
    }

    const configUpdate: ConfigUpdate = {
      openaiModel: configuracoes.value.modelo,
      openaiTemperature: configuracoes.value.temperature,
      autoSave: configuracoes.value.autoSave,
      tema: configuracoes.value.tema === 'claro' ? 'light' : 'dark',
    };

    // Só salvar a API key se não estiver no .env
    if (!temApiKeyNoEnv) {
      configUpdate.openaiApiKey = configuracoes.value.apiKey;
    }

    configStore.atualizarConfiguracao(configUpdate);

    $q.notify({
      type: 'positive',
      message: temApiKeyNoEnv
        ? 'Configurações salvas! (API Key do .env sendo usada)'
        : 'Configurações salvas com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar configurações',
      caption: String(error),
    });
  }
}

async function testarConexaoAPI() {
  // Verificar se temos API key (do .env ou do formulário)
  const apiKey = temApiKeyNoEnv ? import.meta.env.VITE_OPENAI_API_KEY : configuracoes.value.apiKey;

  if (!apiKey) {
    $q.notify({
      type: 'warning',
      message: 'Informe a API Key primeiro',
    });
    return;
  }

  testandoAPI.value = true;
  try {
    OpenAIService.configurar({
      apiKey,
      model: configuracoes.value.modelo,
      temperature: configuracoes.value.temperature,
      maxTokens: configuracoes.value.maxTokens,
    });

    await OpenAIService.enviarMensagens([{ role: 'user', content: 'Teste de conexão' }]);

    $q.notify({
      type: 'positive',
      message: temApiKeyNoEnv
        ? 'Conexão com OpenAI estabelecida! (usando chave do .env)'
        : 'Conexão com OpenAI estabelecida com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao testar API:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao conectar com OpenAI',
      caption: String(error),
    });
  } finally {
    testandoAPI.value = false;
  }
}

function abrirGerenciamentoItens() {
  const dialogRef = $q.dialog({
    component: GerenciamentoItensDialog,
  });

  dialogRef.onOk(() => {
    // Recarregar itens se necessário
    void carregarItens();
  });
}
</script>

<style scoped>
.personagem-card,
.item-card {
  transition: transform 0.2s;
}

.personagem-card:hover,
.item-card:hover {
  transform: translateY(-2px);
}
</style>
