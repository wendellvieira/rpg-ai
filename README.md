# RPG AI - Simulador de RPG com Múltiplas IAs

🎲 **Sistema completo de RPG com suporte a múltiplos personagens controlados por IA usando OpenAI, Stability AI e Model Context Protocol (MCP)**

## 📋 Para Agentes de IA - Como Continuar Este Projeto

### 🎯 Status Atual (Julho 2025)

- ✅ **FASE 1-3 CONCLUÍDAS**: Estrutura base, classes core, MCP e interface básica implementados
- ✅ **Pronto para**: Integração final, testes e funcionalidades avançadas
- 🔧 **Última correção**: Problemas de navegação e ESLint corrigidos

### 📚 Documentação Essencial

#### 1. **Lista de Tarefas Principal**

```
📄 Arquivo: ./todo.md
```

- Lista completa e atualizada de todas as tarefas
- Progresso detalhado por fase
- Prioridades claramente definidas
- Status de cada funcionalidade

#### 2. **Documentação Técnica**

```
📁 Pasta: ./detalhes/
```

- `arquitetura.md` - Visão geral da arquitetura
- `chat-turnos.md` - Sistema de chat e turnos
- `interface-usuario.md` - Especificações da UI
- `itens-equipamentos.md` - Sistema de itens
- `mcp-integracao.md` - Integração MCP
- `persistencia.md` - Sistema de persistência
- `personagens.md` - Sistema de personagens

#### 3. **Configuração de Ambiente**

```
📄 Arquivo: ./.env
```

- Configure `VITE_OPENAI_API_KEY` com sua chave da OpenAI
- Configure `VITE_STABILITY_API_KEY` com sua chave da Stability AI
- Modelo OpenAI padrão: `gpt-4o-mini`
- Modelo Stability AI padrão: `stable-image-core`
- **IMPORTANTE**: Arquivo já está no .gitignore

### 🎨 **APIs Utilizadas**

- **OpenAI GPT**: Inteligência artificial para personagens e narrativa
- **Stability AI**: Geração de imagens para mapas e elementos visuais
  - Stable Image Core: Text-to-image de alta qualidade
  - Stable Image Ultra: Geração ultra realista
  - Inpainting: Edição precisa de áreas com máscaras
  - Templates: Dungeons, florestas, cidades, batalhas
- **Model Context Protocol (MCP)**: Comunicação entre IAs

### 🚀 Início Rápido

#### 1. Instalação

```bash
npm install
```

#### 2. Configuração

```bash
# Configure suas chaves API no arquivo .env
echo "VITE_OPENAI_API_KEY=sua_chave_openai_aqui" >> .env
echo "VITE_STABILITY_API_KEY=sua_chave_stability_aqui" >> .env
```

#### 3. Desenvolvimento

```bash
npm run dev
# Aplicação roda em http://localhost:9001
```

#### 4. Verificação

```bash
npm run lint  # Verificar código
npm run build # Testar build de produção
```

### 🏗️ Estrutura do Projeto

```
src/
├── classes/          # Classes TypeScript (Personagem, Item, etc.)
├── components/       # Componentes Vue reutilizáveis
├── layouts/          # Layouts principais
├── mcp/             # Sistema Model Context Protocol
├── pages/           # Páginas da aplicação
├── router/          # Configuração de rotas
├── services/        # Serviços (OpenAI, Persistência, etc.)
├── stores/          # Stores Pinia (estado global)
└── types/           # Tipos TypeScript
```

### 🎯 Próximas Prioridades

#### 🔥 **Urgente** (Implementar primeiro)

1. **Sistema de Combate** - Mecânicas básicas de luta
2. **Catálogo de Magias** - Sistema de magia D&D
3. **Edição de Personagens** - Modal para editar personagens existentes

#### 📊 **Média** (Depois das urgentes)

1. **Responsividade Mobile** - Adaptação para dispositivos móveis
2. **Sistema de Mapas** - Interface para mapas interativos
3. **Integração MCP Avançada** - Funcionalidades avançadas de IA

#### 🎨 **Baixa** (Polimento)

1. **Tema Escuro/Claro** - Alternância de temas (já configurado na store)
2. **Animações** - Transições e efeitos visuais
3. **PWA** - Progressive Web App

### 🔧 Problemas Conhecidos

#### ✅ **Resolvidos Recentemente**

- ✅ Erros ESLint e TypeScript corrigidos
- ✅ Navegação por menu lateral funcionando
- ✅ Abas de personagens/itens/configurações OK
- ✅ Arquivo .env adicionado ao .gitignore
- ✅ **Modal "Novo Item" IMPLEMENTADO** - Criação completa de itens funcionando
- ✅ **Sistema de Conhecimento IMPLEMENTADO** - Base de dados por personagem com interface
- ✅ **Persistência de Turnos IMPLEMENTADA** - Estado dos turnos salvo/restaurado
- ✅ **Auto-save IMPLEMENTADO** - Watchers para salvamento automático

#### ⚠️ **Pendentes**

- ❌ Sistema de combate não implementado
- ❌ Catálogo de magias em desenvolvimento
- ❌ Edição de personagens usando modal simples (melhorar)

### 📝 Convenções do Projeto

#### **Código**

- TypeScript strict mode ativado
- ESLint configurado para Vue 3 + Composition API
- Pinia para gerenciamento de estado
- Quasar Framework para UI

#### **Comentários TODO**

- Quando encontrar algo a fazer ou melhorar no código, adicione um comentário TODO
- Formato: `//TODO: descrever o que precisa ser feito`
- Exemplo: `//TODO: implementar validação de email no formulário`
- Use sempre a sintaxe de comentário da linguagem (// para TS/JS, <!-- --> para HTML)

#### **Commits**

- Use mensagens descritivas
- Teste antes de commitar: `npm run lint`
- Mantenha o todo.md atualizado

#### **Arquivos Importantes**

- `src/pages/SetupPage.vue` - Gerenciamento de recursos
- `src/services/PersistenceManager.ts` - Persistência
- `src/mcp/MCPFunctions.ts` - Funções para IA
- `src/stores/` - Estado da aplicação

### 🆘 Comandos Úteis

**⚠️ IMPORTANTE: Para agentes de IA - NÃO execute comandos no terminal!**

Use as **VS Code Tasks** disponíveis em vez de comandos diretos:

```
Ctrl+Shift+P > Tasks: Run Task
```

- **dev** - Servidor de desenvolvimento (quasar dev)
- **lint** - Verificar código (npm run lint)
- **lint:fix** - Corrigir código automaticamente
- **build** - Build de produção (quasar build)
- **kill dev server** - Parar servidor de desenvolvimento
- **restart dev server** - Reiniciar servidor

**Para referência manual (não executar):**

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run lint             # Verificar código
npm run format           # Formatar código

# Produção
npm run build            # Build de produção
npm run preview          # Preview da build

# Debug
npm run type-check       # Verificar tipos TypeScript
```

### 💡 Dicas para Agentes

1. **Sempre consulte o todo.md** antes de implementar funcionalidades
2. **Use VS Code Tasks** em vez de comandos de terminal - existem tasks configuradas para lint, build, dev, etc.
3. **NÃO EXECUTE comandos no terminal** - use apenas as ferramentas de edição de código
4. **Mantenha a documentação atualizada** em ./detalhes/
5. **Use o sistema MCP** para funcionalidades de IA
6. **Siga a arquitetura existente** - classes TypeScript bem definidas
7. **Adicione comentários TODO** quando encontrar algo a implementar ou melhorar

### 📞 Integração com IA

O projeto usa **Model Context Protocol (MCP)** para integração com IAs:

- `src/mcp/MCPFunctions.ts` - Funções expostas para IA
- `src/services/OpenAIService.ts` - Cliente OpenAI
- Sistema permite múltiplos personagens IA simultâneos

---

**🤖 Para continuar este projeto, comece lendo `todo.md` e a pasta `detalhes/`. Boa codificação!**
