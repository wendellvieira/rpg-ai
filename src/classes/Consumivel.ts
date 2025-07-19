import { Item } from './Item';
import { TipoItem, type RaridadeItem } from '../types';

export enum TipoConsumivel {
  POCAO = 'pocao',
  PERGAMINHO = 'pergaminho',
  ALIMENTO = 'alimento',
  MUNICAO = 'municao',
  OUTRO = 'outro',
}

interface DadosConsumivel {
  id?: string;
  nome: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  imagemUrl?: string;
  tipoConsumivel: TipoConsumivel;
  efeito: string;
  duracao?: string;
  cura?: number;
  usos?: number;
}

/**
 * Classe para itens consumíveis
 */
export class Consumivel extends Item {
  public readonly tipoConsumivel: TipoConsumivel;
  public readonly efeito: string;
  public readonly duracao: string | undefined;
  public readonly cura: number | undefined;
  public readonly usos: number | undefined;

  constructor(dados: DadosConsumivel) {
    super({
      ...dados,
      tipo: TipoItem.CONSUMIVEL,
      propriedades: {
        tipoConsumivel: dados.tipoConsumivel,
        efeito: dados.efeito,
        duracao: dados.duracao,
        cura: dados.cura,
        usos: dados.usos || 1,
      },
    });

    this.tipoConsumivel = dados.tipoConsumivel;
    this.efeito = dados.efeito;
    this.duracao = dados.duracao;
    this.cura = dados.cura;
    this.usos = dados.usos || 1;
  }

  /**
   * Verifica se o item pode ser usado
   */
  podeUsar(): boolean {
    return this.usos !== undefined && this.usos > 0;
  }

  /**
   * Usa o item consumível
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  usar(usuarioId: string, alvoId?: string): { sucesso: boolean; mensagem: string } {
    if (!this.podeUsar()) {
      return {
        sucesso: false,
        mensagem: 'Este item não pode mais ser usado.',
      };
    }

    let mensagem = `${this.nome} foi usado`;
    if (this.cura) {
      mensagem += ` e restaurou ${this.cura} pontos de vida`;
    }
    mensagem += `.`;

    if (this.efeito) {
      mensagem += ` Efeito: ${this.efeito}`;
    }

    if (this.duracao) {
      mensagem += ` (Duração: ${this.duracao})`;
    }

    return {
      sucesso: true,
      mensagem,
    };
  }

  /**
   * Obtém descrição completa do item
   */
  override getDescricaoCompleta(): string {
    let descricao = super.getDescricaoCompleta();

    descricao += `\n\n**Tipo:** ${this.tipoConsumivel}`;

    if (this.efeito) {
      descricao += `\n**Efeito:** ${this.efeito}`;
    }

    if (this.cura) {
      descricao += `\n**Cura:** ${this.cura} PV`;
    }

    if (this.duracao) {
      descricao += `\n**Duração:** ${this.duracao}`;
    }

    if (this.usos !== undefined) {
      descricao += `\n**Usos:** ${this.usos}`;
    }

    return descricao;
  }
}
