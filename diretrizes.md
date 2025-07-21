# Diretrizes de Arquitetura para Agentes LLM

Este documento detalha os padrões de arquitetura e as convenções de codificação para este projeto Vue.js com Quasar e TypeScript. O objetivo é garantir que o código gerado seja consistente, manutenível e siga os princípios estabelecidos.

## 1. Princípios Fundamentais

A arquitetura do projeto baseia-se em três pilares principais:

1.  **Separação de Responsabilidades (SoC)**: A lógica de negócio é estritamente separada da camada de apresentação.
    - **Views (`.vue`)**: Responsáveis exclusivamente pela UI (apresentação). Devem conter o mínimo de lógica possível.
    - **Controllers (`_Ctrl.ts`)**: Classes TypeScript que contêm a lógica de negócio, gerenciamento de estado e manipulação de dados.
2.  **Reatividade**: Utilizamos a Composition API do Vue 3. Os controllers são instâncias de classes reativas, permitindo que a UI reaja automaticamente às mudanças de estado.
3.  **Injeção de Dependência**: A comunicação e as dependências entre diferentes partes da aplicação (ex: controller pai e filho) são gerenciadas através de métodos `connect()`.

## 2. Estrutura de Arquivos e Nomenclatura

A organização dos arquivos e a nomenclatura seguem um padrão rigoroso para manter a consistência.

### **Convenções de Nomenclatura**

| Tipo de Artefato           | Convenção                    | Exemplo               |
| :------------------------- | :--------------------------- | :-------------------- |
| **Controllers**            | `PascalCase_Ctrl.ts`         | `UserForm_Ctrl.ts`    |
| **Componentes Vue**        | `PascalCase.vue`             | `UserForm.vue`        |
| **Páginas Vue**            | `PascalCase_Page.vue`        | `Home_Page.vue`       |
| **Interfaces de Dados**    | `PascalCase_Data.ts`         | `User_Data.ts`        |
| **Arquivos de Definições** | `definitions.ts`             | `user-definitions.ts` |
| **Classes**                | `PascalCase`                 | `UserService`         |
| **Constantes**             | `UPPER_CASE`                 | `MAX_USERS`           |
| **Arquivos em geral**      | `kebab-case` ou `PascalCase` | `user-service.ts`     |

### **Estrutura de Pastas Principal**

```
src/
├── pages/              # Páginas da aplicação
│   └── [Feature]/
│       ├── [PageName]_Page.vue
│       ├── [PageName]_PageCtrl.ts
│       ├── components/
│       └── assets/
├── components/         # Componentes reutilizáveis (ex: Input, Btn, Layout)
│   └── [Category]/
│       └── [ComponentName]/
├── stores/             # Stores globais (Pinia)
│   └── modules/
├── modules/            # Features de negócio modulares e complexas
│   └── [Feature]/
│       ├── tasks/
│       └── ...
├── utils/              # Helpers e funções puras
└── services/           # Lógica de comunicação com APIs
```

## 3. Padrões de Implementação

Esta seção detalha como criar os diferentes artefatos do sistema.

### **Controllers (`_Ctrl.ts`)**

Controllers são o cérebro da aplicação.

- **Padrão de Estrutura**:

  ```typescript
  import { reactive } from 'vue';

  export class MeuController_Ctrl {
  	// 1. Método estático para criar a instância reativa
  	static reactive() {
  		return reactive(new MeuController_Ctrl()) as MeuController_Ctrl;
  	}

  	// 2. Propriedades de estado (públicas)
  	public data: MeuTipo_Data | null = null;
  	public loading = false;

  	// 3. Dependências (protegidas)
  	protected parent: ParentType | null = null;

  	// 4. Métodos de ciclo de vida
  	async mount(data: MeuTipo_Data) {
  		this.data = data;
  		// ... lógica de inicialização
  		return this;
  	}

  	connect(parent: ParentType) {
  		this.parent = parent;
  		return this;
  	}

  	// 5. Métodos de persistência (opcional)
  	restore(data: MeuTipo_Data) {
  		this.data = data;
  	}

  	takeSnapshot() {
  		return this.data;
  	}
  }
  ```

### **Componentes (`.vue`)**

Componentes são primariamente para a UI.

- **Quando Criar um Componente?**

  - **Reutilização**: Será usado em mais de um local.
  - **Complexidade**: Template com mais de 100 linhas ou lógica de UI complexa.
  - **Responsabilidade Única**: Encapsula uma funcionalidade específica.

- **Quando NÃO Criar?**

  - Uso único e simples (menos de 50 linhas).
  - Fortemente acoplado ao componente pai.

- **Padrão de Componente com Controller**:

  ```vue
  <template>
  	<!-- O template interage com as propriedades e métodos do controller -->
  	<div>{{ ctrl.data?.name }}</div>
  </template>

  <script setup lang="ts">
  	import { onMounted } from 'vue';
  	import { MeuComponente_Ctrl } from './MeuComponente_Ctrl';

  	interface Props {
  		initialData?: MeuTipo_Data;
  	}

  	const props = defineProps<Props>();
  	const ctrl = MeuComponente_Ctrl.reactive();

  	// Expõe o controller para o template e para componentes pais
  	defineExpose({ ctrl });

  	onMounted(() => {
  		if (props.initialData) {
  			ctrl.mount(props.initialData);
  		}
  	});
  </script>
  ```

- **IMPORTANTE**: **NUNCA** use componentes do Quasar diretamente (ex: `QInput`, `QBtn`). **SEMPRE** utilize os componentes padronizados de `src/components` (ex: `Input`, `Btn`).

### **Páginas (`_Page.vue`)**

Páginas são os pontos de entrada para as features e orquestram múltiplos componentes.

- **Estrutura de Pasta de Página**:
  ```
  src/pages/[Feature]/[PageName]/
  ├── [PageName]_Page.vue
  ├── [PageName]_PageCtrl.ts
  ├── components/              # Componentes específicos da página
  └── assets/                  # Definições, interfaces, etc.
  ```
- O `[PageName]_PageCtrl.ts` gerencia o estado geral da página, incluindo controllers de componentes filhos (modais, tabelas, etc.).

### **Modais (`src/components/Modals/...`)**

Modais possuem um padrão de controller específico para gerenciar seu ciclo de vida.

- **Padrão de Controller de Modal**:

  ```typescript
  export class MeuModal_Ctrl {
  	static reactive() {
  		/* ... */
  	}

  	public status = false; // Controla a visibilidade
  	public deferred: Deferred<ResultType | null> = new Deferred();
  	public data: MeuModal_Data | null = null;

  	// Retorna uma promessa que resolve quando o modal é fechado
  	public async open(initialData?: MeuModal_Data) {
  		this.reset();
  		this.data = initialData;
  		this.status = true;
  		return this.deferred.promise;
  	}

  	// Fecha o modal e resolve a promessa
  	public close(result: ResultType | null = null) {
  		this.deferred.resolve(result);
  		this.status = false;
  	}

  	public reset() {
  		this.data = null;
  		this.deferred = new Deferred();
  	}
  }
  ```

### **Stores (Pinia)**

Para estado global, usamos Pinia com um padrão de classe.

- **Padrão de Store**:

  ```typescript
  import { defineStore } from 'pinia';
  import { transformClass } from 'src/utils/transformClass'; // Helper para converter classe em setup store

  export class Feature_Store {
  	// State
  	public data: MyData[] = [];
  	public loading = false;

  	// Getters (usando 'get' do ES6)
  	get items() {
  		return this.data;
  	}

  	// Actions (métodos da classe)
  	async loadData() {
  		// ...
  	}
  }

  export const useFeatureStore = defineStore('feature', () => {
  	return transformClass(Feature_Store);
  });
  ```

### **Defs (Arquivos de Definição)**

Arquivos `definitions.ts` centralizam dados estáticos para evitar "números mágicos" e strings repetidas no código.

- **Conteúdo Típico**:
  - Arrays de opções para selects (`status_options`).
  - Configurações de colunas de tabelas (`table_columns`).
  - Constantes de features (`FEATURE_CONSTANTS`).
  - Mapeamentos (`status_colors`).

### **Utils**

Para lógica pura e reutilizável.

- **Padrão**: Use classes com métodos estáticos.
  ```typescript
  // src/utils/FormatHelper.ts
  export class FormatHelper {
  	static date(d: Date): string {
  		// ...
  	}
  	static currency(v: number): string {
  		// ...
  	}
  }
  ```

### **Injeção de Controllers (Padrão Mestre-Escravo)**

Exceto para controllers de entrypoint (como Páginas), as instâncias de controllers são consideradas "escravas" e devem ser injetadas por um controller "mestre" (pai). Isso permite que o mestre manipule o estado do escravo, estenda seu comportamento e gerencie seu ciclo de vida.

- **Como Fazer (Correto)**: A instância do controller escravo **deve** ser criada no `constructor` do mestre para garantir a reatividade correta e a hierarquia.

  ```typescript
  // Parent_Ctrl.ts
  class Parent_Ctrl {
  	static reactive() {
  		/* ... */
  	}

  	// 1. Declare o tipo do controller escravo
  	public modal: MinhaClasseDeCtrl_Ctrl;

  	constructor() {
  		// 2. Instancie o controller escravo no construtor
  		this.modal = MinhaClasseDeCtrl_Ctrl.reactive();
  	}
  }
  ```

- **Como NÃO Fazer (Incorreto)**: Instanciar diretamente na declaração da propriedade pode levar a problemas de reatividade e acoplamento.

  ```typescript
  // Causa erros de reatividade e acoplamento
  public modal = MinhaClasseDeCtrl_Ctrl.reactive(); // ERRADO!
  ```

- **Injetando no Componente Filho**: O componente filho recebe a instância do controller via `props`.

  ```vue
  <!-- ComponentePai.vue -->
  <template>
  	<Modal :ctrl="ctrl.modal" />
  </template>
  <script setup lang="ts">
  	// ...
  	const ctrl = Parent_Ctrl.reactive();
  </script>
  ```

  ```vue
  <!-- Modal.vue -->
  <script setup lang="ts">
  	defineProps<{
  		ctrl: MinhaClasseDeCtrl_Ctrl;
  	}>();
  </script>
  ```

### **Persistência de Dados (Padrão Entidade-Documento)**

Para dados que precisam ser persistidos e compartilhados na aplicação, utilizamos um padrão que combina um repositório central (Entidade) com modelos de dados reativos (Documento).

- **Entidade (`_Entity.Store.ts`)**:

  - É uma Store Pinia que atua como um cache centralizado para um tipo de dado.
  - Normalmente, armazena os documentos em uma estrutura de `Map` para acesso rápido por ID.
  - Responsável por buscar dados da API e popular a coleção de documentos.

  ```typescript
  // Exemplo: src/stores/modules/users/Users_Entity.Store.ts
  import { defineStore } from 'pinia';
  import { User_Doc } from './User_Doc';

  class Users_Entity {
  	public users: Map<string, User_Doc> = new Map();

  	// Métodos para buscar, adicionar, remover usuários...
  }

  // ... export da store com Pinia
  ```

- **Documento (`_Doc.ts`)**:

  - É uma classe reativa que representa um único registro de dados (ex: um usuário).
  - Contém as propriedades dos dados, getters para dados derivados, e métodos para regras de negócio e validação (ex: com Zod).
  - O construtor geralmente aceita um objeto `snap` (snapshot) para popular a instância.
  - Inclui um método `takeSnapshot()` para extrair os dados puros para persistência.

  ```typescript
  // Exemplo: src/stores/modules/users/User_Doc.ts
  interface User_Data {
  	sub: string;
  	name: string;
  }

  class User_Doc {
  	constructor(snap: User_Data) {
  		Object.assign(this, snap);
  	}

  	public sub = '';
  	public name = '';

  	get isValid() {
  		// ...lógica de validação
  		return true;
  	}

  	async tryValidate() {
  		// ...validação com Zod
  	}

  	// Outras regras de negócio

  	takeSnapshot(): User_Data {
  		return { sub: this.sub, name: this.name };
  	}
  }
  ```

## 4. Padrões de Código

### **Ordem dos Imports**

Mantenha uma ordem consistente para facilitar a leitura.

```typescript
// 1. Imports do Vue e do framework
import { reactive, computed, onMounted } from 'vue';
import { QTableColumn } from 'quasar';

// 2. Bibliotecas de terceiros
import { cloneDeep } from 'lodash';

// 3. Utilitários e serviços internos
import { ApiError } from 'src/services/ApiError';
import { riid } from 'src/utils/riid';

// 4. Stores Pinia
import { useUserStore } from 'src/stores/modules/user';

// 5. Componentes e Layouts
import { Layout } from 'src/components/Layout';
import { Btn } from 'src/components/Btn';

// 6. Imports locais (tipos, controllers filhos)
import { MeuTipo_Data } from './interfaces';
import { MeuModal_Ctrl } from './components/MeuModal/MeuModal_Ctrl';
```

### **Tratamento de Erros**

- Sempre use `try/catch` em operações assíncronas (chamadas de API, etc.).
- Utilize um wrapper padronizado (`ApiError`) para tratar erros de API de forma consistente.
- Use um serviço de notificação (`AppNotify`) para feedback ao usuário.

## 5. Checklist para Agentes LLM

Antes de gerar ou modificar código, siga este checklist:

- [ ] **Análise Prévia**:
  - [ ] Analisei a estrutura de pastas existente?
  - [ ] Verifiquei se já existe um padrão similar no projeto para o que preciso criar?
  - [ ] Identifiquei os controllers, stores ou utils que preciso injetar ou consumir?
- [ ] **Durante o Desenvolvimento**:
  - [ ] Estou seguindo as convenções de nomenclatura para arquivos e classes?
  - [ ] A lógica de negócio está no `_Ctrl.ts` e a UI no `.vue`?
  - [ ] Estou usando os componentes de `src/components` em vez dos componentes nativos do Quasar?
  - [ ] A ordem dos `import` está correta?
  - [ ] Operações assíncronas estão com `try/catch` e tratamento de erro adequado?
- [ ] **Revisão Final**:
  - [ ] O código está fortemente tipado?
  - [ ] As props e emits dos componentes estão claros e tipados?
  - [ ] O novo código é testável de forma isolada?
  - [ ] Adicionei JSDoc ou comentários onde a lógica é complexa?

---

_Este documento é a fonte da verdade para o desenvolvimento neste projeto. Consulte-o sempre._
