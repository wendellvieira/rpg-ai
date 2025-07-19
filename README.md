# RPG AI - Simulador de RPG com Múltiplas IAs

🎲 **Sistema completo de RPG com suporte a múltiplos personagens controlados por IA usando OpenAI e Model Context Protocol (MCP)**

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
- Modelo padrão: `gpt-4o-mini`
- **IMPORTANTE**: Arquivo já está no .gitignore

### 🚀 Início Rápido

#### 1. Instalação

```bash
npm install
```

#### 2. Configuração

```bash
# Configure sua chave OpenAI no arquivo .env
echo "VITE_OPENAI_API_KEY=sua_chave_aqui" > .env
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

1. **Modal de Criação de Itens** - Botão "Novo Item" não funciona
2. **Sistema de Conhecimento** - Base de dados por personagem
3. **Persistência de Turnos** - Salvar estado dos turnos

#### 📊 **Média** (Depois das urgentes)

1. **Watchers de Auto-save** - Salvar automaticamente
2. **Sistema de Combate** - Mecânicas de luta
3. **Catálogo de Magias** - Sistema de magia D&D

#### 🎨 **Baixa** (Polimento)

1. **Tema Escuro/Claro** - Alternância de temas
2. **Responsividade Mobile** - Adaptação para mobile
3. **Mapas Interativos** - Sistema de mapas

### 🔧 Problemas Conhecidos

#### ✅ **Resolvidos Recentemente**

- ✅ Erros ESLint e TypeScript corrigidos
- ✅ Navegação por menu lateral funcionando
- ✅ Abas de personagens/itens/configurações OK
- ✅ Arquivo .env adicionado ao .gitignore

#### ⚠️ **Pendentes**

- ❌ Modal "Novo Item" não implementado
- ❌ Sistema de conhecimento incompleto
- ❌ Auto-save não configurado

### 📝 Convenções do Projeto

#### **Código**

- TypeScript strict mode ativado
- ESLint configurado para Vue 3 + Composition API
- Pinia para gerenciamento de estado
- Quasar Framework para UI

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
2. **Execute `npm run lint`** após cada mudança significativa
3. **Teste a aplicação** em http://localhost:9001 regularmente
4. **Mantenha a documentação atualizada** em ./detalhes/
5. **Use o sistema MCP** para funcionalidades de IA
6. **Siga a arquitetura existente** - classes TypeScript bem definidas

### 📞 Integração com IA

O projeto usa **Model Context Protocol (MCP)** para integração com IAs:

- `src/mcp/MCPFunctions.ts` - Funções expostas para IA
- `src/services/OpenAIService.ts` - Cliente OpenAI
- Sistema permite múltiplos personagens IA simultâneos

---

**🤖 Para continuar este projeto, comece lendo `todo.md` e a pasta `detalhes/`. Boa codificação!**
