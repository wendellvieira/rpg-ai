# Sistema de Personagens

## Estrutura Base

### Atributos Primários (D&D 5e em Português)

```typescript
interface AtributosPrimarios {
  forca: number; // Força física, dano corpo a corpo
  destreza: number; // Agilidade, precisão, furtividade
  constituicao: number; // Resistência, pontos de vida
  inteligencia: number; // Raciocínio, conhecimento
  sabedoria: number; // Percepção, intuição
  carisma: number; // Presença, persuasão
}
```

### Atributos Derivados

```typescript
interface AtributosDerivados {
  hp: number; // Pontos de Vida
  hpMaximo: number; // HP Máximo
  mp: number; // Pontos de Magia
  mpMaximo: number; // MP Máximo
  ca: number; // Classe de Armadura
  iniciativa: number; // Ordem no combate
  velocidade: number; // Movimento por turno
}
```

### Sistema de Modificadores

- **Modificador de Atributo**: `(valor - 10) / 2` (arredondado para baixo)
- **Exemplo**: Força 16 = modificador +3

### Testes de Atributo

- **d20 + modificador vs Dificuldade**
- **Dificuldades padrão**: Fácil (10), Médio (15), Difícil (20)

## Sistema de Conhecimento e Memória

### Eventos do Personagem

```typescript
interface Personagem {
  eventos: string[]; // Resumos dos turnos anteriores
  conhecimentos: string[]; // Base de conhecimento do personagem
}
```

### Contextualização para IAs

Cada IA recebe:

1. **Seus próprios eventos** (sua interpretação da história)
2. **Falas próximas** (últimas interações relevantes)
3. **Seus conhecimentos** (informações que possui)
4. **Status atual** (HP, MP, equipamentos, etc.)

### Funções MCP de Conhecimento

- `lerConhecimento(termo: string)`: Busca informação na base de conhecimento
- `escreverConhecimento(conteudo: string)`: Adiciona nova informação

## Classes e Raças

### Sistema Modular

- **Baseado em D&D 5e**
- **Classes**: Guerreiro, Mago, Ladino, Clérigo, etc.
- **Raças**: Humano, Elfo, Anão, Halfling, etc.
- **Cada combinação gera modificadores únicos**

### Progressão

- **Níveis de 1 a 20**
- **Pontos de experiência**
- **Habilidades especiais por nível**
