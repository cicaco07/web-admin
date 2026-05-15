<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import type { BaseStat } from '../../../../types/BaseStat';
import { BASE_STAT_FIELD_GROUPS } from '../../../../types/BaseStat';

defineProps<{
  modalId: string;
  baseStat: BaseStat | null;
}>();

const fieldGroups = BASE_STAT_FIELD_GROUPS;
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
                <div class="fw-semibold fs-5">{{ baseStat[field.key] }}</div>
              </div>
            </div>
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
