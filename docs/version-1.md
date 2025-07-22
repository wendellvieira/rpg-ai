# Tarefas de Refatoração - Versão 1.0

Este documento contém todas as tarefas necessárias para refatorar o projeto RPG-AI e alinhar com as diretrizes de arquitetura estabelecidas.

## 📋 Status: Análise Completa + Melhorias UX

**Total de arquivos analisados:** 80+ arquivos  
**Tarefas identificadas:** **53 tarefas** (47 originais + 6 novas melhorias)  
**Prioridade:** Alta (requisito para versão 1.0)

---

## 🏗️ ARQUITETURA GERAL

### 1. Reestruturação de Páginas

- [ ] **Refatoração da GamePage:**
  - **Description:** Separar a lógica massiva da GamePage.vue (1789 linhas) em um GamePage_PageCtrl.ts seguindo o padrão estabelecido. A página atualmente mistura UI e lógica de negócio.
  - **Source:** `/src/pages/GamePage.vue`
  - **Destination:** `/src/pages/Game/`
  - **Files to Create:**
    - `GamePage_Page.vue` (apenas UI)
    - `GamePage_PageCtrl.ts` (toda a lógica)
    - `components/` (componentes específicos da GamePage):
      - `ResourceTabs.vue` - Abas verticais do painel esquerdo (personagens, itens, magias, combate, mapas)
      - `ChatInterface.vue` - Interface principal de chat com IAs no painel central
      - `MessageBubble.vue` - Componente para renderizar mensagens individuais do chat
      - `GameSplitter.vue` - Layout de divisão entre painel de recursos e chat
      - `ResourcePanel.vue` - Container do painel esquerdo com header e conteúdo das abas
      - `GameHeader.vue` - Cabeçalho da página de jogo com informações da sessão
      - `QuickActions.vue` - Barra de ações rápidas (dados, testes, combate)
      - `SessionInfo.vue` - Informações da sessão atual (nome, data, status)

- [ ] **Refatoração da SetupPage:**
  - **Description:** Aplicar o mesmo padrão Page + PageCtrl para a página de configuração
  - **Source:** `/src/pages/SetupPage.vue`
  - **Destination:** `/src/pages/Setup/`
  - **Files to Create:**
    - `SetupPage_Page.vue`
    - `SetupPage_PageCtrl.ts`
    - `components/` (componentes específicos da SetupPage):
      - `SetupTabs.vue` - Sistema de abas horizontais (personagens, itens, mapas, configurações)
      - `PersonagensTab.vue` - Aba de gerenciamento de personagens com lista e ações
      - `ItensTab.vue` - Aba de gerenciamento de itens e equipamentos
      - `MapasTab.vue` - Aba de criação e edição de mapas
      - `ConfigTab.vue` - Aba de configurações do sistema (API, tema, preferências)
      - `ResourceCounter.vue` - Contador de recursos (ex: "5 personagens, 12 itens")
      - `SetupHeader.vue` - Cabeçalho da página com título e descrição
      - `QuickAddButtons.vue` - Botões de ação rápida (Novo Personagem, Novo Item, etc)
      - `ResourceGrid.vue` - Grid responsivo para exibir cards de recursos

- [ ] **Refatoração da IndexPage:**
  - **Description:** Aplicar padrão para página inicial
  - **Source:** `/src/pages/IndexPage.vue`
  - **Destination:** `/src/pages/Index/`
  - **Files to Create:**
    - `IndexPage_Page.vue`
    - `IndexPage_PageCtrl.ts`
    - `components/` (componentes específicos da IndexPage):
      - `WelcomeHeader.vue` - Cabeçalho de boas-vindas com logo e título do RPG-AI
      - `QuickActionCards.vue` - Cards de ações rápidas (Nova Sessão, Gerenciar Recursos, Configurações)
      - `ActionCard.vue` - Card individual de ação com ícone, título e descrição
      - `SavedSessions.vue` - Lista de sessões salvas com preview e informações
      - `SessionCard.vue` - Card individual de sessão com nome, data e ações (continuar, deletar)
      - `EmptyState.vue` - Estado vazio quando não há sessões salvas
      - `RecentActivity.vue` - Seção de atividade recente (últimas sessões, estatísticas)
      - `AppFeatures.vue` - Seção com destaque das funcionalidades principais do app
      - `GetStarted.vue` - Tutorial ou dicas para novos usuários

---

## 🧩 COMPONENTS REFACTORING

### 2. Padronização de Modais

- [ ] **CriarPersonagemDialog → Modal pattern:**
  - **Description:** Converter para o padrão de modal com controller próprio, incluindo métodos open/close com Deferred
  - **Source:** `/src/components/CriarPersonagemDialog.vue`
  - **Destination:** `/src/components/Modals/CriarPersonagem/`
  - **Files to Create:**
    - `CriarPersonagem.vue`
    - `CriarPersonagem_Ctrl.ts`

- [ ] **EditarPersonagemDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/EditarPersonagemDialog.vue`
  - **Destination:** `/src/components/Modals/EditarPersonagem/`
  - **Files to Create:**
    - `EditarPersonagem.vue`
    - `EditarPersonagem_Ctrl.ts`

- [ ] **ConfigurarAPIDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/ConfigurarAPIDialog.vue`
  - **Destination:** `/src/components/Modals/ConfigurarAPI/`
  - **Files to Create:**
    - `ConfigurarAPI.vue`
    - `ConfigurarAPI_Ctrl.ts`

- [ ] **ConjurarMagiaDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/ConjurarMagiaDialog.vue`
  - **Destination:** `/src/components/Modals/ConjurarMagia/`
  - **Files to Create:**
    - `ConjurarMagia.vue`
    - `ConjurarMagia_Ctrl.ts`

- [ ] **PrepararMagiasDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/PrepararMagiasDialog.vue`
  - **Destination:** `/src/components/Modals/PrepararMagias/`
  - **Files to Create:**
    - `PrepararMagias.vue`
    - `PrepararMagias_Ctrl.ts`

- [ ] **CombateDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/CombateDialog.vue`
  - **Destination:** `/src/components/Modals/Combate/`
  - **Files to Create:**
    - `Combate.vue`
    - `Combate_Ctrl.ts`

- [ ] **ImportExportDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/ImportExportDialog.vue`
  - **Destination:** `/src/components/Modals/ImportExport/`
  - **Files to Create:**
    - `ImportExport.vue`
    - `ImportExport_Ctrl.ts`

- [ ] **TesteAtributoDialog → Modal pattern:**
  - **Description:** Converter para padrão de modal com controller
  - **Source:** `/src/components/TesteAtributoDialog.vue`
  - **Destination:** `/src/components/Modals/TesteAtributo/`
  - **Files to Create:**
    - `TesteAtributo.vue`
    - `TesteAtributo_Ctrl.ts`

### 3. Componentes Complexos

- [ ] **MapaCanvas → Component + Controller:**
  - **Description:** Separar lógica complexa de canvas em controller dedicado
  - **Source:** `/src/components/MapaCanvas.vue`
  - **Destination:** `/src/components/Mapa/MapaCanvas/`
  - **Files to Create:**
    - `MapaCanvas.vue`
    - `MapaCanvas_Ctrl.ts`

- [ ] **CatalogoMagias → Component + Controller:**
  - **Description:** Separar lógica de catálogo em controller
  - **Source:** `/src/components/CatalogoMagias.vue`
  - **Destination:** `/src/components/Catalogo/CatalogoMagias/`
  - **Files to Create:**
    - `CatalogoMagias.vue`
    - `CatalogoMagias_Ctrl.ts`

- [ ] **InventarioViewer → Component + Controller:**
  - **Description:** Separar lógica de inventário
  - **Source:** `/src/components/InventarioViewer.vue`
  - **Destination:** `/src/components/Inventario/InventarioViewer/`
  - **Files to Create:**
    - `InventarioViewer.vue`
    - `InventarioViewer_Ctrl.ts`

### 4. Componentes Simples (Padronização de UI)

- [ ] **Criar componentes base Input:**
  - **Description:** Criar componente Input padronizado substituindo QInput direto
  - **Source:** `N/A`
  - **Destination:** `/src/components/Base/Input/`
  - **Files to Create:**
    - `Input.vue`

- [ ] **Criar componentes base Btn:**
  - **Description:** Criar componente Btn padronizado substituindo QBtn direto
  - **Source:** `N/A`
  - **Destination:** `/src/components/Base/Btn/`
  - **Files to Create:**
    - `Btn.vue`

- [ ] **Criar componentes base Select:**
  - **Description:** Criar componente Select padronizado substituindo QSelect direto
  - **Source:** `N/A`
  - **Destination:** `/src/components/Base/Select/`
  - **Files to Create:**
    - `Select.vue`

- [ ] **Substituir QInput por Input nos componentes:**
  - **Description:** Substituir todas as ocorrências de QInput pelo componente Input padronizado em todos os arquivos .vue
  - **Source:** `**/*.vue`
  - **Destination:** `**/*.vue`
  - **Files to Update:** Todos os componentes que usam QInput

- [ ] **Substituir QBtn por Btn nos componentes:**
  - **Description:** Substituir todas as ocorrências de QBtn pelo componente Btn padronizado
  - **Source:** `**/*.vue`
  - **Destination:** `**/*.vue`
  - **Files to Update:** Todos os componentes que usam QBtn

---

## 🗃️ STORES REFACTORING

### 5. Conversão para Padrão de Classes

- [ ] **ConfigStore → Padrão de Classe:**
  - **Description:** Converter useConfigStore para o padrão de classe com transformClass helper
  - **Source:** `/src/stores/configStore.ts`
  - **Destination:** `/src/stores/modules/config/`
  - **Files to Create:**
    - `Config_Store.ts`
    - `Config_Data.ts` (interfaces)

- [ ] **SessaoStore → Padrão de Classe:**
  - **Description:** Converter useSessaoStore para o padrão de classe
  - **Source:** Análise necessária (referenciado mas não visto)
  - **Destination:** `/src/stores/modules/sessao/`
  - **Files to Create:**
    - `Sessao_Store.ts`
    - `Sessao_Data.ts`

- [ ] **PersonagemStore → Padrão de Classe:**
  - **Description:** Converter usePersonagemStore para o padrão de classe
  - **Source:** Análise necessária (referenciado mas não visto)
  - **Destination:** `/src/stores/modules/personagem/`
  - **Files to Create:**
    - `Personagem_Store.ts`
    - `Personagem_Data.ts`

### 6. Implementação do Padrão Entidade-Documento

- [ ] **Personagens Entity-Document:**
  - **Description:** Implementar padrão Entidade-Documento para gerenciamento de personagens
  - **Source:** `Classes/Personagem.ts` + stores
  - **Destination:** `/src/stores/modules/personagens/`
  - **Files to Create:**
    - `Personagens_Entity.Store.ts`
    - `Personagem_Doc.ts`
    - `Personagem_Data.ts`

- [ ] **Sessões Entity-Document:**
  - **Description:** Implementar padrão para sessões de jogo
  - **Source:** `Classes/SessaoJogo.ts` + stores
  - **Destination:** `/src/stores/modules/sessoes/`
  - **Files to Create:**
    - `Sessoes_Entity.Store.ts`
    - `Sessao_Doc.ts`
    - `Sessao_Data.ts`

---

## 🔧 SERVICES REFACTORING

### 7. Padronização de Services

- [ ] **OpenAIService → Padrão de Classe Estática:**
  - **Description:** Converter OpenAIService para usar métodos estáticos ao invés de singleton
  - **Source:** `/src/services/OpenAIService.ts`
  - **Destination:** `/src/services/OpenAIService.ts`
  - **Changes:** Remover singleton pattern, usar métodos estáticos

- [ ] **DatabaseService → Padrão de Classe Estática:**
  - **Description:** Converter para métodos estáticos se for singleton
  - **Source:** `/src/services/DatabaseService.ts`
  - **Destination:** `/src/services/DatabaseService.ts`

- [ ] **BackupService → Padrão de Classe Estática:**
  - **Description:** Converter para métodos estáticos
  - **Source:** `/src/services/BackupService.ts`
  - **Destination:** `/src/services/BackupService.ts`

### 8. Utils Migration

- [ ] **Migrar funções utilitárias:**
  - **Description:** Mover funções utilitárias dos services para /src/utils/ com padrão de classe estática
  - **Source:** Services diversos
  - **Destination:** `/src/utils/`
  - **Files to Create:**
    - `FormatHelper.ts`
    - `ValidationHelper.ts`
    - `DateHelper.ts`

---

## 🎯 CLASSES REFACTORING

### 9. Melhorias nas Classes de Domínio

- [ ] **SistemaTurnos consolidação:**
  - **Description:** Consolidar os múltiplos arquivos SistemaTurnos em um único arquivo definitivo
  - **Source:**
    - `/src/classes/SistemaTurnos.ts`
    - `/src/classes/SistemaTurnos_fixed.ts`
    - `/src/classes/SistemaTurnos_new.ts`
    - `/src/classes/SistemaTurnos_temp.ts`
  - **Destination:** `/src/classes/SistemaTurnos.ts`
  - **Action:** Consolidar e remover arquivos temporários

- [ ] **Personagem → Reactive Pattern:**
  - **Description:** Adaptar classe Personagem para trabalhar com padrão reativo do controller
  - **Source:** `/src/classes/Personagem.ts`
  - **Destination:** `/src/classes/Personagem.ts`

- [ ] **SessaoJogo → Reactive Pattern:**
  - **Description:** Adaptar classe SessaoJogo para padrão reativo
  - **Source:** `/src/classes/SessaoJogo.ts`
  - **Destination:** `/src/classes/SessaoJogo.ts`

---

## 📁 ESTRUTURA DE ARQUIVOS

### 10. Reorganização de Pastas

- [ ] **Criar estrutura pages modular:**
  - **Description:** Criar estrutura de pastas para páginas seguindo o padrão
  - **Source:** `/src/pages/`
  - **Destination:**
    ```
    /src/pages/
    ├── Game/
    ├── Setup/
    ├── Index/
    └── Error/
    ```

- [ ] **Criar estrutura components modular:**
  - **Description:** Reorganizar componentes por categoria
  - **Source:** `/src/components/`
  - **Destination:**
    ```
    /src/components/
    ├── Base/           # Input, Btn, Select, etc
    ├── Modals/         # Todos os modais
    ├── Game/           # Componentes específicos do jogo
    ├── Layout/         # Componentes de layout
    └── Complex/        # Componentes complexos
    ```

### 11. Arquivos de Definição

- [ ] **Criar definitions para Game:**
  - **Description:** Centralizar constantes e opções da GamePage
  - **Source:** Constantes espalhadas em GamePage
  - **Destination:** `/src/pages/Game/definitions.ts`

- [ ] **Criar definitions para Classes/Raças:**
  - **Description:** Centralizar opções de classes e raças
  - **Source:** Arrays hardcoded nos componentes
  - **Destination:** `/src/data/definitions.ts`

---

## 🔄 PADRÕES DE COMUNICAÇÃO

### 12. Implementação do Padrão Connect

- [ ] **GamePage parent-child injection:**
  - **Description:** Implementar injeção de controllers filhos no GamePage_PageCtrl
  - **Source:** Nova implementação
  - **Destination:** `/src/pages/Game/GamePage_PageCtrl.ts`

- [ ] **Modal controllers injection:**
  - **Description:** Todos os modais devem receber controller via props ao invés de criar instância própria
  - **Source:** Modais diversos
  - **Destination:** Controllers dos modais

### 13. Deferred Pattern Implementation

- [ ] **Criar Deferred helper:**
  - **Description:** Criar helper Deferred para padrão de promessas dos modais
  - **Source:** Nova implementação
  - **Destination:** `/src/utils/Deferred.ts`

- [ ] **Implementar em todos os modais:**
  - **Description:** Todos os controllers de modal devem usar Deferred para open/close
  - **Source:** Controllers de modal
  - **Destination:** Controllers de modal

---

## 🧪 VALIDAÇÃO E TIPOS

### 14. Interfaces e Tipos

- [ ] **Consolidar interfaces:**
  - **Description:** Mover todas as interfaces para arquivos \_Data.ts apropriados
  - **Source:** Interfaces espalhadas
  - **Destination:** Arquivos `*_Data.ts` organizados

- [ ] **Implementar Zod validation:**
  - **Description:** Adicionar validação com Zod nos Doc classes
  - **Source:** Nova implementação
  - **Destination:** `*_Doc.ts` files

---

## 🎨 MELHORIAS DE UX/UI

### 15. Theme e Acessibilidade

- [ ] **ThemeService → ThemeHelper:**
  - **Description:** Converter ThemeService para padrão de helper estático
  - **Source:** `/src/services/ThemeService.ts`
  - **Destination:** `/src/utils/ThemeHelper.ts`

---

## 🔧 CONFIGURAÇÃO E BUILD

### 16. Linting e Code Quality

- [ ] **Aplicar diretrizes de imports:**
  - **Description:** Padronizar ordem de imports em todos os arquivos conforme diretrizes
  - **Source:** Todos os arquivos .ts/.vue
  - **Destination:** Todos os arquivos .ts/.vue

---

## 📊 PRIORIZAÇÃO

### 🔴 Prioridade CRÍTICA (Bloqueia outras tarefas)

1. Criar componentes Base (Input, Btn, Select)
2. Criar helper Deferred
3. Implementar GamePage_PageCtrl
4. Conversão das stores principais (Config, Sessao, Personagem)

### 🟡 Prioridade ALTA (Arquitetura essencial)

5. Refatoração dos modais principais
6. Padrão Entity-Document
7. Reorganização de pastas
8. Consolidação SistemaTurnos

### 🟢 Prioridade MÉDIA (Melhorias)

9. Services refactoring
10. Componentes complexos
11. Definitions files
12. Validação Zod
13. Aplicar diretrizes de imports

---

## ✅ CHECKLIST DE VALIDAÇÃO

Para cada tarefa completada, verificar:

- [ ] Seguiu convenções de nomenclatura
- [ ] Lógica separada da UI
- [ ] Imports organizados corretamente
- [ ] Tipos fortemente definidos
- [ ] Tratamento de erros implementado
- [ ] Padrões de comunicação respeitados

---

## 🆕 NOVAS TAREFAS IDENTIFICADAS

### 18. Reorganização Estrutural - Tio Bobby's Architecture™

- [ ] **Criar estrutura domain/entities:**
  - **Description:** Mover entidades puras do domínio para estrutura organizada por contexto
  - **Source:** `/src/classes/`
  - **Destination:** `/src/domain/entities/`
  - **Files to Create:**
    ```
    /src/domain/entities/
    ├── Character/
    │   ├── Personagem.ts (movido de classes/)
    │   └── Atributos.ts (movido de classes/)
    ├── Items/
    │   ├── Item.ts (movido de classes/)
    │   ├── Arma.ts (movido de classes/)
    │   ├── Armadura.ts (movido de classes/)
    │   └── Consumivel.ts (movido de classes/)
    └── Magic/
        └── Magia.ts (movido de classes/)
    ```

- [ ] **Criar estrutura services/Engine:**
  - **Description:** Reorganizar motores do jogo (lógica de sistema) em estrutura dedicada
  - **Source:** Classes de sistema em `/src/classes/` + `/src/mcp/`
  - **Destination:** `/src/services/Engine/`
  - **Files to Create:**
    ```
    /src/services/Engine/
    ├── Combat/
    │   ├── CombatEngine.ts (SistemaCombate renomeado)
    │   ├── TurnEngine.ts (SistemaTurnos consolidado)
    │   └── SimpleCombatEngine.ts (CombateSimples renomeado)
    ├── Dice/
    │   └── DiceEngine.ts (Dados.ts movido)
    ├── World/
    │   ├── MapEngine.ts (Mapa.ts movido)
    │   └── InventoryEngine.ts (Inventario.ts movido)
    ├── AI/
    │   ├── MCPEngine.ts (MCPHandler.ts movido e renomeado)
    │   ├── MCPTypes.ts (movido de mcp/)
    │   ├── MCPFunctions.ts (movido de mcp/)
    │   └── ContextEngine.ts (ContextBuilder.ts movido)
    └── Commands/
        ├── CommandRunner.ts (novo - executor principal)
        ├── CommandParser.ts (novo - parsing de comandos)
        └── commands/ (pasta de comandos individuais)
            ├── BaseCommand.ts (interface base)
            ├── TalkCommand.ts
            ├── AttackCommand.ts
            ├── CastCommand.ts
            ├── RollCommand.ts
            ├── MoveCommand.ts
            ├── HealCommand.ts
            └── AIControlCommand.ts
    ```

- [ ] **Criar estrutura services/Business:**
  - **Description:** Separar lógica de negócio e orchestração de services de infraestrutura
  - **Source:** Services existentes com lógica de negócio
  - **Destination:** `/src/services/Business/`
  - **Files to Create:**
    ```
    /src/services/Business/
    ├── SessionManager.ts (SessaoJogo.ts movido)
    ├── AIService.ts (OpenAIService.ts refatorado para orchestração)
    └── CharacterAIService.ts (IAPersonagem.ts movido se for business logic)
    ```

- [ ] **Criar estrutura services/Infrastructure:**
  - **Description:** Centralizar services de infraestrutura (persistência, PWA, etc)
  - **Source:** Services de infraestrutura existentes
  - **Destination:** `/src/services/Infrastructure/`
  - **Files to Keep/Move:**
    ```
    /src/services/Infrastructure/
    ├── DatabaseService.ts (mantido)
    ├── BackupService.ts (mantido)
    ├── NotificationService.ts (mantido)
    ├── PWAService.ts (mantido)
    └── PersistenceManager.ts (mantido)
    ```

- [ ] **Criar estrutura utils/ para helpers:**
  - **Description:** Mover utilitários e helpers estáticos para pasta dedicada
  - **Source:** Services que são na verdade utilities
  - **Destination:** `/src/utils/`
  - **Files to Create:**
    ```
    /src/utils/
    ├── ThemeHelper.ts (ThemeService.ts convertido para classe estática)
    ├── FormatHelper.ts (novo - funções de formatação)
    ├── ValidationHelper.ts (novo - validações)
    ├── DateHelper.ts (novo - manipulação de datas)
    └── Deferred.ts (helper para padrão de promessas)
    ```

### 19. Sistema de Comandos Avançado (Command Pattern)

- [ ] **Implementar Command Pattern base:**
  - **Description:** Criar sistema de comandos extensível usando Command Pattern com CommandRunner centralizado
  - **Source:** Planejamento em TODO-comandos-ia.md
  - **Destination:** `/src/services/Engine/Commands/`
  - **Files to Create:**
    - `CommandRunner.ts` - Executor e registry centralizado
    - `CommandParser.ts` - Parse de sintaxe `/` e `@npc`
    - `CommandContext.ts` - Contexto de execução de comandos
    - `commands/BaseCommand.ts` - Interface abstrata para comandos

- [ ] **Implementar comandos de comunicação:**
  - **Description:** Comandos básicos de fala e comunicação entre NPCs
  - **Source:** Especificação em TODO-comandos-ia.md
  - **Destination:** `/src/services/Engine/Commands/commands/`
  - **Files to Create:**
    - `TalkCommand.ts` - `/talk [msg]`, `/talk @npc [msg]`
    - `WhisperCommand.ts` - `/whisper @npc [msg]`
    - `OOCCommand.ts` - `/ooc [msg]` (Out of Character)

- [ ] **Implementar comandos de ação:**
  - **Description:** Comandos de combate e mecânicas de jogo
  - **Source:** Especificação em TODO-comandos-ia.md
  - **Destination:** `/src/services/Engine/Commands/commands/`
  - **Files to Create:**
    - `AttackCommand.ts` - `/attack @alvo [arma?]`
    - `CastCommand.ts` - `/cast [magia] [@alvo?]`
    - `RollCommand.ts` - `/roll [notação]`
    - `MoveCommand.ts` - `/move [local]`
    - `HealCommand.ts` - `/heal @alvo [quantidade]`
    - `DefendCommand.ts` - `/defend`

- [ ] **Implementar comandos de IA:**
  - **Description:** Comandos para controle e configuração de IA dos NPCs
  - **Source:** Especificação em TODO-comandos-ia.md
  - **Destination:** `/src/services/Engine/Commands/commands/`
  - **Files to Create:**
    - `AIControlCommand.ts` - `/ai_on @npc`, `/ai_off @npc`
    - `PersonalityCommand.ts` - `/personality @npc [descrição]`
    - `TaskCommand.ts` - `/task @npc [tarefa]`
    - `KnowledgeCommand.ts` - `/know @npc [informação]`

- [ ] **Integrar sistema de comandos com GamePage:**
  - **Description:** Modificar interface de chat para suportar auto-complete e execução de comandos
  - **Source:** Campo de input da GamePage
  - **Destination:** Componentes de chat da GamePage
  - **Changes:**
    - Detectar `/` e `@` para mostrar auto-complete
    - Parse de mensagem antes de enviar para IA
    - Executar comandos ao invés de enviar como mensagem normal
    - Sistema de feedback visual para comandos executados

### 20. Separação das Tabs de Configuração

### 20. Separação das Tabs de Configuração

- [ ] **Refatoração da estrutura de navegação:**
  - **Description:** Separar as tabs da GamePage. A guia de configuração deve conter apenas configurações. Personagens, Mapas, Itens e Magias devem ser páginas independentes
  - **Source:** `/src/pages/GamePage.vue` (seção de tabs)
  - **Destination:**
    - `/src/pages/Personagens/PersonagensPage.vue + PersonagensPage_PageCtrl.ts`
    - `/src/pages/Mapas/MapasPage.vue + MapasPage_PageCtrl.ts`
    - `/src/pages/Itens/ItensPage.vue + ItensPage_PageCtrl.ts`
    - `/src/pages/Magias/MagiasPage.vue + MagiasPage_PageCtrl.ts`
    - `/src/pages/Configuracoes/ConfiguracoesPage.vue + ConfiguracoesPage_PageCtrl.ts`
  - **Router Updates:** Adicionar rotas para as novas páginas
  - **Navigation:** Implementar menu de navegação principal

### 21. Criação Rápida com IA nos Modais

### 21. Criação Rápida com IA nos Modais

- [ ] **Implementar botão "Criar com IA" em todos os modais:**
  - **Description:** Adicionar funcionalidade de criação rápida usando IA em todos os modais de criação/edição
  - **Source:** Todos os modais de criação
  - **Destination:**
    - `CriarPersonagem_Ctrl.ts` → `createWithAI()` method
    - `EditarItem_Ctrl.ts` → `generateWithAI()` method
    - `EditarMagia_Ctrl.ts` → `generateWithAI()` method
    - `EditarMapa_Ctrl.ts` → `generateWithAI()` method
  - **Integration:** Conectar com PromptEngine centralizado
  - **UI:** Adicionar botão "✨ Criar com IA" nos modais

### 22. Sistema de Prompts Centralizado (PromptEngine)

### 22. Sistema de Prompts Centralizado (PromptEngine)

- [ ] **Criar arquitetura centralizada para prompts de IA:**
  - **Description:** Centralizar todas as instruções para agentes IA em um sistema modular e extensível
  - **Source:** Prompts espalhados nos services
  - **Destination:** `/src/services/Engine/AI/prompts/`
  - **Files to Create:**
    ```
    /src/services/Engine/AI/prompts/
    ├── PromptEngine.ts              # Engine principal
    │   ├── exec()                   # Executa prompt
    │   └── appendGlobalMiddle()     # Adiciona contexto global
    ├── CreateCharacter_Prompt.ts    # Prompt de criação de personagem
    │   ├── toString()               # Gera prompt final
    │   ├── variables               # Variáveis do prompt
    │   └── appendMiddle()          # Adiciona contexto específico
    ├── CreateItem_Prompt.ts        # Prompt de criação de item
    ├── CreateMagic_Prompt.ts       # Prompt de criação de magia
    ├── CreateMap_Prompt.ts         # Prompt de criação de mapa
    └── BasePrompt.ts               # Classe base para prompts
    ```
  - **Pattern:** Cada prompt é uma classe com métodos padronizados
  - **Integration:** Todos os services de IA devem usar PromptEngine

### 23. Internacionalização (Código → Inglês, UI → Português)

- [ ] **Padronizar idiomas no projeto:**
  - **Description:** Todo código (variáveis, métodos, classes, arquivos) em inglês. Todos os textos de UI em português via sistema de i18n
  - **Source:** Todo o projeto
  - **Destination:**
    - Refatorar nomes de variáveis, métodos e classes para inglês
    - Criar sistema i18n para textos de UI
    - `/src/i18n/pt-BR.ts` para traduções
  - **Examples:**

    ```typescript
    // ANTES (misturado)
    criarPersonagem() → createCharacter()
    personagemParaEditar → characterToEdit
    mostrarDialogDados → showDiceDialog

    // DEPOIS (código inglês + UI português)
    createCharacter() // método em inglês
    $t('buttons.createCharacter') // UI em português via i18n
    ```

### 23. Internacionalização (Código → Inglês, UI → Português)

- [ ] **Padronizar idiomas no projeto:**
  - **Description:** Todo código (variáveis, métodos, classes, arquivos) em inglês. Todos os textos de UI em português via sistema de i18n
  - **Source:** Todo o projeto
  - **Destination:**
    - Refatorar nomes de variáveis, métodos e classes para inglês
    - Criar sistema i18n para textos de UI
    - `/src/i18n/pt-BR.ts` para traduções
  - **Examples:**

    ```typescript
    // ANTES (misturado)
    criarPersonagem() → createCharacter()
    personagemParaEditar → characterToEdit
    mostrarDialogDados → showDiceDialog

    // DEPOIS (código inglês + UI português)
    createCharacter() // método em inglês
    $t('buttons.createCharacter') // UI em português via i18n
    ```

  - **Scope:** Refatorar ~80% dos arquivos do projeto
  - **Tools:** Vue-i18n para gerenciamento de traduções

### 24. Sistema de Layout Grid Próprio

- [ ] **Criar sistema de layout próprio usando CSS Grid:**
  - **Description:** Substituir o sistema de colunas do Quasar por um sistema próprio baseado em CSS Grid com gap. O sistema do Quasar é limitado e problemático.
  - **Source:** Sistema de cols/rows do Quasar espalhado pelo projeto
  - **Destination:** `/src/components/Layout/Space/`
  - **Files to Create:**
    ```
    /src/components/Layout/Space/
    ├── Grid.vue           # Container principal com display: grid
    ├── GridItem.vue       # Item do grid
    ├── Flex.vue           # Container flexbox
    ├── FlexItem.vue       # Item flexbox
    ├── Stack.vue          # Layout vertical com gap
    └── Cluster.vue        # Layout horizontal com gap
    ```
  - **Features:**
    - CSS Grid nativo com `grid-template-columns` e `gap`
    - Props dinâmicas para colunas: `cols="1fr 2fr 1fr"`
    - Responsividade: `cols-mobile="1fr" cols-tablet="1fr 1fr"`
    - Gap consistente: `gap="md"` (8px, 16px, 24px)
  - **Migration:** Substituir `q-col`, `q-row` em todo o projeto

### 25. Integração do Tailwind CSS

### 25. Integração do Tailwind CSS

- [ ] **Adicionar Tailwind CSS ao projeto:**
  - **Description:** Integrar Tailwind CSS para estilização dos componentes do Quasar e componentes customizados
  - **Source:** Nova integração
  - **Destination:** Configuração global
  - **Files to Create/Update:**
    ```
    /tailwind.config.js      # Configuração do Tailwind
    /src/css/tailwind.css    # Imports do Tailwind
    /quasar.config.ts        # Integração com Quasar
    ```
  - **Setup:**
    - `npm install -D tailwindcss postcss autoprefixer`
    - Configurar `tailwind.config.js` com tema personalizado
    - Integrar com PostCSS existente
    - Classes utilitárias para spacing, colors, typography
  - **Usage:** Estilizar componentes Quasar com classes Tailwind
  - **Benefits:** Utilitários CSS, design system consistente, responsividade

---

## 📊 PRIORIZAÇÃO ATUALIZADA - ORDEM CORRETA DE EXECUÇÃO

### 🔴 **FASE 1 - FUNDAÇÃO** (Base para tudo - EXECUTAR PRIMEIRO)

1. **TAREFA #18** - Reorganização Estrutural (domain/entities, services/Engine, services/Business, utils/)
2. **TAREFA #4** - Criar componentes Base (Input, Btn, Select)
3. **TAREFA #13** - Criar helper Deferred
4. **TAREFA #24** - Sistema de Layout Grid (components/Layout/Space)
5. **TAREFA #25** - Integração do Tailwind CSS
6. **TAREFA #8** - Migrar funções utilitárias para /src/utils/

### 🟡 **FASE 2 - SERVICES & CORE** (Lógica de negócio)

7. **TAREFA #7** - Services refactoring (Classes Estáticas)
8. **TAREFA #19** - Sistema de Comandos Base (CommandRunner, CommandParser)
9. **TAREFA #22** - Sistema de Prompts Centralizado (PromptEngine)
10. **TAREFA #5** - Conversão das stores principais
11. **TAREFA #6** - Padrão Entity-Document

### 🔵 **FASE 3 - COMPONENTS & PAGES** (Interface)

12. **TAREFA #1** - GamePage_PageCtrl (1789 linhas!)
13. **TAREFA #20** - Separação das Tabs de Configuração (Personagens, Itens, Magias, Mapas como páginas)
14. **TAREFA #2** - Refatoração dos modais (14 modais)
15. **TAREFA #3** - Componentes complexos
16. **TAREFA #10** - Reorganização de pastas

### � **FASE 4 - FEATURES & INTEGRAÇÃO** (Funcionalidades avançadas)

17. **TAREFA #19** - Comandos de Comunicação, Ação e IA (TalkCommand, AttackCommand, etc)
18. **TAREFA #21** - Criação Rápida com IA nos Modais
19. **TAREFA #9** - Consolidação SistemaTurnos
20. **TAREFA #11** - Definitions files
21. **TAREFA #14** - Validação Zod
22. **TAREFA #23** - Internacionalização (Código → Inglês, UI → Português)
23. **TAREFA #16** - Aplicar diretrizes de imports

---

**Estimativa total:** 🕐 **8-10 semanas** para desenvolvedor sênior (+3 semanas pelas tarefas estruturais e comandos)  
**Total de tarefas:** **58 tarefas** (50 originais + 8 novas da arquitetura Tio Bobby)  
**Arquivos impactados:** **~98% do projeto** (reorganização estrutural completa)  
**Breaking changes:** **Altos** (mudança completa de arquitetura + navegação + layout + comandos)  
**Benefícios:** **Arquitetura enterprise-grade, sistema de comandos avançado, IA integrada, separação clara de responsabilidades**

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS:**

1. **FASE 1** deve ser executada sequencialmente (reorganização estrutural é pré-requisito para tudo)
2. **Reorganização Estrutural** (TAREFA #18) é **CRÍTICA** - transforma completamente a arquitetura
3. **Componentes Base** são pré-requisito para toda UI
4. **Sistema de Comandos** representa salto qualitativo enorme no projeto
5. **Command Pattern** + **Engine Architecture** = Projeto enterprise-grade

**PROJETO TRANSFORMADO:** De código "estudantil" para **arquitetura empresarial** com separação clara de responsabilidades, sistema de comandos avançado e integração profunda com IA!

## 🏆 **RESULTADO FINAL:**

```
📁 src/
├── 📁 domain/entities/          # Entidades puras do domínio
├── 📁 services/Engine/          # Motores do jogo (Combat, AI, Commands, Dice)
├── 📁 services/Business/        # Lógica de negócio e orchestração
├── 📁 services/Infrastructure/  # Persistência, PWA, Backup
├── 📁 utils/                    # Helpers e utilitários estáticos
├── 📁 components/Base/          # Componentes padronizados
├── 📁 components/Layout/        # Sistema de Grid próprio
└── 📁 pages/                    # Páginas com pattern Page+PageCtrl
    ├── Game/                    # Chat de IA + comandos
    ├── Characters/              # Página de personagens
    ├── Items/                   # Página de itens
    ├── Spells/                  # Página de magias
    └── Maps/                    # Página de mapas
```

**UM PROJETO DIGNO DE PORTFÓLIO PROFISSIONAL!** 🚀
