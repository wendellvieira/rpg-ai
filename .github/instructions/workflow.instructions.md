---
applyTo: '**'
---

## Regras de trabalho.

- Sempre que terminar uma tarefa vc deve atualizar o "todo.md" que a originou. Exp: para as tarefas do v1 vc atualiza o "docs/version-1.md"
- Você deve usar "npx quasar build" sempre que quiser testar o projeto. Ele tem o mesmo efeito do quasar dev.
- Você NÃO deve usar "npx quasar dev", pois ele não entrega o resultado da compilação correto.
- Para testes unitários, você deve usar "npm run test:unit:ci" (execução única) ao invés de "npm run test:unit" (modo watch que trava o terminal).
- Para testes com interface gráfica, você deve usar "npm run test:ui" apenas quando explicitamente solicitado.

## Regras de comandos no terminal.

- **SEMPRE use comandos que não travem o terminal** - Evite comandos interativos ou em modo watch.
- **Prefira comandos CI/CD** - Use versões "run once" dos comandos quando disponíveis.
- **Evite comandos que ficam esperando confirmação** - Use flags como `--yes`, `--force`, `--no-interaction` quando necessário.

### Exemplos corretos:

```bash
# ✅ Correto - execução única
npm run test:unit:ci
npm run build
npm run lint

# ✅ Correto - com flags não-interativas
npm install --yes
npm audit fix --force
git add . && git commit -m "message"
```

### Exemplos incorretos:

```bash
# ❌ Incorreto - trava o terminal em modo watch
npm run test:unit
npm run dev
vitest
jest --watch

# ❌ Incorreto - fica esperando confirmação
npm install (sem flags)
git commit (sem mensagem)
quasar ext add (sem --yes)
```
