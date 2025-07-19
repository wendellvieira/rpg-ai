# TODO - Lista de Tarefas para Desenvolvimento

## 🏗️ Estrutura Base (Prioridade Alta)

### 1. Dependências e Configuração

- [ ] Instalar dependências necessárias
  - [ ] `localforage` para persistência
  - [ ] `openai` para integração com GPT
  - [ ] Tipos TypeScript complementares
- [ ] Configurar arquivo `.env`
  - [ ] `VITE_OPENAI_API_KEY` (exemplo/template)
- [ ] Configurar eslint para classes TypeScript

### 2. Classes Core (Entidades)

- [ ] Criar `src/classes/`
  - [ ] `Personagem.ts` - Classe principal de personagem
  - [ ] `Atributos.ts` - Sistema de atributos D&D
  - [ ] `Item.ts` - Classe base para itens
  - [ ] `Arma.ts` - Herda de Item
  - [ ] `Armadura.ts` - Herda de Item
  - [ ] `Consumivel.ts` - Herda de Item
  - [ ] `Inventario.ts` - Gerencia itens do personagem
  - [ ] `SessaoJogo.ts` - Gerencia estado da sessão
  - [ ] `SistemaTurnos.ts` - Controla ordem e turnos
  - [ ] `Dados.ts` - Sistema de rolagem de dados D&D

### 3. Persistência

- [ ] Criar `src/services/`
  - [ ] `PersistenceManager.ts` - Gerenciador principal
  - [ ] `DatabaseService.ts` - Wrapper para LocalForage
  - [ ] `BackupService.ts` - Import/Export de dados
- [ ] Configurar stores LocalForage
- [ ] Sistema de migração de versão

## 🎯 MCP (Model Context Protocol) (Prioridade Alta)

### 4. Sistema MCP

- [ ] Criar `src/mcp/`
  - [ ] `MCPHandler.ts` - Manipulador principal
  - [ ] `MCPFunctions.ts` - Funções expostas para IAs
  - [ ] `MCPTypes.ts` - Tipos específicos do MCP
- [ ] Implementar funções principais:
  - [ ] `atacar(alvo, arma?)`
  - [ ] `defender()`
  - [ ] `mover(destino)`
  - [ ] `lancarMagia(magia, alvo?)`
  - [ ] `usarItem(item, alvo?)`
  - [ ] `testeAtributo(atributo, dificuldade?)`
  - [ ] `lerConhecimento(termo)`
  - [ ] `escreverConhecimento(conteudo)`
- [ ] Sistema de validação de ações
- [ ] Integração com classes TypeScript

### 5. Integração OpenAI

- [ ] Criar `src/services/`
  - [ ] `OpenAIService.ts` - Cliente OpenAI
  - [ ] `IAPersonagem.ts` - Wrapper para personagem IA
  - [ ] `ContextBuilder.ts` - Monta contexto para IA
- [ ] Sistema de prompts personalizados
- [ ] Gerenciamento de múltiplas conversas

## 🎨 Interface (Prioridade Média)

### 6. Layouts e Páginas Base

- [ ] Criar `src/layouts/MainLayout.vue`
- [ ] Atualizar páginas:
  - [ ] `IndexPage.vue` - Lista de sessões
  - [ ] `SetupPage.vue` - Gerenciamento de recursos
  - [ ] `GamePage.vue` - Tela principal do jogo
- [ ] Configurar roteamento

### 7. Componentes Principais

- [ ] Criar `src/components/`
  - [ ] `PersonagemCard.vue` - Card de personagem
  - [ ] `MensagemChat.vue` - Mensagem no chat
  - [ ] `AtributoEditor.vue` - Editor de atributos
  - [ ] `InventarioViewer.vue` - Visualizar inventário
  - [ ] `SplitterLayout.vue` - Layout dividido
  - [ ] `TurnoIndicator.vue` - Indicador de turno atual

### 8. Dialogs e Modais

- [ ] `CriarPersonagemDialog.vue`
- [ ] `EditarItemDialog.vue`
- [ ] `ConfigurarAPIDialog.vue`
- [ ] `ImportExportDialog.vue`
- [ ] `TesteAtributoDialog.vue`

## 🔧 Funcionalidades Core (Prioridade Média)

### 9. Sistema de Chat

- [ ] Componente de chat com histórico
- [ ] Tipos de mensagem (fala, ação, sistema)
- [ ] Auto-scroll e performance
- [ ] Formatação de mensagens especiais

### 10. Gerenciamento de Turnos

- [ ] Controles do mestre
- [ ] Adição/remoção dinâmica de personagens
- [ ] Indicadores visuais de turno
- [ ] Persistência do estado dos turnos

### 11. Sistema de Conhecimento

- [ ] Base de conhecimento por personagem
- [ ] Sistema de eventos/resumos
- [ ] Busca e indexação
- [ ] Interface para edição manual

## 📊 Stores e Estado (Prioridade Média)

### 12. Pinia Stores

- [ ] Criar `src/stores/`
  - [ ] `sessaoStore.ts` - Estado da sessão atual
  - [ ] `personagemStore.ts` - Personagens ativos
  - [ ] `itemStore.ts` - Catálogo de itens
  - [ ] `configStore.ts` - Configurações globais
- [ ] Integração com persistência
- [ ] Computed properties e getters

### 13. Estado Reativo

- [ ] Watchers para auto-save
- [ ] Sincronização entre stores
- [ ] Cache inteligente

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
