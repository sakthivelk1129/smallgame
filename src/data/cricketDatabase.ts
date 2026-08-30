import { CricketCard, CricketRole, CardRarity, SpecialAbilityType } from '../types/cricket';

export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
}

export const COUNTRIES_MAP: Record<string, CountryInfo> = {
  'India': { name: 'India', code: 'IND', flag: '🇮🇳' },
  'Australia': { name: 'Australia', code: 'AUS', flag: '🇦🇺' },
  'England': { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'South Africa': { name: 'South Africa', code: 'SA', flag: '🇿🇦' },
  'Pakistan': { name: 'Pakistan', code: 'PAK', flag: '🇵🇰' },
  'New Zealand': { name: 'New Zealand', code: 'NZ', flag: '🇳🇿' },
  'West Indies': { name: 'West Indies', code: 'WI', flag: '🌴' },
  'Sri Lanka': { name: 'Sri Lanka', code: 'SL', flag: '🇱🇰' },
  'Afghanistan': { name: 'Afghanistan', code: 'AFG', flag: '🇦🇫' },
  'Bangladesh': { name: 'Bangladesh', code: 'BAN', flag: '🇧🇩' },
  'Zimbabwe': { name: 'Zimbabwe', code: 'ZIM', flag: '🇿🇼' },
  'Ireland': { name: 'Ireland', code: 'IRE', flag: '🇮🇪' },
  'Netherlands': { name: 'Netherlands', code: 'NED', flag: '🇳🇱' },
  'Scotland': { name: 'Scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'Nepal': { name: 'Nepal', code: 'NEP', flag: '🇳🇵' },
  'USA': { name: 'USA', code: 'USA', flag: '🇺🇸' },
  'Namibia': { name: 'Namibia', code: 'NAM', flag: '🇳🇦' },
  'Oman': { name: 'Oman', code: 'OMN', flag: '🇴🇲' },
  'UAE': { name: 'UAE', code: 'UAE', flag: '🇦🇪' },
  'Canada': { name: 'Canada', code: 'CAN', flag: '🇨🇦' },
  'Kenya': { name: 'Kenya', code: 'KEN', flag: '🇰🇪' },
  'Papua New Guinea': { name: 'Papua New Guinea', code: 'PNG', flag: '🇵🇬' }
};

export interface RawPlayerEntry {
  name: string;
  country: string;
  role: CricketRole;
  rank: number;
  batting: number;
  strikeRate: number;
  power: number;
  consistency: number;
  bowling: number;
  pace: number;
  accuracy: number;
  wicketAbility: number;
  jersey?: number;
  specialAbility?: SpecialAbilityType;
}

// Master authentic international player records (1000 real cricketers with accurate country assignments)
import { MASTER_PLAYERS_LIST } from './cricketMasterPlayers';

let cachedDatabase: CricketCard[] | null = null;

/**
 * Builds and returns the 1,000 unique authentic Cricket cards pool
 */
export function getCricketDatabase(): CricketCard[] {
  if (cachedDatabase && cachedDatabase.length === 1000) {
    return cachedDatabase;
  }

  const database: CricketCard[] = MASTER_PLAYERS_LIST.map((player, index) => {
    const country = COUNTRIES_MAP[player.country] || {
      name: player.country,
      code: player.country.substring(0, 3).toUpperCase(),
      flag: '🏏'
    };

    const cardId = `CRIC-${String(player.rank).padStart(4, '0')}`;

    let rarity: CardRarity = 'COMMON';
    if (player.rank <= 40) rarity = 'LEGENDARY';
    else if (player.rank <= 150) rarity = 'EPIC';
    else if (player.rank <= 450) rarity = 'RARE';

    return {
      cardId,
      playerName: player.name,
      country: country.name,
      countryCode: country.code,
      flagEmoji: country.flag,
      role: player.role,
      imageUrl: `/cards/cricket_${country.name.toLowerCase().replace(/\s+/g, '_')}.png`,
      jerseyNumber: player.jersey || ((index % 99) + 1),
      rank: player.rank,
      batting: player.batting,
      strikeRate: player.strikeRate,
      power: player.power,
      consistency: player.consistency,
      bowling: player.bowling,
      pace: player.pace,
      accuracy: player.accuracy,
      wicketAbility: player.wicketAbility,
      rarity,
      specialAbility: player.specialAbility || (rarity === 'LEGENDARY' ? 'DOUBLE_STAT' : rarity === 'EPIC' ? 'STAT_BOOST' : 'NONE')
    };
  });

  // Sort by rank ascending (#1 to #1000)
  database.sort((a, b) => a.rank - b.rank);

  cachedDatabase = database;
  return database;
}

/**
 * Samples N unique cards without replacement from the global 1,000 cards pool
 */
export function sampleUniqueCricketCards(count: number, excludedIds: string[] = []): CricketCard[] {
  const pool = getCricketDatabase().filter(c => !excludedIds.includes(c.cardId));
  
  // Fisher-Yates shuffle copy
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[j], shuffled[i]] = [shuffled[i], shuffled[j]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get single card by CardId
 */
export function getCricketCardById(cardId: string): CricketCard | undefined {
  const db = getCricketDatabase();
  return db.find(c => c.cardId.toUpperCase() === cardId.toUpperCase());
}

/**
 * Data Import layer for licensed/custom cricket data sets
 */
export function importCustomCricketData(customCards: CricketCard[]): { success: boolean; count: number } {
  if (!Array.isArray(customCards) || customCards.length === 0) {
    return { success: false, count: 0 };
  }

  const validCards = customCards.filter(c => 
    c.cardId && c.playerName && typeof c.rank === 'number' && c.batting && c.bowling
  );

  if (validCards.length > 0) {
    cachedDatabase = validCards;
    return { success: true, count: validCards.length };
  }

  return { success: false, count: 0 };
}
