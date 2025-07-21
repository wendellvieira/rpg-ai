#!/bin/bash

# 🔧 RPG-AI Asset Processor
# Processa e otimiza os assets gerados para uso na interface
# Uso: ./process-assets.sh

ASSETS_DIR="generated-assets"
OUTPUT_DIR="src/assets/generated"
TEMP_DIR="temp-processing"

echo "🔧 === PROCESSADOR DE ASSETS ==="

# Criar diretórios
mkdir -p "$OUTPUT_DIR"/{icons,backgrounds,characters,items,spells,maps}
mkdir -p "$TEMP_DIR"

# Função para otimizar imagem (se ImageMagick estiver instalado)
optimize_image() {
    local input="$1"
    local output="$2"
    local size="$3"
    
    if command -v magick &> /dev/null; then
        # Redimensionar e otimizar
        magick "$input" -resize "${size}x${size}" -quality 85 -strip "$output"
        echo "✅ Otimizado: $(basename "$output")"
    else
        # Apenas copiar se não tiver ImageMagick
        cp "$input" "$output"
        echo "📋 Copiado: $(basename "$output")"
    fi
}

# Função para criar versões WebP
create_webp() {
    local input="$1"
    local output="${1%.*}.webp"
    
    if command -v cwebp &> /dev/null; then
        cwebp -q 85 "$input" -o "$output"
        echo "🌐 WebP criado: $(basename "$output")"
    fi
}

# Processar cada categoria
process_category() {
    local category="$1"
    local target_size="$2"
    
    if [ -d "$ASSETS_DIR/$category" ]; then
        echo "📂 Processando categoria: $category"
        
        for file in "$ASSETS_DIR/$category"/*.png; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                clean_name=$(echo "$filename" | sed 's/-[0-9]*\.png/.png/')
                
                optimize_image "$file" "$OUTPUT_DIR/$category/$clean_name" "$target_size"
                create_webp "$OUTPUT_DIR/$category/$clean_name"
            fi
        done
    fi
}

# Processar todas as categorias
echo "🎯 Processando ícones..."
process_category "icons" "128"

echo "🖼️ Processando backgrounds..."
process_category "backgrounds" "1920"

echo "👤 Processando personagens..."
process_category "characters" "256"

echo "⚔️ Processando itens..."
process_category "items" "256"

echo "✨ Processando magias..."
process_category "spells" "128"

echo "🗺️ Processando mapas..."
process_category "maps" "256"

# Criar índice de assets
create_asset_index() {
    echo "📝 Criando índice de assets..."
    
    cat > "$OUTPUT_DIR/index.ts" << 'EOF'
// 🎨 RPG-AI Generated Assets Index
// Auto-gerado pelo process-assets.sh

export const GeneratedAssets = {
  icons: {
    // Botões
    btnCreate: () => import('./icons/btn-create.png'),
    btnEdit: () => import('./icons/btn-edit.png'),
    btnDelete: () => import('./icons/btn-delete.png'),
    btnSave: () => import('./icons/btn-save.png'),
    
    // Navegação
    navCharacters: () => import('./icons/nav-characters.png'),
    navItems: () => import('./icons/nav-items.png'),
    navSpells: () => import('./icons/nav-spells.png'),
    navMaps: () => import('./icons/nav-maps.png'),
    navCombat: () => import('./icons/nav-combat.png'),
    navSettings: () => import('./icons/nav-settings.png'),
    
    // Status
    statusHealth: () => import('./icons/status-health.png'),
    statusMana: () => import('./icons/status-mana.png'),
    statusArmor: () => import('./icons/status-armor.png'),
    statusStrength: () => import('./icons/status-strength.png'),
  },
  
  backgrounds: {
    main: () => import('./backgrounds/bg-main.png'),
    modal: () => import('./backgrounds/bg-modal.png'),
    sidebar: () => import('./backgrounds/bg-sidebar.png'),
    patterns: {
      magic: () => import('./backgrounds/pattern-magic.png'),
      parchment: () => import('./backgrounds/texture-parchment.png'),
      stone: () => import('./backgrounds/texture-stone.png'),
    }
  },
  
  characters: {
    classes: {
      warrior: () => import('./characters/avatar-warrior.png'),
      mage: () => import('./characters/avatar-mage.png'),
      rogue: () => import('./characters/avatar-rogue.png'),
      cleric: () => import('./characters/avatar-cleric.png'),
    },
    races: {
      human: () => import('./characters/avatar-human.png'),
      elf: () => import('./characters/avatar-elf.png'),
      dwarf: () => import('./characters/avatar-dwarf.png'),
      halfling: () => import('./characters/avatar-halfling.png'),
    }
  },
  
  items: {
    weapons: {
      sword: () => import('./items/weapon-sword.png'),
      bow: () => import('./items/weapon-bow.png'),
      staff: () => import('./items/weapon-staff.png'),
    },
    armor: {
      light: () => import('./items/armor-light.png'),
      medium: () => import('./items/armor-medium.png'),
      heavy: () => import('./items/armor-heavy.png'),
    },
    consumables: {
      healthPotion: () => import('./items/potion-health.png'),
      manaPotion: () => import('./items/potion-mana.png'),
      spellScroll: () => import('./items/scroll-spell.png'),
    }
  },
  
  spells: {
    fire: () => import('./spells/magic-fire.png'),
    ice: () => import('./spells/magic-ice.png'),
    lightning: () => import('./spells/magic-lightning.png'),
    healing: () => import('./spells/magic-healing.png'),
    protection: () => import('./spells/magic-protection.png'),
    illusion: () => import('./spells/magic-illusion.png'),
  },
  
  maps: {
    dungeon: () => import('./maps/map-dungeon.png'),
    forest: () => import('./maps/map-forest.png'),
    mountain: () => import('./maps/map-mountain.png'),
    river: () => import('./maps/map-river.png'),
    village: () => import('./maps/map-village.png'),
    castle: () => import('./maps/map-castle.png'),
  }
};

// Helper para carregar asset
export async function loadAsset(path: keyof typeof GeneratedAssets | string) {
  try {
    if (typeof path === 'string') {
      return await import(`./generated/${path}`);
    }
    // Para chaves aninhadas, implementar navegação por objeto
    return null;
  } catch (error) {
    console.warn(`Asset not found: ${path}`);
    return null;
  }
}

export type AssetCategory = keyof typeof GeneratedAssets;
EOF

    echo "✅ Índice criado: $OUTPUT_DIR/index.ts"
}

# Criar composable Vue para assets
create_asset_composable() {
    echo "🔧 Criando composable Vue..."
    
    cat > "$OUTPUT_DIR/useGeneratedAssets.ts" << 'EOF'
// 🎨 Composable para usar assets gerados
import { ref, computed } from 'vue';
import { GeneratedAssets, loadAsset } from './index';

export function useGeneratedAssets() {
  const loadedAssets = ref<Record<string, string>>({});
  const loadingAssets = ref<Set<string>>(new Set());

  const isLoading = computed(() => loadingAssets.value.size > 0);

  async function getAsset(category: string, name: string): Promise<string | null> {
    const key = `${category}.${name}`;
    
    if (loadedAssets.value[key]) {
      return loadedAssets.value[key];
    }

    if (loadingAssets.value.has(key)) {
      // Aguardar carregamento
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!loadingAssets.value.has(key)) {
            clearInterval(interval);
            resolve(loadedAssets.value[key] || null);
          }
        }, 100);
      });
    }

    loadingAssets.value.add(key);

    try {
      const assetModule = await loadAsset(key);
      const assetUrl = assetModule?.default || null;
      
      if (assetUrl) {
        loadedAssets.value[key] = assetUrl;
      }
      
      return assetUrl;
    } catch (error) {
      console.warn(`Failed to load asset: ${key}`, error);
      return null;
    } finally {
      loadingAssets.value.delete(key);
    }
  }

  return {
    getAsset,
    isLoading,
    loadedAssets: computed(() => loadedAssets.value)
  };
}
EOF

    echo "✅ Composable criado: $OUTPUT_DIR/useGeneratedAssets.ts"
}

# Executar processamento
create_asset_index
create_asset_composable

# Limpar temporários
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 === PROCESSAMENTO COMPLETO ==="
echo "📁 Assets otimizados em: $OUTPUT_DIR"
echo "📝 Índice criado: $OUTPUT_DIR/index.ts"
echo "🔧 Composable criado: $OUTPUT_DIR/useGeneratedAssets.ts"
echo ""
echo "📱 Para usar no projeto:"
echo "import { useGeneratedAssets } from '@/assets/generated/useGeneratedAssets'"
echo ""

# Mostrar estatísticas
if command -v find &> /dev/null; then
    total_files=$(find "$OUTPUT_DIR" -name "*.png" -o -name "*.webp" | wc -l)
    echo "📊 Total de assets processados: $total_files"
fi
