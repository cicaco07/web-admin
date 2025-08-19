import { useMutation, useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const GET_BATTLE_SPELLS = gql`
  query GetBattleSpells {
    battleSpells {
      _id
      name
      description
      icon
      tag
      cooldown
    }
  }
`

const CREATE_BATTLE_SPELL = gql`
  mutation CreateBattleSpell($createBattleSpellInput: CreateBattleSpellInput!) {
    createBattleSpell(createBattleSpellInput: $createBattleSpellInput) {
      _id
      name
    }
  }
`

const UPDATE_BATTLE_SPELL = gql`
  mutation UpdateBattleSpell($id: ID!, $updateBattleSpellInput: UpdateBattleSpellInput!) {
    updateBattleSpell(id: $id, updateBattleSpellInput: $updateBattleSpellInput) {
      _id
      name
    }
  }
`

const DELETE_BATTLE_SPELL = gql`
  mutation RemoveBattleSpell($id: ID!) {
    removeBattleSpell(id: $id)
  }
`

export function useBattleSpell() {
  return useQuery(GET_BATTLE_SPELLS);
}

export function useCreateBattleSpell(token: string) {
  const { mutate: createBattleSpell, onDone, onError } = useMutation(CREATE_BATTLE_SPELL, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { createBattleSpell, onDone, onError };
}

export function useUpdateBattleSpell(token: string) {
  const { mutate: updateBattleSpell, onDone, onError } = useMutation(UPDATE_BATTLE_SPELL, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { updateBattleSpell, onDone, onError };
}

export function useDeleteBattleSpell(token: string) {
  const { mutate: deleteBattleSpell, onDone, onError } = useMutation(DELETE_BATTLE_SPELL, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { deleteBattleSpell, onDone, onError };
}
