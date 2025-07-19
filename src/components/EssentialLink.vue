<template>
  <q-item
    clickable
    @click="handleClick"
    :href="link"
    :target="link ? '_blank' : undefined"
    v-ripple
    :active="isActive"
    active-class="text-primary"
  >
    <q-item-section avatar v-if="icon">
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>

    <q-item-section side v-if="link">
      <q-icon name="open_in_new" size="xs" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export interface Props {
  title: string;
  caption?: string;
  icon?: string;
  link?: string;
  to?: string;
}

const props = withDefaults(defineProps<Props>(), {
  caption: '',
  icon: '',
  link: '',
  to: '',
});

const route = useRoute();
const router = useRouter();

const isActive = computed(() => {
  if (!props.to) return false;

  // Se o link tem query parameters, comparar a URL completa
  if (props.to.includes('?')) {
    return route.fullPath === props.to;
  }

  // Caso contrário, comparar apenas o path
  return route.path === props.to;
});

function handleClick(event: Event) {
  if (props.link) {
    // Se é um link externo, não fazer nada (o href já cuida)
    return;
  }

  if (props.to) {
    event.preventDefault();
    event.stopPropagation();
    void router.push(props.to);
    // Emitir evento para fechar o drawer se necessário
    document.dispatchEvent(new CustomEvent('close-drawer'));
  }
}
</script>

<style lang="scss" scoped>
.q-item {
  &.q-router-link--active {
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
}
</style>
