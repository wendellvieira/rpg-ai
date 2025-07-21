#!/usr/bin/env node

// Script para testar geração de imagem do RPG-AI
// Uso: node test-image-generation.js

const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const STABILITY_API_KEY = process.env.VITE_STABILITY_API_KEY;
const API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core';

async function generateImage(prompt = 'A majestic airplane flying through cloudy skies') {
  if (!STABILITY_API_KEY) {
    console.error('❌ VITE_STABILITY_API_KEY não encontrada no .env');
    return;
  }

  console.log('🎨 Gerando imagem...');
  console.log('📝 Prompt:', prompt);
  console.log('🔑 API Key:', STABILITY_API_KEY.substring(0, 10) + '...');

  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('model', 'sd3-large-turbo');
    formData.append('width', '1024');
    formData.append('height', '1024');
    formData.append('cfg_scale', '7');
    formData.append('steps', '30');
    formData.append('output_format', 'png');

    console.log('🚀 Fazendo requisição para:', API_URL);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📄 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta recebida:', Object.keys(result));

    if (result.image) {
      // Salvar imagem
      const imageBuffer = Buffer.from(result.image, 'base64');
      const filename = `airplane-${Date.now()}.png`;
      fs.writeFileSync(filename, imageBuffer);
      console.log('🖼️ Imagem salva como:', filename);
    }
  } catch (error) {
    console.error('💥 Erro:', error.message);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  const prompt = process.argv[2] || 'A majestic airplane flying through cloudy skies';
  generateImage(prompt);
}

module.exports = { generateImage };
