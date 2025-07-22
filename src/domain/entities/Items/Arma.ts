import { Item } from './Item';
import type { Arma_Data, ArmaConfig } from './Arma_Data';
import { CategoriaArma, TipoDano, PropriedadeArma } from './Arma_Data';
import { TipoItem, RaridadeItem } from '../../../types';
import type { ResultadoDados } from '../../../types';
import { riid } from '../../../utils/riid';
import { Dados } from '../../../classes/Dados';

// Re-export das enums para uso externo
export { CategoriaArma, TipoDano, PropriedadeArma } from './Arma_Data';

/**
 * Classe para armas do jogo
 * Implementa o padrão Factory para criação de instâncias
 */
export class Arma extends Item {
  // ✅ OBRIGATÓRIO: Propriedade data tipada
  public override data: Arma_Data | null = null;

  protected constructor() {
    super();
  }

  // ✅ MÉTODOS ESPECÍFICOS DA ARMA (não override)
  static createArma(data: Arma_Data): Arma {
    const arma = new Arma();
    arma.data = data;
    return arma;
  }

  static createArmaFromConfig(config: ArmaConfig): Arma {
    const data: Arma_Data = {
      id: config.id || riid(),
      nome: config.nome,
      tipo: TipoItem.ARMA,
      descricao: config.descricao,
      valor: config.valor,
      peso: config.peso,
      raridade: config.raridade || RaridadeItem.COMUM,
      magico: config.magico || false,
      propriedades: {
        categoria: config.categoria,
        dano: config.dano,
        tipoDano: config.tipoDano,
        alcance: config.alcance,
        propriedadesArma: config.propriedades,
        critico: config.critico || 2,
        bonusAtaque: config.bonusAtaque || 0,
        bonusDano: config.bonusDano || 0,
      },
      ...(config.imagemUrl && { imagemUrl: config.imagemUrl }),
      // Propriedades específicas da arma
      categoria: config.categoria,
      dano: config.dano,
      tipoDano: config.tipoDano,
      alcance: config.alcance,
      propriedadesArma: config.propriedades,
      critico: config.critico || 2,
      bonusAtaque: config.bonusAtaque || 0,
      bonusDano: config.bonusDano || 0,
    };

    return Arma.createArma(data);
  }

  static createEmptyArma(): Arma {
    const data: Arma_Data = {
      id: riid(),
      nome: '',
      tipo: TipoItem.ARMA,
      descricao: '',
      valor: 0,
      peso: 0,
      raridade: RaridadeItem.COMUM,
      magico: false,
      propriedades: {},
      categoria: CategoriaArma.CORPO_A_CORPO,
      dano: '1d4',
      tipoDano: TipoDano.CONTUNDENTE,
      alcance: 1,
      propriedadesArma: [],
      critico: 2,
      bonusAtaque: 0,
      bonusDano: 0,
    };

    return Arma.createArma(data);
  }

  // ✅ PERMITIDO: Propriedades calculadas/getters
  get categoria(): CategoriaArma {
    return this.data?.categoria || CategoriaArma.CORPO_A_CORPO;
  }

  get dano(): string {
    return this.data?.dano || '1d4';
  }

  get tipoDano(): TipoDano {
    return this.data?.tipoDano || TipoDano.CONTUNDENTE;
  }

  get alcance(): number {
    return this.data?.alcance || 1;
  }

  get propriedadesArma(): PropriedadeArma[] {
    return this.data?.propriedadesArma || [];
  }

  get critico(): number {
    return this.data?.critico || 2;
  }

  get bonusAtaque(): number {
    return this.data?.bonusAtaque || 0;
  }

  get bonusDano(): number {
    return this.data?.bonusDano || 0;
  }

  /**
   * Verifica se a arma pode ser usada
   */
  podeUsar(): boolean {
    return true; // Armas sempre podem ser usadas (equipadas)
  }

  /**
   * "Usa" a arma (na verdade, a equipa)
   */
  override usar(): { sucesso: boolean; mensagem: string } {
    return {
      sucesso: true,
      mensagem: `${this.nome} foi equipada.`,
    };
  }

  /**
   * Calcula o dano da arma
   */
  calcularDano(modificadorAtributo: number = 0): ResultadoDados {
    const resultado = Dados.rolar(this.dano);
    resultado.total += modificadorAtributo + this.bonusDano;
    resultado.modificador += this.bonusDano;

    return resultado;
  }

  /**
   * Calcula dano crítico
   */
  calcularDanoCritico(modificadorAtributo: number = 0): ResultadoDados {
    // Crítico = rola o dano duas vezes + modificadores
    const dano1 = Dados.rolar(this.dano);
    const dano2 = Dados.rolar(this.dano);

    const total = dano1.total + dano2.total + modificadorAtributo + this.bonusDano;

    return {
      tipo: `${this.dano} x2 (crítico)`,
      resultados: [...dano1.resultados, ...dano2.resultados],
      total,
      modificador: modificadorAtributo + this.bonusDano,
      critico: true,
    };
  }

  /**
   * Verifica se tem uma propriedade específica
   */
  temPropriedadeArma(propriedade: PropriedadeArma): boolean {
    return this.propriedadesArma.includes(propriedade);
  }

  /**
   * Verifica se é arma leve (permite dual wield)
   */
  isLeve(): boolean {
    return this.temPropriedadeArma(PropriedadeArma.LEVE);
  }

  /**
   * Verifica se é arma pesada (requer duas mãos)
   */
  isPesada(): boolean {
    return this.temPropriedadeArma(PropriedadeArma.PESADA);
  }

  /**
   * Verifica se é versátil (uma ou duas mãos)
   */
  isVersatil(): boolean {
    return this.temPropriedadeArma(PropriedadeArma.VERSATIL);
  }

  /**
   * Verifica se pode ser arremessada
   */
  podeArremessar(): boolean {
    return this.temPropriedadeArma(PropriedadeArma.ARREMESSO);
  }

  /**
   * Obtém dano versátil (duas mãos)
   */
  getDanoVersatil(): string {
    if (!this.isVersatil()) {
      return this.dano;
    }

    // Aumenta o dado em um tamanho (d6->d8, d8->d10, etc.)
    const match = this.dano.match(/(\d*)d(\d+)(.*)$/);
    if (!match) return this.dano;

    const quantidade = match[1] || '1';
    const lados = parseInt(match[2] || '6');
    const modificador = match[3] || '';

    const novosLados =
      lados === 4 ? 6 : lados === 6 ? 8 : lados === 8 ? 10 : lados === 10 ? 12 : lados;

    return `${quantidade}d${novosLados}${modificador}`;
  }

  /**
   * Cria uma cópia da arma
   */
  override clonar(): Arma {
    return Arma.createArmaFromConfig({
      nome: this.nome,
      descricao: this.descricao,
      valor: this.valor,
      peso: this.peso,
      raridade: this.raridade,
      magico: this.magico,
      categoria: this.categoria,
      dano: this.dano,
      tipoDano: this.tipoDano,
      alcance: this.alcance,
      propriedades: [...this.propriedadesArma],
      critico: this.critico,
      bonusAtaque: this.bonusAtaque,
      bonusDano: this.bonusDano,
    });
  }

  /**
   * Obtém descrição completa da arma
   */
  override getDescricaoCompleta(): string {
    let descricao = super.getDescricaoCompleta();

    descricao += `\n\n**Estatísticas de Combate:**\n`;
    descricao += `• Dano: ${this.dano} ${this.tipoDano}\n`;
    descricao += `• Alcance: ${this.alcance}m\n`;
    descricao += `• Crítico: x${this.critico}\n`;

    if (this.bonusAtaque > 0) {
      descricao += `• Bônus de Ataque: +${this.bonusAtaque}\n`;
    }

    if (this.bonusDano > 0) {
      descricao += `• Bônus de Dano: +${this.bonusDano}\n`;
    }

    if (this.propriedadesArma.length > 0) {
      descricao += `• Propriedades: ${this.propriedadesArma.join(', ')}\n`;
    }

    if (this.isVersatil()) {
      descricao += `• Dano Versátil: ${this.getDanoVersatil()}\n`;
    }

    return descricao;
  }

  // Factory methods para armas comuns
  static criarEspadaLonga(): Arma {
    return Arma.createArmaFromConfig({
      nome: 'Espada Longa',
      descricao: 'Uma espada de lâmina reta e comprida, versátil em combate.',
      valor: 15,
      peso: 1.4,
      categoria: CategoriaArma.CORPO_A_CORPO,
      dano: '1d8',
      tipoDano: TipoDano.CORTANTE,
      alcance: 1.5,
      propriedades: [PropriedadeArma.VERSATIL],
      critico: 2,
    });
  }

  static criarArcoLongo(): Arma {
    return Arma.createArmaFromConfig({
      nome: 'Arco Longo',
      descricao: 'Um arco alto e poderoso para ataques à distância.',
      valor: 50,
      peso: 0.9,
      categoria: CategoriaArma.DISTANCIA,
      dano: '1d8',
      tipoDano: TipoDano.PERFURANTE,
      alcance: 150,
      propriedades: [PropriedadeArma.PESADA, PropriedadeArma.MUNICAO],
      critico: 2,
    });
  }

  static criarAdaga(): Arma {
    return Arma.createArmaFromConfig({
      nome: 'Adaga',
      descricao: 'Uma lâmina curta e afiada, ideal para ataques rápidos.',
      valor: 2,
      peso: 0.5,
      categoria: CategoriaArma.CORPO_A_CORPO,
      dano: '1d4',
      tipoDano: TipoDano.PERFURANTE,
      alcance: 1.5,
      propriedades: [PropriedadeArma.LEVE, PropriedadeArma.SUTIL, PropriedadeArma.ARREMESSO],
      critico: 2,
    });
  }
}
