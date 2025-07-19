<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="trending_up" class="q-mr-sm" />
        Atributos
      </div>

      <!-- Atributos Primários -->
      <div class="q-mb-lg">
        <div class="text-subtitle2 q-mb-sm">Atributos Primários</div>
        <div class="row q-gutter-md">
          <div
            v-for="(valor, atributo) in atributosPrimarios"
            :key="atributo"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat class="bg-grey-1">
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-grey-6">{{ nomeAtributo(atributo) }}</div>
                <div class="row items-center">
                  <div class="col">
                    <q-input
                      v-if="editavel"
                      :model-value="valor"
                      @update:model-value="atualizarAtributo(atributo, $event)"
                      type="number"
                      min="1"
                      max="30"
                      dense
                      borderless
                      class="text-h6"
                    />
                    <div v-else class="text-h6">{{ valor }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip
                      :label="formatarModificador(calcularModificador(valor))"
                      size="sm"
                      :color="
                        valor >= 16
                          ? 'positive'
                          : valor >= 13
                            ? 'warning'
                            : valor <= 8
                              ? 'negative'
                              : 'grey'
                      "
                      text-color="white"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Atributos Derivados -->
      <div v-if="atributosDerivados">
        <div class="text-subtitle2 q-mb-sm">Atributos Derivados</div>
        <div class="row q-gutter-md">
          <!-- HP -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat class="bg-red-1">
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-grey-6">Pontos de Vida</div>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">
                      {{ atributosDerivados.hp }}/{{ atributosDerivados.hpMaximo }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-circular-progress
                      :value="(atributosDerivados.hp / atributosDerivados.hpMaximo) * 100"
                      size="30px"
                      color="red"
                      track-color="grey-3"
                      class="q-ma-md"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- MP -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat class="bg-blue-1">
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-grey-6">Pontos de Magia</div>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">
                      {{ atributosDerivados.mp }}/{{ atributosDerivados.mpMaximo }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-circular-progress
                      :value="(atributosDerivados.mp / atributosDerivados.mpMaximo) * 100"
                      size="30px"
                      color="blue"
                      track-color="grey-3"
                      class="q-ma-md"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- CA -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat class="bg-purple-1">
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-grey-6">Classe de Armadura</div>
                <div class="text-h6">{{ atributosDerivados.ca }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Iniciativa -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat class="bg-orange-1">
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-grey-6">Iniciativa</div>
                <div class="text-h6">{{ formatarModificador(atributosDerivados.iniciativa) }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Velocidade -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat class="bg-green-1">
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-grey-6">Velocidade</div>
                <div class="text-h6">{{ atributosDerivados.velocidade }}m</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-actions v-if="editavel" align="right">
      <q-btn flat label="Resetar" @click="$emit('resetar')" />
      <q-btn color="primary" label="Salvar" @click="$emit('salvar')" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { AtributosPrimarios, AtributosDerivados } from '../types';

interface Props {
  atributosPrimarios: AtributosPrimarios;
  atributosDerivados?: AtributosDerivados;
  editavel?: boolean;
}

interface Emits {
  atualizar: [atributo: keyof AtributosPrimarios, valor: number];
  salvar: [];
  resetar: [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  editavel: false,
});

const emit = defineEmits<Emits>();

// Métodos
function nomeAtributo(atributo: string): string {
  const nomes: Record<string, string> = {
    forca: 'Força',
    destreza: 'Destreza',
    constituicao: 'Constituição',
    inteligencia: 'Inteligência',
    sabedoria: 'Sabedoria',
    carisma: 'Carisma',
  };
  return nomes[atributo] || atributo;
}

function calcularModificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

function formatarModificador(modificador: number): string {
  return modificador >= 0 ? `+${modificador}` : `${modificador}`;
}

function atualizarAtributo(atributo: keyof AtributosPrimarios, valor: string | number | null) {
  const valorNumerico = typeof valor === 'string' ? parseInt(valor) || 0 : valor || 0;
  emit('atualizar', atributo, valorNumerico);
}
</script>

<style scoped>
.text-h6 {
  font-weight: 600;
}
</style>
