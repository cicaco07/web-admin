<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import type { Emblem } from '../../../../types/Emblem';

defineProps<{
  modalId: string;
  emblem: Emblem | null;
}>();
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="secondary">
      Detail Emblem {{ emblem?.name }}
    </ModalHeader>
    <ModalBody v-if="emblem">
      <div class="row pt-3">
        <div class="col-md-4 text-center">
          <img 
            :src="emblem.icon" 
            alt="Emblem Icon" 
            class="rounded mb-3" 
            style="width: 100px; height: 100px; object-fit: contain;" 
          />
          <h4>{{ emblem.name }}</h4>
          <span class="badge bg-info">{{ emblem.type }}</span>
        </div>
        <div class="col-md-8">
          <p><strong>Benefit:</strong> {{ emblem.benefit || '-' }}</p>
          <p><strong>Description:</strong> {{ emblem.description || '-' }}</p>
          <p><strong>Cooldown:</strong> {{ emblem.cooldown || '-' }}</p>
          
          <div v-if="emblem.attributes && emblem.attributes.length > 0" class="mt-3">
            <strong>Attributes:</strong>
            <ul class="list-unstyled mt-2">
              <li v-for="(attr, index) in emblem.attributes" :key="index" class="mb-1">
                <template v-for="(value, key) in attr" :key="key">
                  <span v-if="key !== 'icon'">• {{ key }}: {{ value }}</span>
                </template>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ModalBody>
  </Modal>
</template>
