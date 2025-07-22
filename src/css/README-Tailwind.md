# 🎨 Sistema Tailwind CSS + Quasar

Este documento detalha a integração entre Tailwind CSS e Quasar Framework no projeto RPG-AI, fornecendo um sistema de design consistente e moderno.

## 📁 Estrutura dos Arquivos

```
src/
├── css/
│   ├── tailwind.css          # Diretivas e classes customizadas
│   └── app.scss             # Import principal
├── composables/
│   └── useTailwindQuasar.ts # Hook de integração
└── utils/
    └── tailwind-examples.ts # Exemplos de uso
```

## 🎯 Configuração

### **1. Tailwind CSS**

- **Configuração**: `tailwind.config.js`
- **Tema customizado** com cores RPG
- **Breakpoints responsivos** consistentes
- **Sistema de espaçamento** baseado em gap
- **Tipografia** e sombras customizadas

### **2. PostCSS Integration**

- **Configurado** em `postcss.config.js`
- **Ordem correta**: Tailwind → Autoprefixer
- **Compatibilidade** com Quasar

### **3. Classes Customizadas**

Localização: `src/css/tailwind.css`

#### **Componentes (@layer components)**

- `.card-rpg` - Cards padronizados
- `.btn-rpg-*` - Botões em variações
- `.input-rpg` - Inputs consistentes
- `.modal-*` - Sistema de modais
- `.table-rpg-*` - Tabelas estilizadas
- `.badge-*` - Badges e tags

#### **Utilitários (@layer utilities)**

- `.center-content` - Centralização
- `.animate-*` - Animações customizadas
- `.interactive` - Estados de interação
- `.container-rpg` - Container responsivo
- `.grid-auto-*` - Grids automáticos

## 🛠️ Composable: useTailwindQuasar

### **Funções Principais**

```typescript
const {
  // Combinação de classes
  combineClasses,
  generateTailwindClasses,
  createQuasarProps,

  // Por componente
  buttonClasses,
  inputClasses,
  cardClasses,

  // Avançados
  responsiveClasses,
  stateClasses,
  transitionClasses,
} = useTailwindQuasar();
```

### **Exemplo de Uso - Botão**

```vue
<template>
  <QBtn :class="buttonTailwindClasses" v-bind="buttonQuasarProps"> Meu Botão </QBtn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTailwindQuasar } from 'src/composables/useTailwindQuasar';

const { buttonClasses, createQuasarProps } = useTailwindQuasar();

const buttonConfig = {
  variants: {
    size: 'md',
    color: 'primary',
    variant: 'filled',
  },
  tailwind: 'font-semibold shadow-lg',
};

const buttonTailwindClasses = computed(() => buttonClasses(buttonConfig));
const buttonQuasarProps = createQuasarProps(buttonConfig);
</script>
```

## 🎨 Sistema de Cores

### **Cores Principais**

- **Primary**: Azul (tons 50-950)
- **Secondary**: Amarelo/Ouro (tons 50-950)
- **Accent**: Rosa/Magenta (tons 50-950)
- **Dark**: Cinza escuro (tons 50-950)

### **Mapeamento Quasar → Tailwind**

```typescript
const COLOR_MAP = {
  primary: 'primary', // Quasar primary → Tailwind primary-*
  secondary: 'secondary', // Quasar secondary → Tailwind secondary-*
  positive: 'green', // Quasar positive → Tailwind green-*
  negative: 'red', // Quasar negative → Tailwind red-*
  warning: 'yellow', // Quasar warning → Tailwind yellow-*
  info: 'blue', // Quasar info → Tailwind blue-*
};
```

## 📱 Sistema Responsivo

### **Breakpoints**

```scss
'mobile': '0px',      // Extra small
'tablet': '768px',    // Medium
'desktop': '1024px',  // Large
'wide': '1440px',     // Extra large
```

### **Classes Responsivas**

```typescript
responsiveClasses({
  mobile: 'w-full text-sm',
  tablet: 'w-1/2 text-base',
  desktop: 'w-1/3 text-lg',
  wide: 'w-1/4 text-xl',
});
// Resultado: "w-full text-sm tablet:w-1/2 tablet:text-base desktop:w-1/3..."
```

## ⚡ Sistema de Gap

### **Valores Predefinidos**

```typescript
const GAP_VALUES = {
  none: '0', // 0px
  xs: '4px', // 4px
  sm: '8px', // 8px
  md: '16px', // 16px (padrão)
  lg: '24px', // 24px
  xl: '32px', // 32px
};
```

### **Uso com Layout Components**

```vue
<Grid gap="md" :cols="3">
  <GridItem>Item 1</GridItem>
  <GridItem>Item 2</GridItem>
  <GridItem>Item 3</GridItem>
</Grid>
```

## 🌙 Modo Escuro

### **Hook de Tema**

```typescript
const { applyTheme, getThemeClasses } = useTailwindTheme();

// Aplicar tema
applyTheme(true); // modo escuro
applyTheme(false); // modo claro

// Classes do tema
const themeClasses = getThemeClasses(isDark);
// {
//   background: 'bg-dark-900' | 'bg-white',
//   surface: 'bg-dark-800' | 'bg-gray-50',
//   text: 'text-gray-100' | 'text-gray-900',
//   ...
// }
```

### **Classes de Modo Escuro**

```css
/* Automático com 'dark:' prefix */
.my-element {
  @apply bg-white text-gray-900;
  @apply dark:bg-dark-800 dark:text-gray-100;
}
```

## 🎭 Animações

### **Animações Predefinidas**

- `animate-fade-in` - Fade in suave
- `animate-slide-up` - Slide de baixo para cima
- `animate-bounce-soft` - Bounce suave
- `animate-pulse-glow` - Pulse com brilho

### **Estados de Interação**

```typescript
stateClasses({
  hover: 'bg-gray-100 scale-105',
  focus: 'ring-2 ring-primary-500',
  active: 'scale-95',
  disabled: 'opacity-50 cursor-not-allowed',
});
```

## 📋 Componentes de Exemplo

### **Card Completo**

```vue
<template>
  <QCard :class="cardClasses">
    <QCardSection class="card-rpg-header">
      <h3 class="text-h6 font-semibold">Título</h3>
    </QCardSection>

    <QCardSection class="card-rpg-body">
      <p class="text-gray-600 dark:text-gray-400">Conteúdo</p>
    </QCardSection>

    <QCardActions class="card-rpg-footer justify-end">
      <QBtn class="btn-rpg-primary">Confirmar</QBtn>
    </QCardActions>
  </QCard>
</template>

<script setup lang="ts">
const cardClasses = 'card-rpg max-w-md mx-auto';
</script>
```

### **Input com Estados**

```vue
<template>
  <QInput v-model="value" :class="inputClasses" :error="hasError" label="Nome" />
</template>

<script setup lang="ts">
const inputClasses = computed(() =>
  combineClasses(
    'input-rpg',
    hasError.value ? 'input-rpg-error' : '',
    'transition-colors duration-200',
  ),
);
</script>
```

## 🔧 Configuração do VS Code

### **Extensões Recomendadas**

- **Tailwind CSS IntelliSense** - Autocomplete
- **PostCSS Language Support** - Syntax highlighting

### **Settings.json**

```json
{
  "tailwindCSS.includeLanguages": {
    "vue": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["combineClasses\\(([^)]*)\\)", "'([^']*)'"],
    ["Classes\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

## 🚀 Migração de Componentes Quasar

### **Antes (Só Quasar)**

```vue
<QBtn color="primary" size="md" unelevated class="q-px-lg">
  Botão
</QBtn>
```

### **Depois (Quasar + Tailwind)**

```vue
<QBtn
  :class="
    buttonClasses({
      variants: { color: 'primary', size: 'md', variant: 'filled' },
      tailwind: 'px-8 font-medium shadow-md hover:shadow-lg',
    })
  "
>
  Botão
</QBtn>
```

## 📚 Referências

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Quasar Framework](https://quasar.dev/)
- [PostCSS](https://postcss.org/)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

---

**✨ Integração completa entre Tailwind CSS e Quasar para desenvolvimento rápido e consistente!**
