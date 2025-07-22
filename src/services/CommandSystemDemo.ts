/**
 * ✅ Demonstração do Sistema de Comandos Integrado
 *
 * Este arquivo demonstra como o sistema de comandos funciona
 * integrado com o GamePage do RPG AI.
 */

import { GameCommandService } from './GameCommandService';

/**
 * Demonstra todos os comandos disponíveis
 */
export async function demonstrarSistemaComandos(): Promise<void> {
  console.log('🎯 === DEMONSTRAÇÃO DO SISTEMA DE COMANDOS ===');

  const commandService = new GameCommandService();

  // 1. Listar todos os comandos disponíveis
  console.log('\n📋 Comandos Disponíveis:');
  const comandos = commandService.getAllCommands();
  comandos.forEach((cmd) => {
    console.log(`  ${cmd.usage} - ${cmd.description}`);
  });

  // 2. Testar detecção de comandos
  console.log('\n🔍 Teste de Detecção:');
  const testes = ['/talk @João Olá!', '/roll 1d20+5', '/attack @orc', 'Mensagem normal', '/help'];

  testes.forEach((teste) => {
    const isCommand = commandService.isCommand(teste);
    console.log(`  "${teste}" → ${isCommand ? '✅ Comando' : '❌ Mensagem'}`);
  });

  // 3. Testar auto-complete
  console.log('\n💡 Teste de Auto-Complete:');
  const inputs = ['/t', '/r', '/a'];

  inputs.forEach((input) => {
    const sugestoes = commandService.getAutoComplete(input);
    console.log(`  "${input}" → ${sugestoes.length} sugestões:`);
    sugestoes.slice(0, 3).forEach((s) => {
      console.log(`    - ${s.command}: ${s.description}`);
    });
  });

  // 4. Testar execução de comandos
  console.log('\n⚡ Teste de Execução:');
  const comandosParaTestar = ['/help', '/roll 1d20', '/talk @João Olá, como vai?'];

  for (const cmd of comandosParaTestar) {
    try {
      console.log(`\n  Executando: "${cmd}"`);
      const resultado = await commandService.processCommand(cmd);

      if (resultado.success) {
        console.log(`    ✅ Sucesso: ${resultado.result?.message}`);
      } else {
        console.log(`    ❌ Erro: ${resultado.error}`);
      }
    } catch (error) {
      console.log(`    💥 Exceção: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('\n🎉 === DEMONSTRAÇÃO CONCLUÍDA ===');
}

/**
 * Comandos de exemplo para teste manual
 */
export const COMANDOS_EXEMPLO = [
  '/help - Mostra todos os comandos disponíveis',
  '/talk @João Olá! Como você está? - Faz um personagem falar',
  '/roll 1d20+5 - Rola dados com modificador',
  '/roll 3d6 - Rola múltiplos dados',
  '/attack @orc com espada - Ataca um alvo',
  '/defend - Assume posição defensiva',
  '/cast fireball @orc - Conjura uma magia',
  '/move norte - Move em uma direção',
  '/heal @João - Cura um personagem',
  '/ai controlar @João - Ativa controle de IA',
];

/**
 * Validação básica do sistema
 */
export function validarSistemaComandos(): boolean {
  try {
    const service = new GameCommandService();

    // Teste básico de detecção
    if (!service.isCommand('/test')) return false;
    if (service.isCommand('normal message')) return false;

    // Teste básico de comandos
    const comandos = service.getAllCommands();
    if (comandos.length === 0) return false;

    // Teste básico de auto-complete
    const suggestions = service.getAutoComplete('/');
    if (suggestions.length === 0) return false;

    console.log('✅ Sistema de comandos validado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na validação do sistema de comandos:', error);
    return false;
  }
}
