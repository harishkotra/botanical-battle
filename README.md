# 🌿 Botanical Battle: AI Garden Arena

Welcome to **Botanical Battle**, a strategic AI-driven garden simulation where two distinct personalities—**Elder Bloom** and **Nightshade**—compete for dominance in a resource-constrained environment.

Built with **React 19**, **TypeScript**, and the **Canvas API**, this project explores the intersection of game mechanics, AI decision-making, and real-time visual feedback.

https://github.com/user-attachments/assets/2ae946a0-e41a-4f83-8b45-02baac242f70

### Screenshots

<img width="1402" height="1186" alt="Screenshot at Mar 22 19-52-55" src="https://github.com/user-attachments/assets/3436eb3d-a124-401b-9596-de5cba7793b5" />
<img width="1259" height="817" alt="Screenshot at Mar 22 19-53-03" src="https://github.com/user-attachments/assets/e58c40c8-4833-42a9-8401-bd2d2839592c" />
<img width="1287" height="756" alt="Screenshot at Mar 22 19-53-12" src="https://github.com/user-attachments/assets/35a364d7-341c-4920-9e98-bbe5abfa1e9f" />
<img width="1258" height="888" alt="Screenshot at Mar 22 19-53-53" src="https://github.com/user-attachments/assets/2789ffec-78fc-40c6-905a-773bd1c48e36" />
<img width="1312" height="936" alt="Screenshot at Mar 22 19-54-02" src="https://github.com/user-attachments/assets/1d82af15-f64c-4ded-a380-2a02be9350c6" />
<img width="1364" height="834" alt="Screenshot at Mar 22 19-54-14" src="https://github.com/user-attachments/assets/4ce88aa9-428d-4889-9431-868663301212" />
<img width="1262" height="1031" alt="Screenshot at Mar 22 19-54-21" src="https://github.com/user-attachments/assets/becf33b3-1181-4cbd-97d5-3091f655c64b" />

---


## Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/harishkotra/botanical-battle.git
   cd botanical-battle
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

The project follows a clean separation of concerns:

- **Game Engine (`/src/engine.ts`)**: A deterministic state machine that processes actions (Plant, Water, Sabotage, Save) and returns the next game state.
- **AI Logic (`/src/ai.ts`)**: A heuristic-based decision engine that weights actions based on the agent's personality (e.g., "Elder Bloom" prefers defensive planting, "Nightshade" targets high-value plants).
- **UI Components (`/src/components`)**: 
  - `GameGrid`: High-performance rendering using the HTML5 Canvas API.
  - `Leaderboard`: Persistent battle history using LocalStorage.
  - `Settings`: Configuration for AI providers and agent personalities.

### AI Decision Making Snippet
```typescript
// From /src/ai.ts
const isAggressive = personality.includes('sabotage') || personality.includes('aggressive');

if (isAggressive && water >= COSTS.sabotage) {
  // Target high-value opponent plants first
  const highValueOpponentPlants = opponentPlants.filter(([x, y]) => {
    const cell = grid[y][x];
    return (cell.type === 'tree' || cell.type === 'vine') && cell.stage !== 'bloom';
  });

  if (highValueOpponentPlants.length > 0) {
    return { agentId, type: 'sabotage_weed', target: highValueOpponentPlants[0] };
  }
}
```

---

## Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Rendering**: HTML5 Canvas API
- **Build Tool**: Vite

---

## Key Features

- **AI Personalities**: 
  - **Elder Bloom**: Focuses on long-term growth and defensive planting.
  - **Nightshade**: Aggressive sabotage and resource theft.
- **Drought Visuals**: The grid dimming and fog effect when water levels drop below 10 units.
- **Battle History**: A detailed leaderboard tracking scores, winners, and key stats (planted, watered, stolen).
- **Customizable AI**: Support for multiple AI providers (Gemini, OpenAI, Ollama) via the Settings menu.

---

## Contributing

We welcome contributions! Here are some ideas for new features:
1. **Multiplayer Mode**: Replace one AI agent with a human player.
2. **Weather Systems**: Add rain (free water) or heatwaves (faster water depletion).
3. **New Plant Types**: Implement "Cactus" (low water, low score) or "Sunflowers" (generates water).
4. **Visual Upgrades**: Add particle effects for watering and sabotage.

### How to contribute:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
