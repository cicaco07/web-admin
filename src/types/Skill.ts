export interface Skill {
  _id: string;
  name: string;
  type: string;
  tag: string[];
  skill_icon: string;
  lite_description: string;
  full_description: string;
  heroName?: string;
}

export interface SkillDetail {
  level: number;
  attributes: Record<string, number>;
}

export interface SkillFormData {
  heroId: string;
  name: string;
  type: string;
  tag: string[];
  skill_icon: string;
  lite_description: string;
  full_description: string;
}

export interface SkillDetailFormData {
  levelCount: number;
  attributeCount: number;
  attributeKeys: string[];
  formValues: string[][];
}

export const createDefaultSkillForm = (): SkillFormData => ({
  heroId: '',
  name: '',
  type: '',
  tag: [],
  skill_icon: '',
  lite_description: '',
  full_description: ''
});

export const createDefaultSkillDetailForm = (): SkillDetailFormData => ({
  levelCount: 0,
  attributeCount: 0,
  attributeKeys: [],
  formValues: []
});

export const SKILL_TAG_OPTIONS = ['Buff', 'CC', 'Area Efek', 'Conceal', 'Heal', 'Blink', 'Debuff', 'Menghapus CC', 'Slow', 'Burst Damage', 'Kebal Eleminasi'] as const;
export const SKILL_TYPE_OPTIONS = ['Passive', 'Skill 1', 'Skill 2', 'Ultimate'] as const;
