export interface BuildItem {
  item: {
    _id: string;
    name: string;
    image: string;
    type: string;
  };
  order: number;
}

export interface Build {
  _id: string;
  name: string;
  role: string;
  description?: string;
  hero: {
    _id: string;
    name: string;
    image: string;
  };
  items: BuildItem[];
  emblems: Array<{
    _id: string;
    name: string;
    icon: string;
  }>;
  battle_spells: Array<{
    _id: string;
    name: string;
    icon: string;
  }>;
  user: {
    _id: string;
    name: string;
  };
  is_official: boolean;
}

export interface BuildItemInput {
  itemId: string;
  order: number;
}

export interface BuildFormData {
  _id?: string;
  name: string;
  role: string;
  description?: string;
  heroId: string;
  items: BuildItemInput[];
  emblemIds: string[];
  battleSpellIds: string[];
}

export const ROLE_OPTIONS = [
  'Exp Lane',
  'Gold Lane',
  'Roam',
  'Mid Lane',
  'Jungle'
] as const;

export const createDefaultBuildForm = (): BuildFormData => ({
  name: '',
  role: '',
  description: '',
  heroId: '',
  items: [],
  emblemIds: [],
  battleSpellIds: []
});
