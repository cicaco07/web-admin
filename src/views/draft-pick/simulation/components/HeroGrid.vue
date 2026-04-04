<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Hero } from '../../../../types/Hero';
import { HERO_TYPE_OPTIONS } from '../../../../types/Hero';
import type { Team, DraftPhase } from '../composables/useDraftPick';

const props = defineProps<{
  heroes: Hero[];
  bannedHeroIds: Set<string>;
  blueBannedIds: Set<string>;
  redBannedIds: Set<string>;
  pickedHeroIds: Set<string>;
  unavailableHeroIds: Set<string>;
  phase: DraftPhase;
  activeBanTeam: Team;
  currentPickTeam: Team | null;
  currentStepType: 'ban' | 'pick' | null;
  currentStepTeam: Team | null;
}>();

const emit = defineEmits<{ selectHero: [hero: Hero] }>();

const searchQuery = ref('');
const activeRoleFilter = ref('All');
const roleFilters = ['All', ...HERO_TYPE_OPTIONS];

const filteredHeroes = computed(() => {
  let result = props.heroes;
  if (activeRoleFilter.value !== 'All') {
    result = result.filter(h => Array.isArray(h.type) ? h.type.includes(activeRoleFilter.value) : h.type === activeRoleFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(h => h.name.toLowerCase().includes(q));
  }
  return result;
});

function getHeroState(hero: Hero): string {
  const isBlueBanned = props.blueBannedIds.has(hero._id);
  const isRedBanned = props.redBannedIds.has(hero._id);
  const isPicked = props.pickedHeroIds.has(hero._id);
  if (isPicked) return 'picked';
  if (isBlueBanned && isRedBanned) return 'banned-both';
  // Normal ban mode
  if (props.phase === 'banning') {
    if (props.activeBanTeam === 'blue' && isBlueBanned) return 'banned-current';
    if (props.activeBanTeam === 'red' && isRedBanned) return 'banned-current';
  }
  // Tournament ban step
  if (props.phase === 'drafting' && props.currentStepType === 'ban') {
    if (isBlueBanned || isRedBanned) return 'banned-current';
  }
  if (isBlueBanned) return 'banned-blue';
  if (isRedBanned) return 'banned-red';
  return 'available';
}

function isHeroClickable(hero: Hero): boolean {
  // Normal ban phase
  if (props.phase === 'banning') {
    const state = getHeroState(hero);
    return state === 'available' || state === 'banned-blue' || state === 'banned-red';
  }
  // Normal pick phase
  if (props.phase === 'picking') {
    return !props.unavailableHeroIds.has(hero._id);
  }
  // Tournament drafting
  if (props.phase === 'drafting') {
    if (props.currentStepType === 'ban') {
      return !props.bannedHeroIds.has(hero._id) && !props.pickedHeroIds.has(hero._id);
    }
    if (props.currentStepType === 'pick') {
      return !props.unavailableHeroIds.has(hero._id);
    }
  }
  return false;
}

function getActiveTeamForRing(): Team | null {
  if (props.phase === 'picking') return props.currentPickTeam;
  if (props.phase === 'drafting') return props.currentStepTeam;
  if (props.phase === 'banning') return props.activeBanTeam;
  return null;
}

function handleHeroClick(hero: Hero) {
  if (isHeroClickable(hero)) emit('selectHero', hero);
}
</script>

<template>
  <div class="hero-grid-container">
    <div class="grid-search">
      <div class="search-input-wrapper">
        <i class="ti ti-search search-icon"></i>
        <input v-model="searchQuery" type="text" placeholder="Search hero..." class="search-input" />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''"><i class="ti ti-x"></i></button>
      </div>
    </div>
    <div class="role-filters">
      <button v-for="role in roleFilters" :key="role" class="role-tab" :class="{ active: activeRoleFilter === role }" @click="activeRoleFilter = role">{{ role }}</button>
    </div>
    <div class="hero-grid-scroll">
      <div class="hero-grid">
        <div v-for="hero in filteredHeroes" :key="hero._id" class="hero-card" :class="[`state-${getHeroState(hero)}`, { clickable: isHeroClickable(hero) }]" @click="handleHeroClick(hero)">
          <div class="hero-avatar-wrapper">
            <img :src="hero.avatar" :alt="hero.name" class="hero-avatar-img" />
            <div v-if="getHeroState(hero).startsWith('banned')" class="ban-overlay" :class="{ 'blue-ban': getHeroState(hero)==='banned-blue', 'red-ban': getHeroState(hero)==='banned-red', 'both-ban': getHeroState(hero)==='banned-both'||getHeroState(hero)==='banned-current' }">
              <span class="ban-mark">✕</span>
            </div>
            <div v-if="getHeroState(hero) === 'picked'" class="picked-overlay"><i class="ti ti-check"></i></div>
            <div v-if="getHeroState(hero) === 'available' && getActiveTeamForRing()" class="pick-ring" :class="`ring-${getActiveTeamForRing()}`"></div>
          </div>
          <span class="hero-name-label">{{ hero.name }}</span>
        </div>
      </div>
      <div v-if="filteredHeroes.length === 0" class="empty-grid"><i class="ti ti-mood-empty"></i><span>No heroes found</span></div>
    </div>
  </div>
</template>

<style scoped>
.hero-grid-container { display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 0; }
.grid-search { padding: 0 4px; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 14px; color: rgba(255,255,255,0.3); font-size: 16px; pointer-events: none; }
.search-input { width: 100%; padding: 10px 40px 10px 40px; border: 2px solid rgba(255,255,255,0.08); border-radius: 12px; background: rgba(255,255,255,0.04); color: #fff; font-size: 14px; outline: none; transition: all 0.3s; }
.search-input::placeholder { color: rgba(255,255,255,0.25); }
.search-input:focus { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); }
.search-clear { position: absolute; right: 10px; width: 24px; height: 24px; border: none; border-radius: 50%; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.role-filters { display: flex; gap: 4px; padding: 0 4px; overflow-x: auto; scrollbar-width: none; }
.role-filters::-webkit-scrollbar { display: none; }
.role-tab { padding: 8px 16px; border: none; border-radius: 8px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.25s; white-space: nowrap; }
.role-tab:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
.role-tab.active { background: linear-gradient(135deg, rgba(74,144,217,0.3), rgba(37,99,235,0.3)); color: #fff; box-shadow: 0 2px 10px rgba(74,144,217,0.2); }
.hero-grid-scroll { flex: 1; overflow-y: auto; padding: 4px; max-height: 520px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
.hero-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(68px, 1fr)); gap: 8px; }
.hero-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px; border-radius: 10px; cursor: default; transition: all 0.25s; border: 2px solid transparent; }
.hero-card.clickable { cursor: pointer; }
.hero-card.clickable:hover { background: rgba(255,255,255,0.06); transform: translateY(-2px); }
.hero-card.state-banned-blue, .hero-card.state-banned-red, .hero-card.state-banned-both, .hero-card.state-banned-current { opacity: 0.45; }
.hero-card.state-banned-blue.clickable, .hero-card.state-banned-red.clickable { opacity: 0.7; }
.hero-card.state-picked { opacity: 0.3; pointer-events: none; }
.hero-avatar-wrapper { position: relative; width: 52px; height: 52px; }
.hero-avatar-img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.12); transition: all 0.25s; }
.state-banned-blue .hero-avatar-img, .state-banned-red .hero-avatar-img, .state-banned-both .hero-avatar-img, .state-banned-current .hero-avatar-img { filter: grayscale(90%) brightness(0.5); }
.state-picked .hero-avatar-img { filter: grayscale(100%) brightness(0.4); }
.ban-overlay { position: absolute; inset: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.ban-mark { font-size: 24px; font-weight: 900; }
.blue-ban .ban-mark { color: #4a90d9; text-shadow: 0 0 8px rgba(74,144,217,0.5); }
.red-ban .ban-mark { color: #e74c3c; text-shadow: 0 0 8px rgba(231,76,60,0.5); }
.both-ban .ban-mark { color: #a855f7; text-shadow: 0 0 8px rgba(168,85,247,0.5); }
.picked-overlay { position: absolute; inset: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); color: #4ade80; font-size: 22px; }
.pick-ring { position: absolute; inset: -3px; border-radius: 50%; border: 2px solid transparent; opacity: 0; transition: all 0.25s; pointer-events: none; }
.hero-card.clickable:hover .pick-ring { opacity: 1; }
.ring-blue { border-color: #4a90d9; box-shadow: 0 0 12px rgba(74,144,217,0.4); }
.ring-red { border-color: #e74c3c; box-shadow: 0 0 12px rgba(231,76,60,0.4); }
.hero-name-label { font-size: 10px; color: rgba(255,255,255,0.55); text-align: center; line-height: 1.2; max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-grid { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 40px; color: rgba(255,255,255,0.2); font-size: 14px; }
.empty-grid i { font-size: 36px; }
</style>
