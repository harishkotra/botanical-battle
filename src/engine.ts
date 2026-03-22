import { 
  GameState, 
  GRID_SIZE, 
  INITIAL_WATER, 
  MAX_TURNS, 
  Cell, 
  Action, 
  COSTS, 
  TURN_WATER_GAIN, 
  SAVE_EXTRA_WATER,
  STAGES,
  SCORES,
  AgentConfig,
  COLORS
} from './types';

export const createInitialState = (configs?: { A: AgentConfig; B: AgentConfig }): GameState => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(null).map(() => ({
      type: 'empty',
      stage: 'seed',
      owner: null,
      wateringCount: 0
    }))
  );

  const defaultConfigs = {
    A: { 
      name: 'Elder Bloom', 
      personality: 'The Master Gardener: Focuses on high-scoring trees and long-term growth. Peaceful unless provoked by water theft.',
      traits: { aggression: 10, growthFocus: 90, sabotageTendency: 5 },
      color: COLORS.A 
    },
    B: { 
      name: 'Nightshade', 
      personality: 'The Scorched Earth: Aggressive strategy focusing on fast-growing flowers and frequent sabotage with weeds and water theft.',
      traits: { aggression: 80, growthFocus: 30, sabotageTendency: 70 },
      color: COLORS.B 
    }
  };

  return {
    grid,
    water: { A: INITIAL_WATER, B: INITIAL_WATER },
    scores: { A: 0, B: 0 },
    stats: {
      A: { planted: 0, watered: 0, stolen: 0, weeds: 0 },
      B: { planted: 0, watered: 0, stolen: 0, weeds: 0 }
    },
    turn: 1,
    maxTurns: MAX_TURNS,
    currentAgent: 'A',
    logs: [`Game started! ${configs?.A.name || defaultConfigs.A.name} goes first.`],
    isGameOver: false,
    agentConfigs: configs || defaultConfigs
  };
};

export const calculateScores = (grid: Cell[][]) => {
  const scores = { A: 0, B: 0 };
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (cell.owner && cell.type !== 'empty' && cell.type !== 'weed') {
        if (cell.stage === 'mature') {
          scores[cell.owner] += SCORES[cell.type as keyof typeof SCORES].mature;
        } else if (cell.stage === 'bloom') {
          scores[cell.owner] += SCORES[cell.type as keyof typeof SCORES].bloom;
        }
      }
    }
  }
  return scores;
};

export const processAction = (state: GameState, action: Action): GameState => {
  const newState = { 
    ...state, 
    grid: state.grid.map(row => row.map(cell => ({ ...cell }))),
    stats: {
      A: { ...state.stats.A },
      B: { ...state.stats.B }
    }
  };
  const agent = action.agentId;
  const opponent = agent === 'A' ? 'B' : 'A';
  let log = '';

  switch (action.type) {
    case 'plant':
      if (action.target && action.plantType) {
        const [x, y] = action.target;
        if (newState.grid[y][x].type === 'empty' && newState.water[agent] >= COSTS.plant) {
          newState.grid[y][x] = {
            type: action.plantType,
            stage: 'seed',
            owner: agent,
            wateringCount: 0
          };
          newState.water[agent] -= COSTS.plant;
          newState.stats[agent].planted++;
          log = `${newState.agentConfigs[agent].name} planted a ${action.plantType} at (${x}, ${y})`;
        }
      }
      break;

    case 'water':
      if (action.target) {
        const [x, y] = action.target;
        const cell = newState.grid[y][x];
        if (cell.owner === agent && cell.type !== 'empty' && cell.type !== 'weed' && cell.stage !== 'bloom' && newState.water[agent] >= COSTS.water) {
          cell.wateringCount++;
          
          const wateringsNeededForBloom = cell.type === 'tree' ? 4 : 3;
          
          if (cell.wateringCount === 1) cell.stage = 'sprout';
          else if (cell.wateringCount === 2) cell.stage = 'mature';
          else if (cell.wateringCount >= wateringsNeededForBloom) cell.stage = 'bloom';
          
          newState.water[agent] -= COSTS.water;
          newState.stats[agent].watered++;
          log = `${newState.agentConfigs[agent].name} watered a ${cell.type} at (${x}, ${y})`;
        }
      }
      break;

    case 'sabotage_weed':
      if (action.target) {
        const [x, y] = action.target;
        const targetCell = newState.grid[y][x];
        const canSabotage = (targetCell.type === 'empty') || (targetCell.owner === opponent && targetCell.stage !== 'bloom');
        
        if (canSabotage && newState.water[agent] >= COSTS.sabotage) {
          const wasPlant = targetCell.type !== 'empty';
          newState.grid[y][x] = {
            type: 'weed',
            stage: 'mature',
            owner: opponent,
            wateringCount: 0
          };
          newState.water[agent] -= COSTS.sabotage;
          newState.stats[agent].weeds++;
          log = wasPlant 
            ? `${newState.agentConfigs[agent].name} destroyed ${newState.agentConfigs[opponent].name}'s plant with a Weed at (${x}, ${y})!`
            : `${newState.agentConfigs[agent].name} planted a Weed at (${x}, ${y}) to sabotage ${newState.agentConfigs[opponent].name}`;
        }
      }
      break;

    case 'sabotage_steal':
      if (newState.water[agent] >= COSTS.sabotage) {
        const stolen = Math.min(newState.water[opponent], 3);
        newState.water[opponent] -= stolen;
        newState.water[agent] += stolen;
        newState.water[agent] -= COSTS.sabotage;
        newState.stats[agent].stolen += stolen;
        log = `${newState.agentConfigs[agent].name} stole water from ${newState.agentConfigs[opponent].name}`;
      }
      break;

    case 'save':
      newState.water[agent] += SAVE_EXTRA_WATER;
      log = `${newState.agentConfigs[agent].name} saved water (+${SAVE_EXTRA_WATER + TURN_WATER_GAIN})`;
      break;
  }

  // End of turn logic
  newState.scores = calculateScores(newState.grid);
  newState.logs = [log, ...newState.logs].slice(0, 50);
  
  // Switch agent
  if (newState.currentAgent === 'B') {
    newState.turn++;
    // Add turn water gain
    newState.water.A += TURN_WATER_GAIN;
    newState.water.B += TURN_WATER_GAIN;
  }
  newState.currentAgent = newState.currentAgent === 'A' ? 'B' : 'A';

  if (newState.turn > newState.maxTurns) {
    newState.isGameOver = true;
    const winnerId = newState.scores.A > newState.scores.B ? 'A' : 'B';
    const winnerName = newState.agentConfigs[winnerId].name;
    newState.logs = [`GAME OVER! ${winnerName} is the Master Gardener!`, ...newState.logs];
  }

  return newState;
};
