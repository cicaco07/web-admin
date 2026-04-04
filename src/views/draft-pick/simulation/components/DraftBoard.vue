<script setup lang="ts">
import type { Hero } from '../../../../types/Hero';
import type { Team, DraftPhase, DraftConfig } from '../composables/useDraftPick';
import TeamPanel from './TeamPanel.vue';
import HeroGrid from './HeroGrid.vue';

interface Props {
  heroes: Hero[];
  phase: DraftPhase;
  config: DraftConfig;
  blueBans: Hero[];
  redBans: Hero[];
  bluePicks: Hero[];
  redPicks: Hero[];
  activeBanTeam: Team;
  currentPickTeam: Team | null;
  currentTurnLabel: string;
  bannedHeroIds: Set<string>;
  blueBannedIds: Set<string>;
  redBannedIds: Set<string>;
  pickedHeroIds: Set<string>;
  unavailableHeroIds: Set<string>;
  isBanPhaseComplete: boolean;
  blueBansRemaining: number;
  redBansRemaining: number;
  pickSequenceIndex: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  selectHero: [hero: Hero];
  removeBan: [heroId: string, team: Team];
  setActiveBanTeam: [team: Team];
  confirmBans: [];
  undoLastPick: [];
  resetDraft: [];
}>();

function handleSelectHero(hero: Hero) {
  emit('selectHero', hero);
}

function getPhaseTitle(): string {
  switch (props.phase) {
    case 'banning': return '🚫 BAN PHASE';
    case 'picking': return '⚔️ PICK PHASE';
    case 'complete': return '✅ DRAFT COMPLETE';
    default: return '';
  }
}

function getPhaseSubtitle(): string {
  if (props.phase === 'banning') {
    const team = props.activeBanTeam === 'blue' ? 'Blue Team' : 'Red Team';
    const remaining = props.activeBanTeam === 'blue' ? props.blueBansRemaining : props.redBansRemaining;
    if (remaining <= 0) {
      return props.isBanPhaseComplete ? 'All bans complete — proceed to picking' : `Switch to the other team to continue banning`;
    }
    return `${team} — ${remaining} ban${remaining > 1 ? 's' : ''} remaining`;
  }
  if (props.phase === 'picking') {
    return props.currentTurnLabel;
  }
  return 'Both teams have completed their draft!';
}
</script>

<template>
  <div class="draft-board">
    <!-- Phase Header -->
    <div class="phase-header">
      <div class="phase-info">
        <h3 class="phase-title">{{ getPhaseTitle() }}</h3>
        <p class="phase-subtitle">{{ getPhaseSubtitle() }}</p>
      </div>

      <!-- Pick Sequence Tracker (only in pick phase) -->
      <div v-if="phase === 'picking'" class="pick-tracker">
        <div
          v-for="(team, idx) in (config.firstPickTeam === 'blue'
            ? ['B','R','R','B','B','R','R','B','B','R']
            : ['R','B','B','R','R','B','B','R','R','B'])"
          :key="idx"
          class="tracker-dot"
          :class="{
            'dot-blue': team === 'B',
            'dot-red': team === 'R',
            'dot-done': idx < pickSequenceIndex,
            'dot-current': idx === pickSequenceIndex,
            'dot-future': idx > pickSequenceIndex
          }"
        >
          {{ idx + 1 }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="phase-actions">
        <button
          v-if="phase === 'banning' && isBanPhaseComplete"
          class="action-btn confirm-btn"
          @click="emit('confirmBans')"
        >
          <i class="ti ti-arrow-right me-1"></i>
          Proceed to Pick
        </button>
        <button
          v-if="phase === 'picking' && pickSequenceIndex > 0"
          class="action-btn undo-btn"
          @click="emit('undoLastPick')"
        >
          <i class="ti ti-arrow-back-up me-1"></i>
          Undo
        </button>
        <button class="action-btn reset-btn" @click="emit('resetDraft')">
          <i class="ti ti-refresh me-1"></i>
          Reset
        </button>
      </div>
    </div>

    <!-- Main Board Layout -->
    <div class="board-main">
      <!-- Blue Team Panel -->
      <TeamPanel
        team="blue"
        :bans="blueBans"
        :picks="bluePicks"
        :ban-count="config.banCount"
        :is-active-ban-team="phase === 'banning' && activeBanTeam === 'blue'"
        :is-active-pick-team="phase === 'picking' && currentPickTeam === 'blue'"
        :phase="phase"
        @remove-ban="emit('removeBan', $event, 'blue')"
        @select-ban-team="emit('setActiveBanTeam', 'blue')"
      />

      <!-- Hero Grid -->
      <HeroGrid
        :heroes="heroes"
        :banned-hero-ids="bannedHeroIds"
        :blue-banned-ids="blueBannedIds"
        :red-banned-ids="redBannedIds"
        :picked-hero-ids="pickedHeroIds"
        :unavailable-hero-ids="unavailableHeroIds"
        :phase="phase"
        :active-ban-team="activeBanTeam"
        :current-pick-team="currentPickTeam"
        @select-hero="handleSelectHero"
      />

      <!-- Red Team Panel -->
      <TeamPanel
        team="red"
        :bans="redBans"
        :picks="redPicks"
        :ban-count="config.banCount"
        :is-active-ban-team="phase === 'banning' && activeBanTeam === 'red'"
        :is-active-pick-team="phase === 'picking' && currentPickTeam === 'red'"
        :phase="phase"
        @remove-ban="emit('removeBan', $event, 'red')"
        @select-ban-team="emit('setActiveBanTeam', 'red')"
      />
    </div>

    <!-- Complete Phase Summary -->
    <div v-if="phase === 'complete'" class="complete-summary">
      <div class="summary-card blue-summary">
        <h4>🔵 Blue Team</h4>
        <div class="summary-heroes">
          <div v-for="hero in bluePicks" :key="hero._id" class="summary-hero">
            <img :src="hero.avatar" :alt="hero.name" />
            <span>{{ hero.name }}</span>
          </div>
        </div>
      </div>
      <div class="vs-badge">VS</div>
      <div class="summary-card red-summary">
        <h4>🔴 Red Team</h4>
        <div class="summary-heroes">
          <div v-for="hero in redPicks" :key="hero._id" class="summary-hero">
            <img :src="hero.avatar" :alt="hero.name" />
            <span>{{ hero.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draft-board {
  background: linear-gradient(180deg, #0a0a1a 0%, #111128 40%, #0d0d20 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
}

/* Phase Header */
.phase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
  gap: 12px;
}

.phase-info {
  flex-shrink: 0;
}

.phase-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 1px;
}

.phase-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin: 4px 0 0;
}

/* Pick Tracker */
.pick-tracker {
  display: flex;
  gap: 4px;
  align-items: center;
}

.tracker-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.tracker-dot.dot-blue {
  color: #7ab8f5;
}

.tracker-dot.dot-red {
  color: #f5a8a0;
}

.tracker-dot.dot-done {
  opacity: 0.3;
}

.tracker-dot.dot-done.dot-blue {
  background: rgba(74, 144, 217, 0.3);
}

.tracker-dot.dot-done.dot-red {
  background: rgba(231, 76, 60, 0.3);
}

.tracker-dot.dot-current {
  transform: scale(1.2);
  animation: pulseDot 1.5s ease-in-out infinite;
}

.tracker-dot.dot-current.dot-blue {
  background: rgba(74, 144, 217, 0.5);
  box-shadow: 0 0 12px rgba(74, 144, 217, 0.4);
  color: #fff;
}

.tracker-dot.dot-current.dot-red {
  background: rgba(231, 76, 60, 0.5);
  box-shadow: 0 0 12px rgba(231, 76, 60, 0.4);
  color: #fff;
}

.tracker-dot.dot-future {
  opacity: 0.2;
  background: rgba(255, 255, 255, 0.05);
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1.2); }
  50% { transform: scale(1.35); }
}

/* Action Buttons */
.phase-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
}

.confirm-btn {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #052e16;
  box-shadow: 0 2px 12px rgba(74, 222, 128, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(74, 222, 128, 0.4);
}

.undo-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.undo-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.reset-btn {
  background: rgba(231, 76, 60, 0.15);
  color: #f5a8a0;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.reset-btn:hover {
  background: rgba(231, 76, 60, 0.25);
}

/* Main Board */
.board-main {
  display: flex;
  gap: 16px;
  min-height: 450px;
}

/* Complete Summary */
.complete-summary {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px 0;
}

.summary-card {
  flex: 1;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.06);
}

.blue-summary {
  background: rgba(74, 144, 217, 0.08);
  border-color: rgba(74, 144, 217, 0.2);
}

.red-summary {
  background: rgba(231, 76, 60, 0.08);
  border-color: rgba(231, 76, 60, 0.2);
}

.summary-card h4 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px;
  text-align: center;
}

.summary-heroes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}

.summary-hero img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.summary-hero span {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
}

.vs-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.15);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 3px;
  flex-shrink: 0;
}
</style>
