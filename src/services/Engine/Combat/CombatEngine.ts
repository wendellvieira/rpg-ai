import type { Personagem } from './Personagem';
import type { Arma } from './Arma';
import { CategoriaArma } from './Arma';
import { Dados } from './Dados';
import type { Magia, EfeitoMagia } from './Magia';
import { TipoSalvaguarda } from './Magia';
import type { ResultadoDados } from '../types';

/**
 * Interface para resultados de ataques
 */
export interface ResultadoAtaque {
  sucesso: boolean;
  critico: boolean;
  erroGrave: boolean;
  dano: number;
  tipoDano: string;
  rolagemAtaque: ResultadoDados;
  rolagemDano?: ResultadoDados | undefined;
  caAlvo: number;
  descricao: string;
}

/**
 * Interface para resultados de defesa
 */
export interface ResultadoDefesa {
  sucesso: boolean;
  tipo: 'esquiva' | 'bloqueio' | 'aparar';
  rolagemDefesa?: ResultadoDados | undefined;
  danoReduzido: number;
  descricao: string;
}

/**
 * Interface para resultados de ataques de magia
 */
export interface ResultadoAtaqueMagia {
  sucesso: boolean;
  critico: boolean;
  dano: number;
  tipoDano: string;
  rolagemAtaque?: ResultadoDados;
  rolagemDano?: ResultadoDados;
  salvaguarda?: {
    tipo: TipoSalvaguarda;
    cd: number;
    sucessos: Array<{ personagemId: string; sucesso: boolean; rolagem: ResultadoDados }>;
  };
  efeitosAdicionais: string[];
  descricao: string;
}

/**
 * Interface para conjuração de magia
 */
export interface ConjuracaoMagia {
  magia: Magia;
  conjurador: string;
  alvos: string[];
  nivelConjurado: number;
  usouSlot: boolean;
  slotUsado?: number;
}

/**
 * Interface para ação de combate
 */
export interface AcaoCombate {
  atacante: string;
  alvo: string;
  tipo: 'ataque' | 'defesa' | 'magia' | 'item';
  arma?: string | undefined;
  resultado: ResultadoAtaque | ResultadoDefesa | ResultadoAtaqueMagia;
  timestamp: Date;
}

/**
 * Sistema avançado de combate para D&D 5e
 */
export class SistemaCombate {
  private historicoCombate: AcaoCombate[] = [];

  /**
   * Executa um ataque entre dois personagens
   */
  atacar(
    atacante: Personagem,
    alvo: Personagem,
    arma?: Arma,
    vantagem?: boolean,
    desvantagem?: boolean,
  ): ResultadoAtaque {
    // Calcula bônus de ataque
    const bonusAtaque = this.calcularBonusAtaque(atacante, arma);

    // Rolagem de ataque com vantagem/desvantagem
    const rolagemAtaque = this.rolarAtaque(bonusAtaque, vantagem, desvantagem);

    // Verifica se acertou
    const caAlvo = alvo.ca;
    const sucesso = rolagemAtaque.total >= caAlvo;
    const critico = rolagemAtaque.resultados.includes(20);
    const erroGrave = rolagemAtaque.resultados.includes(1);

    let dano = 0;
    let rolagemDano: ResultadoDados | undefined;
    let tipoDano = 'físico';

    if (sucesso && !erroGrave) {
      // Calcula dano
      const resultadoDano = this.calcularDano(atacante, arma, critico);
      dano = resultadoDano.dano;
      rolagemDano = resultadoDano.rolagem;
      tipoDano = resultadoDano.tipo;

      // Aplica dano ao alvo
      alvo.receberDano(dano);
    }

    const resultado: ResultadoAtaque = {
      sucesso: sucesso && !erroGrave,
      critico,
      erroGrave,
      dano,
      tipoDano,
      rolagemAtaque,
      rolagemDano,
      caAlvo,
      descricao: this.gerarDescricaoAtaque(
        atacante,
        alvo,
        sucesso,
        critico,
        erroGrave,
        dano,
        tipoDano,
        arma,
      ),
    };

    // Registra no histórico
    this.registrarAcao({
      atacante: atacante.id,
      alvo: alvo.id,
      tipo: 'ataque',
      arma: arma?.nome,
      resultado,
      timestamp: new Date(),
    });

    return resultado;
  }

  /**
   * Calcula bônus de ataque do personagem
   */
  private calcularBonusAtaque(atacante: Personagem, arma?: Arma): number {
    let bonus = atacante.bonusProficiencia; // Bônus de proficiência base

    if (arma) {
      // Usa o modificador apropriado (Força para armas corpo a corpo, Destreza para distância)
      if (arma.categoria === CategoriaArma.CORPO_A_CORPO) {
        bonus += atacante.getModificador('forca');
      } else if (arma.categoria === CategoriaArma.DISTANCIA) {
        bonus += atacante.getModificador('destreza');
      }

      // Adiciona bônus da arma
      bonus += arma.bonusAtaque;
    } else {
      // Ataque desarmado usa Força
      bonus += atacante.getModificador('forca');
    }

    return bonus;
  }

  /**
   * Executa rolagem de ataque considerando vantagem/desvantagem
   */
  private rolarAtaque(bonus: number, vantagem?: boolean, desvantagem?: boolean): ResultadoDados {
    if (vantagem && !desvantagem) {
      // Vantagem: rola 2d20 e pega o maior
      const rolagem1 = Dados.rolar(`d20+${bonus}`);
      const rolagem2 = Dados.rolar(`d20+${bonus}`);
      return rolagem1.total >= rolagem2.total ? rolagem1 : rolagem2;
    } else if (desvantagem && !vantagem) {
      // Desvantagem: rola 2d20 e pega o menor
      const rolagem1 = Dados.rolar(`d20+${bonus}`);
      const rolagem2 = Dados.rolar(`d20+${bonus}`);
      return rolagem1.total <= rolagem2.total ? rolagem1 : rolagem2;
    } else {
      // Normal: rola 1d20
      return Dados.rolar(`d20+${bonus}`);
    }
  }

  /**
   * Calcula dano do ataque
   */
  private calcularDano(
    atacante: Personagem,
    arma?: Arma,
    critico: boolean = false,
  ): {
    dano: number;
    rolagem: ResultadoDados;
    tipo: string;
  } {
    let dadoDano = '1d4'; // Dano desarmado padrão
    let bonusDano = atacante.getModificador('forca');
    let tipoDano = 'físico';

    if (arma) {
      dadoDano = arma.dano;
      bonusDano += arma.bonusDano;
      tipoDano = arma.tipoDano;

      // Para armas de destreza, usa modificador de destreza
      if (arma.categoria === CategoriaArma.DISTANCIA) {
        bonusDano =
          bonusDano - atacante.getModificador('forca') + atacante.getModificador('destreza');
      }
    }

    const rolagem = critico
      ? (arma?.calcularDanoCritico(bonusDano) ?? Dados.rolar(`2d4+${bonusDano}`))
      : Dados.rolar(`${dadoDano}+${bonusDano}`);

    return {
      dano: Math.max(1, rolagem.total), // Dano mínimo 1
      rolagem,
      tipo: tipoDano,
    };
  }

  /**
   * Sistema de defesa ativa
   */
  defender(
    defensor: Personagem,
    tipoDefesa: 'esquiva' | 'bloqueio' | 'aparar' = 'esquiva',
  ): ResultadoDefesa {
    let sucesso = false;
    let rolagemDefesa: ResultadoDados | undefined;
    let danoReduzido = 0;

    switch (tipoDefesa) {
      case 'esquiva':
        // Teste de Destreza para esquivar
        rolagemDefesa = Dados.rolar(`d20+${defensor.getModificador('destreza')}`);
        sucesso = rolagemDefesa.total >= 15; // CD 15 para esquiva
        break;

      case 'bloqueio':
        // Requer escudo - adiciona bônus de CA temporário
        sucesso = true;
        danoReduzido = 2; // Escudo reduz 2 pontos de dano
        break;

      case 'aparar': {
        // Requer arma - teste de ataque contra ataque
        const armaEquipada = defensor.obterArmaEquipada();
        if (armaEquipada) {
          // Se tem arma, pode tentar aparar (teste de ataque)
          rolagemDefesa = Dados.rolar(`d20+${defensor.getModificador('forca')}`);
          sucesso = rolagemDefesa.total >= 15; // CD 15 para aparar
        } else {
          sucesso = false; // Não pode aparar sem arma
        }
        break;
      }
    }

    const resultado: ResultadoDefesa = {
      sucesso,
      tipo: tipoDefesa,
      rolagemDefesa,
      danoReduzido,
      descricao: this.gerarDescricaoDefesa(defensor, tipoDefesa, sucesso),
    };

    return resultado;
  }

  /**
   * Calcula iniciativa para combate
   */
  calcularIniciativa(personagem: Personagem): number {
    const rolagem = Dados.rolar(`d20+${personagem.getModificador('destreza')}`);
    return rolagem.total;
  }

  /**
   * Ordena personagens por iniciativa
   */
  ordernarIniciativa(
    personagens: Personagem[],
  ): Array<{ personagem: Personagem; iniciativa: number }> {
    const iniciativas = personagens.map((p) => ({
      personagem: p,
      iniciativa: this.calcularIniciativa(p),
    }));

    return iniciativas.sort((a, b) => b.iniciativa - a.iniciativa);
  }

  /**
   * Verifica se personagem pode atacar alvo
   */
  podeAtacar(atacante: Personagem, alvo: Personagem): boolean {
    // Verificações básicas
    if (atacante.id === alvo.id) return false;
    if (atacante.hp <= 0) return false;
    if (alvo.hp <= 0) return false;

    // TODO: Verificar distância quando implementarmos mapas
    // Por enquanto, assume que todos estão em alcance
    return true;
  }

  /**
   * Gera descrição narrativa do ataque
   */
  private gerarDescricaoAtaque(
    atacante: Personagem,
    alvo: Personagem,
    sucesso: boolean,
    critico: boolean,
    erroGrave: boolean,
    dano: number,
    tipoDano: string,
    arma?: Arma,
  ): string {
    const nomeArma = arma?.nome ?? 'punhos';

    if (erroGrave) {
      return `${atacante.nome} erra completamente o ataque com ${nomeArma} contra ${alvo.nome}!`;
    }

    if (!sucesso) {
      return `${atacante.nome} ataca ${alvo.nome} com ${nomeArma}, mas o ataque é bloqueado ou desviado.`;
    }

    if (critico) {
      return `${atacante.nome} acerta um GOLPE CRÍTICO em ${alvo.nome} com ${nomeArma}, causando ${dano} pontos de dano ${tipoDano}!`;
    }

    return `${atacante.nome} ataca ${alvo.nome} com ${nomeArma}, causando ${dano} pontos de dano ${tipoDano}.`;
  }

  /**
   * Gera descrição narrativa da defesa
   */
  private gerarDescricaoDefesa(
    defensor: Personagem,
    tipo: 'esquiva' | 'bloqueio' | 'aparar',
    sucesso: boolean,
  ): string {
    const acao = tipo === 'esquiva' ? 'esquivar' : tipo === 'bloqueio' ? 'bloquear' : 'aparar';

    if (sucesso) {
      return `${defensor.nome} consegue ${acao} o ataque!`;
    } else {
      return `${defensor.nome} tenta ${acao}, mas não consegue evitar o ataque.`;
    }
  }

  /**
   * Registra ação no histórico
   */
  private registrarAcao(acao: AcaoCombate): void {
    this.historicoCombate.push(acao);
  }

  /**
   * Obtém histórico de combate
   */
  getHistoricoCombate(): AcaoCombate[] {
    return [...this.historicoCombate];
  }

  /**
   * Limpa histórico de combate
   */
  limparHistorico(): void {
    this.historicoCombate = [];
  }

  /**
   * Obtém estatísticas do combate atual
   */
  getEstatisticasCombate(): {
    totalAtaques: number;
    ataquesCriticos: number;
    taxaAcerto: number;
    danoTotalCausado: number;
  } {
    const ataques = this.historicoCombate.filter((a) => a.tipo === 'ataque');
    const totalAtaques = ataques.length;
    const ataquesComSucesso = ataques.filter((a) => (a.resultado as ResultadoAtaque).sucesso);
    const ataquesCriticos = ataques.filter((a) => (a.resultado as ResultadoAtaque).critico);
    const danoTotal = ataques.reduce(
      (total, a) => total + (a.resultado as ResultadoAtaque).dano,
      0,
    );

    return {
      totalAtaques,
      ataquesCriticos: ataquesCriticos.length,
      taxaAcerto: totalAtaques > 0 ? (ataquesComSucesso.length / totalAtaques) * 100 : 0,
      danoTotalCausado: danoTotal,
    };
  }

  /**
   * Conjura uma magia em combate
   */
  conjurarMagia(
    conjurador: Personagem,
    magia: Magia,
    alvos: Personagem[],
    nivelConjurado?: number,
  ): ResultadoAtaqueMagia {
    const nivel = nivelConjurado || magia.nivel;

    // Calcula CD da salvaguarda se a magia tiver
    const cdSalvaguarda = magia.cdSalvaguarda || this.calcularCDSalvaguarda(conjurador, magia);

    let resultado: ResultadoAtaqueMagia = {
      sucesso: true,
      critico: false,
      dano: 0,
      tipoDano: '',
      efeitosAdicionais: [],
      descricao: '',
    };

    // Processa cada efeito da magia
    for (const efeito of magia.efeitos) {
      if (efeito.tipo === 'dano') {
        resultado = this.processarDanoMagia(magia, efeito, alvos, nivel, cdSalvaguarda, resultado);
      } else if (efeito.tipo === 'cura') {
        resultado = this.processarCuraMagia(magia, efeito, alvos, nivel, resultado);
      } else {
        resultado.efeitosAdicionais.push(efeito.descricao);
      }
    }

    // Registra no histórico
    this.registrarAcao({
      atacante: conjurador.id,
      alvo: alvos.map((a) => a.id).join(', '),
      tipo: 'magia',
      arma: magia.nome,
      resultado,
      timestamp: new Date(),
    });

    return resultado;
  }

  /**
   * Calcula CD de salvaguarda para uma magia
   */
  private calcularCDSalvaguarda(conjurador: Personagem, magia: Magia): number {
    // CD = 8 + bônus proficiência + modificador do atributo de conjuração
    const bonusProficiencia = conjurador.bonusProficiencia;

    // Determina atributo de conjuração baseado na classe (simplificado)
    let modificadorConjuracao = 0;
    if (magia.classes.includes('Mago') || magia.classes.includes('Artífice')) {
      modificadorConjuracao = conjurador.getModificador('inteligencia');
    } else if (magia.classes.includes('Clérigo') || magia.classes.includes('Druida')) {
      modificadorConjuracao = conjurador.getModificador('sabedoria');
    } else if (magia.classes.includes('Feiticeiro') || magia.classes.includes('Bardo')) {
      modificadorConjuracao = conjurador.getModificador('carisma');
    }

    return 8 + bonusProficiencia + modificadorConjuracao;
  }

  /**
   * Processa dano de magia
   */
  private processarDanoMagia(
    magia: Magia,
    efeito: EfeitoMagia,
    alvos: Personagem[],
    nivel: number,
    cdSalvaguarda: number,
    resultado: ResultadoAtaqueMagia,
  ): ResultadoAtaqueMagia {
    if (!efeito.dados) return resultado;

    // Rola dano base
    const rolagemDano = Dados.rolar(efeito.dados);
    let danoBase = rolagemDano.total;

    // Aplica escalamento por nível se necessário
    if (nivel > magia.nivel) {
      const niveisExtras = nivel - magia.nivel;
      // Simplificado: +1d6 por nível extra para truques, ou dados extras conforme a magia
      if (magia.nivel === 0) {
        // Truques escalam com nível do personagem
        danoBase += niveisExtras * 6; // Simplificado
      }
    }

    resultado.dano = danoBase;
    resultado.tipoDano = efeito.tipo;
    resultado.rolagemDano = rolagemDano;

    // Processa salvaguarda se houver
    if (magia.salvaguarda && magia.salvaguarda !== TipoSalvaguarda.NENHUM) {
      const salvaguardas = alvos.map((alvo) => {
        const rolagem = this.rolarSalvaguarda(alvo, magia.salvaguarda);
        return {
          personagemId: alvo.id,
          sucesso: rolagem.total >= cdSalvaguarda,
          rolagem,
        };
      });

      resultado.salvaguarda = {
        tipo: magia.salvaguarda,
        cd: cdSalvaguarda,
        sucessos: salvaguardas,
      };

      // Reduz dano pela metade em salvaguardas bem-sucedidas (padrão D&D)
      resultado.dano = Math.floor(danoBase / 2); // Aplicado aos que passaram na salvaguarda
    }

    resultado.descricao = this.gerarDescricaoMagia(magia, efeito, resultado);
    return resultado;
  }

  /**
   * Processa cura de magia
   */
  private processarCuraMagia(
    magia: Magia,
    efeito: EfeitoMagia,
    alvos: Personagem[],
    nivel: number,
    resultado: ResultadoAtaqueMagia,
  ): ResultadoAtaqueMagia {
    if (!efeito.dados) return resultado;

    const rolagemCura = Dados.rolar(efeito.dados);
    let curaBase = rolagemCura.total;

    // Escalamento por nível
    if (nivel > magia.nivel) {
      const niveisExtras = nivel - magia.nivel;
      curaBase += niveisExtras * 4; // Simplificado: +4 HP por nível extra
    }

    resultado.dano = -curaBase; // Valor negativo indica cura
    resultado.tipoDano = 'cura';
    resultado.rolagemDano = rolagemCura;
    resultado.descricao = this.gerarDescricaoMagia(magia, efeito, resultado);

    return resultado;
  }

  /**
   * Rola salvaguarda para um personagem
   */
  private rolarSalvaguarda(personagem: Personagem, tipo: TipoSalvaguarda): ResultadoDados {
    // Mapear tipo de salvaguarda para string compatível com getModificador
    const atributoMap: Record<string, string> = {
      [TipoSalvaguarda.FORCA]: 'forca',
      [TipoSalvaguarda.DESTREZA]: 'destreza',
      [TipoSalvaguarda.CONSTITUICAO]: 'constituicao',
      [TipoSalvaguarda.INTELIGENCIA]: 'inteligencia',
      [TipoSalvaguarda.SABEDORIA]: 'sabedoria',
      [TipoSalvaguarda.CARISMA]: 'carisma',
    };

    const atributo = atributoMap[tipo] || 'forca';
    const modificador = personagem.getModificador(
      atributo as 'forca' | 'destreza' | 'constituicao' | 'inteligencia' | 'sabedoria' | 'carisma',
    );
    return Dados.rolar(`1d20+${modificador}`);
  }

  /**
   * Gera descrição para conjuração de magia
   */
  private gerarDescricaoMagia(
    magia: Magia,
    efeito: EfeitoMagia,
    resultado: ResultadoAtaqueMagia,
  ): string {
    let descricao = `${magia.nome}: ${efeito.descricao}`;

    if (resultado.dano > 0) {
      descricao += ` Causa ${resultado.dano} de dano (${resultado.tipoDano}).`;
    } else if (resultado.dano < 0) {
      descricao += ` Restaura ${Math.abs(resultado.dano)} pontos de vida.`;
    }

    if (resultado.salvaguarda) {
      const sucessos = resultado.salvaguarda.sucessos.filter((s) => s.sucesso).length;
      const total = resultado.salvaguarda.sucessos.length;
      descricao += ` Salvaguarda ${resultado.salvaguarda.tipo} CD ${resultado.salvaguarda.cd}: ${sucessos}/${total} sucessos.`;
    }

    return descricao;
  }
}
