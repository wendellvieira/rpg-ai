# 🤖 Diretivas de Desenvolvimento - Resumo Executivo

## 🚨 **REGRAS CRÍTICAS**

### **❌ PROIBIDO**

- `run_in_terminal` com comandos npm/node/quasar
- Alterar arquivos de configuração sem autorização
- Reimplementar classes core existentes

### **✅ OBRIGATÓRIO**

- Usar APENAS `run_vs_code_task` com IDs: `"shell: lint"`, `"shell: build"`, `"shell: kill dev server"`
- Capturar output com `get_terminal_last_command()` após tasks
- Ler `lint-output.log` após lint
- TypeScript strict mode (zero `any`)

---

## 🏗️ **STACK & ESTRUTURA**

**Stack:** Vue.js 3 + Quasar + TypeScript + Pinia + Vite + ESLint

---

## 📝 **CONVENÇÕES**

- **Classes:** PascalCase (`Personagem`)
- **Métodos:** camelCase (`obterAtributo`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_NIVEL`)
- **Arquivos:** kebab-case (`personagem-card.vue`)

---

## 🔧 **PADRÕES OBRIGATÓRIOS**

### **Componentes Vue:**

```vue
<script setup lang="ts">
// 1. Imports, 2. Props/Emits tipados, 3. Estado reativo
// 4. Computed/watchers, 5. Métodos, 6. Lifecycle
</script>
```

### **Tratamento de Erros:**

- SEMPRE try-catch em async
- SEMPRE $q.notify para feedback
- SEMPRE console.error para debug

### **Performance:**

- Lazy loading: `defineAsyncComponent`
- Virtual scroll para listas grandes
- Computed para dados derivados
