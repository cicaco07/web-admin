<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import Badge from '../../../components/Badge/Badge.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Tournament Components
import TournamentFormModal from './components/TournamentFormModal.vue';

// API & Services
import { useTournaments } from '../../../lib/api/TournamentService';
import { useTournamentService } from '../../../lib/service/TournamentService';

// Types
import type { Tournament, TournamentFormData } from '../../../types/Tournament';
import { createDefaultTournamentForm, TIER_OPTIONS, STATUS_OPTIONS } from '../../../types/Tournament';

const router = useRouter();

// ==================== Data Fetching ====================
const { result: tournamentResult, loading: tournamentLoading, refetch } = useTournaments();
const tournaments = computed<Tournament[]>(() => tournamentResult.value?.tournaments || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleCreateTournament, handleUpdateTournament, handleDeleteTournament } = useTournamentService(safeRefetch);

// ==================== Search & Filter ====================
const searchQuery = ref('');
const selectedFilterTier = ref('');
const selectedFilterStatus = ref('');

const filteredTournaments = computed<Tournament[]>(() => {
  let filtered = tournaments.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((t: Tournament) =>
      t.name.toLowerCase().includes(query) ||
      t.region?.toLowerCase().includes(query) ||
      t.liquipediaSlug?.toLowerCase().includes(query)
    );
  }

  if (selectedFilterTier.value) {
    filtered = filtered.filter((t: Tournament) => t.tier === selectedFilterTier.value);
  }

  if (selectedFilterStatus.value) {
    filtered = filtered.filter((t: Tournament) => t.status === selectedFilterStatus.value);
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedTournaments = computed<Tournament[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTournaments.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const tournamentForm = ref<TournamentFormData>(createDefaultTournamentForm());
const isSubmitting = ref(false);

// Edit Form State
const editTournamentId = ref<string>('');
const editForm = ref<TournamentFormData>(createDefaultTournamentForm());
const isEditSubmitting = ref(false);

// ==================== Form Actions ====================
const resetForm = () => {
  tournamentForm.value = createDefaultTournamentForm();
};

const onAddTournament = async () => {
  isSubmitting.value = true;
  try {
    await handleCreateTournament(tournamentForm.value);
    resetForm();
  } catch (error) {
    console.error('Error adding tournament:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const openEditModal = (tournament: Tournament) => {
  editTournamentId.value = tournament._id;
  editForm.value = {
    name: tournament.name,
    slug: tournament.slug,
    tier: tournament.tier,
    tierLevel: tournament.tierLevel,
    region: tournament.region,
    liquipediaUrl: tournament.liquipediaUrl || '',
    liquipediaSlug: tournament.liquipediaSlug || '',
    status: tournament.status,
    prizePool: tournament.prizePool || '',
  };
  const modal = (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-tournament'));
  modal?.show();
};

const onUpdateTournament = async () => {
  isEditSubmitting.value = true;
  try {
    await handleUpdateTournament(editTournamentId.value, editForm.value);
    editTournamentId.value = '';
    editForm.value = createDefaultTournamentForm();
  } catch (error) {
    console.error('Error updating tournament:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};

// ==================== Navigation ====================
const goToDetail = (tournament: Tournament) => {
  router.push({ name: 'TournamentDetail', params: { id: tournament._id } });
};

// ==================== Helpers ====================
const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (status?.toUpperCase()) {
    case 'ONGOING': return 'success';
    case 'UPCOMING': return 'info';
    case 'COMPLETED': return 'secondary';
    case 'CANCELLED': return 'danger';
    default: return 'secondary';
  }
};

const getSyncStatusColor = (syncStatus: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (syncStatus?.toUpperCase()) {
    case 'SYNCED': return 'success';
    case 'SYNCING': return 'warning';
    case 'IDLE': return 'secondary';
    case 'FAILED': return 'danger';
    default: return 'secondary';
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Tournament List"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Tournament' },
        { name: 'Tournament List' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Tournament</h4>
          </div>

          <div class="card-body">
            <!-- Search & Filter Section -->
            <div class="row mb-3">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Cari nama, region, atau slug..."
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
              <div class="col-md-2">
                <select
                  class="form-select"
                  v-model="selectedFilterTier"
                  @change="currentPage = 1"
                >
                  <option value="">Semua Tier</option>
                  <option
                    v-for="tier in TIER_OPTIONS"
                    :key="tier"
                    :value="tier"
                  >
                    {{ tier }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select
                  class="form-select"
                  v-model="selectedFilterStatus"
                  @change="currentPage = 1"
                >
                  <option value="">Semua Status</option>
                  <option
                    v-for="status in STATUS_OPTIONS"
                    :key="status"
                    :value="status"
                  >
                    {{ status }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <button
                  class="btn btn-outline-secondary w-100"
                  @click="searchQuery = ''; selectedFilterTier = ''; selectedFilterStatus = ''; currentPage = 1"
                >
                  <i class="ti ti-refresh me-1"></i>
                  Reset Filter
                </button>
              </div>
            </div>

            <!-- Add Tournament Button -->
            <div class="row mb-3">
              <div class="col-md-12 d-flex justify-content-end">
                <ModalButton
                  variant="info"
                  font="medium"
                  size="lg"
                  dataBsTarget="add-tournament"
                >
                  <i class="ti ti-plus me-1"></i>
                  Tambah Tournament
                </ModalButton>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || selectedFilterTier || selectedFilterStatus" class="alert alert-info py-2 mb-3">
              <div class="d-flex align-items-center">
                <i class="ti ti-filter me-2"></i>
                <span>Menampilkan {{ filteredTournaments.length }} dari {{ tournaments.length }} tournament</span>
                <span v-if="searchQuery" class="ms-2">
                  | Pencarian: <strong>{{ searchQuery }}</strong>
                </span>
                <span v-if="selectedFilterTier" class="ms-2">
                  | Tier: <strong>{{ selectedFilterTier }}</strong>
                </span>
                <span v-if="selectedFilterStatus" class="ms-2">
                  | Status: <strong>{{ selectedFilterStatus }}</strong>
                </span>
              </div>
            </div>

            <!-- Add Modal -->
            <TournamentFormModal
              modalId="add-tournament"
              title="Tambah Tournament"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :tournamentForm="tournamentForm"
              @update:tournamentForm="tournamentForm = $event"
              @submit="onAddTournament"
              @cancel="resetForm"
            />

            <!-- Edit Modal -->
            <TournamentFormModal
              modalId="edit-tournament"
              title="Edit Tournament"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :tournamentForm="editForm"
              @update:tournamentForm="editForm = $event"
              @submit="onUpdateTournament"
              @cancel="editForm = createDefaultTournamentForm()"
            />

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama</th>
                    <th>Tier</th>
                    <th style="width: 80px;">Level</th>
                    <th>Status</th>
                    <th>Sync Status</th>
                    <th>Last Synced</th>
                    <th style="width: 180px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="tournamentLoading">
                    <td colspan="8" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data tournament...
                      </div>
                    </td>
                  </tr>

                  <!-- Data Rows -->
                  <tr
                    v-for="(tournament, index) in paginatedTournaments"
                    :key="tournament._id"
                    class="text-center align-middle"
                    v-show="!tournamentLoading"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    <td class="fw-semibold text-start">{{ tournament.name }}</td>
                    <td>
                      <Badge color="info">{{ tournament.tier }}</Badge>
                    </td>
                    <td>{{ tournament.tierLevel }}</td>
                    <td>
                      <Badge :color="getStatusColor(tournament.status)">
                        {{ tournament.status }}
                      </Badge>
                    </td>
                    <td>
                      <Badge :color="getSyncStatusColor(tournament.syncStatus)">
                        {{ tournament.syncStatus || 'IDLE' }}
                      </Badge>
                    </td>
                    <td class="text-muted small">
                      {{ formatDate(tournament.lastSyncedAt) }}
                    </td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <Button
                          variant="primary"
                          size="sm"
                          type="button"
                          @click="goToDetail(tournament)"
                          class="px-3"
                        >
                          <i class="ti ti-eye"></i>
                        </Button>

                        <!-- Edit Button -->
                        <Button
                          variant="warning"
                          size="sm"
                          type="button"
                          @click="openEditModal(tournament)"
                          class="px-3"
                        >
                          <i class="ti ti-edit"></i>
                        </Button>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          size="sm"
                          type="button"
                          @click="handleDeleteTournament(tournament._id)"
                          class="px-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!tournamentLoading && paginatedTournaments.length === 0 && tournaments.length > 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada tournament yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!tournamentLoading && tournaments.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data tournament
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!tournamentLoading && filteredTournaments.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredTournaments.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>