import { Dados } from './Dados';
import type { ResultadoDados } from '../types';

/**
 * Interface para resultados de ataques básicos
 */
export interface ResultadoCombateBasico {
  sucesso: boolean;
  critico: boolean;
  dano: number;
  descricao: string;
  rolagemAtaque: ResultadoDados;
  rolagemDano: ResultadoDados;
}

/**
 * Interface para informações básicas de personagem para combate
 */
export interface PersonagemCombate {
  id: string;
  nome: string;
  hp: number;
  hpMaximo: number;
  ca: number;
  modificadorForca: number;
  modificadorDestreza: number;
}

/**
 * Sistema básico de combate simplificado
 */
export class CombateSimples {
  /**
   * Executa um ataque básico entre dois personagens
   */
  static atacar(
    atacante: PersonagemCombate,
    alvo: PersonagemCombate,
    bonusAtaque: number = 0,
    dadoDano: string = '1d6',
    vantagem: boolean = false,
    desvantagem: boolean = false,
  ): ResultadoCombateBasico {
    // Rolagem de ataque
    let rolagemAtaque = Dados.rolar(`d20+${bonusAtaque}`);

    // Aplica vantagem/desvantagem
    if (vantagem && !desvantagem) {
      const segundaRolagem = Dados.rolar(`d20+${bonusAtaque}`);
      rolagemAtaque = rolagemAtaque.total >= segundaRolagem.total ? rolagemAtaque : segundaRolagem;
    } else if (desvantagem && !vantagem) {
      const segundaRolagem = Dados.rolar(`d20+${bonusAtaque}`);
      rolagemAtaque = rolagemAtaque.total <= segundaRolagem.total ? rolagemAtaque : segundaRolagem;
    }

    const sucesso = rolagemAtaque.total >= alvo.ca;
    const critico = rolagemAtaque.resultados.includes(20);

    let dano = 0;
    let rolagemDano: ResultadoDados = {
      tipo: '0',
      resultados: [0],
      total: 0,
      modificador: 0,
      critico: false,
    };

    if (sucesso) {
      // Rolagem de dano
      rolagemDano = Dados.rolar(dadoDano);
      dano = rolagemDano.total;

      // Dano crítico (dobra os dados)
      if (critico) {
        const danoExtra = Dados.rolar(dadoDano);
        dano += danoExtra.total;
      }

      // Dano mínimo 1
      dano = Math.max(1, dano);
    }

    const descricao = this.gerarDescricao(atacante, alvo, sucesso, critico, dano);

    return {
      sucesso,
      critico,
      dano,
      descricao,
      rolagemAtaque,
      rolagemDano,
    };
  }

  /**
   * Calcula iniciativa para um personagem
   */
  static calcularIniciativa(modificadorDestreza: number): number {
    const rolagem = Dados.rolar(`d20+${modificadorDestreza}`);
    return rolagem.total;
  }

  /**
   * Gera descrição narrativa do ataque
   */
  private static gerarDescricao(
    atacante: PersonagemCombate,
    alvo: PersonagemCombate,
    sucesso: boolean,
    critico: boolean,
    dano: number,
  ): string {
    if (!sucesso) {
      return `${atacante.nome} ataca ${alvo.nome}, mas o ataque falha!`;
    }

    if (critico) {
      return `${atacante.nome} acerta um GOLPE CRÍTICO em ${alvo.nome}, causando ${dano} pontos de dano!`;
    }

    return `${atacante.nome} ataca ${alvo.nome} com sucesso, causando ${dano} pontos de dano.`;
  }

  /**
   * Aplica dano a um personagem
   */
  static aplicarDano(personagem: PersonagemCombate, dano: number): PersonagemCombate {
    const novoHp = Math.max(0, personagem.hp - dano);
    return { ...personagem, hp: novoHp };
  }

  /**
   * Aplica cura a um personagem
   */
  static aplicarCura(personagem: PersonagemCombate, cura: number): PersonagemCombate {
    const novoHp = Math.min(personagem.hpMaximo, personagem.hp + cura);
    return { ...personagem, hp: novoHp };
  }
}
