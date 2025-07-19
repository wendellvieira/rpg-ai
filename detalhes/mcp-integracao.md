# Model Context Protocol (MCP) - Integração

## Visão Geral

O MCP serve como ponte entre as IAs (via OpenAI) e o sistema de jogo, permitindo que os agentes executem ações dentro do mundo do RPG.

## Arquitetura MCP

### Implementação Frontend

- **Sem servidor MCP separado**
- **Integrado diretamente no browser**
- **Comunicação via JavaScript/TypeScript**

### Funções Principais Expostas

#### Ações de Combate

```typescript
// Atacar outro personagem ou criatura
atacar(alvo: string, arma?: string): ResultadoAtaque

// Defender-se (aumenta CA temporariamente)
defender(): void

// Esquivar (aumenta chance de evitar ataques)
esquivar(): void
```

#### Ações de Movimento

```typescript
// Mover para uma posição
mover(destino: string, distancia?: number): boolean

// Aproximar-se de um alvo
aproximar(alvo: string): boolean

// Afastar-se de um alvo
afastar(alvo: string): boolean
```

#### Ações Mágicas

```typescript
// Lançar uma magia
lancarMagia(nomemagica: string, alvo?: string): ResultadoMagia

// Curar a si mesmo ou aliado
curar(alvo: string, pontosorcura?: number): ResultadoCura
```

#### Ações Sociais

```typescript
// Tentar persuadir um personagem
persuadir(alvo: string, argumento: string): ResultadoTeste

// Tentar intimidar
intimidar(alvo: string): ResultadoTeste

// Tentar enganar
enganar(alvo: string, mentira: string): ResultadoTeste
```

#### Testes de Atributo

```typescript
// Fazer teste de um atributo específico
testeAtributo(atributo: AtributoTipo, dificuldade?: number): ResultadoTeste

// Teste de perícia específica
testePericia(pericia: string, dificuldade?: number): ResultadoTeste
```

#### Gerenciamento de Conhecimento

```typescript
// Ler informação da base de conhecimento
lerConhecimento(termo: string): string[]

// Escrever nova informação na base
escreverConhecimento(conteudo: string): void

// Buscar em conhecimentos específicos
buscarConhecimento(query: string): string[]
```

#### Uso de Itens

```typescript
// Usar um item do inventário
usarItem(nomeItem: string, alvo?: string): ResultadoUsoItem

// Equipar/desequipar item
equipar(nomeItem: string): boolean
desequipar(nomeItem: string): boolean

// Examinar item em detalhe
examinarItem(nomeItem: string): DetalhesItem
```

#### Interação com Ambiente

```typescript
// Examinar o ambiente atual
examinarAmbiente(): DescricaoAmbiente

// Procurar por algo específico
procurar(objeto: string): ResultadoProcura

// Interagir com objeto do cenário
interagir(objeto: string, acao: string): ResultadoInteracao
```

## Limitações do MCP

### Restrições por Turno

- **Uma ação principal** por turno
- **Uma ação de movimento** por turno
- **Ações livres ilimitadas** (falar, examinar, etc.)

### Restrições de Recursos

- **MP para magias**
- **Uso limitado de itens especiais**
- **Cooldown de habilidades especiais**

### Validações

- **Alcance de ações** (não atacar inimigo muito longe)
- **Linha de visão** para magias e ataques
- **Recursos disponíveis** (MP, itens, etc.)

## Integração com Classes TypeScript

### Fluxo de Execução

1. **IA chama função MCP**
2. **MCP valida parâmetros**
3. **MCP chama método da classe apropriada**
4. **Classe executa lógica e retorna resultado**
5. **MCP formata resposta para IA**
6. **Resultado é exibido no chat**

### Exemplo de Implementação

```typescript
class MCPHandler {
  async atacar(personagemId: string, alvo: string, arma?: string) {
    const personagem = this.gameState.getPersonagem(personagemId);
    const alvoPersonagem = this.gameState.getPersonagem(alvo);

    const resultado = personagem.atacar(alvoPersonagem, arma);

    this.gameState.adicionarEvento({
      tipo: 'acao',
      personagem: personagemId,
      acao: 'atacar',
      resultado: resultado.toString(),
    });

    return resultado;
  }
}
```
