import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, ArrowLeft, Info, Droplets, Sprout, Skull, Zap } from 'lucide-react';
import { BattleResult } from '../types';

interface LeaderboardProps {
  results: BattleResult[];
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ results, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Back to Garden
        </button>
        <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
          <Trophy size={32} className="text-amber-500" /> Battle History
        </h1>
      </div>

      <div className="bg-white rounded-[40px] shadow-xl border border-stone-100 overflow-hidden">
        {results.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mx-auto">
              <Trophy size={32} />
            </div>
            <p className="text-stone-400 font-medium">No battles recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">Date</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">Scores</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">Winner</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">Winning Stats</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => {
                  const winnerId = result.scoreA > result.scoreB ? 'A' : 'B';
                  const winnerStats = result.stats?.[winnerId];

                  return (
                    <motion.tr
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-stone-600 font-medium text-sm">
                          <Calendar size={14} className="text-stone-300" />
                          {new Date(result.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <span className={`text-lg font-bold ${result.scoreA >= result.scoreB ? 'text-emerald-600' : 'text-stone-400'}`}>
                              {result.scoreA}
                            </span>
                            <div className="text-[8px] font-bold text-stone-300 uppercase">{result.nameA || 'Agent A'}</div>
                          </div>
                          <span className="text-stone-200">/</span>
                          <div className="text-center">
                            <span className={`text-lg font-bold ${result.scoreB >= result.scoreA ? 'text-lime-600' : 'text-stone-400'}`}>
                              {result.scoreB}
                            </span>
                            <div className="text-[8px] font-bold text-stone-300 uppercase">{result.nameB || 'Agent B'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          result.winner === 'Draw' 
                            ? 'bg-stone-100 text-stone-500' 
                            : result.scoreA > result.scoreB 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-lime-100 text-lime-700'
                        }`}>
                          {result.winner}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {winnerStats ? (
                          <div className="flex items-center gap-4 text-stone-500">
                            <div className="flex items-center gap-1" title="Planted">
                              <Sprout size={12} className="text-emerald-400" />
                              <span className="text-xs font-bold">{winnerStats.planted}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Watered">
                              <Droplets size={12} className="text-blue-400" />
                              <span className="text-xs font-bold">{winnerStats.watered}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Water Stolen">
                              <Zap size={12} className="text-amber-400" />
                              <span className="text-xs font-bold">{winnerStats.stolen}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Weeds Planted">
                              <Skull size={12} className="text-stone-400" />
                              <span className="text-xs font-bold">{winnerStats.weeds}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-300 text-xs italic">No stats</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
