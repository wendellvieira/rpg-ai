import { Item } from '../Items/Item';
import type { Magia_Data, MagiaConfig } from './Magia_Data';
import {
  EscolaMagia,
  ComponenteMagia,
  DuracaoMagia,
  TipoAlvo,
  TipoSalvaguarda,
} from './Magia_Data';
import { TipoItem, RaridadeItem } from '../../../types';
import { riid } from '../../../utils/riid';

// Re-export das enums e tipos para uso externo
export {
  EscolaMagia,
  ComponenteMagia,
  DuracaoMagia,
  TipoAlvo,
  TipoSalvaguarda,
} from './Magia_Data';

/**
 * Classe para magias
 * Implementa o padrão Factory para criação de instâncias
 */
export class Magia extends Item {
  // ✅ OBRIGATÓRIO: Propriedade data tipada
  public override data: Magia_Data | null = null;

  protected constructor() {
    super();
  }

  // ✅ MÉTODOS ESPECÍFICOS DA MAGIA
  static createMagia(data: Magia_Data): Magia {
    const magia = new Magia();
    magia.data = data;
    return magia;
  }

  static createMagiaFromConfig(config: MagiaConfig): Magia {
    const data: Magia_Data = {
      id: config.id || riid(),
      nome: config.nome,
      tipo: TipoItem.OUTRO, // Será TipoItem.MAGIA quando disponível
      descricao: config.descricao,
      valor: config.valor || 0,
      peso: config.peso || 0,
      raridade: config.raridade || RaridadeItem.COMUM,
      magico: config.magico || true,
      propriedades: {
        escola: config.escola,
        nivel: config.nivel,
        tempoConjuracao: config.tempoConjuracao,
        alcance: config.alcance,
        componentes: config.componentes,
        duracao: config.duracao,
        duracaoDetalhada: config.duracaoDetalhada,
        alvo: config.alvo,
        salvaguarda: config.salvaguarda || TipoSalvaguarda.NENHUMA,
        resisteMagia: config.resisteMagia || false,
        efeito: config.efeito,
        preparada: config.preparada || false,
        conjurada: config.conjurada || false,
        ...(config.componenteMaterial && { componenteMaterial: config.componenteMaterial }),
        ...(config.dano && { dano: config.dano }),
        ...(config.area && { area: config.area }),
        ...(config.nivelSuperior && { nivelSuperior: config.nivelSuperior }),
      },
      ...(config.imagemUrl && { imagemUrl: config.imagemUrl }),
      // Propriedades específicas da magia
      escola: config.escola,
      nivel: config.nivel,
      tempoConjuracao: config.tempoConjuracao,
      alcance: config.alcance,
      componentes: config.componentes,
      duracao: config.duracao,
      duracaoDetalhada: config.duracaoDetalhada,
      alvo: config.alvo,
      salvaguarda: config.salvaguarda || TipoSalvaguarda.NENHUMA,
      resisteMagia: config.resisteMagia || false,
      efeito: config.efeito,
      preparada: config.preparada || false,
      conjurada: config.conjurada || false,
      ...(config.componenteMaterial && { componenteMaterial: config.componenteMaterial }),
      ...(config.dano && { dano: config.dano }),
      ...(config.area && { area: config.area }),
      ...(config.nivelSuperior && { nivelSuperior: config.nivelSuperior }),
    };

    return Magia.createMagia(data);
  }

  static createEmptyMagia(): Magia {
    const data: Magia_Data = {
      id: riid(),
      nome: '',
      tipo: TipoItem.OUTRO, // Será TipoItem.MAGIA quando disponível
      descricao: '',
      valor: 0,
      peso: 0,
      raridade: RaridadeItem.COMUM,
      magico: true,
      propriedades: {},
      escola: EscolaMagia.EVOCACAO,
      nivel: 0,
      tempoConjuracao: '1 ação',
      alcance: 'Toque',
      componentes: [ComponenteMagia.VERBAL],
      duracao: DuracaoMagia.INSTANTANEO,
      duracaoDetalhada: 'Instantâneo',
      alvo: TipoAlvo.CRIATURA,
      salvaguarda: TipoSalvaguarda.NENHUMA,
      resisteMagia: false,
      efeito: '',
      preparada: false,
      conjurada: false,
    };

    return Magia.createMagia(data);
  }

  // ✅ PERMITIDO: Propriedades calculadas/getters
  get escola(): EscolaMagia {
    return this.data?.escola || EscolaMagia.EVOCACAO;
  }

  get nivel(): number {
    return this.data?.nivel || 0;
  }

  get tempoConjuracao(): string {
    return this.data?.tempoConjuracao || '1 ação';
  }

  get alcance(): string {
    return this.data?.alcance || 'Toque';
  }

  get componentes(): ComponenteMagia[] {
    return this.data?.componentes || [];
  }

  get componenteMaterial(): string | undefined {
    return this.data?.componenteMaterial;
  }

  get duracao(): DuracaoMagia {
    return this.data?.duracao || DuracaoMagia.INSTANTANEO;
  }

  get duracaoDetalhada(): string {
    return this.data?.duracaoDetalhada || 'Instantâneo';
  }

  get alvo(): TipoAlvo {
    return this.data?.alvo || TipoAlvo.CRIATURA;
  }

  get salvaguarda(): TipoSalvaguarda {
    return this.data?.salvaguarda || TipoSalvaguarda.NENHUMA;
  }

  get resisteMagia(): boolean {
    return this.data?.resisteMagia || false;
  }

  get dano(): string | undefined {
    return this.data?.dano;
  }

  get area(): string | undefined {
    return this.data?.area;
  }

  get efeito(): string {
    return this.data?.efeito || '';
  }

  get nivelSuperior(): string | undefined {
    return this.data?.nivelSuperior;
  }

  get preparada(): boolean {
    return this.data?.preparada || false;
  }

  get conjurada(): boolean {
    return this.data?.conjurada || false;
  }

  /**
   * Verifica se a magia pode ser usada
   */
  podeUsar(): boolean {
    return this.preparada && !this.conjurada;
  }

  /**
   * Conjura a magia
   */
  usar(usuarioId: string, alvoId?: string): { sucesso: boolean; mensagem: string } {
    if (!this.podeUsar()) {
      if (!this.preparada) {
        return {
          sucesso: false,
          mensagem: `${this.nome} não está preparada.`,
        };
      }
      if (this.conjurada) {
        return {
          sucesso: false,
          mensagem: `${this.nome} já foi conjurada hoje.`,
        };
      }
    }

    // Marcar como conjurada
    if (this.data) {
      this.data.conjurada = true;
    }

    let mensagem = `${usuarioId} conjurou ${this.nome}`;
    if (alvoId) {
      mensagem += ` em ${alvoId}`;
    }

    // Adicionar informações dos efeitos
    if (this.dano) {
      mensagem += ` (${this.dano} de dano)`;
    }

    if (this.salvaguarda !== TipoSalvaguarda.NENHUMA) {
      mensagem += ` (salvaguarda: ${this.salvaguarda})`;
    }

    return {
      sucesso: true,
      mensagem: mensagem + '.',
    };
  }

  /**
   * Prepara a magia
   */
  preparar(): void {
    if (this.data) {
      this.data.preparada = true;
      this.data.conjurada = false;
    }
  }

  /**
   * Remove a preparação da magia
   */
  despreparar(): void {
    if (this.data) {
      this.data.preparada = false;
      this.data.conjurada = false;
    }
  }

  /**
   * Reseta o status de conjuração (descanso longo)
   */
  resetarConjuracao(): void {
    if (this.data) {
      this.data.conjurada = false;
    }
  }

  /**
   * Verifica se é um truque (nível 0)
   */
  isTruque(): boolean {
    return this.nivel === 0;
  }

  /**
   * Verifica se requer concentração
   */
  requerConcentracao(): boolean {
    return this.duracao === DuracaoMagia.CONCENTRACAO;
  }

  /**
   * Verifica se tem componente verbal
   */
  temComponenteVerbal(): boolean {
    return this.componentes.includes(ComponenteMagia.VERBAL);
  }

  /**
   * Verifica se tem componente somático
   */
  temComponenteSomatico(): boolean {
    return this.componentes.includes(ComponenteMagia.SOMATICO);
  }

  /**
   * Verifica se tem componente material
   */
  temComponenteMaterial(): boolean {
    return this.componentes.includes(ComponenteMagia.MATERIAL);
  }

  /**
   * Cria uma cópia da magia
   */
  override clonar(): Magia {
    const config: MagiaConfig = {
      nome: this.nome,
      descricao: this.descricao,
      valor: this.valor,
      peso: this.peso,
      raridade: this.raridade,
      magico: this.magico,
      escola: this.escola,
      nivel: this.nivel,
      tempoConjuracao: this.tempoConjuracao,
      alcance: this.alcance,
      componentes: [...this.componentes],
      duracao: this.duracao,
      duracaoDetalhada: this.duracaoDetalhada,
      alvo: this.alvo,
      salvaguarda: this.salvaguarda,
      resisteMagia: this.resisteMagia,
      efeito: this.efeito,
      preparada: this.preparada,
      conjurada: this.conjurada,
    };

    if (this.componenteMaterial) {
      config.componenteMaterial = this.componenteMaterial;
    }
    if (this.dano) {
      config.dano = this.dano;
    }
    if (this.area) {
      config.area = this.area;
    }
    if (this.nivelSuperior) {
      config.nivelSuperior = this.nivelSuperior;
    }

    return Magia.createMagiaFromConfig(config);
  }

  /**
   * Obtém descrição completa da magia
   */
  override getDescricaoCompleta(): string {
    let descricao = super.getDescricaoCompleta();

    descricao += `\n\n**Informações da Magia:**\n`;
    descricao += `• Escola: ${this.escola}\n`;
    descricao += `• Nível: ${this.nivel === 0 ? 'Truque' : this.nivel}°\n`;
    descricao += `• Tempo de Conjuração: ${this.tempoConjuracao}\n`;
    descricao += `• Alcance: ${this.alcance}\n`;
    descricao += `• Componentes: ${this.componentes.join(', ')}\n`;

    if (this.componenteMaterial) {
      descricao += `• Material: ${this.componenteMaterial}\n`;
    }

    descricao += `• Duração: ${this.duracaoDetalhada}\n`;
    descricao += `• Alvo: ${this.alvo}\n`;

    if (this.salvaguarda !== TipoSalvaguarda.NENHUMA) {
      descricao += `• Salvaguarda: ${this.salvaguarda}\n`;
    }

    descricao += `• Resiste Magia: ${this.resisteMagia ? 'Sim' : 'Não'}\n`;

    if (this.dano) {
      descricao += `• Dano: ${this.dano}\n`;
    }

    if (this.area) {
      descricao += `• Área: ${this.area}\n`;
    }

    descricao += `• Status: ${this.preparada ? 'Preparada' : 'Não preparada'}`;
    if (this.preparada) {
      descricao += `, ${this.conjurada ? 'Conjurada' : 'Disponível'}`;
    }
    descricao += '\n';

    descricao += `\n**Efeito:**\n${this.efeito}\n`;

    if (this.nivelSuperior) {
      descricao += `\n**Em Níveis Superiores:**\n${this.nivelSuperior}\n`;
    }

    return descricao;
  }

  // Factory methods para magias comuns
  static criarMisseisMagicos(): Magia {
    return Magia.createMagiaFromConfig({
      nome: 'Mísseis Mágicos',
      descricao: 'Três dardos brilhantes de força mágica.',
      escola: EscolaMagia.EVOCACAO,
      nivel: 1,
      tempoConjuracao: '1 ação',
      alcance: '36 metros',
      componentes: [ComponenteMagia.VERBAL, ComponenteMagia.SOMATICO],
      duracao: DuracaoMagia.INSTANTANEO,
      duracaoDetalhada: 'Instantâneo',
      alvo: TipoAlvo.CRIATURA,
      salvaguarda: TipoSalvaguarda.NENHUMA,
      resisteMagia: true,
      dano: '1d4+1',
      efeito:
        'Cada dardo atinge automaticamente uma criatura que você puder ver dentro do alcance. Um dardo causa 1d4+1 de dano de força ao alvo.',
      nivelSuperior:
        'Quando você conjurar essa magia usando um espaço de magia de 2° nível ou superior, a magia cria um dardo adicional para cada nível do espaço acima do 1°.',
    });
  }

  static criarCura(): Magia {
    return Magia.createMagiaFromConfig({
      nome: 'Curar Ferimentos',
      descricao: 'Uma criatura que você tocar recupera pontos de vida.',
      escola: EscolaMagia.EVOCACAO,
      nivel: 1,
      tempoConjuracao: '1 ação',
      alcance: 'Toque',
      componentes: [ComponenteMagia.VERBAL, ComponenteMagia.SOMATICO],
      duracao: DuracaoMagia.INSTANTANEO,
      duracaoDetalhada: 'Instantâneo',
      alvo: TipoAlvo.CRIATURA,
      salvaguarda: TipoSalvaguarda.NENHUMA,
      resisteMagia: false,
      dano: '1d8+mod',
      efeito:
        'Uma criatura que você tocar recupera 1d8 + seu modificador de habilidade de conjuração em pontos de vida.',
      nivelSuperior:
        'Quando você conjurar essa magia usando um espaço de magia de 2° nível ou superior, a cura aumenta em 1d8 para cada nível do espaço acima do 1°.',
    });
  }

  static criarBolaDeFogo(): Magia {
    return Magia.createMagiaFromConfig({
      nome: 'Bola de Fogo',
      descricao: 'Uma explosão brilhante de chamas surge de um ponto que você escolher.',
      escola: EscolaMagia.EVOCACAO,
      nivel: 3,
      tempoConjuracao: '1 ação',
      alcance: '45 metros',
      componentes: [ComponenteMagia.VERBAL, ComponenteMagia.SOMATICO, ComponenteMagia.MATERIAL],
      componenteMaterial: 'uma pequena esfera de guano de morcego e enxofre',
      duracao: DuracaoMagia.INSTANTANEO,
      duracaoDetalhada: 'Instantâneo',
      alvo: TipoAlvo.AREA,
      area: 'Esfera de 6 metros de raio',
      salvaguarda: TipoSalvaguarda.REFLEXO,
      resisteMagia: true,
      dano: '8d6',
      efeito:
        'Cada criatura numa esfera de 6 metros de raio centrada no ponto deve realizar um teste de resistência de Destreza. Uma criatura sofre 8d6 de dano de fogo se falhar na resistência, ou metade desse dano se for bem-sucedida.',
      nivelSuperior:
        'Quando você conjurar essa magia usando um espaço de magia de 4° nível ou superior, o dano aumenta em 1d6 para cada nível do espaço acima do 3°.',
    });
  }
}
