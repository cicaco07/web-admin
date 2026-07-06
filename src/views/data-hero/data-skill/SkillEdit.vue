<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';

// Form Steps
import SkillFormStep1 from './components/SkillFormStep1.vue';
import SkillFormStep2 from './components/SkillFormStep2.vue';

// API
import { useHeroes } from '../../../lib/api/HeroApi';
import { useSkills, useUpdateSkill } from '../../../lib/api/SkillApi';
import { useSkillsDetail, useUpdateSkillDetailToSkill, useAddSkillDetailToSkill } from '../../../lib/api/SkillDetailApi';
import { alertConfirm, alertSuccess, alertError } from '../../../lib/alert';

// Types
import type { Hero } from '../../../types/Hero';
import type { SkillFormData, SkillDetailFormData } from '../../../types/Skill';
import { createDefaultSkillForm, createDefaultSkillDetailForm } from '../../../types/Skill';

// ==================== Router ====================
const router = useRouter();
const route = useRoute();
const skillId = computed(() => route.params.id as string);

// ==================== Data Fetching ====================
const { result: heroResult } = useHeroes();
const heroes = computed<Hero[]>(() => heroResult.value?.heroes?.items || []);

const { result: skillResult, refetch: refetchSkills } = useSkills();
const { result: skillDetailResult, refetch: refetchSkillDetails } = useSkillsDetail();

// ==================== API Mutations ====================
const { updateSkill } = useUpdateSkill();
const { updateSkillDetailToSkill } = useUpdateSkillDetailToSkill();
const { addSkillDetailToSkill } = useAddSkillDetailToSkill();

// ==================== Form State ====================
const currentStep = ref(1);
const isSubmitting = ref(false);
const isLoading = ref(true);
const dataLoaded = ref(false);

const skillForm = ref<SkillFormData>(createDefaultSkillForm());
const skillDetailForm = ref<SkillDetailFormData>(createDefaultSkillDetailForm());
const selectedTags = ref<string[]>([]);

// ==================== Find Current Skill ====================
const currentSkill = computed(() => {
  if (!skillResult.value?.heroes?.items) return null;
  for (const hero of skillResult.value.heroes.items) {
    const skill = hero.skills?.find((s: any) => s._id === skillId.value);
    if (skill) {
      return { ...skill, heroId: hero._id || '', heroName: hero.name };
    }
  }
  return null;
});

const currentSkillDetails = computed(() => {
  if (!skillDetailResult.value?.skills) return [];
  const skill = skillDetailResult.value.skills.find((s: any) => s._id === skillId.value);
  return skill?.skills_detail || [];
});

// ==================== Load Data ====================
const loadSkillData = () => {
  if (currentSkill.value) {
    skillForm.value = {
      heroId: currentSkill.value.heroId,
      name: currentSkill.value.name,
      type: currentSkill.value.type,
      tag: currentSkill.value.tag || [],
      skill_icon: currentSkill.value.skill_icon,
      lite_description: currentSkill.value.lite_description,
      full_description: currentSkill.value.full_description,
    };
    selectedTags.value = Array.isArray(currentSkill.value.tag) 
      ? [...currentSkill.value.tag] 
      : currentSkill.value.tag ? [currentSkill.value.tag] : [];
  }
  
  if (currentSkillDetails.value.length > 0) {
    const details = currentSkillDetails.value;
    const levelCount = details.length;
    const attributeKeys = Object.keys(details[0]?.attributes || {});
    const attributeCount = attributeKeys.length;
    
    const formValues = attributeKeys.map((key) => 
      details.map((d: any) => String(d.attributes[key] ?? ''))
    );
    
    skillDetailForm.value = {
      levelCount,
      attributeCount,
      attributeKeys,
      formValues
    };
  }
  
  isLoading.value = false;
};

watch([currentSkill, currentSkillDetails], () => {
  if (currentSkill.value && !dataLoaded.value) {
    loadSkillData();
    dataLoaded.value
  }
}, { immediate: true });

// ==================== Computed ====================
const selectedHeroName = computed(() => {
  const hero = heroes.value.find(h => h._id === skillForm.value.heroId);
  return hero?.name || currentSkill.value?.heroName || '-';
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

// ==================== Skill Detail Generation ====================
const generateSkillDetailInput = (detailForm: SkillDetailFormData) => {
  return Array.from({ length: detailForm.levelCount }, (_, levelIndex) => {
    const attributes: Record<string, number> = {};
    detailForm.attributeKeys.forEach((key, attrIdx) => {
      const rawValue = detailForm.formValues[attrIdx]?.[levelIndex] || '0';
      const parsed = parseFloat(rawValue);
      attributes[key] = isNaN(parsed) ? 0 : parsed;
    });
    return {
      level: levelIndex + 1,
      attributes,
    };
  });
};

// ==================== Submit ====================
const handleSubmit = async () => {
  const confirmMessage = isPassive.value 
    ? `
Apakah Anda yakin ingin mengupdate skill ini?

Hero: ${selectedHeroName.value}
Nama Skill: ${skillForm.value.name}
Tipe: ${skillForm.value.type} (Tidak ada data detail)
Tag: ${selectedTags.value.join(', ') || '-'}
    `.trim()
    : `
Apakah Anda yakin ingin mengupdate skill ini?

Hero: ${selectedHeroName.value}
Nama Skill: ${skillForm.value.name}
Tipe: ${skillForm.value.type}
Tag: ${selectedTags.value.join(', ') || '-'}
Jumlah Level: ${skillDetailForm.value.levelCount}
Jumlah Atribut: ${skillDetailForm.value.attributeCount}
    `.trim();

  const confirmed = await alertConfirm(confirmMessage);
  if (!confirmed) return;

  const currentIsPassive = isPassive.value;
  const allDetails = !currentIsPassive ? generateSkillDetailInput(skillDetailForm.value) : [];
  const existingDetails = [...currentSkillDetails.value];

  isSubmitting.value = true;
  try {
    await updateSkill({
      id: skillId.value,
      input: {
        name: skillForm.value.name,
        type: skillForm.value.type,
        tag: [...selectedTags.value],
        skill_icon: skillForm.value.skill_icon,
        lite_description: skillForm.value.lite_description,
        full_description: skillForm.value.full_description,
      }
    });

    if (!currentIsPassive && allDetails.length > 0) {
      const updateDetails: { detailId: string; input: { level: number; attributes: Record<string, number> } }[] = [];
      const newDetails: { level: number; attributes: Record<string, number> }[] = [];

      for (let i = 0; i < allDetails.length; i++) {
        const existing = existingDetails[i];
        if (existing?._id) {
          updateDetails.push({
            detailId: existing._id,
            input: allDetails[i],
          });
        } else {
          newDetails.push(allDetails[i]);
        }
      }

      for (const detail of updateDetails) {
        await updateSkillDetailToSkill({
          skillId: skillId.value,
          skillDetailId: detail.detailId,
          input: detail.input,
        });
      }

      if (newDetails.length > 0) {
        await addSkillDetailToSkill({
          skillId: skillId.value,
          input: newDetails,
        });
      }
    }

    await refetchSkills();
    await refetchSkillDetails();

    alertSuccess('Skill berhasil diupdate!');
    router.push('/data-hero/skill');
  } catch (error) {
    console.error('Error updating skill:', error);
    alertError('Gagal mengupdate skill. Pastikan semua field terisi dengan benar.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Edit Skill"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Hero' },
        { name: 'Skill', href: '/data-hero/skill' },
        { name: 'Edit' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Memuat data skill...</p>
            </div>

            <template v-else>
              <!-- Wizard Steps Indicator -->
              <div class="d-flex justify-content-center mb-4">
                <div class="d-flex align-items-center">
                  <div 
                    class="rounded-circle d-flex align-items-center justify-content-center"
                    :class="currentStep >= 1 ? 'bg-warning text-white' : 'bg-light text-muted'"
                    style="width: 40px; height: 40px;"
                  >
                    1
                  </div>
                  <span class="mx-2" :class="currentStep >= 1 ? 'text-warning fw-semibold' : 'text-muted'">
                    Data Skill
                  </span>
                  <template v-if="!isPassive">
                    <div class="border-top mx-3" style="width: 80px;"></div>
                    <div 
                      class="rounded-circle d-flex align-items-center justify-content-center"
                      :class="currentStep >= 2 ? 'bg-warning text-white' : 'bg-light text-muted'"
                      style="width: 40px; height: 40px;"
                    >
                      2
                    </div>
                    <span class="mx-2" :class="currentStep >= 2 ? 'text-warning fw-semibold' : 'text-muted'">
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
                    variant="outline-warning"
                    @click="prevStep"
                  >
                    <i class="ti ti-chevron-left me-1"></i>
                    Sebelumnya
                  </Button>
                  <Button
                    v-if="currentStep < 2 && !isPassive"
                    type="button"
                    variant="warning"
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
                    Update Skill
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
                    Update Skill
                  </Button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
