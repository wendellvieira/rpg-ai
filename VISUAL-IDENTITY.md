# 🎨 RPG-AI Visual Identity Guide

## 🎭 **CONCEITO GERAL**

- **Tema:** Dark Fantasy RPG com toques místicos
- **Paleta:** Roxo escuro, dourado, preto, com acentos de energia mágica
- **Estilo:** Arte digital detalhada, atmosfera mágica, elementos rúnicos

## 🌈 **PALETA DE CORES**

```css
--primary-purple: #6b46c1 /* Roxo místico principal */ --secondary-gold: #f59e0b
  /* Dourado mágico */ --dark-bg: #1f2937 /* Fundo escuro */ --accent-blue: #3b82f6 /* Azul mana */
  --accent-red: #ef4444 /* Vermelho vida */ --accent-green: #10b981 /* Verde cura */;
```

## ✨ **ELEMENTOS VISUAIS**

- **Bordas:** Detalhes rúnicos, ornamentos mágicos
- **Texturas:** Pergaminho antigo, pedra mística, metal encantado
- **Efeitos:** Brilhos mágicos, auras de energia, partículas flutuantes
- **Tipografia:** Fontes que remetem fantasia medieval

## 🎯 **CATEGORIAS DE ASSETS**

### 🔘 **ÍCONES (128x128)**

- Botões de ação (criar, editar, deletar, salvar)
- Navegação (personagens, itens, magias, mapas)
- Status e atributos (vida, mana, força, etc.)

### 🖼️ **BACKGROUNDS (variados)**

- Fundo principal da interface (1920x1080)
- Fundos de modais (800x600)
- Padrões e texturas (512x512 seamless)

### 👤 **PERSONAGENS (256x256)**

- Avatares por classe (guerreiro, mago, ladino, clérigo)
- Avatares por raça (humano, elfo, anão, halfling)
- Expressões e variações

### ⚔️ **ITENS (256x256 para grandes, 128x128 para pequenos)**

- Armas (espadas, arcos, cajados)
- Armaduras (leve, média, pesada)
- Consumíveis (poções, pergaminhos)

### ✨ **MAGIAS (128x128)**

- Ícones por escola (fogo, gelo, raio, cura, proteção)
- Efeitos visuais de conjuração
- Símbolos rúnicos por elemento

### 🗺️ **MAPAS (256x256)**

- Elementos de terreno (montanha, floresta, rio)
- Estruturas (castelo, vila, masmorra)
- Marcos e pontos de interesse

## 🚀 **COMO USAR**

### Gerar todos os assets:

```bash
./generate-ui-assets.sh all
```

### Gerar categoria específica:

```bash
./generate-ui-assets.sh icons      # Só ícones
./generate-ui-assets.sh characters # Só personagens
./generate-ui-assets.sh items      # Só itens
```

### Integrar no projeto:

```bash
cp -r generated-assets/* src/assets/generated/
```

## 🎨 **PROMPTS BASE**

### Estilo Principal:

```
fantasy RPG, dark magical theme, purple and gold accents, mystical aura, detailed digital art
```

### Negative Prompt:

```
ugly, blurry, low quality, watermark, text, signature, realistic photo
```

## 📱 **IMPLEMENTAÇÃO NO PROJETO**

### Componente de Ícone Mágico:

```vue
<template>
  <div class="magic-icon" :class="iconClass">
    <img :src="iconSrc" :alt="alt" />
    <div class="magic-glow" v-if="glowing"></div>
  </div>
</template>
```

### CSS com Identidade Visual:

```scss
.magic-icon {
  position: relative;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-purple), var(--dark-bg));
  border: 2px solid var(--secondary-gold);
  box-shadow: 0 0 20px rgba(107, 70, 193, 0.3);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
}

.magic-glow {
  position: absolute;
  inset: -2px;
  background: radial-gradient(circle, var(--secondary-gold), transparent);
  border-radius: inherit;
  animation: pulse 2s infinite;
}
```

## 🔮 **PRÓXIMOS PASSOS**

1. **Gerar assets iniciais** com o script
2. **Testar integração** nos componentes
3. **Refinar prompts** baseado nos resultados
4. **Criar variações** para diferentes estados (hover, active, disabled)
5. **Implementar sistema de temas** com assets intercambiáveis
