<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Item Components
import ItemFormModal from './components/ItemFormModal.vue';
import ItemDetailModal from './components/ItemDetailModal.vue';

// API & Services
import { useItems } from '../../../lib/api/ItemApi';
import { useItemService } from '../../../lib/service/ItemService';

// Types
import type { Item, ItemFormData } from '../../../types/Item';
import { createDefaultItemForm } from '../../../types/Item';

// ==================== Data Fetching ====================
const { result: itemResult, refetch } = useItems();
const items = computed(() => itemResult.value?.items || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddItem, handleEditItem, handleDeleteItem } = useItemService(safeRefetch);

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return items.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const itemForm = ref<ItemFormData>(createDefaultItemForm());
const editItemForm = ref<ItemFormData>(createDefaultItemForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);

// ==================== Detail Modal State ====================
const selectedItem = ref<Item | null>(null);

// ==================== Form Actions ====================
const resetForm = () => {
  itemForm.value = createDefaultItemForm();
};

const resetEditForm = () => {
  editItemForm.value = createDefaultItemForm();
};

const openEditModal = (item: Item) => {
  editItemForm.value = {
    _id: item._id,
    name: item.name,
    type: item.type,
    tag: item.tag,
    attributes: item.attributes || [],
    price: item.price,
    image: item.image,
    story: item.story,
    description: item.description || [],
    tips: item.tips,
    parent_items: item.parent_items || []
  };
};

const openDetailModal = (item: Item) => {
  selectedItem.value = item;
};

// ==================== Submit Handlers ====================
const onAddItem = async (data: { attributes: string[]; description: string[] }) => {
  isSubmitting.value = true;
  try {
    const formData = { ...itemForm.value, ...data };
    await handleAddItem(formData);
    resetForm();
  } catch (error) {
    console.error('Error adding item:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditItem = async (data: { attributes: string[]; description: string[] }) => {
  isEditSubmitting.value = true;
  try {
    const formData = { ...editItemForm.value, ...data };
    await handleEditItem(formData);
    resetEditForm();
  } catch (error) {
    console.error('Error editing item:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Item"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Persiapan' },
        { name: 'Item' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Item</h4>
          </div>

          <div class="card-body">
            <!-- Add Button -->
            <div class="d-flex justify-content-end mb-3">
              <ModalButton
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-item"
              >
                <i class="ti ti-plus me-1"></i>
                Tambah Item
              </ModalButton>
            </div>

            <!-- Add Modal -->
            <ItemFormModal
              modalId="add-item"
              title="Tambah Data Item"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :itemForm="itemForm"
              @update:itemForm="itemForm = $event"
              @submit="onAddItem"
              @cancel="resetForm"
            />

            <!-- Edit Modal -->
            <ItemFormModal
              modalId="edit-item"
              title="Edit Data Item"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :itemForm="editItemForm"
              @update:itemForm="editItemForm = $event"
              @submit="onEditItem"
              @cancel="resetEditForm"
            />

            <!-- Detail Modal -->
            <ItemDetailModal
              modalId="detail-item"
              :item="selectedItem"
            />

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama</th>
                    <th style="width: 80px;">Gambar</th>
                    <th>Tag</th>
                    <th>Tipe</th>
                    <th>Attribut</th>
                    <th style="width: 100px;">Harga</th>
                    <th style="width: 200px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(item, index) in paginatedItems" 
                    :key="item._id" 
                    class="text-center align-middle"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    <td>{{ item.name }}</td>
                    <td>
                      <img 
                        :src="item.image" 
                        alt="Item" 
                        class="img-fluid" 
                        style="width: 50px; height: 50px; object-fit: contain;" 
                      />
                    </td>
                    <td>{{ item.tag }}</td>
                    <td>{{ item.type }}</td>
                    <td class="text-start">
                      {{ item.attributes?.join(', ') || '-' }}
                    </td>
                    <td>{{ item.price }}</td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <ModalButton
                          variant="secondary"
                          font="medium"
                          size="sm"
                          dataBsTarget="detail-item"
                          @click="openDetailModal(item)"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-item"
                          @click="openEditModal(item)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteItem(item._id)"
                          class="px-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State -->
                  <tr v-if="items.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data item
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="items.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="items.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
