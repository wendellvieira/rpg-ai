# Arquitetura do Projeto RPG-AI

## Visão Geral

O RPG-AI é um simulador de RPG onde múltiplas IAs interpretam personagens em uma sessão interativa. O sistema funciona inteiramente no frontend, sem necessidade de backend.

## Tecnologias Principais

- **Frontend**: Vue 3 + Quasar Framework
- **Persistência**: LocalForage/IndexedDB
- **IA**: OpenAI API
- **Interface com IAs**: Model Context Protocol (MCP)
- **Linguagem**: TypeScript

## Estrutura da Aplicação

### Frontend (Vue/Quasar)

- **Apenas interface de usuário**
- **Sem lógica de negócio nos componentes**
- **Responsável apenas por exibir dados e capturar interações**

### Camada de Negócio (TypeScript Classes)

- **Classes para todas as entidades**
- **Implementação de todas as mecânicas de jogo**
- **Gerenciamento de estado e persistência**

### MCP (Model Context Protocol)

- **Interface entre IAs e sistema de jogo**
- **Funções expostas para as IAs executarem ações**
- **Integrado no frontend (sem servidor separado)**

## Separação de Responsabilidades

### Vue Components

- Renderização da interface
- Captura de eventos do usuário
- Binding de dados
- Navegação entre telas

### TypeScript Classes

- Lógica de negócio
- Cálculos de mecânicas
- Validações
- Persistência de dados
- Gerenciamento de estado

### MCP Layer

- Exposição de funções para IAs
- Tradução entre comandos das IAs e sistema interno
- Contextualização de informações para cada personagem

## Fluxo de Dados

1. **Usuário interage** com componente Vue
2. **Componente chama** método de classe TypeScript
3. **Classe executa** lógica e atualiza estado
4. **Estado é persistido** via LocalForage
5. **Vue reativa** às mudanças de estado
6. **IAs recebem contexto** via MCP
7. **IAs executam ações** através de funções MCP
8. **MCP chama** métodos das classes TypeScript
9. **Ciclo se repete**
