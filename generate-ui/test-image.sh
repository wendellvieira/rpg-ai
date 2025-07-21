#!/bin/bash

# Script para testar geração de imagem via curl
# Uso: ./test-image.sh "seu prompt aqui"

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar se a API key existe
if [ -z "$VITE_STABILITY_API_KEY" ]; then
    echo "❌ VITE_STABILITY_API_KEY não encontrada no .env"
    exit 1
fi

# Prompt da imagem (usar parâmetro ou default)
PROMPT="${1:-A majestic airplane flying through cloudy skies at sunset}"

echo "🎨 Gerando imagem..."
echo "📝 Prompt: $PROMPT"
echo "🔑 API Key: ${VITE_STABILITY_API_KEY:0:10}..."

# Fazer a requisição
curl -f -sS -X POST "https://api.stability.ai/v2beta/stable-image/generate/core" \
  -H "authorization: Bearer $VITE_STABILITY_API_KEY" \
  -H "accept: application/json" \
  -F "prompt=$PROMPT" \
  -F "model=sd3-large-turbo" \
  -F "width=1024" \
  -F "height=1024" \
  -F "cfg_scale=7" \
  -F "steps=30" \
  -F "output_format=png" \
  -o response.json

# Verificar se deu certo
if [ $? -eq 0 ]; then
    echo "✅ Resposta salva em response.json"
    
    # Extrair e salvar a imagem se existir
    if command -v jq &> /dev/null; then
        IMAGE_DATA=$(jq -r '.image // empty' response.json)
        if [ ! -z "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
            FILENAME="airplane-$(date +%s).png"
            echo "$IMAGE_DATA" | base64 -d > "$FILENAME"
            echo "🖼️ Imagem salva como: $FILENAME"
        else
            echo "❌ Nenhuma imagem encontrada na resposta"
            echo "📄 Conteúdo da resposta:"
            cat response.json
        fi
    else
        echo "📄 Instale 'jq' para extrair a imagem automaticamente"
        echo "📄 Resposta completa:"
        cat response.json
    fi
else
    echo "❌ Erro na requisição"
    if [ -f response.json ]; then
        echo "📄 Resposta de erro:"
        cat response.json
    fi
fi
