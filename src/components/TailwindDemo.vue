<template>
  <div class="container-rpg py-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
      🎨 Demo Tailwind + Quasar Integration
    </h1>

    <!-- Seção de Botões -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Botões com Tailwind + Quasar</h2>
      <div class="flex flex-wrap gap-4">
        <!-- Botão Primário -->
        <QBtn :class="primaryButtonClasses" @click="showNotification('primary')">
          Botão Primário
        </QBtn>

        <!-- Botão Secundário -->
        <QBtn :class="secondaryButtonClasses" @click="showNotification('secondary')">
          Botão Secundário
        </QBtn>

        <!-- Botão Outline -->
        <QBtn :class="outlineButtonClasses" @click="showNotification('outline')">
          Botão Outline
        </QBtn>
      </div>
    </section>

    <!-- Seção de Cards -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Cards RPG</h2>

      <Grid cols="3" gap="lg" class="mb-6">
        <GridItem v-for="card in demoCards" :key="card.id">
          <QCard :class="demoCardClasses">
            <QCardSection class="card-rpg-header">
              <div class="flex items-center gap-3">
                <QIcon :name="card.icon" class="text-primary-600" size="24px" />
                <h3 class="text-lg font-semibold">{{ card.title }}</h3>
              </div>
            </QCardSection>

            <QCardSection class="card-rpg-body">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                {{ card.description }}
              </p>
            </QCardSection>

            <QCardActions class="card-rpg-footer justify-end">
              <QBtn :class="cardButtonClasses" @click="selectCard(card)"> Selecionar </QBtn>
            </QCardActions>
          </QCard>
        </GridItem>
      </Grid>
    </section>

    <!-- Seção de Inputs -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Inputs Estilizados</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QInput
          v-model="demoForm.name"
          label="Nome do Personagem"
          :class="demoInputClasses"
          :error="nameError"
          :error-message="nameErrorMessage"
        />

        <QSelect
          v-model="demoForm.class"
          :options="classOptions"
          label="Classe"
          :class="demoInputClasses"
        />
      </div>
    </section>

    <!-- Seção de Sistema de Layout -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Sistema de Layout</h2>

      <!-- Stack Layout -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-3">Stack (Vertical)</h3>
        <Stack gap="md" class="bg-gray-100 dark:bg-dark-800 p-4 rounded-lg">
          <div class="bg-primary-100 dark:bg-primary-900/30 p-3 rounded">Item 1</div>
          <div class="bg-secondary-100 dark:bg-secondary-900/30 p-3 rounded">Item 2</div>
          <div class="bg-accent-100 dark:bg-accent-900/30 p-3 rounded">Item 3</div>
        </Stack>
      </div>

      <!-- Cluster Layout -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-3">Cluster (Horizontal)</h3>
        <Cluster gap="md" class="bg-gray-100 dark:bg-dark-800 p-4 rounded-lg">
          <div class="bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded">Tag 1</div>
          <div class="bg-secondary-100 dark:bg-secondary-900/30 px-4 py-2 rounded">Tag 2</div>
          <div class="bg-accent-100 dark:bg-accent-900/30 px-4 py-2 rounded">Tag 3</div>
          <div class="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded">Tag 4</div>
        </Cluster>
      </div>
    </section>

    <!-- Seção de Tema -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Controle de Tema</h2>
      <div class="flex items-center gap-4">
        <QToggle
          v-model="isDarkMode"
          label="Modo Escuro"
          :class="toggleClasses"
          @update:model-value="toggleTheme"
        />
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Tema atual: {{ isDarkMode ? 'Escuro' : 'Claro' }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { QBtn, QCard, QCardSection, QCardActions, QIcon, QInput, QSelect, QToggle } from 'quasar';
import { Grid, GridItem, Stack, Cluster } from 'src/components/Layout/Space';
import { useTailwindQuasar, useTailwindTheme } from 'src/composables/useTailwindQuasar';

// Composables
const {
  buttonClasses,
  cardClasses: tailwindCardClasses,
  inputClasses: tailwindInputClasses,
  combineClasses,
} = useTailwindQuasar();

const { applyTheme } = useTailwindTheme();

// Estado reativo
const isDarkMode = ref(false);
const demoForm = ref({
  name: '',
  class: null,
});

// Dados de demonstração
const demoCards = [
  {
    id: 1,
    icon: 'person',
    title: 'Personagem',
    description: 'Gerencie atributos, habilidades e equipamentos do seu personagem.',
  },
  {
    id: 2,
    icon: 'inventory',
    title: 'Inventário',
    description: 'Organize itens, armas e consumíveis de forma intuitiva.',
  },
  {
    id: 3,
    icon: 'auto_fix_high',
    title: 'Magias',
    description: 'Catalogue e use suas magias e habilidades especiais.',
  },
];

const classOptions = [
  { label: 'Guerreiro', value: 'warrior' },
  { label: 'Mago', value: 'mage' },
  { label: 'Ladino', value: 'rogue' },
  { label: 'Clérigo', value: 'cleric' },
];

// Computed properties
const nameError = computed(() => demoForm.value.name.length > 0 && demoForm.value.name.length < 3);
const nameErrorMessage = computed(() =>
  nameError.value ? 'Nome deve ter pelo menos 3 caracteres' : '',
);

// Classes Tailwind computadas
const primaryButtonClasses = computed(() =>
  buttonClasses({
    variants: {
      color: 'primary',
      variant: 'filled',
      size: 'md',
    },
    tailwind: 'font-semibold tracking-wide shadow-lg hover:shadow-xl',
  }),
);

const secondaryButtonClasses = computed(() =>
  buttonClasses({
    variants: {
      color: 'secondary',
      variant: 'filled',
      size: 'md',
    },
    tailwind: 'font-semibold',
  }),
);

const outlineButtonClasses = computed(() =>
  buttonClasses({
    variants: {
      color: 'primary',
      variant: 'outlined',
      size: 'md',
    },
    tailwind: 'font-semibold border-2',
  }),
);

const demoCardClasses = computed(() =>
  tailwindCardClasses({
    base: 'card-rpg',
    tailwind: 'transition-all duration-300 hover:scale-105 h-full',
  }),
);

const cardButtonClasses = computed(() => 'btn-rpg-primary text-sm px-4 py-1');

const demoInputClasses = computed(() =>
  combineClasses(
    'input-rpg',
    'transition-all duration-200',
    nameError.value ? 'border-red-500 focus:border-red-500' : '',
  ),
);

const toggleClasses = computed(() => 'text-primary-600');

// Métodos
const showNotification = (type: string) => {
  console.log(`Clicou no botão ${type}`);
  // Aqui seria integrado com o sistema de notificações
};

const selectCard = (card: (typeof demoCards)[0]) => {
  console.log('Card selecionado:', card);
};

const toggleTheme = (dark: boolean) => {
  applyTheme(dark);
  console.log('Tema alterado para:', dark ? 'escuro' : 'claro');
};

// Lifecycle
onMounted(() => {
  // Aplicar tema inicial
  applyTheme(isDarkMode.value);
});
</script>

<style lang="scss" scoped>
// Estilos específicos do componente podem ser adicionados aqui
// mas preferimos usar classes Tailwind sempre que possível
</style>
