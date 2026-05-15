<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import type { Build } from '../../../../types/Build';

defineProps<{
  modalId: string;
  build: Build | null;
}>();
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="secondary">Detail Build</ModalHeader>
    <ModalBody>
      <div v-if="build" class="container-fluid">
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col-md-6">
            <h5 class="fw-semibold text-primary mb-3">Informasi Build</h5>
            <dl class="row mb-0">
              <dt class="col-sm-4 fw-semibold">Nama Build:</dt>
              <dd class="col-sm-8">{{ build.name }}</dd>
              
              <dt class="col-sm-4 fw-semibold">Role:</dt>
              <dd class="col-sm-8">{{ build.role }}</dd>
              
              <dt class="col-sm-4 fw-semibold">Status:</dt>
              <dd class="col-sm-8">
                <span 
                  class="badge"
                  :class="build.is_official ? 'bg-success' : 'bg-info'"
                >
                  {{ build.is_official ? 'Official' : 'Community' }}
                </span>
              </dd>
              
              <dt class="col-sm-4 fw-semibold">Dibuat oleh:</dt>
              <dd class="col-sm-8">{{ build.user.name }}</dd>
            </dl>
          </div>
          <div class="col-md-6">
            <h5 class="fw-semibold text-primary mb-3">Hero</h5>
            <div class="d-flex align-items-center justify-content-center bg-light rounded p-3">
              <img 
                :src="build.hero.image" 
                :alt="build.hero.name"
                class="rounded shadow-sm me-3"
                style="width: 100px; height: 100px; object-fit: cover;"
              />
              <div>
                <h6 class="mb-0 fw-bold">{{ build.hero.name }}</h6>
                <small class="text-muted">{{ build.role }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="build.description" class="row mb-4">
          <div class="col-12">
            <h5 class="fw-semibold text-primary mb-2">Deskripsi</h5>
            <p class="text-muted mb-0">{{ build.description }}</p>
          </div>
        </div>

        <hr class="my-4">

        <!-- Items Build -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="fw-semibold text-primary mb-3">Items Build</h5>
            <div class="bg-light rounded p-3">
              <div class="d-flex flex-wrap gap-3">
                <div 
                  v-for="buildItem in build.items" 
                  :key="buildItem.order"
                  class="text-center"
                >
                  <div class="position-relative">
                    <span class="badge bg-primary position-absolute top-0 start-0 m-1" style="font-size: 10px;">
                      {{ buildItem.order }}
                    </span>
                    <img 
                      :src="buildItem.item.image" 
                      :alt="buildItem.item.name"
                      class="rounded border"
                      style="width: 70px; height: 70px; object-fit: contain; background: white;"
                    />
                  </div>
                  <div class="small fw-semibold mt-1" style="max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ buildItem.item.name }}
                  </div>
                  <div class="small text-muted" style="font-size: 10px;">
                    {{ buildItem.item.type }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="my-4">

        <!-- Emblems -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="fw-semibold text-primary mb-3">Emblems</h5>
            <div class="d-flex flex-wrap gap-3">
              <div 
                v-for="emblem in build.emblems" 
                :key="emblem._id"
                class="text-center bg-light rounded p-2"
                style="min-width: 80px;"
              >
                <img 
                  :src="emblem.icon" 
                  :alt="emblem.name"
                  class="mb-2"
                  style="width: 50px; height: 50px; object-fit: contain;"
                />
                <div class="small fw-semibold">{{ emblem.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <hr class="my-4">

        <!-- Battle Spells -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="fw-semibold text-primary mb-3">Battle Spells</h5>
            <div class="d-flex flex-wrap gap-3">
              <div 
                v-for="spell in build.battle_spells" 
                :key="spell._id"
                class="text-center bg-light rounded p-2"
                style="min-width: 80px;"
              >
                <img 
                  :src="spell.icon" 
                  :alt="spell.name"
                  class="mb-2"
                  style="width: 50px; height: 50px; object-fit: contain;"
                />
                <div class="small fw-semibold">{{ spell.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <div class="row mt-4">
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
        <p class="text-muted">Tidak ada data build yang dipilih</p>
      </div>
    </ModalBody>
  </Modal>
</template>
