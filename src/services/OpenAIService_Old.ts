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
 * Serviço para integração com OpenAI GPT
 */
export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI | null = null;
  private configuracao: ConfiguracaoIA | null = null;

  private constructor() {}

  /**
   * Singleton pattern
   */
  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
      // Auto-configurar se a API key estiver no .env
      OpenAIService.instance.autoConfigurar();
    }
    return OpenAIService.instance;
  }

  /**
   * Auto-configura usando variáveis de ambiente se disponíveis
   */
  private autoConfigurar(): void {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const model = import.meta.env.VITE_OPENAI_MODEL;
    const organization = import.meta.env.VITE_OPENAI_ORGANIZATION;

    console.log('🤖 [DEBUG] AutoConfigurar - API Key encontrada:', !!apiKey);
    console.log('🤖 [DEBUG] AutoConfigurar - Model:', model || 'padrão');
    console.log('🤖 [DEBUG] AutoConfigurar - Organization:', organization || 'nenhuma');

    if (apiKey) {
      console.log('🤖 [DEBUG] API Key encontrada no .env - configurando OpenAI automaticamente');
      this.configurar({
        apiKey,
        model: model || 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1000,
      });

      if (organization) {
        console.log('🤖 [DEBUG] Configurando organização:', organization);
        // Se houver organização, reconfigurar o cliente com ela
        this.client = new OpenAI({
          apiKey,
          organization,
          dangerouslyAllowBrowser: true,
        });
      }

      console.log(
        '🤖 [DEBUG] OpenAI configurado via .env - estaConfigurado:',
        this.estaConfigurado(),
      );
    } else {
      console.log('🤖 [DEBUG] Nenhuma API Key encontrada no .env');
    }
  }

  /**
   * Configura a API da OpenAI
   */
  configurar(config: ConfiguracaoIA): void {
    console.log('🤖 [DEBUG] Configurando OpenAI com:', {
      hasApiKey: !!config.apiKey,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });

    this.configuracao = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };

    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true, // Permitir uso no browser
    });

    console.log('🤖 [DEBUG] OpenAI configurado - cliente criado:', !!this.client);
    console.log('🤖 [DEBUG] OpenAI configurado - estaConfigurado:', this.estaConfigurado());
  }

  /**
   * Verifica se está configurado
   */
  estaConfigurado(): boolean {
    return this.client !== null && this.configuracao !== null;
  }

  /**
   * Envia mensagem para a IA
   */
  async enviarMensagem(mensagens: MensagemIA[]): Promise<RespostaIA> {
    console.log('🤖 [DEBUG] enviarMensagem - Verificando configuração...');
    console.log('🤖 [DEBUG] enviarMensagem - Cliente existe:', !!this.client);
    console.log('🤖 [DEBUG] enviarMensagem - Configuração existe:', !!this.configuracao);

    if (!this.client || !this.configuracao) {
      const erro = 'OpenAI não está configurado';
      console.error('🤖 [ERROR]', erro);
      throw new Error(erro);
    }

    const inicioTempo = Date.now();
    console.log('🤖 [DEBUG] enviarMensagem - Iniciando chamada para OpenAI...');

    try {
      const parametros: Record<string, unknown> = {
        model: this.configuracao.model!,
        messages: mensagens,
      };

      if (this.configuracao.temperature !== undefined) {
        parametros.temperature = this.configuracao.temperature;
      }

      if (this.configuracao.maxTokens !== undefined) {
        parametros.max_tokens = this.configuracao.maxTokens;
      }

      console.log('🤖 [DEBUG] enviarMensagem - Parâmetros:', {
        model: parametros.model,
        temperature: parametros.temperature,
        max_tokens: parametros.max_tokens,
        mensagens: mensagens.length,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resposta = await this.client.chat.completions.create(parametros as any);

      const tempoDecorrido = Date.now() - inicioTempo;
      console.log('🤖 [DEBUG] enviarMensagem - Resposta recebida em', tempoDecorrido, 'ms');

      const conteudo = resposta.choices[0]?.message?.content || '';
      const tokens = resposta.usage?.total_tokens || 0;

      const resultado = {
        conteudo,
        tokens,
        modelo: this.configuracao.model!,
        tempo: tempoDecorrido,
      };

      console.log('🤖 [DEBUG] enviarMensagem - Resultado final:', {
        conteudo: conteudo.substring(0, 100) + '...',
        tokens,
        modelo: resultado.modelo,
        tempo: resultado.tempo,
      });

      return resultado;
    } catch (error) {
      console.error('🤖 [ERROR] Erro ao chamar OpenAI:', error);
      console.error('🤖 [ERROR] Tipo do erro:', typeof error);
      console.error('🤖 [ERROR] Stack trace:', error instanceof Error ? error.stack : 'N/A');

      const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🤖 [ERROR] Mensagem final:', mensagemErro);

      throw new Error(`Falha na comunicação com OpenAI: ${mensagemErro}`);
    }
  }

  /**
   * Gera resposta de personagem IA
   */
  async gerarRespostaPersonagem(
    contexto: string,
    personalidade: string,
    situacao: string,
    historico: string[],
  ): Promise<RespostaIA> {
    const prompt = this.construirPromptPersonagem(contexto, personalidade, situacao, historico);

    const mensagens: MensagemIA[] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: situacao,
      },
    ];

    return await this.enviarMensagem(mensagens);
  }

  /**
   * Gera narração do mestre
   */
  async gerarNarracao(contexto: string, acoes: string[], ambiente: string): Promise<RespostaIA> {
    const prompt = this.construirPromptMestre(contexto, ambiente);

    const mensagens: MensagemIA[] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: `Ações dos jogadores: ${acoes.join(', ')}`,
      },
    ];

    return await this.enviarMensagem(mensagens);
  }

  /**
   * Analisa ação de combate
   */
  async analisarAcaoCombate(
    acao: string,
    personagem: string,
    contexto: string,
  ): Promise<RespostaIA> {
    const prompt = `Você é um mestre de RPG D&D 5e. Analise a seguinte ação de combate e determine o resultado.

REGRAS:
- Seja preciso com as mecânicas do D&D 5e
- Descreva o resultado de forma cinematográfica
- Indique qual dado rolar se necessário
- Considere modificadores relevantes

PERSONAGEM: ${personagem}
CONTEXTO: ${contexto}
AÇÃO: ${acao}

Responda no formato:
RESULTADO: [sucesso/falha/necessita_rolagem]
DESCRIÇÃO: [descrição narrativa]
DADOS: [dados a rolar, se necessário]
EFEITOS: [efeitos mecânicos]`;

    const mensagens: MensagemIA[] = [
      {
        role: 'system',
        content: prompt,
      },
    ];

    return await this.enviarMensagem(mensagens);
  }

  /**
   * Gera sugestões de ação
   */
  async sugerirAcoes(
    personagem: string,
    situacao: string,
    habilidades: string[],
  ): Promise<RespostaIA> {
    const prompt = `Você é um assistente de RPG. Sugira 3-5 ações possíveis para o personagem na situação atual.

PERSONAGEM: ${personagem}
SITUAÇÃO: ${situacao}
HABILIDADES DISPONÍVEIS: ${habilidades.join(', ')}

Sugira ações variadas: combate, sociais, utilitárias, criativas.
Seja conciso e específico.`;

    const mensagens: MensagemIA[] = [
      {
        role: 'system',
        content: prompt,
      },
    ];

    return await this.enviarMensagem(mensagens);
  }

  /**
   * Constrói prompt para personagem
   */
  private construirPromptPersonagem(
    contexto: string,
    personalidade: string,
    situacao: string,
    historico: string[],
  ): string {
    return `Você está interpretando um personagem de RPG com a seguinte personalidade:

${personalidade}

CONTEXTO ATUAL: ${contexto}

HISTÓRICO RECENTE:
${historico.slice(-5).join('\n')}

INSTRUÇÕES:
- Mantenha-se fiel à personalidade do personagem
- Responda em primeira pessoa
- Seja coerente com o contexto e histórico
- Limite a 2-3 parágrafos
- Inclua diálogo e/ou ações quando apropriado

SITUAÇÃO ATUAL: ${situacao}

Responda como o personagem reagiria:`;
  }

  /**
   * Constrói prompt para mestre
   */
  private construirPromptMestre(contexto: string, ambiente: string): string {
    return `Você é um Mestre de RPG experiente narrando uma aventura.

CONTEXTO: ${contexto}
AMBIENTE: ${ambiente}

INSTRUÇÕES:
- Seja descritivo e envolvente
- Mantenha o ritmo da história
- Introduza elementos interessantes
- Responda às ações dos jogadores
- Use tom adequado ao ambiente
- Limite a 2-3 parágrafos

Narre o que acontece a seguir:`;
  }

  /**
   * Testa conexão com a API
   */
  async testarConexao(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const resposta = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Teste de conexão.' }],
        max_tokens: 10,
      });

      return resposta.choices.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Obtém modelos disponíveis
   */
  getModelosDisponiveis(): string[] {
    return ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-32k', 'gpt-4-turbo-preview'];
  }

  /**
   * Estima custo de uma operação
   */
  estimarCusto(tokens: number, modelo: string = 'gpt-3.5-turbo'): number {
    // Preços aproximados por 1000 tokens (valores de exemplo)
    const precos: Record<string, number> = {
      'gpt-3.5-turbo': 0.002,
      'gpt-3.5-turbo-16k': 0.003,
      'gpt-4': 0.03,
      'gpt-4-32k': 0.06,
      'gpt-4-turbo-preview': 0.01,
    };

    const precoPor1000 = precos[modelo] || precos['gpt-3.5-turbo']!;
    return (tokens / 1000) * precoPor1000;
  }

  /**
   * Obtém estatísticas de uso
   */
  getEstatisticas(): {
    totalChamadas: number;
    totalTokens: number;
    custoEstimado: number;
    modeloMaisUsado: string;
  } {
    // Em uma implementação real, isso seria persistido
    return {
      totalChamadas: 0,
      totalTokens: 0,
      custoEstimado: 0,
      modeloMaisUsado: 'gpt-3.5-turbo',
    };
  }

  /**
   * Limpa configuração
   */
  limparConfiguracao(): void {
    this.client = null;
    this.configuracao = null;
  }
}
