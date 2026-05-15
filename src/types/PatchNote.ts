export type PatchNoteType = 'major' | 'minor' | 'patch' | 'hotfix';
export type PatchChangeType = 'new' | 'buff' | 'nerf' | 'adjusted' | 'rework' | 'removed';

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

export interface PatchNote {
  _id: string;
  name: string;
  start_date: string;
  end_date: string;
  type: PatchNoteType;
  season: number;
  is_active: boolean;
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
  start_date: string;
  end_date: string;
  type: PatchNoteType;
  season: number;
  is_active: boolean;
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

export const PATCH_NOTE_TYPE_OPTIONS: PatchNoteType[] = ['major', 'minor', 'patch', 'hotfix'];
export const PATCH_CHANGE_TYPE_OPTIONS: PatchChangeType[] = ['new', 'buff', 'nerf', 'adjusted', 'rework', 'removed'];

export const createDefaultPatchNoteForm = (): PatchNoteFormData => ({
  name: '',
  start_date: '',
  end_date: '',
  type: 'patch',
  season: 0,
  is_active: true,
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
