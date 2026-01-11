<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import Badge from '../../../../components/Badge/Badge.vue';
import type { Skill, SkillDetail } from '../../../../types/Skill';

interface SkillDetailWithLevel {
  level: number;
  attributes: Record<string, number>;
}

const props = defineProps<{
  modalId: string;
  skill: Skill | null;
  skillDetails: SkillDetailWithLevel[];
}>();

const selectedLevel = ref(1);

const attributeKeys = computed(() => {
  if (props.skillDetails.length === 0) return [];
  const allKeys = props.skillDetails.flatMap(detail =>
    Object.keys(detail.attributes || {})
  );
  return [...new Set(allKeys)];
});

// Get skill description with replaced attributes based on selected level
const parsedDescription = computed(() => {
  if (!props.skill?.full_description) return '';
  
  const skillDetail = props.skillDetails.find(d => d.level === selectedLevel.value);
  if (!skillDetail) return props.skill.full_description;
  
  let description = props.skill.full_description;
  const regex = /\{\{([^}]+)\}\}/g;
  
  description = description.replace(regex, (match, attributeName) => {
    const attributeValue = skillDetail.attributes[attributeName.trim()];
    return attributeValue !== undefined 
      ? `<span class="text-primary fw-bold">${attributeValue}</span>` 
      : match;
  });
  
  return description;
});

// Helper function to convert tag to array
const toArray = (value: string | string[]): string[] => {
  return Array.isArray(value) ? value : value ? [value] : [];
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="primary">Detail Skill</ModalHeader>
    <ModalBody>
      <div v-if="!skill" class="text-center py-4 text-muted">
        <i class="ti ti-database-off fs-1 d-block mb-2"></i>
        Tidak ada data skill
      </div>

      <template v-else>
        <!-- Skill Info Section -->
        <div class="row mb-4">
          <!-- Skill Icon -->
          <div class="col-md-3 text-center">
            <img 
              :src="skill.skill_icon" 
              :alt="skill.name"
              class="img-fluid rounded mb-2"
              style="max-width: 120px;"
            >
          </div>
          
          <!-- Skill Details -->
          <div class="col-md-9">
            <table class="table table-borderless mb-0">
              <tbody>
                <tr>
                  <td class="fw-semibold text-muted" style="width: 150px;">Nama Skill</td>
                  <td>{{ skill.name }}</td>
                </tr>
                <tr>
                  <td class="fw-semibold text-muted">Tipe</td>
                  <td>{{ skill.type }}</td>
                </tr>
                <tr>
                  <td class="fw-semibold text-muted">Hero</td>
                  <td>{{ skill.heroName || '-' }}</td>
                </tr>
                <tr>
                  <td class="fw-semibold text-muted">Tag</td>
                  <td>
                    <Badge
                      v-for="(tag, i) in toArray(skill.tag)"
                      :key="i"
                      color="primary"
                      class="me-1"
                    >
                      {{ tag }}
                    </Badge>
                    <span v-if="toArray(skill.tag).length === 0" class="text-muted">-</span>
                  </td>
                </tr>
                <tr>
                  <td class="fw-semibold text-muted">Deskripsi Singkat</td>
                  <td>{{ skill.lite_description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Full Description with Level Selector -->
        <div class="card bg-light mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0 fw-semibold">Deskripsi Lengkap</h6>
              <div v-if="skillDetails.length > 0">
                <label class="form-label mb-0 me-2">Level:</label>
                <select v-model="selectedLevel" class="form-select form-select-sm" style="width: auto; display: inline-block;">
                  <option v-for="detail in skillDetails" :key="detail.level" :value="detail.level">
                    {{ detail.level }}
                  </option>
                </select>
              </div>
            </div>
            <div class="skill-description" v-html="parsedDescription"></div>
          </div>
        </div>

        <!-- Skill Details Table -->
        <div v-if="skillDetails.length > 0">
          <h6 class="fw-semibold mb-3">Atribut per Level</h6>
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
              <thead class="table-light">
                <tr class="text-center">
                  <th>Level</th>
                  <th v-for="key in attributeKeys" :key="key">{{ key }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="detail in skillDetails"
                  :key="detail.level"
                  :class="{ 'table-primary': detail.level === selectedLevel }"
                  class="text-center"
                >
                  <td class="fw-semibold">{{ detail.level }}</td>
                  <td v-for="key in attributeKeys" :key="key">
                    {{ detail.attributes[key] ?? '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="alert alert-warning">
          <i class="ti ti-alert-circle me-2"></i>
          Skill ini belum memiliki data detail/atribut per level.
        </div>
      </template>

      <div class="text-end mt-3">
        <Button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Tutup
        </Button>
      </div>
    </ModalBody>
  </Modal>
</template>
