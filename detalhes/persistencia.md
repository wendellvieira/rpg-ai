# Sistema de Persistência

## Tecnologia: LocalForage + IndexedDB

### Vantagens

- **Funciona offline**
- **Não requer servidor**
- **Armazenamento local no browser**
- **API Promise-based**
- **Fallback automático** (IndexedDB → WebSQL → localStorage)

## Estrutura de Dados

### Stores Principais

```typescript
// Configuração das stores
const stores = {
  sessoes: 'rpg_sessoes',
  personagens: 'rpg_personagens',
  itens: 'rpg_itens',
  mapas: 'rpg_mapas',
  configuracoes: 'rpg_config',
};
```

### Sessões de Jogo

```typescript
interface SessaoJogo {
  id: string;
  nome: string;
  descricao: string;
  criadaEm: Date;
  atualizadaEm: Date;
  participantes: string[]; // IDs dos personagens
  mensagens: Mensagem[]; // Histórico completo
  turnoAtual: number;
  rodada: number;
  status: 'ativa' | 'pausada' | 'finalizada';
}
```

### Personagens

```typescript
interface PersonagemPersistido {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  nivel: number;
  atributos: AtributosPrimarios;
  atributosDerivados: AtributosDerivados;
  inventario: string[]; // IDs dos itens
  equipamentos: Equipamentos;
  eventos: string[]; // Histórico pessoal
  conhecimentos: string[]; // Base de conhecimento
  criadoEm: Date;
  atualizadoEm: Date;
  isIA: boolean; // Se é controlado por IA
  promptPersonalidade?: string; // Prompt da IA
}
```

### Itens e Equipamentos

```typescript
interface ItemPersistido {
  id: string;
  nome: string;
  tipo: TipoItem;
  descricao: string;
  propriedades: Record<string, any>;
  valor: number;
  peso: number;
  raro: boolean;
  magico: boolean;
  criadoEm: Date;
}
```

### Mapas e Cenários

```typescript
interface MapaPersistido {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl?: string;
  dimensoes: { largura: number; altura: number };
  objetos: ObjetoMapa[];
  criadoEm: Date;
}
```

## Operações de Persistência

### Classe de Gerenciamento

```typescript
class PersistenceManager {
  // Salvar dados
  async salvar<T>(store: string, id: string, dados: T): Promise<void>;

  // Carregar dados
  async carregar<T>(store: string, id: string): Promise<T | null>;

  // Listar todos
  async listarTodos<T>(store: string): Promise<T[]>;

  // Deletar
  async deletar(store: string, id: string): Promise<void>;

  // Buscar por critério
  async buscar<T>(store: string, filtro: (item: T) => boolean): Promise<T[]>;
}
```

### Auto-save

- **Salvamento automático** a cada ação importante
- **Debounce** para evitar salvamentos excessivos
- **Versionamento básico** para recuperação

### Backup/Export

```typescript
interface BackupCompleto {
  versao: string;
  criadoEm: Date;
  sessoes: SessaoJogo[];
  personagens: PersonagemPersistido[];
  itens: ItemPersistido[];
  mapas: MapaPersistido[];
  configuracoes: ConfiguracoesGlobais;
}
```

## Estratégias de Sincronização

### Estado Reativo

- **Pinia stores** conectadas à persistência
- **Watchers** para auto-save
- **Computed properties** para dados derivados

### Cache Local

- **Cache em memória** para dados frequentes
- **Lazy loading** para dados grandes
- **Invalidação** quando dados mudam

### Migração de Dados

```typescript
interface MigracaoVersao {
  versaoOrigem: string;
  versaoDestino: string;
  migrar(dados: any): any;
}
```

## Configurações Globais

### Configurações do Usuário

```typescript
interface ConfiguracoesGlobais {
  apiKeyOpenAI: string;
  modeloIA: string;
  configuracoesMCP: MCPConfig;
  tema: 'claro' | 'escuro';
  idioma: string;
  autoSave: boolean;
  intervaloBR: number; // Backup automático (minutos)
}
```

### Segurança

- **API Key criptografada** localmente
- **Não versionamento** de dados sensíveis
- **Limpeza automática** de dados temporários
