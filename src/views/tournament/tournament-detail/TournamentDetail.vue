<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import Badge from '../../../components/Badge/Badge.vue';

// API
import {
  useTournamentById,
  useTournamentStages,
  useHeroStats,
  useHeroStatsByStage,
  useSyncTournament,
} from '../../../lib/api/TournamentService';
import { alertSuccess, alertError } from '../../../lib/alert';

// Types
import type { Tournament, TournamentStage, HeroStat, SyncResult } from '../../../types/Tournament';

const route = useRoute();
const router = useRouter();
const tournamentId = computed(() => route.params.id as string);

// ==================== Stage Selection ====================
const selectedStageId = ref<string>('overall');

// ==================== Data Fetching ====================
const { result: tournamentResult, loading: tournamentLoading, refetch: refetchTournament } = useTournamentById(tournamentId);
const tournament = computed<Tournament | null>(() => tournamentResult.value?.tournament || null);

const { result: stagesResult, loading: stagesLoading, refetch: refetchStages } = useTournamentStages(tournamentId);
const stages = computed<TournamentStage[]>(() => stagesResult.value?.tournamentStages || []);

// Overall hero stats (no stageId filter)
const { result: heroStatsResult, loading: heroStatsLoading, refetch: refetchHeroStats } = useHeroStats(tournamentId);
const allHeroStats = computed<HeroStat[]>(() => heroStatsResult.value?.heroStats || []);

// Stage-specific hero stats (with stageId filter)
const { result: stageHeroStatsResult, loading: stageHeroStatsLoading, refetch: refetchStageHeroStats } = useHeroStatsByStage(tournamentId, selectedStageId);

// Watch for stage changes to refetch stage-specific data
watch(selectedStageId, () => {
  if (selectedStageId.value !== 'overall') {
    refetchStageHeroStats();
  }
});

// ==================== Available Stages ====================
const availableStages = computed(() => {
  return stages.value.map(stage => ({
    id: stage._id,
    name: stage.name,
    order: stage.order
  })).sort((a, b) => a.order - b.order);
});

// ==================== Active Hero Stats (based on selected tab) ====================
const activeHeroStats = computed<HeroStat[]>(() => {
  if (selectedStageId.value === 'overall') {
    return allHeroStats.value;
  }
  return stageHeroStatsResult.value?.heroStats || [];
});

const activeLoading = computed(() => {
  if (selectedStageId.value === 'overall') {
    return heroStatsLoading.value;
  }
  return stageHeroStatsLoading.value;
});

// ==================== Sync ====================
const { syncTournament } = useSyncTournament();
const isSyncing = ref(false);
const syncResult = ref<SyncResult | null>(null);

const hasSynced = computed(() => tournament.value?.lastSyncedAt !== null && tournament.value?.lastSyncedAt !== undefined);

const handleSync = async () => {
  isSyncing.value = true;
  syncResult.value = null;
  try {
    const result = await syncTournament({ id: tournamentId.value });
    syncResult.value = result?.data?.syncTournament || null;
    if (syncResult.value?.success) {
      alertSuccess(syncResult.value.message || 'Sinkronisasi berhasil!');
      await refetchTournament();
      await refetchStages();
      await refetchHeroStats();
      if (selectedStageId.value !== 'overall') {
        await refetchStageHeroStats();
      }
    } else {
      alertError(syncResult.value?.message || 'Sinkronisasi gagal.');
    }
  } catch (error) {
    alertError('Terjadi kesalahan saat sinkronisasi.');
    console.error('Sync error:', error);
  } finally {
    isSyncing.value = false;
  }
};

// ==================== Hero Stats Sorting ====================
const sortField = ref<string>('picksAndBans');
const sortDirection = ref<'asc' | 'desc'>('desc');

const sortedHeroStats = computed(() => {
  const data = [...activeHeroStats.value];
  data.sort((a: any, b: any) => {
    const aVal = a[sortField.value] ?? 0;
    const bVal = b[sortField.value] ?? 0;
    return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal;
  });
  return data;
});

const toggleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'desc';
  }
};

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return 'ti ti-arrows-sort';
  return sortDirection.value === 'asc' ? 'ti ti-arrow-up' : 'ti ti-arrow-down';
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

const formatPercent = (val: number | null | undefined) => {
  if (val === null || val === undefined) return '-';
  // Values from DB are already in percentage form (e.g. 54.17 means 54.17%)
  return `${val.toFixed(2)}%`;
};

const goBack = () => {
  router.push({ name: 'TournamentList' });
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Detail Tournament"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Tournament' },
        { name: 'Tournament List', href: '/tournament/tournament-list' },
        { name: tournament?.name || 'Detail' }
      ]"
    />

    <!-- Loading -->
    <div v-if="tournamentLoading" class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3 text-muted fw-semibold">Memuat data tournament...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="tournament">
      <div class="row">
        <div class="col-12">
          <div class="card">
            
            <!-- HEADER -->
            <div class="border-bottom title-part-padding d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h4 class="card-title mb-0 d-flex align-items-center gap-2">
                  <Button variant="outline-secondary" size="sm" class="py-0 px-2 me-2" @click="goBack" style="height: 28px;">
                    <i class="ti ti-arrow-left"></i>
                  </Button>
                  {{ tournament.name }}
                </h4>
              </div>
              <div>
                <Button
                  :variant="hasSynced ? 'warning' : 'primary'"
                  :loading="isSyncing"
                  :disabled="isSyncing"
                  @click="handleSync"
                  class="px-3"
                  size="sm"
                >
                  <i class="ti ti-refresh me-1"></i>
                  {{ hasSynced ? 'Sinkron Ulang' : 'Sinkron' }}
                </Button>
              </div>
            </div>

            <!-- BODY -->
            <div class="card-body">
              
              <!-- Info Grid -->
              <div class="row g-4 mb-4">
                <!-- Column 1: Core Info -->
                <div class="col-md-3">
                  <div class="mb-3">
                    <small class="text-muted d-block mb-1">Status</small>
                    <div class="d-flex gap-2 mb-1">
                      <Badge :color="getStatusColor(tournament.status)">{{ tournament.status }}</Badge>
                      <Badge color="info">{{ tournament.tier }}</Badge>
                    </div>
                  </div>
                  <div>
                    <small class="text-muted d-block mb-1">Sync Status</small>
                    <Badge :color="getSyncStatusColor(tournament.syncStatus)">
                      {{ tournament.syncStatus || 'IDLE' }}
                    </Badge>
                  </div>
                </div>

                <!-- Column 2: Region & Prize -->
                <div class="col-md-3">
                  <div class="mb-3">
                    <small class="text-muted d-block mb-1">Region</small>
                    <span class="fw-semibold">{{ tournament.region || '-' }}</span>
                  </div>
                  <div class="mb-3">
                    <small class="text-muted d-block mb-1">Prize Pool</small>
                    <span class="fw-semibold">{{ tournament.prizePool || '-' }}</span>
                  </div>
                  <div>
                    <small class="text-muted d-block mb-1">Tier Level</small>
                    <span class="fw-semibold">{{ tournament.tierLevel }}</span>
                  </div>
                </div>

                <!-- Column 3: Slugs -->
                <div class="col-md-3">
                  <div class="mb-3">
                    <small class="text-muted d-block mb-1">Internal Slug</small>
                    <span class="text-break">{{ tournament.slug }}</span>
                  </div>
                  <div>
                    <small class="text-muted d-block mb-1">Liquipedia Slug</small>
                    <span class="text-break">{{ tournament.liquipediaSlug }}</span>
                  </div>
                </div>

                <!-- Column 4: Meta & Links -->
                <div class="col-md-3">
                  <div class="mb-3">
                    <small class="text-muted d-block mb-1">Dibuat Pada</small>
                    <span>{{ formatDate(tournament.createdAt) }}</span>
                  </div>
                  <div class="mb-3">
                    <small class="text-muted d-block mb-1">Terakhir Sync</small>
                    <span>
                      {{ formatDate(tournament.lastSyncedAt) }}
                    </span>
                  </div>
                  <div v-if="tournament.liquipediaUrl">
                    <small class="text-muted d-block mb-1">Sumber Data</small>
                    <a :href="tournament.liquipediaUrl" target="_blank" class="text-primary d-inline-flex align-items-center">
                      <i class="ti ti-external-link me-1"></i>Buka Liquipedia
                    </a>
                  </div>
                </div>
              </div>

              <!-- Sync Result Alert -->
              <div v-if="syncResult" class="alert mb-4" :class="syncResult.success ? 'alert-success' : 'alert-danger'">
                <div class="d-flex align-items-center">
                  <i :class="syncResult.success ? 'ti ti-check' : 'ti ti-x'" class="me-2 fs-5"></i>
                  <div>
                    <strong>{{ syncResult.message }}</strong>
                    <span v-if="syncResult.itemsSynced" class="ms-2">({{ syncResult.itemsSynced }} item disinkronkan)</span>
                  </div>
                </div>
                <div v-if="syncResult.errors && syncResult.errors.length > 0" class="mt-2 text-danger small">
                  <div v-for="(err, i) in syncResult.errors" :key="i">{{ err }}</div>
                </div>
              </div>

              <hr class="my-4 border-secondary opacity-10">

              <!-- Stages Section -->
              <div class="mb-5">
                <div class="d-flex align-items-center mb-3">
                  <h5 class="card-title mb-0">Stages</h5>
                  <Badge color="secondary" class="ms-2">{{ stages.length }}</Badge>
                </div>
                
                <div v-if="stagesLoading" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <span class="ms-2 text-muted">Memuat stages...</span>
                </div>
                
                <div v-else-if="stages.length === 0" class="text-center py-4 text-muted bg-light rounded border border-dashed">
                  <i class="ti ti-folder-off fs-1 d-block mb-2 text-secondary"></i>
                   Belum ada data stages. Lakukan sinkronisasi terlebih dahulu.
                </div>

                <div v-else class="row g-3">
                  <div v-for="stage in stages" :key="stage._id" class="col-md-4 col-lg-3">
                    <div class="card bg-light border h-100 mb-0">
                      <div class="card-body p-3">
                        <div class="d-flex align-items-center mb-2">
                          <span class="badge bg-primary rounded-circle p-0 d-flex align-items-center justify-content-center me-2" style="width: 24px; height: 24px;">
                            {{ stage.order }}
                          </span>
                          <h6 class="mb-0 fw-semibold text-truncate">{{ stage.name }}</h6>
                        </div>
                        <small class="text-muted d-block text-truncate mb-2" :title="stage.slug">{{ stage.slug }}</small>
                         <a
                          v-if="stage.liquipediaUrl"
                          :href="stage.liquipediaUrl"
                          target="_blank"
                          class="text-primary small d-inline-block"
                        >
                          <i class="ti ti-external-link me-1"></i>Liquipedia
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4 border-secondary opacity-10">

              <!-- Hero Stats Section -->
              <div>
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="d-flex align-items-center">
                    <h5 class="card-title mb-0">Hero Stats</h5>
                    <Badge color="secondary" class="ms-2">{{ sortedHeroStats.length }}</Badge>
                  </div>
                </div>

                <!-- Stage Tabs -->
                <ul class="nav nav-tabs mb-3">
                  <li v-for="stage in availableStages" :key="stage.id" class="nav-item">
                    <a 
                      class="nav-link cursor-pointer" 
                      :class="{ active: selectedStageId === stage.id }"
                      @click.prevent="selectedStageId = stage.id"
                    >
                      {{ stage.name }}
                    </a>
                  </li>
                </ul>

                <div v-if="activeLoading" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <span class="ms-2 text-muted">Memuat hero stats...</span>
                </div>

                <div v-else-if="sortedHeroStats.length === 0" class="text-center py-4 text-muted bg-light rounded border border-dashed">
                  <i class="ti ti-chart-off fs-1 d-block mb-2 text-secondary"></i>
                  Belum ada data hero stats. Lakukan sinkronisasi terlebih dahulu.
                </div>

                <div v-else class="table-responsive border rounded">
                  <table class="table table-hover table-striped mb-0 align-middle">
                    <thead class="table-light">
                      <tr class="text-center small text-muted text-uppercase fw-bold">
                        <th style="width: 50px;">No</th>
                        <th class="text-start cursor-pointer" @click="toggleSort('heroName')">
                          Hero <i :class="getSortIcon('heroName')"></i>
                        </th>
                        <th class="cursor-pointer" @click="toggleSort('picks')">Picks <i :class="getSortIcon('picks')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('bans')">Bans <i :class="getSortIcon('bans')"></i></th>
                        <th class="cursor-pointer bg-light border-start border-end" @click="toggleSort('picksAndBans')">P+B <i :class="getSortIcon('picksAndBans')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('wins')">Wins <i :class="getSortIcon('wins')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('losses')">Loss <i :class="getSortIcon('losses')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('winRate')">WR% <i :class="getSortIcon('winRate')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('pickRate')">Pick% <i :class="getSortIcon('pickRate')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('banRate')">Ban% <i :class="getSortIcon('banRate')"></i></th>
                        <th class="cursor-pointer" @click="toggleSort('presenceRate')">Pres% <i :class="getSortIcon('presenceRate')"></i></th>
                      </tr>
                    </thead>
                    <tbody class="small">
                      <tr v-for="(stat, index) in sortedHeroStats" :key="stat.heroName" class="text-center">
                        <td>{{ index + 1 }}</td>
                        <td class="text-start fw-semibold">{{ stat.heroName }}</td>
                        <td>{{ stat.picks }}</td>
                        <td>{{ stat.bans }}</td>
                        <td class="bg-light border-start border-end fw-bold">{{ stat.picksAndBans }}</td>
                        <td class="text-success">{{ stat.wins }}</td>
                        <td class="text-danger">{{ stat.losses }}</td>
                        <td>
                          <Badge :color="(stat.winRate ?? 0) >= 50 ? 'success' : 'danger'" size="sm">
                            {{ formatPercent(stat.winRate) }}
                          </Badge>
                        </td>
                        <td>{{ formatPercent(stat.pickRate) }}</td>
                        <td>{{ formatPercent(stat.banRate) }}</td>
                        <td>
                          <Badge :color="(stat.presenceRate ?? 0) >= 80 ? 'warning' : 'info'" size="sm">
                            {{ formatPercent(stat.presenceRate) }}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div> <!-- End Card Body -->
          </div>
        </div>
      </div>
    </template>
    
    <!-- Not Found -->
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body text-center py-5">
             <i class="ti ti-alert-circle fs-1 text-warning mb-3"></i>
             <h5>Data Tournament Tidak Ditemukan</h5>
             <Button variant="primary" class="mt-3" @click="goBack">
               Kembali ke Daftar
             </Button>
          </div>
        </div>
      </div>
    </div>
    
  </DashboardLayout>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}
.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border-style: dashed !important;
}
</style>
