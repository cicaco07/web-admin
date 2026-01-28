export interface EmblemAttribute {
  [key: string]: number | string;
  icon: string;
}

export interface Emblem {
  _id: string;
  name: string;
  type: string;
  icon: string;
  attributes: EmblemAttribute[];
  benefit: string;
  description: string;
  cooldown: string;
}

export interface EmblemFormData {
  _id?: string;
  name: string;
  type: string;
  icon: string;
  attributes: EmblemAttribute[];
  benefit: string;
  description: string;
  cooldown: string;
}

export const EMBLEM_TYPE_OPTIONS = [
  'Main Emblem',
  'Common Talent - Section 1',
  'Common Talent - Section 2',
  'Primary Talent'
] as const;

export const createDefaultEmblemForm = (): EmblemFormData => ({
  name: '',
  type: '',
  icon: '',
  attributes: [],
  benefit: '',
  description: '',
  cooldown: ''
});
