import { WordLength, GameDifficulty, WordMetadata } from '../types/bullsCows';

export const WORD_BANK_3: WordMetadata[] = [
  // EASY
  { word: 'CAT', length: 3, difficulty: 'EASY', frequency: 95 },
  { word: 'DOG', length: 3, difficulty: 'EASY', frequency: 95 },
  { word: 'SUN', length: 3, difficulty: 'EASY', frequency: 90 },
  { word: 'FOX', length: 3, difficulty: 'EASY', frequency: 88 },
  { word: 'BAT', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'PEN', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'BUS', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'CUP', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'BOX', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'RED', length: 3, difficulty: 'EASY', frequency: 90 },
  { word: 'HAT', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'PIG', length: 3, difficulty: 'EASY', frequency: 80 },
  { word: 'CAR', length: 3, difficulty: 'EASY', frequency: 90 },
  { word: 'BOY', length: 3, difficulty: 'EASY', frequency: 90 },
  { word: 'KEY', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'SKY', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'BED', length: 3, difficulty: 'EASY', frequency: 85 },
  { word: 'TOP', length: 3, difficulty: 'EASY', frequency: 80 },
  { word: 'NUT', length: 3, difficulty: 'EASY', frequency: 80 },
  { word: 'MAP', length: 3, difficulty: 'EASY', frequency: 80 },
  // MEDIUM
  { word: 'GLW', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'JAR', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'ZIP', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'RAY', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'GEM', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'LIP', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'MUD', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'ROW', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'WEB', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'OAK', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'FOG', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'LOG', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'NET', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'TUB', length: 3, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'PAN', length: 3, difficulty: 'MEDIUM', frequency: 75 },
  // HARD
  { word: 'VOW', length: 3, difficulty: 'HARD', frequency: 60 },
  { word: 'SPY', length: 3, difficulty: 'HARD', frequency: 65 },
  { word: 'DRY', length: 3, difficulty: 'HARD', frequency: 65 },
  { word: 'FLY', length: 3, difficulty: 'HARD', frequency: 65 },
  { word: 'SHY', length: 3, difficulty: 'HARD', frequency: 60 },
  { word: 'TAX', length: 3, difficulty: 'HARD', frequency: 60 },
  { word: 'JOY', length: 3, difficulty: 'HARD', frequency: 65 },
  { word: 'GYM', length: 3, difficulty: 'HARD', frequency: 60 }
];

export const WORD_BANK_4: WordMetadata[] = [
  // EASY
  { word: 'FISH', length: 4, difficulty: 'EASY', frequency: 95 },
  { word: 'BIRD', length: 4, difficulty: 'EASY', frequency: 95 },
  { word: 'KING', length: 4, difficulty: 'EASY', frequency: 90 },
  { word: 'LION', length: 4, difficulty: 'EASY', frequency: 90 },
  { word: 'BEAR', length: 4, difficulty: 'EASY', frequency: 88 },
  { word: 'DUCK', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'FROG', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'WOLF', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'STAR', length: 4, difficulty: 'EASY', frequency: 90 },
  { word: 'MOON', length: 4, difficulty: 'EASY', frequency: 80 }, // Note: Has repeat, will filter if unique rule
  { word: 'PARK', length: 4, difficulty: 'EASY', frequency: 88 },
  { word: 'GOLD', length: 4, difficulty: 'EASY', frequency: 88 },
  { word: 'SHIP', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'CAMP', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'FORK', length: 4, difficulty: 'EASY', frequency: 80 },
  { word: 'JUMP', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'WIND', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'RAIN', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'SNOW', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'BLUE', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'DARK', length: 4, difficulty: 'EASY', frequency: 80 },
  { word: 'FIRE', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'MILK', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'SAND', length: 4, difficulty: 'EASY', frequency: 85 },
  { word: 'SONG', length: 4, difficulty: 'EASY', frequency: 85 },
  // MEDIUM
  { word: 'GLOW', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'CLAY', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'DRUM', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'SILK', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'TRAM', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'FLAG', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'CROW', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'HORN', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'DESK', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'ROPE', length: 4, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'CORN', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'VAST', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'MAST', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'GRIP', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'SLIM', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'PLUM', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'MINT', length: 4, difficulty: 'MEDIUM', frequency: 70 },
  // HARD
  { word: 'HAWK', length: 4, difficulty: 'HARD', frequency: 65 },
  { word: 'ZINC', length: 4, difficulty: 'HARD', frequency: 60 },
  { word: 'FLUX', length: 4, difficulty: 'HARD', frequency: 60 },
  { word: 'LYNX', length: 4, difficulty: 'HARD', frequency: 60 },
  { word: 'ONYX', length: 4, difficulty: 'HARD', frequency: 60 },
  { word: 'WHIP', length: 4, difficulty: 'HARD', frequency: 65 },
  { word: 'ARCH', length: 4, difficulty: 'HARD', frequency: 65 },
  { word: 'SWAN', length: 4, difficulty: 'HARD', frequency: 65 },
  { word: 'DUSK', length: 4, difficulty: 'HARD', frequency: 65 },
  { word: 'DAWN', length: 4, difficulty: 'HARD', frequency: 65 },
  { word: 'TURF', length: 4, difficulty: 'HARD', frequency: 60 },
  { word: 'SURF', length: 4, difficulty: 'HARD', frequency: 65 }
];

export const WORD_BANK_5: WordMetadata[] = [
  // EASY
  { word: 'PLANT', length: 5, difficulty: 'EASY', frequency: 95 },
  { word: 'BRICK', length: 5, difficulty: 'EASY', frequency: 90 },
  { word: 'TRAIN', length: 5, difficulty: 'EASY', frequency: 92 },
  { word: 'CLOUD', length: 5, difficulty: 'EASY', frequency: 90 },
  { word: 'WATER', length: 5, difficulty: 'EASY', frequency: 85 }, // Note: repeat check
  { word: 'HORSE', length: 5, difficulty: 'EASY', frequency: 88 },
  { word: 'TIGER', length: 5, difficulty: 'EASY', frequency: 88 },
  { word: 'MOUSE', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'BEACH', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'BREAD', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'CHAIR', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'DRIVE', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'EARTH', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'FRUIT', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'HEART', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'LIGHT', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'MONEY', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'NIGHT', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'OCEAN', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'RIVER', length: 5, difficulty: 'EASY', frequency: 80 },
  { word: 'STORM', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'SUGAR', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'WHITE', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'ZEBRA', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'MAGIC', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'POWER', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'RADIO', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'SPACE', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'TABLE', length: 5, difficulty: 'EASY', frequency: 85 },
  { word: 'MUSIC', length: 5, difficulty: 'EASY', frequency: 85 },
  // MEDIUM
  { word: 'CRANE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'FLUTE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'GHOST', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'GIANT', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'GUIDE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'HONEY', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'LEMON', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'MELON', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'PILOT', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'PRIDE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'SHARK', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'SNAKE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'SPARK', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'SWORD', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'WHALE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'WORLD', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'BLAND', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'CHART', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'CLIMB', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'FROST', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'GLOBE', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'MANGO', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'PEACH', length: 5, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'ROBIN', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'SOLAR', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'TRACE', length: 5, difficulty: 'MEDIUM', frequency: 70 },
  // HARD
  { word: 'BLAZE', length: 5, difficulty: 'HARD', frequency: 65 },
  { word: 'CHASM', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'CRYPT', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'DWARF', length: 5, difficulty: 'HARD', frequency: 65 },
  { word: 'FJORD', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'GLYPH', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'HAVOC', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'HYDRA', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'IVORY', length: 5, difficulty: 'HARD', frequency: 65 },
  { word: 'JOUST', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'LYRIC', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'NYMPH', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'OASIS', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'PRISM', length: 5, difficulty: 'HARD', frequency: 65 },
  { word: 'QUART', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'RELIC', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'SPELT', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'TOPAZ', length: 5, difficulty: 'HARD', frequency: 55 },
  { word: 'VIPER', length: 5, difficulty: 'HARD', frequency: 65 },
  { word: 'WALTZ', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'YACHT', length: 5, difficulty: 'HARD', frequency: 60 },
  { word: 'ZENITH', length: 5, difficulty: 'HARD', frequency: 55 }
];

export const WORD_BANK_6: WordMetadata[] = [
  // EASY
  { word: 'MARKET', length: 6, difficulty: 'EASY', frequency: 90 },
  { word: 'PLANET', length: 6, difficulty: 'EASY', frequency: 90 },
  { word: 'SPRING', length: 6, difficulty: 'EASY', frequency: 88 },
  { word: 'WINTER', length: 6, difficulty: 'EASY', frequency: 88 },
  { word: 'MONKEY', length: 6, difficulty: 'EASY', frequency: 88 },
  { word: 'ORANGE', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'FOREST', length: 6, difficulty: 'EASY', frequency: 88 },
  { word: 'GARDEN', length: 6, difficulty: 'EASY', frequency: 88 },
  { word: 'BRIDGE', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'CASTLE', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'DRAGON', length: 6, difficulty: 'EASY', frequency: 88 },
  { word: 'FLOWER', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'ISLAND', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'JUNGLE', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'KNIGHT', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'PENCIL', length: 6, difficulty: 'EASY', frequency: 85 },
  { word: 'SILVER', length: 6, difficulty: 'EASY', frequency: 85 },
  // MEDIUM
  { word: 'BEACON', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'CANYON', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'FALCON', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'GLIDER', length: 6, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'HAMMER', length: 6, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'MAGNET', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'QUIVER', length: 6, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'SAILOR', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'TIMBER', length: 6, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'WONDER', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'STREAM', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'VICTOR', length: 6, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'ANCHOR', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'BISHOP', length: 6, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'CANDLE', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'DOLPHIN', length: 6, difficulty: 'MEDIUM', frequency: 75 },
  // HARD
  { word: 'ZEPHYR', length: 6, difficulty: 'HARD', frequency: 55 },
  { word: 'VORTEX', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'QUARTZ', length: 6, difficulty: 'HARD', frequency: 55 },
  { word: 'OXYGEN', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'MYSTIC', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'MATRIX', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'JINXED', length: 6, difficulty: 'HARD', frequency: 55 },
  { word: 'GALAXY', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'COSMIC', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'BLAZON', length: 6, difficulty: 'HARD', frequency: 50 },
  { word: 'CIPHER', length: 6, difficulty: 'HARD', frequency: 60 },
  { word: 'SPHINX', length: 6, difficulty: 'HARD', frequency: 55 }
];

export const WORD_BANK_7: WordMetadata[] = [
  // EASY
  { word: 'MONSTER', length: 7, difficulty: 'EASY', frequency: 90 },
  { word: 'DOLPHIN', length: 7, difficulty: 'EASY', frequency: 88 },
  { word: 'DIAMOND', length: 7, difficulty: 'EASY', frequency: 88 },
  { word: 'JOURNEY', length: 7, difficulty: 'EASY', frequency: 88 },
  { word: 'KINGDOM', length: 7, difficulty: 'EASY', frequency: 88 },
  { word: 'MORNING', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'OCTOPUS', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'PAINTER', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'RAINBOW', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'SOLDIER', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'THUNDER', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'VILLAGE', length: 7, difficulty: 'EASY', frequency: 85 },
  { word: 'WHISPER', length: 7, difficulty: 'EASY', frequency: 85 },
  // MEDIUM
  { word: 'BLANKET', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'CHAMPION', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'CRYSTAL', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'FEATHER', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'GLACIER', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'LANTERN', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'MYSTERY', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'PHANTOM', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'SURGEON', length: 7, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'TRIUMPH', length: 7, difficulty: 'MEDIUM', frequency: 70 },
  { word: 'VOLCANO', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  { word: 'WARRIOR', length: 7, difficulty: 'MEDIUM', frequency: 75 },
  // HARD
  { word: 'COMPLEX', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'DYNAMIC', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'ECLIPSE', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'HYBRID', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'JUPITER', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'NETWORK', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'ORBITAL', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'PENGUIN', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'QUANTUM', length: 7, difficulty: 'HARD', frequency: 55 },
  { word: 'SHADOWY', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'TSUNAMI', length: 7, difficulty: 'HARD', frequency: 55 },
  { word: 'VAMPIRE', length: 7, difficulty: 'HARD', frequency: 60 },
  { word: 'ZEPPELIN', length: 7, difficulty: 'HARD', frequency: 50 },
  { word: 'PYRAMID', length: 7, difficulty: 'HARD', frequency: 60 }
];

export const ALL_TARGET_WORDS: Record<WordLength, WordMetadata[]> = {
  3: WORD_BANK_3,
  4: WORD_BANK_4,
  5: WORD_BANK_5,
  6: WORD_BANK_6,
  7: WORD_BANK_7
};

// Check if a word contains unique letters
export function hasUniqueLetters(word: string): boolean {
  const letters = new Set<string>();
  const upper = word.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    if (letters.has(char)) return false;
    letters.add(char);
  }
  return true;
}

// Master dictionary of all playable target words with unique letters enforced
export const UNIQUE_TARGET_WORDS: Record<WordLength, WordMetadata[]> = {
  3: WORD_BANK_3.filter(w => hasUniqueLetters(w.word) && w.word.length === 3),
  4: WORD_BANK_4.filter(w => hasUniqueLetters(w.word) && w.word.length === 4),
  5: WORD_BANK_5.filter(w => hasUniqueLetters(w.word) && w.word.length === 5),
  6: WORD_BANK_6.filter(w => hasUniqueLetters(w.word) && w.word.length === 6),
  7: WORD_BANK_7.filter(w => hasUniqueLetters(w.word) && w.word.length === 7)
};

// Extended valid guess dictionary set for user inputs
export const VALID_GUESS_SET = new Set<string>();

// Seed with all target words
Object.values(ALL_TARGET_WORDS).forEach(list => {
  list.forEach(item => VALID_GUESS_SET.add(item.word.toUpperCase()));
});

// Common English words for input validation
const EXTRA_COMMON_WORDS = [
  'ACT', 'ACE', 'ADD', 'AGE', 'AGO', 'AID', 'AIM', 'AIR', 'ALL', 'AND', 'ANT', 'ANY', 'APE', 'ARM', 'ART', 'ASH', 'ASK', 'AWE', 'AXE', 'BAD', 'BAG', 'BAN', 'BAR', 'BED', 'BEE', 'BEG', 'BET', 'BIG', 'BIT', 'BOW', 'BOX', 'BOY', 'BUG', 'BUS', 'BUT', 'BUY', 'CAN', 'CAP', 'CAR', 'CAT', 'COW', 'CRY', 'CUP', 'CUT', 'DAD', 'DAM', 'DAY', 'DEN', 'DEW', 'DIE', 'DIG', 'DIM', 'DIP', 'DOG', 'DOT', 'DRY', 'DUE', 'EAR', 'EAT', 'EGG', 'EGO', 'ELK', 'ELM', 'END', 'ERA', 'EYE', 'FAN', 'FAR', 'FAT', 'FAX', 'FED', 'FEE', 'FEW', 'FIG', 'FIT', 'FIX', 'FLY', 'FOG', 'FOR', 'FOX', 'FRY', 'FUN', 'FUR', 'GAP', 'GAS', 'GEL', 'GEM', 'GET', 'GIN', 'GLU', 'GNU', 'GOD', 'GOT', 'GUM', 'GUN', 'GUT', 'GUY', 'GYM', 'HAD', 'HAM', 'HAS', 'HAT', 'HAY', 'HEN', 'HER', 'HEX', 'HID', 'HIM', 'HIP', 'HIS', 'HIT', 'HOG', 'HOP', 'HOT', 'HOW', 'HUB', 'HUG', 'HUM', 'HUT', 'ICE', 'ILL', 'INK', 'INN', 'ION', 'IRK', 'IVY', 'JAM', 'JAR', 'JAW', 'JAY', 'JET', 'JIG', 'JOB', 'JOG', 'JOY', 'JUG', 'KEY', 'KID', 'KIN', 'KIT', 'LAB', 'LAD', 'LAP', 'LAW', 'LAY', 'LED', 'LEG', 'LET', 'LID', 'LIE', 'LIP', 'LIT', 'LOG', 'LOT', 'LOW', 'MAD', 'MAN', 'MAP', 'MAT', 'MAY', 'MEN', 'MET', 'MID', 'MIX', 'MOB', 'MOM', 'MOP', 'MUD', 'MUG', 'MUM', 'NAB', 'NAP', 'NET', 'NEW', 'NIL', 'NIP', 'NOD', 'NOT', 'NOW', 'NUT', 'OAF', 'OAK', 'OAR', 'OAT', 'ODD', 'OFF', 'OIL', 'OLD', 'ONE', 'OPT', 'ORB', 'ORE', 'OUR', 'OUT', 'OWL', 'OWN', 'PAD', 'PAN', 'PAY', 'PEA', 'PEG', 'PEN', 'PET', 'PIG', 'PIN', 'PIT', 'PLY', 'POD', 'POP', 'POT', 'PRO', 'PRY', 'PUB', 'PUN', 'PUP', 'RAG', 'RAM', 'RAN', 'RAP', 'RAT', 'RAW', 'RAY', 'RED', 'RIB', 'RID', 'RIG', 'RIM', 'RIP', 'ROB', 'ROD', 'ROT', 'ROW', 'RUB', 'RUG', 'RUN', 'RUT', 'RYE', 'SAD', 'SAG', 'SAP', 'SAT', 'SAW', 'SAY', 'SEA', 'SET', 'SEW', 'SHE', 'SHY', 'SIN', 'SIP', 'SIR', 'SIT', 'SIX', 'SKI', 'SKY', 'SLY', 'SOB', 'SOD', 'SON', 'SOW', 'SOY', 'SPA', 'SPY', 'STY', 'SUE', 'SUM', 'SUN', 'TAB', 'TAG', 'TAN', 'TAP', 'TAR', 'TAX', 'TEA', 'TEN', 'THE', 'THY', 'TIE', 'TIN', 'TIP', 'TOE', 'TON', 'TOP', 'TOW', 'TOY', 'TRY', 'TUB', 'TUG', 'TWO', 'URN', 'USE', 'VAN', 'VAT', 'VET', 'VOW', 'WAR', 'WAS', 'WAX', 'WAY', 'WEB', 'WED', 'WET', 'WHO', 'WHY', 'WIG', 'WIN', 'WIT', 'WON', 'WOW', 'WRY', 'YAK', 'YAM', 'YAP', 'YAW', 'YEA', 'YES', 'YET', 'YEW', 'YIP', 'YOU', 'ZEN', 'ZIP', 'ZOO',
  // 4 letters
  'ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BACK', 'BALL', 'BAND', 'BANK', 'BASE', 'BATH', 'BEAR', 'BEAT', 'BEEN', 'BEER', 'BELL', 'BELT', 'BEST', 'BIRD', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOND', 'BONE', 'BOOK', 'BOOM', 'BORN', 'BOSS', 'BOTH', 'BOWL', 'BULK', 'BURN', 'BUSH', 'BUSY', 'CALL', 'CALM', 'CAME', 'CAMP', 'CARD', 'CARE', 'CASE', 'CASH', 'CAST', 'CELL', 'CHAT', 'CHIP', 'CITY', 'CLUB', 'COAL', 'COAT', 'CODE', 'COLD', 'COME', 'COOK', 'COOL', 'COPE', 'COPY', 'CORE', 'COST', 'CREW', 'CROP', 'DARK', 'DATA', 'DATE', 'DAWN', 'DAYS', 'DEAD', 'DEAL', 'DEAN', 'DEAR', 'DEBT', 'DEEP', 'DENY', 'DESK', 'DIAL', 'DIRT', 'DISC', 'DISK', 'DOES', 'DONE', 'DOOR', 'DOSE', 'DOWN', 'DRAW', 'DREW', 'DROP', 'DRUG', 'DUAL', 'DUCK', 'DUST', 'DUTY', 'EACH', 'EARN', 'EASE', 'EAST', 'EASY', 'EDGE', 'ELSE', 'EVEN', 'EVER', 'EVIL', 'EXIT', 'FACE', 'FACT', 'FADE', 'FAIL', 'FAIR', 'FALL', 'FARM', 'FAST', 'FATE', 'FEAR', 'FEED', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND', 'FINE', 'FIRE', 'FIRM', 'FISH', 'FIVE', 'FLAT', 'FLOW', 'FOOD', 'FOOT', 'FORD', 'FORM', 'FORT', 'FOUR', 'FREE', 'FROM', 'FUEL', 'FULL', 'FUND', 'GAIN', 'GAME', 'GATE', 'GAVE', 'GEAR', 'GENE', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GOAL', 'GOES', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAY', 'GREW', 'GREY', 'GROW', 'GULF', 'HAIR', 'HALF', 'HALL', 'HAND', 'HANG', 'HARD', 'HARM', 'HATE', 'HAVE', 'HEAD', 'HEAR', 'HEAT', 'HELD', 'HELL', 'HELP', 'HERO', 'HIGH', 'HILL', 'HIRE', 'HOLD', 'HOLE', 'HOLY', 'HOME', 'HOPE', 'HOST', 'HOUR', 'HUGE', 'HUNG', 'HUNT', 'HURT', 'IDEA', 'INCH', 'INTO', 'IRON', 'ITEM', 'JACK', 'JANE', 'JEAN', 'JOHN', 'JOIN', 'JUMP', 'JURY', 'JUST', 'KEEN', 'KEEP', 'KEPT', 'KICK', 'KILL', 'KIND', 'KING', 'KNEE', 'KNEW', 'KNOW', 'LACK', 'LADY', 'LAID', 'LAKE', 'LAND', 'LANE', 'LAST', 'LATE', 'LEAD', 'LEFT', 'LESS', 'LIFE', 'LIFT', 'LIKE', 'LINE', 'LINK', 'LION', 'LIST', 'LIVE', 'LOAD', 'LOAN', 'LOCK', 'LOGO', 'LONG', 'LOOK', 'LORD', 'LOSE', 'LOSS', 'LOST', 'LOVE', 'LUCK', 'MADE', 'MAIL', 'MAIN', 'MAKE', 'MALE', 'MANY', 'MARK', 'MASS', 'MATT', 'MEAL', 'MEAN', 'MEAT', 'MEET', 'MENU', 'MERE', 'MIKE', 'MILE', 'MILK', 'MIND', 'MINE', 'MISS', 'MODE', 'MOOD', 'MOON', 'MORE', 'MOST', 'MOVE', 'MUCH', 'MUST', 'NAME', 'NAVY', 'NEAR', 'NECK', 'NEED', 'NEWS', 'NEXT', 'NICE', 'NICK', 'NINE', 'NONE', 'NOSE', 'NOTE', 'OKAY', 'ONCE', 'ONLY', 'ONTO', 'OPEN', 'ORAL', 'OVER', 'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR', 'PALM', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PEAK', 'PICK', 'PILE', 'PINK', 'PIPE', 'PLAN', 'PLAY', 'PLOT', 'PLUG', 'PLUS', 'POLL', 'POOL', 'POOR', 'PORT', 'POST', 'PULL', 'PURE', 'PUSH', 'RACE', 'RAIL', 'RAIN', 'RANK', 'RARE', 'RATE', 'READ', 'REAL', 'REAR', 'RELY', 'RENT', 'REST', 'RICE', 'RICH', 'RIDE', 'RING', 'RISE', 'RISK', 'ROAD', 'ROCK', 'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROSE', 'RULE', 'RUSH', 'SAFE', 'SAID', 'SAIL', 'SALE', 'SALT', 'SAME', 'SAND', 'SAVE', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF', 'SELL', 'SEND', 'SENT', 'SEPT', 'SHIP', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SITE', 'SIZE', 'SKIN', 'SLIP', 'SLOW', 'SNOW', 'SOFT', 'SOIL', 'SOLD', 'SOLE', 'SOME', 'SONG', 'SOON', 'SORT', 'SOUL', 'SPOT', 'STAR', 'STAY', 'STEP', 'STOP', 'SUCH', 'SUIT', 'SURE', 'TAKE', 'TALE', 'TALK', 'TALL', 'TANK', 'TAPE', 'TASK', 'TEAM', 'TECH', 'TELL', 'TEND', 'TERM', 'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'THOU', 'THUS', 'TIDE', 'TILL', 'TIME', 'TINY', 'TOLL', 'TONE', 'TONY', 'TOOK', 'TOOL', 'TOUR', 'TOWN', 'TREE', 'TRIP', 'TRUE', 'TUBE', 'TURN', 'TWIN', 'TYPE', 'UNIT', 'UPON', 'USED', 'USER', 'VARY', 'VAST', 'VERY', 'VICE', 'VIEW', 'VOTE', 'WAGE', 'WAIT', 'WAKE', 'WALK', 'WALL', 'WANT', 'WARD', 'WARM', 'WASH', 'WAVE', 'WAYS', 'WEAK', 'WEAR', 'WEEK', 'WELL', 'WENT', 'WEST', 'WHAT', 'WHEN', 'WHOM', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WIPE', 'WIRE', 'WISE', 'WISH', 'WITH', 'WOOD', 'WORD', 'WORE', 'WORK', 'YARD', 'YEAR', 'ZERO', 'ZONE',
  // 5 letters
  'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIKE', 'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BASIS', 'BEACH', 'BEGAN', 'BEGIN', 'BEGUN', 'BEING', 'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLIND', 'BLOCK', 'BLOOD', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRANE', 'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRAWN', 'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE', 'GRAND', 'GRANT', 'GRASS', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN', 'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH', 'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT', 'LINKS', 'LIVES', 'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MARRY', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT', 'PAINT', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'REFER', 'RIGHT', 'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN', 'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIGHT', 'TIMES', 'TIRED', 'TITLE', 'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE', 'UNDER', 'UNDUE', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'WROTE', 'YIELD', 'YOUNG', 'YOUTH'
];

EXTRA_COMMON_WORDS.forEach(w => VALID_GUESS_SET.add(w.toUpperCase()));
