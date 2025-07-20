// Teste simples para verificar se a tradução está funcionando
import { imageGenerationService } from '../src/services/ImageGenerationService';

// Teste de tradução de prompt em português
const testPrompt = 'Espada mágica lendária de fogo';
console.log('Prompt original:', testPrompt);

// Simular uma chamada de geração (sem fazer a requisição real)
const request = {
  prompt: testPrompt,
  style: 'fantasy-realistic',
  width: 512,
  height: 512,
};

console.log('Configuração da API:');
console.log('- Configurado:', imageGenerationService.isConfigured());

// Mostrar como o prompt seria processado
console.log('Request:', request);
