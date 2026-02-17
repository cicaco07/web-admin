import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { computed, type Ref } from "vue";

// ==================== Queries ====================

const GET_TOURNAMENTS = gql`
  query GetTournaments {
    tournaments {
      _id
      name
      slug
      tier
      tierLevel
      region
      status
      syncStatus
      lastSyncedAt
      liquipediaUrl
      liquipediaSlug
      prizePool
      createdAt
    }
  }
`;

const GET_TOURNAMENT_BY_ID = gql`
  query GetTournamentById($id: ID!) {
    tournament(id: $id) {
      _id
      name
      slug
      tier
      tierLevel
      region
      status
      syncStatus
      lastSyncedAt
      liquipediaUrl
      liquipediaSlug
      prizePool
      createdAt
    }
  }
`;

const GET_STAGES = gql`
  query GetStages($tournamentId: ID!) {
    tournamentStages(tournamentId: $tournamentId) {
      _id
      name
      slug
      liquipediaUrl
      order
    }
  }
`;

const GET_HERO_STATS = gql`
  query GetHeroStats($tournamentId: ID!) {
    heroStats(tournamentId: $tournamentId) {
      heroName
      heroImageUrl
      picks
      bans
      picksAndBans
      wins
      losses
      winRate
      pickRate
      banRate
      presenceRate
      blueSidePicks
      blueSideWins
      redSidePicks
      redSideWins
      syncedAt
    }
  }
`;

const GET_HERO_STATS_BY_STAGE = gql`
  query GetHeroStatsByStage($tournamentId: ID!, $stageId: ID!) {
    heroStats(tournamentId: $tournamentId, stageId: $stageId, limit: 131) {
      heroName
      heroImageUrl
      picks
      bans
      picksAndBans
      wins
      losses
      winRate
      pickRate
      banRate
      presenceRate
      blueSidePicks
      blueSideWins
      redSidePicks
      redSideWins
      syncedAt
      stageId
    }
  }
`;

const GET_SYNC_LOGS = gql`
  query GetSyncLogs($tournamentId: ID!) {
    syncLogs(tournamentId: $tournamentId) {
      _id
      type
      status
      itemsSynced
      startedAt
      finishedAt
      errorMessage
      triggeredBy
    }
  }
`;

// ==================== Mutations ====================

const CREATE_TOURNAMENT = gql`
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      _id
      name
      tier
      tierLevel
      status
      syncStatus
      lastSyncedAt
      liquipediaUrl
      liquipediaSlug
      createdAt
    }
  }
`;

const DELETE_TOURNAMENT = gql`
  mutation DeleteTournament($id: ID!) {
    deleteTournament(id: $id) {
      _id
    }
  }
`;

const UPDATE_TOURNAMENT = gql`
  mutation UpdateTournament($id: ID!, $input: UpdateTournamentInput!) {
    updateTournament(id: $id, input: $input) {
      _id
      name
      tier
      tierLevel
      status
      syncStatus
      lastSyncedAt
      liquipediaUrl
      liquipediaSlug
      createdAt
    }
  }
`;

const SYNC_TOURNAMENT = gql`
  mutation SyncTournament($id: ID!) {
    syncTournament(id: $id) {
      success
      message
      itemsSynced
      syncedAt
      errors
    }
  }
`;

const SYNC_STAGE = gql`
  mutation SyncStage($tournamentId: ID!, $stageId: ID!) {
    syncStage(tournamentId: $tournamentId, stageId: $stageId) {
      success
      message
      itemsSynced
      syncedAt
      errors
    }
  }
`;

// ==================== Composables ====================

export const useTournaments = () => {
  return useQuery(GET_TOURNAMENTS);
};

export const useTournamentById = (id: Ref<string> | string) => {
  const variables = computed(() => ({
    id: typeof id === 'string' ? id : id.value,
  }));
  return useQuery(GET_TOURNAMENT_BY_ID, variables);
};

export const useTournamentStages = (tournamentId: Ref<string> | string) => {
  const variables = computed(() => ({
    tournamentId: typeof tournamentId === 'string' ? tournamentId : tournamentId.value,
  }));
  return useQuery(GET_STAGES, variables);
};

export const useHeroStats = (tournamentId: Ref<string> | string) => {
  const variables = computed(() => ({
    tournamentId: typeof tournamentId === 'string' ? tournamentId : tournamentId.value,
  }));
  return useQuery(GET_HERO_STATS, variables);
};

export const useHeroStatsByStage = (tournamentId: Ref<string> | string, stageId: Ref<string> | string) => {
  const variables = computed(() => ({
    tournamentId: typeof tournamentId === 'string' ? tournamentId : tournamentId.value,
    stageId: typeof stageId === 'string' ? stageId : stageId.value,
  }));
  const enabled = computed(() => {
    const sid = typeof stageId === 'string' ? stageId : stageId.value;
    return !!sid && sid !== 'overall';
  });
  return useQuery(GET_HERO_STATS_BY_STAGE, variables, () => ({
    enabled: enabled.value,
  }));
};

export const useSyncLogs = (tournamentId: Ref<string> | string) => {
  const variables = computed(() => ({
    tournamentId: typeof tournamentId === 'string' ? tournamentId : tournamentId.value,
  }));
  return useQuery(GET_SYNC_LOGS, variables);
};

export function useCreateTournament() {
  const { mutate: createTournament, onDone, onError } = useMutation(CREATE_TOURNAMENT);
  return { createTournament, onDone, onError };
}

export function useDeleteTournament() {
  const { mutate: deleteTournament, onDone, onError } = useMutation(DELETE_TOURNAMENT);
  return { deleteTournament, onDone, onError };
}

export function useUpdateTournament() {
  const { mutate: updateTournament, onDone, onError } = useMutation(UPDATE_TOURNAMENT);
  return { updateTournament, onDone, onError };
}

export function useSyncTournament() {
  const { mutate: syncTournament, onDone, onError, loading } = useMutation(SYNC_TOURNAMENT);
  return { syncTournament, onDone, onError, loading };
}

export function useSyncStage() {
  const { mutate: syncStage, onDone, onError, loading } = useMutation(SYNC_STAGE);
  return { syncStage, onDone, onError, loading };
}
