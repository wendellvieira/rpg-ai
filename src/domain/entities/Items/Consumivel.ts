import { Item } from './Item';
import type { Consumivel_Data, ConsumivelConfig } from './Consumivel_Data';
import { TipoConsumivel, EfeitoConsumivel } from './Consumivel_Data';
import { TipoItem, RaridadeItem } from '../../../types';
import { riid } from '../../../utils/riid';

/**
 * Classe para itens consumíveis
 * Implementa o padrão Factory para criação de instâncias
 */
export class Consumivel extends Item {
  // ✅ OBRIGATÓRIO: Propriedade data tipada
  public override data: Consumivel_Data | null = null;

  protected constructor() {
    super();
  }

  // ✅ MÉTODOS ESPECÍFICOS DO CONSUMIVEL
  static createConsumivel(data: Consumivel_Data): Consumivel {
    const consumivel = new Consumivel();
    consumivel.data = data;
    return consumivel;
  }

  static createConsumivelFromConfig(config: ConsumivelConfig): Consumivel {
    const data: Consumivel_Data = {
      id: config.id || riid(),
      nome: config.nome,
      tipo: TipoItem.CONSUMIVEL,
      descricao: config.descricao,
      valor: config.valor,
      peso: config.peso,
      raridade: config.raridade || RaridadeItem.COMUM,
      magico: config.magico || false,
      propriedades: {
        tipoConsumivel: config.tipoConsumivel,
        efeito: config.efeito,
        potencia: config.potencia,
        duracao: config.duracao || 0,
        usos: config.usos || 1,
        usosMaximos: config.usosMaximos || 1,
        tempoRecarga: config.tempoRecarga,
      },
      ...(config.imagemUrl && { imagemUrl: config.imagemUrl }),
      // Propriedades específicas do consumível
      tipoConsumivel: config.tipoConsumivel,
      efeito: config.efeito,
      potencia: config.potencia,
      duracao: config.duracao || 0,
      usos: config.usos || 1,
      usosMaximos: config.usosMaximos || 1,
      ...(config.tempoRecarga && { tempoRecarga: config.tempoRecarga }),
    };

    return Consumivel.createConsumivel(data);
  }

  static createEmptyConsumivel(): Consumivel {
    const data: Consumivel_Data = {
      id: riid(),
      nome: '',
      tipo: TipoItem.CONSUMIVEL,
      descricao: '',
      valor: 0,
      peso: 0,
      raridade: RaridadeItem.COMUM,
      magico: false,
      propriedades: {},
      tipoConsumivel: TipoConsumivel.OUTRO,
      efeito: EfeitoConsumivel.UTILIDADE,
      potencia: 0,
      duracao: 0,
      usos: 1,
      usosMaximos: 1,
    };

    return Consumivel.createConsumivel(data);
  }

  // ✅ PERMITIDO: Propriedades calculadas/getters
  get tipoConsumivel(): TipoConsumivel {
    return this.data?.tipoConsumivel || TipoConsumivel.OUTRO;
  }

  get efeito(): EfeitoConsumivel {
    return this.data?.efeito || EfeitoConsumivel.UTILIDADE;
  }

  get potencia(): number {
    return this.data?.potencia || 0;
  }

  get duracao(): number {
    return this.data?.duracao || 0;
  }

  get usos(): number {
    return this.data?.usos || 0;
  }

  get usosMaximos(): number {
    return this.data?.usosMaximos || 1;
  }

  get tempoRecarga(): number | undefined {
    return this.data?.tempoRecarga;
  }

  /**
   * Verifica se o item pode ser usado
   */
  podeUsar(): boolean {
    return this.usos > 0;
  }

  /**
   * Usa o item consumível
   */
  usar(usuarioId: string, alvoId?: string): { sucesso: boolean; mensagem: string } {
    if (!this.podeUsar()) {
      return {
        sucesso: false,
        mensagem: `${this.nome} não pode ser usado (sem usos restantes).`,
      };
    }

    // Reduzir usos se aplicável
    if (this.data) {
      this.data.usos--;
    }

    let mensagem = `${usuarioId} usou ${this.nome}`;
    if (alvoId) {
      mensagem += ` em ${alvoId}`;
    }

    // Adicionar informações do efeito
    switch (this.efeito) {
      case EfeitoConsumivel.CURA:
        mensagem += ` (cura ${this.potencia} pontos de vida)`;
        break;
      case EfeitoConsumivel.MANA:
        mensagem += ` (restaura ${this.potencia} pontos de mana)`;
        break;
      case EfeitoConsumivel.BUFF:
        mensagem += ` (aplica efeito positivo por ${this.duracao} turnos)`;
        break;
      case EfeitoConsumivel.DEBUFF:
        mensagem += ` (aplica efeito negativo por ${this.duracao} turnos)`;
        break;
      case EfeitoConsumivel.DANO:
        mensagem += ` (causa ${this.potencia} de dano)`;
        break;
    }

    return {
      sucesso: true,
      mensagem: mensagem + '.',
    };
  }

  /**
   * Verifica se o item ainda tem usos
   */
  temUsos(): boolean {
    return this.usos > 0;
  }

  /**
   * Restaura os usos do item
   */
  restaurarUsos(): void {
    if (this.data) {
      this.data.usos = this.usosMaximos;
    }
  }

  /**
   * Cria uma cópia do consumível
   */
  override clonar(): Consumivel {
    const config: ConsumivelConfig = {
      nome: this.nome,
      descricao: this.descricao,
      valor: this.valor,
      peso: this.peso,
      raridade: this.raridade,
      magico: this.magico,
      tipoConsumivel: this.tipoConsumivel,
      efeito: this.efeito,
      potencia: this.potencia,
      duracao: this.duracao,
      usos: this.usos,
      usosMaximos: this.usosMaximos,
    };

    if (this.tempoRecarga !== undefined) {
      config.tempoRecarga = this.tempoRecarga;
    }

    return Consumivel.createConsumivelFromConfig(config);
  }

  /**
   * Obtém descrição completa do consumível
   */
  override getDescricaoCompleta(): string {
    let descricao = super.getDescricaoCompleta();

    descricao += `\n\n**Informações de Uso:**\n`;
    descricao += `• Tipo: ${this.tipoConsumivel}\n`;
    descricao += `• Efeito: ${this.efeito}\n`;
    descricao += `• Potência: ${this.potencia}\n`;

    if (this.duracao > 0) {
      descricao += `• Duração: ${this.duracao} turnos\n`;
    }

    descricao += `• Usos: ${this.usos}/${this.usosMaximos}\n`;

    if (this.tempoRecarga) {
      descricao += `• Recarga: ${this.tempoRecarga}s\n`;
    }

    return descricao;
  }

  // Factory methods para consumíveis comuns
  static criarPocaoCura(): Consumivel {
    return Consumivel.createConsumivelFromConfig({
      nome: 'Poção de Cura',
      descricao: 'Uma poção vermelha que restaura pontos de vida.',
      valor: 50,
      peso: 0.2,
      tipoConsumivel: TipoConsumivel.POCAO,
      efeito: EfeitoConsumivel.CURA,
      potencia: 25,
      duracao: 0,
      usos: 1,
      usosMaximos: 1,
    });
  }

  static criarPocaoMana(): Consumivel {
    return Consumivel.createConsumivelFromConfig({
      nome: 'Poção de Mana',
      descricao: 'Uma poção azul que restaura pontos de mana.',
      valor: 60,
      peso: 0.2,
      tipoConsumivel: TipoConsumivel.POCAO,
      efeito: EfeitoConsumivel.MANA,
      potencia: 30,
      duracao: 0,
      usos: 1,
      usosMaximos: 1,
    });
  }

  static criarRacaoViagem(): Consumivel {
    return Consumivel.createConsumivelFromConfig({
      nome: 'Ração de Viagem',
      descricao: 'Alimento nutritivo que sustenta por um dia.',
      valor: 2,
      peso: 0.9,
      tipoConsumivel: TipoConsumivel.ALIMENTO,
      efeito: EfeitoConsumivel.BUFF,
      potencia: 1,
      duracao: 24, // 24 turnos (1 dia)
      usos: 1,
      usosMaximos: 1,
    });
  }
}
