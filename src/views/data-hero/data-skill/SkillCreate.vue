<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';

// Form Steps
import SkillFormStep1 from './components/SkillFormStep1.vue';
import SkillFormStep2 from './components/SkillFormStep2.vue';

// API
import { useHeroes } from '../../../lib/api/HeroApi';
import { useAddSkillToHero } from '../../../lib/api/SkillApi';
import { useAddSkillDetailToSkill } from '../../../lib/api/SkillDetailApi';
import { alertConfirm, alertSuccess, alertError } from '../../../lib/alert';

// Types
import type { Hero } from '../../../types/Hero';
import type { SkillFormData, SkillDetailFormData } from '../../../types/Skill';
import { createDefaultSkillForm, createDefaultSkillDetailForm } from '../../../types/Skill';

// ==================== Router ====================
const router = useRouter();

// ==================== Data Fetching ====================
const { result: heroResult } = useHeroes();
const heroes = computed<Hero[]>(() => heroResult.value?.heroes || []);

// ==================== API Mutations ====================
const { addSkillToHero } = useAddSkillToHero();
const { addSkillDetailToSkill } = useAddSkillDetailToSkill();

// ==================== Form State ====================
const currentStep = ref(1);
const isSubmitting = ref(false);

const skillForm = ref<SkillFormData>(createDefaultSkillForm());
const skillDetailForm = ref<SkillDetailFormData>(createDefaultSkillDetailForm());
const selectedTags = ref<string[]>([]);

// ==================== Computed ====================
const selectedHeroName = computed(() => {
  const hero = heroes.value.find(h => h._id === skillForm.value.heroId);
  return hero?.name || '-';
});

const isPassive = computed(() => skillForm.value.type === 'Passive');

const canProceedStep1 = computed(() => {
  const f = skillForm.value;
  return f.heroId && f.name && f.type && f.skill_icon && f.lite_description && f.full_description;
});

const canProceedStep2 = computed(() => {
  const f = skillDetailForm.value;
  if (f.levelCount <= 0 || f.attributeCount <= 0) return false;
  return f.attributeKeys.every(key => key.trim() !== '');
});

// ==================== Skill Detail Generation ====================
const generateSkillDetailInput = () => {
  return Array.from({ length: skillDetailForm.value.levelCount }, (_, levelIndex) => {
    const attributes: Record<string, number> = {};
    skillDetailForm.value.attributeKeys.forEach((key, attrIdx) => {
      const rawValue = skillDetailForm.value.formValues[attrIdx]?.[levelIndex] || '0';
      const parsed = parseFloat(rawValue);
      attributes[key] = isNaN(parsed) ? 0 : parsed;
    });
    return {
      level: levelIndex + 1,
      attributes,
    };
  });
};

// ==================== Navigation ====================
const nextStep = () => {
  if (currentStep.value === 1 && canProceedStep1.value && !isPassive.value) {
    currentStep.value = 2;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const goBack = () => {
  router.push('/data-hero/skill');
};

// ==================== Submit ====================
const handleSubmit = async () => {
  const confirmMessage = isPassive.value 
    ? `
Apakah Anda yakin ingin menyimpan skill ini?

Hero: ${selectedHeroName.value}
Nama Skill: ${skillForm.value.name}
Tipe: ${skillForm.value.type} (Tidak ada data detail)
Tag: ${selectedTags.value.join(', ') || '-'}
    `.trim()
    : `
Apakah Anda yakin ingin menyimpan skill ini?

Hero: ${selectedHeroName.value}
Nama Skill: ${skillForm.value.name}
Tipe: ${skillForm.value.type}
Tag: ${selectedTags.value.join(', ') || '-'}
Jumlah Level: ${skillDetailForm.value.levelCount}
Jumlah Atribut: ${skillDetailForm.value.attributeCount}
    `.trim();

  const confirmed = await alertConfirm(confirmMessage);
  if (!confirmed) return;

  isSubmitting.value = true;
  try {
    // 1. Create skill
    const addSkillRes = await addSkillToHero({
      heroId: skillForm.value.heroId,
      input: {
        name: skillForm.value.name,
        type: skillForm.value.type,
        tag: [...selectedTags.value],
        skill_icon: skillForm.value.skill_icon,
        lite_description: skillForm.value.lite_description,
        full_description: skillForm.value.full_description,
      }
    });

    const newSkillId = addSkillRes?.data?.addSkillToHero?._id;
    if (!newSkillId) {
      throw new Error('Gagal mendapatkan ID skill baru');
    }

    // 2. Create skill details (only for non-passive skills)
    if (!isPassive.value) {
      const detailInput = generateSkillDetailInput();
      await addSkillDetailToSkill({
        skillId: newSkillId,
        input: detailInput,
      });
    }

    alertSuccess('Skill berhasil ditambahkan!');
    router.push('/data-hero/skill');
  } catch (error) {
    console.error('Error creating skill:', error);
    alertError('Gagal menambahkan skill. Pastikan semua field terisi dengan benar.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Tambah Skill"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Hero' },
        { name: 'Skill', href: '/data-hero/skill' },
        { name: 'Tambah' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- Wizard Steps Indicator -->
            <div class="d-flex justify-content-center mb-4">
              <div class="d-flex align-items-center">
                <div 
                  class="rounded-circle d-flex align-items-center justify-content-center"
                  :class="currentStep >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'"
                  style="width: 40px; height: 40px;"
                >
                  1
                </div>
                <span class="mx-2" :class="currentStep >= 1 ? 'text-primary fw-semibold' : 'text-muted'">
                  Data Skill
                </span>
                <template v-if="!isPassive">
                  <div class="border-top mx-3" style="width: 80px;"></div>
                  <div 
                    class="rounded-circle d-flex align-items-center justify-content-center"
                    :class="currentStep >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'"
                    style="width: 40px; height: 40px;"
                  >
                    2
                  </div>
                  <span class="mx-2" :class="currentStep >= 2 ? 'text-primary fw-semibold' : 'text-muted'">
                    Detail Skill
                  </span>
                </template>
              </div>
            </div>

            <!-- Step Content -->
            <div class="wizard-content px-3">
              <SkillFormStep1
                v-if="currentStep === 1"
                :formData="skillForm"
                :heroes="heroes"
                :selectedTags="selectedTags"
                @update:formData="skillForm = $event"
                @update:selectedTags="selectedTags = $event"
              />

              <SkillFormStep2
                v-if="currentStep === 2 && !isPassive"
                :formData="skillDetailForm"
                @update:formData="skillDetailForm = $event"
              />
            </div>

            <!-- Navigation Buttons -->
            <div class="d-flex justify-content-between mt-4 pt-3 border-top">
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  @click="goBack"
                >
                  <i class="ti ti-arrow-left me-1"></i>
                  Kembali ke Daftar
                </Button>
              </div>
              <div class="d-flex gap-2">
                <Button
                  v-if="currentStep > 1"
                  type="button"
                  variant="outline-primary"
                  @click="prevStep"
                >
                  <i class="ti ti-chevron-left me-1"></i>
                  Sebelumnya
                </Button>
                <Button
                  v-if="currentStep < 2 && !isPassive"
                  type="button"
                  variant="primary"
                  :disabled="!canProceedStep1"
                  @click="nextStep"
                >
                  Selanjutnya
                  <i class="ti ti-chevron-right ms-1"></i>
                </Button>
                <!-- Submit button for Passive on step 1 -->
                <Button
                  v-if="isPassive && currentStep === 1"
                  type="button"
                  variant="success"
                  :disabled="!canProceedStep1 || isSubmitting"
                  :loading="isSubmitting"
                  @click="handleSubmit"
                >
                  <i class="ti ti-check me-1"></i>
                  Simpan Skill
                </Button>
                <!-- Submit button for non-Passive on step 2 -->
                <Button
                  v-if="currentStep === 2 && !isPassive"
                  type="button"
                  variant="success"
                  :disabled="!canProceedStep2 || isSubmitting"
                  :loading="isSubmitting"
                  @click="handleSubmit"
                >
                  <i class="ti ti-check me-1"></i>
                  Simpan Skill
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
