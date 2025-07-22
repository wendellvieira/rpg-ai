import type { Item_Data, ItemConfig } from './Item_Data';
import { TipoItem, RaridadeItem } from './Item_Data';

/**
 * Classe base para todos os itens do jogo
 * Implementa o padrão Factory para criação de instâncias
 */
export abstract class Item {
  // ✅ OBRIGATÓRIO: Propriedade data tipada
  public data: Item_Data | null = null;

  protected constructor() {}

  // ✅ OBRIGATÓRIO: Static factory methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(_data: Item_Data): Item {
    // Esta é uma classe abstrata, então as subclasses devem implementar
    throw new Error(
      'Item é uma classe abstrata. Use as subclasses específicas (Arma, Armadura, etc.)',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createFromConfig(_config: ItemConfig): Item {
    // Esta é uma classe abstrata, então as subclasses devem implementar
    throw new Error(
      'Item é uma classe abstrata. Use as subclasses específicas (Arma, Armadura, etc.)',
    );
  }

  static createEmpty(): Item {
    throw new Error(
      'Item é uma classe abstrata. Use as subclasses específicas (Arma, Armadura, etc.)',
    );
  }

  // ✅ PERMITIDO: Propriedades calculadas/getters
  get id(): string {
    return this.data?.id || '';
  }

  get nome(): string {
    return this.data?.nome || '';
  }

  get tipo(): TipoItem {
    return this.data?.tipo || TipoItem.OUTRO;
  }

  get descricao(): string {
    return this.data?.descricao || '';
  }

  get valor(): number {
    return this.data?.valor || 0;
  }

  get peso(): number {
    return this.data?.peso || 0;
  }

  get raridade(): RaridadeItem {
    return this.data?.raridade || RaridadeItem.COMUM;
  }

  get magico(): boolean {
    return this.data?.magico || false;
  }

  get propriedades(): Record<string, unknown> {
    return this.data?.propriedades || {};
  }

  get imagemUrl(): string | undefined {
    return this.data?.imagemUrl;
  }

  // ✅ CORRETO: Atualização via substituição do data
  updateData(newData: Partial<Item_Data>): void {
    if (this.data) {
      this.data = { ...this.data, ...newData };
    }
  }

  /**
   * Gera um ID único para o item
   */
  protected static generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se o item pode ser usado
   */
  abstract podeUsar(): boolean;

  /**
   * Usa o item (implementação específica por tipo)
   */
  abstract usar(usuarioId: string, alvoId?: string): { sucesso: boolean; mensagem: string };

  /**
   * Verifica se o item pode ser equipado
   */
  podeEquipar(): boolean {
    return [TipoItem.ARMA, TipoItem.ARMADURA, TipoItem.ESCUDO].includes(this.tipo);
  }

  /**
   * Obtém descrição completa do item
   */
  getDescricaoCompleta(): string {
    let descricao = `**${this.nome}**\n`;
    descricao += `*${this.tipo} ${this.raridade}${this.magico ? ' (mágico)' : ''}*\n\n`;
    descricao += `${this.descricao}\n\n`;
    descricao += `**Valor:** ${this.valor} po | **Peso:** ${this.peso} kg`;

    if (Object.keys(this.propriedades).length > 0) {
      descricao += '\n\n**Propriedades:**\n';
      for (const [prop, valor] of Object.entries(this.propriedades)) {
        descricao += `• ${prop}: ${String(valor)}\n`;
      }
    }

    return descricao;
  }

  /**
   * Verifica se tem uma propriedade específica
   */
  temPropriedade(propriedade: string): boolean {
    return propriedade in this.propriedades;
  }

  /**
   * Obtém valor de uma propriedade
   */
  getPropriedade<T = unknown>(propriedade: string): T | undefined {
    return this.propriedades[propriedade] as T;
  }

  /**
   * Define uma propriedade (apenas para itens mutáveis)
   */
  setPropriedade(propriedade: string, valor: unknown): void {
    this.propriedades[propriedade] = valor;
  }

  /**
   * Cria uma cópia do item
   */
  clonar(): Item {
    // Esta implementação deve ser sobrescrita pelas classes filhas
    throw new Error('Método clonar deve ser implementado pelas classes filhas');
  }

  /**
   * Serializa o item para persistência
   */
  serializar(): Record<string, unknown> {
    return {
      id: this.id,
      nome: this.nome,
      tipo: this.tipo,
      descricao: this.descricao,
      valor: this.valor,
      peso: this.peso,
      raridade: this.raridade,
      magico: this.magico,
      propriedades: this.propriedades,
      className: this.constructor.name,
    };
  }

  /**
   * Calcula o valor modificado pela raridade
   */
  getValorPorRaridade(): number {
    const multiplicadores = {
      [RaridadeItem.COMUM]: 1,
      [RaridadeItem.INCOMUM]: 5,
      [RaridadeItem.RARO]: 25,
      [RaridadeItem.MUITO_RARO]: 125,
      [RaridadeItem.LENDARIO]: 625,
      [RaridadeItem.ARTEFATO]: 3125,
    };

    return this.valor * multiplicadores[this.raridade];
  }

  /**
   * Verifica se o item é consumível
   */
  isConsumivel(): boolean {
    return this.tipo === TipoItem.CONSUMIVEL;
  }

  /**
   * Verifica se o item é arma
   */
  isArma(): boolean {
    return this.tipo === TipoItem.ARMA;
  }

  /**
   * Verifica se o item é armadura
   */
  isArmadura(): boolean {
    return this.tipo === TipoItem.ARMADURA || this.tipo === TipoItem.ESCUDO;
  }

  /**
   * Compara raridade com outro item
   */
  isMaisRaroQue(outroItem: Item): boolean {
    const ordemRaridade = [
      RaridadeItem.COMUM,
      RaridadeItem.INCOMUM,
      RaridadeItem.RARO,
      RaridadeItem.MUITO_RARO,
      RaridadeItem.LENDARIO,
      RaridadeItem.ARTEFATO,
    ];

    return ordemRaridade.indexOf(this.raridade) > ordemRaridade.indexOf(outroItem.raridade);
  }
}
