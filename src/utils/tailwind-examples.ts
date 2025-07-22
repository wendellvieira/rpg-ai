/**
 * Exemplos de uso da integração Tailwind + Quasar
 *
 * Este arquivo demonstra como usar os composables e utilitários
 * criados para combinar Tailwind CSS com componentes Quasar.
 */

// Para usar os composables, importe no seu componente:
// import { useTailwindQuasar, useTailwindTheme } from 'src/composables/useTailwindQuasar';

// ======================================================================
// EXEMPLO 1: Botão com Tailwind + Quasar
// ======================================================================

/*
// No template Vue:
<template>
  <QBtn
    :class="buttonTailwindClasses"
    v-bind="buttonQuasarProps"
    @click="handleClick"
  >
    Botão Customizado
  </QBtn>
</template>

// No script:
<script setup lang="ts">
import { computed } from 'vue';
import { QBtn } from 'quasar';
import { useTailwindQuasar } from 'src/composables/useTailwindQuasar';

const { buttonClasses, createQuasarProps } = useTailwindQuasar();

const buttonConfig = {
  base: 'btn-rpg',
  variants: {
    size: 'md',
    color: 'primary',
    variant: 'filled',
    rounded: true,
  },
  tailwind: 'font-semibold tracking-wide',
  custom: 'min-w-[120px]',
};

const buttonTailwindClasses = computed(() => buttonClasses(buttonConfig));
const buttonQuasarProps = createQuasarProps(buttonConfig);

const handleClick = () => {
  console.log('Botão clicado!');
};
</script>
*/

// ======================================================================
// EXEMPLO 2: Input com validação e estilos
// ======================================================================

/*
<template>
  <QInput
    v-model="inputValue"
    :class="inputTailwindClasses"
    v-bind="inputQuasarProps"
    :error="hasError"
    :error-message="errorMessage"
    placeholder="Digite seu nome"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { QInput } from 'quasar';
import { useTailwindQuasar } from 'src/composables/useTailwindQuasar';

const { inputClasses, createQuasarProps, stateClasses } = useTailwindQuasar();

const inputValue = ref('');
const hasError = computed(() => inputValue.value.length < 3);
const errorMessage = computed(() =>
  hasError.value ? 'Nome deve ter pelo menos 3 caracteres' : ''
);

const inputConfig = computed(() => ({
  base: 'input-rpg',
  variants: {
    size: 'md',
  },
  tailwind: combineClasses(
    'font-medium',
    stateClasses({
      focus: 'ring-2 ring-primary-500',
      disabled: 'opacity-50 cursor-not-allowed',
    }),
    hasError.value ? 'border-red-500' : 'border-gray-300'
  ),
}));

const inputTailwindClasses = computed(() => inputClasses(inputConfig.value));
const inputQuasarProps = createQuasarProps(inputConfig);
</script>
*/

// ======================================================================
// EXEMPLO 3: Card responsivo com tema
// ======================================================================

/*
<template>
  <QCard :class="cardTailwindClasses">
    <QCardSection class="card-rpg-header">
      <div class="text-h6 font-semibold">{{ title }}</div>
    </QCardSection>

    <QCardSection class="card-rpg-body">
      <p :class="textClasses">{{ content }}</p>
    </QCardSection>

    <QCardActions class="card-rpg-footer">
      <QBtn
        :class="primaryButtonClasses"
        @click="onPrimary"
      >
        Ação Principal
      </QBtn>
      <QBtn
        :class="secondaryButtonClasses"
        @click="onSecondary"
      >
        Cancelar
      </QBtn>
    </QCardActions>
  </QCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { QCard, QCardSection, QCardActions, QBtn } from 'quasar';
import { useTailwindQuasar, useTailwindTheme } from 'src/composables/useTailwindQuasar';

interface Props {
  title: string;
  content: string;
  isDark?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false,
});

const {
  cardClasses,
  buttonClasses,
  responsiveClasses,
  transitionClasses
} = useTailwindQuasar();

const { getThemeClasses } = useTailwindTheme();

// Configurações do card
const cardConfig = computed(() => ({
  base: 'card-rpg',
  tailwind: combineClasses(
    responsiveClasses({
      mobile: 'w-full',
      tablet: 'max-w-md',
      desktop: 'max-w-lg',
    }),
    transitionClasses('all'),
    'hover:shadow-lg'
  ),
}));

// Classes do tema
const themeClasses = computed(() => getThemeClasses(props.isDark));

// Classes finais
const cardTailwindClasses = computed(() => cardClasses(cardConfig.value));

const textClasses = computed(() =>
  combineClasses(
    themeClasses.value.textSecondary,
    'leading-relaxed'
  )
);

const primaryButtonClasses = computed(() =>
  buttonClasses({
    variants: {
      color: 'primary',
      variant: 'filled',
      size: 'md'
    },
    tailwind: 'font-medium',
  })
);

const secondaryButtonClasses = computed(() =>
  buttonClasses({
    variants: {
      color: 'primary',
      variant: 'outlined',
      size: 'md'
    },
    tailwind: 'font-medium',
  })
);

// Emits
const emit = defineEmits<{
  primary: [];
  secondary: [];
}>();

const onPrimary = () => emit('primary');
const onSecondary = () => emit('secondary');
</script>
*/

// ======================================================================
// EXEMPLO 4: Layout Grid com Tailwind
// ======================================================================

/*
<template>
  <div :class="containerClasses">
    <Grid
      :cols="gridCols"
      :gap="gridGap"
      :class="gridTailwindClasses"
    >
      <GridItem
        v-for="item in items"
        :key="item.id"
        :col-span="item.span"
        :class="itemClasses"
      >
        <QCard :class="cardClasses">
          <!-- Conteúdo do item -->
        </QCard>
      </GridItem>
    </Grid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Grid, GridItem } from 'src/components/Layout/Space';
import { QCard } from 'quasar';
import { useTailwindQuasar } from 'src/composables/useTailwindQuasar';

const {
  combineClasses,
  responsiveClasses,
  cardClasses
} = useTailwindQuasar();

// Props
interface Item {
  id: string;
  span: number;
  content: string;
}

interface Props {
  items: Item[];
}

defineProps<Props>();

// Configurações responsivas
const gridCols = computed(() => ({
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
}));

const gridGap = 'md';

// Classes Tailwind
const containerClasses = computed(() =>
  combineClasses(
    'container-rpg', // Utilitário customizado
    'py-8'
  )
);

const gridTailwindClasses = computed(() =>
  responsiveClasses({
    mobile: 'gap-4',
    tablet: 'gap-6',
    desktop: 'gap-8',
  })
);

const itemClasses = computed(() =>
  'transition-transform duration-200 hover:scale-105'
);

const cardClasses = computed(() =>
  cardClasses({
    base: 'card-rpg',
    tailwind: 'h-full',
  })
);
</script>
*/

// ======================================================================
// EXEMPLO 5: Sistema de notificações com classes customizadas
// ======================================================================

/*
// Utilitário para notificações
export const useNotifications = () => {
  const { combineClasses } = useTailwindQuasar();

  const getNotificationClasses = (type: 'success' | 'error' | 'warning' | 'info') => {
    const baseClasses = 'badge-rpg px-4 py-3 rounded-lg font-medium';

    const typeClasses = {
      success: 'badge-success',
      error: 'badge-danger',
      warning: 'badge-warning',
      info: 'badge-primary',
    };

    return combineClasses(
      baseClasses,
      typeClasses[type],
      'animate-slide-up shadow-lg'
    );
  };

  return { getNotificationClasses };
};
*/

export default {
  // Este arquivo serve apenas como documentação e exemplos
  // Os exemplos comentados acima mostram como usar a integração
};
