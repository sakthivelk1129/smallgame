import { WordLength, GameDifficulty, LetterStatus } from '../types/bullsCows';
import { UNIQUE_TARGET_WORDS, ALL_TARGET_WORDS, VALID_GUESS_SET, hasUniqueLetters } from '../data/bullsCowsWordBank';

export interface BullsCowsResult {
  bulls: number;
  cows: number;
  letterStatuses: LetterStatus[];
  isSolved: boolean;
}

/**
 * Calculates Bulls and Cows with bulletproof duplicate-letter handling.
 * 1. Identify all exact matches (Bulls).
 * 2. For remaining unmatched letters in the guess, check against remaining letters in target (Cows).
 * 3. Never count a target letter more than once.
 */
export function calculateBullsAndCows(targetWord: string, guessWord: string): BullsCowsResult {
  const target = targetWord.trim().toUpperCase();
  const guess = guessWord.trim().toUpperCase();
  const len = target.length;

  let bulls = 0;
  let cows = 0;

  const targetUsed = new Array<boolean>(len).fill(false);
  const guessUsed = new Array<boolean>(len).fill(false);
  const statuses: LetterStatus[] = new Array(len);

  // Step 1: Count Bulls (exact letter & position match)
  for (let i = 0; i < len; i++) {
    if (guess[i] === target[i]) {
      bulls++;
      targetUsed[i] = true;
      guessUsed[i] = true;
      statuses[i] = { letter: guess[i], type: 'BULL' };
    }
  }

  // Step 2: Count Cows (correct letter, different position)
  for (let i = 0; i < len; i++) {
    if (!guessUsed[i]) {
      const gChar = guess[i];
      let foundCow = false;

      for (let j = 0; j < len; j++) {
        if (!targetUsed[j] && target[j] === gChar) {
          cows++;
          targetUsed[j] = true;
          guessUsed[i] = true;
          foundCow = true;
          statuses[i] = { letter: gChar, type: 'COW' };
          break;
        }
      }

      if (!foundCow) {
        statuses[i] = { letter: gChar, type: 'ABSENT' };
      }
    }
  }

  return {
    bulls,
    cows,
    letterStatuses: statuses,
    isSolved: bulls === len
  };
}

/**
 * Calculates word diversity score between 0 and 100.
 * Compares both the set of letters and the positions.
 */
export function calculateWordDifference(wordA: string, wordB: string): number {
  const a = wordA.toUpperCase();
  const b = wordB.toUpperCase();

  if (a === b) return 0;

  const setA = new Set(a.split(''));
  const setB = new Set(b.split(''));

  let sharedLetters = 0;
  setA.forEach(char => {
    if (setB.has(char)) sharedLetters++;
  });

  const unionSize = new Set([...a, ...b]).size;
  const setOverlapRatio = unionSize > 0 ? sharedLetters / unionSize : 1; // 0 (completely disjoint) to 1 (identical set)

  // Positional similarity
  let samePositionCount = 0;
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) samePositionCount++;
  }
  const posSimilarity = minLen > 0 ? samePositionCount / minLen : 0;

  // Composite similarity (0 = totally different, 1 = identical)
  const compositeSimilarity = (setOverlapRatio * 0.7) + (posSimilarity * 0.3);

  // Diversity score is inverted to 0-100 (100 = completely distinct)
  const diversityScore = Math.max(0, Math.min(100, Math.round((1 - compositeSimilarity) * 100)));
  return diversityScore;
}

/**
 * Check if word satisfies minimum letter-difference thresholds
 */
export function satisfiesMinLetterDifference(wordA: string, wordB: string, length: WordLength): boolean {
  const a = wordA.toUpperCase();
  const b = wordB.toUpperCase();

  const setA = new Set(a.split(''));
  const setB = new Set(b.split(''));

  let differentLettersInA = 0;
  setA.forEach(char => {
    if (!setB.has(char)) differentLettersInA++;
  });

  if (length === 3) {
    return differentLettersInA >= 2;
  }
  if (length === 4 || length === 5) {
    return differentLettersInA >= 3;
  }
  // 6 or 7
  return differentLettersInA >= 4;
}

/**
 * Generate a target word with diversity filtering against recent target words.
 */
export function generateDiverseTargetWord(
  length: WordLength,
  difficulty: GameDifficulty,
  recentWords: string[] = [],
  allowRepeatedLetters: boolean = false
): string {
  const wordPool = allowRepeatedLetters 
    ? ALL_TARGET_WORDS[length] 
    : UNIQUE_TARGET_WORDS[length];

  if (!wordPool || wordPool.length === 0) {
    return length === 3 ? 'CAT' : length === 4 ? 'FISH' : length === 5 ? 'PLANT' : length === 6 ? 'MARKET' : 'DIAMOND';
  }

  // Filter by requested difficulty if matches exist
  let filteredByDiff = wordPool.filter(w => w.difficulty === difficulty);
  if (filteredByDiff.length === 0) {
    filteredByDiff = wordPool;
  }

  // If no recent words, choose any random
  if (recentWords.length === 0) {
    const pick = filteredByDiff[Math.floor(Math.random() * filteredByDiff.length)];
    return pick.word;
  }

  // Min diversity threshold score (e.g. 50+)
  const minDiversityThreshold = 45;

  // Filter candidates that meet diversity and difference rules against all recent words
  const validDiverseCandidates = filteredByDiff.filter(cand => {
    const upperCand = cand.word.toUpperCase();
    
    // Cannot be in recent words directly
    if (recentWords.some(r => r.toUpperCase() === upperCand)) {
      return false;
    }

    // Must satisfy min letter difference and diversity score with recent words
    return recentWords.every(recent => {
      const diffScore = calculateWordDifference(upperCand, recent);
      const meetsMinDiff = satisfiesMinLetterDifference(upperCand, recent, length);
      return diffScore >= minDiversityThreshold && meetsMinDiff;
    });
  });

  if (validDiverseCandidates.length > 0) {
    const chosen = validDiverseCandidates[Math.floor(Math.random() * validDiverseCandidates.length)];
    return chosen.word;
  }

  // Fallback: pick the candidate with highest average diversity score
  let bestCandidate = filteredByDiff[0].word;
  let bestAvgScore = -1;

  for (const cand of filteredByDiff) {
    const upperCand = cand.word.toUpperCase();
    if (recentWords.includes(upperCand)) continue;

    let totalScore = 0;
    recentWords.forEach(r => {
      totalScore += calculateWordDifference(upperCand, r);
    });
    const avg = totalScore / recentWords.length;
    if (avg > bestAvgScore) {
      bestAvgScore = avg;
      bestCandidate = cand.word;
    }
  }

  return bestCandidate;
}

/**
 * Scoring system calculating solve points + guess bonus + time bonus
 */
export function calculateBullsCowsScore(
  guessesCount: number,
  timeTakenSeconds: number,
  isSolved: boolean
): { totalScore: number; baseScore: number; guessBonus: number; timeBonus: number } {
  if (!isSolved) {
    return { totalScore: 0, baseScore: 0, guessBonus: 0, timeBonus: 0 };
  }

  const baseScore = 100;
  let guessBonus = 10;

  if (guessesCount === 1) guessBonus = 100;
  else if (guessesCount === 2) guessBonus = 80;
  else if (guessesCount === 3) guessBonus = 60;
  else if (guessesCount === 4) guessBonus = 40;
  else if (guessesCount === 5) guessBonus = 25;
  else guessBonus = 10;

  let timeBonus = 0;
  if (timeTakenSeconds < 20) timeBonus = 30;
  else if (timeTakenSeconds < 40) timeBonus = 20;
  else if (timeTakenSeconds < 60) timeBonus = 10;

  const totalScore = baseScore + guessBonus + timeBonus;
  return { totalScore, baseScore, guessBonus, timeBonus };
}

/**
 * Validates a user's word input
 */
export function validateWordInput(
  word: string,
  targetLength: WordLength,
  requireUniqueLetters: boolean = false
): { isValid: boolean; errorMessage?: string } {
  const trimmed = word.trim().toUpperCase();

  if (trimmed.length !== targetLength) {
    return {
      isValid: false,
      errorMessage: `Word must be exactly ${targetLength} letters long.`
    };
  }

  if (!/^[A-Z]+$/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Word must contain letters only (A-Z).'
    };
  }

  if (requireUniqueLetters && !hasUniqueLetters(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Use a word with unique letters (no repeated letters).'
    };
  }

  return { isValid: true };
}
