import { RoleDefinition, RoleType, SpecialEvent, GameEventDetails } from '../types/game';

export const ROLE_DEFINITIONS: Record<RoleType, RoleDefinition> = {
  RAJA: {
    id: 'RAJA',
    name: 'Raja (King)',
    emoji: '👑',
    basePoints: 1000,
    description: 'The supreme ruler of the kingdom. Your royal identity is revealed to everyone.',
    mission: 'Oversee your kingdom and maintain royal dignity. You always receive base points.',
    color: 'from-amber-400 to-yellow-600',
    bgGradient: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border-amber-400/50',
    specialAbilityName: 'Royal Order',
    specialAbilityDesc: 'Inspect 2 players: The royal advisor reveals if their roles are Special or Normal.'
  },
  RANI: {
    id: 'RANI',
    name: 'Rani (Queen)',
    emoji: '👸',
    basePoints: 500,
    description: 'The beloved Queen. Graceful, protected, and revered throughout the empire.',
    mission: 'Support the kingdom and keep your royal status hidden until the final reveal.',
    color: 'from-pink-400 to-rose-600',
    bgGradient: 'bg-gradient-to-br from-pink-500/20 to-rose-600/30 border-pink-400/50',
    specialAbilityName: 'Royal Protection',
    specialAbilityDesc: 'Shield yourself or an ally from negative events or thief thefts this round.'
  },
  MINISTER: {
    id: 'MINISTER',
    name: 'Minister (Mantri)',
    emoji: '🧙',
    basePoints: 400,
    description: 'The wise chief counselor who secretly assists the Police in discovering truths.',
    mission: 'Observe player behaviors and advise subtly without blowing your identity.',
    color: 'from-purple-400 to-indigo-600',
    bgGradient: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/30 border-purple-400/50',
    specialAbilityName: 'Secret Investigation',
    specialAbilityDesc: 'Check one suspect: Instantly discover if they are NOT the Thief.'
  },
  POLICE: {
    id: 'POLICE',
    name: 'Police (Kotwal)',
    emoji: '👮',
    basePoints: 300,
    description: 'The guardian of law. You must interrogate, analyze bluffing, and catch the Thief!',
    mission: 'Accuse the true Thief! If correct, you gain full points. If wrong, you get 0 points!',
    color: 'from-blue-400 to-cyan-600',
    bgGradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/30 border-blue-400/50',
    specialAbilityName: 'Double Accusation',
    specialAbilityDesc: 'Gain 2 attempts to find the Thief if your first accusation misses!'
  },
  SPY: {
    id: 'SPY',
    name: 'Spy (Gudachari)',
    emoji: '🕵️',
    basePoints: 200,
    description: 'The covert operative lurking in the shadows gathering high-value intelligence.',
    mission: 'Blend in with commoners and feed secret hints during active discussion.',
    color: 'from-emerald-400 to-teal-600',
    bgGradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30 border-emerald-400/50',
    specialAbilityName: 'Secret Clue',
    specialAbilityDesc: 'Receive a classified intel report on players who are guaranteed innocent.'
  },
  RICH_MAN: {
    id: 'RICH_MAN',
    name: 'Rich Man (Seth)',
    emoji: '💰',
    basePoints: 150,
    description: 'The wealthy merchant holding royal treasury contracts.',
    mission: 'Guard your wealth from the crafty Thief and help the court find suspects.',
    color: 'from-yellow-300 to-amber-500',
    bgGradient: 'bg-gradient-to-br from-yellow-400/20 to-amber-500/30 border-yellow-300/50',
    specialAbilityName: 'Bribe Bounty',
    specialAbilityDesc: 'Offer a 50pt bounty: if Police catches the Thief, both gain bonus points!'
  },
  FARMER: {
    id: 'FARMER',
    name: 'Farmer (Kisan)',
    emoji: '🌾',
    basePoints: 100,
    description: 'The humble backbone of the empire. Honest and hard-working.',
    mission: 'Defend your innocence in chat and avoid false accusations.',
    color: 'from-lime-400 to-green-600',
    bgGradient: 'bg-gradient-to-br from-lime-500/20 to-green-600/30 border-lime-400/50',
    specialAbilityName: 'Crop Harvest',
    specialAbilityDesc: 'Cultivate steady peace: Earn +25 bonus points if no chaos occurs.'
  },
  COOK: {
    id: 'COOK',
    name: 'Cook (Rasoiya)',
    emoji: '👨‍🍳',
    basePoints: 80,
    description: 'The master royal chef who hears kitchen gossip and rumors.',
    mission: 'Serve royal delicacies and spot nervous ticks in suspicious players.',
    color: 'from-orange-400 to-amber-600',
    bgGradient: 'bg-gradient-to-br from-orange-500/20 to-amber-600/30 border-orange-400/50',
    specialAbilityName: 'Taste Test',
    specialAbilityDesc: 'Stir suspicion: reveal an anonymous quote hinting at player alignments.'
  },
  SERVANT: {
    id: 'SERVANT',
    name: 'Servant (Sevak)',
    emoji: '🧹',
    basePoints: 60,
    description: 'The faithful castle attendant who keeps everything running behind closed doors.',
    mission: 'Keep quiet or bluff convincingly to divert attention from key roles.',
    color: 'from-slate-400 to-zinc-600',
    bgGradient: 'bg-gradient-to-br from-slate-500/20 to-zinc-600/30 border-slate-400/50',
    specialAbilityName: 'Shadow Sweep',
    specialAbilityDesc: 'Clear traces: swap seats or confuse the public discussion timeline.'
  },
  ACTOR: {
    id: 'ACTOR',
    name: 'Actor (Natakwala)',
    emoji: '🎭',
    basePoints: 40,
    description: 'The theatrical illusionist skilled in pretending to be any role.',
    mission: 'Mimic the Thief or Police to create hilarious confusion in court!',
    color: 'from-violet-400 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-violet-500/20 to-purple-600/30 border-violet-400/50',
    specialAbilityName: 'Dramatic Mask',
    specialAbilityDesc: 'Imitate any role emote or trigger a fake suspicion alert.'
  },
  JOKER: {
    id: 'JOKER',
    name: 'Joker (Vidushak)',
    emoji: '🤡',
    basePoints: 20,
    description: 'The mischievous royal court jester. Surviving accusations gives epic rewards!',
    mission: 'Bait the Police into accusing you! If the Police accuses you, you escape unharmed!',
    color: 'from-fuchsia-400 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-fuchsia-500/20 to-pink-600/30 border-fuchsia-400/50',
    specialAbilityName: 'Joker Escape',
    specialAbilityDesc: 'If accused by Police, you escape scot-free and grant Police 0 points!'
  },
  THIEF: {
    id: 'THIEF',
    name: 'Thief (Chor)',
    emoji: '🥷',
    basePoints: 0,
    description: 'The elusive mastermind. Hide your identity at all costs!',
    mission: 'Bluff actively, deflect suspicion onto innocent subjects, and survive the Police turn. Escaping grants +100 bonus points!',
    color: 'from-red-500 to-rose-700',
    bgGradient: 'bg-gradient-to-br from-red-600/30 to-rose-900/40 border-red-500/60',
    specialAbilityName: 'Midnight Heist',
    specialAbilityDesc: 'Secretly steal 50 points from any player of your choice at the end of the round.'
  }
};

// Role composition based on player count (4 to 12)
export function getRoleDeckForPlayerCount(count: number): RoleType[] {
  const clampedCount = Math.max(4, Math.min(12, count));
  const deckTemplates: Record<number, RoleType[]> = {
    4: ['RAJA', 'RANI', 'POLICE', 'THIEF'],
    5: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'THIEF'],
    6: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'THIEF'],
    7: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'RICH_MAN', 'THIEF'],
    8: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'RICH_MAN', 'ACTOR', 'THIEF'],
    9: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'RICH_MAN', 'FARMER', 'ACTOR', 'THIEF'],
    10: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'RICH_MAN', 'FARMER', 'COOK', 'ACTOR', 'THIEF'],
    11: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'RICH_MAN', 'FARMER', 'COOK', 'SERVANT', 'ACTOR', 'THIEF'],
    12: ['RAJA', 'RANI', 'MINISTER', 'POLICE', 'SPY', 'RICH_MAN', 'FARMER', 'COOK', 'SERVANT', 'ACTOR', 'JOKER', 'THIEF']
  };

  return deckTemplates[clampedCount] || deckTemplates[4];
}

export const SPECIAL_EVENTS: Record<SpecialEvent, GameEventDetails> = {
  DOUBLE_POINTS: {
    type: 'DOUBLE_POINTS',
    title: '⚡ Royal Prosperity',
    description: 'Double Points! All character scores earned this round are multiplied by 2x.',
    icon: '⚡'
  },
  DARK_ROUND: {
    type: 'DARK_ROUND',
    title: '🌑 Dark Eclipse',
    description: 'A shadowy veil falls upon the court. Clues and whisper reports are obscured.',
    icon: '🌑'
  },
  ROLE_SWAP: {
    type: 'ROLE_SWAP',
    title: '🔄 Secret Shift',
    description: 'Whispers in the dark! Two non-Raja players have their fates intertwined.',
    icon: '🔄'
  },
  SPEED_ROUND: {
    type: 'SPEED_ROUND',
    title: '⏱️ Lightning Trial',
    description: 'The King demands haste! Police has only 12 seconds to make their accusation!',
    icon: '⏱️'
  },
  KINGS_CHOICE: {
    type: 'KINGS_CHOICE',
    title: '👑 King’s Decreed Suspects',
    description: 'The Raja identifies 3 suspects. Police must select the Thief exclusively from them!',
    icon: '👑'
  },
  JOKER_CHAOS: {
    type: 'JOKER_CHAOS',
    title: '🃏 Court Carnivale',
    description: 'The Joker sows anarchy! Innocents falsely accused gain +100 bonus consolation!',
    icon: '🃏'
  }
};
