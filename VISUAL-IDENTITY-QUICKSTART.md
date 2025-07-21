# 🎨 GUIA RÁPIDO - VISUAL IDENTITY RPG-AI

## ⚡ Comandos de Execução

```bash
# === MODO PREDEFINIDO ===
# 1. Gerar TODOS os assets (recomendado para primeira execução)
./generate-ui-assets.sh all

# 2. Gerar apenas uma categoria específica
./generate-ui-assets.sh icons
./generate-ui-assets.sh backgrounds
./generate-ui-assets.sh characters

# === MODO CUSTOMIZADO BÁSICO ===
# 3. Gerar asset personalizado
./generate-ui-assets.sh prompt "Icone de espada estilo game engine"
./generate-ui-assets.sh prompt "Escudo mágico com runas" icons escudo-magico
./generate-ui-assets.sh prompt "Background de taverna medieval" backgrounds taverna

# === MODO CUSTOMIZADO COM TAMANHOS (NOVO!) ===
# 4. Tamanho único customizado
./generate-custom-asset.sh -s 128x128 "Ícone de espada mágica" icons espada
./generate-custom-asset.sh --size 1024x1024 "Background floresta" backgrounds floresta

# 5. Múltiplos tamanhos (gera o maior e redimensiona)
./generate-custom-asset.sh -m 64x64,128x128,256x256 "Poção de vida" items pocao
./generate-custom-asset.sh --multi 32x32,64x64,128x128 "Ícone de inventário" icons inventario

# 6. Processar e otimizar assets gerados
./process-assets.sh

# 7. Testar API (opcional)
./test-image.sh
```

## 📁 Estrutura Criada

```
generated-assets/          # Assets brutos da API (backup)
├── icons/
├── backgrounds/
├── characters/
├── items/
├── spells/
└── maps/

public/generated-assets/    # Assets prontos para uso na interface
├── icons/
├── backgrounds/
├── characters/
├── items/
├── spells/
└── maps/

src/assets/generated/       # Assets processados e otimizados
├── index.ts               # Índice de assets
├── useGeneratedAssets.ts  # Composable Vue
├── icons/
├── backgrounds/
├── characters/
├── items/
├── spells/
└── maps/
```

## 📏 Tamanhos e Otimizações

### **Tamanhos Automáticos por Categoria**

- **Icons & Spells**: 128x128 pixels (otimizado para UI)
- **Items & Characters**: 256x256 pixels (detalhado para visualização)
- **Backgrounds**: 1024x1024 pixels (alta resolução)
- **Maps**: 512x512 pixels (equilibrado para tiles)

### **Recursos de Tamanho Customizado**

```bash
# Tamanho único
./generate-custom-asset.sh -s 64x64 "Mini ícone" icons mini-icone

# Múltiplos tamanhos (otimizado!)
./generate-custom-asset.sh -m 32x32,64x64,128x128 "Ícone responsivo" icons responsivo
# ↳ Gera 128x128 via API e redimensiona automaticamente para 64x64 e 32x32
```

### **Vantagens do Sistema Multi-Size**

- 💰 **Economia de API**: Gera 1 imagem grande, redimensiona localmente
- ⚡ **Performance**: Tamanhos menores carregam mais rápido
- 📱 **Responsivo**: Diferentes tamanhos para diferentes contextos
- 🎯 **Qualidade**: ImageMagick preserva qualidade no redimensionamento

## 🔥 Uso no Código Vue

```vue
<template>
  <!-- Usar asset gerado diretamente -->
  <img src="/generated-assets/icons/espada-magica.png" alt="Espada Mágica" />

  <!-- Assets com múltiplos tamanhos -->
  <img src="/generated-assets/icons/inventario-32x32.png" class="icon-small" />
  <img src="/generated-assets/icons/inventario-64x64.png" class="icon-medium" />
  <img src="/generated-assets/icons/inventario-128x128.png" class="icon-large" />

  <!-- Usando composable -->
  <img :src="iconSrc" alt="Asset dinâmico" v-if="iconSrc" />

  <!-- Responsive com diferentes tamanhos -->
  <picture>
    <source media="(max-width: 480px)" srcset="/generated-assets/icons/menu-32x32.png" />
    <source media="(max-width: 768px)" srcset="/generated-assets/icons/menu-64x64.png" />
    <img src="/generated-assets/icons/menu-128x128.png" alt="Menu" />
  </picture>
</template>

<script setup>
import { useGeneratedAssets } from '@/assets/generated/useGeneratedAssets';

const { getAsset, isLoading } = useGeneratedAssets();

// Carregar asset
const iconSrc = await getAsset('icons', 'espada-magica');
</script>

<style scoped>
.icon-small {
  width: 32px;
  height: 32px;
}
.icon-medium {
  width: 64px;
  height: 64px;
}
.icon-large {
  width: 128px;
  height: 128px;
}
</style>
```

## 🔥 Uso no Código Vue

```typescript
// Em qualquer componente
import { useGeneratedAssets } from '@/assets/generated/useGeneratedAssets';

export default {
  setup() {
    const { getAsset, isLoading } = useGeneratedAssets();

    // Usar asset
    const iconSrc = await getAsset('icons', 'btn-create');

    return { iconSrc, isLoading };
  },
};
```

## 🎯 Assets Principais Gerados

### Ícones (128x128)

- `btn-*`: Botões de ação
- `nav-*`: Navegação
- `status-*`: Status de personagem

### Backgrounds (1920x1080)

- `bg-*`: Fundos principais
- `texture-*`: Texturas
- `pattern-*`: Padrões

### Characters (256x256)

- Classes: warrior, mage, rogue, cleric
- Raças: human, elf, dwarf, halfling

### Items (256x256)

- Armas, armaduras, poções, scrolls

### Spells (128x128)

- Efeitos mágicos por elemento

### Maps (256x256)

- Tiles de cenários

## 💡 Próximos Passos

1. **Teste com asset customizado**:

   ```bash
   ./generate-ui-assets.sh prompt "Icone de espada estilo game engine" icons espada-teste
   ```

2. **Execute para gerar tudo**:

   ```bash
   ./generate-ui-assets.sh all && ./process-assets.sh
   ```

3. **Use na interface**: Assets ficam em `/public/generated-assets/`

4. **Continue refatoração**: Siga as tarefas do `version-1.md`

## 🛠️ Dependências Opcionais

- **ImageMagick**: Para otimização de imagens
- **WebP tools**: Para conversão WebP
- **Stability AI API Key**: No arquivo `.env`

```bash
# Instalar dependências opcionais (macOS)
brew install imagemagick webp
```

## ✅ Validação

- [ ] API key configurada no `.env`
- [ ] Scripts executáveis (`chmod +x *.sh`)
- [ ] Assets gerados em `generated-assets/`
- [ ] Assets processados em `src/assets/generated/`
- [ ] Composable funcionando nos componentes
