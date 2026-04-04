import { ref, computed, reactive, onUnmounted } from 'vue';
import type { Hero } from '../../../../types/Hero';

export type DraftType = 'normal' | 'tournament';
export type Team = 'blue' | 'red';
export type DraftPhase = 'setup' | 'banning' | 'picking' | 'drafting' | 'complete';

export interface DraftConfig {
  draftType: DraftType;
  banCount: number;
  firstPickTeam: Team;
}

export interface DraftStep {
  type: 'ban' | 'pick';
  team: Team;
  phaseNumber: 1 | 2;
}

export function useDraftPick() {
  const phase = ref<DraftPhase>('setup');
  const config = reactive<DraftConfig>({ draftType: 'normal', banCount: 3, firstPickTeam: 'blue' });

  const blueBans = ref<Hero[]>([]);
  const redBans = ref<Hero[]>([]);
  const bluePicks = ref<Hero[]>([]);
  const redPicks = ref<Hero[]>([]);

  // Normal mode state
  const activeBanTeam = ref<Team>('blue');
  const pickSequenceIndex = ref(0);

  // Tournament mode state
  const tournamentSteps = ref<DraftStep[]>([]);
  const currentStepIndex = ref(0);

  // Timer
  const timer = ref(0);
  const timerMax = ref(30);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // ===== COMPUTED =====

  const normalPickSequence = computed<Team[]>(() => {
    const f = config.firstPickTeam;
    const s: Team = f === 'blue' ? 'red' : 'blue';
    return [f, s, s, f, f, s, s, f, f, s];
  });

  const currentStep = computed<DraftStep | null>(() => {
    if (phase.value !== 'drafting') return null;
    return tournamentSteps.value[currentStepIndex.value] ?? null;
  });

  const currentPickTeam = computed<Team | null>(() => {
    if (config.draftType === 'tournament') {
      const step = currentStep.value;
      return step?.type === 'pick' ? step.team : null;
    }
    if (phase.value !== 'picking') return null;
    return normalPickSequence.value[pickSequenceIndex.value] ?? null;
  });

  const currentTurnLabel = computed(() => {
    if (config.draftType === 'tournament') {
      const step = currentStep.value;
      if (!step) return '';
      const t = step.team === 'blue' ? 'Blue Team' : 'Red Team';
      return `${t} — ${step.type === 'ban' ? 'Ban' : 'Pick'}`;
    }
    if (phase.value !== 'picking' || !currentPickTeam.value) return '';
    const t = currentPickTeam.value === 'blue' ? 'Blue Team' : 'Red Team';
    return `${t} — Pick ${pickSequenceIndex.value + 1} of 10`;
  });

  const currentTournamentPhaseName = computed(() => {
    const step = currentStep.value;
    if (!step) return '';
    const names: Record<string, string> = {
      'ban-1': '🚫 Ban Phase 1', 'pick-1': '⚔️ Pick Phase 1',
      'ban-2': '🚫 Ban Phase 2', 'pick-2': '⚔️ Pick Phase 2',
    };
    return names[`${step.type}-${step.phaseNumber}`] || '';
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

  const isBanPhaseComplete = computed(() =>
    blueBans.value.length >= config.banCount && redBans.value.length >= config.banCount
  );
  const blueBansRemaining = computed(() => {
    if (config.draftType === 'tournament') {
      const total = tournamentSteps.value.filter(s => s.type === 'ban' && s.team === 'blue').length;
      return total - blueBans.value.length;
    }
    return config.banCount - blueBans.value.length;
  });
  const redBansRemaining = computed(() => {
    if (config.draftType === 'tournament') {
      const total = tournamentSteps.value.filter(s => s.type === 'ban' && s.team === 'red').length;
      return total - redBans.value.length;
    }
    return config.banCount - redBans.value.length;
  });

  const timerDuration = computed(() => {
    const step = currentStep.value;
    if (!step) return 30;
    return step.phaseNumber === 1 ? 30 : 45;
  });

  const timerPercentage = computed(() =>
    timerMax.value === 0 ? 0 : (timer.value / timerMax.value) * 100
  );

  // ===== TOURNAMENT STEPS =====
  function generateTournamentSteps(firstPick: Team): DraftStep[] {
    const s: Team = firstPick === 'blue' ? 'red' : 'blue';
    return [
      // Ban Phase 1: 3 each, alternating, first starts
      { type: 'ban', team: firstPick, phaseNumber: 1 },
      { type: 'ban', team: s, phaseNumber: 1 },
      { type: 'ban', team: firstPick, phaseNumber: 1 },
      { type: 'ban', team: s, phaseNumber: 1 },
      { type: 'ban', team: firstPick, phaseNumber: 1 },
      { type: 'ban', team: s, phaseNumber: 1 },
      // Pick Phase 1: 1-2-2-1
      { type: 'pick', team: firstPick, phaseNumber: 1 },
      { type: 'pick', team: s, phaseNumber: 1 },
      { type: 'pick', team: s, phaseNumber: 1 },
      { type: 'pick', team: firstPick, phaseNumber: 1 },
      { type: 'pick', team: firstPick, phaseNumber: 1 },
      { type: 'pick', team: s, phaseNumber: 1 },
      // Ban Phase 2: 2 each, second starts
      { type: 'ban', team: s, phaseNumber: 2 },
      { type: 'ban', team: firstPick, phaseNumber: 2 },
      { type: 'ban', team: s, phaseNumber: 2 },
      { type: 'ban', team: firstPick, phaseNumber: 2 },
      // Pick Phase 2: 1-2-1
      { type: 'pick', team: s, phaseNumber: 2 },
      { type: 'pick', team: firstPick, phaseNumber: 2 },
      { type: 'pick', team: firstPick, phaseNumber: 2 },
      { type: 'pick', team: s, phaseNumber: 2 },
    ];
  }

  // ===== TIMER =====
  function startTimer() {
    stopTimer();
    const d = timerDuration.value;
    timer.value = d;
    timerMax.value = d;
    timerInterval = setInterval(() => {
      timer.value--;
      if (timer.value <= 0) { stopTimer(); advanceTournamentStep(); }
    }, 1000);
  }
  function stopTimer() {
    if (timerInterval !== null) { clearInterval(timerInterval); timerInterval = null; }
  }
  function advanceTournamentStep() {
    currentStepIndex.value++;
    if (currentStepIndex.value >= tournamentSteps.value.length) {
      phase.value = 'complete'; stopTimer();
    } else { startTimer(); }
  }

  // ===== ACTIONS =====
  function startDraft(draftConfig: DraftConfig) {
    Object.assign(config, draftConfig);
    blueBans.value = []; redBans.value = [];
    bluePicks.value = []; redPicks.value = [];
    stopTimer();
    if (draftConfig.draftType === 'tournament') {
      config.banCount = 5;
      tournamentSteps.value = generateTournamentSteps(draftConfig.firstPickTeam);
      currentStepIndex.value = 0;
      phase.value = 'drafting';
      startTimer();
    } else {
      phase.value = 'banning';
      activeBanTeam.value = 'blue';
      pickSequenceIndex.value = 0;
    }
  }

  // Normal mode ban
  function banHero(hero: Hero) {
    if (phase.value !== 'banning') return false;
    const bans = activeBanTeam.value === 'blue' ? blueBans : redBans;
    if (bans.value.length >= config.banCount) return false;
    if (bans.value.some(h => h._id === hero._id)) return false;
    bans.value.push(hero);
    if (bans.value.length >= config.banCount) {
      const other: Team = activeBanTeam.value === 'blue' ? 'red' : 'blue';
      const otherBans = other === 'blue' ? blueBans : redBans;
      if (otherBans.value.length < config.banCount) activeBanTeam.value = other;
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
    if (bans.value.length >= config.banCount) return;
    activeBanTeam.value = team;
  }
  function confirmBans() {
    if (isBanPhaseComplete.value) phase.value = 'picking';
  }

  // Normal mode pick
  function pickHero(hero: Hero) {
    if (phase.value !== 'picking') return false;
    if (unavailableHeroIds.value.has(hero._id)) return false;
    if (!currentPickTeam.value) return false;
    const picks = currentPickTeam.value === 'blue' ? bluePicks : redPicks;
    if (picks.value.length >= 5) return false;
    picks.value.push(hero);
    pickSequenceIndex.value++;
    if (bluePicks.value.length >= 5 && redPicks.value.length >= 5) phase.value = 'complete';
    return true;
  }

  // Tournament mode select
  function tournamentSelectHero(hero: Hero) {
    if (phase.value !== 'drafting' || !currentStep.value) return false;
    const step = currentStep.value;
    if (step.type === 'ban') {
      if (bannedHeroIds.value.has(hero._id) || pickedHeroIds.value.has(hero._id)) return false;
      (step.team === 'blue' ? blueBans : redBans).value.push(hero);
    } else {
      if (unavailableHeroIds.value.has(hero._id)) return false;
      const picks = step.team === 'blue' ? bluePicks : redPicks;
      if (picks.value.length >= 5) return false;
      picks.value.push(hero);
    }
    stopTimer();
    advanceTournamentStep();
    return true;
  }

  function handleSelectHero(hero: Hero) {
    if (config.draftType === 'tournament') return tournamentSelectHero(hero);
    if (phase.value === 'banning') return banHero(hero);
    if (phase.value === 'picking') return pickHero(hero);
    return false;
  }

  function undoLastPick() {
    if (config.draftType === 'tournament') {
      if (currentStepIndex.value === 0) return;
      stopTimer();
      currentStepIndex.value--;
      const prev = tournamentSteps.value[currentStepIndex.value];
      if (prev.type === 'ban') (prev.team === 'blue' ? blueBans : redBans).value.pop();
      else (prev.team === 'blue' ? bluePicks : redPicks).value.pop();
      if (phase.value === 'complete') phase.value = 'drafting';
      startTimer();
    } else {
      if (phase.value !== 'picking' || pickSequenceIndex.value === 0) return;
      pickSequenceIndex.value--;
      const prev = normalPickSequence.value[pickSequenceIndex.value];
      (prev === 'blue' ? bluePicks : redPicks).value.pop();
    }
  }

  function resetDraft() {
    stopTimer();
    phase.value = 'setup';
    blueBans.value = []; redBans.value = [];
    bluePicks.value = []; redPicks.value = [];
    pickSequenceIndex.value = 0;
    activeBanTeam.value = 'blue';
    currentStepIndex.value = 0;
    tournamentSteps.value = [];
    timer.value = 0;
  }

  onUnmounted(() => stopTimer());

  return {
    phase, config, blueBans, redBans, bluePicks, redPicks,
    activeBanTeam, currentPickTeam, currentTurnLabel, normalPickSequence, pickSequenceIndex,
    bannedHeroIds, blueBannedIds, redBannedIds, pickedHeroIds, unavailableHeroIds,
    isBanPhaseComplete, blueBansRemaining, redBansRemaining,
    tournamentSteps, currentStepIndex, currentStep, currentTournamentPhaseName,
    timer, timerMax, timerPercentage,
    startDraft, banHero, removeBan, setActiveBanTeam, confirmBans,
    pickHero, tournamentSelectHero, handleSelectHero, undoLastPick, resetDraft,
  };
}
