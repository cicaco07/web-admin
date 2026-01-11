export interface Hero {
  _id: string;
  name: string;
  alias: string;
  role: string[];
  type: string[];
  speciality: string;
  region: string;
  hero_order: number;
  short_description: string;
  avatar: string;
  image: string;
  release_date: string;
  durability: number;
  offense: number;
  control_effect: number;
  difficulty: number;
}

export interface HeroFormData {
  _id?: string;
  name: string;
  alias: string;
  role: string[];
  type: string[];
  speciality: string;
  region: string;
  hero_order: number;
  short_description: string;
  avatar: string;
  image: string;
  release_date: string;
  durability: number;
  offense: number;
  control_effect: number;
  difficulty: number;
}

export const createDefaultHeroForm = (): HeroFormData => ({
  name: '',
  alias: '',
  role: [],
  type: [],
  speciality: '',
  region: '',
  hero_order: 0,
  short_description: '',
  avatar: '',
  image: '',
  release_date: '',
  durability: 0,
  offense: 0,
  control_effect: 0,
  difficulty: 0
});

export const HERO_TYPE_OPTIONS = ['Tank', 'Assassin', 'Fighter', 'Marksman', 'Mage', 'Support'] as const;
export const HERO_ROLE_OPTIONS = ['Roam', 'Jungle', 'Mid Lane', 'Exp Lane', 'Gold Lane'] as const;
