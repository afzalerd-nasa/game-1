export type GameState =
  | 'START_SCREEN'
  | 'CHARACTER_CREATOR'
  | 'GAME_PLAY'
  | 'PARENT_DASHBOARD'
  | 'GAME_OVER_SCREEN_TIME';

export type CharacterGender = 'boy' | 'girl';

export interface CharacterCustomization {
  gender: CharacterGender;
  skinColor: string; // Hex or label
  hairStyle: string; // 'short', 'spiky', 'curly', 'pigtails', 'long'
  hairColor: string; // Hex or label
  outfit: string; // 'adventurer', 'wizard', 'space-suit', 'dino-hero', 'candy-elf'
  accessory: string; // 'none', 'wizard-hat', 'cat-ears', 'rocket-pack', 'flower-crown', 'crown'
}

export interface PlayerStats {
  coins: number;
  stars: number;
  completedTasks: number;
  badges: string[]; // List of badge IDs
  lessonsProgress: {
    math: number; // percentage/points
    alphabet: number;
    shapes: number;
    vocabulary: number;
    memory: number;
  };
}

export interface ParentSettings {
  screenTimeLimit: number; // in minutes (0 means unlimited)
  screenTimeUsed: number; // in seconds
  pinCode: string; // 4 digits
  soundVolume: number; // 0..100
  learningFocus: string[]; // ['math', 'alphabet', 'shapes', 'vocab', 'memory']
  voiceGuidance: boolean;
}

export interface GameNPC {
  id: string;
  name: string;
  emoji: string;
  color: string;
  x: number; // world grid coords
  y: number;
  area: string; // 'village', 'candy', 'animals', 'ocean', 'space', 'dinosaurs', 'castle'
  dialogue: string;
  badgeToReward: string;
  hasQuest: boolean;
}

export interface GameCollectible {
  id: string;
  type: 'coin' | 'star' | 'badge_item';
  x: number;
  y: number;
  z: number; // height offset
  collected: boolean;
  value?: number;
  badgeId?: string;
  pulseOffset: number;
}

export interface SavedBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export const BADGES_LIST: SavedBadge[] = [
  { id: 'first_steps', title: 'First Explorer', description: 'Walk around Magic Kids World', emoji: '👟', color: 'bg-emerald-500' },
  { id: 'math_wizard', title: 'Math Wiz', description: 'Solve 3 math problems', emoji: '🔢', color: 'bg-blue-500' },
  { id: 'abc_champion', title: 'Alphabet Hero', description: 'Complete alphabet spelling quizzes', emoji: '🔤', color: 'bg-indigo-500' },
  { id: 'shape_matcher', title: 'Shape Master', description: 'Match colorful dynamic shapes', emoji: '🔺', color: 'bg-amber-500' },
  { id: 'animal_saver', title: 'Animal Rescuer', description: 'Help rescue lost baby animals', emoji: '🐶', color: 'bg-pink-500' },
  { id: 'deep_diver', title: 'Deep Ocean Diver', description: 'Go for a swim in the blue ocean', emoji: '🐠', color: 'bg-cyan-500' },
  { id: 'star_collector', title: 'Cosmic Star', description: 'Collect 10 golden stars', emoji: '⭐', color: 'bg-yellow-500' },
];

export interface LivePlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  gender: CharacterGender;
  outfit: string;
  chatBubble?: string;
  chatTimer?: number;
}
