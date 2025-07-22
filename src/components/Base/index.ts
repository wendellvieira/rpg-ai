/**
 * Componentes Base
 * Substitutos padronizados para componentes do Quasar
 * Seguem padrão de Controller Architecture com Factory Pattern
 */

// Input - Substitui QInput
export { Input, Input_Ctrl } from './Input';
export type { Input_Data, InputConfig } from './Input';

// Btn - Substitui QBtn
export { Btn, Btn_Ctrl } from './Btn';
export type { Btn_Data, BtnConfig } from './Btn';

// Select - Substitui QSelect
export { Select, Select_Ctrl } from './Select';
export type { Select_Data, SelectConfig, SelectOption } from './Select';
