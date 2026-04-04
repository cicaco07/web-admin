import { ref, computed, reactive } from 'vue';
import type { Hero } from '../../../../types/Hero';

export type DraftType = 'normal' | 'tournament';
export type Team = 'blue' | 'red';
export type DraftPhase = 'setup' | 'banning' | 'picking' | 'complete';

export interface DraftConfig {
  draftType: DraftType;
  banCount: number; // 3, 4, or 5
  firstPickTeam: Team;
}

export function useDraftPick() {
  const phase = ref<DraftPhase>('setup');
  const config = reactive<DraftConfig>({
    draftType: 'normal',
    banCount: 3,
    firstPickTeam: 'blue',
  });

  const blueBans = ref<Hero[]>([]);
  const redBans = ref<Hero[]>([]);
  const bluePicks = ref<Hero[]>([]);
  const redPicks = ref<Hero[]>([]);
  const activeBanTeam = ref<Team>('blue');
  const pickSequenceIndex = ref(0);

  // Normal pick sequence: 1-2-2-2-2-1
  const pickSequence = computed<Team[]>(() => {
    const first = config.firstPickTeam;
    const second: Team = first === 'blue' ? 'red' : 'blue';
    return [first, second, second, first, first, second, second, first, first, second];
  });

  const currentPickTeam = computed<Team | null>(() => {
    if (phase.value !== 'picking') return null;
    if (pickSequenceIndex.value >= pickSequence.value.length) return null;
    return pickSequence.value[pickSequenceIndex.value];
  });

  // Determine the "turn group" for display: 1st pick, 2nd-3rd pick, etc.
  const currentTurnLabel = computed(() => {
    if (phase.value !== 'picking' || !currentPickTeam.value) return '';
    const idx = pickSequenceIndex.value;
    const team = currentPickTeam.value === 'blue' ? 'Blue Team' : 'Red Team';
    return `${team} — Pick ${idx + 1} of 10`;
  });

  const bannedHeroIds = computed(() => {
    const ids = new Set<string>();
    blueBans.value.forEach(h => ids.add(h._id));
    redBans.value.forEach(h => ids.add(h._id));
    return ids;
  });

  const blueBannedIds = computed(() => new Set(blueBans.value.map(h => h._id)));
  const redBannedIds = computed(() => new Set(redBans.value.map(h => h._id)));

  const pickedHeroIds = computed(() => {
    const ids = new Set<string>();
    bluePicks.value.forEach(h => ids.add(h._id));
    redPicks.value.forEach(h => ids.add(h._id));
    return ids;
  });

  const unavailableHeroIds = computed(() => {
    const ids = new Set<string>();
    bannedHeroIds.value.forEach(id => ids.add(id));
    pickedHeroIds.value.forEach(id => ids.add(id));
    return ids;
  });

  const isBanPhaseComplete = computed(() => {
    return blueBans.value.length >= config.banCount && redBans.value.length >= config.banCount;
  });

  const isPickPhaseComplete = computed(() => {
    return bluePicks.value.length >= 5 && redPicks.value.length >= 5;
  });

  const blueBansRemaining = computed(() => config.banCount - blueBans.value.length);
  const redBansRemaining = computed(() => config.banCount - redBans.value.length);

  function startDraft(draftConfig: DraftConfig) {
    Object.assign(config, draftConfig);
    phase.value = 'banning';
    activeBanTeam.value = 'blue';
    blueBans.value = [];
    redBans.value = [];
    bluePicks.value = [];
    redPicks.value = [];
    pickSequenceIndex.value = 0;
  }

  function banHero(hero: Hero) {
    if (phase.value !== 'banning') return false;
    const team = activeBanTeam.value;
    const bans = team === 'blue' ? blueBans : redBans;
    if (bans.value.length >= config.banCount) return false;
    // Prevent same hero banned twice by same team
    if (bans.value.some(h => h._id === hero._id)) return false;

    bans.value.push(hero);

    // Auto-switch to other team if current team's bans are full
    if (bans.value.length >= config.banCount) {
      const otherTeam: Team = team === 'blue' ? 'red' : 'blue';
      const otherBans = otherTeam === 'blue' ? blueBans : redBans;
      if (otherBans.value.length < config.banCount) {
        activeBanTeam.value = otherTeam;
      }
    }

    return true;
  }

  function removeBan(heroId: string, team: Team) {
    if (phase.value !== 'banning') return;
    const bans = team === 'blue' ? blueBans : redBans;
    bans.value = bans.value.filter(h => h._id !== heroId);
  }

  function setActiveBanTeam(team: Team) {
    if (phase.value !== 'banning') return;
    const bans = team === 'blue' ? blueBans : redBans;
    if (bans.value.length >= config.banCount) return; // team already full
    activeBanTeam.value = team;
  }

  function confirmBans() {
    if (isBanPhaseComplete.value) {
      phase.value = 'picking';
    }
  }

  function pickHero(hero: Hero) {
    if (phase.value !== 'picking') return false;
    if (unavailableHeroIds.value.has(hero._id)) return false;
    if (!currentPickTeam.value) return false;
    const picks = currentPickTeam.value === 'blue' ? bluePicks : redPicks;
    if (picks.value.length >= 5) return false;

    picks.value.push(hero);
    pickSequenceIndex.value++;

    if (bluePicks.value.length >= 5 && redPicks.value.length >= 5) {
      phase.value = 'complete';
    }
    return true;
  }

  function undoLastPick() {
    if (phase.value !== 'picking' || pickSequenceIndex.value === 0) return;
    pickSequenceIndex.value--;
    const prevTeam = pickSequence.value[pickSequenceIndex.value];
    const picks = prevTeam === 'blue' ? bluePicks : redPicks;
    picks.value.pop();
  }

  function resetDraft() {
    phase.value = 'setup';
    blueBans.value = [];
    redBans.value = [];
    bluePicks.value = [];
    redPicks.value = [];
    pickSequenceIndex.value = 0;
    activeBanTeam.value = 'blue';
  }

  return {
    phase,
    config,
    blueBans,
    redBans,
    bluePicks,
    redPicks,
    activeBanTeam,
    currentPickTeam,
    currentTurnLabel,
    pickSequence,
    pickSequenceIndex,
    bannedHeroIds,
    blueBannedIds,
    redBannedIds,
    pickedHeroIds,
    unavailableHeroIds,
    isBanPhaseComplete,
    isPickPhaseComplete,
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
  };
}
