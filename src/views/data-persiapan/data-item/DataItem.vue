<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import ImportModal from '../../../components/Modal/ImportModal.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Item Components
import ItemFormModal from './components/ItemFormModal.vue';
import ItemDetailModal from './components/ItemDetailModal.vue';

// API & Services
import { useCreateItem, useItems, useUpdateItem } from '../../../lib/api/ItemApi';
import { useItemService } from '../../../lib/service/ItemService';
import { alertError, alertSuccess } from '../../../lib/alert';
import { downloadItemTemplate, exportItems, parseItemFile } from '../../../lib/excel/item.excel';

// Types
import type { Item, ItemFormData } from '../../../types/Item';
import { createDefaultItemForm, ITEM_TYPE_OPTIONS } from '../../../types/Item';

// ==================== Data Fetching ====================
const { result: itemResult, loading: itemLoading, refetch } = useItems();
const items = computed<Item[]>(() => itemResult.value?.items || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddItem, handleEditItem, handleDeleteItem } = useItemService(safeRefetch);

// ==================== Search & Filter ====================
const searchQuery = ref('');
const selectedFilterType = ref('');

const filteredItems = computed<Item[]>(() => {
  let filtered = items.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((item: Item) => 
      item.name.toLowerCase().includes(query) ||
      item.tag.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.attributes && item.attributes.join(' ').toLowerCase().includes(query))
    );
  }

  // Filter by type
  if (selectedFilterType.value) {
    filtered = filtered.filter((item: Item) => item.type === selectedFilterType.value);
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedItems = computed<Item[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

const activeFilterCount = computed(() => (selectedFilterType.value ? 1 : 0));

const resetFilters = () => {
  searchQuery.value = '';
  selectedFilterType.value = '';
  currentPage.value = 1;
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

// ==================== Excel Import / Export ====================
const isImporting = ref(false);
const itemToken = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
const { createItem } = useCreateItem(itemToken);
const { updateItem } = useUpdateItem(itemToken);

const handleExport = () => {
  if (items.value.length === 0) {
    alertError('Tidak ada data item untuk diekspor.');
    return;
  }
  exportItems(filteredItems.value.length ? filteredItems.value : items.value);
};

const handleDownloadTemplate = downloadItemTemplate;

const handleImport = async (file: File) => {
  isImporting.value = true;
  try {
    const inputs = await parseItemFile(file);
    let createCount = 0;
    let updateCount = 0;
    const failures: string[] = [];

    for (const input of inputs) {
      try {
        const existing = items.value.find((item) => item.name.toLowerCase() === input.name.toLowerCase());
        const itemInput = { ...input, price: Number(input.price) };
        if (existing) {
          await updateItem({ id: existing._id, input: itemInput });
          updateCount++;
        } else {
          await createItem({ input: itemInput });
          createCount++;
        }
      } catch (err) {
        failures.push(`${input.name || '(tanpa nama)'}: ${err instanceof Error ? err.message : 'gagal'}`);
      }
    }

    await safeRefetch();

    const successCount = createCount + updateCount;
    if (failures.length === 0) {
      alertSuccess(`Berhasil mengimpor ${successCount} item (${createCount} baru, ${updateCount} update).`);
    } else if (successCount === 0) {
      alertError(`Gagal mengimpor semua data. ${failures.slice(0, 3).join(' | ')}`);
    } else {
      alertSuccess(`Impor selesai: ${successCount} berhasil (${createCount} baru, ${updateCount} update), ${failures.length} gagal. ${failures.slice(0, 3).join(' | ')}`);
    }
  } catch (err) {
    alertError(err instanceof Error ? err.message : 'Gagal memproses file.');
    throw err;
  } finally {
    isImporting.value = false;
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
            <!-- Search & Actions Section -->
            <div class="row g-3 align-items-center mb-3">
              <div class="col-12 col-lg-5">
                <div class="input-group">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Cari nama, tag, tipe, atau attribut..."
                    v-model="searchQuery"
                    @keyup="currentPage = 1"
                  >
                  <button 
                    v-if="searchQuery"
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="searchQuery = ''; currentPage = 1"
                  >
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-12 col-lg-7">
                <div class="row g-2 hero-action-row">
                  <div class="col-6 col-md-3">
                    <button type="button" class="btn btn-success w-100 hero-action-btn" @click="handleExport">
                      <i class="ti ti-file-export me-1"></i>
                      Export Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-primary w-100 hero-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#import-item"
                    >
                      <i class="ti ti-file-import me-1"></i>
                      Import Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-outline-secondary w-100 hero-action-btn position-relative"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#item-filter-offcanvas"
                      aria-controls="item-filter-offcanvas"
                    >
                      <i class="ti ti-adjustments-horizontal me-1"></i>
                      Filter
                      <span
                        v-if="activeFilterCount > 0"
                        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      >
                        {{ activeFilterCount }}
                      </span>
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-info w-100 hero-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#add-item"
                    >
                      <i class="ti ti-plus me-1"></i>
                      Tambah Item
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || selectedFilterType" class="alert alert-info py-2 mb-3 d-flex align-items-center flex-wrap gap-2">
              <i class="ti ti-filter"></i>
              <span>Menampilkan <strong>{{ filteredItems.length }}</strong> dari <strong>{{ items.length }}</strong> item</span>
              <span v-if="searchQuery" class="badge bg-primary-subtle text-primary">
                Pencarian: {{ searchQuery }}
              </span>
              <span v-if="selectedFilterType" class="badge bg-info-subtle text-info">
                Tipe: {{ selectedFilterType }}
              </span>
              <button type="button" class="btn btn-sm btn-outline-secondary ms-auto" @click="resetFilters">
                <i class="ti ti-refresh me-1"></i> Reset
              </button>
            </div>

            <!-- Filter Offcanvas -->
            <div
              class="offcanvas offcanvas-end"
              tabindex="-1"
              id="item-filter-offcanvas"
              aria-labelledby="item-filter-offcanvas-label"
            >
              <div class="offcanvas-header border-bottom bg-light">
                <h5 class="offcanvas-title d-flex align-items-center" id="item-filter-offcanvas-label">
                  <i class="ti ti-adjustments-horizontal me-2 text-primary"></i>
                  Filter Item
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
              </div>
              <div class="offcanvas-body">
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-category me-1 text-info"></i>
                    Tipe Item
                  </label>
                  <select class="form-select" v-model="selectedFilterType" @change="currentPage = 1">
                    <option value="">Semua Tipe</option>
                    <option v-for="type in ITEM_TYPE_OPTIONS" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                  <small class="text-muted">Saring item berdasarkan kategori tipe.</small>
                </div>

                <div class="alert alert-light border d-flex align-items-center small mb-0">
                  <i class="ti ti-info-circle me-2 text-primary"></i>
                  Filter akan diterapkan otomatis saat dipilih.
                </div>
              </div>
              <div class="offcanvas-footer border-top p-3 d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary flex-fill" @click="resetFilters">
                  <i class="ti ti-refresh me-1"></i>
                  Reset
                </button>
                <button type="button" class="btn btn-primary flex-fill" data-bs-dismiss="offcanvas">
                  Selesai
                </button>
              </div>
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

            <!-- Import Item Modal -->
            <ImportModal
              modalId="import-item"
              title="Import Data Item"
              templateFileName="template-data-item.xlsx"
              templateHint="Template berisi 1 baris contoh dan sheet petunjuk pengisian. Pilihan tipe item valid ada pada sheet Petunjuk."
              uploadHint="Pastikan kolom Atribut dipisahkan koma dan Deskripsi dipisahkan tanda | jika lebih dari satu baris."
              :isImporting="isImporting"
              :onDownloadTemplate="handleDownloadTemplate"
              :onUpload="handleImport"
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
                  <!-- Loading State -->
                  <tr v-if="itemLoading">
                    <td colspan="8" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data item...
                      </div>
                    </td>
                  </tr>

                  <!-- Item Data Rows -->
                  <tr 
                    v-for="(item, index) in paginatedItems" 
                    :key="item._id" 
                    class="text-center align-middle"
                    v-show="!itemLoading"
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

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!itemLoading && paginatedItems.length === 0 && items.length > 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada item yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!itemLoading && items.length === 0">
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
              v-if="!itemLoading && filteredItems.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredItems.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.hero-action-btn {
  min-height: 42px;
  font-weight: 600;
}

.hero-action-row .btn {
  white-space: nowrap;
}

.offcanvas-footer {
  background: #fff;
}
</style>
