import { Item } from './Item';
import { TipoItem, type RaridadeItem } from '../types';

export enum CategoriaArmadura {
  LEVE = 'leve',
  MEDIA = 'media',
  PESADA = 'pesada',
  ESCUDO = 'escudo',
}

interface DadosArmadura {
  id?: string;
  nome: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  categoria: CategoriaArmadura;
  bonusCA: number;
  maxDestreza?: number; // Máximo de bônus Destreza aplicável
  penalidade?: number; // Penalidade em testes de furtividade
  forcaMinima?: number; // Força mínima para usar sem penalidades
  resistencias?: string[]; // Resistências a tipos de dano
}

/**
 * Classe para armaduras e escudos
 */
export class Armadura extends Item {
  public readonly categoria: CategoriaArmadura;
  public readonly bonusCA: number;
  public readonly maxDestreza: number | undefined;
  public readonly penalidade: number | undefined;
  public readonly forcaMinima: number | undefined;
  public readonly resistencias: string[];

  constructor(dados: DadosArmadura) {
    const tipo = dados.categoria === CategoriaArmadura.ESCUDO ? TipoItem.ESCUDO : TipoItem.ARMADURA;

    super({
      ...dados,
      tipo,
      propriedades: {
        categoria: dados.categoria,
        bonusCA: dados.bonusCA,
        maxDestreza: dados.maxDestreza,
        penalidade: dados.penalidade,
        forcaMinima: dados.forcaMinima,
        resistencias: dados.resistencias || [],
      },
    });

    this.categoria = dados.categoria;
    this.bonusCA = dados.bonusCA;
    this.maxDestreza = dados.maxDestreza;
    this.penalidade = dados.penalidade;
    this.forcaMinima = dados.forcaMinima;
    this.resistencias = dados.resistencias || [];
  }

  /**
   * Verifica se a armadura pode ser usada
   */
  override podeUsar(): boolean {
    return true; // Armaduras sempre podem ser equipadas
  }

  /**
   * "Usa" a armadura (a equipa)
   */
  override usar(): { sucesso: boolean; mensagem: string } {
    return {
      sucesso: true,
      mensagem: `${this.nome} foi equipada.`,
    };
  }

  /**
   * Calcula a CA total considerando bônus de Destreza
   */
  calcularCA(modificadorDestreza: number): number {
    let ca = this.bonusCA;

    if (this.maxDestreza !== undefined) {
      // Aplica o máximo de bônus Destreza permitido
      ca += Math.min(modificadorDestreza, this.maxDestreza);
    } else if (this.categoria === CategoriaArmadura.LEVE) {
      // Armadura leve: aplica todo o bônus de Destreza
      ca += modificadorDestreza;
    }
    // Armadura pesada: não aplica bônus de Destreza (já incluído no bonusCA)

    return ca;
  }

  /**
   * Verifica se o personagem tem força suficiente para usar sem penalidades
   */
  podeUsarSemPenalidade(forca: number): boolean {
    return !this.forcaMinima || forca >= this.forcaMinima;
  }

  /**
   * Verifica se tem penalidade em furtividade
   */
  temPenalidadeFurtividade(): boolean {
    return this.penalidade !== undefined && this.penalidade > 0;
  }

  /**
   * Verifica se é armadura leve
   */
  isLeve(): boolean {
    return this.categoria === CategoriaArmadura.LEVE;
  }

  /**
   * Verifica se é armadura média
   */
  isMedia(): boolean {
    return this.categoria === CategoriaArmadura.MEDIA;
  }

  /**
   * Verifica se é armadura pesada
   */
  isPesada(): boolean {
    return this.categoria === CategoriaArmadura.PESADA;
  }

  /**
   * Verifica se é escudo
   */
  isEscudo(): boolean {
    return this.categoria === CategoriaArmadura.ESCUDO;
  }

  /**
   * Verifica se tem resistência a um tipo de dano
   */
  temResistencia(tipoDano: string): boolean {
    return this.resistencias.includes(tipoDano);
  }

  /**
   * Cria uma cópia da armadura
   */
  override clonar(): Armadura {
    const dados: DadosArmadura = {
      nome: this.nome,
      descricao: this.descricao,
      valor: this.valor,
      peso: this.peso,
      raridade: this.raridade,
      magico: this.magico,
      categoria: this.categoria,
      bonusCA: this.bonusCA,
      resistencias: [...this.resistencias],
    };

    if (this.maxDestreza !== undefined) {
      dados.maxDestreza = this.maxDestreza;
    }

    if (this.penalidade !== undefined) {
      dados.penalidade = this.penalidade;
    }

    if (this.forcaMinima !== undefined) {
      dados.forcaMinima = this.forcaMinima;
    }

    return new Armadura(dados);
  }

  /**
   * Obtém descrição completa da armadura
   */
  override getDescricaoCompleta(): string {
    let descricao = super.getDescricaoCompleta();

    descricao += `\n\n**Estatísticas de Proteção:**\n`;
    descricao += `• CA Base: ${this.bonusCA}\n`;
    descricao += `• Categoria: ${this.categoria}\n`;

    if (this.maxDestreza !== undefined) {
      descricao += `• Máx. Bônus Destreza: +${this.maxDestreza}\n`;
    }

    if (this.penalidade) {
      descricao += `• Penalidade Furtividade: -${this.penalidade}\n`;
    }

    if (this.forcaMinima) {
      descricao += `• Força Mínima: ${this.forcaMinima}\n`;
    }

    if (this.resistencias.length > 0) {
      descricao += `• Resistências: ${this.resistencias.join(', ')}\n`;
    }

    return descricao;
  }

  // Factory methods para armaduras comuns
  static criarCouroSimples(): Armadura {
    return new Armadura({
      nome: 'Armadura de Couro',
      descricao: 'Armadura flexível feita de couro endurecido.',
      valor: 10,
      peso: 4.5,
      categoria: CategoriaArmadura.LEVE,
      bonusCA: 11,
    });
  }

  static criarCottaDeMalha(): Armadura {
    return new Armadura({
      nome: 'Cota de Malha',
      descricao: 'Armadura feita de anéis de metal entrelaçados.',
      valor: 75,
      peso: 9,
      categoria: CategoriaArmadura.MEDIA,
      bonusCA: 13,
      maxDestreza: 2,
    });
  }

  static criarPlacas(): Armadura {
    return new Armadura({
      nome: 'Armadura de Placas',
      descricao: 'Armadura completa de placas de metal articuladas.',
      valor: 1500,
      peso: 29.5,
      categoria: CategoriaArmadura.PESADA,
      bonusCA: 18,
      penalidade: 1,
      forcaMinima: 15,
    });
  }

  static criarEscudo(): Armadura {
    return new Armadura({
      nome: 'Escudo',
      descricao: 'Escudo de madeira reforçado com metal.',
      valor: 10,
      peso: 2.7,
      categoria: CategoriaArmadura.ESCUDO,
      bonusCA: 2,
    });
  }

  static criarEscudoTorre(): Armadura {
    return new Armadura({
      nome: 'Escudo Torre',
      descricao: 'Escudo grande que oferece cobertura quase completa.',
      valor: 50,
      peso: 13.6,
      categoria: CategoriaArmadura.ESCUDO,
      bonusCA: 3,
      penalidade: 2,
      forcaMinima: 13,
    });
  }
}
