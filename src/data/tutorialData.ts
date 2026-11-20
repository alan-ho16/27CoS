export interface Equipment {
  name: string;
  attackBonus: number;
  defenseBonus: number;
}

export interface Boss {
  name: string;
  maxHp: number;
  attack: number;
  introText: string;
}

export const STARTING_EQUIPMENT: Equipment[] = [
  { name: 'Rusty Longsword', attackBonus: 4, defenseBonus: 0 },
  { name: 'Copper Shield', attackBonus: 2, defenseBonus: 3 },
  { name: 'Weird Monocles', attackBonus: 6, defenseBonus: -1 },
];

export const TUTORIAL_BOSS: Boss = {
  name: 'Hubbob, Common Goblin',
  maxHp: 35,
  attack: 5,
  introText: 'A slightly above-average height goblin appears!',
};
