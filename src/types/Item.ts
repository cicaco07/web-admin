export interface Item {
  _id: string;
  name: string;
  type: string;
  tag: string;
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

export const createDefaultItemForm = (): ItemFormData => ({
  name: '',
  type: '',
  tag: '',
  attributes: [],
  price: '',
  image: '',
  story: '',
  description: [],
  tips: '',
  parent_items: []
});
