import { GoogleGenAI } from "@google/genai";

export type PlantType = 'flower' | 'vine' | 'tree' | 'weed';
export type GrowthStage = 'seed' | 'sprout' | 'mature' | 'bloom';

export interface Cell {
  type: PlantType | 'empty';
  stage: GrowthStage;
  owner: 'A' | 'B' | null;
  wateringCount: number; // For trees that need more waterings
}

export type ActionType = 'plant' | 'water' | 'sabotage_weed' | 'sabotage_steal' | 'save';

export interface Action {
  agentId: 'A' | 'B';
  type: ActionType;
  target?: [number, number];
  plantType?: PlantType;
}

export interface AgentTraits {
  aggression: number; // 0-100
  growthFocus: number; // 0-100
  sabotageTendency: number; // 0-100
}

export interface AgentConfig {
  name: string;
  personality: string;
  traits: AgentTraits;
  color: string;
}

export type ProviderType = 'gemini' | 'openai' | 'openrouter' | 'ollama' | 'local';

export interface AISettings {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface AgentStats {
  planted: number;
  watered: number;
  stolen: number;
  weeds: number;
}

export interface GameStats {
  A: AgentStats;
  B: AgentStats;
}

export interface BattleResult {
  id: string;
  date: string;
  scoreA: number;
  scoreB: number;
  nameA: string;
  nameB: string;
  winner: string;
  stats: GameStats;
}

export interface GameState {
  grid: Cell[][];
  water: { A: number; B: number };
  scores: { A: number; B: number };
  stats: GameStats;
  turn: number;
  maxTurns: number;
  currentAgent: 'A' | 'B';
  logs: string[];
  isGameOver: boolean;
  agentConfigs: { A: AgentConfig; B: AgentConfig };
}

export const GRID_SIZE = 10;
export const MAX_TURNS = 50;
export const INITIAL_WATER = 20;
export const TURN_WATER_GAIN = 5;
export const SAVE_EXTRA_WATER = 3;

export const COSTS = {
  plant: 2,
  water: 3,
  sabotage: 5,
};

export const SCORES = {
  flower: { mature: 1, bloom: 3 },
  vine: { mature: 2, bloom: 5 },
  tree: { mature: 5, bloom: 15 },
};

export const STAGES: GrowthStage[] = ['seed', 'sprout', 'mature', 'bloom'];

export const COLORS = {
  bg: '#E8F5E9',
  grid: '#C8E6C9',
  empty: '#F1F8E9',
  A: '#4CAF50',
  B: '#8BC34A',
  flower: '#E91E63',
  vine: '#9C27B0',
  tree: '#795548',
  weed: '#212121',
  water: '#2196F3',
};
