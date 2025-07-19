# Sistema de Itens e Equipamentos

## Categorias de Itens

### Armas

```typescript
interface Arma extends ItemBase {
  tipo: 'arma';
  categoriaArma: 'corpo-a-corpo' | 'distancia' | 'arremesso';
  dano: string; // Ex: "1d8", "2d6+1"
  tipoDano: TipoDano; // físico, fogo, gelo, etc.
  alcance: number; // Em metros
  propriedades: PropriedadeArma[];
  critico: number; // Multiplicador crítico
  bonusAtaque?: number; // Armas mágicas
  bonusDano?: number; // Armas mágicas
}

type PropriedadeArma =
  | 'leve' // Pode usar duas armas
  | 'pesada' // Duas mãos obrigatório
  | 'versátil' // Uma ou duas mãos
  | 'sutil' // Usa destreza mesmo sendo corpo-a-corpo
  | 'alcance' // Alcance estendido
  | 'arremesso' // Pode ser arremessada
  | 'munição' // Requer munição
  | 'recarga' // Precisa recarregar
  | 'especial'; // Propriedade única
```

### Armaduras

```typescript
interface Armadura extends ItemBase {
  tipo: 'armadura';
  categoriaArmadura: 'leve' | 'media' | 'pesada' | 'escudo';
  bonusCA: number; // Bônus de Classe de Armadura
  maxDestreza?: number; // Máx de bônus Destreza aplicável
  penalidade?: number; // Penalidade em testes de furtividade
  forcaMinima?: number; // Força mínima para usar
  resistencias?: TipoDano[]; // Resistências a tipos de dano
}
```

### Itens Consumíveis

```typescript
interface Consumivel extends ItemBase {
  tipo: 'consumivel';
  efeito: EfeitoItem;
  usos: number; // Quantas vezes pode ser usado
  usosRestantes: number;
  duracaoEfeito?: number; // Em turnos
  tempoUso: 'acao' | 'acao-bonus' | 'reacao' | 'livre';
}

interface EfeitoItem {
  cura?: number; // Pontos de vida recuperados
  curaMp?: number; // Pontos de magia recuperados
  bonusTemporario?: {
    // Bônus temporários
    atributo: string;
    valor: number;
    duracao: number;
  };
  removerEfeito?: string[]; // Remove debuffs
}
```

### Itens Mágicos

```typescript
interface ItemMagico extends ItemBase {
  tipo: 'magico';
  raridade: 'comum' | 'incomum' | 'raro' | 'muito-raro' | 'lendario';
  sintonizacao: boolean; // Requer sintonização
  cargas?: number; // Cargas mágicas
  cargasRestantes?: number;
  recarregaEm?: 'amanhecer' | 'anoitecer' | 'lua-cheia';
  habilidadesEspeciais: HabilidadeEspecial[];
}

interface HabilidadeEspecial {
  nome: string;
  descricao: string;
  custoCarga?: number;
  recarga: string; // "1d6 dias", "ao amanhecer", etc.
  efeito: EfeitoCompleto;
}
```

## Sistema de Inventário

### Estrutura do Inventário

```typescript
interface Inventario {
  personagemId: string;
  itens: ItemInventario[];
  pesoTotal: number;
  pesoMaximo: number; // Baseado em Força
  moedas: {
    ouro: number;
    prata: number;
    cobre: number;
  };
  equipamentos: Equipamentos;
}

interface ItemInventario {
  itemId: string;
  quantidade: number;
  equipado: boolean;
  localizacao: 'inventario' | 'equipado' | 'mochila-magica';
}
```

### Slots de Equipamento

```typescript
interface Equipamentos {
  armaoPrincipal?: string; // ID do item
  armaoSecundaria?: string;
  armadura?: string;
  escudo?: string;
  casco?: string;
  botas?: string;
  luvas?: string;
  cinto?: string;
  colar?: string;
  anel1?: string;
  anel2?: string;
  capa?: string;
}
```

## Criação e Modificação

### Gerador de Itens

```typescript
class GeradorItens {
  gerarArmaMagica(nivel: number): Arma;
  gerarArmaduraMagica(nivel: number): Armadura;
  gerarItemMagico(raridade: RaridadeItem): ItemMagico;
  gerarTesouro(valorTotal: number): ItemInventario[];
}
```

### Editor de Itens

- **Interface visual** para criação
- **Templates predefinidos** (espada longa, poção de cura, etc.)
- **Validação de propriedades**
- **Preview do item** antes de salvar

### Importação de Itens

- **Base de dados D&D 5e**
- **Itens customizados da comunidade**
- **Import via JSON/CSV**

## Mecânicas de Uso

### Equipar/Desequipar

```typescript
class InventarioManager {
  equiparItem(personagemId: string, itemId: string, slot: SlotEquipamento): boolean;
  desequiparItem(personagemId: string, slot: SlotEquipamento): boolean;
  verificarCompatibilidade(item: ItemBase, personagem: Personagem): boolean;
}
```

### Uso de Itens

```typescript
// Via MCP
usarItem(nomeItem: string, alvo?: string): ResultadoUsoItem {
  const item = this.encontrarItem(nomeItem);
  const resultado = item.usar(this.personagemAtual, alvo);

  if (item.consumivel) {
    this.reduzirQuantidade(item.id, 1);
  }

  return resultado;
}
```

### Durabilidade (Opcional)

```typescript
interface Durabilidade {
  atual: number;
  maximo: number;
  reparavel: boolean;
  custoReparo: number;
}
```

## Economia do Jogo

### Sistema Monetário D&D

- **1 ouro = 10 pratas = 100 cobres**
- **Valores baseados no SRD 5.1**
- **Inflação automática** por nível

### Comércio

```typescript
interface Comerciante {
  id: string;
  nome: string;
  inventario: ItemInventario[];
  especialidade: TipoItem[];
  modificadorPreco: number; // 0.8 = 20% desconto
  itensInteresse: string[]; // IDs de itens que compra
}
```

### Craft de Itens

```typescript
interface ReceitaCraft {
  resultado: string; // ID do item resultante
  materiais: MaterialCraft[];
  tempo: number; // Em horas
  ferramentasnecessarias: string[];
  dificuldade: number; // CD do teste
  atributoTeste: AtributoTipo;
}

interface MaterialCraft {
  itemId: string;
  quantidade: number;
  consumido: boolean; // Se é consumido no processo
}
```
