export const XP_REWARDS = {
  created_event: 10,
  rsvped: 5,
  attended: 20,
} as const;

export type XpReason = keyof typeof XP_REWARDS;

// Level thresholds: level N requires LEVEL_THRESHOLDS[N-1] total XP
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getXpForNextLevel(xp: number): {
  current: number;
  needed: number;
  progress: number;
} {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!;

  if (level >= LEVEL_THRESHOLDS.length) {
    return { current: xp, needed: xp, progress: 100 };
  }

  const intoLevel = xp - currentThreshold;
  const levelSize = nextThreshold - currentThreshold;
  return {
    current: intoLevel,
    needed: levelSize,
    progress: Math.round((intoLevel / levelSize) * 100),
  };
}
