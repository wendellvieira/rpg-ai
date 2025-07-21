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
