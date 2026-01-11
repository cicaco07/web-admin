<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import Badge from '../../../../components/Badge/Badge.vue';
import type { Hero } from '../../../../types/Hero';

defineProps<{
  hero: Hero;
  modalId: string;
}>();
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="primary">Detail Data Hero</ModalHeader>
    <ModalBody>
      <div class="row pt-3">
        <div class="col-md-3 d-flex align-items-center">
          <div class="text-center w-100">
            <img :src="hero.image" alt="" class="img-fluid rounded mb-2" width="200"/>
          </div>
        </div>
        <div class="col-md-9 table-responsive">
          <table class="table table-bordered table-hover">
            <tbody>
              <tr>
                <td class="p-2 fw-semibold" style="width: 150px;">Nama</td>
                <td class="p-2">{{ hero.name }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Alias</td>
                <td class="p-2">The {{ hero.alias }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Spesialis</td>
                <td class="p-2">{{ hero.speciality }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Region</td>
                <td class="p-2">{{ hero.region }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Urutan</td>
                <td class="p-2">{{ hero.hero_order }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Role</td>
                <td class="p-2">
                  <Badge
                    v-for="(role, i) in Array.isArray(hero.role) ? hero.role : [hero.role]"
                    :key="i"
                    color="warning"
                    class="me-1"
                  >
                    {{ role }}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Tipe</td>
                <td class="p-2">
                  <Badge
                    v-for="(type, i) in Array.isArray(hero.type) ? hero.type : [hero.type]"
                    :key="i"
                    color="info"
                    class="me-1"
                  >
                    {{ type }}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Tanggal Rilis</td>
                <td class="p-2">{{ hero.release_date }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Deskripsi Singkat</td>
                <td class="p-2">{{ hero.short_description }}</td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Durability</td>
                <td class="p-2">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar bg-success" :style="`width: ${hero.durability}%`"></div>
                    </div>
                    <span class="text-muted">{{ hero.durability }}%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Offense</td>
                <td class="p-2">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar bg-danger" :style="`width: ${hero.offense}%`"></div>
                    </div>
                    <span class="text-muted">{{ hero.offense }}%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Control Effect</td>
                <td class="p-2">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar bg-info" :style="`width: ${hero.control_effect}%`"></div>
                    </div>
                    <span class="text-muted">{{ hero.control_effect }}%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="p-2 fw-semibold">Difficulty</td>
                <td class="p-2">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar bg-warning" :style="`width: ${hero.difficulty}%`"></div>
                    </div>
                    <span class="text-muted">{{ hero.difficulty }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="text-end">
        <Button type="button" class="btn btn-primary waves-effect" data-bs-dismiss="modal">
          Tutup
        </Button>
      </div>
    </ModalBody>
  </Modal>
</template>
