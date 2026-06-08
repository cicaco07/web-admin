<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import type { BaseStat } from '../../../../types/BaseStat';
import {
  BASE_STAT_FIELD_GROUPS,
  BASE_STAT_GROWTH_FIELDS,
  BASE_STAT_LEVELS,
  computeStatAtLevel,
} from '../../../../types/BaseStat';

defineProps<{
  modalId: string;
  baseStat: BaseStat | null;
}>();

const fieldGroups = BASE_STAT_FIELD_GROUPS;
const growthFields = BASE_STAT_GROWTH_FIELDS;
const levels = BASE_STAT_LEVELS;

const formatNumber = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(2);

const growthLabel = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? `+${formatNumber(value)}` : '+0';
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="secondary">Detail Base Stat</ModalHeader>
    <ModalBody>
      <div v-if="baseStat" class="container-fluid pt-2">
        <div class="alert alert-light border d-flex align-items-center mb-4">
          <img
            v-if="baseStat.hero.image"
            :src="baseStat.hero.image"
            :alt="baseStat.hero.name"
            class="rounded me-3"
            style="width: 56px; height: 56px; object-fit: cover;"
          />
          <i v-else class="ti ti-user fs-4 me-2 text-secondary"></i>
          <div>
            <small class="text-muted d-block">Hero</small>
            <div class="fw-semibold">{{ baseStat.hero.name }}</div>
            <small class="text-muted">{{ baseStat.hero.role.join(', ') }}</small>
          </div>
        </div>

        <div v-for="group in fieldGroups" :key="group.title" class="mb-4">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom">
            <span class="badge me-2" :class="`bg-${group.color} bg-opacity-10 text-${group.color}`">
              <i :class="group.icon"></i>
            </span>
            <h6 class="mb-0 fw-semibold">{{ group.title }}</h6>
          </div>

          <div class="row">
            <div
              v-for="field in group.fields"
              :key="field.key"
              class="col-md-4 col-sm-6 mb-3"
            >
              <div class="bg-light rounded p-3 h-100">
                <small class="text-muted d-block mb-1">{{ field.label }}</small>
                <div class="d-flex align-items-baseline gap-2">
                  <span class="fw-semibold fs-5">{{ baseStat[field.key] }}</span>
                  <span
                    v-if="field.growthKey"
                    class="badge bg-success bg-opacity-10 text-success"
                  >
                    <i class="ti ti-trending-up me-1"></i>{{ growthLabel(baseStat[field.growthKey]) }}/lvl
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="growthFields.length" class="mb-4">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom">
            <span class="badge me-2 bg-success bg-opacity-10 text-success">
              <i class="ti ti-trending-up"></i>
            </span>
            <h6 class="mb-0 fw-semibold">Growth per Level (1 - 15)</h6>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-bordered align-middle text-center mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-start">Stat</th>
                  <th class="text-success">/ Level</th>
                  <th v-for="level in levels" :key="level">Lv {{ level }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="field in growthFields" :key="field.key">
                  <td class="text-start fw-semibold">{{ field.label }}</td>
                  <td class="text-success">{{ growthLabel(baseStat[field.growthKey!]) }}</td>
                  <td v-for="level in levels" :key="level">
                    {{ formatNumber(computeStatAtLevel(baseStat[field.key], baseStat[field.growthKey!], level)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-12 d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <p class="text-muted">Tidak ada data base stat yang dipilih</p>
      </div>
    </ModalBody>
  </Modal>
</template>
