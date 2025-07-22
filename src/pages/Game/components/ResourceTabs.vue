<template>
  <div class="resource-tabs-container">
    <!-- Cabeçalho do painel -->
    <div class="left-side-header q-px-md q-py-sm">
      <div class="text-h6">Recursos</div>

      <q-btn
        flat
        round
        icon="refresh"
        size="sm"
        @click="ctrl.atualizarRecursos"
        :loading="ctrl.carregandoRecursos.value"
      >
        <q-tooltip>Atualizar</q-tooltip>
      </q-btn>
    </div>

    <!-- Abas de recursos -->
    <div class="cnt-game-context">
      <q-tabs
        v-model="ctrl.abaRecursos.value"
        vertical
        class="tabs-area text-grey-6 q-pt-md"
        active-color="primary"
        indicator-color="primary"
        dense
      >
        <q-tab name="personagens" icon="people">
          <q-tooltip>Personagens</q-tooltip>
        </q-tab>
        <q-tab name="itens" icon="inventory">
          <q-tooltip>Itens</q-tooltip>
        </q-tab>
        <q-tab name="magias" icon="auto_fix_high">
          <q-tooltip>Magias</q-tooltip>
        </q-tab>
        <q-tab name="combate" icon="local_fire_department">
          <q-tooltip>Combate</q-tooltip>
        </q-tab>
        <q-tab name="mapas" icon="map">
          <q-tooltip>Mapas</q-tooltip>
        </q-tab>
      </q-tabs>

      <!-- Conteúdo das abas -->
      <q-tab-panels
        v-model="ctrl.abaRecursos.value"
        animated
        vertical
        transition-prev="jump-up"
        transition-next="jump-up"
        class="full-height scroll q-pa-md"
      >
        <!-- Aba Personagens -->
        <q-tab-panel name="personagens" class="q-pa-none">
          <div class="q-mb-sm">
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar"
              size="sm"
              class="full-width"
              @click="ctrl.adicionarPersonagemASessao"
            />
          </div>

          <q-list dense>
            <q-item
              v-for="personagem in ctrl.personagensDisponiveis.value"
              :key="personagem.id"
              clickable
              @click="ctrl.visualizarPersonagem(personagem)"
            >
              <q-item-section avatar>
                <q-avatar
                  size="32px"
                  :color="personagem.isIA ? 'purple' : 'primary'"
                  text-color="white"
                >
                  {{ personagem.nome[0] }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ personagem.nome }}</q-item-label>
                <q-item-label caption>{{ personagem.raca }} {{ personagem.classe }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    round
                    icon="edit"
                    size="sm"
                    @click.stop="ctrl.editarPersonagem(personagem)"
                  >
                    <q-tooltip>Editar personagem</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="add_circle"
                    size="sm"
                    @click.stop="ctrl.adicionarPersonagemNaSessao(personagem)"
                  >
                    <q-tooltip>Adicionar à sessão</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>

            <q-item v-if="ctrl.personagensDisponiveis.value.length === 0">
              <q-item-section>
                <div class="text-center text-grey-6">
                  <q-icon name="people_outline" size="2rem" />
                  <div class="text-caption">Nenhum personagem</div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <!-- Aba Itens -->
        <q-tab-panel name="itens" class="q-pa-none">
          <div class="text-center text-grey-6 q-py-lg">
            <q-icon name="inventory_2" size="3rem" />
            <div class="text-caption">Em desenvolvimento</div>
          </div>
        </q-tab-panel>

        <!-- Aba Magias -->
        <q-tab-panel name="magias" class="q-pa-none">
          <div class="q-pa-md">
            <q-btn
              color="primary"
              icon="auto_fix_high"
              label="Abrir Catálogo de Magias"
              class="full-width"
              @click="ctrl.abrirCatalogoMagias"
            />
            <div class="text-center text-grey-6 q-py-lg">
              <q-icon name="auto_fix_high" size="3rem" />
              <div class="text-caption">Gerencie magias conhecidas</div>
            </div>
          </div>
        </q-tab-panel>

        <!-- Aba Combate -->
        <q-tab-panel name="combate" class="q-pa-none">
          <IniciativaCombate />
        </q-tab-panel>

        <!-- Aba Mapas -->
        <q-tab-panel name="mapas" class="q-pa-none">
          <MapaCanvas />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GamePage_PageCtrl } from '../GamePage_PageCtrl';
import IniciativaCombate from '../../../components/IniciativaCombate.vue';
import MapaCanvas from '../../../components/MapaCanvas.vue';

interface Props {
  ctrl: GamePage_PageCtrl;
}

defineProps<Props>();
</script>

<style scoped>
.resource-tabs-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.left-side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.cnt-game-context {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.tabs-area {
  min-width: 60px;
}
</style>
