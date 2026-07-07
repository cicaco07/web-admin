export type PatchNoteType = 'MAJOR' | 'MINOR' | 'PATCH' | 'HOTFIX';
export type PatchNoteStatus = 'DRAFT' | 'PUBLISHED';
export type PatchTargetType = 'HERO' | 'ITEM' | 'BATTLEFIELD' | 'SYSTEM' | 'GAME_MODE';
export type PatchChangeType = 'NEW' | 'BUFF' | 'NERF' | 'ADJUSTED' | 'REWORK' | 'REMOVED' | 'new' | 'buff' | 'nerf' | 'adjusted' | 'rework' | 'removed';

export interface HeroChangeDetail {
  name: string;
  change_type: PatchChangeType;
  description: string;
}

export interface HeroChange {
  name: string;
  alias?: string;
  change_type: PatchChangeType;
  description: string;
  change_details?: HeroChangeDetail[];
}

export interface HeroPatchNote {
  _id: string;
  title: string;
  description: string;
  hero_changes?: HeroChange[];
}

export interface SimplePatchNoteSection {
  _id: string;
  title: string;
  description: string;
  change_details?: Record<string, unknown>;
}

export interface PatchChangeDetail {
  field: string;
  old_value?: string;
  new_value?: string;
  unit?: string;
  raw_text: string;
  note?: string;
}

export interface PatchChange {
  _id: string;
  patch_note?: PatchNote;
  target_type: PatchTargetType;
  target_ref?: string;
  target_name: string;
  change_type: PatchChangeType;
  section: string;
  title?: string;
  description: string;
  details?: PatchChangeDetail[];
  raw_text?: string;
  order: number;
  deleted_at?: string;
}

export interface PatchChangeFilterInput {
  patchNoteId?: string;
  targetType?: PatchTargetType;
  targetId?: string;
  targetName?: string;
  changeType?: PatchChangeType;
  version?: string;
  includeDrafts?: boolean;
}

export interface PatchNote {
  _id: string;
  name: string;
  version?: string;
  start_date: string;
  end_date: string;
  published_at?: string;
  type: PatchNoteType;
  season: number;
  is_active: boolean;
  status?: PatchNoteStatus;
  source_url?: string;
  source_newsid?: string;
  summary?: string;
  raw_content?: string;
  imported_at?: string;
  hero_changes?: HeroPatchNote[];
  battlefield_changes?: SimplePatchNoteSection[];
  system_changes?: SimplePatchNoteSection[];
  game_mode_changes?: SimplePatchNoteSection[];
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
}

export interface PatchNoteFormData {
  _id?: string;
  name: string;
  version?: string;
  start_date: string;
  end_date: string;
  published_at?: string;
  type: PatchNoteType;
  season: number;
  is_active: boolean;
  status?: PatchNoteStatus;
  source_url?: string;
  source_newsid?: string;
  summary?: string;
  raw_content?: string;
}

export interface PatchChangeFormData {
  _id?: string;
  patchNoteId?: string;
  target_type: PatchTargetType;
  target_ref?: string;
  target_name: string;
  change_type: PatchChangeType;
  section: string;
  title?: string;
  description: string;
  details: PatchChangeDetail[];
  raw_text?: string;
  order: number;
}

export interface HeroPatchNoteFormData {
  _id?: string;
  patchNoteId: string;
  title: string;
  description: string;
  hero_changes: HeroChange[];
}

export interface SimplePatchNoteSectionFormData {
  _id?: string;
  patchNoteId: string;
  title: string;
  description: string;
  change_details: string;
}

export const PATCH_NOTE_TYPE_OPTIONS: PatchNoteType[] = ['MAJOR', 'MINOR', 'PATCH', 'HOTFIX'];
export const PATCH_NOTE_STATUS_OPTIONS: PatchNoteStatus[] = ['DRAFT', 'PUBLISHED'];
export const PATCH_TARGET_TYPE_OPTIONS: PatchTargetType[] = ['HERO', 'ITEM', 'BATTLEFIELD', 'SYSTEM', 'GAME_MODE'];
export const PATCH_CHANGE_TYPE_OPTIONS: PatchChangeType[] = ['NEW', 'BUFF', 'NERF', 'ADJUSTED', 'REWORK', 'REMOVED'];

export const createDefaultPatchNoteForm = (): PatchNoteFormData => ({
  name: '',
  version: '',
  start_date: '',
  end_date: '',
  published_at: '',
  type: 'PATCH',
  season: 0,
  is_active: false,
  status: 'DRAFT',
  source_url: '',
  source_newsid: '',
  summary: '',
  raw_content: '',
});

export const createDefaultPatchChangeForm = (patchNoteId = ''): PatchChangeFormData => ({
  patchNoteId,
  target_type: 'HERO',
  target_ref: '',
  target_name: '',
  change_type: 'ADJUSTED',
  section: 'General',
  title: '',
  description: '',
  details: [],
  raw_text: '',
  order: 0,
});

export const createDefaultHeroPatchNoteForm = (): HeroPatchNoteFormData => ({
  patchNoteId: '',
  title: '',
  description: '',
  hero_changes: [],
});

export const createDefaultSimplePatchNoteSectionForm = (): SimplePatchNoteSectionFormData => ({
  patchNoteId: '',
  title: '',
  description: '',
  change_details: '{}',
});
