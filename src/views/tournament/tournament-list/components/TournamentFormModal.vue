<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import { TIER_OPTIONS, STATUS_OPTIONS, REGION_OPTIONS, type TournamentFormData } from '../../../../types/Tournament';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  isSubmitting: boolean;
  tournamentForm: TournamentFormData;
}>();

const emit = defineEmits<{
  (e: 'update:tournamentForm', value: TournamentFormData): void;
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const updateField = (field: keyof TournamentFormData, value: any) => {
  emit('update:tournamentForm', { ...props.tournamentForm, [field]: value });
};

const handleSubmit = () => {
  emit('submit');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Modal :id="modalId" size="lg">
    <ModalHeader :backgroundColor="headerColor || 'primary'">
      {{ title }}
    </ModalHeader>
    <ModalBody :onSubmit="handleSubmit">
      <!-- Name -->
      <FormInput
        type="text"
        label="Nama Tournament"
        :modelValue="tournamentForm.name"
        @update:modelValue="updateField('name', $event)"
        :required="true"
      />

      <!-- Slug -->
      <FormInput
        type="text"
        label="Slug"
        :modelValue="tournamentForm.slug"
        @update:modelValue="updateField('slug', $event)"
        :required="true"
      />

      <!-- Tier -->
      <div class="mb-3">
        <label class="form-label">
          Tier <span class="text-danger">*</span>
        </label>
        <select
          class="form-select"
          :value="tournamentForm.tier"
          @change="updateField('tier', ($event.target as HTMLSelectElement).value)"
          required
        >
          <option value="" disabled>Pilih Tier</option>
          <option v-for="tier in TIER_OPTIONS" :key="tier" :value="tier">
            {{ tier }}
          </option>
        </select>
      </div>

      <!-- Tier Level -->
      <FormInput
        type="number"
        label="Tier Level"
        :modelValue="tournamentForm.tierLevel"
        @update:modelValue="updateField('tierLevel', Number($event))"
        :required="true"
      />

      <!-- Region -->
      <div class="mb-3">
        <label class="form-label">
          Region <span class="text-danger">*</span>
        </label>
        <select
          class="form-select"
          :value="tournamentForm.region"
          @change="updateField('region', ($event.target as HTMLSelectElement).value)"
          required
        >
          <option value="" disabled>Pilih Region</option>
          <option v-for="region in REGION_OPTIONS" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
      </div>

      <!-- Liquipedia URL -->
      <FormInput
        type="text"
        label="Liquipedia URL"
        :modelValue="tournamentForm.liquipediaUrl"
        @update:modelValue="updateField('liquipediaUrl', $event)"
      />

      <!-- Liquipedia Slug -->
      <FormInput
        type="text"
        label="Liquipedia Slug"
        :modelValue="tournamentForm.liquipediaSlug"
        @update:modelValue="updateField('liquipediaSlug', $event)"
        :required="true"
      />

      <!-- Status -->
      <div class="mb-3">
        <label class="form-label">
          Status <span class="text-danger">*</span>
        </label>
        <select
          class="form-select"
          :value="tournamentForm.status"
          @change="updateField('status', ($event.target as HTMLSelectElement).value)"
          required
        >
          <option value="" disabled>Pilih Status</option>
          <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <!-- Prize Pool -->
      <FormInput
        type="text"
        label="Prize Pool"
        :modelValue="tournamentForm.prizePool"
        @update:modelValue="updateField('prizePool', $event)"
      />

      <!-- Actions -->
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
          @click="handleCancel"
        >
          Batal
        </button>
        <Button
          type="submit"
          variant="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          Simpan
        </Button>
      </div>
    </ModalBody>
  </Modal>
</template>
