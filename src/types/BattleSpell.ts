export interface BattleSpell {
  _id: string;
  name: string;
  tag: string;
  icon: string;
  description: string;
  cooldown: number;
}

export interface BattleSpellFormData {
  _id?: string;
  name: string;
  tag: string;
  icon: File | string | null;
  description: string;
  cooldown: number;
}

export const createDefaultBattleSpellForm = (): BattleSpellFormData => ({
  name: '',
  tag: '',
  icon: null,
  description: '',
  cooldown: 0
});
