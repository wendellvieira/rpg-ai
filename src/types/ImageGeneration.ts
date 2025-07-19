/**
 * Tipos para sistema de geração de imagens e modo paint
 */

// Re-export dos tipos do serviço para facilitar imports
export type {
  ImageGenerationRequest,
  InpaintingRequest,
  GenerationResult,
  MapTemplate,
} from '../services/ImageGenerationService';

import type { MapTemplate } from '../services/ImageGenerationService';

/**
 * Configurações do modo paint
 */
export interface PaintModeConfig {
  brushSize: number; // 5-100px
  brushOpacity: number; // 0-100%
  brushColor: string;
  tool: 'brush' | 'eraser';
  showGrid: boolean;
  feathering: number; // 0-10px suavização das bordas
  invertMask: boolean; // inverter seleção da máscara
  autoMaskSuggestions: boolean; // sugestões automáticas de máscara
  preserveEdges: boolean; // preservar bordas nítidas
}

/**
 * Dados de uma máscara desenhada
 */
export interface PaintMask {
  id: string;
  name: string;
  imageData: string; // Base64 da máscara
  prompt: string;
  area: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: Date;
}

/**
 * Estado do canvas de pintura
 */
export interface PaintCanvasState {
  isDrawing: boolean;
  lastPoint: { x: number; y: number } | null;
  currentMask: PaintMask | null;
  masks: PaintMask[];
  config: PaintModeConfig;
  canvasSize: { width: number; height: number };
  zoom: number; // nível de zoom para precisão
  pan: { x: number; y: number }; // posição do pan
  history: ImageData[]; // histórico para undo/redo
  historyIndex: number; // índice atual no histórico
}

/**
 * Configurações de qualidade para geração
 */
export interface QualitySettings {
  resolution: '512x512' | '768x768' | '1024x1024' | '1024x768' | '768x1024';
  steps: number;
  cfgScale: number;
  sampler:
    | 'K_EULER'
    | 'K_EULER_ANCESTRAL'
    | 'K_HEUN'
    | 'K_DPM_2'
    | 'K_DPM_2_ANCESTRAL'
    | 'K_DPMPP_2S_ANCESTRAL'
    | 'K_DPMPP_2M'
    | 'K_DPMPP_SDE';
}

/**
 * Histórico de gerações
 */
export interface GenerationHistory {
  id: string;
  type: 'text-to-image' | 'inpainting';
  prompt: string;
  template?: string;
  style?: string;
  imageUrl: string;
  seed?: number;
  createdAt: Date;
  parameters: QualitySettings;
}

/**
 * Configurações do preview
 */
export interface PreviewConfig {
  showOriginal: boolean;
  showGenerated: boolean;
  splitView: boolean;
  opacity: number;
  blendIntensity: number; // 0-100% mix entre original e modificado
  overlayMask: boolean; // mostrar overlay da máscara
  maskColor: string; // cor do overlay da máscara
}

/**
 * Dados de preview da modificação
 */
export interface PreviewData {
  original: string; // imagem original (base64 ou URL)
  modified: string; // imagem modificada (base64 ou URL)
  mask: string; // máscara aplicada (base64)
  prompt: string; // prompt usado para modificação
  timestamp: number;
  variations: string[]; // múltiplas variações geradas
}

/**
 * Controles do modo paint
 */
export interface PaintModeControls {
  canUndo: boolean;
  canRedo: boolean;
  canClear: boolean;
  hasActiveMask: boolean;
  isGenerating: boolean;
  previewReady: boolean;
}

/**
 * Configurações de template de mapa
 */
export interface MapTemplateConfig {
  template: string;
  basePrompt: string;
  suggestedParams: {
    width: number;
    height: number;
    steps: number;
    cfgScale: number;
  };
  tags: string[];
  description: string;
  category: 'dungeon' | 'forest' | 'city' | 'battle' | 'cave' | 'castle' | 'tavern' | 'wilderness';
}

/**
 * Estados de carregamento
 */
export type LoadingState = 'idle' | 'generating' | 'processing' | 'error';

/**
 * Erros específicos do sistema de geração
 */
export interface GenerationError {
  type: 'api_error' | 'network_error' | 'validation_error' | 'quota_exceeded';
  message: string;
  details?: string;
  retryable: boolean;
}

/**
 * Configurações avançadas do modelo
 */
export interface AdvancedModelConfig {
  seed?: number;
  guidance?: number;
  scheduler?: string;
  safetyChecker?: boolean;
  highNoiseFrac?: number;
  promptStrength?: number;
}

/**
 * Dados para export/import de configurações
 */
export interface ExportableConfig {
  templates: MapTemplate[];
  history: GenerationHistory[];
  settings: {
    defaultQuality: QualitySettings;
    defaultStyle: string;
    paintConfig: PaintModeConfig;
  };
  version: string;
}
