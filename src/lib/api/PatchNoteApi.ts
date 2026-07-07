import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import type { PatchChangeFilterInput } from '../../types/PatchNote';

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

const PATCH_NOTE_SUMMARY_FIELDS = `
  _id
  name
  version
  start_date
  end_date
  published_at
  type
  season
  is_active
  status
  source_url
  source_newsid
  summary
  imported_at
  created_by
  updated_by
  deleted_at
`;

const PATCH_NOTE_FIELDS = `
  ${PATCH_NOTE_SUMMARY_FIELDS}
  raw_content
  hero_changes { ${HERO_PATCH_FIELDS} }
  battlefield_changes { ${SIMPLE_PATCH_FIELDS} }
  system_changes { ${SIMPLE_PATCH_FIELDS} }
  game_mode_changes { ${SIMPLE_PATCH_FIELDS} }
`;

const PATCH_CHANGE_FIELDS = `
  _id
  target_type
  target_ref
  target_name
  change_type
  section
  title
  description
  raw_text
  order
  deleted_at
  details {
    field
    old_value
    new_value
    unit
    raw_text
    note
  }
  patch_note { ${PATCH_NOTE_SUMMARY_FIELDS} }
`;

const GET_PATCH_NOTES = gql`
  query GetPatchNotes {
    patchNotes { ${PATCH_NOTE_SUMMARY_FIELDS} }
  }
`;

const GET_PATCH_NOTE = gql`
  query GetPatchNote($id: String!) {
    patchNote(id: $id) { ${PATCH_NOTE_FIELDS} }
  }
`;

const GET_PATCH_CHANGES = gql`
  query GetPatchChanges($filter: PatchChangeFilterInput) {
    patchChanges(filter: $filter) { ${PATCH_CHANGE_FIELDS} }
  }
`;

const HERO_PATCH_HISTORY = gql`
  query HeroPatchHistory($heroId: String, $heroName: String, $includeDrafts: Boolean) {
    heroPatchHistory(heroId: $heroId, heroName: $heroName, includeDrafts: $includeDrafts) { ${PATCH_CHANGE_FIELDS} }
  }
`;

const ITEM_PATCH_HISTORY = gql`
  query ItemPatchHistory($itemId: String, $itemName: String, $includeDrafts: Boolean) {
    itemPatchHistory(itemId: $itemId, itemName: $itemName, includeDrafts: $includeDrafts) { ${PATCH_CHANGE_FIELDS} }
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

const IMPORT_PATCH_NOTE_FROM_URL = gql`
  mutation ImportPatchNoteFromUrl($url: String!) {
    importPatchNoteFromUrl(url: $url) { ${PATCH_NOTE_FIELDS} }
  }
`;

const PUBLISH_PATCH_NOTE = gql`
  mutation PublishPatchNote($id: ID!) {
    publishPatchNote(id: $id) { ${PATCH_NOTE_SUMMARY_FIELDS} }
  }
`;

const UNPUBLISH_PATCH_NOTE = gql`
  mutation UnpublishPatchNote($id: ID!) {
    unpublishPatchNote(id: $id) { ${PATCH_NOTE_SUMMARY_FIELDS} }
  }
`;

const REPARSE_PATCH_NOTE = gql`
  mutation ReparsePatchNote($id: ID!) {
    reparsePatchNote(id: $id) { ${PATCH_CHANGE_FIELDS} }
  }
`;

const CREATE_PATCH_CHANGE = gql`
  mutation CreatePatchChange($patchNoteId: String!, $createPatchChangeInput: CreatePatchChangeInput!) {
    createPatchChange(patchNoteId: $patchNoteId, createPatchChangeInput: $createPatchChangeInput) { ${PATCH_CHANGE_FIELDS} }
  }
`;

const UPDATE_PATCH_CHANGE = gql`
  mutation UpdatePatchChange($id: ID!, $updatePatchChangeInput: UpdatePatchChangeInput!) {
    updatePatchChange(id: $id, updatePatchChangeInput: $updatePatchChangeInput) { ${PATCH_CHANGE_FIELDS} }
  }
`;

const REMOVE_PATCH_CHANGE = gql`
  mutation RemovePatchChange($id: ID!) { removePatchChange(id: $id) { _id } }
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

export function usePatchNote(id: string) {
  return useQuery(GET_PATCH_NOTE, () => ({ id }), () => ({ enabled: Boolean(id) }));
}

export function usePatchChanges(filter: PatchChangeFilterInput) {
  return useQuery(GET_PATCH_CHANGES, () => ({ filter }));
}

export function useHeroPatchHistory(heroId?: string, heroName?: string, includeDrafts = false) {
  return useQuery(HERO_PATCH_HISTORY, () => ({ heroId, heroName, includeDrafts }));
}

export function useItemPatchHistory(itemId?: string, itemName?: string, includeDrafts = false) {
  return useQuery(ITEM_PATCH_HISTORY, () => ({ itemId, itemName, includeDrafts }));
}

export function useCreatePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(CREATE_PATCH_NOTE, mutationOptions(token)); return { createPatchNote: mutate, onDone, onError }; }
export function useUpdatePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_PATCH_NOTE, mutationOptions(token)); return { updatePatchNote: mutate, onDone, onError }; }
export function useRemovePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_PATCH_NOTE, mutationOptions(token)); return { removePatchNote: mutate, onDone, onError }; }
export function useImportPatchNoteFromUrl(token: string) { const { mutate, onDone, onError } = useMutation(IMPORT_PATCH_NOTE_FROM_URL, mutationOptions(token)); return { importPatchNoteFromUrl: mutate, onDone, onError }; }
export function usePublishPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(PUBLISH_PATCH_NOTE, mutationOptions(token)); return { publishPatchNote: mutate, onDone, onError }; }
export function useUnpublishPatchNote(token: string) { const { mutate, onDone, onError } = useMutation(UNPUBLISH_PATCH_NOTE, mutationOptions(token)); return { unpublishPatchNote: mutate, onDone, onError }; }
export function useReparsePatchNote(token: string) { const { mutate, onDone, onError } = useMutation(REPARSE_PATCH_NOTE, mutationOptions(token)); return { reparsePatchNote: mutate, onDone, onError }; }
export function useCreatePatchChange(token: string) { const { mutate, onDone, onError } = useMutation(CREATE_PATCH_CHANGE, mutationOptions(token)); return { createPatchChange: mutate, onDone, onError }; }
export function useUpdatePatchChange(token: string) { const { mutate, onDone, onError } = useMutation(UPDATE_PATCH_CHANGE, mutationOptions(token)); return { updatePatchChange: mutate, onDone, onError }; }
export function useRemovePatchChange(token: string) { const { mutate, onDone, onError } = useMutation(REMOVE_PATCH_CHANGE, mutationOptions(token)); return { removePatchChange: mutate, onDone, onError }; }
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
