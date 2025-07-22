import { Item } from './Item';
import type { Armadura_Data, ArmaduraConfig } from './Armadura_Data';
import { TipoArmadura, LocalArmadura } from './Armadura_Data';
import { TipoItem, RaridadeItem } from '../../../types';
import { riid } from '../../../utils/riid';

/**
 * Classe para armaduras e escudos
 * Implementa o padrão Factory para criação de instâncias
 */
export class Armadura extends Item {
  // ✅ OBRIGATÓRIO: Propriedade data tipada
  public override data: Armadura_Data | null = null;

  protected constructor() {
    super();
  }

  // ✅ MÉTODOS ESPECÍFICOS DA ARMADURA
  static createArmadura(data: Armadura_Data): Armadura {
    const armadura = new Armadura();
    armadura.data = data;
    return armadura;
  }

  static createArmaduraFromConfig(config: ArmaduraConfig): Armadura {
    const tipo = config.tipoArmadura === TipoArmadura.ESCUDO ? TipoItem.ESCUDO : TipoItem.ARMADURA;
    
    const data: Armadura_Data = {
      id: config.id || riid(),
      nome: config.nome,
      tipo,
      descricao: config.descricao,
      valor: config.valor,
      peso: config.peso,
      raridade: config.raridade || RaridadeItem.COMUM,
      magico: config.magico || false,
      propriedades: {
        tipoArmadura: config.tipoArmadura,
        local: config.local,
        classeArmadura: config.classeArmadura,
        modMaxDes: config.modMaxDes,
        penalidade: config.penalidade || 0,
        bonusCA: config.bonusCA || 0,
        resistencias: config.resistencias || [],
      },
      ...(config.imagemUrl && { imagemUrl: config.imagemUrl }),
      // Propriedades específicas da armadura
      tipoArmadura: config.tipoArmadura,
      local: config.local,
      classeArmadura: config.classeArmadura,
      modMaxDes: config.modMaxDes || null,
      penalidade: config.penalidade || 0,
      bonusCA: config.bonusCA || 0,
      resistencias: config.resistencias || [],
    };
    
    return Armadura.createArmadura(data);
  }

  static createEmptyArmadura(): Armadura {
    const data: Armadura_Data = {
      id: riid(),
      nome: '',
      tipo: TipoItem.ARMADURA,
      descricao: '',
      valor: 0,
      peso: 0,
      raridade: RaridadeItem.COMUM,
      magico: false,
      propriedades: {},
      tipoArmadura: TipoArmadura.LEVE,
      local: LocalArmadura.CORPO,
      classeArmadura: 10,
      modMaxDes: null,
      penalidade: 0,
      bonusCA: 0,
      resistencias: [],
    };
    
    return Armadura.createArmadura(data);
  }

  // ✅ PERMITIDO: Propriedades calculadas/getters
  get tipoArmadura(): TipoArmadura {
    return this.data?.tipoArmadura || TipoArmadura.LEVE;
  }

  get local(): LocalArmadura {
    return this.data?.local || LocalArmadura.CORPO;
  }

  get classeArmadura(): number {
    return this.data?.classeArmadura || 10;
  }

  get modMaxDes(): number | null {
    return this.data?.modMaxDes || null;
  }

  get penalidade(): number {
    return this.data?.penalidade || 0;
  }

  get bonusCA(): number {
    return this.data?.bonusCA || 0;
  }

  get resistencias(): string[] {
    return this.data?.resistencias || [];
  }

  /**
   * Verifica se a armadura pode ser usada
   */
  podeUsar(): boolean {
    return true; // Armaduras sempre podem ser equipadas
  }

  /**
   * "Usa" a armadura (a equipa)
   */
  usar(): { sucesso: boolean; mensagem: string } {
    return {
      sucesso: true,
      mensagem: `${this.nome} foi equipada.`,
    };
  }

  /**
   * Calcula a CA total considerando bônus de Destreza
   */
  calcularCA(modificadorDestreza: number): number {
    let ca = this.classeArmadura + this.bonusCA;

    if (this.modMaxDes !== null) {
      // Aplica o máximo de bônus Destreza permitido
      ca += Math.min(modificadorDestreza, this.modMaxDes);
    } else if (this.tipoArmadura === TipoArmadura.LEVE) {
      // Armadura leve: aplica todo o bônus de Destreza
      ca += modificadorDestreza;
    }
    // Armadura pesada: não aplica bônus de Destreza

    return ca;
  }

  /**
   * Verifica se tem penalidade em furtividade
   */
  temPenalidadeFurtividade(): boolean {
    return this.penalidade > 0;
  }

  /**
   * Verifica se é armadura leve
   */
  isLeve(): boolean {
    return this.tipoArmadura === TipoArmadura.LEVE;
  }

  /**
   * Verifica se é armadura média
   */
  isMedia(): boolean {
    return this.tipoArmadura === TipoArmadura.MEDIA;
  }

  /**
   * Verifica se é armadura pesada
   */
  isPesada(): boolean {
    return this.tipoArmadura === TipoArmadura.PESADA;
  }

  /**
   * Verifica se é escudo
   */
  isEscudo(): boolean {
    return this.tipoArmadura === TipoArmadura.ESCUDO;
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
    return Armadura.createArmaduraFromConfig({
      nome: this.nome,
      descricao: this.descricao,
      valor: this.valor,
      peso: this.peso,
      raridade: this.raridade,
      magico: this.magico,
      tipoArmadura: this.tipoArmadura,
      local: this.local,
      classeArmadura: this.classeArmadura,
      modMaxDes: this.modMaxDes,
      penalidade: this.penalidade,
      bonusCA: this.bonusCA,
      resistencias: [...this.resistencias],
    });
  }

  /**
   * Obtém descrição completa da armadura
   */
  override getDescricaoCompleta(): string {
    let descricao = super.getDescricaoCompleta();

    descricao += `\n\n**Estatísticas de Proteção:**\n`;
    descricao += `• CA: ${this.classeArmadura}\n`;
    descricao += `• Tipo: ${this.tipoArmadura}\n`;
    descricao += `• Local: ${this.local}\n`;

    if (this.modMaxDes !== null) {
      descricao += `• Máx. Bônus Destreza: +${this.modMaxDes}\n`;
    }

    if (this.penalidade > 0) {
      descricao += `• Penalidade Furtividade: -${this.penalidade}\n`;
    }

    if (this.bonusCA > 0) {
      descricao += `• Bônus CA Mágico: +${this.bonusCA}\n`;
    }

    if (this.resistencias.length > 0) {
      descricao += `• Resistências: ${this.resistencias.join(', ')}\n`;
    }

    return descricao;
  }

  // Factory methods para armaduras comuns
  static criarArmaduraCouro(): Armadura {
    return Armadura.createArmaduraFromConfig({
      nome: 'Armadura de Couro',
      descricao: 'Armadura leve feita de couro endurecido.',
      valor: 10,
      peso: 4.5,
      tipoArmadura: TipoArmadura.LEVE,
      local: LocalArmadura.CORPO,
      classeArmadura: 11,
      modMaxDes: null, // Sem limite de Destreza
      penalidade: 0,
    });
  }

  static criarCotaMalha(): Armadura {
    return Armadura.createArmaduraFromConfig({
      nome: 'Cota de Malha',
      descricao: 'Armadura média feita de anéis de metal entrelaçados.',
      valor: 50,
      peso: 9,
      tipoArmadura: TipoArmadura.MEDIA,
      local: LocalArmadura.CORPO,
      classeArmadura: 13,
      modMaxDes: 2,
      penalidade: 0,
    });
  }

  static criarArmaduraPlacas(): Armadura {
    return Armadura.createArmaduraFromConfig({
      nome: 'Armadura de Placas',
      descricao: 'Armadura pesada de metal moldado cobrindo todo o corpo.',
      valor: 1500,
      peso: 30,
      tipoArmadura: TipoArmadura.PESADA,
      local: LocalArmadura.CORPO,
      classeArmadura: 18,
      modMaxDes: 0,
      penalidade: 1,
    });
  }

  static criarEscudo(): Armadura {
    return Armadura.createArmaduraFromConfig({
      nome: 'Escudo',
      descricao: 'Um escudo de madeira reforçado com metal.',
      valor: 10,
      peso: 2.7,
      tipoArmadura: TipoArmadura.ESCUDO,
      local: LocalArmadura.ESCUDO,
      classeArmadura: 2,
      modMaxDes: null,
      penalidade: 0,
    });
  }
}
