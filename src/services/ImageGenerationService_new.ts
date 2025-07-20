/**
 * Serviço para geração de imagens usando Stability AI
 * Suporta text-to-image e inpainting
 */

import { useConfigStore } from '../stores/configStore';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
  style?: string;
}

export interface InpaintingRequest extends ImageGenerationRequest {
  image: string; // Base64 da imagem original
  mask: string; // Base64 da máscara
}

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  error?: string;
  seed?: number;
}

export interface MapTemplate {
  id: string;
  name: string;
  prompt: string;
  negativePrompt: string;
  style: string;
  category: 'dungeon' | 'nature' | 'urban' | 'fantasy' | 'tactical';
}

interface StabilityAPIRequest {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  cfg_scale: number;
  steps: number;
  output_format: string;
  seed?: number;
}

export class ImageGenerationService {
  private configStore = useConfigStore();
  private baseUrl = 'https://api.stability.ai';

  constructor() {
    // Verificar se há configuração disponível
    if (!this.isConfigured()) {
      console.warn('Stability AI API key not found. Image generation will not work.');
    }
  }

  private get apiKey(): string {
    return (
      this.configStore.configuracao.stabilityApiKey || import.meta.env.VITE_STABILITY_API_KEY || ''
    );
  }

  private get model(): string {
    return (
      this.configStore.configuracao.stabilityModel ||
      import.meta.env.VITE_STABILITY_MODEL ||
      'stable-image-core'
    );
  }

  private get defaultWidth(): number {
    return this.configStore.configuracao.stabilityDefaultWidth || 1024;
  }

  private get defaultHeight(): number {
    return this.configStore.configuracao.stabilityDefaultHeight || 1024;
  }

  private get defaultSteps(): number {
    return this.configStore.configuracao.stabilityDefaultSteps || 30;
  }

  private get defaultCfgScale(): number {
    return this.configStore.configuracao.stabilityDefaultCfgScale || 7.0;
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Templates pré-definidos para diferentes tipos de mapas
   */
  getMapTemplates(): MapTemplate[] {
    return [
      {
        id: 'dungeon-stone',
        name: 'Masmorra de Pedra',
        prompt: 'stone dungeon map, top-down view, corridors and rooms, medieval fantasy',
        negativePrompt: 'characters, people, text, modern objects',
        style: 'fantasy-realistic',
        category: 'dungeon',
      },
      {
        id: 'forest-clearing',
        name: 'Clareira na Floresta',
        prompt: 'forest clearing map, top-down view, trees, paths, nature, fantasy',
        negativePrompt: 'buildings, modern objects, people, text',
        style: 'fantasy-realistic',
        category: 'nature',
      },
      {
        id: 'tavern-interior',
        name: 'Interior da Taverna',
        prompt: 'tavern interior map, top-down view, tables, chairs, bar, medieval fantasy',
        negativePrompt: 'modern furniture, people, text',
        style: 'fantasy-realistic',
        category: 'urban',
      },
    ];
  }

  /**
   * Estilos de arte disponíveis para mapas
   */
  getArtStyles(): Array<{ label: string; value: string; description: string }> {
    return this.getAvailableStyles();
  }

  /**
   * Gera uma imagem usando text-to-image
   */
  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key da Stability AI não configurada',
      };
    }

    try {
      // Preparar dados para a API v2beta (usa JSON em vez de FormData)
      const requestData: StabilityAPIRequest = {
        prompt: this.enhancePrompt(request.prompt, request.style),
        width: request.width || this.defaultWidth,
        height: request.height || this.defaultHeight,
        cfg_scale: request.cfgScale || this.defaultCfgScale,
        steps: request.steps || this.defaultSteps,
        output_format: 'png',
      };

      if (request.negativePrompt) {
        requestData.negative_prompt = request.negativePrompt;
      }

      if (request.seed) {
        requestData.seed = request.seed;
      }

      // Validar dimensões (devem ser múltiplos de 64)
      requestData.width = Math.max(512, Math.round(requestData.width / 64) * 64);
      requestData.height = Math.max(512, Math.round(requestData.height / 64) * 64);

      console.log('Stability AI Request:', requestData);

      // Usar API v2beta com stable-image-core
      const response = await fetch(`${this.baseUrl}/v2beta/stable-image/generate/core`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Stability AI Error Response:', errorData);
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const imageBase64 = data.image; // v2beta retorna 'image' diretamente

      if (!imageBase64) {
        throw new Error('Nenhuma imagem retornada pela API');
      }

      const imageUrl = `data:image/png;base64,${imageBase64}`;

      return {
        success: true,
        imageUrl,
        imageBase64,
        seed: data.seed || request.seed,
      };
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Melhora o prompt com base no estilo selecionado
   */
  private enhancePrompt(prompt: string, style?: string): string {
    let enhancedPrompt = prompt;

    // Adicionar modificadores baseados no estilo
    switch (style) {
      case 'fantasy-realistic':
        enhancedPrompt += ', fantasy art, detailed, high quality, realistic lighting';
        break;
      case 'anime':
        enhancedPrompt += ', anime style, manga art, cel shading';
        break;
      case 'cartoon':
        enhancedPrompt += ', cartoon style, animated, colorful';
        break;
      case 'pixel-art':
        enhancedPrompt += ', pixel art, 8-bit style, retro gaming';
        break;
      case 'oil-painting':
        enhancedPrompt += ', oil painting, classical art style, painterly';
        break;
      case 'watercolor':
        enhancedPrompt += ', watercolor painting, soft colors, artistic';
        break;
      default:
        enhancedPrompt += ', high quality, detailed';
    }

    return enhancedPrompt;
  }

  /**
   * Retorna os estilos disponíveis
   */
  getAvailableStyles(): Array<{ label: string; value: string; description: string }> {
    return [
      {
        label: 'Fantasia Realística',
        value: 'fantasy-realistic',
        description: 'Estilo realístico com elementos fantásticos',
      },
      {
        label: 'Anime',
        value: 'anime',
        description: 'Estilo anime/manga japonês',
      },
      {
        label: 'Cartoon',
        value: 'cartoon',
        description: 'Estilo cartoon animado',
      },
      {
        label: 'Pixel Art',
        value: 'pixel-art',
        description: 'Arte em pixels estilo retro',
      },
      {
        label: 'Pintura a Óleo',
        value: 'oil-painting',
        description: 'Estilo clássico de pintura a óleo',
      },
      {
        label: 'Aquarela',
        value: 'watercolor',
        description: 'Estilo pintado em aquarela',
      },
    ];
  }
}

// Singleton instance
let instance: ImageGenerationService | null = null;

export function getImageGenerationService(): ImageGenerationService {
  if (!instance) {
    instance = new ImageGenerationService();
  }
  return instance;
}

// Export da instância singleton para compatibilidade
export const imageGenerationService = getImageGenerationService();
