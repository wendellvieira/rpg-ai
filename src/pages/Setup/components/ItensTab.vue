<template>
  <div class="itens-tab">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Itens e Equipamentos</div>
        <div class="text-caption text-grey-6">Gerencie o arsenal e equipamentos</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Novo Item"
          @click="ctrl.dialogNovoItem.value = true"
        />
      </div>
    </div>

    <div v-if="ctrl.carregandoItens.value" class="text-center q-py-lg">
      <q-spinner size="2rem" />
      <div class="q-mt-sm">Carregando itens...</div>
    </div>

    <div v-else-if="ctrl.itens.value.length === 0" class="text-center q-py-xl text-grey-6">
      <q-icon name="inventory_2" size="4rem" class="q-mb-md" />
      <div class="text-h6">Nenhum item cadastrado</div>
      <div class="q-mt-sm">Crie seu primeiro item para começar!</div>
    </div>

    <div v-else class="row q-gutter-md">
      <div v-for="item in ctrl.itens.value" :key="item.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="item-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <q-avatar size="40px" color="primary" text-color="white">
                <q-icon :name="ctrl.getItemIcon(item.tipo)" />
              </q-avatar>
              <div class="col q-ml-md">
                <div class="text-h6">{{ item.nome }}</div>
                <div class="text-caption text-grey-6">{{ item.tipo }} - {{ item.raridade }}</div>
              </div>
              <q-badge v-if="item.magico" color="purple" label="Mágico" />
            </div>
            <div v-if="item.descricao" class="q-mt-sm text-body2">
              {{ item.descricao }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              size="sm"
              icon="content_copy"
              label="Duplicar"
              @click="ctrl.duplicarItem(item)"
            />
            <q-btn flat size="sm" icon="edit" label="Editar" @click="ctrl.editarItem(item)" />
            <q-btn
              flat
              size="sm"
              icon="delete"
              color="negative"
              label="Excluir"
              @click="ctrl.confirmarExclusaoItem(item)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SetupPage_PageCtrl } from '../SetupPage_PageCtrl';

interface Props {
  ctrl: SetupPage_PageCtrl;
}

defineProps<Props>();
</script>

<style scoped>
.item-card {
  height: 100%;
  transition: transform 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
}
</style>
