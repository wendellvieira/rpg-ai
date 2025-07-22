// Re-exports dos tipos necessários
import type {
  AtributosPrimarios,
  AtributosDerivados,
  EventoPersonagem,
  ConhecimentoPersonagem,
} from '../../../types';

import type { StatusPersonagem } from '../../../types';

// Interface para dados de persistência do Personagem
export interface Personagem_Data {
  id: string;
  nome: string;
  raca: string;
  classe: string;
  nivel: number;
  isIA: boolean;
  promptPersonalidade?: string;
  descricao: string;
  atributos: {
    primarios: AtributosPrimarios;
    derivados: AtributosDerivados;
    nivel: number;
  };
  inventario: [string, number][];
  equipamentos: [string, string][];
  eventos: EventoPersonagem[];
  conhecimentos: ConhecimentoPersonagem[];
  status: StatusPersonagem;
  experiencia: number;
}

// Re-exports dos tipos necessários
export type {
  AtributosPrimarios,
  AtributosDerivados,
  EventoPersonagem,
  ConhecimentoPersonagem,
} from '../../../types';

export { StatusPersonagem } from '../../../types';
