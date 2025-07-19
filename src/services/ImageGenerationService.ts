/**
 * Serviço para geração de imagens usando Stability AI
 * Suporta text-to-image e inpainting
 */

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

export class ImageGenerationService {
  private apiKey: string;
  private baseUrl = 'https://api.stability.ai';
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_STABILITY_API_KEY || '';
    this.model = import.meta.env.VITE_STABILITY_MODEL || 'sd3-large-turbo';

    if (!this.apiKey) {
      console.warn('Stability AI API key not found. Image generation will not work.');
    }
  }

  /**
   * Templates pré-definidos para diferentes tipos de mapas
   */
  public getMapTemplates(): MapTemplate[] {
    return [
      {
        id: 'dungeon-stone',
        name: 'Dungeon de Pedra',
        prompt: 'Top-down dungeon map, stone corridors, medieval fantasy, rooms connected by hallways, RPG battle map style, detailed stone texture',
        negativePrompt: 'blurry, 3d, perspective, characters, monsters, text, UI elements',
        style: 'fantasy-realistic',
        category: 'dungeon'
      },
      {
        id: 'forest-ancient',
        name: 'Floresta Antiga',
        prompt: 'Ancient forest map from above, tall trees, winding paths, clearings, mystical atmosphere, fantasy RPG map, top-down view',
        negativePrompt: 'modern buildings, roads, cars, people, 3d perspective, blurry',
        style: 'fantasy-realistic',
        category: 'nature'
      },
      {
        id: 'medieval-town',
        name: 'Vila Medieval',
        prompt: 'Medieval fantasy town map, cobblestone streets, market square, houses with thatched roofs, walls, RPG map style, bird eye view',
        negativePrompt: 'modern elements, cars, technology, 3d, perspective, characters',
        style: 'fantasy-realistic',
        category: 'urban'
      },
      {
        id: 'mountain-pass',
        name: 'Passagem nas Montanhas',
        prompt: 'Mountain pass battle map, rocky terrain, narrow paths, cliffs, fantasy RPG style, top-down tactical view',
        negativePrompt: 'flat terrain, water, buildings, modern elements, 3d perspective',
        style: 'fantasy-realistic',
        category: 'nature'
      },
      {
        id: 'tavern-interior',
        name: 'Interior de Taverna',
        prompt: 'Fantasy tavern interior map, wooden tables, bar counter, fireplace, stairs, RPG battle map, top-down view',
        negativePrompt: 'outdoor, people, modern furniture, 3d perspective, blurry',
        style: 'fantasy-realistic',
        category: 'dungeon'
      },
      {
        id: 'castle-courtyard',
        name: 'Pátio do Castelo',
        prompt: 'Castle courtyard battle map, stone walls, towers, training grounds, medieval fantasy, tactical RPG map',
        negativePrompt: 'modern buildings, vehicles, people, 3d perspective, blurry',
        style: 'fantasy-realistic',
        category: 'fantasy'
      }
    ];
  }

  /**
   * Estilos artísticos disponíveis
   */
  public getArtStyles(): Array<{ label: string; value: string; description: string }> {
    return [
      {
        label: 'Realista Fantasia',
        value: 'fantasy-realistic',
        description: 'Estilo realista com elementos fantásticos'
      },
      {
        label: 'Desenho à Mão',
        value: 'hand-drawn',
        description: 'Estilo manuscrito medieval'
      },
      {
        label: 'Pixel Art',
        value: 'pixel-art',
        description: 'Arte em pixels para estilo retro'
      },
      {
        label: 'Isométrico',
        value: 'isometric',
        description: 'Visão isométrica 3D'
      },
      {
        label: 'Aquarela',
        value: 'watercolor',
        description: 'Estilo pintado em aquarela'
      }
    ];
  }

  /**
   * Gera uma imagem usando text-to-image
   */
  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key da Stability AI não configurada'
      };
    }

    try {
      const formData = new FormData();
      formData.append('prompt', this.enhancePrompt(request.prompt, request.style));
      
      if (request.negativePrompt) {
        formData.append('negative_prompt', request.negativePrompt);
      }
      
      formData.append('width', (request.width || 1024).toString());
      formData.append('height', (request.height || 1024).toString());
      formData.append('steps', (request.steps || 30).toString());
      formData.append('cfg_scale', (request.cfgScale || 7).toString());
      
      if (request.seed) {
        formData.append('seed', request.seed.toString());
      }

      // Usar API v2beta com stable-image-core
      const response = await fetch(`${this.baseUrl}/v2beta/stable-image/generate/core`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
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
        seed: data.seed || request.seed
      };

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Modifica uma imagem usando inpainting
   */
  async inpaintImage(request: InpaintingRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key da Stability AI não configurada'
      };
    }

    try {
      // Preparar FormData para upload de imagens
      const formData = new FormData();
      
      // Converter base64 para blob
      const imageBlob = this.base64ToBlob(request.image);
      const maskBlob = this.base64ToBlob(request.mask);

      formData.append('image', imageBlob, 'image.png');
      formData.append('mask', maskBlob, 'mask.png');
      formData.append('prompt', this.enhancePrompt(request.prompt, request.style));
      
      if (request.negativePrompt) {
        formData.append('negative_prompt', request.negativePrompt);
      }
      
      formData.append('strength', '0.8'); // Default strength for inpainting
      formData.append('steps', (request.steps || 30).toString());
      formData.append('cfg_scale', (request.cfgScale || 7).toString());
      
      if (request.seed) {
        formData.append('seed', request.seed.toString());
      }

      // Usar API v2beta para inpainting
      const response = await fetch(`${this.baseUrl}/v2beta/stable-image/edit/inpaint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
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
        ...(request.seed && { seed: request.seed })
      };

    } catch (error) {
      console.error('Erro ao fazer inpainting:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Melhora o prompt com base no estilo selecionado
   */
  private enhancePrompt(prompt: string, style?: string): string {
    let enhancedPrompt = prompt;

    // Adicionar qualificadores de estilo
    switch (style) {
      case 'hand-drawn':
        enhancedPrompt += ', hand-drawn map, medieval manuscript style, parchment texture';
        break;
      case 'pixel-art':
        enhancedPrompt += ', pixel art style, 16-bit graphics, retro game map';
        break;
      case 'isometric':
        enhancedPrompt += ', isometric view, 3D perspective, detailed tactical map';
        break;
      case 'watercolor':
        enhancedPrompt += ', watercolor painting style, soft colors, artistic map';
        break;
      default:
        enhancedPrompt += ', high quality, detailed, fantasy RPG map';
    }

    // Garantir que seja um mapa top-down
    if (!enhancedPrompt.includes('top-down') && !enhancedPrompt.includes('bird') && !enhancedPrompt.includes('aerial')) {
      enhancedPrompt += ', top-down view';
    }

    return enhancedPrompt;
  }

  /**
   * Prompt negativo padrão para mapas
   */
  private getDefaultNegativePrompt(): string {
    return 'blurry, low quality, distorted, 3d perspective, characters, people, monsters, text, UI elements, modern objects, cars, technology, watermark, signature';
  }

  /**
   * Converte base64 para Blob
   */
  private base64ToBlob(base64: string): Blob {
    // Remove data URL prefix se presente
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }

  /**
   * Verifica se o serviço está configurado corretamente
   */
  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Obtém informações sobre o serviço
   */
  public getServiceInfo() {
    return {
      configured: this.isConfigured(),
      model: this.model,
      baseUrl: this.baseUrl
    };
  }
}

// Instância singleton do serviço
export const imageGenerationService = new ImageGenerationService();
