import OpenAI from 'openai';

export interface MensagemIA {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface ConfiguracaoIA {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  organization?: string;
}

export interface RespostaIA {
  conteudo: string;
  tokens: number;
  modelo: string;
  tempo: number;
}

/**
 * Limpa formatação markdown de respostas JSON da IA
 */
export function limparRespostaJSON(resposta: string): string {
  let conteudoLimpo = resposta.trim();

  // Remover blocos de código markdown
  if (conteudoLimpo.startsWith('```json')) {
    conteudoLimpo = conteudoLimpo.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
  } else if (conteudoLimpo.startsWith('```')) {
    conteudoLimpo = conteudoLimpo.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
  }

  return conteudoLimpo.trim();
}

/**
 * 🤖 OpenAI Service - Classe estática para integração com OpenAI GPT
 *
 * Convertido de singleton para métodos estáticos seguindo as diretrizes de arquitetura.
 * A configuração é gerenciada externamente (via store ou context).
 */
export class OpenAIService {
  // Cache de clientes OpenAI por configuração
  private static clients = new Map<string, OpenAI>();

  /**
   * Obtém configuração padrão do ambiente
   */
  private static getDefaultConfig(): Partial<ConfiguracaoIA> {
    return {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      organization: import.meta.env.VITE_OPENAI_ORGANIZATION,
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  /**
   * Cria chave de cache para cliente OpenAI
   */
  private static createClientKey(config: ConfiguracaoIA): string {
    return `${config.apiKey}-${config.organization || 'default'}`;
  }

  /**
   * Obtém ou cria cliente OpenAI para uma configuração
   */
  private static getClient(config: ConfiguracaoIA): OpenAI {
    const key = this.createClientKey(config);

    if (!this.clients.has(key)) {
      console.log('🤖 [DEBUG] Criando novo cliente OpenAI');

      const clientConfig: Record<string, unknown> = {
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      };

      if (config.organization) {
        clientConfig.organization = config.organization;
      }

      this.clients.set(key, new OpenAI(clientConfig));
    }

    return this.clients.get(key)!;
  }

  /**
   * Valida se uma configuração é válida
   */
  static isConfigValid(config: Partial<ConfiguracaoIA>): boolean {
    return !!(config.apiKey && config.apiKey.length > 0);
  }

  /**
   * Mescla configuração com padrões do ambiente
   */
  static mergeWithDefaults(config: Partial<ConfiguracaoIA>): ConfiguracaoIA {
    const defaults = this.getDefaultConfig();

    const merged: ConfiguracaoIA = {
      apiKey: config.apiKey || defaults.apiKey || '',
      model: config.model || defaults.model || 'gpt-4o-mini',
      temperature: config.temperature ?? defaults.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? defaults.maxTokens ?? 1000,
    };

    // Adicionar organization apenas se definida
    if (config.organization || defaults.organization) {
      merged.organization = (config.organization || defaults.organization) as string;
    }

    return merged;
  }

  /**
   * Envia mensagens para a IA e retorna resposta
   */
  static async enviarMensagens(
    mensagens: MensagemIA[],
    config: Partial<ConfiguracaoIA> = {},
  ): Promise<RespostaIA> {
    const fullConfig = this.mergeWithDefaults(config);

    if (!this.isConfigValid(fullConfig)) {
      throw new Error('Configuração OpenAI inválida - API Key necessária');
    }

    const client = this.getClient(fullConfig);
    const startTime = Date.now();

    console.log('🤖 [DEBUG] Enviando mensagens para OpenAI:', {
      model: fullConfig.model,
      temperature: fullConfig.temperature,
      maxTokens: fullConfig.maxTokens,
      mensagens: mensagens.length,
    });

    try {
      const completion = await client.chat.completions.create({
        model: fullConfig.model!,
        messages: mensagens,
        temperature: fullConfig.temperature ?? 0.7,
        max_tokens: fullConfig.maxTokens ?? 1000,
      });

      const resposta = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || 0;
      const tempo = Date.now() - startTime;

      console.log('🤖 [DEBUG] Resposta recebida:', {
        tokens,
        tempo: `${tempo}ms`,
        tamanho: resposta.length,
      });

      return {
        conteudo: resposta,
        tokens,
        modelo: fullConfig.model!,
        tempo,
      };
    } catch (error) {
      console.error('🤖 [ERROR] Erro ao enviar mensagens:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro na comunicação com OpenAI: ${errorMsg}`);
    }
  }

  /**
   * Gera resposta como personagem
   */
  static async gerarRespostaPersonagem(
    contexto: string,
    personagemNome: string,
    personagemInfo: string,
    config: Partial<ConfiguracaoIA> = {},
  ): Promise<RespostaIA> {
    const prompt = this.construirPromptPersonagem(personagemNome, personagemInfo, contexto);

    const mensagens: MensagemIA[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: contexto },
    ];

    return this.enviarMensagens(mensagens, config);
  }

  /**
   * Gera resposta como mestre
   */
  static async gerarRespostaMestre(
    contexto: string,
    ambiente: string,
    config: Partial<ConfiguracaoIA> = {},
  ): Promise<RespostaIA> {
    const prompt = this.construirPromptMestre(contexto, ambiente);

    const mensagens: MensagemIA[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: contexto },
    ];

    return this.enviarMensagens(mensagens, config);
  }

  /**
   * Gera sugestão de ação baseada no contexto
   */
  static async gerarSugestaoAcao(
    contexto: string,
    situacao: string,
    config: Partial<ConfiguracaoIA> = {},
  ): Promise<RespostaIA> {
    const prompt = `Você é um assistente de RPG especialista em D&D 5e.
    Analise a situação atual e sugira 3-5 ações possíveis para o jogador.

    Seja criativo mas mantenha as sugestões dentro das regras do D&D 5e.
    Considere habilidades de classe, equipamentos e o ambiente atual.

    Formato de resposta:
    - Ação 1: [descrição]
    - Ação 2: [descrição]
    - Ação 3: [descrição]

    Situação: ${situacao}
    Contexto: ${contexto}`;

    const mensagens: MensagemIA[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: `Situação: ${situacao}\nContexto: ${contexto}` },
    ];

    return this.enviarMensagens(mensagens, config);
  }

  /**
   * Processa resposta JSON da IA
   */
  static async processarRespostaJSON<T = Record<string, unknown>>(
    mensagens: MensagemIA[],
    config: Partial<ConfiguracaoIA> = {},
  ): Promise<T> {
    const resposta = await this.enviarMensagens(mensagens, config);
    const conteudoLimpo = limparRespostaJSON(resposta.conteudo);

    try {
      return JSON.parse(conteudoLimpo) as T;
    } catch (error) {
      console.error('🤖 [ERROR] Erro ao fazer parse do JSON:', conteudoLimpo);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Resposta da IA não é um JSON válido: ${errorMsg}`);
    }
  }

  /**
   * Obtém lista de modelos disponíveis
   */
  static getModelosDisponiveis(): string[] {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
  }

  /**
   * Estima custo aproximado para uma quantidade de tokens
   */
  static estimarCusto(tokens: number, modelo: string = 'gpt-4o-mini'): number {
    // Preços aproximados por 1K tokens (valores de referência)
    const precos: Record<string, number> = {
      'gpt-4o': 0.005,
      'gpt-4o-mini': 0.000001,
      'gpt-4-turbo': 0.01,
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.0015,
      'gpt-3.5-turbo-16k': 0.003,
    };

    const preco = precos[modelo] ?? precos['gpt-4o-mini']!;
    return (tokens / 1000) * preco;
  }

  /**
   * Limpa cache de clientes
   */
  static clearCache(): void {
    this.clients.clear();
    console.log('🤖 [DEBUG] Cache de clientes OpenAI limpo');
  }

  // Métodos privados para construção de prompts

  private static construirPromptPersonagem(nome: string, info: string, contexto: string): string {
    return `Você é ${nome}, um personagem de RPG de D&D 5ª edição.

INFORMAÇÕES DO PERSONAGEM:
${info}

INSTRUÇÕES:
- Responda sempre em primeira pessoa como ${nome}
- Mantenha a personalidade e motivações do personagem
- Use o estilo de fala apropriado para a classe e background
- Considere as habilidades e limitações do personagem
- Reaja de forma consistente com a personalidade estabelecida

CONTEXTO DA SITUAÇÃO:
${contexto}

Responda como ${nome} reagiria nesta situação:`;
  }

  private static construirPromptMestre(contexto: string, ambiente: string): string {
    return `Você é um Mestre (DM) experiente de D&D 5ª edição.

AMBIENTE DA AVENTURA:
${ambiente}

INSTRUÇÕES:
- Descreva as cenas de forma vívida e imersiva
- Mantenha o foco na narrativa e diversão dos jogadores
- Use as regras de D&D 5e como referência
- Crie consequências lógicas para as ações dos personagens
- Mantenha o ritmo da aventura equilibrado entre ação, roleplay e exploração

CONTEXTO ATUAL:
${contexto}

Como Mestre, descreva o que acontece na sequência:`;
  }
}
