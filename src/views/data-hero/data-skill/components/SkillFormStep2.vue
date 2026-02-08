<script setup lang="ts">
import { computed } from 'vue';
import type { SkillDetailFormData } from '../../../../types/Skill';

const props = defineProps<{
  formData: SkillDetailFormData;
}>();

const emit = defineEmits<{
  (e: 'update:formData', value: SkillDetailFormData): void;
}>();

const updateLevelCount = (value: number) => {
  const newFormValues = Array.from({ length: props.formData.attributeCount }, (_, attrIdx) =>
    Array.from({ length: value }, (_, lvlIdx) => 
      props.formData.formValues[attrIdx]?.[lvlIdx] || ''
    )
  );
  emit('update:formData', {
    ...props.formData,
    levelCount: value,
    formValues: newFormValues
  });
};

const updateAttributeCount = (value: number) => {
  const newFormValues = Array.from({ length: value }, (_, attrIdx) =>
    Array.from({ length: props.formData.levelCount }, (_, lvlIdx) => 
      props.formData.formValues[attrIdx]?.[lvlIdx] || ''
    )
  );
  const newAttributeKeys = Array.from({ length: value }, (_, idx) => 
    props.formData.attributeKeys[idx] || ''
  );
  emit('update:formData', {
    ...props.formData,
    attributeCount: value,
    attributeKeys: newAttributeKeys,
    formValues: newFormValues
  });
};

const updateAttributeKey = (index: number, value: string) => {
  const newKeys = [...props.formData.attributeKeys];
  newKeys[index] = value;
  emit('update:formData', { ...props.formData, attributeKeys: newKeys });
};

const updateFormValue = (attrIdx: number, lvlIdx: number, value: string) => {
  const newFormValues = props.formData.formValues.map((row, i) => 
    i === attrIdx ? row.map((v, j) => j === lvlIdx ? value : v) : [...row]
  );
  emit('update:formData', { ...props.formData, formValues: newFormValues });
};

const showTable = computed(() => 
  props.formData.levelCount > 0 && props.formData.attributeCount > 0
);
</script>

<template>
  <div class="skill-form-step2">
    <h5 class="mb-4">
      <i class="ti ti-list-details me-2"></i>
      Data Detail Skill
    </h5>

    <div class="alert alert-info mb-4">
      <i class="ti ti-info-circle me-2"></i>
      Tentukan jumlah level skill dan atribut yang berubah per level. 
      Nama atribut harus sesuai dengan yang digunakan di deskripsi lengkap.
    </div>

    <!-- Level & Attribute Count -->
    <div class="row mb-4">
      <div class="col-md-6">
        <label class="form-label fw-semibold">Jumlah Level Skill <span class="text-danger">*</span></label>
        <input
          type="number"
          class="form-control"
          placeholder="Contoh: 6"
          :value="formData.levelCount"
          @input="updateLevelCount(Number(($event.target as HTMLInputElement).value))"
          min="1"
          max="10"
          required
        />
      </div>
      <div class="col-md-6">
        <label class="form-label fw-semibold">Jumlah Atribut <span class="text-danger">*</span></label>
        <input
          type="number"
          class="form-control"
          placeholder="Contoh: 3"
          :value="formData.attributeCount"
          @input="updateAttributeCount(Number(($event.target as HTMLInputElement).value))"
          min="1"
          max="20"
          required
        />
      </div>
    </div>

    <!-- Dynamic Attributes Table -->
    <div v-if="showTable" class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr class="text-center">
            <th style="min-width: 150px;">Nama Atribut</th>
            <th v-for="level in formData.levelCount" :key="level" style="min-width: 100px;">
              Level {{ level }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, attrIdx) in formData.formValues" :key="attrIdx">
            <td>
              <input
                :value="formData.attributeKeys[attrIdx]"
                @input="updateAttributeKey(attrIdx, ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="Contoh: damage"
                class="form-control form-control-sm"
              />
            </td>
            <td v-for="(val, lvlIdx) in row" :key="lvlIdx">
              <input 
                :value="val"
                @input="updateFormValue(attrIdx, lvlIdx, ($event.target as HTMLInputElement).value)"
                type="text" 
                class="form-control form-control-sm text-center"
                placeholder="0"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center text-muted py-4">
      <i class="ti ti-table-off fs-1 d-block mb-2"></i>
      Masukkan jumlah level dan atribut untuk menampilkan tabel
    </div>
  </div>
</template>
