import {
  StatusPersonagem,
  type AtributosPrimarios,
  type AtributosDerivados,
  type EventoPersonagem,
  type ConhecimentoPersonagem,
  type Pericia,
  type CapacidadeMagica,
  type SlotsMagia,
  type NivelMagia,
  type AtributoTipo,
} from '../types';
import { Atributos } from './Atributos';
import type { Item } from './Item';

export interface PersonagemConfig {
  id?: string;
  nome: string;
  raca: string;
  classe: string;
  nivel?: number;
  atributos?: AtributosPrimarios;
  isIA?: boolean;
  promptPersonalidade?: string;
  descricao?: string;
}

interface PersonagemSerializado {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  isIA: boolean;
  promptPersonalidade: string | undefined;
  descricao: string;
  atributos: { primarios: AtributosPrimarios; derivados: AtributosDerivados; nivel: number };
  inventario: [string, number][];
  equipamentos: [string, string][];
  eventos: EventoPersonagem[];
  conhecimentos: ConhecimentoPersonagem[];
  status: StatusPersonagem;
  experiencia: number;
}

/**
 * Classe principal que representa um personagem no jogo
 */
export class Personagem {
  public readonly id: string;
  public readonly nome: string;
  public readonly raca: string;
  public readonly classe: string;
  public readonly isIA: boolean;
  public readonly promptPersonalidade: string | undefined;
  public readonly descricao: string;

  private atributos: Atributos;
  private inventario: Map<string, number>; // itemId -> quantidade
  private equipamentos: Map<string, string>; // slot -> itemId
  private eventos: EventoPersonagem[];
  private conhecimentos: ConhecimentoPersonagem[];
  private status: StatusPersonagem;
  private pericias: Map<string, Pericia>;
  private experiencia: number;
  private _capacidadesMagicas: CapacidadeMagica | null;

  // Slots de equipamento
  private static readonly SLOTS_EQUIPAMENTO = [
    'mao-principal',
    'mao-secundaria',
    'armadura',
    'escudo',
    'casco',
    'botas',
    'luvas',
    'cinto',
    'colar',
    'anel1',
    'anel2',
    'capa',
  ] as const;

  constructor(config: PersonagemConfig) {
    this.id = config.id ?? this.gerarId();
    this.nome = config.nome;
    this.raca = config.raca;
    this.classe = config.classe;
    this.isIA = config.isIA ?? false;
    this.promptPersonalidade = config.promptPersonalidade;
    this.descricao = config.descricao ?? '';

    // Inicializa atributos
    const atributosIniciais = config.atributos ?? this.gerarAtributosRaciais();
    this.atributos = new Atributos(atributosIniciais, config.nivel);

    // Inicializa coleções
    this.inventario = new Map();
    this.equipamentos = new Map();
    this.eventos = [];
    this.conhecimentos = [];
    this.status = StatusPersonagem.ATIVO;
    this.pericias = new Map();
    this.experiencia = 0;
    this._capacidadesMagicas = this.inicializarCapacidadesMagicas();

    // Inicializa perícias baseadas na classe
    this.inicializarPericias();
  }

  // Getters para atributos
  get nivel(): number {
    return this.atributos.nivelAtual;
  }
  get hp(): number {
    return this.atributos.hp;
  }
  get hpMaximo(): number {
    return this.atributos.hpMaximo;
  }
  get mp(): number {
    return this.atributos.mp;
  }
  get mpMaximo(): number {
    return this.atributos.mpMaximo;
  }
  get ca(): number {
    return this.atributos.ca + this.calcularBonusCAEquipamentos();
  }
  get iniciativa(): number {
    return this.atributos.iniciativa;
  }
  get velocidade(): number {
    return this.atributos.velocidade;
  }
  get bonusProficiencia(): number {
    return this.atributos.bonusProficiencia;
  }

  // Getters para status
  get statusAtual(): StatusPersonagem {
    return this.status;
  }
  get estaVivo(): boolean {
    return this.status !== StatusPersonagem.MORTO;
  }
  get estaConsciente(): boolean {
    return this.status !== StatusPersonagem.INCONSCIENTE && this.status !== StatusPersonagem.MORTO;
  }

  // Getters para acessar campos privados
  get getAtributos(): Atributos {
    return this.atributos;
  }

  get getInventario(): Map<string, number> {
    return new Map(this.inventario);
  }

  get getEquipamentos(): Map<string, string> {
    return new Map(this.equipamentos);
  }

  get getEventos(): EventoPersonagem[] {
    return [...this.eventos];
  }

  get getConhecimentos(): ConhecimentoPersonagem[] {
    return [...this.conhecimentos];
  }

  get getExperiencia(): number {
    return this.experiencia;
  }

  /**
   * Obtém valor de um atributo específico
   */
  getAtributo(atributo: keyof AtributosPrimarios): number {
    return this.atributos[atributo];
  }

  /**
   * Obtém modificador de um atributo
   */
  getModificador(atributo: keyof AtributosPrimarios): number {
    return this.atributos.getModificador(atributo);
  }

  /**
   * Adiciona item ao inventário
   */
  adicionarItem(item: Item, quantidade: number = 1): void {
    const quantidadeAtual = this.inventario.get(item.id) ?? 0;
    this.inventario.set(item.id, quantidadeAtual + quantidade);
  }

  /**
   * Remove item do inventário
   */
  removerItem(itemId: string, quantidade: number = 1): boolean {
    const quantidadeAtual = this.inventario.get(itemId) ?? 0;

    if (quantidadeAtual < quantidade) {
      return false;
    }

    if (quantidadeAtual === quantidade) {
      this.inventario.delete(itemId);
    } else {
      this.inventario.set(itemId, quantidadeAtual - quantidade);
    }

    return true;
  }

  /**
   * Verifica se tem um item específico
   */
  temItem(itemId: string): boolean {
    return this.inventario.has(itemId);
  }

  /**
   * Obtém quantidade de um item
   */
  getQuantidadeItem(itemId: string): number {
    return this.inventario.get(itemId) ?? 0;
  }

  /**
   * Equipa um item em um slot
   */
  equiparItem(item: Item, slot: string): boolean {
    if (!item.podeEquipar()) {
      return false;
    }

    if (!this.temItem(item.id)) {
      return false;
    }

    // Remove item atual do slot se houver
    if (this.equipamentos.has(slot)) {
      this.desequiparItem(slot);
    }

    this.equipamentos.set(slot, item.id);
    return true;
  }

  /**
   * Desequipa item de um slot
   */
  desequiparItem(slot: string): boolean {
    return this.equipamentos.delete(slot);
  }

  /**
   * Verifica se tem item equipado em um slot
   */
  temItemEquipado(slot: string): boolean {
    return this.equipamentos.has(slot);
  }

  /**
   * Obtém item equipado em um slot
   */
  getItemEquipado(slot: string): string | undefined {
    return this.equipamentos.get(slot);
  }

  /**
   * Adiciona evento ao histórico do personagem
   */
  adicionarEvento(resumo: string, importancia: 'baixa' | 'media' | 'alta' = 'media'): void {
    const evento: EventoPersonagem = {
      id: this.gerarId(),
      resumo,
      timestamp: new Date(),
      turno: 0, // Será definido pelo sistema de turnos
      importancia,
    };

    this.eventos.push(evento);

    // Mantém apenas os últimos 100 eventos
    if (this.eventos.length > 100) {
      this.eventos = this.eventos.slice(-100);
    }
  }

  /**
   * Obtém eventos recentes (últimos N)
   */
  getEventosRecentes(quantidade: number = 10): EventoPersonagem[] {
    return this.eventos.slice(-quantidade);
  }

  /**
   * Adiciona conhecimento
   */
  adicionarConhecimento(
    topico: string,
    conteudo: string,
    categoria: string = 'geral',
    fonte: 'inicial' | 'descoberto' | 'aprendido' = 'descoberto',
  ): void {
    const conhecimento: ConhecimentoPersonagem = {
      id: this.gerarId(),
      topico,
      conteudo,
      categoria,
      criadoEm: new Date(),
      fonte,
    };

    this.conhecimentos.push(conhecimento);
  }

  /**
   * Busca conhecimentos por termo
   */
  buscarConhecimento(termo: string): ConhecimentoPersonagem[] {
    const termoLower = termo.toLowerCase();
    return this.conhecimentos.filter(
      (c) =>
        c.topico.toLowerCase().includes(termoLower) ||
        c.conteudo.toLowerCase().includes(termoLower) ||
        c.categoria.toLowerCase().includes(termoLower),
    );
  }

  /**
   * Recebe dano
   */
  receberDano(dano: number): void {
    this.atributos.receberDano(dano);

    if (this.hp <= 0) {
      this.status = StatusPersonagem.INCONSCIENTE;
    }

    this.adicionarEvento(`Recebeu ${dano} pontos de dano.`, 'media');
  }

  /**
   * Recebe cura
   */
  curar(cura: number): void {
    const hpAnterior = this.hp;
    this.atributos.curar(cura);
    const curaReal = this.hp - hpAnterior;

    if (this.hp > 0 && this.status === StatusPersonagem.INCONSCIENTE) {
      this.status = StatusPersonagem.ATIVO;
    }

    this.adicionarEvento(`Foi curado em ${curaReal} pontos de vida.`, 'baixa');
  }

  /**
   * Gasta pontos de magia
   */
  gastarMP(custo: number): boolean {
    const sucesso = this.atributos.gastarMP(custo);
    if (sucesso) {
      this.adicionarEvento(`Gastou ${custo} pontos de magia.`, 'baixa');
    }
    return sucesso;
  }

  /**
   * Verifica se tem capacidades mágicas
   */
  get podeConjurar(): boolean {
    return this._capacidadesMagicas !== null;
  }

  /**
   * Obtém as capacidades mágicas do personagem
   */
  get capacidadesMagicas(): CapacidadeMagica | null {
    return this._capacidadesMagicas;
  }

  /**
   * Verifica se tem slots disponíveis de um nível específico
   */
  temSlotDisponivel(nivel: NivelMagia): boolean {
    if (!this._capacidadesMagicas) return false;

    const slot = this._capacidadesMagicas.slotsMagia[`nivel${nivel}` as keyof SlotsMagia];
    return slot.total > slot.usados;
  }

  /**
   * Gasta um slot de magia de nível específico
   */
  gastarSlotMagia(nivel: NivelMagia): boolean {
    if (!this.temSlotDisponivel(nivel)) return false;

    const slot = this._capacidadesMagicas!.slotsMagia[`nivel${nivel}` as keyof SlotsMagia];
    slot.usados++;

    this.adicionarEvento(`Gastou um slot de magia de nível ${nivel}.`, 'baixa');
    return true;
  }

  /**
   * Recupera todos os slots de magia (descanso longo)
   */
  recuperarSlotsMagia(): void {
    if (!this._capacidadesMagicas) return;

    Object.values(this._capacidadesMagicas.slotsMagia).forEach((slot) => {
      slot.usados = 0;
    });

    this.adicionarEvento('Recuperou todos os slots de magia.', 'media');
  }

  /**
   * Obtém slots disponíveis de um nível específico
   */
  obterSlotsDisponiveis(nivel: NivelMagia): { total: number; usados: number; disponiveis: number } {
    if (!this._capacidadesMagicas) {
      return { total: 0, usados: 0, disponiveis: 0 };
    }

    const slot = this._capacidadesMagicas.slotsMagia[`nivel${nivel}` as keyof SlotsMagia];
    return {
      total: slot.total,
      usados: slot.usados,
      disponiveis: slot.total - slot.usados,
    };
  }

  /**
   * Aprende uma nova magia
   */
  aprenderMagia(magiaId: string): boolean {
    if (!this._capacidadesMagicas) return false;

    if (!this._capacidadesMagicas.magiasConhecidas.includes(magiaId)) {
      this._capacidadesMagicas.magiasConhecidas.push(magiaId);
      this.adicionarEvento(`Aprendeu uma nova magia.`, 'media');
      return true;
    }

    return false;
  }

  /**
   * Prepara uma magia conhecida
   */
  prepararMagia(magiaId: string): boolean {
    if (!this._capacidadesMagicas) return false;

    if (!this._capacidadesMagicas.magiasConhecidas.includes(magiaId)) return false;

    if (!this._capacidadesMagicas.magiasPreparadas.includes(magiaId)) {
      this._capacidadesMagicas.magiasPreparadas.push(magiaId);
      this.adicionarEvento(`Preparou uma magia.`, 'baixa');
      return true;
    }

    return false;
  }

  /**
   * Calcula bônus de CA dos equipamentos
   */
  private calcularBonusCAEquipamentos(): number {
    const bonus = 0;
    // Implementar lógica de CA baseada em equipamentos
    // Por enquanto retorna 0
    return bonus;
  }

  /**
   * Gera atributos baseados na raça (simplificado)
   */
  private gerarAtributosRaciais(): AtributosPrimarios {
    // Por enquanto usa atributos padrão, depois implementar modificadores raciais
    return {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    };
  }

  /**
   * Inicializa capacidades mágicas baseadas na classe
   */
  private inicializarCapacidadesMagicas(): CapacidadeMagica | null {
    const classesMagicas = [
      'Mago',
      'Clérigo',
      'Druida',
      'Feiticeiro',
      'Warlock',
      'Bardo',
      'Paladino',
      'Ranger',
    ];

    if (!classesMagicas.includes(this.classe)) {
      return null;
    }

    const slotsPorNivel = this.calcularSlotsPorNivel();
    const atributoConjuracao = this.obterAtributoConjuracao();

    return {
      classeConjuradora: this.classe,
      atributoConjuracao,
      slotsMagia: slotsPorNivel,
      magiasConhecidas: [],
      magiasPreparadas: [],
    };
  }

  /**
   * Calcula slots de magia baseados no nível e classe
   */
  private calcularSlotsPorNivel(): SlotsMagia {
    const nivel = this.nivel;
    const slots: SlotsMagia = {
      nivel1: { total: 0, usados: 0 },
      nivel2: { total: 0, usados: 0 },
      nivel3: { total: 0, usados: 0 },
      nivel4: { total: 0, usados: 0 },
      nivel5: { total: 0, usados: 0 },
      nivel6: { total: 0, usados: 0 },
      nivel7: { total: 0, usados: 0 },
      nivel8: { total: 0, usados: 0 },
      nivel9: { total: 0, usados: 0 },
    };

    // Tabela simplificada de slots para conjuradores completos (como Mago, Clérigo)
    if (['Mago', 'Clérigo', 'Druida', 'Feiticeiro'].includes(this.classe)) {
      if (nivel >= 1) slots.nivel1.total = Math.min(4, nivel + 1);
      if (nivel >= 3) slots.nivel2.total = Math.min(3, Math.floor((nivel - 1) / 2));
      if (nivel >= 5) slots.nivel3.total = Math.min(3, Math.floor((nivel - 3) / 2));
      if (nivel >= 7) slots.nivel4.total = Math.min(3, Math.floor((nivel - 5) / 2));
      if (nivel >= 9) slots.nivel5.total = Math.min(3, Math.floor((nivel - 7) / 2));
      if (nivel >= 11) slots.nivel6.total = Math.min(1, Math.floor((nivel - 9) / 2));
      if (nivel >= 13) slots.nivel7.total = Math.min(1, Math.floor((nivel - 11) / 2));
      if (nivel >= 15) slots.nivel8.total = Math.min(1, Math.floor((nivel - 13) / 2));
      if (nivel >= 17) slots.nivel9.total = Math.min(1, Math.floor((nivel - 15) / 2));
    }
    // Meio-conjuradores (Paladino, Ranger)
    else if (['Paladino', 'Ranger'].includes(this.classe)) {
      const nivelConjuracao = Math.floor(nivel / 2);
      if (nivelConjuracao >= 1) slots.nivel1.total = Math.min(4, nivelConjuracao + 1);
      if (nivelConjuracao >= 3)
        slots.nivel2.total = Math.min(3, Math.floor((nivelConjuracao - 1) / 2));
      if (nivelConjuracao >= 5)
        slots.nivel3.total = Math.min(3, Math.floor((nivelConjuracao - 3) / 2));
      if (nivelConjuracao >= 7)
        slots.nivel4.total = Math.min(3, Math.floor((nivelConjuracao - 5) / 2));
      if (nivelConjuracao >= 9)
        slots.nivel5.total = Math.min(1, Math.floor((nivelConjuracao - 7) / 2));
    }

    return slots;
  }

  /**
   * Obtém o atributo de conjuração baseado na classe
   */
  private obterAtributoConjuracao(): AtributoTipo {
    switch (this.classe) {
      case 'Mago':
        return 'inteligencia';
      case 'Clérigo':
      case 'Druida':
      case 'Ranger':
        return 'sabedoria';
      case 'Feiticeiro':
      case 'Bardo':
      case 'Paladino':
      case 'Warlock':
        return 'carisma';
      default:
        return 'inteligencia';
    }
  }

  /**
   * Inicializa perícias baseadas na classe
   */
  private inicializarPericias(): void {
    // Implementar perícias específicas por classe
    // Por enquanto vazio
  }

  /**
   * Gera ID único
   */
  private gerarId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa personagem para persistência
   */
  serializar(): PersonagemSerializado {
    return {
      id: this.id,
      nome: this.nome,
      raca: this.raca,
      classe: this.classe,
      isIA: this.isIA,
      promptPersonalidade: this.promptPersonalidade,
      descricao: this.descricao,
      atributos: this.atributos.exportar(),
      inventario: Array.from(this.inventario.entries()),
      equipamentos: Array.from(this.equipamentos.entries()),
      eventos: this.eventos,
      conhecimentos: this.conhecimentos,
      status: this.status,
      experiencia: this.experiencia,
    };
  }

  /**
   * Cria personagem a partir de dados serializados
   */
  static deserializar(dados: PersonagemSerializado): Personagem {
    const personagem = new Personagem({
      id: dados.id,
      nome: dados.nome,
      raca: dados.raca,
      classe: dados.classe,
      isIA: dados.isIA,
      ...(dados.promptPersonalidade && { promptPersonalidade: dados.promptPersonalidade }),
      descricao: dados.descricao,
    });

    // Restaura atributos
    if (dados.atributos) {
      personagem.atributos = Atributos.importar(dados.atributos);
    }

    // Restaura inventário
    if (dados.inventario) {
      personagem.inventario = new Map(dados.inventario);
    }

    // Restaura equipamentos
    if (dados.equipamentos) {
      personagem.equipamentos = new Map(dados.equipamentos);
    }

    // Restaura outros dados
    personagem.eventos = dados.eventos || [];
    personagem.conhecimentos = dados.conhecimentos || [];
    personagem.status = dados.status || StatusPersonagem.ATIVO;
    personagem.experiencia = dados.experiencia || 0;

    return personagem;
  }

  /**
   * Obtém lista de todos os itens no inventário
   */
  obterItensInventario(): Array<{ itemId: string; quantidade: number }> {
    return Array.from(this.inventario.entries()).map(([itemId, quantidade]) => ({
      itemId,
      quantidade,
    }));
  }

  /**
   * Obtém lista de todos os equipamentos
   */
  obterEquipamentos(): Array<{ slot: string; itemId: string }> {
    return Array.from(this.equipamentos.entries()).map(([slot, itemId]) => ({
      slot,
      itemId,
    }));
  }
}
