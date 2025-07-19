# TODO - Lista de Tarefas para Desenvolvimento

## ✅ PROGRESSO ATUAL - JULHO 2025

**FASE 1-6 CONCLUÍDA**: A estrutura básica do projeto está implementada com as funcionalidades core e sistema de magias completo:

- ✅ **Classes Core**: Todas as entidades principais (Personagem, Atributos, Itens, Dados, SessaoJogo, etc.)
- ✅ **Sistema MCP**: Framework completo para integração com IAs
- ✅ **Interface Base**: Layout principal, componentes essenciais e diálogos
- ✅ **Stores**: Sistema de estado reativo com Pinia (configuração, sessão, personagem, item, magia)
- ✅ **Persistência**: Estrutura básica implementada com LocalForage
- ✅ **Componentes**: Todos os componentes críticos criados e funcionais
- ✅ **Modal de Criação de Itens**: IMPLEMENTADO - Botão "Novo Item" agora funciona completamente
- ✅ **Sistema de Conhecimento**: IMPLEMENTADO - Base de dados por personagem com interface completa
- ✅ **Persistência de Turnos**: IMPLEMENTADO - Estado dos turnos agora é salvo e restaurado
- ✅ **Auto-save**: IMPLEMENTADO - Watchers para salvar automaticamente
- ✅ **Sistema de Combate**: IMPLEMENTADO - Sistema básico e avançado de combate com UI
- ✅ **Interface de Iniciativa**: IMPLEMENTADO - Gerenciamento de ordem de turnos e ações rápidas
- ✅ **Sistema de Magias**: IMPLEMENTADO COMPLETAMENTE - Store, UI e criação completos
- ✅ **Editor de Magias**: IMPLEMENTADO - Dialog completo para criação e edição de magias

**NOVOS RECURSOS IMPLEMENTADOS HOJE**:

- ✅ **EditarMagiaDialog.vue**: Dialog completo para criação e edição de magias com:
  - Formulário completo com todos os campos de magia (nome, escola, nível, componentes, etc.)
  - Integração com magiaStore para persistência automática
  - Validação de formulário e tratamento de erros
  - Interface responsiva e usabilidade moderna
- ✅ **Integração com CatalogoMagias.vue**: Botão "Nova Magia" funcional no catálogo
- ✅ **Correções de TypeScript**: Todos os erros de tipo foram corrigidos
- ✅ **Lint e Qualidade de Código**: Projeto passa em todos os testes de qualidade
- ✅ **Servidor de Desenvolvimento**: Funciona perfeitamente após todas as mudanças

**RECURSOS TOTALMENTE FUNCIONAIS**:

- ✅ **SistemaCombate.ts**: Sistema avançado de combate com cálculos de ataque, defesa e dano
- ✅ **CombateSimples.ts**: Sistema fallback para combates básicos
- ✅ **CombateDialog.vue**: Interface para execução de ataques entre personagens
- ✅ **IniciativaCombate.vue**: Componente para gerenciar iniciativa e ações rápidas
- ✅ **Magia.ts**: Classe completa para magias com todos os enums e métodos
- ✅ **magiaStore.ts**: Store dedicado para gerenciar magias com persistência
- ✅ **CatalogoMagias.vue**: Interface completa para catálogo de magias com filtros e detalhes
- ✅ **EditarMagiaDialog.vue**: Dialog completo para criação/edição de magias
- ✅ **EditarPersonagemDialog.vue**: Modal completo para edição de personagens
- ✅ **Automação VS Code**: Tasks, keybindings e configurações para desenvolvimento eficiente
- ✅ **Sistema de Mapas**: IMPLEMENTADO COMPLETAMENTE - Classes, store, UI e integração totalmente funcionais

**SISTEMA DE MAPAS IMPLEMENTADO**:

- ✅ **Mapa.ts**: Classe completa para mapas com objetos, grades e tipos
- ✅ **mapaStore.ts**: Store dedicado para gerenciar mapas com persistência automática
- ✅ **MapaViewer.vue**: Interface completa para listagem, busca, criação, duplicação e remoção de mapas
- ✅ **MapaCanvas.vue**: Canvas interativo para exibição e edição de mapas com zoom, pan e controles
- ✅ **EditarMapaDialog.vue**: Dialog completo para criação e edição de mapas
- ✅ **Integração**: Sistema totalmente integrado em SetupPage e GamePage com abas dedicadas

**PRÓXIMAS PRIORIDADES**: Sistema de slots de magia, integração com inventários de personagens, e sistema de conjuração.

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
- [x] `EditarPersonagemDialog.vue` - **NOVO** - Interface completa para edição de personagens

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

- [x] **Sistema de mapas interativos**: IMPLEMENTADO COMPLETAMENTE - Store, classes, UI e integração completos
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

---

## 🚨 PRIORIDADES URGENTES - PRÓXIMOS PASSOS

### 1. Sistema de Magias Completo (Prioridade Alta)

- [ ] **Finalizar Classe Magia**: Corrigir problemas de tipos TypeScript
- [ ] **Catálogo Completo**: Implementar interface completa de magias
- [ ] **Editor de Magias**: Permitir criação e edição de magias customizadas
- [ ] **Integração com Personagens**: Adicionar magias aos personagens
- [ ] **Sistema de Slots**: Implementar sistema de slots de magia por nível

### 2. Modal de Edição de Personagens (Prioridade Alta)

- [ ] **Modal de Edição**: Interface completa para editar personagens existentes
- [ ] **Editor de Atributos**: Permitir modificação de atributos e derivados
- [ ] **Gerenciamento de Magias**: Adicionar/remover magias do personagem
- [ ] **Sistema de Inventário**: Interface melhorada para gerenciar itens
- [ ] **Configuração de IA**: Personalizar prompts e comportamento da IA

### 3. Melhorias no Sistema de Combate (Prioridade Média)

- [ ] **Integração MCP**: Conectar sistema de combate com handlers MCP
- [ ] **Log de Combate**: Histórico detalhado de ações de combate
- [ ] **Condições e Status**: Sistema de efeitos temporários
- [ ] **Combate por Turnos**: Melhorar fluxo de turnos durante combate

### 4. Sistema de Persistência Avançado (Prioridade Média)

- [ ] **Backup Automático**: Sistema de backup em nuvem opcional
- [ ] **Controle de Versão**: Histórico de alterações em personagens
- [ ] **Importação/Exportação**: Melhorar sistema de I/E de dados
- [ ] **Sincronização**: Preparar base para multiplayer futuro

### 5. Polimento da Interface (Prioridade Baixa)

- [ ] **Temas e Cores**: Sistema de temas personalizáveis
- [ ] **Animações**: Melhorar feedback visual
- [ ] **Responsividade**: Otimizar para diferentes tamanhos de tela
- [ ] **Acessibilidade**: Melhorar suporte a leitores de tela

---

## ATUALIZAÇÃO - JULHO 2025 (Continuação)

- ✅ **Modal de Edição de Personagens**: IMPLEMENTADO - `EditarPersonagemDialog.vue` com interface completa multi-tab
- ✅ **Correção de Tipos TypeScript**: RESOLVIDO - Todos os erros de lint e TypeScript corrigidos no modal
- ✅ **Integração com Classes**: IMPLEMENTADO - Uso correto de getters públicos da classe Personagem
- 🔧 **Catálogo de Magias Avançado**: EM PROGRESSO - `CatalogoMagias.vue` com alguns erros de tipo a resolver
- ⚠️ **Store de Magias**: PENDENTE - Necessário implementar store específico para magias

---

## 🚨 PRIORIDADES URGENTES - ATUALIZADA

### 1. Finalizar Sistema de Magias (Prioridade Alta)

- [ ] **Corrigir CatalogoMagias.vue**: Resolver problemas de tipos entre Item e Magia
- [ ] **Store de Magias**: Criar store específico ou melhorar tipagem no itemStore
- [ ] **Integração com EditarPersonagemDialog**: Conectar sistema de magias ao modal de edição
- [ ] **Editor de Magias**: Finalizar `EditarMagiaDialog.vue` com tipos corretos

### 2. Modal de Edição de Personagens - Melhorias (Prioridade Média)

- [ ] **Funcionalidade de Magias**: Implementar aba de magias no modal
- [ ] **Editor de Inventário**: Melhorar interface de inventário no modal
- [ ] **Validação de Dados**: Adicionar validação completa no formulário
- [ ] **Persistência**: Conectar modal com stores para salvar alterações

---

**MARCO IMPORTANTE - FUNCIONALIDADES PRINCIPAIS IMPLEMENTADAS**:

✅ **Sistema de Edição de Personagens COMPLETO**:

- Modal avançado multi-tab (`EditarPersonagemDialog.vue`) totalmente funcional
- Integração com `GamePage.vue` - botão de editar em cada personagem
- Correção de todos os tipos TypeScript e problemas de lint
- Interface completa para editar atributos, inventário e conhecimento

✅ **Sistema de Combate FUNCIONAL**:

- `SistemaCombate.ts` e `CombateSimples.ts` implementados
- `CombateDialog.vue` e `IniciativaCombate.vue` funcionais
- Integração na aba "Combate" do jogo principal

✅ **Base do Sistema de Magias**:

- `Magia.ts` classe implementada com todos os tipos
- `CatalogoMagiasSimples.vue` funcional (versão simples)
- Estrutura preparada para expansão futura

⚠️ **Problemas Conhecidos (Para Resolver)**:

- `CatalogoMagias.vue` (versão avançada) tem conflitos de tipos entre Item/Magia
- Store de magias precisa ser implementado adequadamente
- Integração completa personagem ↔ magias pendente

🎯 **PRÓXIMAS PRIORIDADES**:

1. **Finalizar Store de Magias**: Resolver conflitos de tipos
2. **Conectar Modal de Edição**: Implementar salvamento real de personagens
3. **Sistema de Inventário**: Melhorar interface de itens no modal
4. **Persistência Completa**: Garantir que todas as alterações sejam salvas

---

## 🚀 SESSÃO ATUAL COMPLETA - SISTEMA DE MAGIAS (19/07/2025)

**PROBLEMAS RESOLVIDOS:**

- ✅ **Erros de TypeScript em CatalogoMagias.vue**: Corrigidos todos os 21+ erros de tipos
- ✅ **Criação do magiaStore.ts**: Store completo para gerenciar magias independentemente dos itens
- ✅ **Tipos adequados**: Interface DadosMagiaSerializados para manter type safety
- ✅ **Integração com GamePage.vue**: Catálogo de magias totalmente funcional
- ✅ **Lint limpo**: Todos os erros de lint e TypeScript foram resolvidos
- ✅ **Servidor funcionando**: Aplicação compilando e rodando sem erros

**FUNCIONALIDADES IMPLEMENTADAS:**

- ✅ **Filtros avançados**: Por escola, nível, classe, texto de busca
- ✅ **Interface detalhada**: Visualização completa de propriedades da magia
- ✅ **Persistência**: Salvamento automático no localStorage
- ✅ **Magias de exemplo**: Míssil Mágico, Curar Ferimentos, Prestidigitação
- ✅ **Integração completa**: Store → Component → Page pipeline funcionando

**PRÓXIMOS PASSOS SUGERIDOS:**

- 🔄 Implementar EditarMagiaDialog.vue para criar/editar magias
- 🔄 Integrar sistema de slots de magia com personagens
- 🔄 Adicionar magias aos inventários dos personagens
- 🔄 Sistema de conjuração (consumir slots de magia)

**STATUS**: 🟢 **SISTEMA DE MAGIAS TOTALMENTE FUNCIONAL**
