<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Badge from '../../../../components/Badge/Badge.vue';
import Button from '../../../../components/Button/Button.vue';
import type { Item } from '../../../../types/Item';

defineProps<{
  modalId: string;
  item: Item | null;
}>();

const getTypeBadgeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Attack': 'danger',
    'Magic': 'info',
    'Defense': 'success',
    'Movement': 'primary',
    'Jungle': 'warning',
    'Roaming': 'secondary'
  };
  return colors[type] || 'secondary';
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="secondary">
      Detail Item {{ item?.name }}
    </ModalHeader>
    <ModalBody v-if="item">
      <div class="row">
        <div class="col-md-4 text-center">
          <img 
            :src="item.image" 
            alt="Item Image" 
            class="img-fluid mb-3" 
            style="max-width: 120px;"
          />
          <div class="mb-2">
            <Badge v-if="item.price" color="warning">{{ item.price }}</Badge>
          </div>
          <Badge v-if="item.type" :color="getTypeBadgeColor(item.type)">
            {{ item.type }}
          </Badge>
          <h5 class="mt-2 mb-1">{{ item.name }}</h5>
          <p class="text-muted">{{ item.tag }}</p>
        </div>

        <div class="col-md-8">
          <div v-if="item.story" class="mb-3">
            <h6>Cerita</h6>
            <p>{{ item.story }}</p>
          </div>
          <hr>

          <div class="row">
            <div class="col-4">
              <h6>Attribut</h6>
              <ul class="list-unstyled" v-if="item.attributes && item.attributes.length > 0">
                <li v-for="(attr, idx) in item.attributes" :key="idx">• {{ attr }}</li>
              </ul>
              <p v-else class="text-muted">-</p>
            </div>
            <div class="col-8">
              <h6>Deskripsi</h6>
              <ul class="list-unstyled" v-if="item.description && item.description.length > 0">
                <li v-for="(desc, idx) in item.description" :key="idx">• {{ desc }}</li>
              </ul>
              <p v-else class="text-muted">-</p>
            </div>
          </div>

          <div v-if="item.tips" class="mt-3">
            <h6>Tips</h6>
            <p>{{ item.tips }}</p>
          </div>
        </div>
      </div>

      <div class="text-end mt-3">
        <Button type="button" class="btn btn-secondary waves-effect" data-bs-dismiss="modal">
          Tutup
        </Button>
      </div>
    </ModalBody>
  </Modal>
</template>
