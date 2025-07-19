import type { Item } from './Item';

/**
 * Gerencia o inventário de um personagem
 */
export class Inventario {
  private itens: Map<string, number>;
  private readonly capacidadeMaxima: number;

  constructor(capacidadeMaxima: number = 50) {
    this.itens = new Map();
    this.capacidadeMaxima = capacidadeMaxima;
  }

  /**
   * Adiciona item ao inventário
   */
  adicionarItem(item: Item, quantidade: number = 1): boolean {
    if (quantidade <= 0) return false;

    // Verifica capacidade
    if (this.getPesoTotal() + item.peso * quantidade > this.getCapacidadeMaxima()) {
      return false;
    }

    const quantidadeAtual = this.itens.get(item.id) ?? 0;
    this.itens.set(item.id, quantidadeAtual + quantidade);
    return true;
  }

  /**
   * Remove item do inventário
   */
  removerItem(itemId: string, quantidade: number = 1): boolean {
    const quantidadeAtual = this.itens.get(itemId) ?? 0;

    if (quantidadeAtual < quantidade) {
      return false;
    }

    if (quantidadeAtual === quantidade) {
      this.itens.delete(itemId);
    } else {
      this.itens.set(itemId, quantidadeAtual - quantidade);
    }

    return true;
  }

  /**
   * Verifica se tem item suficiente
   */
  temItem(itemId: string, quantidade: number = 1): boolean {
    return (this.itens.get(itemId) ?? 0) >= quantidade;
  }

  /**
   * Obtém quantidade de um item
   */
  getQuantidade(itemId: string): number {
    return this.itens.get(itemId) ?? 0;
  }

  /**
   * Lista todos os itens
   */
  listarItens(): Array<{ itemId: string; quantidade: number }> {
    return Array.from(this.itens.entries()).map(([itemId, quantidade]) => ({
      itemId,
      quantidade,
    }));
  }

  /**
   * Calcula peso total atual
   */
  getPesoTotal(): number {
    // Para calcular o peso total, precisaríamos ter acesso aos objetos Item
    // Por agora, retorna um valor calculado baseado na quantidade
    // Em uma implementação real, isso seria feito pelo sistema que gerencia os itens
    return 0;
  }

  /**
   * Obtém capacidade máxima
   */
  getCapacidadeMaxima(): number {
    return this.capacidadeMaxima;
  }

  /**
   * Verifica se o inventário está cheio
   */
  estaCheio(): boolean {
    return this.getPesoTotal() >= this.capacidadeMaxima;
  }

  /**
   * Limpa o inventário
   */
  limpar(): void {
    this.itens.clear();
  }

  /**
   * Conta total de tipos diferentes de itens
   */
  getTotalTipos(): number {
    return this.itens.size;
  }

  /**
   * Conta total de itens (considerando quantidades)
   */
  getTotalItens(): number {
    return Array.from(this.itens.values()).reduce((total, quantidade) => total + quantidade, 0);
  }

  /**
   * Transfere item para outro inventário
   */
  transferirPara(outroInventario: Inventario, itemId: string, quantidade: number = 1): boolean {
    if (!this.temItem(itemId, quantidade)) {
      return false;
    }

    // Primeiro tenta adicionar no destino
    // Para isso precisaríamos do objeto Item, mas por agora vamos simular
    if (!outroInventario.itens.has(itemId)) {
      outroInventario.itens.set(itemId, 0);
    }

    const quantidadeDestino = outroInventario.itens.get(itemId) ?? 0;
    outroInventario.itens.set(itemId, quantidadeDestino + quantidade);

    // Remove do inventário atual
    return this.removerItem(itemId, quantidade);
  }

  /**
   * Organiza inventário removendo entradas vazias
   */
  organizar(): void {
    for (const [itemId, quantidade] of this.itens.entries()) {
      if (quantidade <= 0) {
        this.itens.delete(itemId);
      }
    }
  }

  /**
   * Serializa o inventário
   */
  serializar(): Array<[string, number]> {
    return Array.from(this.itens.entries());
  }

  /**
   * Carrega inventário de dados serializados
   */
  static deserializar(dados: Array<[string, number]>, capacidadeMaxima?: number): Inventario {
    const inventario = new Inventario(capacidadeMaxima);

    for (const [itemId, quantidade] of dados) {
      if (quantidade > 0) {
        inventario.itens.set(itemId, quantidade);
      }
    }

    return inventario;
  }

  /**
   * Importa dados de outro inventário
   */
  importar(dados: Array<[string, number]>): void {
    this.itens.clear();

    for (const [itemId, quantidade] of dados) {
      if (quantidade > 0) {
        this.itens.set(itemId, quantidade);
      }
    }
  }
}
