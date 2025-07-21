// Script para testar persistência de conhecimentos dos personagens
import { Personagem } from './src/classes/Personagem.ts';
import { PersistenceManager } from './src/services/PersistenceManager.ts';

async function testarPersistenciaConhecimento() {
  console.log('🧪 Iniciando teste de persistência de conhecimento...');

  try {
    // Inicializar persistence
    const persistence = PersistenceManager.getInstance();
    await persistence.inicializar();

    // Criar um personagem de teste
    const personagemTeste = new Personagem({
      nome: 'Teste Conhecimento',
      raca: 'Humano',
      classe: 'Mago',
    });

    console.log('📝 Personagem criado:', personagemTeste.nome);
    console.log('📋 Conhecimentos iniciais:', personagemTeste.getConhecimentos);

    // Adicionar alguns conhecimentos
    personagemTeste.adicionarConhecimento({
      titulo: 'Primeiro Conhecimento',
      conteudo: 'Este é o primeiro conhecimento de teste.',
      categoria: 'Teste',
      dataAdicao: new Date(),
    });

    personagemTeste.adicionarConhecimento({
      titulo: 'Segundo Conhecimento',
      conteudo: 'Este é o segundo conhecimento de teste.',
      categoria: 'Teste',
      dataAdicao: new Date(),
    });

    console.log('📚 Conhecimentos após adição:', personagemTeste.getConhecimentos);

    // Salvar personagem
    await persistence.salvarPersonagem(personagemTeste);
    console.log('💾 Personagem salvo com conhecimentos');

    // Carregar personagem novamente
    const personagemCarregado = await persistence.carregarPersonagem(personagemTeste.id);

    if (personagemCarregado) {
      console.log('✅ Personagem carregado:', personagemCarregado.nome);
      console.log('📖 Conhecimentos carregados:', personagemCarregado.getConhecimentos);

      if (personagemCarregado.getConhecimentos.length === 2) {
        console.log('🎉 SUCESSO: Conhecimentos foram persistidos corretamente!');
      } else {
        console.log('❌ ERRO: Conhecimentos não foram persistidos corretamente');
        console.log(`Esperado: 2, Encontrado: ${personagemCarregado.getConhecimentos.length}`);
      }
    } else {
      console.log('❌ ERRO: Personagem não foi carregado');
    }

    // Limpar teste
    await persistence.removerPersonagem(personagemTeste.id);
    console.log('🧹 Personagem de teste removido');
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarPersistenciaConhecimento();
