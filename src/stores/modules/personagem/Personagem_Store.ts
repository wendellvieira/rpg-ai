import { defineStore } from 'pinia';
import { transformClass } from '../../../utils/transformClass';
import { Personagem, type PersonagemConfig } from '../../../domain/entities/Character/Personagem';
import type { Personagem_Data } from '../../../domain/entities/Character/Personagem_Data';
import { PersistenceManager } from '../../../services/Infrastructure/PersistenceManager';

/**
 * ✅ Store moderna para gerenciamento de personagens
 *
 * Implementa o padrão enterprise definido nas diretrizes:
 * - Classe TypeScript com métodos e propriedades
 * - Uso das entidades Domain corretas
 * - Padrão transformClass para reatividade Pinia
 * - Separação clara entre estado, getters e actions
 */
export class Personagem_Store {
  // =====================================
  // 🏗️ STATE - Estado da store
  // =====================================
  public personagens: Personagem[] = [];
  public personagemAtivo: Personagem | null = null;
  public carregando = false;
  public erro: string | null = null;

  // =====================================
  // 🔍 GETTERS - Propriedades computadas
  // =====================================
  get totalPersonagens(): number {
    return this.personagens.length;
  }

  get personagensVivos(): Personagem[] {
    return this.personagens.filter((p) => p.estaVivo());
  }

  get personagensJogadores(): Personagem[] {
    return this.personagens.filter((p) => !p.data?.isIA);
  }

  get personagensNPCs(): Personagem[] {
    return this.personagens.filter((p) => p.data?.isIA);
  }

  get personagemAtivoData(): Personagem_Data | null {
    return this.personagemAtivo?.data || null;
  }

  // =====================================
  // 🎯 ACTIONS - Métodos da store
  // =====================================

  /**
   * Carrega todos os personagens do sistema de persistência
   */
  async carregarPersonagens(): Promise<void> {
    this.carregando = true;
    this.erro = null;

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();

      // Listar índice dos personagens
      const indicePersonagens = await persistence.listarPersonagens();

      // Carregar cada personagem completo
      const personagensCarregados: Personagem[] = [];
      for (const indice of indicePersonagens) {
        const personagem = await persistence.carregarPersonagem(indice.id);
        if (personagem) {
          personagensCarregados.push(personagem);
        }
      }

      this.personagens = personagensCarregados;
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
      this.erro = 'Erro ao carregar personagens';
    } finally {
      this.carregando = false;
    }
  }

  /**
   * Salva um personagem no sistema de persistência
   */
  async salvarPersonagem(personagem: Personagem): Promise<void> {
    if (!personagem.data) {
      throw new Error('Personagem sem dados para salvar');
    }

    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.salvarPersonagem(personagem);

      // Atualizar no array local
      const index = this.personagens.findIndex((p) => p.data?.id === personagem.data?.id);
      if (index >= 0) {
        this.personagens[index] = personagem;
      } else {
        this.personagens.push(personagem);
      }
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      this.erro = 'Erro ao salvar personagem';
      throw error;
    }
  }

  /**
   * Cria um novo personagem
   */
  async criarPersonagem(config: PersonagemConfig): Promise<Personagem> {
    try {
      const personagem = Personagem.fromConfig(config);
      await this.salvarPersonagem(personagem);
      return personagem;
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      this.erro = 'Erro ao criar personagem';
      throw error;
    }
  }

  /**
   * Atualiza dados de um personagem existente
   */
  async atualizarPersonagem(id: string, updates: Partial<Personagem_Data>): Promise<void> {
    try {
      const personagem = this.personagens.find((p) => p.data?.id === id);
      if (!personagem || !personagem.data) {
        throw new Error(`Personagem com ID ${id} não encontrado`);
      }

      // Atualizar dados usando método da entidade
      personagem.updateData(updates);
      await this.salvarPersonagem(personagem);
    } catch (error) {
      console.error('Erro ao atualizar personagem:', error);
      this.erro = 'Erro ao atualizar personagem';
      throw error;
    }
  }

  /**
   * Remove um personagem
   */
  async removerPersonagem(id: string): Promise<void> {
    try {
      const persistence = PersistenceManager.getInstance();
      await persistence.inicializar();
      await persistence.removerPersonagem(id);

      // Remover do array local
      const index = this.personagens.findIndex((p) => p.data?.id === id);
      if (index >= 0) {
        this.personagens.splice(index, 1);
      }

      // Se era o personagem ativo, limpar seleção
      if (this.personagemAtivo?.data?.id === id) {
        this.personagemAtivo = null;
      }
    } catch (error) {
      console.error('Erro ao remover personagem:', error);
      this.erro = 'Erro ao remover personagem';
      throw error;
    }
  }

  /**
   * Define o personagem ativo
   */
  setPersonagemAtivo(id: string | null): void {
    if (id === null) {
      this.personagemAtivo = null;
      return;
    }

    const personagem = this.personagens.find((p) => p.data?.id === id);
    if (personagem) {
      this.personagemAtivo = personagem;
    } else {
      console.warn(`Personagem com ID ${id} não encontrado`);
    }
  }

  /**
   * Busca personagem por ID
   */
  buscarPersonagem(id: string): Personagem | null {
    return this.personagens.find((p) => p.data?.id === id) || null;
  }

  /**
   * Busca personagens por filtro
   */
  filtrarPersonagens(filtro: {
    nome?: string;
    raca?: string;
    classe?: string;
    isIA?: boolean;
    nivel?: number;
  }): Personagem[] {
    return this.personagens.filter((personagem) => {
      const data = personagem.data;
      if (!data) return false;

      if (filtro.nome && !data.nome.toLowerCase().includes(filtro.nome.toLowerCase())) {
        return false;
      }
      if (filtro.raca && data.raca !== filtro.raca) {
        return false;
      }
      if (filtro.classe && data.classe !== filtro.classe) {
        return false;
      }
      if (filtro.isIA !== undefined && data.isIA !== filtro.isIA) {
        return false;
      }
      if (filtro.nivel && data.nivel !== filtro.nivel) {
        return false;
      }

      return true;
    });
  }

  /**
   * Limpa erros
   */
  limparErro(): void {
    this.erro = null;
  }

  /**
   * Reset completo da store
   */
  reset(): void {
    this.personagens = [];
    this.personagemAtivo = null;
    this.carregando = false;
    this.erro = null;
  }
}

// =====================================
// 🏪 EXPORT PINIA STORE
// =====================================
export const usePersonagemStore = defineStore('personagem', () => {
  return transformClass(Personagem_Store);
});
