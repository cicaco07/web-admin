<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import FormTextarea from '../../../../components/FormInput/FormTextarea.vue';
import AppSelect from '../../../../components/AppSelect.vue';
import type { SelectOption } from '../../../../components/AppSelect.vue';
import ItemDragDrop from './ItemDragDrop.vue';
import type { BuildFormData } from '../../../../types/Build';
import { ROLE_OPTIONS } from '../../../../types/Build';
import { useHeroes } from '../../../../lib/api/HeroApi';
import { useItems } from '../../../../lib/api/ItemApi';
import { useEmblems } from '../../../../lib/api/EmblemApi';
import { useBattleSpell } from '../../../../lib/api/BattleSpellApi';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  buildForm: BuildFormData;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:buildForm', value: BuildFormData): void;
}>();

// Fetch data for dropdowns
const { result: heroResult, loading: heroLoading } = useHeroes();
const { result: itemResult } = useItems();
const { result: emblemResult } = useEmblems();
const { result: battleSpellResult } = useBattleSpell();

const heroes = computed(() => heroResult.value?.heroes || []);
const items = computed(() => itemResult.value?.items || []);
const emblems = computed(() => emblemResult.value?.emblems || []);
const battleSpells = computed(() => battleSpellResult.value?.battleSpells || []);

// Filter heroes by selected role (lane position)
const filteredHeroes = computed(() => {
  if (!props.buildForm.role) return heroes.value;
  return heroes.value.filter((h: any) => {
    const heroRoles = Array.isArray(h.role) ? h.role : [h.role];
    return heroRoles.some((r: string) => r?.toLowerCase() === props.buildForm.role.toLowerCase());
  });
});

// Group emblems by type
const emblemsByType = computed(() => {
  const grouped: Record<string, any[]> = {};
  emblems.value.forEach((emblem: any) => {
    const type = emblem.type || 'Lainnya';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(emblem);
  });
  return grouped;
});

const roleSelectOptions = computed<SelectOption[]>(() =>
  ROLE_OPTIONS.map(role => ({ id: role, text: role }))
);

const heroSelectOptions = computed<SelectOption[]>(() =>
  filteredHeroes.value.map((hero: any) => ({ id: hero._id, text: hero.name }))
);

// Build items management
const buildItems = ref<Array<{ itemId: string; order: number }>>([]);
const selectedEmblemIds = ref<string[]>([]);
const selectedBattleSpellIds = ref<string[]>([]);
const initialized = ref(false);

// Initialize local state from form only once when modal opens with data (edit mode).
// After initialization, local state is managed independently to avoid being overwritten
// when other form fields (name, role, etc.) trigger re-emission of buildForm.
watch(
  () => [props.buildForm.items, props.buildForm.emblemIds, props.buildForm.battleSpellIds] as const,
  ([items, emblemIds, battleSpellIds]) => {
    if (initialized.value) return;

    if ((items && items.length > 0) || (emblemIds && emblemIds.length > 0) || (battleSpellIds && battleSpellIds.length > 0)) {
      buildItems.value = items ? [...items] : [];
      selectedEmblemIds.value = emblemIds ? [...emblemIds] : [];
      if (battleSpellIds && battleSpellIds.length > 2) {
        selectedBattleSpellIds.value = battleSpellIds.slice(0, 2);
      } else {
        selectedBattleSpellIds.value = battleSpellIds ? [...battleSpellIds] : [];
      }
      initialized.value = true;
    }
  },
  { immediate: true, deep: true }
);

// Reset heroId when user changes role to a role incompatible with the current hero.
// This preserves heroId when the whole form is loaded externally (edit mode) since
// loaded hero should already match loaded role.
watch(() => props.buildForm.role, (newRole, oldRole) => {
  if (newRole === oldRole || !props.buildForm.heroId) return;

  if (!heroes.value.length) return;

  const currentHero = heroes.value.find((h: any) => h._id === props.buildForm.heroId);
  if (!currentHero) return;

  const heroRoles = Array.isArray(currentHero.role) ? currentHero.role : [currentHero.role];
  const isCompatible = heroRoles.some((r: any) => r?.toLowerCase?.() === newRole?.toLowerCase?.());
  if (!isCompatible) {
    updateFormField('heroId', '');
  }
});

const updateFormField = <K extends keyof BuildFormData>(field: K, value: BuildFormData[K]) => {
  emit('update:buildForm', {
    ...props.buildForm,
    items: buildItems.value,
    emblemIds: selectedEmblemIds.value,
    battleSpellIds: selectedBattleSpellIds.value,
    [field]: value
  });
};

// Emblem management
const toggleEmblem = (emblemId: string, emblemType: string) => {
  const index = selectedEmblemIds.value.indexOf(emblemId);
  if (index > -1) {
    // Deselect
    selectedEmblemIds.value.splice(index, 1);
  } else {
    // Deselect other emblems of same type first
    const sameTypeEmblems = emblems.value.filter((e: any) => e.type === emblemType);
    sameTypeEmblems.forEach((e: any) => {
      const idx = selectedEmblemIds.value.indexOf(e._id);
      if (idx > -1) selectedEmblemIds.value.splice(idx, 1);
    });
    // Select new emblem
    selectedEmblemIds.value.push(emblemId);
  }
};

// Battle Spell management (max 2)
const toggleBattleSpell = (spellId: string) => {
   const index = selectedBattleSpellIds.value.indexOf(spellId);
   if (index > -1) {
     selectedBattleSpellIds.value.splice(index, 1);
   } else {
     if (selectedBattleSpellIds.value.length < 2) {
       selectedBattleSpellIds.value.push(spellId);
     }
   }
 };

const handleSubmit = () => {
  const validItems = buildItems.value.filter(item => item.itemId);
  
  emit('update:buildForm', {
    ...props.buildForm,
    items: validItems,
    emblemIds: selectedEmblemIds.value,
    battleSpellIds: selectedBattleSpellIds.value
  });
  
  initialized.value = false;
  emit('submit');
};

const handleCancel = () => {
  buildItems.value = [];
  selectedEmblemIds.value = [];
  selectedBattleSpellIds.value = [];
  initialized.value = false;
  emit('cancel');
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="handleSubmit">
      <div class="form-group">
        <!-- Basic Info -->
        <div class="row pt-3">
          <div class="col-md-6">
            <FormInput 
              type="text" 
              label="Nama Build" 
              :modelValue="buildForm.name"
              @update:modelValue="updateFormField('name', $event)"
              required
            />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Role</label>
            <AppSelect
              :modelValue="buildForm.role"
              :options="roleSelectOptions"
              placeholder="Pilih Role"
              @change="(val: string | number | null) => updateFormField('role', String(val ?? ''))"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 mb-3">
            <label class="form-label fw-semibold">Hero</label>
            <AppSelect
              :modelValue="buildForm.heroId"
              :options="heroSelectOptions"
              :placeholder="heroLoading ? 'Loading heroes...' : (buildForm.role ? 'Pilih Hero' : 'Pilih role terlebih dahulu')"
              :disabled="!buildForm.role || heroLoading"
              @change="(val: string | number | null) => updateFormField('heroId', String(val ?? ''))"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <FormTextarea 
              label="Deskripsi (Opsional)" 
              :modelValue="buildForm.description || ''"
              @update:modelValue="updateFormField('description', $event)"
              :rows="3"
            />
          </div>
        </div>

        <!-- Items Section -->
        <div class="row mt-3">
          <div class="col-12">
            <ItemDragDrop 
              :availableItems="items"
              v-model="buildItems"
            />
          </div>
        </div>

        <!-- Emblems Section -->
        <div class="row mt-3">
          <div class="col-12">
            <label class="form-label fw-semibold">Emblems (Pilih 1 per Type)</label>
            <div v-for="(groupEmblems, type) in emblemsByType" :key="type" class="mb-4">
              <h6 class="text-muted mb-2">{{ type }}</h6>
              <div class="row">
                <div 
                  v-for="emblem in groupEmblems" 
                  :key="emblem._id" 
                  class="col-md-3 col-sm-4 col-6 mb-2"
                >
                  <div 
                    class="card cursor-pointer"
                    :class="{ 
                      'border-primary border-3': selectedEmblemIds.includes(emblem._id),
                      'bg-primary bg-opacity-10': selectedEmblemIds.includes(emblem._id)
                    }"
                    :style="{
                      borderColor: selectedEmblemIds.includes(emblem._id) ? '#0d6efd' : undefined,
                      borderWidth: selectedEmblemIds.includes(emblem._id) ? '3px' : undefined,
                      backgroundColor: selectedEmblemIds.includes(emblem._id) ? 'rgba(13, 110, 253, 0.1)' : undefined
                    }"
                    @click="toggleEmblem(emblem._id, emblem.type)"
                    style="cursor: pointer;"
                  >
                    <div class="card-body p-2 text-center position-relative">
                      <div v-if="selectedEmblemIds.includes(emblem._id)" 
                           class="position-absolute top-0 end-0 m-1">
                        <i class="ti ti-check-circle-filled text-primary fs-5"></i>
                      </div>
                      <img 
                        :src="emblem.icon" 
                        :alt="emblem.name" 
                        class="img-fluid mb-1"
                        style="width: 40px; height: 40px; object-fit: contain;"
                      />
                      <div class="small fw-semibold">{{ emblem.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Battle Spells Section -->
        <div class="row mt-3">
          <div class="col-12">
            <label class="form-label fw-semibold">Battle Spells (Pilih 1-2)</label>
            <div class="row">
              <div 
                v-for="spell in battleSpells" 
                :key="spell._id" 
                class="col-md-3 col-sm-4 col-6 mb-2"
              >
                <div 
                  class="card cursor-pointer"
                  :class="{ 
                    'border-primary border-3': selectedBattleSpellIds.includes(spell._id),
                    'bg-primary bg-opacity-10': selectedBattleSpellIds.includes(spell._id),
                    'opacity-50': selectedBattleSpellIds.length >= 2 && !selectedBattleSpellIds.includes(spell._id)
                  }"
                  :style="{
                    borderColor: selectedBattleSpellIds.includes(spell._id) ? '#0d6efd' : undefined,
                    borderWidth: selectedBattleSpellIds.includes(spell._id) ? '3px' : undefined,
                    backgroundColor: selectedBattleSpellIds.includes(spell._id) ? 'rgba(13, 110, 253, 0.1)' : undefined
                  }"
                  @click="toggleBattleSpell(spell._id)"
                  style="cursor: pointer;"
                >
                  <div class="card-body p-2 text-center position-relative">
                    <div v-if="selectedBattleSpellIds.includes(spell._id)" 
                         class="position-absolute top-0 end-0 m-1">
                      <i class="ti ti-check-circle-filled text-primary fs-5"></i>
                    </div>
                    <img 
                      :src="spell.icon" 
                      :alt="spell.name" 
                      class="img-fluid mb-1"
                      style="width: 40px; height: 40px; object-fit: contain;"
                    />
                    <div class="small fw-semibold">{{ spell.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="row mt-4">
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
