// Tipos básicos para os atributos D&D
export interface AtributosPrimarios {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
}

export interface AtributosDerivados {
  hp: number;
  hpMaximo: number;
  mp: number;
  mpMaximo: number;
  ca: number; // Classe de Armadura
  iniciativa: number;
  velocidade: number;
}

export type AtributoTipo = keyof AtributosPrimarios;

// Tipos para o sistema de dados
export interface ResultadoDados {
  tipo: string; // Ex: "1d20", "2d6+3"
  resultados: number[];
  total: number;
  modificador: number;
  critico: boolean;
}

// Tipos para perícias
export interface Pericia {
  nome: string;
  atributoBase: AtributoTipo;
  proficiente: boolean;
  especialista: boolean; // Dobra proficiência
}

// Tipos para raças e classes
export interface ModificadorRaca {
  atributos: Partial<AtributosPrimarios>;
  habilidadesEspeciais: string[];
  pericias?: string[];
  resistencias?: string[];
}

export interface ModificadorClasse {
  dadoVida: number; // d6, d8, d10, d12
  proficienciaArmadura: string[];
  proficienciaArma: string[];
  pericias: string[];
  magias?: boolean;
  slotsMagia?: number[];
}

// Tipos para o sistema de turnos
export interface TurnoInfo {
  personagemId: string;
  ordem: number;
  jaAgiu: boolean;
  acoesPendentes: string[];
}

// Tipos para mensagens do chat
export type TipoMensagem = 'fala' | 'acao' | 'sistema' | 'mestre';

export interface MensagemBase {
  id: string;
  tipo: TipoMensagem;
  timestamp: Date;
  turno: number;
  rodada: number;
}

export interface MensagemFala extends MensagemBase {
  tipo: 'fala';
  personagem: string;
  conteudo: string;
}

export interface MensagemAcao extends MensagemBase {
  tipo: 'acao';
  personagem: string;
  acao: string;
  resultado: string;
  dados?: ResultadoDados;
  sucesso: boolean;
}

export interface MensagemSistema extends MensagemBase {
  tipo: 'sistema';
  conteudo: string;
}

export interface MensagemMestre extends MensagemBase {
  tipo: 'mestre';
  conteudo: string;
  personagem?: string; // Se o mestre está personificando alguém
}

export type Mensagem = MensagemFala | MensagemAcao | MensagemSistema | MensagemMestre;

// Tipos para conhecimento e eventos
export interface EventoPersonagem {
  id: string;
  resumo: string;
  timestamp: Date;
  turno: number;
  importancia: 'baixa' | 'media' | 'alta';
}

export interface ConhecimentoPersonagem {
  id: string;
  topico: string;
  conteudo: string;
  categoria: string;
  criadoEm: Date;
  fonte: 'inicial' | 'descoberto' | 'aprendido';
}

// Enums úteis
export enum StatusPersonagem {
  ATIVO = 'ativo',
  MORTO = 'morto',
  INCONSCIENTE = 'inconsciente',
  PETRIFICADO = 'petrificado',
  PARALIZADO = 'paralizado'
}

export enum TipoItem {
  ARMA = 'arma',
  ARMADURA = 'armadura',
  ESCUDO = 'escudo',
  CONSUMIVEL = 'consumivel',
  MAGICO = 'magico',
  FERRAMENTA = 'ferramenta',
  TESOURO = 'tesouro',
  OUTRO = 'outro'
}

export enum RaridadeItem {
  COMUM = 'comum',
  INCOMUM = 'incomum',
  RARO = 'raro',
  MUITO_RARO = 'muito-raro',
  LENDARIO = 'lendario',
  ARTEFATO = 'artefato'
}
