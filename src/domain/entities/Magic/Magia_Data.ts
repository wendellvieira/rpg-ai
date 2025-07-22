import type { Item_Data } from '../Items/Item_Data';
import type { RaridadeItem } from '../../../types';

export enum EscolaMagia {
  ABJURACAO = 'abjuracao',
  ADIVINHACAO = 'adivinhacao',
  ENCANTAMENTO = 'encantamento',
  EVOCACAO = 'evocacao',
  ILUSAO = 'ilusao',
  INVOCACAO = 'invocacao',
  NECROMANCIA = 'necromancia',
  TRANSMUTACAO = 'transmutacao',
}

export enum ComponenteMagia {
  VERBAL = 'verbal',
  SOMATICO = 'somatico',
  MATERIAL = 'material',
}

export enum DuracaoMagia {
  INSTANTANEO = 'instantaneo',
  CONCENTRACAO = 'concentracao',
  PERMANENTE = 'permanente',
}

export enum TipoAlvo {
  PESSOAL = 'pessoal',
  CRIATURA = 'criatura',
  OBJETO = 'objeto',
  AREA = 'area',
  PONTO = 'ponto',
}

export enum TipoSalvaguarda {
  FORTITUDE = 'fortitude',
  REFLEXO = 'reflexo',
  VONTADE = 'vontade',
  NENHUMA = 'nenhuma',
}

/**
 * Interface para dados de persistência da Magia
 */
export interface Magia_Data extends Item_Data {
  escola: EscolaMagia;
  nivel: number; // 0-9 (0 = truque)
  tempoConjuracao: string; // Ex: "1 ação", "1 minuto"
  alcance: string; // Ex: "Toque", "30 metros", "Ilimitado"
  componentes: ComponenteMagia[];
  componenteMaterial?: string; // Descrição do componente material
  duracao: DuracaoMagia;
  duracaoDetalhada: string; // Ex: "Até 1 minuto", "1 hora"
  alvo: TipoAlvo;
  salvaguarda: TipoSalvaguarda;
  resisteMagia: boolean;
  dano?: string; // Ex: "1d6", "2d8+mod"
  area?: string; // Ex: "Esfera de 6 metros"
  efeito: string; // Descrição dos efeitos
  nivelSuperior?: string; // Efeitos em níveis superiores
  preparada: boolean; // Se a magia está preparada
  conjurada: boolean; // Se já foi conjurada hoje
}

/**
 * Configuração para criação de Magia via factory
 */
export interface MagiaConfig {
  id?: string;
  nome: string;
  descricao: string;
  valor?: number;
  peso?: number;
  raridade?: RaridadeItem;
  magico?: boolean;
  imagemUrl?: string;
  escola: EscolaMagia;
  nivel: number;
  tempoConjuracao: string;
  alcance: string;
  componentes: ComponenteMagia[];
  componenteMaterial?: string;
  duracao: DuracaoMagia;
  duracaoDetalhada: string;
  alvo: TipoAlvo;
  salvaguarda?: TipoSalvaguarda;
  resisteMagia?: boolean;
  dano?: string;
  area?: string;
  efeito: string;
  nivelSuperior?: string;
  preparada?: boolean;
  conjurada?: boolean;
}
