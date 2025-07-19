import { 
  StatusPersonagem,
  type AtributosPrimarios, 
  type EventoPersonagem, 
  type ConhecimentoPersonagem,
  type Pericia
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
  atributos: any;
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
    'capa'
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

    // Inicializa perícias baseadas na classe
    this.inicializarPericias();
  }

  // Getters para atributos
  get nivel(): number { return this.atributos.nivelAtual; }
  get hp(): number { return this.atributos.hp; }
  get hpMaximo(): number { return this.atributos.hpMaximo; }
  get mp(): number { return this.atributos.mp; }
  get mpMaximo(): number { return this.atributos.mpMaximo; }
  get ca(): number { return this.atributos.ca + this.calcularBonusCAEquipamentos(); }
  get iniciativa(): number { return this.atributos.iniciativa; }
  get velocidade(): number { return this.atributos.velocidade; }
  get bonusProficiencia(): number { return this.atributos.bonusProficiencia; }

  // Getters para status
  get statusAtual(): StatusPersonagem { return this.status; }
  get estaVivo(): boolean { return this.status !== StatusPersonagem.MORTO; }
  get estaConsciente(): boolean { 
    return this.status === StatusPersonagem.ATIVO && this.hp > 0; 
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
      importancia
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
    fonte: 'inicial' | 'descoberto' | 'aprendido' = 'descoberto'
  ): void {
    const conhecimento: ConhecimentoPersonagem = {
      id: this.gerarId(),
      topico,
      conteudo,
      categoria,
      criadoEm: new Date(),
      fonte
    };

    this.conhecimentos.push(conhecimento);
  }

  /**
   * Busca conhecimentos por termo
   */
  buscarConhecimento(termo: string): ConhecimentoPersonagem[] {
    const termoLower = termo.toLowerCase();
    return this.conhecimentos.filter(c => 
      c.topico.toLowerCase().includes(termoLower) ||
      c.conteudo.toLowerCase().includes(termoLower) ||
      c.categoria.toLowerCase().includes(termoLower)
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
      carisma: 10
    };
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
      experiencia: this.experiencia
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
      promptPersonalidade: dados.promptPersonalidade,
      descricao: dados.descricao
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
}
