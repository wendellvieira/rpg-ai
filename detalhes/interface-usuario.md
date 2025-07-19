# Interface do Usuário - Quasar Framework

## Layout Principal

### Estrutura Geral

```
AppHeader (q-header)
├── Título do Projeto
├── Menu de Navegação
└── Controles Globais

MainLayout (q-layout)
├── Sidebar (Opcional)
└── PageContainer (q-page-container)
    └── RouterView
```

## Páginas Principais

### 1. IndexPage (Página Inicial)

**Rota**: `/`
**Componentes**:

- Lista de sessões salvas
- Botão "Nova Sessão"
- Botão "Configurações"
- Import/Export de dados

### 2. SetupPage (Gerenciamento de Recursos)

**Rota**: `/setup`
**Componentes**:

- Gerenciador de Personagens
- Gerenciador de Itens
- Gerenciador de Mapas
- Configurações da API

### 3. GamePage (Sessão de Jogo)

**Rota**: `/game`
**Layout Dividido (QSplitter)**:

#### Área Esquerda (30%) - Recursos

```
QTabs
├── Tab "Personagens"
│   ├── Lista de personagens ativos
│   ├── Criação rápida
│   └── Drag & Drop para chat
├── Tab "Itens"
│   ├── Inventário global
│   ├── Criação de itens
│   └── Propriedades editáveis
└── Tab "Mapas"
    ├── Mapas disponíveis
    ├── Upload de imagens
    ├── **Geração por IA com Stability AI**
    │   ├── **Text-to-Image**: Geração completa de mapas
    │   │   ├── Prompt principal (ex: "dungeon subterrâneo com lagos de lava")
    │   │   ├── Templates pré-definidos (dungeon, floresta, cidade, batalha)
    │   │   ├── Estilos artísticos (realista, fantasia, pixel art, hand-drawn)
    │   │   ├── Configurações de qualidade (resolução, aspect ratio)
    │   │   └── Preview e refinamento de prompt
    │   ├── **Templates de Mapas**
    │   │   ├── Dungeons: corredores, salas, armadilhas, tesouros
    │   │   ├── Florestas: clareiras, rios, trilhas, cabanas
    │   │   ├── Cidades: ruas, praças, edifícios, mercados
    │   │   ├── Batalhas: terreno tático, obstáculos, elevações
    │   │   └── Personalizáveis com parâmetros específicos
    │   └── **Configurações Avançadas**
    │       ├── Seed para reproduzibilidade
    │       ├── Steps de iteração (velocidade vs qualidade)
    │       ├── CFG Scale (aderência ao prompt)
    │       └── Negative prompts (elementos a evitar)
    ├── **Modo Paint para Inpainting**
    │   ├── **Canvas de Desenho**
    │   │   ├── Ferramenta brush configurável (tamanho: 5-100px)
    │   │   ├── Opacidade da máscara (0-100%)
    │   │   ├── Modo de pintura (adicionar/remover máscara)
    │   │   ├── Undo/redo para correções
    │   │   ├── Zoom e pan para precisão
    │   │   └── Clear mask (limpar tudo)
    │   ├── **Prompt para Área Selecionada**
    │   │   ├── Textbox para descrever mudança
    │   │   ├── Exemplos: "cadeia de montanhas", "lago cristalino", "torre antiga"
    │   │   ├── Sugestões contextuais baseadas na área
    │   │   └── Histórico de prompts recentes
    │   ├── **Preview da Modificação**
    │   │   ├── Visualização antes/depois em split-screen
    │   │   ├── Overlay da máscara em cor diferenciada
    │   │   ├── Zoom para detalhes da área modificada
    │   │   └── Múltiplas variações para escolha
    │   ├── **Controles de Aplicação**
    │   │   ├── Botão "Gerar Preview" (não aplica ainda)
    │   │   ├── Botão "Aplicar Mudanças" (confirma edição)
    │   │   ├── Botão "Cancelar" (descarta modificações)
    │   │   └── Slider de intensidade da mudança (blend original/novo)
    │   └── **Configurações do Paint Mode**
    │       ├── Mask feathering (suavização das bordas)
    │       ├── Invert mask (inverter seleção)
    │       ├── Auto-mask suggestions (IA detecta objetos)
    │       └── Preserve edges (manter bordas nítidas)
    └── Configuração de cenário
```

#### Área Direita (70%) - Chat e Controles

```
QCard (Chat Area)
├── Histórico de mensagens (QVirtualScroll)
├── Indicador de turno atual
├── Status dos personagens
└── Controles do mestre

QCard (Controles)
├── Avançar turno
├── Adicionar personagem
├── Pausar/Retomar
└── Configurações da sessão
```

## Componentes Customizados

### PersonagemCard

```vue
<template>
  <q-card class="personagem-card">
    <q-card-section>
      <div class="row items-center">
        <q-avatar>{{ personagem.nome[0] }}</q-avatar>
        <div class="col q-ml-sm">
          <div class="text-h6">{{ personagem.nome }}</div>
          <div class="text-caption">{{ personagem.classe }} {{ personagem.raca }}</div>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="row q-gutter-sm">
        <q-linear-progress :value="personagem.hp / personagem.hpMaximo" color="red" size="10px" />
        <q-linear-progress :value="personagem.mp / personagem.mpMaximo" color="blue" size="10px" />
      </div>
    </q-card-section>

    <q-card-actions>
      <q-btn flat @click="editarPersonagem">Editar</q-btn>
      <q-btn flat @click="adicionarAoChat">Adicionar</q-btn>
    </q-card-actions>
  </q-card>
</template>
```

### MensagemChat

```vue
<template>
  <q-chat-message
    :text="[mensagem.conteudo]"
    :sent="mensagem.tipo === 'mestre'"
    :bg-color="corPorTipo(mensagem.tipo)"
    :text-color="corTexto(mensagem.tipo)"
    :name="mensagem.personagem"
    :stamp="formatarHora(mensagem.timestamp)"
  >
    <template v-slot:avatar>
      <q-avatar :color="corAvatar(mensagem.personagem)" text-color="white" size="32px">
        {{ inicialPersonagem(mensagem.personagem) }}
      </q-avatar>
    </template>
  </q-chat-message>
</template>
```

### AtributoEditor

```vue
<template>
  <q-card class="atributo-editor">
    <q-card-section>
      <div class="text-h6">Atributos</div>
    </q-card-section>

    <q-card-section>
      <div class="row q-gutter-md">
        <div v-for="(valor, atributo) in atributos" :key="atributo" class="col-4">
          <q-input
            :label="capitalize(atributo)"
            :model-value="valor"
            @update:model-value="atualizarAtributo(atributo, $event)"
            type="number"
            outlined
            dense
          >
            <template v-slot:append>
              <q-chip :label="calcularModificador(valor)" size="sm" color="primary" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
```

## Dialogs e Modais

### CriarPersonagemDialog

- Formulário completo de criação
- Seleção de raça e classe
- Distribuição de pontos de atributo
- Configuração de IA (prompt personalidade)

### ConfigurarAPIDialog

- Input para API Key OpenAI
- Seleção de modelo
- Teste de conectividade
- Configurações avançadas do MCP

### ImportExportDialog

- Export de dados em JSON
- Import de backup
- Validação de dados
- Preview antes de importar

## Responsividade

### Breakpoints

- **xs**: < 600px (mobile)
- **sm**: 600px - 1024px (tablet)
- **md**: 1024px - 1440px (desktop pequeno)
- **lg**: > 1440px (desktop grande)

### Adaptações Mobile

- Splitter vertical em telas pequenas
- Tabs reorganizadas
- Controles simplificados
- Gestos touch para ações rápidas

## Tema e Estilização

### Paleta de Cores

```scss
$primary: #1976d2; // Azul principal
$secondary: #424242; // Cinza escuro
$accent: #9c27b0; // Roxo para ações especiais
$positive: #21ba45; // Verde para sucessos
$negative: #c10015; // Vermelho para falhas
$warning: #f2c037; // Amarelo para avisos
```

### Variáveis Customizadas

```scss
$chat-bg: #f5f5f5;
$message-user: #e3f2fd;
$message-ai: #fff3e0;
$message-system: #f3e5f5;
$sidebar-width: 350px;
```

## Sistema de Mapas com IA

### Geração de Imagens (Text-to-Image)

**Funcionalidades:**

- Geração de mapas completos usando prompts
- Templates pré-definidos para diferentes biomas
- Configurações de resolução (512x512, 1024x1024, etc.)
- Estilos artísticos (realista, cartoon, pixel art)
- Integração com Stability AI API

**Interface:**

```vue
<q-card class="map-generation">
  <q-input v-model="prompt" label="Descreva o mapa..." />
  <q-select v-model="template" :options="mapTemplates" />
  <q-select v-model="style" :options="artStyles" />
  <q-btn @click="generateMap">Gerar Mapa</q-btn>
</q-card>
```

### Modo Paint (Inpainting)

**Funcionalidades:**

- Canvas interativo sobre o mapa existente
- Ferramentas de pintura (brush, eraser)
- Seleção de áreas para modificação
- Prompt específico para área selecionada
- Preview das mudanças antes de aplicar

**Casos de Uso:**

- Adicionar cadeias de montanhas
- Modificar biomas específicos
- Adicionar estruturas (castelos, pontes)
- Correções pontuais no mapa

**Interface:**

```vue
<q-card class="paint-mode">
  <canvas ref="paintCanvas" @mousedown="startPaint" />
  <q-toolbar>
    <q-btn icon="brush" @click="selectBrush" />
    <q-slider v-model="brushSize" :min="5" :max="50" />
    <q-input v-model="areaPrompt" label="O que adicionar na área?" />
    <q-btn @click="generateInpaint">Aplicar IA</q-btn>
  </q-toolbar>
</q-card>
```

### Templates de Mapas

**Biomas Disponíveis:**

- `dungeon`: "Top-down dungeon map, stone corridors, rooms, RPG style"
- `forest`: "Fantasy forest map from above, trees, paths, clearings"
- `city`: "Medieval fantasy city map, buildings, streets, town square"
- `mountain`: "Mountain range map, peaks, valleys, paths"
- `desert`: "Desert landscape map, dunes, oasis, ancient ruins"
- `coastal`: "Coastal region map, beaches, cliffs, harbors"

**Estilos Artísticos:**

- `fantasy-realistic`: Para mapas detalhados e realistas
- `hand-drawn`: Estilo manuscrito medieval
- `pixel-art`: Para jogos retro
- `isometric`: Visão isométrica 3D
