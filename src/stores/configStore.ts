import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface ConfiguracaoGlobal {
  openaiApiKey: string;
  openaiModel: string;
  openaiTemperature: number;
  stabilityApiKey: string;
  stabilityModel: string;
  stabilityApiVersion: string;
  stabilityEngine: string;
  stabilityDefaultWidth: number;
  stabilityDefaultHeight: number;
  stabilityDefaultSteps: number;
  stabilityDefaultCfgScale: number;
  autoSave: boolean;
  autoSaveInterval: number; // em segundos
  tema: 'auto' | 'light' | 'dark';
  idioma: string;
  debug: boolean;
  maxHistoricoMensagens: number;
  timeoutIA: number; // em segundos
}

export interface ConfiguracaoSessao {
  permitirIAs: boolean;
  frequenciaAcaoIA: number; // em segundos
  dificuldadeGlobal: number; // 1-20
  usarRegrasD20: boolean;
  mostrarRolagens: boolean;
  logAcoes: boolean;
}

const DEFAULT_CONFIG: ConfiguracaoGlobal = {
  openaiApiKey: '',
  openaiModel: 'gpt-4',
  openaiTemperature: 0.7,
  stabilityApiKey: '',
  stabilityModel: 'sd3-large-turbo',
  stabilityApiVersion: 'v2beta',
  stabilityEngine: 'sd3-large-turbo',
  stabilityDefaultWidth: 1024,
  stabilityDefaultHeight: 1024,
  stabilityDefaultSteps: 30,
  stabilityDefaultCfgScale: 7.0,
  autoSave: true,
  autoSaveInterval: 30,
  tema: 'auto',
  idioma: 'pt-BR',
  debug: false,
  maxHistoricoMensagens: 100,
  timeoutIA: 30,
};

const DEFAULT_SESSION_CONFIG: ConfiguracaoSessao = {
  permitirIAs: true,
  frequenciaAcaoIA: 5,
  dificuldadeGlobal: 10,
  usarRegrasD20: true,
  mostrarRolagens: true,
  logAcoes: true,
};

export const useConfigStore = defineStore('config', () => {
  // Estado
  const configuracao = ref<ConfiguracaoGlobal>({ ...DEFAULT_CONFIG });
  const configuracaoSessao = ref<ConfiguracaoSessao>({ ...DEFAULT_SESSION_CONFIG });
  const carregado = ref(false);

  // Computed
  const isApiConfigured = computed(() => {
    return configuracao.value.openaiApiKey.length > 0;
  });

  const isStabilityConfigured = computed(() => {
    return configuracao.value.stabilityApiKey.length > 0;
  });

  const isAnyApiConfigured = computed(() => {
    return isApiConfigured.value || isStabilityConfigured.value;
  });

  const isDarkMode = computed(() => {
    if (configuracao.value.tema === 'dark') return true;
    if (configuracao.value.tema === 'light') return false;
    // Auto: detectar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const configSerializada = computed(() => {
    return JSON.stringify(configuracao.value, null, 2);
  });

  // Actions
  function carregarConfiguracoes(): void {
    try {
      // Primeiro, carregar do .env se disponível
      const envConfig: Partial<ConfiguracaoGlobal> = {};

      if (import.meta.env.VITE_OPENAI_API_KEY) {
        envConfig.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      }

      if (import.meta.env.VITE_OPENAI_MODEL) {
        envConfig.openaiModel = import.meta.env.VITE_OPENAI_MODEL;
      }

      if (import.meta.env.VITE_STABILITY_API_KEY) {
        envConfig.stabilityApiKey = import.meta.env.VITE_STABILITY_API_KEY;
      }

      if (import.meta.env.VITE_STABILITY_MODEL) {
        envConfig.stabilityModel = import.meta.env.VITE_STABILITY_MODEL;
      }

      if (import.meta.env.VITE_STABILITY_API_VERSION) {
        envConfig.stabilityApiVersion = import.meta.env.VITE_STABILITY_API_VERSION;
      }

      if (import.meta.env.VITE_STABILITY_ENGINE) {
        envConfig.stabilityEngine = import.meta.env.VITE_STABILITY_ENGINE;
      }

      // Inicializar com padrões + .env
      configuracao.value = { ...DEFAULT_CONFIG, ...envConfig };

      // Depois, sobrescrever com localStorage se existir
      const configSalva = localStorage.getItem('rpg-ai-config');
      if (configSalva) {
        const config = JSON.parse(configSalva);
        configuracao.value = { ...configuracao.value, ...config };
      }

      const sessionConfigSalva = localStorage.getItem('rpg-ai-session-config');
      if (sessionConfigSalva) {
        const config = JSON.parse(sessionConfigSalva);
        configuracaoSessao.value = { ...DEFAULT_SESSION_CONFIG, ...config };
      }

      carregado.value = true;

      // Debug: log da configuração carregada
      if (configuracao.value.debug || import.meta.env.DEV) {
        console.log('🔧 Configurações carregadas:', {
          openaiConfigured: !!configuracao.value.openaiApiKey,
          stabilityConfigured: !!configuracao.value.stabilityApiKey,
          hasEnvVars: {
            openai: !!import.meta.env.VITE_OPENAI_API_KEY,
            stability: !!import.meta.env.VITE_STABILITY_API_KEY,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Usar configurações padrão
      configuracao.value = { ...DEFAULT_CONFIG };
      configuracaoSessao.value = { ...DEFAULT_SESSION_CONFIG };
      carregado.value = true;
    }
  }

  function salvarConfiguracoes(): void {
    try {
      localStorage.setItem('rpg-ai-config', JSON.stringify(configuracao.value));
      localStorage.setItem('rpg-ai-session-config', JSON.stringify(configuracaoSessao.value));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  function atualizarConfiguracao(novaConfig: Partial<ConfiguracaoGlobal>): void {
    configuracao.value = { ...configuracao.value, ...novaConfig };
    salvarConfiguracoes();
  }

  function atualizarConfiguracaoSessao(novaConfig: Partial<ConfiguracaoSessao>): void {
    configuracaoSessao.value = { ...configuracaoSessao.value, ...novaConfig };
    salvarConfiguracoes();
  }

  function resetarConfiguracoes(): void {
    configuracao.value = { ...DEFAULT_CONFIG };
    configuracaoSessao.value = { ...DEFAULT_SESSION_CONFIG };
    salvarConfiguracoes();
  }

  function definirApiKey(apiKey: string): void {
    atualizarConfiguracao({ openaiApiKey: apiKey });
  }

  function definirModelo(modelo: string): void {
    atualizarConfiguracao({ openaiModel: modelo });
  }

  function definirTemperatura(temperatura: number): void {
    atualizarConfiguracao({ openaiTemperature: temperatura });
  }

  function definirStabilityApiKey(apiKey: string): void {
    atualizarConfiguracao({ stabilityApiKey: apiKey });
  }

  function definirStabilityModelo(modelo: string): void {
    atualizarConfiguracao({ stabilityModel: modelo });
  }

  function definirStabilityApiVersion(versao: string): void {
    atualizarConfiguracao({ stabilityApiVersion: versao });
  }

  function definirStabilityEngine(engine: string): void {
    atualizarConfiguracao({ stabilityEngine: engine });
  }

  function definirStabilityConfig(config: {
    largura?: number;
    altura?: number;
    steps?: number;
    cfgScale?: number;
  }): void {
    const novaConfig: Partial<ConfiguracaoGlobal> = {};

    if (config.largura !== undefined) novaConfig.stabilityDefaultWidth = config.largura;
    if (config.altura !== undefined) novaConfig.stabilityDefaultHeight = config.altura;
    if (config.steps !== undefined) novaConfig.stabilityDefaultSteps = config.steps;
    if (config.cfgScale !== undefined) novaConfig.stabilityDefaultCfgScale = config.cfgScale;

    atualizarConfiguracao(novaConfig);
  }

  function definirTema(tema: 'auto' | 'light' | 'dark'): void {
    atualizarConfiguracao({ tema });
  }

  function alternarDebug(): void {
    atualizarConfiguracao({ debug: !configuracao.value.debug });
  }

  function alternarAutoSave(): void {
    atualizarConfiguracao({ autoSave: !configuracao.value.autoSave });
  }

  function exportarConfiguracoes(): string {
    return JSON.stringify(
      {
        configuracao: configuracao.value,
        configuracaoSessao: configuracaoSessao.value,
      },
      null,
      2,
    );
  }

  function importarConfiguracoes(dadosJson: string): void {
    try {
      const dados = JSON.parse(dadosJson);

      if (dados.configuracao) {
        configuracao.value = { ...DEFAULT_CONFIG, ...dados.configuracao };
      }

      if (dados.configuracaoSessao) {
        configuracaoSessao.value = { ...DEFAULT_SESSION_CONFIG, ...dados.configuracaoSessao };
      }

      salvarConfiguracoes();
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      throw new Error('Formato de configuração inválido');
    }
  }

  function obterConfiguracao<K extends keyof ConfiguracaoGlobal>(chave: K): ConfiguracaoGlobal[K] {
    return configuracao.value[chave];
  }

  function obterConfiguracaoSessao<K extends keyof ConfiguracaoSessao>(
    chave: K,
  ): ConfiguracaoSessao[K] {
    return configuracaoSessao.value[chave];
  }

  // Validações
  function validarConfiguracao(): string[] {
    const erros: string[] = [];

    if (!configuracao.value.openaiApiKey) {
      erros.push('Chave da API OpenAI é obrigatória');
    }

    if (configuracao.value.openaiTemperature < 0 || configuracao.value.openaiTemperature > 2) {
      erros.push('Temperatura deve estar entre 0 e 2');
    }

    if (configuracao.value.autoSaveInterval < 10) {
      erros.push('Intervalo de auto-save deve ser pelo menos 10 segundos');
    }

    if (configuracao.value.maxHistoricoMensagens < 10) {
      erros.push('Máximo de mensagens deve ser pelo menos 10');
    }

    if (configuracao.value.timeoutIA < 5) {
      erros.push('Timeout da IA deve ser pelo menos 5 segundos');
    }

    return erros;
  }

  function validarConfiguracaoSessao(): string[] {
    const erros: string[] = [];

    if (configuracaoSessao.value.frequenciaAcaoIA < 1) {
      erros.push('Frequência de ação da IA deve ser pelo menos 1 segundo');
    }

    if (
      configuracaoSessao.value.dificuldadeGlobal < 1 ||
      configuracaoSessao.value.dificuldadeGlobal > 20
    ) {
      erros.push('Dificuldade global deve estar entre 1 e 20');
    }

    return erros;
  }

  return {
    // Estado
    configuracao,
    configuracaoSessao,
    carregado,

    // Computed
    isApiConfigured,
    isStabilityConfigured,
    isAnyApiConfigured,
    isDarkMode,
    configSerializada,

    // Actions
    carregarConfiguracoes,
    salvarConfiguracoes,
    atualizarConfiguracao,
    atualizarConfiguracaoSessao,
    resetarConfiguracoes,
    definirApiKey,
    definirModelo,
    definirTemperatura,
    definirStabilityApiKey,
    definirStabilityModelo,
    definirStabilityApiVersion,
    definirStabilityEngine,
    definirStabilityConfig,
    definirTema,
    alternarDebug,
    alternarAutoSave,
    exportarConfiguracoes,
    importarConfiguracoes,
    obterConfiguracao,
    obterConfiguracaoSessao,
    validarConfiguracao,
    validarConfiguracaoSessao,
  };
});
