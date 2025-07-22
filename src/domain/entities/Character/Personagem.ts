import type { Personagem_Data } from './Personagem_Data';
import type { AtributosPrimarios } from './Personagem_Data';
import { StatusPersonagem } from './Personagem_Data';
import { Atributos } from './Atributos';

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

/**
 * Classe principal que representa um personagem no jogo
 * Implementa o padrão Factory para criação de instâncias
 */
export class Personagem {
  // ✅ OBRIGATÓRIO: Propriedade data tipada
  public data: Personagem_Data | null = null;

  private constructor() {}

  // ✅ OBRIGATÓRIO: Static factory method
  static create(data: Personagem_Data): Personagem {
    const instance = new Personagem();
    instance.data = data;
    return instance;
  }

  static createEmpty(): Personagem {
    const instance = new Personagem();
    instance.data = {
      id: '',
      nome: '',
      raca: '',
      classe: '',
      nivel: 1,
      isIA: false,
      descricao: '',
      atributos: {
        primarios: {
          forca: 10,
          destreza: 10,
          constituicao: 10,
          inteligencia: 10,
          sabedoria: 10,
          carisma: 10,
        },
        derivados: {
          hp: 10,
          hpMaximo: 10,
          mp: 0,
          mpMaximo: 0,
          ca: 10,
          iniciativa: 0,
          velocidade: 9,
        },
        nivel: 1,
      },
      inventario: [],
      equipamentos: [],
      eventos: [],
      conhecimentos: [],
      status: StatusPersonagem.ATIVO,
      experiencia: 0,
    };
    return instance;
  }

  static fromConfig(config: PersonagemConfig): Personagem {
    const instance = new Personagem();

    // Gerar atributos raciais baseados na raça
    const atributosIniciais = config.atributos ?? instance.gerarAtributosRaciais(config.raca);
    const nivel = config.nivel ?? 1;

    const data: Personagem_Data = {
      id: config.id ?? instance.gerarId(),
      nome: config.nome,
      raca: config.raca,
      classe: config.classe,
      nivel: nivel,
      isIA: config.isIA ?? false,
      descricao: config.descricao ?? '',
      atributos: {
        primarios: atributosIniciais,
        derivados: instance.calcularAtributosDerivados(atributosIniciais, nivel),
        nivel: nivel,
      },
      inventario: [],
      equipamentos: [],
      eventos: [],
      conhecimentos: [],
      status: StatusPersonagem.ATIVO,
      experiencia: 0,
    };

    if (config.promptPersonalidade) {
      data.promptPersonalidade = config.promptPersonalidade;
    }

    instance.data = data;

    return instance;
  }

  // ✅ PERMITIDO: Propriedades calculadas/getters
  get id(): string {
    return this.data?.id || '';
  }

  get nome(): string {
    return this.data?.nome || '';
  }

  get raca(): string {
    return this.data?.raca || '';
  }

  get classe(): string {
    return this.data?.classe || '';
  }

  get nivel(): number {
    return this.data?.nivel || 1;
  }

  get isIA(): boolean {
    return this.data?.isIA || false;
  }

  get promptPersonalidade(): string | undefined {
    return this.data?.promptPersonalidade;
  }

  get descricao(): string {
    return this.data?.descricao || '';
  }

  get status(): StatusPersonagem {
    return this.data?.status || StatusPersonagem.ATIVO;
  }

  get experiencia(): number {
    return this.data?.experiencia || 0;
  }

  get atributos(): Atributos | null {
    if (!this.data?.atributos) return null;
    return new Atributos(this.data.atributos.primarios, this.data.atributos.nivel);
  }

  // ✅ PERMITIDO: Métodos de negócio
  podeSubirNivel(): boolean {
    return this.nivel < 20;
  }

  estaVivo(): boolean {
    return this.status === StatusPersonagem.ATIVO;
  }

  // ✅ CORRETO: Atualização via substituição do data
  updateData(newData: Partial<Personagem_Data>): void {
    if (this.data) {
      this.data = { ...this.data, ...newData };
    }
  }

  // Métodos privados auxiliares
  private gerarId(): string {
    return 'char_' + Math.random().toString(36).substr(2, 9);
  }

  private gerarAtributosRaciais(raca: string): AtributosPrimarios {
    const base = {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    };

    // Aplicar modificadores raciais
    switch (raca.toLowerCase()) {
      case 'humano':
        // Humanos ganham +1 em todos os atributos
        Object.keys(base).forEach((key) => {
          base[key as keyof AtributosPrimarios] += 1;
        });
        break;
      case 'elfo':
        base.destreza += 2;
        break;
      case 'anao':
        base.constituicao += 2;
        break;
      case 'halfling':
        base.destreza += 2;
        break;
      // Adicionar mais raças conforme necessário
    }

    return base;
  }

  private calcularAtributosDerivados(primarios: AtributosPrimarios, nivel: number) {
    const modificadorCon = Math.floor((primarios.constituicao - 10) / 2);
    const modificadorDes = Math.floor((primarios.destreza - 10) / 2);
    const modificadorInt = Math.floor((primarios.inteligencia - 10) / 2);

    const hpMaximo = 10 + nivel * (6 + modificadorCon);
    const mpMaximo = modificadorInt > 0 ? nivel * (4 + modificadorInt) : 0;

    return {
      hp: hpMaximo,
      hpMaximo: hpMaximo,
      mp: mpMaximo,
      mpMaximo: mpMaximo,
      ca: 10 + modificadorDes,
      iniciativa: modificadorDes,
      velocidade: 9, // Velocidade base
    };
  }
}
