import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Trophy, 
  Info, 
  ScrollText,
  Settings as SettingsIcon
} from 'lucide-react';
import { GameState, Action, BattleResult, AISettings, AgentConfig } from './types';
import { createInitialState, processAction } from './engine';
import { getAgentAction } from './ai';
import GameGrid from './components/GameGrid';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';

export default function App() {
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('botanical_ai_settings');
    return saved ? JSON.parse(saved) : { provider: 'gemini', apiKey: '' };
  });
  const [agentConfigs, setAgentConfigs] = useState<{ A: AgentConfig; B: AgentConfig }>(() => {
    const saved = localStorage.getItem('botanical_agent_configs');
    if (saved) return JSON.parse(saved);
    return {
      A: {
        name: 'Elder Bloom',
        personality: 'The Master Gardener: Focuses on high-scoring trees and long-term growth. Peaceful unless provoked by water theft.',
        traits: { aggression: 10, growthFocus: 90, sabotageTendency: 5 },
        color: '#4CAF50'
      },
      B: {
        name: 'Nightshade',
        personality: 'The Scorched Earth: Aggressive strategy focusing on fast-growing flowers and frequent sabotage with weeds and water theft.',
        traits: { aggression: 80, growthFocus: 30, sabotageTendency: 70 },
        color: '#8BC34A'
      }
    };
  });

  const [state, setState] = useState<GameState>(() => createInitialState(agentConfigs));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [lastAction, setLastAction] = useState<Action | undefined>();
  const [view, setView] = useState<'game' | 'leaderboard' | 'settings'>('game');
  const [results, setResults] = useState<BattleResult[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('botanical_battle_results');
    if (saved) {
      try {
        setResults(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse results', e);
      }
    }
  }, []);

  const saveResult = useCallback((finalState: GameState) => {
    const winner = finalState.scores.A > finalState.scores.B ? agentConfigs.A.name : 
                 finalState.scores.B > finalState.scores.A ? agentConfigs.B.name : 'Draw';
    
    const newResult: BattleResult = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      scoreA: finalState.scores.A,
      scoreB: finalState.scores.B,
      nameA: agentConfigs.A.name,
      nameB: agentConfigs.B.name,
      winner,
      stats: finalState.stats
    };
    const updated = [newResult, ...results].slice(0, 50);
    setResults(updated);
    localStorage.setItem('botanical_battle_results', JSON.stringify(updated));
  }, [results, agentConfigs]);

  const handleNextTurn = useCallback(() => {
    if (state.isGameOver) {
      setIsPlaying(false);
      return;
    }

    const action = getAgentAction(state, state.currentAgent, aiSettings);
    setLastAction(action);
    const newState = processAction(state, action);
    setState(newState);

    if (newState.isGameOver) {
      setIsPlaying(false);
      saveResult(newState);
      setShowGameOver(true);
    }
  }, [state, saveResult, aiSettings]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !state.isGameOver) {
      timer = setInterval(handleNextTurn, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, state.isGameOver, handleNextTurn, speed]);

  const resetGame = () => {
    setState(createInitialState(agentConfigs));
    setIsPlaying(false);
    setLastAction(undefined);
    setShowGameOver(false);
  };

  const handleSaveSettings = (newAiSettings: AISettings, newAgentConfigs: { A: AgentConfig; B: AgentConfig }) => {
    setAiSettings(newAiSettings);
    setAgentConfigs(newAgentConfigs);
    localStorage.setItem('botanical_ai_settings', JSON.stringify(newAiSettings));
    localStorage.setItem('botanical_agent_configs', JSON.stringify(newAgentConfigs));
    setState(createInitialState(newAgentConfigs));
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-stone-800 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span className="text-emerald-600 italic">Botanical</span> Battle
          </h1>
          <p className="text-stone-500 font-medium">AI Garden Simulation • Turn {state.turn}/50</p>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm">
            <button
              onClick={() => setView('game')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'game' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              Garden
            </button>
            <button
              onClick={() => setView('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'leaderboard' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              History
            </button>
            <button
              onClick={() => setView('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'settings' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              <SettingsIcon size={14} />
            </button>
          </nav>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-stone-200">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={state.isGameOver || view !== 'game'}
              className={`p-3 rounded-xl transition-all ${
                isPlaying ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              } hover:scale-105 disabled:opacity-50`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={handleNextTurn}
              disabled={isPlaying || state.isGameOver || view !== 'game'}
              className="p-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all disabled:opacity-50"
            >
              <SkipForward size={24} />
            </button>
            <button
              onClick={resetGame}
              className="p-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'leaderboard' ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Leaderboard results={results} onBack={() => setView('game')} />
          </motion.div>
        ) : view === 'settings' ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Settings 
              aiSettings={aiSettings} 
              agentConfigs={agentConfigs} 
              onSave={handleSaveSettings} 
              onBack={() => setView('game')} 
            />
          </motion.div>
        ) : (
          <motion.main 
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Stats & Log */}
            <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
              {/* Water Levels */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <Droplets size={14} /> Water Reserves
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-emerald-700">{agentConfigs.A.name}</span>
                      <span>{state.water.A}u</span>
                    </div>
                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(state.water.A * 2, 100)}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-lime-700">{agentConfigs.B.name}</span>
                      <span>{state.water.B}u</span>
                    </div>
                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(state.water.B * 2, 100)}%` }}
                        className="h-full bg-lime-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                  <Trophy size={14} /> Current Scores
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">{state.scores.A}</div>
                    <div className="text-[10px] uppercase font-bold text-stone-400">{agentConfigs.A.name}</div>
                  </div>
                  <div className="text-center border-l border-stone-800">
                    <div className="text-3xl font-bold text-lime-400">{state.scores.B}</div>
                    <div className="text-[10px] uppercase font-bold text-stone-400">{agentConfigs.B.name}</div>
                  </div>
                </div>
              </div>

              {/* Turn Log */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 h-[300px] flex flex-col">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                  <ScrollText size={14} /> Action Log
                </h2>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {state.logs.map((log, i) => (
                      <motion.div
                        key={`${state.turn}-${i}-${log}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-sm p-2 rounded-lg ${
                          i === 0 ? 'bg-stone-50 font-medium border-l-2 border-emerald-500' : 'text-stone-400'
                        }`}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Center Column: Grid */}
            <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
              <GameGrid grid={state.grid} lastAction={lastAction} water={state.water} />
              
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#E91E63]" /> Flower (1-3pt)</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#9C27B0]" /> Vine (2-5pt)</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#795548]" /> Tree (5-15pt)</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#212121]" /> Weed (Sabotage)</div>
              </div>
            </div>

            {/* Right Column: Personas & Rules */}
            <div className="lg:col-span-3 space-y-6 order-3">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <Info size={14} /> AI Personas
                </h2>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h3 className="text-sm font-bold text-emerald-800">{agentConfigs.A.name}</h3>
                    <p className="text-xs text-emerald-600 mt-1 italic">"{agentConfigs.A.personality}"</p>
                  </div>
                  <div className="p-3 bg-lime-50 rounded-2xl border border-lime-100">
                    <h3 className="text-sm font-bold text-lime-800">{agentConfigs.B.name}</h3>
                    <p className="text-xs text-lime-600 mt-1 italic">"{agentConfigs.B.personality}"</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Quick Rules</h2>
                <ul className="text-xs space-y-2 text-stone-600">
                  <li>• Turn: +5 Water Units</li>
                  <li>• Plant: 2 Water (Seed)</li>
                  <li>• Water: 3 Water (Grow)</li>
                  <li>• Sabotage: 5 Water (Weed/Steal)</li>
                  <li>• Save: Skip turn (+8 Water)</li>
                </ul>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            key="game-over-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              key="game-over-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[40px] shadow-2xl max-w-md w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-stone-900">Battle Complete</h2>
                <p className="text-stone-500 mt-2">The garden has reached its final state.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-3xl">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{state.scores.A}</div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">{agentConfigs.A.name}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lime-600">{state.scores.B}</div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">{agentConfigs.B.name}</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-stone-50 p-6 rounded-3xl text-left space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} /> Winning Agent Stats
                </h3>
                {(() => {
                  const winner = state.scores.A > state.scores.B ? 'A' : 'B';
                  const stats = state.stats[winner];
                  return (
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">Planted</span>
                        <span className="text-sm font-bold text-stone-900">{stats.planted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">Watered</span>
                        <span className="text-sm font-bold text-stone-900">{stats.watered}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">Water Stolen</span>
                        <span className="text-sm font-bold text-stone-900">{stats.stolen}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">Weeds Planted</span>
                        <span className="text-sm font-bold text-stone-900">{stats.weeds}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <h3 className="text-xl font-bold text-stone-800">
                {state.scores.A === state.scores.B 
                  ? "It's a Draw!" 
                  : `${state.scores.A > state.scores.B ? agentConfigs.A.name : agentConfigs.B.name} is the Master Gardener!`}
              </h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={resetGame}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all"
                >
                  Restart Battle
                </button>
                <button
                  onClick={() => {
                    setView('leaderboard');
                    resetGame();
                  }}
                  className="w-full py-4 bg-stone-100 text-stone-700 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  View Leaderboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
