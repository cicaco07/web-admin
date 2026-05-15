<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import type { BuildItemInput } from '../../../../types/Build';

interface Item {
  _id: string;
  name: string;
  image: string;
  type: string;
}

const props = defineProps<{
  availableItems: Item[];
  modelValue: BuildItemInput[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: BuildItemInput[]): void;
}>();

// Local state for slots (8 slots)
const slots = ref<Array<Item | null>>(Array(8).fill(null));

// Initialize slots from modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.length > 0) {
    // Clear slots first
    slots.value = Array(8).fill(null);
    
    // Fill slots based on order
    newValue.forEach(buildItem => {
      const item = props.availableItems.find(i => i._id === buildItem.itemId);
      if (item && buildItem.order >= 1 && buildItem.order <= 8) {
        slots.value[buildItem.order - 1] = item;
      }
    });
  } else {
    slots.value = Array(8).fill(null);
  }
}, { immediate: true, deep: true });

// Items in slots (for dimming in pool)
const itemsInSlots = computed(() => {
  return slots.value.filter(item => item !== null).map(item => item!._id);
});

// Available items for pool (all items, but we'll dim the ones in slots)
const poolItems = computed(() => {
  return props.availableItems.map(item => ({
    ...item,
    inSlot: itemsInSlots.value.includes(item._id)
  }));
});

// Handle drag end from pool to slot
const onSlotChange = (slotIndex: number, event: any) => {
  // Update the slot
  if (event.added) {
    const item = event.added.element;
    // Check if item already in another slot
    const existingIndex = slots.value.findIndex(s => s && s._id === item._id);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      // Remove from old slot
      slots.value[existingIndex] = null;
    }
    slots.value[slotIndex] = item;
  } else if (event.removed) {
    slots.value[slotIndex] = null;
  }
  
  emitUpdate();
};

// Remove item from slot
const removeFromSlot = (index: number) => {
  slots.value[index] = null;
  emitUpdate();
};

// Emit update to parent
const emitUpdate = () => {
  const buildItems: BuildItemInput[] = slots.value
    .map((item, index) => {
      if (item) {
        return {
          itemId: item._id,
          order: index + 1
        };
      }
      return null;
    })
    .filter(item => item !== null) as BuildItemInput[];
  
  emit('update:modelValue', buildItems);
};
</script>

<template>
  <div class="item-drag-drop">
    <!-- Item Pool -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Item Pool (Drag ke Slot)</label>
      <div class="item-pool">
        <draggable
          :list="poolItems"
          :group="{ name: 'items', pull: 'clone', put: false }"
          :clone="(item: any) => item"
          item-key="_id"
          class="pool-grid"
          :sort="false"
        >
          <template #item="{ element }">
            <div 
              class="pool-item"
              :class="{ 'item-dimmed': element.inSlot }"
            >
              <img 
                :src="element.image" 
                :alt="element.name"
                class="item-image"
              />
              <div class="item-name">{{ element.name }}</div>
              <div class="item-type">{{ element.type }}</div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Build Slots -->
    <div>
      <label class="form-label fw-semibold">Build Slots (Max 8)</label>
      <div class="build-slots">
        <div 
          v-for="(slot, index) in slots" 
          :key="index"
          class="slot-wrapper"
        >
          <draggable
            :list="[slot].filter(s => s !== null)"
            group="items"
            item-key="_id"
            class="slot"
            :class="{ 'slot-empty': slot === null }"
            @change="onSlotChange(index, $event)"
          >
            <template #item="{ element }">
              <div class="slot-item" @click="removeFromSlot(index)">
                <div class="slot-order">{{ index + 1 }}</div>
                <img 
                  :src="element.image" 
                  :alt="element.name"
                  class="slot-image"
                />
                <div class="slot-name">{{ element.name }}</div>
                <div class="remove-hint">
                  <i class="ti ti-x"></i>
                </div>
              </div>
            </template>
          </draggable>
          <div v-if="slot === null" class="slot-placeholder">
            <div class="slot-order-placeholder">{{ index + 1 }}</div>
            <div class="slot-text">Drop Here</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-drag-drop {
  width: 100%;
}

/* Item Pool */
.item-pool {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  background-color: #f8f9fa;
}

.pool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.pool-item {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  cursor: grab;
  transition: all 0.2s;
}

.pool-item:hover {
  border-color: #0d6efd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.pool-item.item-dimmed {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 4px;
}

.item-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-type {
  font-size: 10px;
  color: #6c757d;
}

/* Build Slots */
.build-slots {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.slot-wrapper {
  position: relative;
  width: 120px;
}

.slot {
  min-height: 140px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.slot-empty {
  background: #f8f9fa;
}

.slot:hover {
  border-color: #0d6efd;
  background: #e7f1ff;
}

.slot-item {
  text-align: center;
  padding: 8px;
  cursor: pointer;
  position: relative;
}

.slot-item:hover .remove-hint {
  opacity: 1;
}

.slot-order {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #0d6efd;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.slot-image {
  width: 70px;
  height: 70px;
  object-fit: contain;
  margin-bottom: 4px;
}

.slot-name {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-hint {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.slot-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.slot-order-placeholder {
  background: #6c757d;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}

.slot-text {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

/* Drag ghost */
.ghost {
  opacity: 0.5;
  background: #c8e6c9;
}
</style>
