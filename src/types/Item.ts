export interface Item {
  _id: string;
  name: string;
  type: string;
  tag: string;
  tier: string;
  attributes: string[];
  price: string;
  image: string;
  story: string;
  description: string[];
  tips: string;
  parent_items: any[];
}

export interface ItemFormData {
  _id?: string;
  name: string;
  type: string;
  tag: string;
  tier: string;
  attributes: string[];
  price: string;
  image: string;
  story: string;
  description: string[];
  tips: string;
  parent_items: any[];
}

export const ITEM_TYPE_OPTIONS = [
  'Attack',
  'Magic',
  'Defense',
  'Movement',
  'Jungle',
  'Roaming'
] as const;

export const ITEM_TIER_OPTIONS = [
  { label: 'Tier 1', value: 'TIER_1' },
  { label: 'Tier 2', value: 'TIER_2' },
  { label: 'Tier 3', value: 'TIER_3' },
  { label: 'Lain-lain', value: 'ETC' }
] as const;

export const createDefaultItemForm = (): ItemFormData => ({
  name: '',
  type: '',
  tag: '',
  tier: '',
  attributes: [],
  price: '',
  image: '',
  story: '',
  description: [],
  tips: '',
  parent_items: []
});
