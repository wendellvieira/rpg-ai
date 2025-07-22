# Sistema de Layout Space

Este sistema substitui o sistema de cols/rows do Quasar por componentes modernos baseados em CSS Grid e Flexbox.

## Componentes Disponíveis

### Grid & GridItem

Layout baseado em CSS Grid com controle total sobre colunas, linhas e áreas.

```vue
<template>
  <!-- Grid básico -->
  <Grid cols="1fr 2fr 1fr" gap="md">
    <GridItem>Sidebar</GridItem>
    <GridItem>Conteúdo Principal</GridItem>
    <GridItem>Sidebar Direita</GridItem>
  </Grid>

  <!-- Grid responsivo -->
  <Grid cols="1fr" cols-tablet="1fr 1fr" cols-desktop="1fr 2fr 1fr" gap="sm" gap-desktop="lg">
    <GridItem col-span="2" col-span-desktop="1">
      Item que ocupa 2 colunas em tablet, 1 em desktop
    </GridItem>
  </Grid>

  <!-- Grid com áreas nomeadas -->
  <Grid
    cols="200px 1fr 200px"
    rows="auto 1fr auto"
    areas="[
      'header header header',
      'sidebar content aside',
      'footer footer footer'
    ]"
  >
    <GridItem area="header">Header</GridItem>
    <GridItem area="sidebar">Sidebar</GridItem>
    <GridItem area="content">Conteúdo</GridItem>
    <GridItem area="aside">Aside</GridItem>
    <GridItem area="footer">Footer</GridItem>
  </Grid>
</template>
```

### Flex & FlexItem

Layout baseado em Flexbox com controle sobre direção, alinhamento e wrap.

```vue
<template>
  <!-- Flex básico -->
  <Flex direction="row" gap="md" align="center">
    <FlexItem flex="1">Conteúdo flexível</FlexItem>
    <FlexItem>Conteúdo fixo</FlexItem>
  </Flex>

  <!-- Flex responsivo -->
  <Flex direction="column" direction-tablet="row" gap="sm" wrap>
    <FlexItem flex="1" flex-mobile="none">Item 1</FlexItem>
    <FlexItem flex="2" flex-mobile="none">Item 2</FlexItem>
  </Flex>
</template>
```

### Stack (Layout Vertical)

Componente especializado para layout vertical com gap consistente.

```vue
<template>
  <!-- Stack básico -->
  <Stack gap="lg">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </Stack>

  <!-- Stack com separadores -->
  <Stack gap="md" separator separator-color="#e0e0e0">
    <div>Seção 1</div>
    <div>Seção 2</div>
    <div>Seção 3</div>
  </Stack>

  <!-- Stack responsivo -->
  <Stack gap="sm" gap-desktop="lg" align="center" align-mobile="stretch">
    <div>Conteúdo</div>
  </Stack>
</template>
```

### Cluster (Layout Horizontal)

Componente especializado para layout horizontal com wrap automático.

```vue
<template>
  <!-- Cluster básico -->
  <Cluster gap="md" align="center">
    <button>Botão 1</button>
    <button>Botão 2</button>
    <button>Botão 3</button>
  </Cluster>

  <!-- Cluster com justificação -->
  <Cluster gap="sm" justify="space-between" align="center">
    <div>Esquerda</div>
    <div>Centro</div>
    <div>Direita</div>
  </Cluster>

  <!-- Cluster sem wrap -->
  <Cluster gap="xs" wrap="false" align="baseline">
    <span>Label:</span>
    <strong>Valor</strong>
  </Cluster>
</template>
```

## Props Comuns

### Gap (Espaçamento)

- `gap`: Espaçamento geral (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'`)
- `gap-x`: Espaçamento horizontal
- `gap-y`: Espaçamento vertical
- `gap-mobile`, `gap-tablet`, `gap-desktop`, `gap-wide`: Valores responsivos

### Alinhamento

- `align`: Alinhamento dos itens
- `justify`: Justificação dos itens (onde aplicável)
- Valores: `'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly'`

### Responsividade

Todos os componentes suportam props responsivas:

- `prop-mobile`: Para dispositivos móveis (0px+)
- `prop-tablet`: Para tablets (768px+)
- `prop-desktop`: Para desktop (1024px+)
- `prop-wide`: Para telas largas (1440px+)

## Valores de Gap

```scss
xs: 4px
sm: 8px
md: 16px (padrão)
lg: 24px
xl: 32px
none: 0
```

## Migração do Quasar

### Antes (Quasar)

```vue
<q-row class="q-gutter-md">
  <q-col cols="12" md="4">
    <div>Conteúdo</div>
  </q-col>
  <q-col cols="12" md="8">
    <div>Conteúdo</div>
  </q-col>
</q-row>
```

### Depois (Space System)

```vue
<Grid cols="1fr" cols-desktop="1fr 2fr" gap="md">
  <GridItem>Conteúdo</GridItem>
  <GridItem>Conteúdo</GridItem>
</Grid>
```

## Vantagens

1. **CSS Grid Nativo**: Controle total sobre layout bidimensional
2. **Flexbox Moderno**: Layout unidimensional com gap nativo
3. **Responsividade**: Props dedicadas para cada breakpoint
4. **Consistência**: Sistema de gap unificado
5. **Performance**: CSS nativo sem overhead do Quasar
6. **Flexibilidade**: Mais opções de customização
7. **Semântica**: Nomes de componentes descritivos (Stack, Cluster)
