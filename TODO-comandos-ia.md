# 📋 TODO List - Sistema de Comandos e Correções de IA

## 🚨 **PRIORIDADE CRÍTICA - BUGS**

### **🐛 1. Corrigir IA OpenAI não funcionando**

- [ ] **Investigar configStore.isApiConfigured**
  - Verificar se está lendo corretamente o .env
  - Adicionar logs de debug para rastreamento
  - Testar carregamento da API key no browser
- [ ] **Debug do OpenAIService**
  - Verificar se `getInstance()` está auto-configurando
  - Testar `estaConfigurado()` retorna true
  - Adicionar logs na tentativa de envio
- [ ] **Adicionar logs detalhados na função tentarIAAvancada**
  - Log quando tenta OpenAI
  - Log quando falha e por quê
  - Log quando usa fallback
- [ ] **Testar integração real com API**
  - Verificar se a API key é válida
  - Testar chamada manual ao OpenAI
  - Verificar response e parsing

**Estimativa:** 2-3 horas
**Impacto:** Alto - funcionalidade principal não funciona

---

## 🎯 **FEATURE: Sistema de Comandos Avançado**

### **📝 Fase 1 - Parser de Comandos Base (Essencial)**

#### **1.1 Parser Básico**

- [ ] **Criar classe `CommandParser`**
  - Parse de comandos com `/` para mestre
  - Parse de comandos com `@npc` para personagem
  - Suporte a múltiplos comandos separados por `;`
  - Regex para extrair comando, parâmetros e alvos

#### **1.2 Auto-complete de Comandos**

- [ ] **Interface de sugestões**
  - Dropdown ao digitar `/`
  - Lista de comandos disponíveis
  - Descrição curta de cada comando
  - Filtragem por texto digitado

#### **1.3 Estrutura Base de Comandos**

```typescript
interface Comando {
  nome: string;
  descricao: string;
  parametros: ParametroComando[];
  executar: (contexto: ContextoComando) => Promise<void>;
}

interface ParametroComando {
  nome: string;
  obrigatorio: boolean;
  tipo: 'texto' | 'npc' | 'numero' | 'item';
  descricao: string;
}
```

**Estimativa:** 4-5 horas
**Dependências:** Nenhuma

### **📞 Fase 2 - Comandos de Comunicação**

#### **2.1 Comandos Básicos de Fala**

- [ ] `/talk [msg]` - Mestre fala para todos
- [ ] `/talk @npc [msg]` - Mestre fala para NPC específico
- [ ] `@npc /talk [msg]` - NPC fala para todos
- [ ] `@npc /talk @npc2 [msg]` - NPC fala para NPC específico
- [ ] `/whisper @npc [msg]` - Sussurro privado
- [ ] `/ooc [msg]` - Out of Character

#### **2.2 Sistemas de Contexto por Turno**

- [ ] **Auto-preenchimento de @npc no turno**
  - Quando é turno do NPC, `msg` = `@npc /talk msg`
  - `@npc2 msg` = `@npc /talk @npc2 msg`
- [ ] **Validação de NPCs**
  - Auto-complete de nomes de NPCs
  - Verificação se NPC existe na sessão
  - Sugestões de NPCs similares

**Estimativa:** 3-4 horas
**Dependências:** Parser Base

### **⚔️ Fase 3 - Comandos de Ação**

#### **3.1 Combate Básico**

- [ ] `/attack @alvo [arma?]` - Atacar alvo
- [ ] `/defend` - Posição defensiva
- [ ] `/cast [magia] [@alvo?]` - Conjurar magia
- [ ] `/move [local]` - Movimentação

#### **3.2 Mecânicas de Jogo**

- [ ] `/roll [notação]` - Rolar dados
- [ ] `/check [atributo] [dificuldade?]` - Teste de habilidade
- [ ] `/damage @alvo [quantidade] [tipo?]` - Aplicar dano
- [ ] `/heal @alvo [quantidade]` - Curar

**Estimativa:** 5-6 horas
**Dependências:** Comunicação, Sistema de Combate existente

### **🤖 Fase 4 - Comandos de IA**

#### **4.1 Controle de IA**

- [ ] `/ai_on @npc` - Ativar IA para NPC
- [ ] `/ai_off @npc` - Desativar IA
- [ ] `/personality @npc [descrição]` - Alterar personalidade
- [ ] `/task @npc [tarefa]` - Dar tarefa específica
- [ ] `/know @npc [informação]` - Dar conhecimento

#### **4.2 Integração com Sistema IA Existente**

- [ ] **Conectar com processarTurnoIA**
- [ ] **Passar contexto de comandos para IA**
- [ ] **IA usar comandos para responder**

**Estimativa:** 4-5 horas
**Dependências:** Sistema IA corrigido

---

## 🔧 **IMPLEMENTAÇÃO TÉCNICA**

### **📁 Estrutura de Arquivos**

```
src/
├── services/
│   ├── CommandParser.ts        # Parser principal
│   ├── CommandRegistry.ts      # Registro de comandos
│   └── CommandExecutor.ts      # Executor de comandos
├── classes/
│   ├── Comando.ts             # Interface base
│   └── ContextoComando.ts     # Contexto de execução
└── components/
    ├── CommandAutocomplete.vue # Auto-complete UI
    └── CommandHelper.vue       # Help de comandos
```

### **⚡ Integração com GamePage**

- [ ] **Modificar campo de input**
  - Detectar `/` e `@` para mostrar auto-complete
  - Parse de mensagem antes de enviar
  - Executar comandos ao invés de enviar como mensagem normal

- [ ] **Sistema de Feedback**
  - Comandos executados mostrados diferente no chat
  - Mensagens de erro claras
  - Confirmação de ações importantes

### **🎮 UX/UI Melhorias**

- [ ] **Auto-complete dropdown**
  - Lista filtrada de comandos
  - Descrições e exemplos
  - Navegação por teclado (↑↓, Tab, Enter)

- [ ] **Validação em tempo real**
  - Highlighting de sintaxe
  - Validação de parâmetros
  - Sugestões de correção

---

## 📊 **CRONOGRAMA SUGERIDO**

### **Semana 1:**

- 🚨 Corrigir bug da IA OpenAI (Dias 1-2)
- 📝 Implementar Parser Base (Dias 3-5)

### **Semana 2:**

- 📞 Comandos de Comunicação (Dias 1-3)
- ⚔️ Comandos de Ação Básicos (Dias 4-5)

### **Semana 3:**

- 🤖 Integração com IA (Dias 1-3)
- 🎮 Polimento de UX (Dias 4-5)

---

## 🧪 **TESTES NECESSÁRIOS**

### **Casos de Teste Críticos:**

- [ ] `/talk 'mensagem simples'`
- [ ] `/talk @npc 'mensagem direcionada'`
- [ ] `@npc /talk 'npc falando'`
- [ ] `@npc1 /talk @npc2 'conversa entre npcs'`
- [ ] `/talk 'primeira'; /attack @goblin; /cast fireball`
- [ ] Comandos no turno do NPC com auto-contexto
- [ ] Auto-complete funcional
- [ ] IA executando comandos corretamente

### **Testes de Edge Cases:**

- [ ] Comandos mal formatados
- [ ] NPCs inexistentes
- [ ] Parâmetros inválidos
- [ ] Múltiplos comandos com erro no meio
- [ ] Caracteres especiais em mensagens

---

## 🎯 **CRITÉRIOS DE SUCESSO**

### **Para Correção da IA:**

- ✅ IA OpenAI funcionando quando configurada
- ✅ Logs claros de debug
- ✅ Fallback robusto para IA local

### **Para Sistema de Comandos:**

- ✅ Parser funcional para todas sintaxes descritas
- ✅ Auto-complete responsivo e útil
- ✅ Comandos executando corretamente
- ✅ Integração perfeita com IA
- ✅ UX intuitiva e sem bugs

### **Métricas de Qualidade:**

- 🔍 Zero erros de lint/build
- ⚡ Performance fluida (< 100ms para parse)
- 🎨 UI responsiva e acessível
- 🛡️ Tratamento robusto de erros
- 📚 Código bem documentado

---

## 📝 **NOTAS IMPORTANTES**

1. **Prioridade absoluta:** Corrigir IA OpenAI primeiro
2. **Arquitetura:** Usar padrão Command Pattern para extensibilidade
3. **Performance:** Parser deve ser otimizado para uso em tempo real
4. **Compatibilidade:** Manter sistema atual de chat funcionando
5. **Extensibilidade:** Facilitar adição de novos comandos
6. **Debug:** Logs detalhados para troubleshooting
7. **Testes:** Implementar testes unitários para parser crítico

---

**🎲 Próximos passos: Começar com debug da IA OpenAI para resolver o problema principal!**
