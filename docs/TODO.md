# TODO - Funcionalidades Pendentes

Este documento lista as funcionalidades que ainda não foram implementadas ou estão temporariamente desabilitadas no código do RPG-AI.

## 🎯 Funcionalidades Principais Não Implementadas

### 📦 Sistema de Inventário/Itens

- **Localização**: `src/pages/GamePage.vue` (linha 135), `src/components/EditarPersonagemDialog.vue` (linha 616)
- **Status**: Aba "Itens" mostra apenas "Em desenvolvimento"
- **Descrição**: Sistema completo de gerenciamento de itens dos personagens
- **Funcionalidade**: Botão "adicionarItem()" não implementado

### 🪄 Sistema de Magias

- **Localização**: `src/components/CatalogoMagiasSimples.vue` (linhas 17, 61)
- **Status**: "Em desenvolvimento - Em breve você poderá gerenciar o catálogo completo de magias"
- **Funcionalidades Pendentes**:
  - Editor de magias customizadas (`criarNovaMagia()` não implementado)
  - Importação de magias D&D 5e (`importarMagiasDD()` não implementado)
  - Catálogo completo de magias D&D 5e
  - Filtros por escola, nível e classe
  - Sistema de slots de magia

### 📚 Editor de Conhecimento

- **Localização**: `src/components/EditarPersonagemDialog.vue` (linha 687)
- **Status**: "Editor de conhecimento não implementado ainda"
- **Descrição**: Sistema para editar conhecimentos específicos dos personagens
- **Métodos Pendentes**:
  - `editarConhecimento()` não implementado
  - Métodos de edição na classe Personagem (linha 347 em `ConhecimentoEditor.vue`)
  - Métodos de remoção na classe Personagem (linha 398 em `ConhecimentoEditor.vue`)

## 🤖 Sistema de IA - Funcionalidades Desabilitadas

### Respostas Automáticas de Personagens IA

- **Localização**: `src/pages/GamePage.vue` (linhas 939, 959-1006)
- **Status**: "TEMPORARIAMENTE DESABILITADO"
- **Descrição**: Sistema que fazia personagens IA responderem automaticamente durante o jogo
- **Funcionalidades**:
  - `processarRespostasIA()` - comentado
  - `gerarRespostaIA()` - função auxiliar comentada
  - Resposta automática com probabilidade de 30%

## 🔧 Funcionalidades Técnicas Pendentes

### Sistema de Catálogo de Itens

- **Localização**: `src/stores/personagemStore.ts` (linha 412)
- **Status**: "TODO: Carregar o item real do catálogo quando implementado"
- **Descrição**: Sistema para carregar itens de um catálogo centralizado

### Migrações de Dados

- **Localização**: `src/services/PersistenceManager.ts` (linha 57)
- **Status**: "Aqui implementaríamos as migrações necessárias"
- **Descrição**: Sistema para migrar dados entre versões do schema

### Integração com Sistema de Combate

- **Localização**: `src/mcp/MCPFunctions.ts` (linha 264)
- **Status**: "TODO: Implementar integração com SistemaCombate quando personagens estiverem disponíveis no contexto"
- **Descrição**: Integração completa do sistema de combate com personagens

## 🎮 Interface/UX Pendentes

### Menu de Contexto de Sessões

- **Localização**: `src/layouts/MainLayout.vue` (linha 217)
- **Status**: "TODO: Implementar menu de contexto da sessão"
- **Funcionalidade**: `showSessionMenu()` não implementado

### Sistema de Pausa do Jogo

- **Localização**: `src/layouts/MainLayout.vue` (linha 228)
- **Status**: "TODO: Implementar pausa do jogo"
- **Funcionalidade**: `pauseGame()` não implementado

## 📈 Funcionalidades Limitadas

### Sistema de Inventário Simplificado

- **Localização**: `src/stores/personagemStore.ts` (linha 175)
- **Status**: "Para o inventário, como os métodos precisam de objetos Item, vamos implementar uma solução mais simples"
- **Descrição**: Implementação atual é simplificada, falta integração com objetos Item completos

### Dados de Contexto Mockados

- **Localização**: `src/services/ContextBuilder.ts` (várias linhas)
- **Status**: Vários comentários "Em uma implementação real, isso viria de..."
- **Exemplos**:
  - Linha 215: "Em uma implementação real, isso viria de um sistema persistente"
  - Linha 228: "Em uma implementação real, seria obtido do personagem"
  - Linha 247: "Em uma implementação real, isso viria de um sistema de quests"
  - Linha 342: "Em uma implementação real, seria obtido do personagem"

### Dados de Combate Simplificados

- **Localização**: `src/services/IAPersonagem.ts` (linha 462)
- **Status**: "Seria rastreado em implementação real"
- **Descrição**: Estatísticas de combate são mockadas

## 🗂️ Funcionalidades Planejadas (Documentadas no Código)

### Sistema de Magias Completo

Conforme documentado em `src/components/CatalogoMagiasSimples.vue`:

- Catálogo completo de magias D&D 5e
- Editor de magias customizadas
- Filtros por escola, nível e classe
- Adição de magias aos personagens
- Sistema de slots de magia

---

**Nota**: Esta lista foi gerada automaticamente analisando o código fonte. Algumas funcionalidades podem ter sido implementadas parcialmente ou em outros arquivos não analisados.
