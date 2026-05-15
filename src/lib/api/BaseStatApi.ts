import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const BASE_STAT_FIELDS = `
  _id
  hero {
    _id
    name
    image
    role
  }
  hp
  mana
  energy
  hp_regen
  mana_regen
  energy_regen
  physical_attack
  physical_defense
  magic_power
  magic_defense
  attack_speed
  movement_speed
  attack_speed_ratio
  spell_vamp_ratio
  attack_range
`;

const GET_BASE_STATS = gql`
  query GetBaseStats {
    baseStats {
      ${BASE_STAT_FIELDS}
    }
  }
`;

const CREATE_BASE_STAT = gql`
  mutation CreateBaseStat($createBaseStatInput: CreateBaseStatInput!) {
    createBaseStat(createBaseStatInput: $createBaseStatInput) {
      ${BASE_STAT_FIELDS}
    }
  }
`;

const UPDATE_BASE_STAT = gql`
  mutation UpdateBaseStat($id: ID!, $updateBaseStatInput: UpdateBaseStatInput!) {
    updateBaseStat(id: $id, updateBaseStatInput: $updateBaseStatInput) {
      ${BASE_STAT_FIELDS}
    }
  }
`;

const DELETE_BASE_STAT = gql`
  mutation RemoveBaseStat($id: ID!) {
    removeBaseStat(id: $id) {
      _id
    }
  }
`;

export function useBaseStats() {
  return useQuery(GET_BASE_STATS);
}

export function useCreateBaseStat(token: string) {
  const { mutate: createBaseStat, onDone, onError } = useMutation(CREATE_BASE_STAT, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { createBaseStat, onDone, onError };
}

export function useUpdateBaseStat(token: string) {
  const { mutate: updateBaseStat, onDone, onError } = useMutation(UPDATE_BASE_STAT, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { updateBaseStat, onDone, onError };
}

export function useDeleteBaseStat(token: string) {
  const { mutate: deleteBaseStat, onDone, onError } = useMutation(DELETE_BASE_STAT, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { deleteBaseStat, onDone, onError };
}
