import type { Item_Data } from './Item_Data';
import type { RaridadeItem } from '../../../types';

export enum TipoConsumivel {
  POCAO = 'pocao',
  PERGAMINHO = 'pergaminho',
  MUNICAO = 'municao',
  ALIMENTO = 'alimento',
  FERRAMENTA = 'ferramenta',
  OUTRO = 'outro',
}

export enum EfeitoConsumivel {
  CURA = 'cura',
  MANA = 'mana',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  DANO = 'dano',
  UTILIDADE = 'utilidade',
}

/**
 * Interface para dados de persistência do Consumivel
 */
export interface Consumivel_Data extends Item_Data {
  tipoConsumivel: TipoConsumivel;
  efeito: EfeitoConsumivel;
  potencia: number; // Valor do efeito (ex: quantidade de cura)
  duracao: number; // Duração em turnos (0 = instantâneo)
  usos: number; // Número de usos restantes
  usosMaximos: number; // Número máximo de usos
  tempoRecarga?: number; // Tempo de recarga em segundos (opcional)
}

/**
 * Configuração para criação de Consumivel via factory
 */
export interface ConsumivelConfig {
  id?: string;
  nome: string;
  descricao: string;
  valor: number;
  peso: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  imagemUrl?: string;
  tipoConsumivel: TipoConsumivel;
  efeito: EfeitoConsumivel;
  potencia: number;
  duracao?: number;
  usos?: number;
  usosMaximos?: number;
  tempoRecarga?: number;
}
