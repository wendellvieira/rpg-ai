#!/bin/bash

# 🎨 RPG-AI Custom Asset Generator
# Gera assets personalizados via prompt customizado
# Uso: ./generate-custom-asset.sh [opções] "seu prompt aqui" [categoria] [nome-arquivo]
#
# Opções:
#   -s, --size SIZE     Tamanho da imagem (ex: 512x512, 128x128)
#   -m, --multi SIZES   Múltiplos tamanhos (ex: 64x64,128x128,256x256)
#   -h, --help          Mostrar ajuda

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar se a API key existe
if [ -z "$VITE_STABILITY_API_KEY" ]; then
    echo "❌ VITE_STABILITY_API_KEY não encontrada no .env"
    exit 1
fi

# Função de ajuda
show_help() {
    echo "🎨 === RPG-AI CUSTOM ASSET GENERATOR ==="
    echo ""
    echo "📋 Uso:"
    echo "   $0 [opções] \"prompt\" [categoria] [nome-arquivo]"
    echo ""
    echo "⚙️ Opções:"
    echo "   -s, --size SIZE     Tamanho único (ex: 512x512, 128x128)"
    echo "   -m, --multi SIZES   Múltiplos tamanhos (ex: 64x64,128x128,256x256)"
    echo "   -h, --help          Mostrar esta ajuda"
    echo ""
    echo "📝 Exemplos:"
    echo "   $0 \"Icone de espada estilo game engine\""
    echo "   $0 -s 128x128 \"Escudo mágico\" icons escudo"
    echo "   $0 -m 64x64,128x128,256x256 \"Poção de vida\" items pocao"
    echo "   $0 --size 1024x1024 \"Background taverna\" backgrounds taverna"
    echo ""
    echo "📂 Categorias sugeridas: icons, items, spells, characters, backgrounds, maps"
}

# Variáveis padrão
CUSTOM_SIZE=""
MULTI_SIZES=""
USER_PROMPT=""
CATEGORY="custom"
FILENAME=""

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--size)
            CUSTOM_SIZE="$2"
            shift 2
            ;;
        -m|--multi)
            MULTI_SIZES="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            if [ -z "$USER_PROMPT" ]; then
                USER_PROMPT="$1"
            elif [ -z "$CATEGORY" ] || [ "$CATEGORY" = "custom" ]; then
                CATEGORY="$1"
            elif [ -z "$FILENAME" ]; then
                FILENAME="$1"
            fi
            shift
            ;;
    esac
done

# Verificar se prompt foi fornecido
if [ -z "$USER_PROMPT" ]; then
    echo "❌ Prompt é obrigatório!"
    echo ""
    show_help
    exit 1
fi

# Definir nome do arquivo se não especificado
if [ -z "$FILENAME" ]; then
    FILENAME="asset-$(date +%s)"
fi

# Criar diretórios
ASSETS_DIR="generated-assets"
PUBLIC_DIR="public/generated-assets"
mkdir -p "$ASSETS_DIR/$CATEGORY"
mkdir -p "$PUBLIC_DIR/$CATEGORY"

# 🎭 IDENTIDADE VISUAL BASE - ESTILO GAME CARTOON
BASE_STYLE="cartoon game asset style, thick black outline, vibrant colors, cel-shaded, flat design, clean vector style, mobile game icons, colorful and cheerful, simple shadows, game UI elements"
NEGATIVE_PROMPT="realistic, photographic, complex shadows, gradient, blurry, low quality, watermark, text, signature, messy lines, detailed textures"

# 📱 FUNÇÃO PARA GERAR IMAGEM CUSTOMIZADA
generate_custom_image() {
    local user_prompt="$1"
    local category="$2"
    local filename="$3"
    local target_size="$4"
    local size_suffix="$5"
    
    echo "🎨 === GERADOR CUSTOMIZADO ==="
    echo "📝 Prompt do usuário: $user_prompt"
    echo "📂 Categoria: $category"
    echo "📄 Nome do arquivo: $filename$size_suffix"
    echo "📏 Tamanho: $target_size"
    echo ""
    
    # Combinar prompt do usuário com estilo base
    local full_prompt="$user_prompt, $BASE_STYLE"
    
    # Extrair width e height
    local width=$(echo "$target_size" | cut -d'x' -f1)
    local height=$(echo "$target_size" | cut -d'x' -f2)
    
    echo "🔧 Configurações:"
    echo "   Dimensões solicitadas: ${width}x${height}"
    echo "   Prompt completo: $full_prompt"
    echo ""
    
    # Arquivo temporário para resposta
    local temp_file="temp_custom_response_${width}x${height}.json"
    
    # Fazer requisição para API
    echo "🌐 Enviando requisição para Stability AI..."
    
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
        -o "$temp_file"
    
    # Verificar se a requisição foi bem-sucedida
    if [ $? -eq 0 ]; then
        echo "✅ Resposta recebida da API"
        
        # Extrair imagem base64 se jq estiver disponível
        if command -v jq &> /dev/null; then
            IMAGE_DATA=$(jq -r '.image // empty' "$temp_file")
            
            if [ ! -z "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
                # Salvar em generated-assets (para backup)
                local backup_path="${ASSETS_DIR}/${category}/${filename}${size_suffix}.png"
                echo "$IMAGE_DATA" | base64 -d > "$backup_path"
                
                # Salvar em public (para uso na interface)
                local public_path="${PUBLIC_DIR}/${category}/${filename}${size_suffix}.png"
                echo "$IMAGE_DATA" | base64 -d > "$public_path"
                
                echo ""
                echo "🎉 === ASSET GERADO COM SUCESSO ==="
                echo "💾 Backup salvo em: $backup_path"
                echo "🌐 Asset público em: $public_path"
                echo "🔗 URL para usar: /generated-assets/${category}/${filename}${size_suffix}.png"
                
                # Limpar arquivo temporário
                rm "$temp_file"
                
                return 0
            else
                echo "❌ Nenhuma imagem encontrada na resposta da API"
                echo "📄 Resposta completa:"
                cat "$temp_file"
                return 1
            fi
        else
            echo "⚠️ 'jq' não está instalado - não é possível extrair a imagem"
            echo "📄 Resposta salva em: $temp_file"
            echo "💡 Instale jq com: brew install jq"
            return 1
        fi
    else
        echo "❌ Erro na requisição para a API"
        if [ -f "$temp_file" ]; then
            echo "📄 Resposta de erro:"
            cat "$temp_file"
            rm "$temp_file"
        fi
        return 1
    fi
}

# 🔄 FUNÇÃO PARA REDIMENSIONAR IMAGEM
resize_image() {
    local source_file="$1"
    local target_file="$2"
    local target_size="$3"
    
    if command -v magick &> /dev/null; then
        echo "📐 Redimensionando para $target_size..."
        magick "$source_file" -resize "$target_size" -quality 90 "$target_file"
        echo "✅ Redimensionado: $target_file"
        return 0
    elif command -v convert &> /dev/null; then
        echo "📐 Redimensionando para $target_size (convert)..."
        convert "$source_file" -resize "$target_size" -quality 90 "$target_file"
        echo "✅ Redimensionado: $target_file"
        return 0
    else
        echo "⚠️ ImageMagick não encontrado - copiando imagem original"
        cp "$source_file" "$target_file"
        return 1
    fi
}

# Executar geração
if [ ! -z "$MULTI_SIZES" ]; then
    # Modo múltiplos tamanhos
    echo "🎯 === MODO MÚLTIPLOS TAMANHOS ==="
    echo "📝 Sizes: $MULTI_SIZES"
    echo ""
    
    # Converter string de tamanhos em array
    IFS=',' read -ra SIZES_ARRAY <<< "$MULTI_SIZES"
    
    # Encontrar o maior tamanho para gerar primeiro
    largest_size=""
    largest_pixels=0
    
    for size in "${SIZES_ARRAY[@]}"; do
        width=$(echo "$size" | cut -d'x' -f1)
        height=$(echo "$size" | cut -d'x' -f2)
        pixels=$((width * height))
        
        if [ $pixels -gt $largest_pixels ]; then
            largest_pixels=$pixels
            largest_size="$size"
        fi
    done
    
    echo "🔍 Maior tamanho detectado: $largest_size"
    echo "💰 Gerando apenas 1 imagem no maior tamanho (economia de API calls!)"
    echo "🎨 Gerando imagem principal..."
    
    # Gerar a imagem no maior tamanho
    if generate_custom_image "$USER_PROMPT" "$CATEGORY" "$FILENAME" "$largest_size" "-$largest_size"; then
        original_file="${PUBLIC_DIR}/${CATEGORY}/${FILENAME}-${largest_size}.png"
        
        echo ""
        echo "📐 === REDIMENSIONANDO PARA OUTROS TAMANHOS ==="
        
        # Redimensionar para os outros tamanhos
        for size in "${SIZES_ARRAY[@]}"; do
            if [ "$size" != "$largest_size" ]; then
                target_file="${PUBLIC_DIR}/${CATEGORY}/${FILENAME}-${size}.png"
                resize_image "$original_file" "$target_file" "$size"
                
                # Copiar para backup também
                backup_target="${ASSETS_DIR}/${CATEGORY}/${FILENAME}-${size}.png"
                cp "$target_file" "$backup_target"
            fi
        done
        
        echo ""
        echo "🎉 === MÚLTIPLOS TAMANHOS GERADOS ==="
        echo "📂 Arquivos criados:"
        for size in "${SIZES_ARRAY[@]}"; do
            echo "   🔗 /generated-assets/${CATEGORY}/${FILENAME}-${size}.png"
        done
    else
        echo "❌ Falha na geração da imagem principal"
        exit 1
    fi
    
elif [ ! -z "$CUSTOM_SIZE" ]; then
    # Modo tamanho único customizado
    echo "🎯 === MODO TAMANHO CUSTOMIZADO ==="
    generate_custom_image "$USER_PROMPT" "$CATEGORY" "$FILENAME" "$CUSTOM_SIZE" "-$CUSTOM_SIZE"
    
else
    # Modo padrão - determinar tamanho pela categoria (economizando API calls)
    echo "🎯 === MODO TAMANHO AUTOMÁTICO ==="
    
    # Tamanhos otimizados para economizar API calls
    default_size="1024x1024"  # Padrão geral (boa qualidade)
    case "$CATEGORY" in
        "icons"|"spells") default_size="512x512" ;;      # Menor para ícones
        "items"|"characters") default_size="512x512" ;;  # Médio para itens
        "backgrounds") default_size="1024x1024" ;;       # Maior para backgrounds
        "maps") default_size="512x512" ;;                # Médio para mapas
    esac
    
    echo "📏 Tamanho otimizado para categoria '$CATEGORY': $default_size"
    echo "💰 (Reduzindo custos de API com tamanhos inteligentes)"
    generate_custom_image "$USER_PROMPT" "$CATEGORY" "$FILENAME" "$default_size" ""
fi

echo ""
echo "💡 === DICAS DE USO ==="
echo "💰 Sistema otimizado para economia de API calls:"
echo ""
echo "🎨 Tamanho único:"
echo "   ./generate-custom-asset.sh -s 128x128 \"Ícone de espada\" icons espada"
echo "   ↳ Gera exatamente 128x128 (1 call de API)"
echo ""
echo "🎯 Múltiplos tamanhos (INTELIGENTE):"
echo "   ./generate-custom-asset.sh -m 64x64,128x128,256x256 \"Poção vermelha\" items pocao"
echo "   ↳ Gera 256x256 e redimensiona para 128x128 e 64x64 (1 call de API)"
echo ""
echo "📂 Categorias e tamanhos automáticos otimizados:"
echo "   icons, spells     → 512x512  (economia vs 1024x1024)"
echo "   items, characters → 512x512  (economia vs 1024x1024)"
echo "   backgrounds       → 1024x1024 (necessário para qualidade)"
echo "   maps              → 512x512  (equilibrio qualidade/custo)"
echo ""
echo "🔧 Para usar no Vue:"
if [ ! -z "$MULTI_SIZES" ]; then
    echo "   <!-- Diferentes tamanhos -->"
    for size in "${SIZES_ARRAY[@]}"; do
        echo "   <img src=\"/generated-assets/${CATEGORY}/${FILENAME}-${size}.png\" alt=\"Asset ${size}\" />"
    done
elif [ ! -z "$CUSTOM_SIZE" ]; then
    echo "   <img src=\"/generated-assets/${CATEGORY}/${FILENAME}-${CUSTOM_SIZE}.png\" alt=\"Asset\" />"
else
    echo "   <img src=\"/generated-assets/${CATEGORY}/${FILENAME}.png\" alt=\"Asset\" />"
fi
