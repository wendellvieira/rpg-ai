import { Item } from './Item';
import { TipoItem, type RaridadeItem, type ResultadoDados } from '../types';
import { Dados } from './Dados';

export enum CategoriaArma {
  CORPO_A_CORPO = 'corpo-a-corpo',
  DISTANCIA = 'distancia',
  ARREMESSO = 'arremesso',
}

export enum TipoDano {
  CORTANTE = 'cortante',
  PERFURANTE = 'perfurante',
  CONTUNDENTE = 'contundente',
  ACIDO = 'acido',
  FRIO = 'frio',
  FOGO = 'fogo',
  FORCA = 'forca',
  RELAMPAGO = 'relampago',
  NECROTICO = 'necrotico',
  VENENO = 'veneno',
  PSIQUICO = 'psiquico',
  RADIANTE = 'radiante',
  TROVAO = 'trovao',
}

export enum PropriedadeArma {
  LEVE = 'leve',
  PESADA = 'pesada',
  VERSATIL = 'versatil',
  SUTIL = 'sutil',
  ALCANCE = 'alcance',
  ARREMESSO = 'arremesso',
  MUNICAO = 'municao',
  RECARGA = 'recarga',
  ESPECIAL = 'especial',
}

interface DadosArma {
  id?: string;
  nome: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  categoria: CategoriaArma;
  dano: string; // Ex: "1d8", "2d6+1"
  tipoDano: TipoDano;
  alcance: number; // Em metros
  propriedades: PropriedadeArma[];
  critico: number; // Multiplicador crítico (padrão 2)
  bonusAtaque?: number; // Para armas mágicas
  bonusDano?: number; // Para armas mágicas
}

/**
 * Classe para armas do jogo
 */
export class Arma extends Item {
  public readonly categoria: CategoriaArma;
  public readonly dano: string;
  public readonly tipoDano: TipoDano;
  public readonly alcance: number;
  public readonly propriedadesArma: PropriedadeArma[];
  public readonly critico: number;
  public readonly bonusAtaque: number;
  public readonly bonusDano: number;

  constructor(dados: DadosArma) {
    super({
      ...dados,
      tipo: TipoItem.ARMA,
      propriedades: {
        categoria: dados.categoria,
        dano: dados.dano,
        tipoDano: dados.tipoDano,
        alcance: dados.alcance,
        propriedadesArma: dados.propriedades,
        critico: dados.critico,
        bonusAtaque: dados.bonusAtaque || 0,
        bonusDano: dados.bonusDano || 0,
      },
    });

    this.categoria = dados.categoria;
    this.dano = dados.dano;
    this.tipoDano = dados.tipoDano;
    this.alcance = dados.alcance;
    this.propriedadesArma = dados.propriedades;
    this.critico = dados.critico || 2;
    this.bonusAtaque = dados.bonusAtaque || 0;
    this.bonusDano = dados.bonusDano || 0;
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
    return new Arma({
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
    return new Arma({
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
    return new Arma({
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
    return new Arma({
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
