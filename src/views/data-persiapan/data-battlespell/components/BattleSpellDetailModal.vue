<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Badge from '../../../../components/Badge/Badge.vue';
import type { BattleSpell } from '../../../../types/BattleSpell';

defineProps<{
  modalId: string;
  battleSpell: BattleSpell | null;
}>();
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="secondary">
      Detail Battle Spell {{ battleSpell?.name }}
    </ModalHeader>
    <ModalBody v-if="battleSpell">
      <div class="row pt-3">
        <div class="col-md-4 text-center">
          <img 
            :src="`http://localhost:3000${battleSpell.icon}`" 
            alt="Battle Spell Icon" 
            class="rounded mb-3" 
            style="width: 30%; height: auto;" 
          />
          <h4 class="text-center">{{ battleSpell.name }}</h4>
        </div>
        <div class="col-md-8">
          <div class="mb-4">
            <Badge color="info">{{ battleSpell.tag }}</Badge>
          </div>
          <p><strong>Cooldown:</strong> {{ battleSpell.cooldown }} detik</p>
          <div class="d-flex gap-2">
            <p><strong>Description:</strong></p>
            <p class="text-wrap">{{ battleSpell.description }}</p>
          </div>
        </div>
      </div>
    </ModalBody>
  </Modal>
</template>
