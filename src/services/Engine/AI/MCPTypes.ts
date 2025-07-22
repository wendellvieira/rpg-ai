/**
 * Tipos específicos para MCP (Model Context Protocol)
 */

export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
  timestamp: Date;
}

export interface MCPResponse {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
  timestamp: Date;
}

export interface MCPFunction {
  name: string;
  description: string;
  parameters: MCPParameter[];
  category: 'combate' | 'movimento' | 'social' | 'magia' | 'utilidade' | 'sistema';
  requiresTarget?: boolean;
  requiresItem?: boolean;
}

export interface MCPParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
  default?: unknown;
}

export interface MCPContext {
  sessionId: string;
  personagemId: string;
  turno: number;
  rodada: number;
  ambiente: string;
  participantes: string[];
  equipamentosDisponiveis: string[];
  itensDisponiveis: string[];
  statusPersonagem: Record<string, unknown>;
}

export interface MCPActionResult {
  success: boolean;
  description: string;
  effects: MCPEffect[];
  dados?: {
    rolagem: string;
    resultado: number;
    modificadores: number;
    total: number;
  };
  nextAction?: string;
}

export interface MCPEffect {
  type: 'dano' | 'cura' | 'status' | 'movimento' | 'item' | 'atributo' | 'magia';
  target: string;
  value: number | string;
  duration?: number;
  description: string;
}

// Funções específicas de combate
export interface AtaqueParams {
  alvo: string;
  arma?: string;
  tipoAtaque: 'corpo_a_corpo' | 'distancia' | 'magia';
  vantagem?: boolean;
  desvantagem?: boolean;
}

export interface DefesaParams {
  tipoDefesa: 'esquiva' | 'bloqueio' | 'aparar';
  item?: string;
}

export interface MovimentoParams {
  destino: string;
  tipoMovimento: 'normal' | 'corrida' | 'furtivo' | 'escalada';
  distancia: number;
}

export interface MagiaParams {
  magia: string;
  nivel: number;
  alvo?: string;
  slot?: number;
  componentes: string[];
}

export interface UsarItemParams {
  item: string;
  alvo?: string;
  quantidade?: number;
}

// Tipos para respostas específicas
export interface AtaqueResult extends MCPActionResult {
  hit: boolean;
  critico: boolean;
  dano: number;
  tipoDano: string;
}

export interface MagiaResult extends MCPActionResult {
  magiaLancada: string;
  slotsUsados: number;
  componentsConsumidos: string[];
  alcance: number;
}

export interface MovimentoResult extends MCPActionResult {
  posicaoAnterior: string;
  novaPosicao: string;
  distanciaPercorrida: number;
  movimentoRestante: number;
}

// Interface para handlers de função MCP
export interface MCPFunctionHandler {
  execute(params: Record<string, unknown>, context: MCPContext): Promise<MCPActionResult>;
  validate(params: Record<string, unknown>): { valid: boolean; errors: string[] };
  getRequiredContext(): string[];
}

// Eventos MCP
export interface MCPEvent {
  id: string;
  type: 'action' | 'system' | 'error' | 'notification';
  source: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// Configuração MCP
export interface MCPConfig {
  enableLogging: boolean;
  validateParams: boolean;
  allowUnsafeFunctions: boolean;
  timeoutMs: number;
  maxConcurrentActions: number;
}

// Estados do sistema MCP
export type MCPState = 'idle' | 'processing' | 'waiting_input' | 'error' | 'disabled';

// Métricas MCP
export interface MCPMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  functionsUsed: Record<string, number>;
  lastActivity: Date;
}
