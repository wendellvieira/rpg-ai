import type { AtributosPrimarios, AtributosDerivados, AtributoTipo } from '../types';
import { Dados } from './Dados';

/**
 * Gerencia os atributos de um personagem D&D 5e
 */
export class Atributos {
  private primarios: AtributosPrimarios;
  private derivados: AtributosDerivados;
  private nivel: number;
  private proficiencia: number;

  constructor(
    atributosPrimarios: AtributosPrimarios,
    nivel: number = 1
  ) {
    this.primarios = { ...atributosPrimarios };
    this.nivel = nivel;
    this.proficiencia = this.calcularBonusProficiencia(nivel);
    this.derivados = this.calcularAtributosDerivados();
  }

  // Getters para atributos primários
  get forca(): number { return this.primarios.forca; }
  get destreza(): number { return this.primarios.destreza; }
  get constituicao(): number { return this.primarios.constituicao; }
  get inteligencia(): number { return this.primarios.inteligencia; }
  get sabedoria(): number { return this.primarios.sabedoria; }
  get carisma(): number { return this.primarios.carisma; }

  // Getters para atributos derivados
  get hp(): number { return this.derivados.hp; }
  get hpMaximo(): number { return this.derivados.hpMaximo; }
  get mp(): number { return this.derivados.mp; }
  get mpMaximo(): number { return this.derivados.mpMaximo; }
  get ca(): number { return this.derivados.ca; }
  get iniciativa(): number { return this.derivados.iniciativa; }
  get velocidade(): number { return this.derivados.velocidade; }

  // Getter para bônus de proficiência
  get bonusProficiencia(): number { return this.proficiencia; }
  
  // Getter para nível
  get nivelAtual(): number { return this.nivel; }

  /**
   * Calcula o modificador de um atributo específico
   */
  getModificador(atributo: AtributoTipo): number {
    return Dados.calcularModificador(this.primarios[atributo]);
  }

  /**
   * Obtém todos os modificadores dos atributos
   */
  getModificadores(): Record<AtributoTipo, number> {
    return {
      forca: this.getModificador('forca'),
      destreza: this.getModificador('destreza'),
      constituicao: this.getModificador('constituicao'),
      inteligencia: this.getModificador('inteligencia'),
      sabedoria: this.getModificador('sabedoria'),
      carisma: this.getModificador('carisma')
    };
  }

  /**
   * Define um novo valor para um atributo primário
   */
  setAtributo(atributo: AtributoTipo, valor: number): void {
    if (valor < 1 || valor > 30) {
      throw new Error(`Valor de atributo inválido: ${valor}. Deve estar entre 1 e 30.`);
    }
    
    this.primarios[atributo] = valor;
    this.recalcularAtributosDerivados();
  }

  /**
   * Aplica modificador temporário a um atributo
   */
  aplicarModificadorTemporario(atributo: AtributoTipo, modificador: number): void {
    this.primarios[atributo] += modificador;
    this.recalcularAtributosDerivados();
  }

  /**
   * Sobe de nível e recalcula atributos
   */
  subirNivel(novoNivel: number, aumentoHP: number = 0): void {
    if (novoNivel <= this.nivel) {
      throw new Error('Novo nível deve ser maior que o atual');
    }

    this.nivel = novoNivel;
    this.proficiencia = this.calcularBonusProficiencia(novoNivel);
    
    // Aumenta HP máximo
    this.derivados.hpMaximo += aumentoHP;
    this.derivados.hp = Math.min(this.derivados.hp + aumentoHP, this.derivados.hpMaximo);
    
    this.recalcularAtributosDerivados();
  }

  /**
   * Aplica dano aos pontos de vida
   */
  receberDano(dano: number): void {
    this.derivados.hp = Math.max(0, this.derivados.hp - dano);
  }

  /**
   * Cura pontos de vida
   */
  curar(cura: number): void {
    this.derivados.hp = Math.min(this.derivados.hpMaximo, this.derivados.hp + cura);
  }

  /**
   * Gasta pontos de magia
   */
  gastarMP(custo: number): boolean {
    if (this.derivados.mp < custo) {
      return false;
    }
    this.derivados.mp -= custo;
    return true;
  }

  /**
   * Recupera pontos de magia
   */
  recuperarMP(quantidade: number): void {
    this.derivados.mp = Math.min(this.derivados.mpMaximo, this.derivados.mp + quantidade);
  }

  /**
   * Verifica se o personagem está morto
   */
  estaMorto(): boolean {
    return this.derivados.hp <= 0;
  }

  /**
   * Verifica se o personagem está inconsciente
   */
  estaInconsciente(): boolean {
    return this.derivados.hp <= 0;
  }

  /**
   * Calcula o bônus de proficiência baseado no nível
   */
  private calcularBonusProficiencia(nivel: number): number {
    return Math.ceil(nivel / 4) + 1;
  }

  /**
   * Calcula os atributos derivados baseados nos primários
   */
  private calcularAtributosDerivados(): AtributosDerivados {
    const modConstituicao = this.getModificador('constituicao');
    const modInteligencia = this.getModificador('inteligencia');
    const modDestreza = this.getModificador('destreza');

    // HP base (8 + mod. Constituição no nível 1, +5 por nível adicional como base)
    const hpBase = 8 + modConstituicao + ((this.nivel - 1) * (5 + modConstituicao));
    
    // MP base (baseado em Inteligência para casters)
    const mpBase = Math.max(0, modInteligencia * this.nivel);

    return {
      hp: this.derivados?.hp ?? hpBase,
      hpMaximo: hpBase,
      mp: this.derivados?.mp ?? mpBase,
      mpMaximo: mpBase,
      ca: 10 + modDestreza, // CA base sem armadura
      iniciativa: modDestreza,
      velocidade: 30 // Velocidade padrão em pés (9 metros)
    };
  }

  /**
   * Recalcula atributos derivados (para quando primários mudam)
   */
  private recalcularAtributosDerivados(): void {
    const novosDerivados = this.calcularAtributosDerivados();
    
    // Mantém HP e MP atuais, mas atualiza máximos
    const hpAtual = this.derivados.hp;
    const mpAtual = this.derivados.mp;
    
    this.derivados = novosDerivados;
    this.derivados.hp = Math.min(hpAtual, this.derivados.hpMaximo);
    this.derivados.mp = Math.min(mpAtual, this.derivados.mpMaximo);
  }

  /**
   * Exporta todos os atributos para persistência
   */
  exportar(): { primarios: AtributosPrimarios; derivados: AtributosDerivados; nivel: number } {
    return {
      primarios: { ...this.primarios },
      derivados: { ...this.derivados },
      nivel: this.nivel
    };
  }

  /**
   * Importa atributos de dados salvos
   */
  static importar(dados: { primarios: AtributosPrimarios; derivados: AtributosDerivados; nivel: number }): Atributos {
    const atributos = new Atributos(dados.primarios, dados.nivel);
    atributos.derivados = { ...dados.derivados };
    return atributos;
  }

  /**
   * Cria atributos aleatórios para teste rápido
   */
  static criarAleatorio(): Atributos {
    return new Atributos(Dados.gerarAtributosIniciais());
  }

  /**
   * Cria atributos com array padrão [15, 14, 13, 12, 10, 8]
   */
  static criarPadrao(): Atributos {
    return new Atributos({
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 12,
      sabedoria: 10,
      carisma: 8
    });
  }
}
