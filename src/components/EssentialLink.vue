<template>
  <q-item
    clickable
    :to="to"
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
import { useRoute } from 'vue-router';

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

const isActive = computed(() => {
  if (!props.to) return false;
  return route.path === props.to;
});
</script>

<style lang="scss" scoped>
.q-item {
  &.q-router-link--active {
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
}
</style>
