import { v4 as uuidv4 } from 'uuid';

/**
 * Representa um objeto no mapa (personagem, item, obstáculo, etc.)
 */
export interface ObjetoMapa {
  id: string;
  tipo: TipoObjetoMapa;
  nome: string;
  posicao: { x: number; y: number };
  dimensoes?: { largura: number; altura: number };
  cor?: string;
  icone?: string;
  visivel: boolean;
  propriedades?: Record<string, unknown>;
}

/**
 * Tipos de objetos que podem ser colocados no mapa
 */
export enum TipoObjetoMapa {
  PERSONAGEM = 'personagem',
  NPC = 'npc',
  INIMIGO = 'inimigo',
  OBSTACULO = 'obstaculo',
  PORTA = 'porta',
  TESOURO = 'tesouro',
  ARMADILHA = 'armadilha',
  AREA_EFEITO = 'area_efeito',
  PONTO_INTERESSE = 'ponto_interesse',
  OUTRO = 'outro',
}

/**
 * Interface para dados serializados do mapa
 */
export interface DadosMapaSerializados {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl?: string | undefined;
  dimensoes: { largura: number; altura: number };
  escala: number; // pixels por unidade de jogo (ex: 30px = 1 quadrado de 5 pés)
  grade: {
    ativa: boolean;
    tamanho: number; // tamanho da grade em pixels
    cor: string;
    opacidade: number;
  };
  objetos: ObjetoMapa[];
  configuracoes: {
    modoEdicao: boolean;
    mostrarGrade: boolean;
    mostrarReguas: boolean;
    snap: boolean; // encaixar objetos na grade
  };
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Classe principal para gerenciar mapas do RPG
 */
export class Mapa {
  public readonly id: string;
  private _nome: string;
  private _descricao: string;
  private _imagemUrl?: string | undefined;
  private _dimensoes: { largura: number; altura: number };
  private _escala: number;
  private _grade: {
    ativa: boolean;
    tamanho: number;
    cor: string;
    opacidade: number;
  };
  private _objetos: Map<string, ObjetoMapa>;
  private _configuracoes: {
    modoEdicao: boolean;
    mostrarGrade: boolean;
    mostrarReguas: boolean;
    snap: boolean;
  };
  private _criadoEm: Date;
  private _atualizadoEm: Date;

  constructor(dados?: Partial<DadosMapaSerializados>) {
    this.id = dados?.id || uuidv4();
    this._nome = dados?.nome || 'Novo Mapa';
    this._descricao = dados?.descricao || '';
    this._imagemUrl = dados?.imagemUrl;
    this._dimensoes = dados?.dimensoes || { largura: 800, altura: 600 };
    this._escala = dados?.escala || 30;
    this._grade = dados?.grade || {
      ativa: true,
      tamanho: 30,
      cor: '#000000',
      opacidade: 0.3,
    };
    this._objetos = new Map();
    this._configuracoes = dados?.configuracoes || {
      modoEdicao: false,
      mostrarGrade: true,
      mostrarReguas: true,
      snap: true,
    };
    this._criadoEm = dados?.criadoEm ? new Date(dados.criadoEm) : new Date();
    this._atualizadoEm = dados?.atualizadoEm ? new Date(dados.atualizadoEm) : new Date();

    // Carregar objetos se fornecidos
    if (dados?.objetos) {
      dados.objetos.forEach((obj) => {
        this._objetos.set(obj.id, obj);
      });
    }
  }

  // Getters públicos
  get nome(): string {
    return this._nome;
  }

  get descricao(): string {
    return this._descricao;
  }

  get imagemUrl(): string | undefined {
    return this._imagemUrl;
  }

  get dimensoes(): { largura: number; altura: number } {
    return { ...this._dimensoes };
  }

  get escala(): number {
    return this._escala;
  }

  get grade(): typeof this._grade {
    return { ...this._grade };
  }

  get objetos(): ObjetoMapa[] {
    return Array.from(this._objetos.values());
  }

  get configuracoes(): typeof this._configuracoes {
    return { ...this._configuracoes };
  }

  get criadoEm(): Date {
    return new Date(this._criadoEm);
  }

  get atualizadoEm(): Date {
    return new Date(this._atualizadoEm);
  }

  // Métodos de edição
  setNome(nome: string): void {
    this._nome = nome;
    this._atualizarTimestamp();
  }

  setDescricao(descricao: string): void {
    this._descricao = descricao;
    this._atualizarTimestamp();
  }

  setImagemUrl(url: string): void {
    this._imagemUrl = url;
    this._atualizarTimestamp();
  }

  setDimensoes(largura: number, altura: number): void {
    this._dimensoes = { largura, altura };
    this._atualizarTimestamp();
  }

  setEscala(escala: number): void {
    this._escala = escala;
    this._atualizarTimestamp();
  }

  configurarGrade(config: Partial<typeof this._grade>): void {
    this._grade = { ...this._grade, ...config };
    this._atualizarTimestamp();
  }

  configurarOpcoes(config: Partial<typeof this._configuracoes>): void {
    this._configuracoes = { ...this._configuracoes, ...config };
    this._atualizarTimestamp();
  }

  // Métodos para gerenciar objetos
  adicionarObjeto(objeto: Omit<ObjetoMapa, 'id'>): string {
    const id = uuidv4();
    const objetoCompleto: ObjetoMapa = {
      ...objeto,
      id,
    };

    // Aplicar snap se ativo
    if (this._configuracoes.snap && this._grade.ativa) {
      objetoCompleto.posicao = this._aplicarSnap(objetoCompleto.posicao);
    }

    this._objetos.set(id, objetoCompleto);
    this._atualizarTimestamp();
    return id;
  }

  removerObjeto(id: string): boolean {
    const removido = this._objetos.delete(id);
    if (removido) {
      this._atualizarTimestamp();
    }
    return removido;
  }

  editarObjeto(id: string, dados: Partial<ObjetoMapa>): boolean {
    const objeto = this._objetos.get(id);
    if (!objeto) return false;

    const objetoAtualizado = { ...objeto, ...dados };

    // Aplicar snap na posição se fornecida
    if (dados.posicao && this._configuracoes.snap && this._grade.ativa) {
      objetoAtualizado.posicao = this._aplicarSnap(dados.posicao);
    }

    this._objetos.set(id, objetoAtualizado);
    this._atualizarTimestamp();
    return true;
  }

  moverObjeto(id: string, novaPosicao: { x: number; y: number }): boolean {
    const posicao =
      this._configuracoes.snap && this._grade.ativa ? this._aplicarSnap(novaPosicao) : novaPosicao;

    return this.editarObjeto(id, { posicao });
  }

  obterObjeto(id: string): ObjetoMapa | undefined {
    return this._objetos.get(id);
  }

  obterObjetosPorTipo(tipo: TipoObjetoMapa): ObjetoMapa[] {
    return this.objetos.filter((obj) => obj.tipo === tipo);
  }

  obterObjetosNaArea(area: {
    x: number;
    y: number;
    largura: number;
    altura: number;
  }): ObjetoMapa[] {
    return this.objetos.filter((obj) => {
      const objDimensoes = obj.dimensoes || {
        largura: this._grade.tamanho,
        altura: this._grade.tamanho,
      };

      return (
        obj.posicao.x < area.x + area.largura &&
        obj.posicao.x + objDimensoes.largura > area.x &&
        obj.posicao.y < area.y + area.altura &&
        obj.posicao.y + objDimensoes.altura > area.y
      );
    });
  }

  // Métodos de utilidade
  private _aplicarSnap(posicao: { x: number; y: number }): { x: number; y: number } {
    const tamanhoGrade = this._grade.tamanho;
    return {
      x: Math.round(posicao.x / tamanhoGrade) * tamanhoGrade,
      y: Math.round(posicao.y / tamanhoGrade) * tamanhoGrade,
    };
  }

  private _atualizarTimestamp(): void {
    this._atualizadoEm = new Date();
  }

  // Conversão para dados serializáveis
  paraJSON(): DadosMapaSerializados {
    return {
      id: this.id,
      nome: this._nome,
      descricao: this._descricao,
      imagemUrl: this._imagemUrl,
      dimensoes: { ...this._dimensoes },
      escala: this._escala,
      grade: { ...this._grade },
      objetos: Array.from(this._objetos.values()),
      configuracoes: { ...this._configuracoes },
      criadoEm: this._criadoEm.toISOString(),
      atualizadoEm: this._atualizadoEm.toISOString(),
    };
  }

  // Método estático para criar a partir de dados serializados
  static fromJSON(dados: DadosMapaSerializados): Mapa {
    return new Mapa(dados);
  }

  // Método para clonar o mapa
  clonar(novoNome?: string): Mapa {
    const dados = this.paraJSON();
    return new Mapa({
      ...dados,
      id: uuidv4(),
      nome: novoNome || `${dados.nome} (Cópia)`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });
  }

  // Métodos para validação
  validar(): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    if (!this._nome.trim()) {
      erros.push('Nome é obrigatório');
    }

    if (this._dimensoes.largura <= 0 || this._dimensoes.altura <= 0) {
      erros.push('Dimensões devem ser positivas');
    }

    if (this._escala <= 0) {
      erros.push('Escala deve ser positiva');
    }

    if (this._grade.tamanho <= 0) {
      erros.push('Tamanho da grade deve ser positivo');
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }
}
