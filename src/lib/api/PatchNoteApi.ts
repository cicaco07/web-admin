import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const HERO_PATCH_FIELDS = `
  _id
  title
  description
  hero_changes {
    name
    alias
    change_type
    description
    change_details {
      name
      change_type
      description
    }
  }
`;

const SIMPLE_PATCH_FIELDS = `
  _id
  title
  description
  change_details
`;

const PATCH_NOTE_FIELDS = `
  _id
  name
  start_date
  end_date
  type
  season
  is_active
  created_by
  updated_by
  deleted_at
  hero_changes { ${HERO_PATCH_FIELDS} }
  battlefield_changes { ${SIMPLE_PATCH_FIELDS} }
  system_changes { ${SIMPLE_PATCH_FIELDS} }
  game_mode_changes { ${SIMPLE_PATCH_FIELDS} }
`;

const GET_PATCH_NOTES = gql`
  query GetPatchNotes {
    patchNotes { ${PATCH_NOTE_FIELDS} }
  }
`;

const CREATE_PATCH_NOTE = gql`
  mutation CreatePatchNote($createPatchNoteInput: CreatePatchNoteInput!) {
    createPatchNote(createPatchNoteInput: $createPatchNoteInput) { ${PATCH_NOTE_FIELDS} }
  }
`;

const UPDATE_PATCH_NOTE = gql`
  mutation UpdatePatchNote($id: ID!, $updatePatchNoteInput: UpdatePatchNoteInput!) {
    updatePatchNote(id: $id, updatePatchNoteInput: $updatePatchNoteInput) { ${PATCH_NOTE_FIELDS} }
  }
`;

const REMOVE_PATCH_NOTE = gql`
  mutation RemovePatchNote($id: ID!) { removePatchNote(id: $id) { _id } }
`;

const CREATE_HERO_PATCH_NOTE = gql`
  mutation CreateHeroPatchNote($patchNoteId: String!, $createHeroPatchNoteInput: CreateHeroPatchNoteInput!) {
    createHeroPatchNote(patchNoteId: $patchNoteId, createHeroPatchNoteInput: $createHeroPatchNoteInput) { ${HERO_PATCH_FIELDS} }
  }
`;

const UPDATE_HERO_PATCH_NOTE = gql`
  mutation UpdateHeroPatchNote($id: ID!, $updateHeroPatchNoteInput: UpdateHeroPatchNoteInput!) {
    updateHeroPatchNote(id: $id, updateHeroPatchNoteInput: $updateHeroPatchNoteInput) { ${HERO_PATCH_FIELDS} }
  }
`;

const REMOVE_HERO_PATCH_NOTE = gql`
  mutation RemoveHeroPatchNote($id: ID!) { removeHeroPatchNote(id: $id) { _id } }
`;

const CREATE_BATTLEFIELD_PATCH_NOTE = gql`
  mutation CreateBattlefieldPatchNote($patchNoteId: String!, $createBattlefieldPatchNoteInput: CreateBattlefieldPatchNoteInput!) {
    createBattlefieldPatchNote(patchNoteId: $patchNoteId, createBattlefieldPatchNoteInput: $createBattlefieldPatchNoteInput) { ${SIMPLE_PATCH_FIELDS} }
  }
`;

const UPDATE_BATTLEFIELD_PATCH_NOTE = gql`
  mutation UpdateBattlefieldPatchNote($id: ID!, $updateBattlefieldPatchNoteInput: UpdateBattlefieldPatchNoteInput!) {
    updateBattlefieldPatchNote(id: $id, updateBattlefieldPatchNoteInput: $updateBattlefieldPatchNoteInput) { ${SIMPLE_PATCH_FIELDS} }
  }
`;

const REMOVE_BATTLEFIELD_PATCH_NOTE = gql`
  mutation RemoveBattlefieldPatchNote($id: ID!) { removeBattlefieldPatchNote(id: $id) { _id } }
`;

const CREATE_SYSTEM_PATCH_NOTE = gql`
  mutation CreateSystemPatchNote($patchNoteId: String!, $createSystemPatchNoteInput: CreateSystemPatchNoteInput!) {
    createSystemPatchNote(patchNoteId: $patchNoteId, createSystemPatchNoteInput: $createSystemPatchNoteInput) { ${SIMPLE_PATCH_FIELDS} }
  }
`;

const UPDATE_SYSTEM_PATCH_NOTE = gql`
  mutation UpdateSystemPatchNote($id: ID!, $updateSystemPatchNoteInput: UpdateSystemPatchNoteInput!) {
    updateSystemPatchNote(id: $id, updateSystemPatchNoteInput: $updateSystemPatchNoteInput) { ${SIMPLE_PATCH_FIELDS} }
  }
`;

const REMOVE_SYSTEM_PATCH_NOTE = gql`
  mutation RemoveSystemPatchNote($id: ID!) { removeSystemPatchNote(id: $id) { _id } }
`;

const CREATE_GAME_MODE_PATCH_NOTE = gql`
  mutation CreateGameModePatchNote($patchNoteId: String!, $createGameModePatchNoteInput: CreateGameModePatchNoteInput!) {
    createGameModePatchNote(patchNoteId: $patchNoteId, createGameModePatchNoteInput: $createGameModePatchNoteInput) { ${SIMPLE_PATCH_FIELDS} }
  }
`;

const UPDATE_GAME_MODE_PATCH_NOTE = gql`
  mutation UpdateGameModePatchNote($id: ID!, $updateGameModePatchNoteInput: UpdateGameModePatchNoteInput!) {
    updateGameModePatchNote(id: $id, updateGameModePatchNoteInput: $updateGameModePatchNoteInput) { ${SIMPLE_PATCH_FIELDS} }
  }
`;

const REMOVE_GAME_MODE_PATCH_NOTE = gql`
  mutation RemoveGameModePatchNote($id: ID!) { removeGameModePatchNote(id: $id) { _id } }
`;

const mutationOptions = (token: string) => ({ context: { headers: { Authorization: `Bearer ${token}` } } });

export function usePatchNotes() { 
  return useQuery(GET_PATCH_NOTES); 
}

export function useCreatePatchNote(token: string) { 
  const { 
    mutate, onDone, onError 
  } = useMutation(CREATE_PATCH_NOTE, mutationOptions(token)); 
  return { 
    createPatchNote: mutate, onDone, onError 
  }; 
}

export function useUpdatePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_PATCH_NOTE, mutationOptions(token)); return { updatePatchNote: mutate, onDone, onError }; }
export function useRemovePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_PATCH_NOTE, mutationOptions(token)); return { removePatchNote: mutate, onDone, onError }; }
export function useCreateHeroPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(CREATE_HERO_PATCH_NOTE, mutationOptions(token)); return { createHeroPatchNote: mutate, onDone, onError }; }
export function useUpdateHeroPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_HERO_PATCH_NOTE, mutationOptions(token)); return { updateHeroPatchNote: mutate, onDone, onError }; }
export function useRemoveHeroPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_HERO_PATCH_NOTE, mutationOptions(token)); return { removeHeroPatchNote: mutate, onDone, onError }; }
export function useCreateBattlefieldPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(CREATE_BATTLEFIELD_PATCH_NOTE, mutationOptions(token)); return { createBattlefieldPatchNote: mutate, onDone, onError }; }
export function useUpdateBattlefieldPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_BATTLEFIELD_PATCH_NOTE, mutationOptions(token)); return { updateBattlefieldPatchNote: mutate, onDone, onError }; }
export function useRemoveBattlefieldPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_BATTLEFIELD_PATCH_NOTE, mutationOptions(token)); return { removeBattlefieldPatchNote: mutate, onDone, onError }; }
export function useCreateSystemPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(CREATE_SYSTEM_PATCH_NOTE, mutationOptions(token)); return { createSystemPatchNote: mutate, onDone, onError }; }
export function useUpdateSystemPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_SYSTEM_PATCH_NOTE, mutationOptions(token)); return { updateSystemPatchNote: mutate, onDone, onError }; }
export function useRemoveSystemPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_SYSTEM_PATCH_NOTE, mutationOptions(token)); return { removeSystemPatchNote: mutate, onDone, onError }; }
export function useCreateGameModePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(CREATE_GAME_MODE_PATCH_NOTE, mutationOptions(token)); return { createGameModePatchNote: mutate, onDone, onError }; }
export function useUpdateGameModePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_GAME_MODE_PATCH_NOTE, mutationOptions(token)); return { updateGameModePatchNote: mutate, onDone, onError }; }
export function useRemoveGameModePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_GAME_MODE_PATCH_NOTE, mutationOptions(token)); return { removeGameModePatchNote: mutate, onDone, onError }; }
