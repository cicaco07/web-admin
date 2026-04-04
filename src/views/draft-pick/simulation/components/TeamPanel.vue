<script setup lang="ts">
import type { Hero } from '../../../../types/Hero';
import type { Team, DraftPhase } from '../composables/useDraftPick';

interface Props {
  team: Team;
  bans: Hero[];
  picks: Hero[];
  banCount: number;
  isActiveBanTeam: boolean;
  isActivePickTeam: boolean;
  phase: DraftPhase;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  removeBan: [heroId: string];
  selectBanTeam: [];
}>();

function getBanSlots() {
  const slots = [];
  for (let i = 0; i < props.banCount; i++) {
    slots.push(props.bans[i] || null);
  }
  return slots;
}

function getPickSlots() {
  const slots = [];
  for (let i = 0; i < 5; i++) {
    slots.push(props.picks[i] || null);
  }
  return slots;
}
</script>

<template>
  <div
    class="team-panel"
    :class="[
      `team-${team}`,
      {
        'active-ban': phase === 'banning' && isActiveBanTeam,
        'active-pick': phase === 'picking' && isActivePickTeam,
      }
    ]"
  >
    <!-- Team Header -->
    <div class="team-header" @click="phase === 'banning' ? emit('selectBanTeam') : undefined">
      <div class="team-header-content">
        <div class="team-badge">
          <i class="ti ti-shield-filled"></i>
        </div>
        <span class="team-title">{{ team === 'blue' ? 'BLUE' : 'RED' }} TEAM</span>
      </div>
      <div
        v-if="phase === 'banning'"
        class="ban-team-indicator"
        :class="{ 'indicator-active': isActiveBanTeam }"
      >
        <span v-if="isActiveBanTeam" class="indicator-pulse">● BANNING</span>
        <span v-else class="indicator-idle">Click to ban</span>
      </div>
      <div v-if="phase === 'picking' && isActivePickTeam" class="pick-indicator">
        <span class="indicator-pulse">● PICKING</span>
      </div>
    </div>

    <!-- Bans Section -->
    <div class="panel-section">
      <div class="section-title">
        <i class="ti ti-ban"></i>
        <span>Bans</span>
        <span class="ban-counter">{{ bans.length }}/{{ banCount }}</span>
      </div>
      <div class="ban-slots">
        <div
          v-for="(hero, idx) in getBanSlots()"
          :key="'ban-' + idx"
          class="ban-slot"
          :class="{ filled: !!hero }"
        >
          <template v-if="hero">
            <img :src="hero.avatar" :alt="hero.name" class="ban-avatar" />
            <div class="ban-x-overlay">✕</div>
            <button
              v-if="phase === 'banning'"
              class="remove-ban-btn"
              @click.stop="emit('removeBan', hero._id)"
            >
              <i class="ti ti-x"></i>
            </button>
          </template>
          <template v-else>
            <div class="empty-ban-slot">
              <i class="ti ti-ban"></i>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Picks Section -->
    <div class="panel-section">
      <div class="section-title">
        <i class="ti ti-user-check"></i>
        <span>Picks</span>
        <span class="ban-counter">{{ picks.length }}/5</span>
      </div>
      <div class="pick-slots">
        <div
          v-for="(hero, idx) in getPickSlots()"
          :key="'pick-' + idx"
          class="pick-slot"
          :class="{ filled: !!hero, 'next-pick': !hero && idx === picks.length && phase === 'picking' && isActivePickTeam }"
        >
          <template v-if="hero">
            <img :src="hero.avatar" :alt="hero.name" class="pick-avatar" />
            <span class="pick-hero-name">{{ hero.name }}</span>
          </template>
          <template v-else>
            <div class="empty-pick-slot">
              <span class="pick-number">{{ idx + 1 }}</span>
            </div>
            <span class="pick-hero-name empty-name">—</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-panel {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.06);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.4s ease;
  min-width: 160px;
}

.team-panel.active-ban,
.team-panel.active-pick {
  border-color: rgba(255, 255, 255, 0.15);
}

.team-panel.team-blue.active-ban,
.team-panel.team-blue.active-pick {
  border-color: rgba(74, 144, 217, 0.5);
  box-shadow: 0 0 30px rgba(74, 144, 217, 0.15), inset 0 0 30px rgba(74, 144, 217, 0.05);
}

.team-panel.team-red.active-ban,
.team-panel.team-red.active-pick {
  border-color: rgba(231, 76, 60, 0.5);
  box-shadow: 0 0 30px rgba(231, 76, 60, 0.15), inset 0 0 30px rgba(231, 76, 60, 0.05);
}

/* Team Header */
.team-header {
  text-align: center;
  cursor: pointer;
}

.team-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.team-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.team-blue .team-badge {
  background: rgba(74, 144, 217, 0.25);
  color: #4a90d9;
}

.team-red .team-badge {
  background: rgba(231, 76, 60, 0.25);
  color: #e74c3c;
}

.team-title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.85);
}

.team-blue .team-title {
  color: #7ab8f5;
}

.team-red .team-title {
  color: #f5a8a0;
}

.ban-team-indicator,
.pick-indicator {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

.indicator-active {
  cursor: pointer;
}

.indicator-pulse {
  color: #4ade80;
  animation: pulseText 1.5s ease-in-out infinite;
}

.indicator-idle {
  color: rgba(255, 255, 255, 0.3);
}

@keyframes pulseText {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Section */
.panel-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ban-counter {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.3);
  font-size: 11px;
}

/* Ban Slots */
.ban-slots {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.ban-slot {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.ban-slot.filled {
  border-color: rgba(231, 76, 60, 0.4);
}

.ban-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%) brightness(0.5);
}

.ban-x-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 22px;
  font-weight: 900;
  text-shadow: 0 0 8px rgba(231, 76, 60, 0.6);
  pointer-events: none;
}

.remove-ban-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 5;
}

.ban-slot:hover .remove-ban-btn {
  opacity: 1;
}

.empty-ban-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.15);
  font-size: 16px;
}

/* Pick Slots */
.pick-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pick-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  min-height: 52px;
}

.pick-slot.filled {
  background: rgba(255, 255, 255, 0.05);
}

.team-blue .pick-slot.filled {
  border-color: rgba(74, 144, 217, 0.3);
  background: rgba(74, 144, 217, 0.08);
}

.team-red .pick-slot.filled {
  border-color: rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.08);
}

.pick-slot.next-pick {
  border-color: rgba(255, 255, 255, 0.2);
  animation: pulseSlot 2s ease-in-out infinite;
}

.team-blue .pick-slot.next-pick {
  border-color: rgba(74, 144, 217, 0.5);
  box-shadow: 0 0 15px rgba(74, 144, 217, 0.15);
}

.team-red .pick-slot.next-pick {
  border-color: rgba(231, 76, 60, 0.5);
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.15);
}

@keyframes pulseSlot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.pick-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.team-blue .pick-avatar {
  border-color: rgba(74, 144, 217, 0.4);
}

.team-red .pick-avatar {
  border-color: rgba(231, 76, 60, 0.4);
}

.pick-hero-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pick-hero-name.empty-name {
  color: rgba(255, 255, 255, 0.15);
}

.empty-pick-slot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.pick-number {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.15);
}
</style>
