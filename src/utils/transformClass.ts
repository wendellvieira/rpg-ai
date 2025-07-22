import { reactive } from 'vue';

/**
 * Helper para converter classe em setup store do Pinia
 *
 * Este utilitário permite usar classes como stores Pinia,
 * mantendo reatividade e fornecendo uma API limpa.
 *
 * @example
 * ```typescript
 * // Definir a classe store
 * class MyStore {
 *   public count = 0;
 *
 *   get doubled() {
 *     return this.count * 2;
 *   }
 *
 *   increment() {
 *     this.count++;
 *   }
 * }
 *
 * // Usar com Pinia
 * export const useMyStore = defineStore('my-store', () => {
 *   return transformClass(MyStore);
 * });
 * ```
 */
export function transformClass<T extends object>(ClassConstructor: new () => T): T {
  const instance = new ClassConstructor();
  return reactive(instance) as T;
}
