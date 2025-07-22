import type { Item_Data } from './Item_Data';
import type { RaridadeItem } from '../../../types';

export enum CategoriaArma {
  CORPO_A_CORPO = 'corpo-a-corpo',
  DISTANCIA = 'distancia',
  ARREMESSO = 'arremesso',
}

export enum TipoDano {
  CORTANTE = 'cortante',
  PERFURANTE = 'perfurante',
  CONTUNDENTE = 'contundente',
  ACIDO = 'acido',
  FRIO = 'frio',
  FOGO = 'fogo',
  FORCA = 'forca',
  RELAMPAGO = 'relampago',
  NECROTICO = 'necrotico',
  VENENO = 'veneno',
  PSIQUICO = 'psiquico',
  RADIANTE = 'radiante',
  TROVAO = 'trovao',
}

export enum PropriedadeArma {
  LEVE = 'leve',
  PESADA = 'pesada',
  VERSATIL = 'versatil',
  SUTIL = 'sutil',
  ALCANCE = 'alcance',
  ARREMESSO = 'arremesso',
  MUNICAO = 'municao',
  RECARGA = 'recarga',
  ESPECIAL = 'especial',
}

/**
 * Interface para dados de persistência da Arma
 */
export interface Arma_Data extends Item_Data {
  categoria: CategoriaArma;
  dano: string; // Ex: "1d8", "2d6+1"
  tipoDano: TipoDano;
  alcance: number; // Em metros
  propriedadesArma: PropriedadeArma[];
  critico: number; // Multiplicador crítico (padrão 2)
  bonusAtaque?: number; // Para armas mágicas
  bonusDano?: number; // Para armas mágicas
}

/**
 * Configuração para criação de Arma via factory
 */
export interface ArmaConfig {
  id?: string;
  nome: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  imagemUrl?: string;
  categoria: CategoriaArma;
  dano: string;
  tipoDano: TipoDano;
  alcance: number;
  propriedades: PropriedadeArma[];
  critico?: number;
  bonusAtaque?: number;
  bonusDano?: number;
}
