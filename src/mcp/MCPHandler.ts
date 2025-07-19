import type {
  MCPRequest,
  MCPResponse,
  MCPContext,
  MCPEvent,
  MCPConfig,
  MCPState,
  MCPMetrics,
  MCPActionResult,
} from './MCPTypes';
import { MCPFunctions } from './MCPFunctions';

/**
 * Manipulador principal do sistema MCP (Model Context Protocol)
 * Coordena todas as operações entre IAs e o sistema de jogo
 */
export class MCPHandler {
  private static instance: MCPHandler;
  private functions: MCPFunctions;
  private state: MCPState = 'idle';
  private config: MCPConfig;
  private metrics: MCPMetrics;
  private eventListeners: Map<string, Array<(event: MCPEvent) => void>> = new Map();
  private requestQueue: MCPRequest[] = [];
  private activeRequests: Map<string, MCPRequest> = new Map();

  private constructor() {
    this.functions = new MCPFunctions();
    this.config = {
      enableLogging: true,
      validateParams: true,
      allowUnsafeFunctions: false,
      timeoutMs: 30000,
      maxConcurrentActions: 3,
    };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      functionsUsed: {},
      lastActivity: new Date(),
    };
  }

  /**
   * Singleton pattern
   */
  static getInstance(): MCPHandler {
    if (!MCPHandler.instance) {
      MCPHandler.instance = new MCPHandler();
    }
    return MCPHandler.instance;
  }

  /**
   * Configura o sistema MCP
   */
  configure(config: Partial<MCPConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('MCP configurado', { config: this.config });
  }

  /**
   * Processa uma requisição MCP
   */
  async processRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse> {
    const startTime = Date.now();

    try {
      this.validateRequest(request);
      this.validateContext(context);

      if (this.activeRequests.size >= this.config.maxConcurrentActions) {
        throw new Error('Limite de ações simultâneas atingido');
      }

      this.state = 'processing';
      this.activeRequests.set(request.id, request);
      this.metrics.totalRequests++;

      const result = await this.executeFunction(request, context);

      this.activeRequests.delete(request.id);
      this.state = 'idle';
      this.metrics.successfulRequests++;
      this.updateMetrics(request.method, Date.now() - startTime);

      const response: MCPResponse = {
        id: request.id,
        success: true,
        result,
        timestamp: new Date(),
      };

      this.emitEvent({
        id: this.generateId(),
        type: 'action',
        source: 'mcp_handler',
        timestamp: new Date(),
        data: { request, response, context },
      });

      return response;
    } catch (error) {
      this.activeRequests.delete(request.id);
      this.state = 'error';
      this.metrics.failedRequests++;

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      const response: MCPResponse = {
        id: request.id,
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };

      this.emitEvent({
        id: this.generateId(),
        type: 'error',
        source: 'mcp_handler',
        timestamp: new Date(),
        data: { request, error: errorMessage, context },
      });

      this.log('Erro ao processar requisição MCP', { error: errorMessage, request });
      return response;
    }
  }

  /**
   * Executa uma função MCP
   */
  private async executeFunction(
    request: MCPRequest,
    context: MCPContext,
  ): Promise<MCPActionResult> {
    const { method, params } = request;

    if (!this.functions.temFuncao(method)) {
      throw new Error(`Função '${method}' não encontrada`);
    }

    // Timeout para evitar travamentos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na execução da função')), this.config.timeoutMs);
    });

    const executionPromise = this.functions.executar(method, params, context);

    return await Promise.race([executionPromise, timeoutPromise]);
  }

  /**
   * Valida requisição MCP
   */
  private validateRequest(request: MCPRequest): void {
    if (!request.id) {
      throw new Error('ID da requisição é obrigatório');
    }

    if (!request.method) {
      throw new Error('Método da requisição é obrigatório');
    }

    if (!request.params || typeof request.params !== 'object') {
      throw new Error('Parâmetros da requisição são obrigatórios');
    }

    if (this.config.validateParams) {
      const handler = this.functions.getHandler(request.method);
      if (handler) {
        const validation = handler.validate(request.params);
        if (!validation.valid) {
          throw new Error(`Parâmetros inválidos: ${validation.errors.join(', ')}`);
        }
      }
    }
  }

  /**
   * Valida contexto MCP
   */
  private validateContext(context: MCPContext): void {
    const requiredFields = ['sessionId', 'personagemId', 'turno', 'rodada'];

    for (const field of requiredFields) {
      if (!(field in context)) {
        throw new Error(`Campo obrigatório do contexto não encontrado: ${field}`);
      }
    }
  }

  /**
   * Obtém funções disponíveis
   */
  getAvailableFunctions(): ReturnType<MCPFunctions['getFuncoes']> {
    return this.functions.getFuncoes();
  }

  /**
   * Adiciona listener para eventos
   */
  addEventListener(eventType: string, listener: (event: MCPEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove listener de eventos
   */
  removeEventListener(eventType: string, listener: (event: MCPEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emite evento
   */
  private emitEvent(event: MCPEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro em listener de evento MCP:', error);
      }
    });

    // Listener global
    const globalListeners = this.eventListeners.get('*') || [];
    globalListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro em listener global MCP:', error);
      }
    });
  }

  /**
   * Obtém estado atual do sistema
   */
  getState(): MCPState {
    return this.state;
  }

  /**
   * Obtém métricas do sistema
   */
  getMetrics(): MCPMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): MCPConfig {
    return { ...this.config };
  }

  /**
   * Obtém requisições ativas
   */
  getActiveRequests(): MCPRequest[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Cancela requisição ativa
   */
  cancelRequest(requestId: string): boolean {
    if (this.activeRequests.has(requestId)) {
      this.activeRequests.delete(requestId);

      this.emitEvent({
        id: this.generateId(),
        type: 'system',
        source: 'mcp_handler',
        timestamp: new Date(),
        data: { action: 'request_cancelled', requestId },
      });

      return true;
    }
    return false;
  }

  /**
   * Pausa processamento
   */
  pause(): void {
    if (this.state !== 'disabled') {
      this.state = 'idle';
    }
  }

  /**
   * Retoma processamento
   */
  resume(): void {
    if (this.state !== 'disabled') {
      this.state = 'idle';
    }
  }

  /**
   * Desabilita sistema
   */
  disable(): void {
    this.state = 'disabled';
    this.activeRequests.clear();
    this.requestQueue.length = 0;
  }

  /**
   * Habilita sistema
   */
  enable(): void {
    this.state = 'idle';
  }

  /**
   * Reseta métricas
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      functionsUsed: {},
      lastActivity: new Date(),
    };
  }

  /**
   * Atualiza métricas
   */
  private updateMetrics(functionName: string, responseTime: number): void {
    this.metrics.functionsUsed[functionName] = (this.metrics.functionsUsed[functionName] || 0) + 1;

    // Calcula nova média de tempo de resposta
    const totalRequests = this.metrics.successfulRequests;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;

    this.metrics.lastActivity = new Date();
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sistema de log
   */
  private log(message: string, data?: Record<string, unknown>): void {
    if (this.config.enableLogging) {
      console.log(`[MCP] ${message}`, data || '');
    }
  }

  /**
   * Limpa recursos
   */
  cleanup(): void {
    this.activeRequests.clear();
    this.requestQueue.length = 0;
    this.eventListeners.clear();
    this.state = 'idle';
  }

  /**
   * Obtém estatísticas detalhadas
   */
  getDetailedStats(): {
    state: MCPState;
    metrics: MCPMetrics;
    activeRequestsCount: number;
    queuedRequestsCount: number;
    availableFunctionsCount: number;
    eventListenersCount: number;
  } {
    return {
      state: this.state,
      metrics: this.getMetrics(),
      activeRequestsCount: this.activeRequests.size,
      queuedRequestsCount: this.requestQueue.length,
      availableFunctionsCount: this.functions.getFuncoes().length,
      eventListenersCount: Array.from(this.eventListeners.values()).reduce(
        (total, listeners) => total + listeners.length,
        0,
      ),
    };
  }
}
