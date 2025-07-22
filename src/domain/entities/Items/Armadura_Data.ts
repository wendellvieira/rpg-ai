import type { Item_Data } from './Item_Data';
import type { RaridadeItem } from '../../../types';

export enum TipoArmadura {
  LEVE = 'leve',
  MEDIA = 'media',
  PESADA = 'pesada',
  ESCUDO = 'escudo',
}

export enum LocalArmadura {
  CORPO = 'corpo',
  CABECA = 'cabeca',
  BRACOS = 'bracos',
  PERNAS = 'pernas',
  PES = 'pes',
  MAOS = 'maos',
  ESCUDO = 'escudo',
}

/**
 * Interface para dados de persistência da Armadura
 */
export interface Armadura_Data extends Item_Data {
  tipoArmadura: TipoArmadura;
  local: LocalArmadura;
  classeArmadura: number;
  modMaxDes: number | null; // Modificador máximo de Destreza (null = sem limite)
  penalidade: number; // Penalidade em perícias baseadas em Destreza
  bonusCA?: number; // Para armaduras mágicas
  resistencias?: string[]; // Resistências a tipos de dano
}

/**
 * Configuração para criação de Armadura via factory
 */
export interface ArmaduraConfig {
  id?: string;
  nome: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  imagemUrl?: string;
  tipoArmadura: TipoArmadura;
  local: LocalArmadura;
  classeArmadura: number;
  modMaxDes?: number | null;
  penalidade?: number;
  bonusCA?: number;
  resistencias?: string[];
}
