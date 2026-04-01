import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Zap, Swords, Shield, Languages, Info, ShoppingBag, Trophy, LayoutGrid, Sparkles, Coins, User, Heart, RefreshCw, DollarSign, Volume2, VolumeX, Swords as BattleIcon, Skull, Rocket, Target, Scale, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEROES } from './data/heroes';
import { Hero, UserState, HeroStats, BattleHero, BattleResult } from './types';

type View = 'registry' | 'gacha' | 'collection' | 'shop' | 'battle' | 'challenges';

interface Challenge {
  id: string;
  team: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  difficulty: number;
  rewardGold: number;
  badge: string;
  bg: string;
}

const CHALLENGES: Challenge[] = [
  { id: 'avengers-1', team: 'Avengers', name: { en: 'Avengers Assemble', zh: '復仇者集結' }, description: { en: 'Defeat the Avengers in their home base.', zh: '在他們的基地擊敗復仇者。' }, difficulty: 1, rewardGold: 1000, badge: '🛡️ Avengers Medal', bg: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1920' },
  { id: 'xmen-1', team: 'X-Men', name: { en: 'Mutant Menace', zh: '變種人威脅' }, description: { en: 'Face the X-Men at the Xavier Institute.', zh: '在澤維爾學院面對 X 戰警。' }, difficulty: 2, rewardGold: 1500, badge: '❌ X-Badge', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920' },
  { id: 'suicide-squad-1', team: 'Suicide Squad', name: { en: 'Task Force X', zh: 'X 特遣隊' }, description: { en: 'Survive a deadly encounter with the Suicide Squad.', zh: '在與自殺突擊隊的致命遭遇中生存下來。' }, difficulty: 3, rewardGold: 2000, badge: '🎯 Squad Target', bg: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1920' },
  { id: 'guardians-1', team: 'Guardians', name: { en: 'Galaxy Quest', zh: '銀河任務' }, description: { en: 'Battle the Guardians in deep space.', zh: '在深空與守護者戰鬥。' }, difficulty: 3, rewardGold: 2000, badge: '🚀 Star Lord Mask', bg: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920' },
  { id: 'spider-1', team: 'Spider-Verse', name: { en: 'Web of Fate', zh: '命運之網' }, description: { en: 'Face the heroes of the Spider-Verse.', zh: '面對蜘蛛宇宙的英雄。' }, difficulty: 3, rewardGold: 2500, badge: '🕸️ Spider Emblem', bg: 'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?auto=format&fit=crop&q=80&w=1920' },
  { id: 'justice-league-1', team: 'Justice League', name: { en: 'Justice for All', zh: '正義降臨' }, description: { en: 'Face the legendary Justice League in the Watchtower.', zh: '在瞭望塔面對傳奇的正義聯盟。' }, difficulty: 4, rewardGold: 3500, badge: '⚖️ Justice Emblem', bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920' },
  { id: 'villains-1', team: 'Villains', name: { en: 'Sinister Siege', zh: '邪惡圍攻' }, description: { en: 'Storm the Villain stronghold.', zh: '攻佔惡棍據點。' }, difficulty: 4, rewardGold: 3000, badge: '💀 Villain Skull', bg: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=1920' },
  { id: 'cosmic-1', team: 'Cosmic', name: { en: 'Cosmic Clash', zh: '宇宙衝突' }, description: { en: 'A battle of universal proportions.', zh: '一場宇宙級別的戰鬥。' }, difficulty: 5, rewardGold: 5000, badge: '✨ Infinity Shard', bg: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1920' },
];

// Sub-component for Hero Card to keep App.tsx cleaner
const HeroCard: React.FC<{ 
  hero: Hero; 
  isOwned: boolean; 
  getRarityStyles: (r: string) => string;
  t: (key: string) => string;
  lang: string;
  stats: HeroStats;
  onLevelUp?: () => void;
  gold?: number;
  onSelect?: () => void;
  showColor?: boolean;
  count?: number;
  currentHp?: number;
  isCompact?: boolean;
}> = ({ hero, isOwned, getRarityStyles, t, lang, stats, onLevelUp, gold, onSelect, showColor, count, currentHp, isCompact }) => {
  const levelCost = (stats?.level || 1) * 100;
  const effectiveColor = showColor || isOwned;
  const isClickable = isOwned || showColor;
  const hpPercent = currentHp !== undefined ? Math.min(100, (currentHp / stats.hp) * 100) : 100;
  
  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`group relative bg-zinc-900 border transition-all ${
          isClickable 
            ? `${isOwned ? 'border-red-600' : 'border-zinc-800'} hover:border-red-500 cursor-pointer` 
            : 'border-zinc-900 opacity-40 grayscale'
        }`}
        onClick={() => isClickable && onSelect?.()}
      >
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={hero.image} 
            alt={hero.name.en}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${effectiveColor ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== hero.fallbackImage) {
                target.src = hero.fallbackImage;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* HP Bar for Compact View */}
          {isOwned && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: `${hpPercent}%` }}
                className={`h-full ${hpPercent < 30 ? 'bg-red-500' : hpPercent < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              />
            </div>
          )}

          <div className="absolute top-1 left-1 flex flex-col gap-0.5">
            <div className="bg-white text-black w-5 h-5 flex items-center justify-center font-black italic text-[10px] border border-black">
              {hero.no}
            </div>
            {isOwned && (
              <div className="bg-red-600 text-white px-1 py-0.5 text-[8px] font-black italic border border-black">
                L{stats.level}
              </div>
            )}
          </div>

          <div className="absolute top-1 right-1">
            <div className={`px-1 py-0.5 text-[7px] font-black uppercase border border-black ${getRarityStyles(hero.rarity).split(' shadow-')[0]}`}>
              {t(`rarity${hero.rarity}`)}
            </div>
          </div>
        </div>
        <div className="p-1.5">
          <h3 className="text-[10px] font-black uppercase italic truncate leading-none">
            {lang === 'en' ? hero.name.en : hero.name.zh}
          </h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-zinc-900 border-2 transition-colors ${
        isClickable 
          ? `${isOwned ? 'border-red-600' : 'border-zinc-800'} hover:border-red-500 cursor-pointer` 
          : 'border-zinc-900 opacity-40 grayscale'
      }`}
      onClick={() => isClickable && onSelect?.()}
    >
      {!isOwned && !showColor && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <Shield className="w-12 h-12 text-zinc-700" />
        </div>
      )}

      {/* Hero Number & Level Overlay */}
      <div className="absolute -top-4 -left-4 z-20 flex flex-col gap-1">
        <div className="bg-white text-black w-12 h-12 flex items-center justify-center font-black italic text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          {hero.no}
        </div>
        {isOwned && stats && (
          <div className="bg-red-600 text-white px-2 py-1 text-[10px] font-black italic border-2 border-black">
            LV.{stats.level}
          </div>
        )}
        {isOwned && count && count > 1 && (
          <div className="bg-amber-500 text-black px-2 py-1 text-[10px] font-black italic border-2 border-black">
            x{count}
          </div>
        )}
      </div>

      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-zinc-800 group-hover:border-red-600 transition-colors">
        <img 
          src={hero.image} 
          alt={hero.name.en}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${effectiveColor ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== hero.fallbackImage) {
              target.src = hero.fallbackImage;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="space-y-1">
            <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter ${getRarityStyles(hero.rarity)}`}>
              {t(`rarity${hero.rarity}`)}
            </span>
            <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter">
              {lang === 'en' ? hero.name.en : hero.name.zh}
            </h2>
          </div>
        </div>

        {/* HP Bar for Standard View */}
        {isOwned && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900/80">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercent}%` }}
              className={`h-full ${hpPercent < 30 ? 'bg-red-500' : hpPercent < 70 ? 'bg-yellow-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <span>{t(`team${hero.team.replace(/[\s-]+/g, '')}`)}</span>
          <span className="text-red-600">ID: {hero.id.split('-')[1]}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <Swords className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase">{t('attack')}</span>
            </div>
            <p className="text-sm font-bold truncate">
              {lang === 'en' ? hero.attackName.en : hero.attackName.zh}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <Zap className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase">{t('ability')}</span>
            </div>
            <p className="text-sm font-bold truncate">
              {lang === 'en' ? hero.ability.en : hero.ability.zh}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="pt-4 border-t-2 border-zinc-800 grid grid-cols-4 gap-2">
            {[
              { label: 'HP', val: stats.hp, color: 'bg-green-500', current: currentHp },
              { label: 'ATK', val: stats.attack, color: 'bg-red-500' },
              { label: 'DEF', val: stats.defense, color: 'bg-blue-500' },
              { label: 'SPD', val: stats.speed, color: 'bg-yellow-500' }
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-zinc-500">{stat.label}</span>
                  <span className={`text-[10px] font-mono font-bold ${stat.label === 'HP' && stat.current !== undefined && stat.current < stat.val * 0.3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {stat.label === 'HP' && stat.current !== undefined ? `${Math.floor(Math.min(stat.current, stat.val))} / ${stat.val}` : stat.val}
                  </span>
                </div>
                <div className="h-1 bg-zinc-800 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((stat.label === 'HP' && stat.current !== undefined ? stat.current : stat.val) / (stat.label === 'HP' ? stat.val : 2)) * 100, 100)}%` }}
                    className={`h-full ${stat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Level Up Button */}
        {isOwned && onLevelUp && stats && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLevelUp();
            }}
            disabled={count && count > 1 ? false : (!gold || gold < levelCost)}
            className="w-full py-2 bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 mt-2"
          >
            {count && count > 1 ? (
              <span className="text-amber-500">{t('useDuplicate')} (FREE)</span>
            ) : (
              <>{t('levelUp')} ({levelCost} <Coins className="inline w-3 h-3" />)</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('registry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | 'All'>('All');
  
  // User State
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('marvel_user_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const ownedHeroIds = Array.isArray(parsed.ownedHeroIds) ? parsed.ownedHeroIds : ['hero-1'];
          return {
            gold: typeof parsed.gold === 'number' ? parsed.gold : 1000,
            ownedHeroIds: ownedHeroIds,
            heroLevels: parsed.heroLevels ?? { 'hero-1': 1 },
            heroCounts: parsed.heroCounts ?? Object.fromEntries(ownedHeroIds.map((id: string) => [id, 1])),
            heroCurrentHP: parsed.heroCurrentHP ?? {},
            lastHPUpdate: parsed.lastHPUpdate ?? Date.now(),
            lastDailyReward: parsed.lastDailyReward,
            badges: Array.isArray(parsed.badges) ? parsed.badges : [],
            challengeProgress: parsed.challengeProgress ?? {},
            challengeAttempts: parsed.challengeAttempts ?? {},
            shopHeroes: Array.isArray(parsed.shopHeroes) ? parsed.shopHeroes : [],
            lastShopRefresh: parsed.lastShopRefresh
          };
        }
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    return { 
      gold: 1000, 
      ownedHeroIds: ['hero-1'], 
      heroLevels: { 'hero-1': 1 }, 
      heroCounts: { 'hero-1': 1 }, 
      heroCurrentHP: {},
      lastHPUpdate: Date.now(),
      badges: [], 
      challengeProgress: {}, 
      challengeAttempts: {},
      shopHeroes: [] 
    };
  });

  const [isCompactView, setIsCompactView] = useState(() => {
    const saved = localStorage.getItem('marvel_compact_view');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('marvel_compact_view', String(isCompactView));
  }, [isCompactView]);

  // Gacha State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnHeroes, setDrawnHeroes] = useState<Hero[]>([]);

  // Battle State
  const [isBattling, setIsBattling] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [liveBattleState, setLiveBattleState] = useState<{ 
    pTeam: BattleHero[], 
    eTeam: BattleHero[], 
    activeP: number, 
    activeE: number, 
    attacker: 'player' | 'enemy' | null,
    skillEffect: 'player' | 'enemy' | null,
    teamAttackEffect: boolean,
    bg?: string,
    challengeId?: string
  } | null>(null);

  // Detail Modal
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // 3v3 Battle Selection State
  const [battleTeamIds, setBattleTeamIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('marvel_battle_team');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [battleSortBy, setBattleSortBy] = useState<'hp' | 'attack' | 'defense' | 'speed' | 'level'>('level');
  const [battleSortOrder, setBattleSortOrder] = useState<'asc' | 'desc'>('desc');
  const [battleFilterTeam, setBattleFilterTeam] = useState<string | 'All'>('All');
  const [pendingChallengeId, setPendingChallengeId] = useState<string | undefined>(undefined);

  const [collectionSortBy, setCollectionSortBy] = useState<'hp' | 'attack' | 'defense' | 'speed' | 'level' | 'price'>('level');
  const [collectionSortOrder, setCollectionSortOrder] = useState<'asc' | 'desc'>('desc');
  const [collectionFilterTeam, setCollectionFilterTeam] = useState<string | 'All'>('All');

  const [isMuted, setIsMuted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [isSelectingReward, setIsSelectingReward] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Healing Mechanism: Recover 1% HP every minute
  useEffect(() => {
    const healInterval = setInterval(() => {
      setUser(prev => {
        const now = Date.now();
        const lastUpdate = prev.lastHPUpdate || now;
        const elapsedMinutes = Math.floor((now - lastUpdate) / 60000);
        if (elapsedMinutes < 1) return prev;

        const newHP = { ...(prev.heroCurrentHP || {}) };
        let changed = false;

        prev.ownedHeroIds.forEach(id => {
          const hero = HEROES.find(h => h.id === id);
          if (!hero) return;
          
          const level = prev.heroLevels?.[id] || 1;
          const multiplier = 1 + (level - 1) * 0.1;
          const maxHp = Math.floor(hero.hp * multiplier);
          
          const current = newHP[id] ?? maxHp;
          
          // Healing: 1% per minute
          const healAmount = maxHp * 0.01 * elapsedMinutes;
          let nextHP = current + healAmount;
          
          // Cap at max HP
          if (nextHP > maxHp) nextHP = maxHp;
          
          // Also fix if it was somehow above max (from previous session)
          if (current > maxHp) {
            nextHP = maxHp;
            changed = true;
          }

          if (Math.floor(nextHP) !== Math.floor(current)) {
            newHP[id] = Math.floor(nextHP);
            changed = true;
          }
        });

        if (!changed && elapsedMinutes < 5) return prev;

        return {
          ...prev,
          heroCurrentHP: newHP,
          lastHPUpdate: now
        };
      });
    }, 60000);
    return () => clearInterval(healInterval);
  }, [user.ownedHeroIds]);

  const playSound = useCallback((type: 'draw' | 'battleStart' | 'attack' | 'skill' | 'win' | 'lose' | 'teamAttack') => {
    if (isMuted) return;
    const sounds = {
      draw: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
      battleStart: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      attack: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      skill: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
      lose: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
      teamAttack: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [isMuted]);

  const [shopTab, setShopTab] = useState<'buy' | 'sell'>('buy');

  const logRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  useEffect(() => {
    localStorage.setItem('marvel_battle_team', JSON.stringify(battleTeamIds));
  }, [battleTeamIds]);

  useEffect(() => {
    localStorage.setItem('marvel_user_state', JSON.stringify(user));
  }, [user]);

  const teams = ['All', ...new Set(HEROES.map(h => h.team))];

  const getHeroStats = (hero: Hero, level?: number): HeroStats => {
    const finalLevel = level !== undefined ? level : (user.heroLevels?.[hero.id] || 1);
    const multiplier = 1 + (finalLevel - 1) * 0.1;
    return {
      hp: Math.floor(hero.hp * multiplier),
      attack: Math.floor(hero.attack * multiplier),
      defense: Math.floor(hero.defense * multiplier),
      speed: Math.floor(hero.speed * multiplier),
      level: finalLevel
    };
  };

  const isDailyClaimable = useMemo(() => {
    if (!user.lastDailyReward) return true;
    return now - user.lastDailyReward >= 86400000;
  }, [user.lastDailyReward, now]);

  const teamAttackParticles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    y: `${(i * 5) % 100}%`
  })), []);

  const skillEffectParticles = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    y: `${(i * 10) % 100}%`
  })), []);

  const filteredHeroes = useMemo(() => {
    return HEROES.filter((hero) => {
      const matchesSearch = hero.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hero.name.zh.includes(searchTerm);
      const matchesTeam = selectedTeam === 'All' || hero.team === selectedTeam;
      const matchesView = currentView === 'collection' ? user.ownedHeroIds.includes(hero.id) : true;
      return matchesSearch && matchesTeam && matchesView;
    });
  }, [searchTerm, selectedTeam, currentView, user.ownedHeroIds]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-amber-500 text-black shadow-[4px_4px_0px_0px_rgba(251,191,36,0.3)]';
      case 'Epic': return 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(147,51,234,0.3)]';
      case 'Rare': return 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)]';
      default: return 'bg-zinc-700 text-zinc-200 shadow-[4px_4px_0px_0px_rgba(63,63,70,0.3)]';
    }
  };

  const drawHero = (count: number = 1) => {
    const cost = count * 100;
    if (user.gold < cost) return;
    
    playSound('draw');
    setIsDrawing(true);
    setDrawnHeroes([]);

    setTimeout(() => {
      const results: Hero[] = [];
      const newOwnedIds = [...user.ownedHeroIds];
      const newLevels = { ...(user.heroLevels || {}) };
      const newCounts = { ...(user.heroCounts || {}) };

      for (let i = 0; i < count; i++) {
        const rand = Math.random() * 100;
        let targetRarity: Hero['rarity'] = 'Common';
        if (rand < 5) targetRarity = 'Legendary';
        else if (rand < 15) targetRarity = 'Epic';
        else if (rand < 40) targetRarity = 'Rare';

        const pool = HEROES.filter(h => h.rarity === targetRarity);
        const drawn = pool[Math.floor(Math.random() * pool.length)];
        results.push(drawn);
        
        if (!newOwnedIds.includes(drawn.id)) {
          newOwnedIds.push(drawn.id);
          newLevels[drawn.id] = 1;
          newCounts[drawn.id] = 1;
        } else {
          newCounts[drawn.id] = (newCounts[drawn.id] || 0) + 1;
        }
      }

      setDrawnHeroes(results);
      setIsDrawing(false);
      setUser(prev => ({
        ...prev,
        gold: prev.gold - cost,
        ownedHeroIds: newOwnedIds,
        heroLevels: newLevels,
        heroCounts: newCounts
      }));
    }, 1500);
  };

  const levelUp = (heroId: string) => {
    setUser(prev => {
      const levels = prev.heroLevels || {};
      const counts = prev.heroCounts || {};
      const currentLevel = levels[heroId] || 1;
      const currentCount = counts[heroId] || 1;
      
      const newLevels = { ...levels, [heroId]: currentLevel + 1 };
      const hero = HEROES.find(h => h.id === heroId);
      const newStats = hero ? {
        hp: Math.floor(hero.hp * (1 + (currentLevel) * 0.1)),
        attack: Math.floor(hero.attack * (1 + (currentLevel) * 0.1)),
        defense: Math.floor(hero.defense * (1 + (currentLevel) * 0.1)),
        speed: Math.floor(hero.speed * (1 + (currentLevel) * 0.1)),
        level: currentLevel + 1
      } : null;

      const newHP = { ...(prev.heroCurrentHP || {}) };
      if (newStats) {
        newHP[heroId] = newStats.hp; // Fully heal on level up
      }

      // Use duplicate to level up
      if (currentCount > 1) {
        return {
          ...prev,
          heroLevels: newLevels,
          heroCounts: { ...counts, [heroId]: currentCount - 1 },
          heroCurrentHP: newHP
        };
      } else {
        // Use gold if no duplicate
        const cost = currentLevel * 100;
        if (prev.gold < cost) return prev;

        return {
          ...prev,
          gold: prev.gold - cost,
          heroLevels: newLevels,
          heroCurrentHP: newHP
        };
      }
    });
  };

  const startBattle = (challengeId?: string) => {
    if (battleTeamIds.length < 3) return;
    
    // Safety check: ensure no low HP heroes are in the team
    const hasLowHPHero = battleTeamIds.some(id => {
      const h = HEROES.find(hero => hero.id === id);
      if (!h) return false;
      const stats = getHeroStats(h);
      const currentHp = user.heroCurrentHP?.[h.id] ?? stats.hp;
      return currentHp < stats.hp * 0.1;
    });
    if (hasLowHPHero) return;

    const finalChallengeId = challengeId || pendingChallengeId;
    const challenge = finalChallengeId ? CHALLENGES.find(c => c.id === finalChallengeId) : null;
    
    setCurrentView('battle');
    setIsBattling(true);
    setBattleResult(null);
    setBattleLog([]);
    setPendingChallengeId(undefined); // Clear pending challenge when battle starts

    const playerTeam = battleTeamIds.map(id => HEROES.find(h => h.id === id)!);
    const avgPlayerLevel = Math.max(1, Math.floor(playerTeam.reduce((sum, h) => sum + (user.heroLevels?.[h.id] || 1), 0) / playerTeam.length));
    
    let enemyTeam: Hero[] = [];
    let enemyLevel = avgPlayerLevel;

    if (challenge) {
      const teamHeroes = HEROES.filter(h => h.team === challenge.team);
      for (let i = 0; i < 3; i++) {
        enemyTeam.push(teamHeroes[Math.floor(Math.random() * teamHeroes.length)]);
      }
      
      // Pity Mechanic: Repeated attempts weaken the opponent
      const attempts = user.challengeAttempts?.[challenge.id] || 0;
      const pityBonus = Math.min(3, attempts); // Max -3 level pity bonus
      
      // Challenges are harder: higher base level + difficulty multiplier + random fluctuation (-2 to +2) - pity bonus
      const randomOffset = Math.floor(Math.random() * 5) - 2; 
      enemyLevel = Math.max(1, avgPlayerLevel + challenge.difficulty + randomOffset - pityBonus);
      
      // Increment attempt count for next time (will be reset on win)
      setUser(prev => ({
        ...prev,
        challengeAttempts: {
          ...(prev.challengeAttempts || {}),
          [challenge.id]: (prev.challengeAttempts?.[challenge.id] || 0) + 1
        }
      }));
    } else {
      enemyLevel = Math.max(1, avgPlayerLevel + (Math.random() > 0.5 ? 1 : -1));
      enemyTeam = Array.from({ length: 3 }).map(() => HEROES[Math.floor(Math.random() * HEROES.length)]);
    }

    // Team Synergy Check
    const pTeams = new Set(playerTeam.map(h => h.team));
    const hasSynergy = pTeams.size === 1;
    const synergyBonus = hasSynergy ? 1.25 : 1.0; // Slightly buffed synergy from 1.2 to 1.25

    const pTeamStats = playerTeam.map(h => {
      const base = getHeroStats(h);
      const savedHp = user.heroCurrentHP?.[h.id];
      // Ensure currentHp is capped at base max HP before applying synergy bonus
      const currentHp = Math.min(base.hp, savedHp !== undefined ? savedHp : base.hp);
      
      return { 
        ...h, 
        ...base, 
        hp: Math.floor(base.hp * synergyBonus),
        attack: Math.floor(base.attack * synergyBonus),
        defense: Math.floor(base.defense * synergyBonus),
        speed: Math.floor(base.speed * synergyBonus),
        currentHp: Math.floor(currentHp * synergyBonus),
        readiness: 0,
        skillCharge: 0
      };
    });

    const diffScale = challenge ? 1 + (challenge.difficulty * 0.05) : 1.0; // Reduced from 0.1 to 0.05 per difficulty level
    const eTeamStats = enemyTeam.map(h => {
      const base = getHeroStats(h, enemyLevel);
      return { 
        ...h, 
        ...base, 
        hp: Math.floor(base.hp * diffScale), 
        attack: Math.floor(base.attack * diffScale), 
        defense: Math.floor(base.defense * diffScale), 
        speed: Math.floor(base.speed * diffScale), 
        currentHp: Math.floor(base.hp * diffScale), 
        readiness: 0, 
        skillCharge: 0 
      };
    });

    setLiveBattleState({
      pTeam: [...pTeamStats],
      eTeam: [...eTeamStats],
      activeP: 0,
      activeE: 0,
      attacker: null,
      skillEffect: null,
      teamAttackEffect: false,
      bg: challenge?.bg,
      challengeId: finalChallengeId
    });

    playSound('battleStart');

    const logs: string[] = [t('battleStart')];
    if (challenge) {
      logs.push(`${t('challenge')}: ${i18n.language === 'en' ? challenge.name.en : challenge.name.zh}`);
      if (enemyLevel < avgPlayerLevel + challenge.difficulty) {
        logs.push(`⚠️ ${i18n.language === 'zh' ? '偵測到對手狀態不佳！這是進攻的好機會！' : 'Enemy seems weakened! Perfect time to strike!'}`);
      } else if (enemyLevel > avgPlayerLevel + challenge.difficulty) {
        logs.push(`🔥 ${i18n.language === 'zh' ? '警告：對手正處於巔峰狀態，請小心應戰！' : 'Warning: Enemy is at peak performance! Be careful!'}`);
      }
    }
    logs.push(`${t('playerTeam')}: ${playerTeam.map(h => i18n.language === 'zh' ? h.name.zh : h.name.en).join(', ')}`);
    logs.push(`${t('enemyTeamLabel')}: ${enemyTeam.map(h => i18n.language === 'zh' ? h.name.zh : h.name.en).join(', ')}`);

    let isAnimationPlaying = false;

    const interval = setInterval(() => {
      if (isAnimationPlaying) return;

      // Team Attack Logic (Player Only)
      // Trigger only if synergy exists, all 3 heroes are alive, and 2% random chance
      const aliveP = pTeamStats.filter(h => h.currentHp > 0).length;
      if (hasSynergy && aliveP === 3 && Math.random() < 0.02) {
        const activeEIdx = eTeamStats.findIndex(h => h.currentHp > 0);
        if (activeEIdx !== -1) {
          isAnimationPlaying = true;
          playSound('teamAttack');
          setLiveBattleState(prev => prev ? { ...prev, teamAttackEffect: true } : null);
          const totalAtk = pTeamStats.reduce((sum, h) => sum + (h.currentHp > 0 ? h.attack : 0), 0);
          // Buffed damage multiplier from 0.4 to 0.6
          const dmg = totalAtk * 0.6;
          
          logs.push(`${t('teamAttack')}: ${Array.from(pTeams)[0]} ${t('assemble')}`);
          eTeamStats.forEach(h => {
            if (h.currentHp > 0) h.currentHp -= Math.max(10, dmg - h.defense / 2);
          });

          setTimeout(() => {
            setLiveBattleState(prev => prev ? { ...prev, teamAttackEffect: false, eTeam: [...eTeamStats] } : null);
            isAnimationPlaying = false;
          }, 1500);
          return;
        }
      }

      // Update readiness based on speed
      pTeamStats.forEach(h => { if (h.currentHp > 0) h.readiness += h.speed / 5; });
      eTeamStats.forEach(h => { if (h.currentHp > 0) h.readiness += h.speed / 5; });

      const activePIdx = pTeamStats.findIndex(h => h.currentHp > 0);
      const activeEIdx = eTeamStats.findIndex(h => h.currentHp > 0);

      if (activePIdx === -1 || activeEIdx === -1) {
        clearInterval(interval);
        const win = activePIdx !== -1;
        if (win) playSound('win');
        else playSound('lose');
        
        setUser(prev => {
          const newHP = { ...(prev.heroCurrentHP || {}) };
          pTeamStats.forEach(hero => {
            const baseStats = getHeroStats(hero);
            // Revert synergy bonus before saving to correctly reflect damage taken relative to base HP
            newHP[hero.id] = Math.min(baseStats.hp, Math.max(0, Math.floor(hero.currentHp / synergyBonus)));
          });
          
          let updatedGold = prev.gold;
          let newBadges = prev.badges;
          let newProgress = prev.challengeProgress;
          let newAttempts = { ...(prev.challengeAttempts || {}) };

          if (win && finalChallengeId) {
            const challenge = CHALLENGES.find(c => c.id === finalChallengeId)!;
            newBadges = prev.badges.includes(challenge.badge) ? prev.badges : [...prev.badges, challenge.badge];
            newProgress = { ...prev.challengeProgress, [challenge.team]: (prev.challengeProgress[challenge.team] || 0) + 1 };
            updatedGold += challenge.rewardGold;
            // Reset attempts on win
            delete newAttempts[finalChallengeId];
          } else if (win) {
            updatedGold += 500;
          }

          return {
            ...prev,
            gold: updatedGold,
            badges: newBadges,
            challengeProgress: newProgress,
            challengeAttempts: newAttempts,
            heroCurrentHP: newHP
          };
        });

        setBattleResult({ 
          win, 
          player: playerTeam[0], 
          enemy: enemyTeam[0], 
          playerHp: pTeamStats.reduce((acc, h) => acc + Math.max(0, h.currentHp), 0),
          enemyHp: eTeamStats.reduce((acc, h) => acc + Math.max(0, h.currentHp), 0),
          challengeId: finalChallengeId,
          playerTeam: pTeamStats,
          enemyTeam: eTeamStats,
          leveledUpHeroId: null,
          capturedHeroId: null
        });
        setIsBattling(false);
        setLiveBattleState(null);
        return;
      }

      // Find who attacks next
      const pReady = pTeamStats.filter((h: BattleHero) => h.currentHp > 0).sort((a: BattleHero, b: BattleHero) => b.readiness - a.readiness)[0];
      const eReady = eTeamStats.filter((h: BattleHero) => h.currentHp > 0).sort((a: BattleHero, b: BattleHero) => b.readiness - a.readiness)[0];

      if (pReady.readiness >= 100 || eReady.readiness >= 100) {
        if (pReady.readiness >= eReady.readiness) {
          // Player attacks
          const pIdx = pTeamStats.indexOf(pReady);
          const eIdx = eTeamStats.findIndex(h => h.currentHp > 0);
          const target = eTeamStats[eIdx];
          
          pReady.readiness = 0;
          let skillUsed = false;
          if (pReady.skillCharge >= 3) {
            pReady.skillCharge = 0;
            skillUsed = true;
          } else {
            pReady.skillCharge += 1;
          }

          setLiveBattleState(prev => prev ? { ...prev, activeP: pIdx, activeE: eIdx, attacker: 'player', skillEffect: skillUsed ? 'player' : null } : null);
          isAnimationPlaying = true;
          playSound(skillUsed ? 'skill' : 'attack');
          
          let dmg = 0;
          if (skillUsed) {
            // Skill Logic
            const skillType = pReady.rarity === 'Legendary' || pReady.rarity === 'Epic' ? 'AoE' : 'Single';
            if (skillType === 'AoE') {
              dmg = pReady.attack * 0.8;
              eTeamStats.forEach(h => { if (h.currentHp > 0) h.currentHp -= Math.max(5, dmg - h.defense / 2); });
              logs.push(`${t('ultimate')}: ${i18n.language === 'zh' ? pReady.name.zh : pReady.name.en} ${t('uses')} ${i18n.language === 'zh' ? pReady.ability.zh : pReady.ability.en}! ${t('deals')} ${Math.floor(dmg)} ${t('toAllEnemies')}`);
            } else {
              dmg = pReady.attack * 1.5;
              target.currentHp -= Math.max(10, dmg - target.defense / 2);
              logs.push(`${t('skill')}: ${i18n.language === 'zh' ? pReady.name.zh : pReady.name.en} ${t('uses')} ${i18n.language === 'zh' ? pReady.ability.zh : pReady.ability.en}! ${t('deals')} ${Math.floor(dmg)} ${t('to')} ${i18n.language === 'zh' ? target.name.zh : target.name.en}!`);
            }
          } else {
            dmg = Math.max(10, pReady.attack - target.defense / 2);
            target.currentHp -= dmg;
            logs.push(`${i18n.language === 'zh' ? pReady.name.zh : pReady.name.en} ${t('strikes')} ${i18n.language === 'zh' ? target.name.zh : target.name.en} ${t('for')} ${Math.floor(dmg)}!`);
          }

          setTimeout(() => {
            setLiveBattleState(prev => prev ? { ...prev, pTeam: [...pTeamStats], eTeam: [...eTeamStats], attacker: null, skillEffect: null } : null);
            isAnimationPlaying = false;
          }, 600);
        } else {
          // Enemy attacks
          const eIdx = eTeamStats.indexOf(eReady);
          const pIdx = pTeamStats.findIndex(h => h.currentHp > 0);
          const target = pTeamStats[pIdx];

          eReady.readiness = 0;
          let skillUsed = false;
          if (eReady.skillCharge >= 3) {
            eReady.skillCharge = 0;
            skillUsed = true;
          } else {
            eReady.skillCharge += 1;
          }

          let dmg;
          if (skillUsed) {
            dmg = eReady.attack * 1.3;
            target.currentHp -= Math.max(10, dmg - target.defense / 2);
            logs.push(`${t('enemySkill')}: ${i18n.language === 'zh' ? eReady.name.zh : eReady.name.en} ${t('uses')} ${i18n.language === 'zh' ? eReady.ability.zh : eReady.ability.en}! ${t('deals')} ${Math.floor(dmg)}!`);
          } else {
            dmg = Math.max(10, eReady.attack - target.defense / 2);
            target.currentHp -= dmg;
            logs.push(`${i18n.language === 'zh' ? eReady.name.zh : eReady.name.en} ${t('counters')} ${i18n.language === 'zh' ? target.name.zh : target.name.en} ${t('for')} ${Math.floor(dmg)}!`);
          }

          setLiveBattleState(prev => prev ? { ...prev, activeP: pIdx, activeE: eIdx, attacker: 'enemy', skillEffect: skillUsed ? 'enemy' : null } : null);
          isAnimationPlaying = true;
          playSound(skillUsed ? 'skill' : 'attack');

          setTimeout(() => {
            setLiveBattleState(prev => prev ? { ...prev, pTeam: [...pTeamStats], eTeam: [...eTeamStats], attacker: null, skillEffect: null } : null);
            isAnimationPlaying = false;
          }, 600);
        }
      }

      setBattleLog([...logs].slice(-8)); // Keep last 8 logs
    }, 200); // Faster tick for readiness
  };

  const claimDaily = () => {
    const now = Date.now();
    if (!user.lastDailyReward || now - user.lastDailyReward > 86400000) {
      setUser(prev => ({ ...prev, gold: prev.gold + 500, lastDailyReward: now }));
    }
  };

  const refreshShop = useCallback((force = false) => {
    if (!force && user.lastShopRefresh && now - user.lastShopRefresh < 86400000 && user.shopHeroes?.length) return;

    if (force && user.gold < 100) return;

    const shopSize = 6;
    const newShopHeroes = Array.from({ length: shopSize }).map(() => {
      const hero = HEROES[Math.floor(Math.random() * HEROES.length)];
      const priceMap: Record<string, number> = { Common: 300, Rare: 800, Epic: 2000, Legendary: 5000 };
      return {
        heroId: hero.id,
        price: priceMap[hero.rarity],
        isSold: false
      };
    });

    setUser(prev => ({
      ...prev,
      shopHeroes: newShopHeroes,
      lastShopRefresh: now,
      gold: force ? prev.gold - 100 : prev.gold
    }));
  }, [user.lastShopRefresh, user.shopHeroes, user.gold, now]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshShop();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshShop]);

  const buyHero = (shopIndex: number) => {
    const shopItem = user.shopHeroes?.[shopIndex];
    if (!shopItem || shopItem.isSold || user.gold < shopItem.price) return;

    setUser(prev => {
      const newShopHeroes = [...(prev.shopHeroes || [])];
      newShopHeroes[shopIndex] = { ...shopItem, isSold: true };
      const isNew = !prev.ownedHeroIds.includes(shopItem.heroId);
      
      return {
        ...prev,
        gold: prev.gold - shopItem.price,
        ownedHeroIds: isNew ? [...prev.ownedHeroIds, shopItem.heroId] : prev.ownedHeroIds,
        heroLevels: isNew ? { ...(prev.heroLevels || {}), [shopItem.heroId]: 1 } : prev.heroLevels,
        heroCounts: { ...(prev.heroCounts || {}), [shopItem.heroId]: (prev.heroCounts?.[shopItem.heroId] || 0) + 1 },
        shopHeroes: newShopHeroes
      };
    });
  };

  const sellHero = (heroId: string) => {
    const hero = HEROES.find(h => h.id === heroId);
    if (!hero || !user.ownedHeroIds.includes(heroId)) return;
    
    if (user.ownedHeroIds.length <= 1 && (user.heroCounts?.[heroId] || 1) <= 1) return;

    const priceMap: Record<string, number> = { Common: 150, Rare: 400, Epic: 1000, Legendary: 2500 };
    const refund = priceMap[hero.rarity];
    const currentCount = user.heroCounts?.[heroId] || 1;

    setUser(prev => {
      const newCounts = { ...(prev.heroCounts || {}) };
      let newOwnedIds = [...prev.ownedHeroIds];
      
      if (currentCount > 1) {
        newCounts[heroId] = currentCount - 1;
      } else {
        delete newCounts[heroId];
        newOwnedIds = newOwnedIds.filter(id => id !== heroId);
      }

      return {
        ...prev,
        gold: prev.gold + refund,
        ownedHeroIds: newOwnedIds,
        heroCounts: newCounts
      };
    });
    
    if (currentCount <= 1) {
      setBattleTeamIds(prev => prev.filter(id => id !== heroId));
    }
  };

  const captureHero = (hero: Hero) => {
    if (!battleResult || !battleResult.win || battleResult.capturedHeroId) return;

    setUser(prev => {
      const isNew = !prev.ownedHeroIds.includes(hero.id);
      return {
        ...prev,
        ownedHeroIds: isNew ? [...prev.ownedHeroIds, hero.id] : prev.ownedHeroIds,
        heroLevels: isNew ? { ...(prev.heroLevels || {}), [hero.id]: 1 } : prev.heroLevels,
        heroCounts: { ...(prev.heroCounts || {}), [hero.id]: (prev.heroCounts?.[hero.id] || 0) + 1 }
      };
    });

    setBattleResult(prev => prev ? { ...prev, capturedHeroId: hero.id } : null);
    playSound('win');
  };

  const levelUpHeroInBattle = (heroId: string) => {
    if (!battleResult || !battleResult.win || battleResult.leveledUpHeroId) return;

    const hero = HEROES.find(h => h.id === heroId);
    if (!hero) return;

    setUser(prev => {
      const newLevels = { ...(prev.heroLevels || {}) };
      const increment = battleResult.challengeId ? 3 : 1;
      const newLevel = (newLevels[heroId] || 1) + increment;
      newLevels[heroId] = newLevel;

      // Refill HP to max after level up
      const newHP = { ...(prev.heroCurrentHP || {}) };
      const stats = getHeroStats(hero, newLevel);
      newHP[heroId] = stats.hp;

      return { ...prev, heroLevels: newLevels, heroCurrentHP: newHP };
    });

    setBattleResult(prev => prev ? { ...prev, leveledUpHeroId: heroId } : null);
    playSound('win');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-600 selection:text-white font-sans">
      {/* Navigation Rail */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border-2 border-zinc-800 p-2 flex gap-2 z-50 rounded-2xl shadow-2xl">
        {[
          { id: 'registry', icon: LayoutGrid, label: t('registry') },
          { id: 'gacha', icon: Sparkles, label: t('gacha') },
          { id: 'collection', icon: User, label: t('collection') },
          { id: 'battle', icon: BattleIcon, label: t('battle') },
          { id: 'challenges', icon: Trophy, label: t('challenges') },
          { id: 'shop', icon: ShoppingBag, label: t('shop') },
          { id: 'instructions', icon: HelpCircle, label: t('gameInstructions') },
        ].map((item) => {
          if (item.id === 'instructions') {
            return (
              <button
                key={item.id}
                onClick={() => setShowInstructions(true)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all text-zinc-500 hover:text-white hover:bg-zinc-900"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          }
          const isChallengeActive = (pendingChallengeId || (isBattling && liveBattleState?.challengeId) || (battleResult?.challengeId));
          const isActive = (item.id === 'challenges' && isChallengeActive && currentView === 'battle') || 
                          (currentView === item.id && !(item.id === 'battle' && isChallengeActive));
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== 'battle') setPendingChallengeId(undefined);
                setCurrentView(item.id as View);
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="p-6 md:p-12 max-w-[1600px] mx-auto pb-32">
        <header className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="inline-block bg-white text-black px-3 py-1 text-sm font-black uppercase skew-x-[-12deg]"
                >
                  S.H.I.E.L.D. DATABASE v4.0
                </motion.div>
                <div className="flex items-center gap-2 bg-zinc-900 border-2 border-zinc-800 px-4 py-1 rounded-none">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="font-mono font-bold text-amber-500">{user.gold}</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 bg-zinc-900 border-2 border-zinc-800 px-4 py-1 rounded-none">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter leading-none mb-1">{t('archivesUnlocked')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 transition-all duration-1000" 
                          style={{ width: `${(user.ownedHeroIds.length / HEROES.length) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[10px] text-white">
                        {user.ownedHeroIds.length}/{HEROES.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] uppercase"
              >
                {pendingChallengeId && currentView === 'battle' ? t('challengePrep') : t(currentView)}
              </motion.h1>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-4">
                {currentView === 'registry' && (
                  <div className="relative flex-1 lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder={t('search')}
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-none py-4 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-all text-lg font-bold placeholder:text-zinc-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <button 
                  onClick={toggleLanguage}
                  className="h-[60px] px-6 bg-zinc-900 border-2 border-zinc-800 hover:bg-white hover:text-black transition-all font-black flex items-center gap-2"
                >
                  <Languages className="w-5 h-5" />
                  {i18n.language === 'en' ? 'ZH' : 'EN'}
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-[60px] px-6 bg-zinc-900 border-2 border-zinc-800 hover:bg-white hover:text-black transition-all font-black flex items-center gap-2"
                  title={isMuted ? t('unmute') : t('mute')}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsCompactView(!isCompactView)}
                  className={`h-[60px] px-6 border-2 transition-all font-black flex items-center gap-2 ${isCompactView ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-white hover:text-black'}`}
                  title={t('compactView')}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>

              {currentView === 'registry' && (
                <div className="flex flex-wrap gap-2">
                  {teams.map(team => (
                    <button
                      key={team}
                      onClick={() => setSelectedTeam(team)}
                      className={`px-4 py-1 text-xs font-black uppercase tracking-widest transition-all border-2 ${
                        selectedTeam === team 
                          ? 'bg-red-600 border-red-600 text-white' 
                          : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {team === 'All' ? t('all') : t(`team${team.replace(/[\s-]+/g, '')}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Content */}
        <AnimatePresence mode="wait">
          {currentView === 'registry' ? (
            <motion.div 
              key="registry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-8 ${isCompactView ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}
            >
              {filteredHeroes.map((hero) => (
                <HeroCard 
                  key={hero.id} 
                  hero={hero} 
                  isOwned={user.ownedHeroIds.includes(hero.id)}
                  showColor={true}
                  getRarityStyles={getRarityStyles}
                  t={t}
                  lang={i18n.language}
                  stats={getHeroStats(hero)}
                  onLevelUp={() => levelUp(hero.id)}
                  gold={user.gold}
                  onSelect={() => setSelectedHero(hero)}
                  count={user.heroCounts?.[hero.id]}
                  currentHp={user.heroCurrentHP?.[hero.id]}
                  isCompact={isCompactView}
                />
              ))}
            </motion.div>
          ) : currentView === 'collection' ? (
            <motion.div 
              key="collection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Collection Sorting and Filtering */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 border-2 border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500 mr-2">{t('sortLabel')}:</span>
                  {[
                    { id: 'level', label: t('level'), icon: <Zap className="w-3 h-3" /> },
                    { id: 'hp', label: t('hp'), icon: <Heart className="w-3 h-3" /> },
                    { id: 'attack', label: t('atk'), icon: <Swords className="w-3 h-3" /> },
                    { id: 'defense', label: t('def'), icon: <Shield className="w-3 h-3" /> },
                    { id: 'speed', label: t('spd'), icon: <Zap className="w-3 h-3" /> },
                    { id: 'price', label: t('price'), icon: <DollarSign className="w-3 h-3" /> }
                  ].map((sort) => (
                    <button
                      key={sort.id}
                      onClick={() => {
                        if (collectionSortBy === sort.id) {
                          setCollectionSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setCollectionSortBy(sort.id as keyof HeroStats | 'price');
                          setCollectionSortOrder('desc');
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase transition-all border-2 ${
                        collectionSortBy === sort.id 
                          ? 'bg-red-600 border-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                          : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {sort.icon}
                      {sort.label}
                      {collectionSortBy === sort.id && (
                        <span className="ml-1 opacity-60">
                          {collectionSortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500">{t('teamLabel')}:</span>
                  <select 
                    value={collectionFilterTeam}
                    onChange={(e) => setCollectionFilterTeam(e.target.value)}
                    className="bg-black border-2 border-zinc-800 px-3 py-1.5 text-[10px] font-black uppercase focus:border-red-600 outline-none transition-colors"
                  >
                    {teams.map(team => (
                      <option key={team} value={team}>
                        {team === 'All' ? t('all') : t(`team${team.replace(/[\s-]+/g, '')}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badges Display */}
              {user.badges && user.badges.length > 0 && (
                <div className="p-6 bg-zinc-900/50 border-2 border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{t('teamBadges')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {user.badges.map((badge, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black border-2 border-amber-500/30 px-4 py-2 rounded-none flex items-center gap-2 text-xs font-black italic text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      >
                        <Sparkles className="w-3 h-3" />
                        {badge}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`grid gap-8 ${isCompactView ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
                {HEROES
                  .filter(h => user.ownedHeroIds.includes(h.id))
                  .filter(h => collectionFilterTeam === 'All' || h.team === collectionFilterTeam)
                  .sort((a: Hero, b: Hero) => {
                    const sA = getHeroStats(a);
                    const sB = getHeroStats(b);

                    if (collectionSortBy === 'hp') {
                      const hpA = user.heroCurrentHP?.[a.id] ?? sA.hp;
                      const hpB = user.heroCurrentHP?.[b.id] ?? sB.hp;
                      return collectionSortOrder === 'desc' ? hpB - hpA : hpA - hpB;
                    }

                    if (collectionSortBy === 'price') {
                      const getPrice = (h: Hero) => h.rarity === 'Common' ? 150 : h.rarity === 'Rare' ? 400 : h.rarity === 'Epic' ? 1000 : 2500;
                      return collectionSortOrder === 'desc' ? getPrice(b) - getPrice(a) : getPrice(a) - getPrice(b);
                    }

                    const valA = collectionSortBy === 'level' ? sA.level : sA[collectionSortBy as keyof HeroStats];
                    const valB = collectionSortBy === 'level' ? sB.level : sB[collectionSortBy as keyof HeroStats];
                    return collectionSortOrder === 'desc' ? valB - valA : valA - valB;
                  })
                  .map((hero) => (
                    <div key={hero.id} className="space-y-2">
                      <HeroCard 
                        hero={hero} 
                        isOwned={true} 
                        getRarityStyles={getRarityStyles} 
                        t={t} 
                        lang={i18n.language} 
                        stats={getHeroStats(hero)} 
                        onLevelUp={() => levelUp(hero.id)}
                        gold={user.gold}
                        onSelect={() => setSelectedHero(hero)}
                        count={user.heroCounts?.[hero.id]}
                        currentHp={user.heroCurrentHP?.[hero.id]}
                        isCompact={isCompactView}
                      />
                    </div>
                  ))}
              </div>
            </motion.div>
          ) : currentView === 'challenges' ? (
            <motion.div 
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CHALLENGES.map((challenge) => {
                  const isCompleted = user.badges.includes(challenge.badge);
                  return (
                    <div 
                      key={challenge.id} 
                      className={`relative group overflow-hidden border-4 ${isCompleted ? 'border-amber-500' : 'border-zinc-800'} bg-zinc-900 transition-all hover:border-red-600`}
                    >
                      <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
                        <img src={challenge.bg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="relative p-8 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase italic">{t('difficulty')} {challenge.difficulty}</span>
                            <div className="text-white/50">
                              {challenge.team === 'Avengers' && <Shield className="w-4 h-4" />}
                              {challenge.team === 'X-Men' && <Zap className="w-4 h-4" />}
                              {challenge.team === 'Guardians' && <Rocket className="w-4 h-4" />}
                              {challenge.team === 'Villains' && <Skull className="w-4 h-4" />}
                              {challenge.team === 'Cosmic' && <Sparkles className="w-4 h-4" />}
                              {challenge.team === 'Spider-Verse' && <Swords className="w-4 h-4" />}
                              {challenge.team === 'Justice League' && <Scale className="w-4 h-4" />}
                              {challenge.team === 'Suicide Squad' && <Target className="w-4 h-4" />}
                            </div>
                          </div>
                          {isCompleted && <Trophy className="w-8 h-8 text-amber-500" />}
                        </div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                          {i18n.language === 'en' ? challenge.name.en : challenge.name.zh}
                        </h3>
                        <p className="text-zinc-400 font-bold text-sm">
                          {i18n.language === 'en' ? challenge.description.en : challenge.description.zh}
                        </p>
                        <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                          <div className="flex items-center gap-2 text-amber-500 font-black">
                            <Coins className="w-5 h-5" />
                            {challenge.rewardGold}
                          </div>
                          <button
                            onClick={() => {
                              setPendingChallengeId(challenge.id);
                              setCurrentView('battle');
                            }}
                            className="px-6 py-2 font-black uppercase italic tracking-tighter transition-all bg-white text-black hover:bg-red-600 hover:text-white"
                          >
                            {isCompleted ? t('reChallenge') : t('challenge')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : currentView === 'gacha' ? (
            <motion.div 
              key="gacha"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-full max-w-4xl min-h-[400px] bg-zinc-900 border-4 border-zinc-800 flex flex-wrap items-center justify-center gap-4 p-8 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent animate-pulse" />
                
                {isDrawing ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-8 border-red-600 border-t-transparent rounded-full"
                  />
                ) : drawnHeroes.length > 0 ? (
                  <div className={`grid gap-4 w-full ${isCompactView ? 'grid-cols-4 md:grid-cols-8 lg:grid-cols-10' : 'grid-cols-2 md:grid-cols-5'}`}>
                    {drawnHeroes.map((drawn, idx) => (
                      <motion.div 
                        key={`${drawn.id}-${idx}`}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative z-10"
                      >
                        <HeroCard 
                          hero={drawn} 
                          isOwned={true} 
                          getRarityStyles={getRarityStyles} 
                          t={t} 
                          lang={i18n.language}
                          stats={getHeroStats(drawn)}
                          onLevelUp={() => levelUp(drawn.id)}
                          gold={user.gold}
                          count={user.heroCounts?.[drawn.id]}
                          currentHp={user.heroCurrentHP?.[drawn.id]}
                          isCompact={isCompactView}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Sparkles className="w-16 h-16 text-red-600 mx-auto" />
                    <p className="text-2xl font-black uppercase italic tracking-tighter">{t('draw')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  disabled={isDrawing || user.gold < 100}
                  onClick={() => drawHero(1)}
                  className="px-8 py-4 bg-red-600 text-white font-black text-xl uppercase italic tracking-tighter hover:bg-white hover:text-black transition-all disabled:opacity-50 border-4 border-black"
                >
                  1x {t('draw')} (100 <Coins className="inline w-4 h-4" />)
                </button>
                <button
                  disabled={isDrawing || user.gold < 1000}
                  onClick={() => drawHero(10)}
                  className="px-8 py-4 bg-white text-black font-black text-xl uppercase italic tracking-tighter hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 border-4 border-black"
                >
                  10x {t('draw')} (1000 <Coins className="inline w-4 h-4" />)
                </button>
              </div>
            </motion.div>
          ) : currentView === 'shop' ? (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Shop Tabs */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShopTab('buy')}
                  className={`px-12 py-4 font-black text-2xl uppercase italic tracking-tighter transition-all border-4 ${
                    shopTab === 'buy' 
                      ? 'bg-red-600 border-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  {t('buy')}
                </button>
                <button
                  onClick={() => setShopTab('sell')}
                  className={`px-12 py-4 font-black text-2xl uppercase italic tracking-tighter transition-all border-4 ${
                    shopTab === 'sell' 
                      ? 'bg-red-600 border-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  {t('sell')}
                </button>
              </div>

              {shopTab === 'buy' ? (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <Coins className="w-12 h-12 text-amber-500" />
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t('dailyReward')}</h3>
                      </div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest">{t('dailyRewardDesc')}</p>
                      <button
                        onClick={claimDaily}
                        disabled={!isDailyClaimable}
                        className="w-full py-4 bg-amber-500 text-black font-black text-xl uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                      >
                        {t('claim')}
                      </button>
                    </div>

                    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <RefreshCw className="w-12 h-12 text-blue-500" />
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t('refreshShop')}</h3>
                      </div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest">{t('refreshShopDesc')}</p>
                      <button
                        onClick={() => refreshShop(true)}
                        disabled={user.gold < 100}
                        className="w-full py-4 bg-blue-600 text-white font-black text-xl uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                      >
                        {t('refresh')} (100 <Coins className="inline w-4 h-4" />)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-5xl font-black uppercase italic tracking-tighter text-center">{t('heroMarket')}</h3>
                    <div className={`grid gap-8 ${isCompactView ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                      {user.shopHeroes?.map((item, idx) => {
                        const hero = HEROES.find(h => h.id === item.heroId);
                        if (!hero) return null;
                        const isOwned = user.ownedHeroIds.includes(hero.id);
                        return (
                          <div key={`${item.heroId}-${idx}`} className={`bg-zinc-900 border-4 border-zinc-800 p-4 space-y-4 relative ${isCompactView ? 'p-2' : 'p-4'}`}>
                            <HeroCard 
                              hero={hero} 
                              isOwned={isOwned} 
                              getRarityStyles={getRarityStyles} 
                              t={t} 
                              lang={i18n.language}
                              stats={getHeroStats(hero)}
                              showColor={true}
                              onSelect={() => setSelectedHero(hero)}
                              onLevelUp={isOwned ? () => levelUp(hero.id) : undefined}
                              gold={user.gold}
                              count={user.heroCounts?.[hero.id]}
                              currentHp={user.heroCurrentHP?.[hero.id]}
                              isCompact={isCompactView}
                            />
                            {!isCompactView && (
                              <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-zinc-800">
                                <div className="flex items-center gap-2 text-amber-500 font-black text-2xl italic">
                                  <Coins className="w-6 h-6" />
                                  <span>{item.price}</span>
                                </div>
                                <button
                                  disabled={item.isSold || user.gold < item.price}
                                  onClick={() => buyHero(idx)}
                                  className={`px-8 py-3 font-black uppercase tracking-widest transition-all border-2 ${
                                    item.isSold 
                                      ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed' 
                                      : 'bg-white text-black border-black hover:bg-red-600 hover:text-white'
                                  }`}
                                >
                                  {item.isSold ? t('soldOut') : t('buyCard')}
                                </button>
                              </div>
                            )}
                            {isCompactView && !item.isSold && (
                              <button
                                disabled={user.gold < item.price}
                                onClick={() => buyHero(idx)}
                                className="w-full py-1 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                              >
                                {item.price} <Coins className="inline w-3 h-3" />
                              </button>
                            )}
                            {item.isSold && (
                              <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center pointer-events-none">
                                <span className={`${isCompactView ? 'text-2xl' : 'text-6xl'} font-black uppercase italic tracking-tighter text-red-600 -rotate-12 border-4 border-red-600 px-4 py-1`}>{t('sold')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-zinc-900 border-4 border-zinc-800 p-8">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">{t('sellCollection')}</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">{t('sellCollectionDesc')}</p>
                  </div>

                  {/* Sell Sorting and Filtering */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 border-2 border-zinc-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-zinc-500 mr-2">{t('sort')}:</span>
                      {[
                        { id: 'level', label: t('level'), icon: <Zap className="w-3 h-3" /> },
                        { id: 'hp', label: t('hp'), icon: <Heart className="w-3 h-3" /> },
                        { id: 'attack', label: t('atk'), icon: <Swords className="w-3 h-3" /> },
                        { id: 'defense', label: t('def'), icon: <Shield className="w-3 h-3" /> },
                        { id: 'speed', label: t('spd'), icon: <Zap className="w-3 h-3" /> },
                        { id: 'price', label: t('price'), icon: <DollarSign className="w-3 h-3" /> }
                      ].map((sort) => (
                        <button
                          key={sort.id}
                          onClick={() => {
                            if (collectionSortBy === sort.id) {
                              setCollectionSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            } else {
                              setCollectionSortBy(sort.id as keyof HeroStats | 'price');
                              setCollectionSortOrder('desc');
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase transition-all border-2 ${
                            collectionSortBy === sort.id 
                              ? 'bg-red-600 border-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                              : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                          }`}
                        >
                          {sort.icon}
                          {sort.label}
                          {collectionSortBy === sort.id && (
                            <span className="ml-1 opacity-60">
                              {collectionSortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-zinc-500">{t('teamLabel')}:</span>
                      <select 
                        value={collectionFilterTeam}
                        onChange={(e) => setCollectionFilterTeam(e.target.value)}
                        className="bg-black border-2 border-zinc-800 px-3 py-1.5 text-[10px] font-black uppercase focus:border-red-600 outline-none transition-colors"
                      >
                        {teams.map(tName => (
                          <option key={tName} value={tName}>
                            {tName === 'All' ? t('all') : t(`team${tName.replace(/[\s-]+/g, '')}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={`grid gap-8 ${isCompactView ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
                    {HEROES
                      .filter(h => user.ownedHeroIds.includes(h.id))
                      .filter(h => collectionFilterTeam === 'All' || h.team === collectionFilterTeam)
                      .filter(h => 
                        h.name.en.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        h.name.zh.includes(searchTerm)
                      )
                      .sort((a: Hero, b: Hero) => {
                        const sA = getHeroStats(a);
                        const sB = getHeroStats(b);
                        
                        if (collectionSortBy === 'hp') {
                          const hpA = user.heroCurrentHP?.[a.id] ?? sA.hp;
                          const hpB = user.heroCurrentHP?.[b.id] ?? sB.hp;
                          return collectionSortOrder === 'desc' ? hpB - hpA : hpA - hpB;
                        }

                        if (collectionSortBy === 'price') {
                          const getPrice = (h: Hero) => h.rarity === 'Common' ? 150 : h.rarity === 'Rare' ? 400 : h.rarity === 'Epic' ? 1000 : 2500;
                          return collectionSortOrder === 'desc' ? getPrice(b) - getPrice(a) : getPrice(a) - getPrice(b);
                        }

                        const valA = collectionSortBy === 'level' ? sA.level : sA[collectionSortBy as keyof HeroStats];
                        const valB = collectionSortBy === 'level' ? sB.level : sB[collectionSortBy as keyof HeroStats];
                        return collectionSortOrder === 'desc' ? valB - valA : valA - valB;
                      })
                      .map((hero) => (
                        <div key={hero.id} className={`bg-zinc-900 border-4 border-zinc-800 p-4 space-y-4 ${isCompactView ? 'p-2' : 'p-4'}`}>
                          <HeroCard 
                            hero={hero} 
                            isOwned={true} 
                            getRarityStyles={getRarityStyles} 
                            t={t} 
                            lang={i18n.language} 
                            stats={getHeroStats(hero)} 
                            onLevelUp={() => levelUp(hero.id)}
                            gold={user.gold}
                            onSelect={() => setSelectedHero(hero)}
                            count={user.heroCounts?.[hero.id]}
                            currentHp={user.heroCurrentHP?.[hero.id]}
                            isCompact={isCompactView}
                          />
                          {!isCompactView && (
                            <button
                              onClick={() => sellHero(hero.id)}
                              disabled={user.ownedHeroIds.length <= 1}
                              className="w-full py-3 bg-white text-black border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              {t('sell')} (+{
                                hero.rarity === 'Common' ? 150 : 
                                hero.rarity === 'Rare' ? 400 : 
                                hero.rarity === 'Epic' ? 1000 : 2500
                              } <Coins className="w-4 h-4" />)
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : currentView === 'battle' ? (
            <motion.div 
              key="battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-12"
            >
              {!battleResult && !isBattling ? (
                <div className="space-y-12">
                  {/* Team Selection Header */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-900 p-8 border-4 border-zinc-800">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">
                        {pendingChallengeId ? (
                          <>{t('challengeMode')}: <span className="text-red-600">{i18n.language === 'en' ? CHALLENGES.find(c => c.id === pendingChallengeId)?.name.en : CHALLENGES.find(c => c.id === pendingChallengeId)?.name.zh}</span></>
                        ) : t('assembleTeam')}
                      </h3>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest">{t('selectHeroesDesc')} ({battleTeamIds.length}/3)</p>
                    </div>
                    <div className="flex gap-4">
                      {pendingChallengeId && (
                        <button
                          onClick={() => setPendingChallengeId(undefined)}
                          className="px-8 py-4 bg-zinc-800 text-white font-black text-xl uppercase italic tracking-tighter hover:bg-white hover:text-black transition-all border-4 border-black"
                        >
                          {t('cancelChallenge')}
                        </button>
                      )}
                      <button
                        disabled={battleTeamIds.length < 3 || battleTeamIds.some(id => {
                          const h = HEROES.find(hero => hero.id === id);
                          if (!h) return false;
                          const stats = getHeroStats(h);
                          const currentHp = user.heroCurrentHP?.[h.id] ?? stats.hp;
                          return currentHp < stats.hp * 0.1;
                        })}
                        onClick={() => startBattle()}
                        className="px-12 py-6 bg-red-600 text-white font-black text-3xl uppercase italic tracking-tighter hover:bg-white hover:text-black transition-all disabled:opacity-50 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
                      >
                        {battleTeamIds.some(id => {
                          const h = HEROES.find(hero => hero.id === id);
                          if (!h) return false;
                          const stats = getHeroStats(h);
                          const currentHp = user.heroCurrentHP?.[h.id] ?? stats.hp;
                          return currentHp < stats.hp * 0.1;
                        }) ? t('lowHPWarning') : t('fight')}
                      </button>
                    </div>
                  </div>

                  {/* Selection Controls */}
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-zinc-900/50 p-6 border-2 border-zinc-800">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-zinc-500 mr-2">{t('sortBy')}:</span>
                      {[
                        { id: 'level', label: t('level'), icon: <Zap className="w-3 h-3" /> },
                        { id: 'hp', label: 'HP', icon: <Heart className="w-3 h-3" /> },
                        { id: 'attack', label: 'ATK', icon: <Swords className="w-3 h-3" /> },
                        { id: 'defense', label: 'DEF', icon: <Shield className="w-3 h-3" /> },
                        { id: 'speed', label: 'SPD', icon: <Zap className="w-3 h-3" /> }
                      ].map((sort) => (
                        <button
                          key={sort.id}
                          onClick={() => {
                            if (battleSortBy === sort.id) {
                              setBattleSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            } else {
                              setBattleSortBy(sort.id as keyof HeroStats);
                              setBattleSortOrder('desc');
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase transition-all border-2 ${
                            battleSortBy === sort.id 
                              ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                              : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                          }`}
                        >
                          {sort.icon}
                          {sort.label}
                          {battleSortBy === sort.id && (
                            <span className="ml-1 opacity-60">
                              {battleSortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-zinc-500">{t('teamLabel')}:</span>
                            <select 
                              value={battleFilterTeam}
                              onChange={(e) => setBattleFilterTeam(e.target.value)}
                              className="bg-black border-2 border-zinc-800 px-4 py-2 text-[10px] font-black uppercase focus:border-red-600 outline-none transition-colors"
                            >
                              {teams.map(team => (
                                <option key={team} value={team}>
                                  {team === 'All' ? t('all') : t(`team${team.replace(/[\s-]+/g, '')}`)}
                                </option>
                              ))}
                            </select>
                          </div>
                      <button 
                        onClick={() => setBattleTeamIds([])}
                        className="ml-auto px-6 py-2 bg-zinc-800 text-[10px] font-black uppercase hover:bg-red-600 transition-colors border-2 border-transparent"
                      >
                        {t('clearTeam')}
                      </button>
                    </div>
                  </div>

                  {/* Hero Selection Grid */}
                  <div className={`grid gap-6 ${isCompactView ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5'}`}>
                    {HEROES
                      .filter(h => user.ownedHeroIds.includes(h.id))
                      .filter(h => battleFilterTeam === 'All' || h.team === battleFilterTeam)
                      .sort((a, b) => {
                        const sA = getHeroStats(a);
                        const sB = getHeroStats(b);
                        
                        if (battleSortBy === 'hp') {
                          const hpA = user.heroCurrentHP?.[a.id] ?? sA.hp;
                          const hpB = user.heroCurrentHP?.[b.id] ?? sB.hp;
                          return battleSortOrder === 'desc' ? hpB - hpA : hpA - hpB;
                        }

                        const valA = battleSortBy === 'level' ? sA.level : sA[battleSortBy as keyof HeroStats];
                        const valB = battleSortBy === 'level' ? sB.level : sB[battleSortBy as keyof HeroStats];
                        return battleSortOrder === 'desc' ? valB - valA : valA - valB;
                      })
                      .map((hero) => {
                        const isSelected = battleTeamIds.includes(hero.id);
                        const maxHp = getHeroStats(hero).hp;
                        const currentHp = Math.min(maxHp, user.heroCurrentHP?.[hero.id] ?? maxHp);
                        const isLowHP = currentHp < maxHp * 0.1;

                        return (
                          <div 
                            key={hero.id}
                            onClick={() => {
                              if (isSelected) {
                                setBattleTeamIds(prev => prev.filter(id => id !== hero.id));
                              } else if (isLowHP) {
                                // Prevent selection if HP is too low
                                return;
                              } else if (battleTeamIds.length < 3) {
                                setBattleTeamIds(prev => [...prev, hero.id]);
                              }
                            }}
                            className={`relative cursor-pointer transition-all ${isSelected ? 'scale-95 ring-4 ring-red-600' : isLowHP ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105'}`}
                          >
                            <HeroCard 
                              hero={hero} 
                              isOwned={true} 
                              getRarityStyles={getRarityStyles} 
                              t={t} 
                              lang={i18n.language} 
                              stats={getHeroStats(hero)} 
                              onLevelUp={() => levelUp(hero.id)}
                              gold={user.gold}
                              count={user.heroCounts?.[hero.id]}
                              currentHp={currentHp}
                              isCompact={isCompactView}
                            />
                            {isLowHP && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 p-2 text-center">
                                <span className="text-white font-black text-[10px] uppercase tracking-tighter leading-none">
                                  {t('lowHPWarning')}
                                </span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-black z-40">
                                {battleTeamIds.indexOf(hero.id) + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : isBattling ? (
                <div className="w-full max-w-6xl space-y-12">
                  {/* Battle Arena */}
                  <div className="relative h-[500px] bg-zinc-950 border-8 border-zinc-900 overflow-hidden flex items-center justify-between px-12">
                    {/* Background Effects */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      {liveBattleState?.bg ? (
                        <div className="absolute inset-0">
                          <img src={liveBattleState.bg} className="w-full h-full object-cover opacity-30 blur-sm" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/50 via-transparent to-transparent" />
                          <div className="absolute inset-0 grid grid-cols-12 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="h-full border-r border-zinc-800/20" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {liveBattleState && (
                      <>
                        {/* Team Attack Overlay */}
                        <AnimatePresence>
                          {liveBattleState.teamAttackEffect && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-[60] pointer-events-none flex flex-col items-center justify-center bg-red-600/40 backdrop-blur-sm"
                            >
                              <div className="flex gap-4 mb-8">
                                {liveBattleState.pTeam.map((hero, i) => (
                                  <motion.div
                                    key={hero.id}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1, type: 'spring' }}
                                    className="w-32 h-40 border-4 border-white shadow-2xl overflow-hidden relative"
                                  >
                                    <img src={hero.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                  </motion.div>
                                ))}
                              </div>
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.5, 1] }}
                                className="text-8xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] uppercase text-center"
                              >
                                {t(`team${Array.from(new Set(liveBattleState.pTeam.map(h => h.team)))[0]?.replace(/[\s-]+/g, '')}`)}<br/>
                                <span className="text-amber-400">{t('assemble')}</span>
                              </motion.div>
                              
                              <div className="absolute inset-0 overflow-hidden">
                                {teamAttackParticles.map((p) => (
                                  <motion.div
                                    key={p.id}
                                    initial={{ x: '-100%', y: p.y }}
                                    animate={{ x: '200%' }}
                                    transition={{ duration: 0.4, delay: p.id * 0.02, repeat: 2 }}
                                    className="absolute h-2 w-64 bg-white/30 blur-md"
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Skill Effect Overlay */}
                        <AnimatePresence>
                          {liveBattleState.skillEffect && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={`absolute inset-0 z-50 pointer-events-none flex items-center justify-center ${liveBattleState.skillEffect === 'player' ? 'bg-amber-500/20' : 'bg-red-500/20'}`}
                            >
                              <motion.div 
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: [0, 1.5, 1], rotate: 0 }}
                                className="text-6xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] uppercase text-center"
                              >
                                {liveBattleState.skillEffect === 'player' ? t('ultimateSkill') : t('enemySkillLabel')}
                              </motion.div>
                              
                              {/* Particles/Lines */}
                              <div className="absolute inset-0 overflow-hidden">
                                {skillEffectParticles.map((p) => (
                                  <motion.div
                                    key={p.id}
                                    initial={{ x: '-100%', y: p.y }}
                                    animate={{ x: '200%' }}
                                    transition={{ duration: 0.5, delay: p.id * 0.05, repeat: 1 }}
                                    className={`absolute h-1 w-32 ${liveBattleState.skillEffect === 'player' ? 'bg-amber-400' : 'bg-red-400'} blur-sm`}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {/* Team Synergy Badge */}
                        {liveBattleState.pTeam[0].hp > getHeroStats(HEROES.find(h => h.id === liveBattleState.pTeam[0].id)!).hp && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-black px-4 py-1 font-black uppercase italic border-2 border-black animate-bounce">
                            {t('teamSynergyActive')}
                          </div>
                        )}

                        {/* Player Side */}
                        <div className="relative flex items-center gap-8">
                          {/* Waiting Player Heroes */}
                          <div className="flex flex-col gap-4 opacity-40 scale-75">
                            {liveBattleState.pTeam.map((hero, i) => (
                              i !== liveBattleState.activeP && (
                                <div key={hero.id} className="w-24 h-32 border-2 border-zinc-800 overflow-hidden relative">
                                  <img src={hero.image} className={`w-full h-full object-cover ${hero.currentHp <= 0 ? 'grayscale' : ''}`} referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                                    <div className="h-full bg-green-500" style={{ width: `${Math.max(0, (hero.currentHp / hero.hp) * 100)}%` }} />
                                  </div>
                                </div>
                              )
                            ))}
                          </div>

                          {/* Active Player Hero */}
                          <motion.div
                            animate={{ 
                              x: liveBattleState.attacker === 'player' ? 100 : (liveBattleState.attacker === 'enemy' ? [0, -10, 10, -10, 10, 0] : 0),
                              scale: liveBattleState.attacker === 'player' ? 1.1 : 1,
                              rotate: liveBattleState.attacker === 'player' ? 5 : 0
                            }}
                            transition={{
                              x: { duration: liveBattleState.attacker === 'enemy' ? 0.3 : 0.2 }
                            }}
                            className="relative z-10"
                          >
                            <div className="w-48 h-64 border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden relative bg-zinc-900">
                              <img src={liveBattleState.pTeam[liveBattleState.activeP].image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-black text-white border border-white/20">
                                {i18n.language === 'zh' ? liveBattleState.pTeam[liveBattleState.activeP].name.zh : liveBattleState.pTeam[liveBattleState.activeP].name.en}
                              </div>
                              
                              {/* Skill Charge Indicators */}
                              <div className="absolute bottom-2 left-2 flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <div 
                                    key={i} 
                                    className={`w-2 h-2 rounded-full border border-white/50 ${i < liveBattleState.pTeam[liveBattleState.activeP].skillCharge ? 'bg-amber-500' : 'bg-black/50'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Health Bar */}
                            <div className="mt-4 w-full h-6 bg-zinc-900 border-2 border-black overflow-hidden relative flex items-center">
                              <motion.div 
                                initial={false}
                                animate={{ width: `${Math.max(0, (liveBattleState.pTeam[liveBattleState.activeP].currentHp / liveBattleState.pTeam[liveBattleState.activeP].hp) * 100)}%` }}
                                className="absolute inset-0 h-full bg-green-500"
                              />
                              <div className="relative z-10 w-full text-center text-[10px] font-black text-white drop-shadow-md">
                                {Math.max(0, Math.floor(liveBattleState.pTeam[liveBattleState.activeP].currentHp))} / {liveBattleState.pTeam[liveBattleState.activeP].hp}
                              </div>
                            </div>

                            {/* Readiness Bar */}
                            <div className="mt-1 w-full h-1 bg-zinc-900 border border-black overflow-hidden">
                              <motion.div 
                                initial={false}
                                animate={{ width: `${Math.min(100, liveBattleState.pTeam[liveBattleState.activeP].readiness)}%` }}
                                className="h-full bg-blue-500"
                              />
                            </div>
                          </motion.div>
                        </div>

                        {/* VS Indicator */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-9xl font-black italic text-zinc-800 select-none"
                          >
                            VS
                          </motion.div>
                        </div>

                        {/* Enemy Side */}
                        <div className="relative flex items-center gap-8 flex-row-reverse">
                          {/* Waiting Enemy Heroes */}
                          <div className="flex flex-col gap-4 opacity-40 scale-75">
                            {liveBattleState.eTeam.map((hero, i) => (
                              i !== liveBattleState.activeE && (
                                <div key={i} className="w-24 h-32 border-2 border-zinc-800 overflow-hidden relative">
                                  <img src={hero.image} className={`w-full h-full object-cover ${hero.currentHp <= 0 ? 'grayscale' : ''}`} referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                                    <div className="h-full bg-red-500" style={{ width: `${Math.max(0, (hero.currentHp / hero.hp) * 100)}%` }} />
                                  </div>
                                </div>
                              )
                            ))}
                          </div>

                          {/* Active Enemy Hero */}
                          <motion.div
                            animate={{ 
                              x: liveBattleState.attacker === 'enemy' ? -100 : (liveBattleState.attacker === 'player' ? [0, 10, -10, 10, -10, 0] : 0),
                              scale: liveBattleState.attacker === 'enemy' ? 1.1 : 1,
                              rotate: liveBattleState.attacker === 'enemy' ? -5 : 0
                            }}
                            transition={{
                              x: { duration: liveBattleState.attacker === 'player' ? 0.3 : 0.2 }
                            }}
                            className="relative z-10"
                          >
                            <div className="w-48 h-64 border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.2)] overflow-hidden relative bg-zinc-900">
                               <img src={liveBattleState.eTeam[liveBattleState.activeE].image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] font-black text-white border border-red-600/20">
                                 {i18n.language === 'zh' ? liveBattleState.eTeam[liveBattleState.activeE].name.zh : liveBattleState.eTeam[liveBattleState.activeE].name.en}
                               </div>

                              {/* Skill Charge Indicators */}
                              <div className="absolute bottom-2 right-2 flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <div 
                                    key={i} 
                                    className={`w-2 h-2 rounded-full border border-white/50 ${i < liveBattleState.eTeam[liveBattleState.activeE].skillCharge ? 'bg-red-500' : 'bg-black/50'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Health Bar */}
                            <div className="mt-4 w-full h-6 bg-zinc-900 border-2 border-black overflow-hidden relative flex items-center">
                              <motion.div 
                                initial={false}
                                animate={{ width: `${Math.max(0, (liveBattleState.eTeam[liveBattleState.activeE].currentHp / liveBattleState.eTeam[liveBattleState.activeE].hp) * 100)}%` }}
                                className="absolute inset-0 h-full bg-red-600"
                              />
                              <div className="relative z-10 w-full text-center text-[10px] font-black text-white drop-shadow-md">
                                {Math.max(0, Math.floor(liveBattleState.eTeam[liveBattleState.activeE].currentHp))} / {liveBattleState.eTeam[liveBattleState.activeE].hp}
                              </div>
                            </div>

                            {/* Readiness Bar */}
                            <div className="mt-1 w-full h-1 bg-zinc-900 border border-black overflow-hidden">
                              <motion.div 
                                initial={false}
                                animate={{ width: `${Math.min(100, liveBattleState.eTeam[liveBattleState.activeE].readiness)}%` }}
                                className="h-full bg-blue-500"
                              />
                            </div>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Battle Log */}
                  <div 
                    ref={logRef}
                    className="h-48 bg-zinc-900 border-4 border-zinc-800 p-6 overflow-y-auto font-mono text-sm space-y-2 shadow-inner"
                  >
                    {battleLog.map((log, i) => (
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className={`${log.includes('ULTIMATE') || log.includes('SKILL') ? 'text-amber-400 font-black' : log.includes('SYNERGY') ? 'text-emerald-400 font-black' : 'text-zinc-400'}`}
                      >
                        {log}
                      </motion.p>
                    ))}
                  </div>
                </div>
              ) : battleResult ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-full max-w-4xl bg-zinc-900 border-8 p-12 text-center space-y-8 relative overflow-hidden ${
                    battleResult.challengeId 
                      ? (battleResult.win ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.2)]')
                      : 'border-black'
                  }`}
                >
                  {/* Background Accents for Challenge */}
                  {battleResult.challengeId && (
                    <div className={`absolute inset-0 opacity-10 pointer-events-none ${battleResult.win ? 'bg-amber-500' : 'bg-red-600'}`} style={{ maskImage: 'radial-gradient(circle, black, transparent)' }} />
                  )}

                  <div className="relative z-10">
                    <h2 className={`text-8xl font-black uppercase italic tracking-tighter leading-none ${
                      battleResult.win ? 'text-green-500' : 'text-red-600'
                    }`}>
                      {battleResult.challengeId 
                        ? (battleResult.win ? t('challengeConquered') : t('challengeFailedLabel'))
                        : (battleResult.win ? t('victory') : t('defeat'))
                      }
                    </h2>
                    {battleResult.challengeId && (
                      <p className={`text-xl font-black uppercase tracking-[0.5em] mt-2 ${battleResult.win ? 'text-amber-500' : 'text-red-500'}`}>
                        {battleResult.win ? t('eliteMissionSuccess') : t('missionCriticalFailure')}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-12 py-8 border-y-4 border-zinc-800 relative z-10">
                    <div className="space-y-4">
                      <p className="text-xl font-black uppercase tracking-widest text-zinc-500">{t('yourTeam')}</p>
                      <div className="flex justify-center -space-x-4">
                        {battleResult.playerTeam.map((h: BattleHero, i: number) => (
                          <div key={i} className="relative w-24 h-24 border-2 border-white overflow-hidden rounded-full shadow-xl bg-zinc-800">
                            <img src={h.image} className={`w-full h-full object-cover ${h.currentHp <= 0 ? 'grayscale' : ''}`} referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      <p className="text-4xl font-black italic">{Math.floor(battleResult.playerHp)} {t('hpRemaining').toUpperCase()}</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xl font-black uppercase tracking-widest text-zinc-500">{t('enemyTeam')}</p>
                      <div className="flex justify-center -space-x-4">
                        {battleResult.enemyTeam.map((h: BattleHero, i: number) => (
                          <div key={i} className="relative w-24 h-24 border-2 border-zinc-700 overflow-hidden rounded-full shadow-xl bg-zinc-800">
                            <img src={h.image} className={`w-full h-full object-cover ${h.currentHp <= 0 ? 'grayscale' : ''}`} referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      <p className="text-4xl font-black italic">{Math.floor(battleResult.enemyHp)} {t('hpRemaining').toUpperCase()}</p>
                    </div>
                  </div>

                  {battleResult.win && (
                    <div className="space-y-8">
                      {battleResult.challengeId ? (
                        <motion.div 
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="bg-gradient-to-b from-amber-500/20 to-transparent border-t-4 border-amber-500 p-10 space-y-8 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                          
                          <div className="space-y-2">
                            <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-sm">{t('challengeCompleted')}</p>
                            <h3 className="text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                              {i18n.language === 'zh' 
                                ? CHALLENGES.find(c => c.id === battleResult.challengeId)?.name.zh
                                : CHALLENGES.find(c => c.id === battleResult.challengeId)?.name.en}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Gold Reward */}
                            <div className="bg-black/40 border-2 border-amber-500/30 p-6 flex flex-col items-center justify-center gap-2">
                              <Coins className="w-12 h-12 text-amber-500 animate-bounce" />
                              <p className="text-3xl font-black italic text-amber-500">+{CHALLENGES.find(c => c.id === battleResult.challengeId)?.rewardGold}</p>
                              <p className="text-[10px] font-black uppercase text-zinc-500">{t('goldCredits')}</p>
                            </div>

                            {/* Badge Earned */}
                            <div className="bg-black/40 border-2 border-amber-500/30 p-6 flex flex-col items-center justify-center gap-2">
                              <Trophy className="w-12 h-12 text-white animate-pulse" />
                              <p className="text-2xl font-black italic text-white leading-tight">
                                {CHALLENGES.find(c => c.id === battleResult.challengeId)?.badge}
                              </p>
                              <p className="text-[10px] font-black uppercase text-zinc-500">{t('honorBadge')}</p>
                            </div>

                            {/* Level Up */}
                            <div className="bg-black/40 border-2 border-red-600/30 p-6 flex flex-col items-center justify-center gap-2">
                              {battleResult.leveledUpHeroId ? (
                                <>
                                  <div className="relative">
                                    <Rocket className="w-12 h-12 text-red-600 animate-bounce" />
                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1 rounded-sm">UP</div>
                                  </div>
                                  <p className="text-xl font-black italic text-red-600 truncate w-full">
                                    {i18n.language === 'zh'
                                      ? HEROES.find(h => h.id === battleResult.leveledUpHeroId)?.name.zh
                                      : HEROES.find(h => h.id === battleResult.leveledUpHeroId)?.name.en}
                                  </p>
                                  <p className="text-[10px] font-black uppercase text-zinc-500">{t('levelIncreased')} +3</p>
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Rocket className="w-8 h-8 text-zinc-500" />
                                  <button
                                    onClick={() => setIsSelectingReward(true)}
                                    className="px-4 py-2 bg-red-600 text-white text-xs font-black uppercase italic hover:bg-white hover:text-black transition-all border-2 border-black"
                                  >
                                    {t('selectHeroToLevelUp')}
                                  </button>
                                  <p className="text-[8px] font-black uppercase text-zinc-500">{t('levelUp')} +3</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center gap-4 text-yellow-500 text-4xl font-black italic">
                          <Coins className="w-10 h-10" />
                          <span>+500 {t('goldReward').toUpperCase()}</span>
                        </div>
                      )}
                      
                      {!battleResult.challengeId && (
                        <div className="space-y-4">
                          <p className="text-xl font-black uppercase tracking-widest text-zinc-500">
                            {battleResult.capturedHeroId ? t('heroCaptured') : t('selectHeroToCapture')}
                          </p>
                          <div className="flex justify-center gap-6">
                            {battleResult.enemyTeam.map((hero: BattleHero, i: number) => {
                              const isCaptured = battleResult.capturedHeroId === hero.id;
                              const hasCapturedAny = !!battleResult.capturedHeroId;
                              
                              return (
                                <motion.div 
                                  key={i}
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.5 + i * 0.2 }}
                                  onClick={() => !hasCapturedAny && captureHero(hero)}
                                  className={`w-32 h-48 border-4 overflow-hidden relative transition-all group ${
                                    isCaptured 
                                      ? 'border-yellow-500 scale-110 shadow-[0_0_30px_rgba(234,179,8,0.5)] z-20' 
                                      : hasCapturedAny 
                                        ? 'border-zinc-800 opacity-40 grayscale' 
                                        : 'border-zinc-700 hover:border-white cursor-pointer hover:scale-105'
                                  }`}
                                >
                                  <img src={hero.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  {isCaptured && (
                                    <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                                      <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
                                    </div>
                                  )}
                                  <div className={`absolute bottom-0 left-0 right-0 py-1 text-[8px] font-black uppercase text-center ${
                                    isCaptured ? 'bg-yellow-500 text-black' : 'bg-black/60 text-white'
                                  }`}>
                                    {isCaptured ? t('captured').toUpperCase() : (i18n.language === 'en' ? hero.rarity : t('rarity') + ':' + hero.rarity)}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                          {!battleResult.capturedHeroId && (
                            <p className="text-sm font-bold text-zinc-500 animate-pulse">
                              {t('recruitInstruction')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!battleResult.win && (
                    <div className="space-y-8">
                      {battleResult.challengeId ? (
                        <motion.div 
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="bg-gradient-to-b from-red-600/20 to-transparent border-t-4 border-red-600 p-10 space-y-8 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                          
                          <div className="space-y-2">
                            <p className="text-red-500 font-black uppercase tracking-[0.3em] text-sm">{t('challengeFailed')}</p>
                            <h3 className="text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                              {i18n.language === 'en'
                                ? CHALLENGES.find(c => c.id === battleResult.challengeId)?.name.en
                                : CHALLENGES.find(c => c.id === battleResult.challengeId)?.name.zh}
                            </h3>
                          </div>

                          <div className="bg-black/40 border-2 border-red-600/30 p-8 space-y-4">
                            <Skull className="w-16 h-16 text-red-600 mx-auto animate-bounce" />
                            <p className="text-xl font-bold text-zinc-400 uppercase tracking-widest">
                              {t('enemyTooStrong')}
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <Skull className="w-12 h-12 text-red-600" />
                          <p className="text-2xl font-black italic text-zinc-500 uppercase tracking-widest">{t('betterLuck')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    disabled={!!battleResult.challengeId && battleResult.win && !battleResult.leveledUpHeroId}
                    onClick={() => {
                      if (battleResult.challengeId) {
                        setCurrentView('challenges');
                      }
                      setBattleResult(null);
                      setIsSelectingReward(false);
                    }}
                    className={`px-12 py-6 font-black text-2xl uppercase italic tracking-tighter transition-all border-4 border-black relative z-10 ${
                      battleResult.challengeId
                        ? (battleResult.win 
                            ? (battleResult.leveledUpHeroId ? 'bg-amber-500 text-black hover:bg-white' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed opacity-50')
                            : 'bg-red-600 text-white hover:bg-white hover:text-black')
                        : 'bg-white text-black hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {battleResult.challengeId ? t('backToChallenges') : t('returnToAssemble')}
                  </button>
                </motion.div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Reward Selection Modal */}
        <AnimatePresence>
          {isSelectingReward && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border-4 border-amber-500 w-full max-w-6xl max-h-[90vh] flex flex-col relative overflow-hidden"
              >
                <div className="p-8 border-b-4 border-zinc-800 flex justify-between items-center bg-amber-500 text-black">
                  <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                      {t('challengeConquered')}
                    </h2>
                    <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-70">{t('challengeRewardSubtitle')}</p>
                  </div>
                </div>
                
                <div className="p-8 overflow-y-auto flex justify-center gap-8">
                  {HEROES.filter(h => battleResult?.playerTeam.some(ph => ph.id === h.id)).map(hero => {
                    const battleHero = battleResult?.playerTeam.find(ph => ph.id === hero.id);
                    const baseStats = getHeroStats(hero);
                    
                    // Revert synergy bonus to show HP relative to base stats
                    const pTeams = new Set(battleResult?.playerTeam.map(h => h.team));
                    const synergyBonus = pTeams.size === 1 ? 1.2 : 1.0;
                    const baseCurrentHp = battleHero 
                      ? Math.min(baseStats.hp, Math.max(0, Math.floor(battleHero.currentHp / synergyBonus))) 
                      : undefined;

                    return (
                      <div key={hero.id} className="w-64">
                        <HeroCard
                          hero={hero}
                          isOwned={true}
                          getRarityStyles={getRarityStyles}
                          t={t}
                          lang={i18n.language}
                          stats={baseStats}
                          currentHp={baseCurrentHp}
                          isCompact={false}
                          onSelect={() => {
                            levelUpHeroInBattle(hero.id);
                            setIsSelectingReward(false);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Game Instructions Modal */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
              onClick={() => setShowInstructions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-zinc-900 border-2 border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-md border-b-2 border-zinc-800 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 p-2">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t('gameInstructions')}</h2>
                  </div>
                  <button 
                    onClick={() => setShowInstructions(false)}
                    className="p-2 hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-12">
                  {/* Features */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-red-600" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">{t('features')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: Sparkles, text: t('featureGacha') },
                        { icon: ShoppingBag, text: t('featureShop') },
                        { icon: User, text: t('featureCollection') },
                        { icon: LayoutGrid, text: t('featureRegistry') },
                        { icon: Trophy, text: t('featureChallenges') }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                          <item.icon className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                          <p className="text-sm font-medium text-zinc-300 leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* How to Play */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-amber-500" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">{t('howToPlay')}</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { icon: Coins, text: t('playDaily') },
                        { icon: Rocket, text: t('playLeveling') },
                        { icon: Target, text: t('playRecruit') }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                          <item.icon className="w-6 h-6 text-amber-500 shrink-0" />
                          <p className="text-sm font-medium text-zinc-300">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Battle vs Challenges */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-purple-600" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">{t('battleVsChallenges')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-xl space-y-3">
                        <div className="flex items-center gap-3 text-purple-400">
                          <Swords className="w-6 h-6" />
                          <h4 className="font-black uppercase italic">{t('normalBattle')}</h4>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{t('normalBattleDesc')}</p>
                      </div>
                      <div className="p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-xl space-y-3">
                        <div className="flex items-center gap-3 text-amber-400">
                          <Trophy className="w-6 h-6" />
                          <h4 className="font-black uppercase italic">{t('challengeModeLabel')}</h4>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{t('challengeModeDesc')}</p>
                      </div>
                    </div>
                  </section>

                  {/* Battle Tips */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-500" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">{t('battleTips')}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { icon: Zap, text: t('tipSynergy'), color: 'text-blue-500' },
                        { icon: Swords, text: t('tipSpeed'), color: 'text-blue-500' },
                        { icon: Heart, text: t('tipHP'), color: 'text-blue-500' },
                        { icon: Sparkles, text: t('tipSpecialSkills'), color: 'text-blue-500' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                          <item.icon className={`w-8 h-8 ${item.color} shrink-0`} />
                          <p className="text-base font-bold text-zinc-200 leading-snug">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="pt-8 border-t border-zinc-800 text-center">
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="px-12 py-4 bg-white text-black font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:scale-105"
                    >
                      {t('close')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Detail Modal */}
        <AnimatePresence>
          {selectedHero && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border-4 border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
              >
                <button 
                  onClick={() => setSelectedHero(null)}
                  className="absolute top-4 right-4 z-50 bg-white text-black w-10 h-10 flex items-center justify-center font-black hover:bg-red-600 hover:text-white transition-colors"
                >
                  X
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={selectedHero.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-8 space-y-8">
                    <div>
                      <span className={`inline-block px-3 py-1 text-xs font-black uppercase mb-2 ${getRarityStyles(selectedHero.rarity)}`}>
                        {t(`rarity${selectedHero.rarity}`)}
                      </span>
                      <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
                        {i18n.language === 'en' ? selectedHero.name.en : selectedHero.name.zh}
                      </h2>
                      <p className="text-red-600 font-black uppercase tracking-widest mt-2">{t(`team${selectedHero.team.replace(/[\s-]+/g, '')}`)}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Swords className="w-6 h-6 text-zinc-500" />
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">{t('attackName')}</p>
                          <p className="text-xl font-bold">{i18n.language === 'en' ? selectedHero.attackName.en : selectedHero.attackName.zh}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Zap className="w-6 h-6 text-zinc-500" />
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">{t('abilityLabel')}</p>
                          <p className="text-xl font-bold">{i18n.language === 'en' ? selectedHero.ability.en : selectedHero.ability.zh}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t-2 border-zinc-800">
                      {Object.entries(getHeroStats(selectedHero)).filter(([k]) => k !== 'level').map(([key, val]) => (
                        <div key={key}>
                          <p className="text-xs font-black text-zinc-500 uppercase">{key}</p>
                          <p className="text-3xl font-mono font-bold">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {filteredHeroes.length === 0 && (currentView === 'registry' || currentView === 'collection') && (
          <div className="text-center py-20 border-4 border-dashed border-zinc-800">
            <Info className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-2xl font-black uppercase text-zinc-800 italic">{t('noDataFound')}</p>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t-4 border-black bg-zinc-900 p-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-black italic text-xl uppercase tracking-tighter">{t('shieldRegistry')}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{t('authorizedPersonnelOnly')}</p>
            </div>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest text-center md:text-right">
            {t('copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-component for Hero Card to keep App.tsx cleaner

export default App;
