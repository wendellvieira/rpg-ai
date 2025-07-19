# TODO - Lista de Tarefas para Desenvolvimento

## ✅ PROGRESSO ATUAL - JULHO 2025

**FASE 1-4 CONCLUÍDA**: A estrutura básica do projeto está implementada com as funcionalidades core:

- ✅ **Classes Core**: Todas as entidades principais (Personagem, Atributos, Itens, Dados, SessaoJogo, etc.)
- ✅ **Sistema MCP**: Framework completo para integração com IAs
- ✅ **Interface Base**: Layout principal, componentes essenciais e diálogos
- ✅ **Stores**: Sistema de estado reativo com Pinia (configuração, sessão, personagem, item)
- ✅ **Persistência**: Estrutura básica implementada com LocalForage
- ✅ **Componentes**: Todos os componentes críticos criados e funcionais
- ✅ **Modal de Criação de Itens**: IMPLEMENTADO - Botão "Novo Item" agora funciona completamente
- ✅ **Sistema de Conhecimento**: IMPLEMENTADO - Base de dados por personagem com interface completa
- ✅ **Persistência de Turnos**: IMPLEMENTADO - Estado dos turnos agora é salvo e restaurado
- ✅ **Auto-save**: IMPLEMENTADO - Watchers para salvar automaticamente

**PRONTO PARA**: Sistema de combate, catálogo de magias e funcionalidades avançadas.

---

## 🏗️ Estrutura Base (Prioridade Alta)

### 1. Dependências e Configuração

- [x] Instalar dependências necessárias
  - [x] `localforage` para persistência
  - [x] `openai` para integração com GPT
  - [ ] Tipos TypeScript complementares
- [x] Configurar arquivo `.env`
  - [x] `VITE_OPENAI_API_KEY` (exemplo/template)
- [ ] Configurar eslint para classes TypeScript

### 2. Classes Core (Entidades)

- [x] Criar `src/classes/`
  - [x] `Personagem.ts` - Classe principal de personagem
  - [x] `Atributos.ts` - Sistema de atributos D&D
  - [x] `Item.ts` - Classe base para itens
  - [x] `Arma.ts` - Herda de Item
  - [x] `Armadura.ts` - Herda de Item
  - [x] `Consumivel.ts` - Herda de Item
  - [x] `Inventario.ts` - Gerencia itens do personagem
  - [x] `SessaoJogo.ts` - Gerencia estado da sessão
  - [x] `SistemaTurnos.ts` - Controla ordem e turnos
  - [x] `Dados.ts` - Sistema de rolagem de dados D&D

### 3. Persistência

- [x] Criar `src/services/`
  - [x] `PersistenceManager.ts` - Gerenciador principal
  - [x] `DatabaseService.ts` - Wrapper para LocalForage
  - [x] `BackupService.ts` - Import/Export de dados
  - [x] `OpenAIService.ts` - Integração com OpenAI
- [x] Configurar stores LocalForage
- [x] Sistema de migração de versão

## 🎯 MCP (Model Context Protocol) (Prioridade Alta)

### 4. Sistema MCP

- [x] Criar `src/mcp/`
  - [x] `MCPHandler.ts` - Manipulador principal
  - [x] `MCPFunctions.ts` - Funções expostas para IAs
  - [x] `MCPTypes.ts` - Tipos específicos do MCP
- [x] Implementar funções principais:
  - [x] `atacar(alvo, arma?)`
  - [x] `defender()`
  - [x] `mover(destino)`
  - [x] `lancarMagia(magia, alvo?)`
  - [x] `usarItem(item, alvo?)`
  - [x] `testeAtributo(atributo, dificuldade?)`
  - [x] `lerConhecimento(termo)`
  - [x] `escreverConhecimento(conteudo)`
- [x] Sistema de validação de ações
- [x] Integração com classes TypeScript

### 5. Integração OpenAI

- [x] Criar `src/services/`
  - [x] `OpenAIService.ts` - Cliente OpenAI
  - [x] `IAPersonagem.ts` - Wrapper para personagem IA
  - [x] `ContextBuilder.ts` - Monta contexto para IA
- [ ] Sistema de prompts personalizados
- [ ] Gerenciamento de múltiplas conversas

## 🎨 Interface (Prioridade Média)

### 6. Layouts e Páginas Base

- [x] Criar `src/layouts/MainLayout.vue`
- [x] Atualizar páginas:
  - [x] `IndexPage.vue` - Lista de sessões
  - [x] `SetupPage.vue` - Gerenciamento de recursos
  - [x] `GamePage.vue` - Tela principal do jogo
- [x] Configurar roteamento

### 7. Componentes Principais

- [x] Criar `src/components/`
  - [x] `EssentialLink.vue` - Link de navegação
  - [x] `PersonagemCard.vue` - Card de personagem
  - [x] `MensagemChat.vue` - Mensagem no chat
  - [x] `AtributoEditor.vue` - Editor de atributos
  - [x] `InventarioViewer.vue` - Visualizar inventário
  - [x] `SplitterLayout.vue` - Layout dividido
  - [x] `TurnoIndicator.vue` - Indicador de turno atual

### 8. Dialogs e Modais

- [x] `CriarPersonagemDialog.vue`
- [x] `EditarItemDialog.vue` - **FUNCIONANDO** com criação e edição completa
- [x] `ConfigurarAPIDialog.vue`
- [x] `ImportExportDialog.vue`
- [x] `TesteAtributoDialog.vue`
- [x] `ConhecimentoEditor.vue` - **NOVO** - Interface completa para gerenciar conhecimento

## 🔧 Funcionalidades Core (Prioridade Média)

### 9. Sistema de Chat

- [x] Componente de chat com histórico
- [x] Tipos de mensagem (fala, ação, sistema)
- [x] Auto-scroll e performance
- [x] Formatação de mensagens especiais

### 10. Gerenciamento de Turnos

- [x] Controles do mestre
- [x] Adição/remoção dinâmica de personagens
- [x] Indicadores visuais de turno
- [x] Persistência do estado dos turnos

### 11. Sistema de Conhecimento

- [x] Base de conhecimento por personagem
- [x] Sistema de eventos/resumos
- [x] Busca e indexação
- [x] Interface para edição manual

## 📊 Stores e Estado (Prioridade Média)

### 12. Pinia Stores

- [x] Criar `src/stores/`
  - [x] `configStore.ts` - Configurações globais
  - [x] `sessaoStore.ts` - Estado da sessão atual
  - [x] `personagemStore.ts` - Personagens ativos
  - [x] `itemStore.ts` - Catálogo de itens
- [x] Integração com persistência
- [x] Computed properties e getters

### 13. Estado Reativo

- [x] Watchers para auto-save
- [x] Sincronização entre stores
- [x] Cache inteligente

## 🎲 Mecânicas de Jogo (Prioridade Baixa)

### 14. Sistema de Combate

- [ ] Cálculo de iniciativa
- [ ] Resolução de ataques
- [ ] Sistema de dano e cura
- [ ] Efeitos temporários

### 15. Sistema de Magia

- [ ] Catálogo de magias D&D
- [ ] Slots de magia por nível
- [ ] Componentes e requisitos
- [ ] Efeitos de área

### 16. Sistema de Perícias

- [ ] Lista completa de perícias D&D
- [ ] Testes de atributo + proficiência
- [ ] Vantagem/desvantagem
- [ ] Casos especiais

## 🎨 Polimento (Prioridade Baixa)

### 17. UX/UI Melhorias

- [ ] Animações e transições
- [ ] Tema escuro/claro
- [ ] Responsividade mobile
- [ ] Atalhos de teclado

### 18. Features Avançadas

- [ ] Sistema de mapas interativos
- [ ] Upload de imagens para personagens
- [ ] Som ambiente e efeitos
- [ ] Integração com dice rollers visuais

### 19. Documentação

- [ ] README.md detalhado
- [ ] Guia do usuário
- [ ] Documentação da API MCP
- [ ] Exemplos de uso

## ⚡ Otimizações (Contínuo)

### 20. Performance

- [ ] Lazy loading de componentes
- [ ] Virtual scrolling no chat
- [ ] Debounce em operações pesadas
- [ ] Bundle size optimization

### 21. Testes

- [ ] Testes unitários para classes
- [ ] Testes de integração MCP
- [ ] Testes E2E principais fluxos

### 22. Deploy e Distribuição

- [ ] Build de produção
- [ ] Configuração PWA (opcional)
- [ ] GitHub Pages ou similar
- [ ] CI/CD básico

## 📝 Ordem de Desenvolvimento Sugerida

1. **Fase 1**: Itens 1-3 (Estrutura base e classes)
2. **Fase 2**: Itens 4-5 (MCP e OpenAI)
3. **Fase 3**: Itens 6-8 (Interface básica)
4. **Fase 4**: Itens 9-11 (Funcionalidades core)
5. **Fase 5**: Itens 12-13 (Estado e persistência)
6. **Fase 6**: Itens 14-16 (Mecânicas avançadas)
7. **Fase 7**: Itens 17-22 (Polimento e otimizações)
