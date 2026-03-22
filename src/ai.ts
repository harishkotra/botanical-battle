import { GameState, Action, GRID_SIZE, COSTS, AISettings } from './types';

// Simple heuristic-based AI that uses the personality string to weight decisions
export const getAgentAction = (state: GameState, agentId: 'A' | 'B', settings?: AISettings): Action => {
  const water = state.water[agentId];
  const opponentId = agentId === 'A' ? 'B' : 'A';
  const grid = state.grid;
  const config = state.agentConfigs[agentId];
  const personality = config.personality.toLowerCase();

  // Helper to find cells
  const findCells = (owner: 'A' | 'B' | null, types: string[], stages: string[]) => {
    const results: [number, number][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = grid[y][x];
        if (cell.owner === owner && types.includes(cell.type) && stages.includes(cell.stage)) {
          results.push([x, y]);
        }
      }
    }
    return results;
  };

  const emptyCells = findCells(null, ['empty'], ['seed']);
  const myPlantsToWater = findCells(agentId, ['flower', 'vine', 'tree'], ['seed', 'sprout', 'mature']);
  const opponentPlants = findCells(opponentId, ['flower', 'vine', 'tree'], ['seed', 'sprout', 'mature', 'bloom']);

  const traits = config.traits;
  const aggression = traits.aggression / 100;
  const growthFocus = traits.growthFocus / 100;
  const sabotageTendency = traits.sabotageTendency / 100;

  // Logic Loop
  
  // 1. Check for revenge if applicable (influenced by aggression)
  const lastLog = state.logs[0] || '';
  const wasStolen = lastLog.includes(`stole water`);
  if (wasStolen && water >= COSTS.sabotage && Math.random() < aggression) {
    return { agentId, type: 'sabotage_steal' };
  }

  // 2. Aggressive actions (Sabotage)
  if (water >= COSTS.sabotage && Math.random() < sabotageTendency) {
    // Target high value plants first
    const highValueOpponentPlants = opponentPlants.filter(([x, y]) => {
      const cell = grid[y][x];
      return (cell.type === 'tree' || cell.type === 'vine') && cell.stage !== 'bloom';
    });

    if (highValueOpponentPlants.length > 0 && Math.random() < aggression) {
      const target = highValueOpponentPlants[Math.floor(Math.random() * highValueOpponentPlants.length)];
      return { agentId, type: 'sabotage_weed', target };
    }

    if (water >= COSTS.sabotage + 5) {
      if (Math.random() < aggression * 0.8) {
        return { agentId, type: 'sabotage_steal' };
      }
      if (emptyCells.length > 0 && Math.random() < sabotageTendency * 0.5) {
        const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        return { agentId, type: 'sabotage_weed', target };
      }
    }
  }

  // 3. Defensive planting (Influenced by growthFocus)
  if (growthFocus > 0.6 && water >= COSTS.plant + COSTS.water) {
    const myTrees = findCells(agentId, ['tree'], ['seed', 'sprout', 'mature', 'bloom']);
    for (const [tx, ty] of myTrees) {
      // Find empty neighbors to "protect" the tree from weeds
      const neighbors: [number, number][] = [
        [tx + 1, ty], [tx - 1, ty], [tx, ty + 1], [tx, ty - 1]
      ].filter(([nx, ny]) => 
        nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[ny][nx].type === 'empty'
      ) as [number, number][];

      if (neighbors.length > 0 && Math.random() < growthFocus) {
        return { agentId, type: 'plant', target: neighbors[0], plantType: 'flower' };
      }
    }
  }

  // 4. Watering priority (High priority for growth focus)
  if (myPlantsToWater.length > 0 && water >= COSTS.water) {
    // Sort by priority: Trees > Vines > Flowers if growthFocus is high
    const sorted = [...myPlantsToWater].sort((a, b) => {
      const typeA = grid[a[1]][a[0]].type;
      const typeB = grid[b[1]][b[0]].type;
      const priority = growthFocus > 0.5 ? { tree: 3, vine: 2, flower: 1 } : { flower: 3, vine: 2, tree: 1 };
      return (priority[typeB as keyof typeof priority] || 0) - (priority[typeA as keyof typeof priority] || 0);
    });
    return { agentId, type: 'water', target: sorted[0] };
  }

  // 5. Planting priority
  if (emptyCells.length > 0 && water >= COSTS.plant) {
    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let plantType: 'flower' | 'vine' | 'tree' = 'flower';
    
    if (growthFocus > 0.7 && water >= COSTS.plant + 8) {
      plantType = 'tree';
    } else if (growthFocus < 0.3) {
      plantType = 'flower';
    } else {
      const rand = Math.random();
      plantType = rand > 0.7 ? 'tree' : rand > 0.4 ? 'vine' : 'flower';
    }
    
    return { agentId, type: 'plant', target, plantType };
  }

  return { agentId, type: 'save' };
};
