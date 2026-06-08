<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import { ref, watch } from 'vue';
import type { BaseStatFormData, BaseStatGrowthKey } from '../../../../types/BaseStat';
import { BASE_STAT_FIELD_GROUPS, BASE_STAT_GROWTH_FIELDS } from '../../../../types/BaseStat';
import type { Hero } from '../../../../types/Hero';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  baseStatForm: BaseStatFormData;
  heroes: Hero[];
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:baseStatForm', value: BaseStatFormData): void;
}>();

const fieldGroups = BASE_STAT_FIELD_GROUPS;

const statKeys = fieldGroups.flatMap((group) => group.fields.map((field) => field.key));
const growthKeys = BASE_STAT_GROWTH_FIELDS.map((field) => field.growthKey as BaseStatGrowthKey);

type BaseStatInputKey = (typeof statKeys)[number];

const normalizeDecimal = (raw: string) => raw.replace(',', '.').trim();

const parseDecimalInput = (raw: string) => {
  const normalized = normalizeDecimal(raw);
  const num = Number(normalized);
  return normalized !== '' && Number.isFinite(num) ? num : 0;
};

const shouldSyncText = (current: string, value: number | null | undefined) => {
  const normalized = normalizeDecimal(current);
  const nextValue = value ?? 0;

  if (normalized === '' && nextValue === 0) return false;
  if ((normalized === '.' || normalized === '-.') && nextValue === 0) return false;

  const parsed = Number(normalized);
  return !Number.isFinite(parsed) || parsed !== nextValue;
};

const buildStatText = (): Record<BaseStatInputKey, string> =>
  statKeys.reduce((acc, key) => {
    const value = props.baseStatForm[key];
    acc[key] = value == null ? '0' : String(value);
    return acc;
  }, {} as Record<BaseStatInputKey, string>);

const buildGrowthText = (): Record<BaseStatGrowthKey, string> =>
  growthKeys.reduce((acc, key) => {
    const value = props.baseStatForm[key];
    acc[key] = value === 0 || value == null ? '' : String(value);
    return acc;
  }, {} as Record<BaseStatGrowthKey, string>);

const statText = ref<Record<BaseStatInputKey, string>>(buildStatText());
const growthText = ref<Record<BaseStatGrowthKey, string>>(buildGrowthText());

watch(
  () => statKeys.map((key) => props.baseStatForm[key]),
  (values) => {
    statKeys.forEach((key, index) => {
      const value = values[index];
      const current = statText.value[key];
      if (shouldSyncText(current, value)) {
        statText.value[key] = value == null ? '0' : String(value);
      }
    });
  },
);

watch(
  () => growthKeys.map((key) => props.baseStatForm[key]),
  (values) => {
    growthKeys.forEach((key, index) => {
      const value = values[index];
      const current = growthText.value[key];
      if (shouldSyncText(current, value)) {
        growthText.value[key] = value === 0 || value == null ? '' : String(value);
      }
    });
  },
);

const updateHero = (heroId: string) => {
  emit('update:baseStatForm', { ...props.baseStatForm, heroId });
};

const updateField = (field: BaseStatInputKey, raw: string) => {
  statText.value[field] = raw;
  const value = parseDecimalInput(raw);
  emit('update:baseStatForm', { ...props.baseStatForm, [field]: value });
};

const updateGrowthField = (field: BaseStatGrowthKey, raw: string) => {
  growthText.value[field] = raw;
  const value = parseDecimalInput(raw);
  emit('update:baseStatForm', { ...props.baseStatForm, [field]: value });
};

const handleSubmit = () => {
  emit('submit');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="handleSubmit">
      <div class="form-group pt-2">
        <div class="mb-4">
          <label class="form-label">
            Hero
            <span class="text-danger">*</span>
          </label>
          <select
            class="form-select"
            :value="baseStatForm.heroId"
            @change="updateHero(($event.target as HTMLSelectElement).value)"
            required
          >
            <option value="" disabled>Pilih Hero</option>
            <option v-for="hero in heroes" :key="hero._id" :value="hero._id">
              {{ hero.name }} - {{ hero.role.join(', ') }}
            </option>
          </select>
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
              <label class="form-label">
                {{ field.label }}
                <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                inputmode="decimal"
                class="form-control"
                :placeholder="`Masukkan ${field.label}`"
                :value="statText[field.key]"
                @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
                required
              />
              <template v-if="field.growthKey">
                <label class="form-label text-muted small mt-2">
                  {{ field.label }} / Level
                </label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">
                    <i class="ti ti-trending-up"></i>
                  </span>
                  <input
                    type="text"
                    inputmode="decimal"
                    class="form-control"
                    :placeholder="`Growth ${field.label}`"
                    :value="growthText[field.growthKey]"
                    @input="updateGrowthField(field.growthKey, ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="row mt-2">
          <div class="col-12 d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleCancel"
              data-bs-dismiss="modal"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn"
              :class="headerColor === 'primary' ? 'btn-primary' : 'btn-warning'"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </ModalBody>
  </Modal>
</template>
