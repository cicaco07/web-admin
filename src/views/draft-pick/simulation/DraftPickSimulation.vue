<script setup lang="ts">
import { computed } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import DraftSetup from './components/DraftSetup.vue';
import DraftBoard from './components/DraftBoard.vue';

// API
import { useHeroes } from '../../../lib/api/HeroApi';

// Composable
import { useDraftPick } from './composables/useDraftPick';
import type { DraftConfig, Team } from './composables/useDraftPick';

// Types
import type { Hero } from '../../../types/Hero';

// ==================== Data Fetching ====================
const { result: heroResult, loading: heroLoading } = useHeroes();
const heroes = computed<Hero[]>(() => {
  const raw = heroResult.value?.heroes || [];
  return [...raw].sort((a, b) => a.name.localeCompare(b.name));
});

// ==================== Draft Pick State ====================
const {
  phase,
  config,
  blueBans,
  redBans,
  bluePicks,
  redPicks,
  activeBanTeam,
  currentPickTeam,
  currentTurnLabel,
  pickSequenceIndex,
  bannedHeroIds,
  blueBannedIds,
  redBannedIds,
  pickedHeroIds,
  unavailableHeroIds,
  isBanPhaseComplete,
  blueBansRemaining,
  redBansRemaining,
  startDraft,
  banHero,
  removeBan,
  setActiveBanTeam,
  confirmBans,
  pickHero,
  undoLastPick,
  resetDraft,
} = useDraftPick();

// ==================== Event Handlers ====================
function handleStartDraft(draftConfig: DraftConfig) {
  startDraft(draftConfig);
}

function handleSelectHero(hero: Hero) {
  if (phase.value === 'banning') {
    banHero(hero);
  } else if (phase.value === 'picking') {
    pickHero(hero);
  }
}

function handleRemoveBan(heroId: string, team: Team) {
  removeBan(heroId, team);
}
</script>

<template>
  <DashboardLayout>
    <Breadcrumb 
      title="Draft Pick Simulation"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Draft Pick' },
        { name: 'Simulation' }
      ]"
    />

    <!-- Loading State -->
    <div v-if="heroLoading" class="draft-loading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading heroes...</p>
      </div>
    </div>

    <!-- Setup Phase -->
    <DraftSetup
      v-else-if="phase === 'setup'"
      @start="handleStartDraft"
    />

    <!-- Draft Phase (Ban, Pick, Complete) -->
    <DraftBoard
      v-else
      :heroes="heroes"
      :phase="phase"
      :config="config"
      :blue-bans="blueBans"
      :red-bans="redBans"
      :blue-picks="bluePicks"
      :red-picks="redPicks"
      :active-ban-team="activeBanTeam"
      :current-pick-team="currentPickTeam"
      :current-turn-label="currentTurnLabel"
      :banned-hero-ids="bannedHeroIds"
      :blue-banned-ids="blueBannedIds"
      :red-banned-ids="redBannedIds"
      :picked-hero-ids="pickedHeroIds"
      :unavailable-hero-ids="unavailableHeroIds"
      :is-ban-phase-complete="isBanPhaseComplete"
      :blue-bans-remaining="blueBansRemaining"
      :red-bans-remaining="redBansRemaining"
      :pick-sequence-index="pickSequenceIndex"
      @select-hero="handleSelectHero"
      @remove-ban="handleRemoveBan"
      @set-active-ban-team="setActiveBanTeam"
      @confirm-bans="confirmBans"
      @undo-last-pick="undoLastPick"
      @reset-draft="resetDraft"
    />
  </DashboardLayout>
</template>

<style scoped>
.draft-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(74, 144, 217, 0.15);
  border-top-color: #4a90d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  font-weight: 500;
}
</style>