export interface Tournament {
  _id: string;
  name: string;
  slug: string;
  tier: string;
  tierLevel: number;
  region: string;
  liquipediaUrl: string;
  liquipediaSlug: string;
  status: string;
  syncStatus: string;
  lastSyncedAt: string | null;
  prizePool: string;
  createdAt: string;
}

export interface TournamentFormData {
  name: string;
  slug: string;
  tier: string;
  tierLevel: number;
  region: string;
  liquipediaUrl: string;
  liquipediaSlug: string;
  status: string;
  prizePool: string;
}

export interface TournamentStage {
  _id: string;
  name: string;
  slug: string;
  liquipediaUrl: string;
  order: number;
}

export interface HeroStat {
  heroName: string;
  heroImageUrl: string;
  picks: number;
  bans: number;
  picksAndBans: number;
  wins: number;
  losses: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  presenceRate: number;
  blueSidePicks: number;
  blueSideWins: number;
  redSidePicks: number;
  redSideWins: number;
  syncedAt: string;
  stageId: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  itemsSynced: number;
  syncedAt: string;
  errors: string[];
}

export const TIER_OPTIONS = [
  'INTERNATIONAL',
  'REGIONAL',
  'NATIONAL',
  'LOCAL',
] as const;

export const STATUS_OPTIONS = [
  'UPCOMING',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
] as const;

export const REGION_OPTIONS = [
  'Global',
  'Southeast Asia',
  'Indonesia',
  'Philippines',
  'Malaysia',
  'Myanmar',
  'Cambodia',
  'Latin America',
  'Turkey',
  'CIS',
  'MENA',
  'North America',
] as const;

export const createDefaultTournamentForm = (): TournamentFormData => ({
  name: '',
  slug: '',
  tier: '',
  tierLevel: 1,
  region: '',
  liquipediaUrl: '',
  liquipediaSlug: '',
  status: '',
  prizePool: '',
});
