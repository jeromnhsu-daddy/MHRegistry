export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Hero {
  id: string;
  name: {
    en: string;
    zh: string;
  };
  rarity: Rarity;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  ability: {
    en: string;
    zh: string;
  };
  attackName: {
    en: string;
    zh: string;
  };
  image: string;
  fallbackImage: string;
  no: number;
  team: string;
}

export interface HeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
}

export interface BattleHero extends Hero, HeroStats {
  currentHp: number;
  readiness: number;
  skillCharge: number;
}

export interface BattleResult {
  win: boolean;
  enemy: Hero;
  player: Hero;
  playerHp: number;
  enemyHp: number;
  challengeId?: string;
  playerTeam: BattleHero[];
  enemyTeam: BattleHero[];
  capturedHeroId?: string | null;
  leveledUpHeroId?: string | null;
}

export interface UserState {
  gold: number;
  ownedHeroIds: string[];
  heroCounts: { [heroId: string]: number };
  heroLevels: { [heroId: string]: number };
  heroCurrentHP?: { [heroId: string]: number };
  lastHPUpdate?: number;
  lastDailyReward?: number;
  shopHeroes?: { heroId: string; price: number; isSold: boolean }[];
  lastShopRefresh?: number;
  badges: string[];
  challengeProgress: { [team: string]: number };
}
