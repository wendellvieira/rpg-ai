# Levantamento de Arquivos para Refatoração - Versão 1

> **Status:** Análise completa - Tarefas definidas no `version-1.md`  
> **Total:** 80+ arquivos | **47 tarefas** identificadas  
> **Referência:** Ver `version-1.md` para detalhes das refatorações

## Services (.ts) - 🔧 Refatoração para Classes Estáticas

- [x] /src/services/PWAService.ts → Utils/PWAHelper.ts
- [x] /src/services/IAPersonagem.ts → Services/IAPersonagem.ts (manter)
- [x] /src/services/BackupService.ts → **TAREFA #7** Classes Estáticas
- [x] /src/services/ContextBuilder.ts → Services/ContextBuilder.ts (manter)
- [x] /src/services/PersistenceManager.ts → Services/PersistenceManager.ts (manter)
- [x] /src/services/ImageGenerationService_new.ts → Consolidar com ImageGenerationService.ts
- [x] /src/services/ThemeService.ts → **TAREFA #15** Utils/ThemeHelper.ts
- [x] /src/services/OpenAIService.ts → **TAREFA #7** Classes Estáticas
- [x] /src/services/NotificationService.ts → Utils/NotificationHelper.ts
- [x] /src/services/ImageGenerationService.ts → Services/ImageGenerationService.ts
- [x] /src/services/DatabaseService.ts → **TAREFA #7** Classes Estáticas

## Pages (.vue) - 🏗️ TAREFA #1 - Reestruturação CRÍTICA

- [x] /src/pages/SetupPage.vue → **Setup/** (Page + PageCtrl)
- [x] /src/pages/GamePage.vue → **Game/** (Page + PageCtrl) - 1789 linhas!
- [x] /src/pages/ErrorNotFound.vue → **Error/** (Page + PageCtrl)
- [x] /src/pages/IndexPage.vue → **Index/** (Page + PageCtrl)

## Layouts (.vue) - 🎨 Layout Structure

- [x] /src/layouts/MainLayout.vue → Refatorar para usar componentes Base

## Components (.vue) - 🧩 TAREFAS #2-4 - Padronização

### 🔴 Modais (TAREFA #2) - Converter para padrão Modal + Controller

- [x] /src/components/CriarPersonagemDialog.vue → **Modals/CriarPersonagem/**
- [x] /src/components/EditarPersonagemDialog.vue → **Modals/EditarPersonagem/**
- [x] /src/components/ConfigurarAPIDialog.vue → **Modals/ConfigurarAPI/**
- [x] /src/components/ConjurarMagiaDialog.vue → **Modals/ConjurarMagia/**
- [x] /src/components/PrepararMagiasDialog.vue → **Modals/PrepararMagias/**
- [x] /src/components/CombateDialog.vue → **Modals/Combate/**
- [x] /src/components/ImportExportDialog.vue → **Modals/ImportExport/**
- [x] /src/components/TesteAtributoDialog.vue → **Modals/TesteAtributo/**
- [x] /src/components/EditarItemDialog.vue → **Modals/EditarItem/**
- [x] /src/components/NovoConhecimentoDialog.vue → **Modals/NovoConhecimento/**
- [x] /src/components/GerenciamentoItensDialog.vue → **Modals/GerenciamentoItens/**
- [x] /src/components/EditarMapaDialog.vue → **Modals/EditarMapa/**
- [x] /src/components/EditarMagiaDialog.vue → **Modals/EditarMagia/**
- [x] /src/components/SlotsDialog.vue → **Modals/Slots/**

### 🟡 Componentes Complexos (TAREFA #3) - Component + Controller

- [x] /src/components/MapaViewer.vue → **Complex/MapaViewer/**
- [x] /src/components/MapaCanvas.vue → **Complex/MapaCanvas/** (Controller)
- [x] /src/components/CatalogoMagias.vue → **Complex/CatalogoMagias/** (Controller)
- [x] /src/components/InventarioViewer.vue → **Complex/InventarioViewer/** (Controller)
- [x] /src/components/CatalogoMagiasSimples.vue → **Complex/CatalogoMagiasSimples/**

### 🟢 Componentes de Jogo - Reorganizar

- [x] /src/components/AtributoEditor.vue → **Game/AtributoEditor/**
- [x] /src/components/ConhecimentoEditor.vue → **Game/ConhecimentoEditor/**
- [x] /src/components/PersonagemCard.vue → **Game/PersonagemCard/**
- [x] /src/components/IniciativaCombate.vue → **Game/IniciativaCombate/**
- [x] /src/components/TurnoIndicator.vue → **Game/TurnoIndicator/**
- [x] /src/components/MensagemChat.vue → **Game/MensagemChat/**

### 🔵 Componentes de Layout/UI - Base Components

- [x] /src/components/PWAInstallButton.vue → **Layout/PWAInstallButton/**
- [x] /src/components/SplitterLayout.vue → **Layout/SplitterLayout/**
- [x] /src/components/EssentialLink.vue → **Layout/EssentialLink/**
- [x] /src/components/ThemeSelector.vue → **Layout/ThemeSelector/**

## Classes (.ts) - 🎯 TAREFA #9 - Melhorias nas Classes de Domínio

### 🔴 Consolidação Urgente

- [x] /src/classes/SistemaTurnos.ts → **Arquivo definitivo**
- [x] /src/classes/SistemaTurnos_fixed.ts → **REMOVER** (consolidar)
- [x] /src/classes/SistemaTurnos_new.ts → **REMOVER** (consolidar)
- [x] /src/classes/SistemaTurnos_temp.ts → **REMOVER** (consolidar)

### 🟡 Adaptação para Padrão Reativo

- [x] /src/classes/Personagem.ts → **Reactive Pattern** (TAREFA #9)
- [x] /src/classes/SessaoJogo.ts → **Reactive Pattern** (TAREFA #9)

### 🟢 Classes de Itens - Manter Estrutura

- [x] /src/classes/Arma.ts → Classes/Arma.ts
- [x] /src/classes/Armadura.ts → Classes/Armadura.ts
- [x] /src/classes/Consumivel.ts → Classes/Consumivel.ts
- [x] /src/classes/Item.ts → Classes/Item.ts
- [x] /src/classes/Magia.ts → Classes/Magia.ts

### 🟢 Classes de Sistema - Manter Estrutura

- [x] /src/classes/Atributos.ts → Classes/Atributos.ts
- [x] /src/classes/CombateSimples.ts → Classes/CombateSimples.ts
- [x] /src/classes/Dados.ts → Classes/Dados.ts
- [x] /src/classes/Inventario.ts → Classes/Inventario.ts
- [x] /src/classes/Mapa.ts → Classes/Mapa.ts
- [x] /src/classes/SistemaCombate.ts → Classes/SistemaCombate.ts

## MCP (.ts) - 🔌 Model Context Protocol - Manter Estrutura

- [x] /src/mcp/MCPFunctions.ts → mcp/MCPFunctions.ts
- [x] /src/mcp/MCPHandler.ts → mcp/MCPHandler.ts
- [x] /src/mcp/MCPTypes.ts → mcp/MCPTypes.ts

## Stores (.ts) - 🗃️ TAREFA #5-6 - Conversão para Padrão de Classes

- [x] /src/stores/configStore.ts → **TAREFA #5** stores/modules/config/ (Config_Store + Config_Data)
- [x] Stores faltantes identificadas:
  - [x] **sessaoStore** → **TAREFA #5** stores/modules/sessao/ (Sessao_Store + Sessao_Data)
  - [x] **personagemStore** → **TAREFA #5** stores/modules/personagem/ (Personagem_Store + Personagem_Data)

### 🔴 TAREFA #6 - Implementar Entity-Document Pattern

- [x] **Personagens Entity-Document** → stores/modules/personagens/ (Personagens_Entity.Store + Personagem_Doc)
- [x] **Sessões Entity-Document** → stores/modules/sessoes/ (Sessoes_Entity.Store + Sessao_Doc)

## Router (.ts) - 🛣️ Configuração de Rotas

- [x] /src/router/index.ts → router/index.ts (manter)
- [x] /src/router/routes.ts → router/routes.ts (atualizar paths das páginas)

## Composables (.ts) - 🔄 TAREFA #15 - Acessibilidade

- [x] /src/composables/useAccessibility.ts → **TAREFA #15** Expandir composable

## Boot (.ts) - 🚀 Inicialização

- [x] /src/boot/axios.ts → boot/axios.ts (manter)

## Root Files (.ts/.vue) - 🌱 Arquivos Raiz

- [x] /src/App.vue → **TAREFA #16** Aplicar diretrizes de imports
- [x] /src/env.d.ts → env.d.ts (manter)

## Config Files (.ts) - ⚙️ TAREFA #16 - Configuração e Build

- [x] /quasar.config.ts → quasar.config.ts (revisar)
- [x] /tsconfig.json → tsconfig.json (revisar)
- [x] /eslint.config.js → **TAREFA #16** Aplicar diretrizes de imports
- [x] /postcss.config.js → postcss.config.js (manter)

---

## 🎯 RESUMO DE PRIORIDADES - ORDEM CORRETA DE EXECUÇÃO

### 🔴 **FASE 1 - FUNDAÇÃO** (Base para tudo - EXECUTAR PRIMEIRO)

1. **TAREFA #4** - Criar componentes Base (Input, Btn, Select)
2. **TAREFA #13** - Criar helper Deferred
3. **TAREFA #22** - 🎨 Sistema de Layout Grid (components/Layout/Space)
4. **TAREFA #23** - 🎨 Integração do Tailwind CSS
5. **TAREFA #8** - Migrar funções utilitárias para /src/utils/

### 🟡 **FASE 2 - SERVICES & CORE** (Lógica de negócio)

6. **TAREFA #7** - Services refactoring (Classes Estáticas)
7. **TAREFA #20** - 🧠 Sistema de Prompts Centralizado (PromptEngine)
8. **TAREFA #5** - Conversão das stores principais
9. **TAREFA #6** - Padrão Entity-Document

### 🟢 **FASE 3 - COMPONENTS & PAGES** (Interface)

10. **TAREFA #1** - GamePage_PageCtrl (1789 linhas!)
11. **TAREFA #18** - 🏗️ Separação das Tabs de Configuração
12. **TAREFA #2** - Refatoração dos modais (14 modais)
13. **TAREFA #3** - Componentes complexos
14. **TAREFA #10** - Reorganização de pastas

### � **FASE 4 - FEATURES & POLISH** (Funcionalidades extras)

15. **TAREFA #19** - 🤖 Criação Rápida com IA nos Modais
16. **TAREFA #9** - Consolidação SistemaTurnos
17. **TAREFA #11** - Definitions files
18. **TAREFA #14** - Validação Zod
19. **TAREFA #21** - 🌍 Internacionalização (Código → Inglês, UI → Português)

### � **FASE 5 - FINALIZAÇÃO** (Documentação e otimização)

20. **TAREFA #16** - JSDoc documentation
21. **TAREFA #17** - Performance optimizations
22. **TAREFA #15** - Accessibility improvements

### 🆕 **NOVAS TAREFAS IDENTIFICADAS** (Infraestrutura CSS/Layout)

22. **TAREFA #22** - 🎨 Sistema de Layout Grid Próprio
23. **TAREFA #23** - � Integração do Tailwind CSS

**Total de arquivos para refatoração:** 80+ arquivos  
**Total de tarefas:** **53 tarefas** (47 originais + 6 novas)  
**Status:** ✅ Mapeamento completo + Ordem de execução definida - Pronto para execução sequencial
