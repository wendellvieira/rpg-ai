# Sistema de Chat e Turnos

## Funcionamento Básico

### Estrutura de Turnos

```typescript
interface SistemaDesturnos {
  participantes: Personagem[]; // Array ordenado de participantes
  turnoAtual: number; // Índice do participante atual
  rodada: number; // Número da rodada atual
}
```

### Fluxo de Turnos

1. **Sistema percorre array** de participantes em loop
2. **Cada personagem** tem sua vez de agir
3. **Mestre pode interferir** a qualquer momento
4. **Personagens podem ser adicionados/removidos** dinamicamente

### Controle do Mestre

- **Adicionar personagem** ao meio da sessão
- **Remover personagem** (morte, saída)
- **Pular turno** de um personagem
- **Avançar turno** manualmente
- **Pausar/retomar** a sessão
- **Personificar qualquer personagem**

## Interface de Chat

### Layout Dividido (Quasar Splitter)

```
┌─────────────────┬──────────────────────┐
│                 │                      │
│   RECURSOS      │      CHAT            │
│   - Mapas       │      - Mensagens     │
│   - Personagens │      - Controles     │
│   - Itens       │      - Status        │
│   - Armas       │                      │
│                 │                      │
└─────────────────┴──────────────────────┘
```

### Área de Recursos (Esquerda)

- **Abas organizadas** por tipo de recurso
- **Drag & Drop** para adicionar ao chat
- **Edição rápida** de propriedades
- **Criação de novos** recursos

### Área de Chat (Direita)

- **Histórico de mensagens**
- **Indicador de turno atual**
- **Controles do mestre**
- **Status dos personagens**

## Tipos de Mensagem

### Mensagem de Fala

```typescript
interface MensagemFala {
  tipo: 'fala';
  personagem: string;
  conteudo: string;
  timestamp: Date;
  turno: number;
}
```

### Mensagem de Ação

```typescript
interface MensagemAcao {
  tipo: 'acao';
  personagem: string;
  acao: string;
  resultado: string;
  dados?: ResultadoDados;
  timestamp: Date;
  turno: number;
}
```

### Mensagem do Sistema

```typescript
interface MensagemSistema {
  tipo: 'sistema';
  conteudo: string;
  timestamp: Date;
  turno: number;
}
```

## Integração com IAs

### Contexto Enviado para IA

```typescript
interface ContextoIA {
  personagem: Personagem;
  eventosRecentes: string[];
  conhecimentos: string[];
  situacaoAtual: string;
  participantesProximos: Personagem[];
}
```

### Processamento de Resposta

1. **IA envia resposta** via OpenAI
2. **Sistema processa** comandos MCP
3. **Executa ações** se solicitadas
4. **Adiciona mensagem** ao chat
5. **Atualiza eventos** do personagem
6. **Avança para próximo** turno
