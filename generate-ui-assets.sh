#!/bin/bash

# 🎨 RPG-AI Interface Image Generator
# Sistema para gerar todas as imagens da interface com identidade visual consistente
# Uso: 
#   ./generate-ui-assets.sh [categoria]           - Gerar assets predefinidos
#   ./generate-ui-assets.sh prompt "seu prompt"   - Gerar asset customizado

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar se a API key existe
if [ -z "$VITE_STABILITY_API_KEY" ]; then
    echo "❌ VITE_STABILITY_API_KEY não encontrada no .env"
    exit 1
fi

# Criar diretório para assets gerados
ASSETS_DIR="generated-assets"
PUBLIC_DIR="public/generated-assets"
mkdir -p "$ASSETS_DIR"/{icons,backgrounds,characters,items,spells,maps}
mkdir -p "$PUBLIC_DIR"/{icons,backgrounds,characters,items,spells,maps}

# 🎭 IDENTIDADE VISUAL BASE
BASE_STYLE="fantasy RPG, dark magical theme, purple and gold accents, mystical aura, detailed digital art"
NEGATIVE_PROMPT="ugly, blurry, low quality, watermark, text, signature, realistic photo"

# 📱 FUNÇÃO PARA GERAR IMAGEM
generate_image() {
    local name="$1"
    local prompt="$2"
    local category="$3"
    local size="${4:-512}"
    
    echo "🎨 Gerando: $name"
    echo "📝 Prompt: $prompt"
    
    local full_prompt="$prompt, $BASE_STYLE"
    local filename="${ASSETS_DIR}/${category}/${name}-$(date +%s).png"
    
    curl -f -sS -X POST "https://api.stability.ai/v2beta/stable-image/generate/core" \
        -H "authorization: Bearer $VITE_STABILITY_API_KEY" \
        -H "accept: application/json" \
        -F "prompt=$full_prompt" \
        -F "negative_prompt=$NEGATIVE_PROMPT" \
        -F "model=sd3-large-turbo" \
        -F "width=$size" \
        -F "height=$size" \
        -F "cfg_scale=7" \
        -F "steps=30" \
        -F "output_format=png" \
        -o temp_response.json
    
    if [ $? -eq 0 ]; then
        if command -v jq &> /dev/null; then
            IMAGE_DATA=$(jq -r '.image // empty' temp_response.json)
            if [ ! -z "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
                # Salvar em generated-assets (backup)
                echo "$IMAGE_DATA" | base64 -d > "$filename"
                
                # Salvar em public (para uso na interface)
                local public_filename="${PUBLIC_DIR}/${category}/${name}.png"
                echo "$IMAGE_DATA" | base64 -d > "$public_filename"
                
                echo "✅ Salvo: $filename"
                echo "🌐 Público: $public_filename"
                rm temp_response.json
                return 0
            fi
        fi
    fi
    
    echo "❌ Erro ao gerar $name"
    return 1
}

# 📐 FUNÇÃO PARA GERAR IMAGEM COM DIMENSÕES ESPECÍFICAS
generate_image_with_size() {
    local name="$1"
    local prompt="$2"
    local category="$3"
    local width="$4"
    local height="$5"
    
    echo "🎨 Gerando: $name (${width}x${height})"
    echo "📝 Prompt: $prompt"
    
    local full_prompt="$prompt, $BASE_STYLE"
    local filename="${ASSETS_DIR}/${category}/${name}-$(date +%s).png"
    
    curl -f -sS -X POST "https://api.stability.ai/v2beta/stable-image/generate/core" \
        -H "authorization: Bearer $VITE_STABILITY_API_KEY" \
        -H "accept: application/json" \
        -F "prompt=$full_prompt" \
        -F "negative_prompt=$NEGATIVE_PROMPT" \
        -F "model=sd3-large-turbo" \
        -F "width=$width" \
        -F "height=$height" \
        -F "cfg_scale=7" \
        -F "steps=30" \
        -F "output_format=png" \
        -o temp_response.json
    
    if [ $? -eq 0 ]; then
        if command -v jq &> /dev/null; then
            IMAGE_DATA=$(jq -r '.image // empty' temp_response.json)
            if [ ! -z "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
                # Salvar em generated-assets (backup)
                echo "$IMAGE_DATA" | base64 -d > "$filename"
                
                # Salvar em public (para uso na interface)
                local public_filename="${PUBLIC_DIR}/${category}/${name}.png"
                echo "$IMAGE_DATA" | base64 -d > "$public_filename"
                
                echo "✅ Salvo: $filename"
                echo "🌐 Público: $public_filename"
                rm temp_response.json
                return 0
            fi
        fi
    fi
    
    echo "❌ Erro ao gerar $name"
    return 1
}

# 🎮 CATEGORIAS DE ASSETS
generate_icons() {
    echo "🎯 === GERANDO ÍCONES DE INTERFACE ==="
    
    # Botões principais
    generate_image "btn-create" "magical create button icon, plus symbol with sparkles" "icons" 128
    generate_image "btn-edit" "mystical edit icon, quill pen with magical ink" "icons" 128
    generate_image "btn-delete" "dark magic delete icon, crossed swords" "icons" 128
    generate_image "btn-save" "enchanted save icon, magical scroll being sealed" "icons" 128
    
    # Navegação
    generate_image "nav-characters" "party of adventurers icon, silhouettes of different classes" "icons" 128
    generate_image "nav-items" "magical items collection, sword, potion, scroll bundle" "icons" 128
    generate_image "nav-spells" "spellbook with glowing runes, magical energy" "icons" 128
    generate_image "nav-maps" "ancient map with mystical locations" "icons" 128
    generate_image "nav-combat" "crossed weapons with battle aura" "icons" 128
    generate_image "nav-settings" "magical gear mechanism with runes" "icons" 128
    
    # Estados e status
    generate_image "status-health" "health potion with red magical liquid" "icons" 64
    generate_image "status-mana" "mana crystal with blue energy" "icons" 64
    generate_image "status-armor" "magical armor piece with protective aura" "icons" 64
    generate_image "status-strength" "muscular arm with power aura" "icons" 64
}

generate_backgrounds() {
    echo "🏞️ === GERANDO BACKGROUNDS ==="
    
    # Fundos principais
    generate_image "bg-main" "mystical RPG interface background, dark purple with gold accents" "backgrounds" 1920
    generate_image "bg-modal" "magical dialog background, semi-transparent with mystical border" "backgrounds" 800
    generate_image "bg-sidebar" "side panel background, dark magical theme" "backgrounds" 400
    
    # Padrões e texturas
    generate_image "pattern-magic" "seamless magical pattern, runes and mystical symbols" "backgrounds" 512
    generate_image "texture-parchment" "ancient parchment texture with magical aging" "backgrounds" 512
    generate_image "texture-stone" "mystical stone texture with magical veins" "backgrounds" 512
}

generate_character_assets() {
    echo "👥 === GERANDO ASSETS DE PERSONAGENS ==="
    
    # Avatares padrão por classe
    generate_image "avatar-warrior" "fantasy warrior portrait, determined face, armor" "characters" 256
    generate_image "avatar-mage" "wise mage portrait, magical eyes, robes" "characters" 256
    generate_image "avatar-rogue" "stealthy rogue portrait, hooded figure" "characters" 256
    generate_image "avatar-cleric" "holy cleric portrait, divine aura" "characters" 256
    
    # Avatares por raça
    generate_image "avatar-human" "human adventurer portrait, noble features" "characters" 256
    generate_image "avatar-elf" "elegant elf portrait, pointed ears, wise eyes" "characters" 256
    generate_image "avatar-dwarf" "sturdy dwarf portrait, braided beard" "characters" 256
    generate_image "avatar-halfling" "cheerful halfling portrait, friendly smile" "characters" 256
}

generate_item_assets() {
    echo "⚔️ === GERANDO ASSETS DE ITENS ==="
    
    # Armas
    generate_image "weapon-sword" "legendary magical sword with glowing blade" "items" 256
    generate_image "weapon-bow" "elven magical bow with energy string" "items" 256
    generate_image "weapon-staff" "powerful wizard staff with crystal orb" "items" 256
    
    # Armaduras
    generate_image "armor-light" "light magical leather armor with runes" "items" 256
    generate_image "armor-medium" "chain mail with protective enchantments" "items" 256
    generate_image "armor-heavy" "heavy plate armor with divine blessing" "items" 256
    
    # Consumíveis
    generate_image "potion-health" "red healing potion with magical glow" "items" 128
    generate_image "potion-mana" "blue mana potion with energy swirls" "items" 128
    generate_image "scroll-spell" "ancient spell scroll with glowing text" "items" 128
}

generate_spell_assets() {
    echo "✨ === GERANDO ASSETS DE MAGIAS ==="
    
    # Escolas de magia
    generate_image "magic-fire" "fire spell icon, flames and heat waves" "spells" 128
    generate_image "magic-ice" "ice spell icon, crystals and frost" "spells" 128
    generate_image "magic-lightning" "lightning spell icon, electric energy" "spells" 128
    generate_image "magic-healing" "healing spell icon, golden light" "spells" 128
    generate_image "magic-protection" "protection spell icon, magical shield" "spells" 128
    generate_image "magic-illusion" "illusion spell icon, swirling mists" "spells" 128
}

generate_map_assets() {
    echo "🗺️ === GERANDO ASSETS DE MAPAS ==="
    
    # Elementos de mapa
    generate_image "map-dungeon" "dungeon entrance, dark stone archway" "maps" 256
    generate_image "map-forest" "magical forest clearing with ancient trees" "maps" 256
    generate_image "map-mountain" "mystical mountain peak with clouds" "maps" 256
    generate_image "map-river" "enchanted river with flowing magical water" "maps" 256
    generate_image "map-village" "fantasy village with thatched roofs" "maps" 256
    generate_image "map-castle" "magical castle with towers and banners" "maps" 256
}

# 🎯 FUNÇÃO PRINCIPAL
main() {
    echo "🎨 === RPG-AI INTERFACE ASSET GENERATOR ==="
    echo "🎭 Estilo: $BASE_STYLE"
    echo "📁 Diretório: $ASSETS_DIR"
    echo ""
    
    # Verificar se é modo prompt customizado
    if [ "$1" = "prompt" ] && [ ! -z "$2" ]; then
        # Modo prompt customizado
        USER_PROMPT="$2"
        CATEGORY="${3:-custom}"
        FILENAME="${4:-asset-$(date +%s)}"
        CUSTOM_SIZE="${5:-}"
        
        echo "🎨 === MODO PROMPT CUSTOMIZADO ==="
        echo "📝 Prompt: $USER_PROMPT"
        echo "📂 Categoria: $CATEGORY"
        echo "📄 Arquivo: $FILENAME"
        
        # Determinar tamanho
        if [ ! -z "$CUSTOM_SIZE" ]; then
            echo "📏 Tamanho customizado: $CUSTOM_SIZE"
            # Extrair width e height
            width=$(echo "$CUSTOM_SIZE" | cut -d'x' -f1)
            height=$(echo "$CUSTOM_SIZE" | cut -d'x' -f2)
            generate_image_with_size "$FILENAME" "$USER_PROMPT" "$CATEGORY" "$width" "$height"
        else
            # Tamanho automático por categoria
            case "$CATEGORY" in
                "icons"|"spells") size=128 ;;
                "items"|"characters") size=256 ;;
                "backgrounds") size=1024 ;;
                "maps") size=512 ;;
                *) size=512 ;;
            esac
            echo "📏 Tamanho automático: ${size}x${size}"
            generate_image "$FILENAME" "$USER_PROMPT" "$CATEGORY" "$size"
        fi
        
        echo ""
        echo "🔗 Para usar: /generated-assets/${CATEGORY}/${FILENAME}.png"
        return
    fi
    
    case "${1:-all}" in
        "icons")
            generate_icons
            ;;
        "backgrounds")
            generate_backgrounds
            ;;
        "characters")
            generate_character_assets
            ;;
        "items")
            generate_item_assets
            ;;
        "spells")
            generate_spell_assets
            ;;
        "maps")
            generate_map_assets
            ;;
        "all")
            generate_icons
            sleep 2
            generate_backgrounds
            sleep 2
            generate_character_assets
            sleep 2
            generate_item_assets
            sleep 2
            generate_spell_assets
            sleep 2
            generate_map_assets
            ;;
        *)
            echo "❌ Opção inválida!"
            echo ""
            echo "📋 === USO DO SCRIPT ==="
            echo "🎯 Categorias predefinidas:"
            echo "   $0 [icons|backgrounds|characters|items|spells|maps|all]"
            echo ""
            echo "✨ Prompt customizado:"
            echo "   $0 prompt \"seu prompt aqui\" [categoria] [nome-arquivo]"
            echo ""
            echo "📝 Exemplos:"
            echo "   $0 icons                                         # Gerar todos os ícones"
            echo "   $0 prompt \"Espada mágica brilhante\" items espada-magica"
            echo "   $0 prompt \"Background de taverna\" backgrounds taverna"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 === GERAÇÃO COMPLETA ==="
    echo "📁 Assets salvos em: $ASSETS_DIR"
    echo "🔄 Para usar no projeto: copie para src/assets/generated/"
}

# Executar
main "$@"
