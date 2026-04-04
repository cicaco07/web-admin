<script setup lang="ts">
import { ref } from 'vue';
import type { DraftConfig, DraftType, Team } from '../composables/useDraftPick';

const emit = defineEmits<{
  start: [config: DraftConfig];
}>();

const draftType = ref<DraftType>('normal');
const banCount = ref(3);
const firstPickTeam = ref<Team>('blue');

function handleStart() {
  emit('start', {
    draftType: draftType.value,
    banCount: banCount.value,
    firstPickTeam: firstPickTeam.value,
  });
}
</script>

<template>
  <div class="draft-setup-wrapper">
    <div class="draft-setup-card">
      <!-- Header -->
      <div class="setup-header">
        <div class="header-icon">⚔️</div>
        <h2 class="header-title">Draft Pick Simulation</h2>
        <p class="header-subtitle">Configure your draft settings before starting</p>
      </div>

      <!-- Draft Type -->
      <div class="setup-section">
        <label class="section-label">Draft Type</label>
        <div class="pill-group">
          <button
            class="pill-btn"
            :class="{ active: draftType === 'normal', 'pill-normal': draftType === 'normal' }"
            @click="draftType = 'normal'"
          >
            <i class="ti ti-sword me-1"></i>
            Normal
          </button>
          <button
            class="pill-btn disabled-pill"
            :class="{ active: draftType === 'tournament' }"
            disabled
            title="Coming soon"
          >
            <i class="ti ti-trophy me-1"></i>
            Tournament
            <span class="coming-soon-badge">Soon</span>
          </button>
        </div>
      </div>

      <!-- Ban Count -->
      <div class="setup-section">
        <label class="section-label">Bans Per Team</label>
        <div class="ban-count-group">
          <button
            v-for="count in [3, 4, 5]"
            :key="count"
            class="ban-count-btn"
            :class="{ active: banCount === count }"
            @click="banCount = count"
          >
            <span class="ban-number">{{ count }}</span>
            <span class="ban-label">bans</span>
          </button>
        </div>
        <p class="section-hint">Total {{ banCount * 2 }} heroes will be banned ({{ banCount }} each team)</p>
      </div>

      <!-- First Pick Team -->
      <div class="setup-section">
        <label class="section-label">First Pick</label>
        <div class="team-select-group">
          <button
            class="team-select-btn team-blue"
            :class="{ active: firstPickTeam === 'blue' }"
            @click="firstPickTeam = 'blue'"
          >
            <div class="team-icon blue-icon">
              <i class="ti ti-shield-filled"></i>
            </div>
            <span class="team-name">Blue Team</span>
            <span v-if="firstPickTeam === 'blue'" class="first-pick-badge">1st Pick</span>
          </button>
          <div class="vs-divider">VS</div>
          <button
            class="team-select-btn team-red"
            :class="{ active: firstPickTeam === 'red' }"
            @click="firstPickTeam = 'red'"
          >
            <div class="team-icon red-icon">
              <i class="ti ti-shield-filled"></i>
            </div>
            <span class="team-name">Red Team</span>
            <span v-if="firstPickTeam === 'red'" class="first-pick-badge">1st Pick</span>
          </button>
        </div>
      </div>

      <!-- Pick Order Preview -->
      <div class="setup-section">
        <label class="section-label">Pick Order Preview</label>
        <div class="pick-order-preview">
          <div
            v-for="(team, idx) in (firstPickTeam === 'blue'
              ? ['B','R','R','B','B','R','R','B','B','R']
              : ['R','B','B','R','R','B','B','R','R','B'])"
            :key="idx"
            class="pick-order-dot"
            :class="{ 'dot-blue': team === 'B', 'dot-red': team === 'R' }"
          >
            {{ idx + 1 }}
          </div>
        </div>
        <div class="pick-order-legend">
          <span class="legend-item"><span class="legend-dot dot-blue"></span> Blue Team</span>
          <span class="legend-item"><span class="legend-dot dot-red"></span> Red Team</span>
        </div>
      </div>

      <!-- Start Button -->
      <button class="start-btn" @click="handleStart">
        <i class="ti ti-player-play-filled me-2"></i>
        Start Draft
      </button>
    </div>
  </div>
</template>

<style scoped>
.draft-setup-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.draft-setup-card {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(15, 52, 96, 0.3);
}

.setup-header {
  text-align: center;
  margin-bottom: 36px;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px rgba(255, 200, 50, 0.4));
}

.header-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin: 8px 0 0;
}

.setup-section {
  margin-bottom: 28px;
}

.section-label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.section-hint {
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  margin: 8px 0 0;
  text-align: center;
}

/* Pill Group */
.pill-group {
  display: flex;
  gap: 12px;
}

.pill-btn {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pill-btn:hover:not(.disabled-pill) {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.06);
}

.pill-btn.active.pill-normal {
  border-color: #4a90d9;
  background: rgba(74, 144, 217, 0.15);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(74, 144, 217, 0.2);
}

.disabled-pill {
  opacity: 0.4;
  cursor: not-allowed !important;
}

.coming-soon-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Ban Count */
.ban-count-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.ban-count-btn {
  width: 90px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.ban-count-btn:hover {
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.ban-count-btn.active {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.15);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.2);
  transform: translateY(-2px);
}

.ban-number {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.ban-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

/* Team Select */
.team-select-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-select-btn {
  flex: 1;
  padding: 20px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.team-select-btn:hover {
  transform: translateY(-3px);
}

.team-select-btn.team-blue.active {
  border-color: #4a90d9;
  background: rgba(74, 144, 217, 0.15);
  color: #ffffff;
  box-shadow: 0 0 25px rgba(74, 144, 217, 0.25);
}

.team-select-btn.team-red.active {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.15);
  color: #ffffff;
  box-shadow: 0 0 25px rgba(231, 76, 60, 0.25);
}

.team-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.blue-icon {
  background: rgba(74, 144, 217, 0.2);
  color: #4a90d9;
}

.team-blue.active .blue-icon {
  background: rgba(74, 144, 217, 0.35);
  box-shadow: 0 0 15px rgba(74, 144, 217, 0.3);
}

.red-icon {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.team-red.active .red-icon {
  background: rgba(231, 76, 60, 0.35);
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.3);
}

.team-name {
  font-size: 15px;
  font-weight: 600;
}

.first-pick-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vs-divider {
  color: rgba(255, 255, 255, 0.2);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
}

/* Pick Order Preview */
.pick-order-preview {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.pick-order-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border: 2px solid transparent;
}

.pick-order-dot.dot-blue {
  background: rgba(74, 144, 217, 0.3);
  border-color: rgba(74, 144, 217, 0.6);
  color: #7ab8f5;
}

.pick-order-dot.dot-red {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
  color: #f5a8a0;
}

.pick-order-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.dot-blue {
  background: #4a90d9;
}

.legend-dot.dot-red {
  background: #e74c3c;
}

/* Start Button */
.start-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4a90d9, #2563eb);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.35);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, #5ba0e9, #3573fb);
}

.start-btn:active {
  transform: translateY(0);
}
</style>
