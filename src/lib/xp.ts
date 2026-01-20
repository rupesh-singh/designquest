// XP and Level calculation utilities (can be used in client components)

// Calculate level from XP
export function calculateLevel(xp: number): number {
  // Level formula: Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, etc.
  let level = 1;
  let xpRequired = 0;
  let increment = 100;

  while (xp >= xpRequired + increment) {
    xpRequired += increment;
    level++;
    increment = Math.floor(increment * 1.5);
  }

  return level;
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  let xpRequired = 0;
  let increment = 100;

  for (let i = 1; i < currentLevel; i++) {
    xpRequired += increment;
    increment = Math.floor(increment * 1.5);
  }

  return xpRequired + increment;
}

// Calculate current level XP progress
export function getLevelProgress(xpPoints: number, level: number) {
  const xpNeeded = xpForNextLevel(level);
  const previousLevelXP = level > 1 ? xpForNextLevel(level - 1) : 0;
  const xpInCurrentLevel = xpPoints - previousLevelXP;
  const xpToNextLevel = xpNeeded - previousLevelXP;

  return {
    current: xpInCurrentLevel,
    needed: xpToNextLevel,
    percentage: (xpInCurrentLevel / xpToNextLevel) * 100,
  };
}
