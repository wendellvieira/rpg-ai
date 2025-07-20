# Guia Completo do Usuário - RPG AI

## 🎮 Visão Geral

O RPG AI é uma aplicação web avançada para gerenciar sessões de RPG com integração de Inteligência Artificial. Este sistema permite que mestres e jogadores criem personagens, gerenciem inventários, conduzam combates e interajam com IAs que interpretam personagens.

## 📱 Instalação e Uso

### Como PWA (Progressive Web App)

1. **Acesse a aplicação** em seu navegador
2. **Procure pelo ícone de download** (⬇️) na barra superior
3. **Clique em "Instalar Aplicativo"**
4. **A aplicação será instalada** em seu dispositivo como um app nativo

### Navegadores Suportados

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## ⚙️ Configuração Inicial

### 1. Configurar APIs

**OpenAI (Para personagens IA):**

1. Clique no ícone de configurações (⚙️)
2. Aba "OpenAI"
3. Insira sua API Key
4. Teste a conexão

**Stability AI (Para geração de imagens):**

1. Aba "Stability AI"
2. Insira sua API Key
3. Configure parâmetros de qualidade
4. Teste a conexão

### 2. Personalizar Tema

- **Clique no ícone de tema** (🌓) na barra superior
- **Escolha entre:**
  - Automático (segue sistema)
  - Claro
  - Escuro
- **Atalho:** Ctrl+Shift+T

## 🎯 Funcionalidades Principais

### 📝 Gerenciamento de Sessões

**Criar Nova Sessão:**

1. Página inicial → "Nova Sessão"
2. Defina nome e descrição
3. Configure parâmetros iniciais

**Carregar Sessão:**

- Lista de sessões recentes na barra lateral
- Import/Export de dados completos

### 👥 Personagens

**Criar Personagem:**

1. Aba "Personagens"
2. "Novo Personagem"
3. Complete os dados:
   - Informações básicas (nome, classe, raça)
   - Atributos (Força, Destreza, etc.)
   - Inventário inicial
   - Configuração de IA (opcional)

**Editar Personagem:**

- Clique no ícone de edição no card do personagem
- Interface multi-aba:
  - **Básico:** Nome, classe, nível, pontos de vida
  - **Atributos:** D&D 5e completo com modificadores
  - **Inventário:** Armas, armaduras, itens consumíveis
  - **Conhecimento:** Base de dados pessoal do personagem
  - **IA:** Prompts e personalidade

### 🎒 Sistema de Inventário

**Tipos de Itens:**

- **Armas:** Dano, alcance, propriedades especiais
- **Armaduras:** CA, penalidades, requisitos
- **Consumíveis:** Usos, efeitos, durabilidade
- **Itens Gerais:** Descrição livre

**Gerenciar Itens:**

1. Aba "Itens"
2. Catálogo completo com filtros
3. Criar/editar itens personalizados
4. Atribuir aos personagens

### ✨ Sistema de Magias

**Magias Disponíveis:**

- Todas as escolas de magia D&D 5e
- Níveis 0-9 (truques a magias épicas)
- Componentes (verbal, somático, material)
- Tempo de conjuração e duração

**Gerenciar Magias:**

1. **Aprender:** Catálogo de magias → "Adicionar ao Personagem"
2. **Preparar:** Dialog de preparação de magias
3. **Conjurar:** Durante o jogo, consome slots apropriados
4. **Slots:** Visualização por nível com indicadores visuais

### ⚔️ Sistema de Combate

**Iniciativa:**

- Rolagem automática ou manual
- Ordem visual dos participantes
- Controles de turno para o mestre

**Ações de Combate:**

- **Atacar:** Escolha arma, alvo, rolagem automática
- **Defender:** Bônus de CA temporário
- **Conjurar:** Magias com efeitos automáticos
- **Usar Item:** Consumíveis e equipamentos

**Combate Avançado:**

- Cálculo automático de dano
- Sistema de aparar com armas
- Efeitos temporários
- Log detalhado de ações

### 🗺️ Sistema de Mapas

**Criar Mapas:**

1. Aba "Mapas"
2. "Novo Mapa"
3. Canvas interativo com:
   - Zoom e pan
   - Grid configurável
   - Objetos e anotações

**Geração com IA:**

- Prompts para Stability AI
- Templates predefinidos (dungeon, floresta, cidade)
- Edição com inpainting (em desenvolvimento)

### 💬 Chat e Interação

**Tipos de Mensagem:**

- **Mestre:** Narrativa e descrições
- **Jogador:** Ações dos personagens
- **Sistema:** Resultados de combate e testes
- **IA:** Respostas dos personagens NPCs

**Funcionalidades:**

- Histórico persistente
- Virtual scrolling para performance
- Formatação rica de texto
- Auto-scroll inteligente

## 🎛️ Funcionalidades Avançadas

### 🤖 Integração com IA

**Personagens IA:**

- Personalidade customizável via prompts
- Conhecimento contextual da sessão
- Respostas baseadas em dados do personagem
- Sistema MCP (Model Context Protocol)

**Ações Disponíveis para IA:**

- `atacar(alvo, arma?)` - Atacar outro personagem
- `defender()` - Ação defensiva
- `conjurarMagia(magia, alvo?)` - Lançar feitiços
- `usarItem(item, alvo?)` - Usar consumíveis
- `testeAtributo(atributo, dificuldade?)` - Testes de perícia
- `lerConhecimento(termo)` - Consultar memórias
- `escreverConhecimento(conteudo)` - Registrar informações

### 📊 Sistema de Persistência

**Auto-Save:**

- Salvamento automático a cada alteração
- Backup local seguro
- Versionamento de dados

**Import/Export:**

- JSON completo da sessão
- Backup manual de personagens
- Migração entre dispositivos

### ♿ Acessibilidade

**Recursos Implementados:**

- Navegação por teclado completa
- Aria-labels em elementos críticos
- Suporte a leitores de tela
- Tooltips informativos
- Contraste melhorado

**Atalhos de Teclado:**

- `Ctrl+Shift+T` - Alternar tema
- `Esc` - Fechar modais
- `Tab/Shift+Tab` - Navegação

### 📱 Responsividade

**Dispositivos Suportados:**

- Desktop (1920x1080+)
- Tablets (768-1024px)
- Smartphones (320-767px)

**Adaptações Mobile:**

- Interface simplificada
- Botões maiores para touch
- Layout vertical otimizado
- Gestos de navegação

## 🔧 Dicas de Uso

### Para Mestres

1. **Configure personagens IA** com personalidades distintas
2. **Use o sistema de conhecimento** para tracking de eventos importantes
3. **Aproveitie o auto-save** - não precisa salvar manualmente
4. **Organize mapas por sessão** usando naming consistente
5. **Configure hotkeys** para ações frequentes

### Para Jogadores

1. **Mantenha seu personagem atualizado** com equipamentos e magias
2. **Use a preparação de magias** estrategicamente
3. **Aproveite o sistema de conhecimento** para notas pessoais
4. **Comunique-se com NPCs IA** para roleplay imersivo

### Performance

1. **Use PWA** para melhor performance offline
2. **Limpe dados antigos** periodicamente via configurações
3. **Feche abas desnecessárias** durante sessões intensas
4. **Configure notificações** conforme sua preferência

## 🛠️ Solução de Problemas

### Problemas Comuns

**IA não responde:**

- Verifique a API key nas configurações
- Teste a conexão na aba de configurações
- Verifique sua conexão com internet

**Performance lenta:**

- Instale como PWA
- Feche outras abas do navegador
- Limpe cache do navegador

**Dados perdidos:**

- Use a função de export regularmente
- Verifique se auto-save está funcionando
- Backup manual importante antes de updates

**PWA não instala:**

- Use Chrome/Edge para melhor suporte
- Verifique se está em HTTPS
- Limpe cache e tente novamente

### Suporte

Para problemas técnicos ou sugestões:

1. Verifique os logs do console (F12)
2. Exporte dados da sessão problemática
3. Descreva os passos para reproduzir o issue
4. Inclua informações do navegador e sistema

## 🔮 Roadmap Futuro

### Funcionalidades Planejadas

- **Multiplayer real-time** com WebRTC
- **Áudio ambiente** e efeitos sonoros
- **Dice rollers visuais** com animações 3D
- **Upload de imagens** para personagens e mapas
- **Sistema de campanhas** com múltiplas sessões
- **Marketplace de conteúdo** compartilhado
- **Integração com VTTs** existentes

### Melhorias Contínuas

- Performance e otimizações
- Novas integrações de IA
- Mais templates e assets
- Funcionalidades de acessibilidade
- Suporte a mais idiomas

---

**RPG AI v1.0** - Desenvolvido com ❤️ para a comunidade RPG
