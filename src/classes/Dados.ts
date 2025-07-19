import type { ResultadoDados, AtributosPrimarios } from '../types';

/**
 * Sistema de rolagem de dados D&D
 * Suporta notações como: d20, 2d6+3, 1d8-1, etc.
 */
export class Dados {
  private static readonly REGEX_DADOS = /^(\d*)d(\d+)([+-]\d+)?$/i;

  /**
   * Rola dados baseado na notação D&D
   * @param notacao - String no formato "XdY+Z" (ex: "2d6+3", "d20", "1d8-1")
   * @returns Resultado detalhado da rolagem
   */
  static rolar(notacao: string): ResultadoDados {
    const match = notacao.match(this.REGEX_DADOS);

    if (!match) {
      throw new Error(`Notação de dados inválida: ${notacao}`);
    }

    const quantidade = parseInt(match[1] || '1') || 1;
    const lados = parseInt(match[2] || '20');
    const modificador = parseInt(match[3] || '0') || 0;

    if (quantidade < 1 || lados < 2) {
      throw new Error(`Valores inválidos para dados: ${quantidade}d${lados}`);
    }

    const resultados: number[] = [];
    let total = 0;

    // Rola cada dado individualmente
    for (let i = 0; i < quantidade; i++) {
      const resultado = Math.floor(Math.random() * lados) + 1;
      resultados.push(resultado);
      total += resultado;
    }

    const totalFinal = total + modificador;
    const critico = this.verificarCritico(resultados, lados);

    return {
      tipo: notacao,
      resultados,
      total: totalFinal,
      modificador,
      critico,
    };
  }

  /**
   * Rola um d20 com modificador (teste padrão D&D)
   */
  static rolarD20(modificador: number = 0): ResultadoDados {
    return this.rolar(`d20${modificador >= 0 ? '+' : ''}${modificador}`);
  }

  /**
   * Rola múltiplos d6 (comum para dano)
   */
  static rolarD6(quantidade: number, modificador: number = 0): ResultadoDados {
    return this.rolar(`${quantidade}d6${modificador >= 0 ? '+' : ''}${modificador}`);
  }

  /**
   * Rola com vantagem (rola 2d20, pega o maior)
   */
  static rolarComVantagem(modificador: number = 0): ResultadoDados {
    const rolagem1 = this.rolarD20(0);
    const rolagem2 = this.rolarD20(0);

    const melhorResultado = Math.max(rolagem1.total, rolagem2.total);
    const totalFinal = melhorResultado + modificador;

    return {
      tipo: `2d20kh1${modificador >= 0 ? '+' : ''}${modificador} (vantagem)`,
      resultados: [rolagem1.resultados[0]!, rolagem2.resultados[0]!],
      total: totalFinal,
      modificador,
      critico: Math.max(...rolagem1.resultados, ...rolagem2.resultados) === 20,
    };
  }

  /**
   * Rola com desvantagem (rola 2d20, pega o menor)
   */
  static rolarComDesvantagem(modificador: number = 0): ResultadoDados {
    const rolagem1 = this.rolarD20(0);
    const rolagem2 = this.rolarD20(0);

    const piorResultado = Math.min(rolagem1.total, rolagem2.total);
    const totalFinal = piorResultado + modificador;

    return {
      tipo: `2d20kl1${modificador >= 0 ? '+' : ''}${modificador} (desvantagem)`,
      resultados: [rolagem1.resultados[0]!, rolagem2.resultados[0]!],
      total: totalFinal,
      modificador,
      critico: false, // Desvantagem nunca pode ser crítico
    };
  }

  /**
   * Rola atributos iniciais (4d6, remove o menor)
   */
  static rolarAtributoInicial(): number {
    const resultados: number[] = [];

    // Rola 4d6
    for (let i = 0; i < 4; i++) {
      resultados.push(Math.floor(Math.random() * 6) + 1);
    }

    // Remove o menor valor
    resultados.sort((a, b) => b - a);
    return resultados.slice(0, 3).reduce((sum, val) => sum + val, 0);
  }

  /**
   * Gera conjunto completo de atributos
   */
  static gerarAtributosIniciais(): Record<keyof AtributosPrimarios, number> {
    return {
      forca: this.rolarAtributoInicial(),
      destreza: this.rolarAtributoInicial(),
      constituicao: this.rolarAtributoInicial(),
      inteligencia: this.rolarAtributoInicial(),
      sabedoria: this.rolarAtributoInicial(),
      carisma: this.rolarAtributoInicial(),
    };
  }

  /**
   * Verifica se houve crítico (natural 20 ou máximo no dado)
   */
  private static verificarCritico(resultados: number[], lados: number): boolean {
    return resultados.some((resultado) => resultado === lados);
  }

  /**
   * Calcula modificador de atributo D&D 5e
   */
  static calcularModificador(valorAtributo: number): number {
    return Math.floor((valorAtributo - 10) / 2);
  }

  /**
   * Formata resultado de dados para exibição
   */
  static formatarResultado(resultado: ResultadoDados): string {
    const detalhes = resultado.resultados.length > 1 ? ` (${resultado.resultados.join(', ')})` : '';

    const critico = resultado.critico ? ' CRÍTICO!' : '';

    return `${resultado.tipo}: ${resultado.total}${detalhes}${critico}`;
  }

  /**
   * Testa se passou em uma dificuldade
   */
  static testarDificuldade(resultado: number, dificuldade: number): boolean {
    return resultado >= dificuldade;
  }

  /**
   * Constantes para dificuldades padrão D&D
   */
  static readonly DIFICULDADES = {
    MUITO_FACIL: 5,
    FACIL: 10,
    MEDIO: 15,
    DIFICIL: 20,
    MUITO_DIFICIL: 25,
    QUASE_IMPOSSIVEL: 30,
  } as const;
}
