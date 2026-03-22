import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, ArrowLeft, Key, Bot, Palette, Globe } from 'lucide-react';
import { AISettings, AgentConfig, ProviderType } from '../types';

interface SettingsProps {
  aiSettings: AISettings;
  agentConfigs: { A: AgentConfig; B: AgentConfig };
  onSave: (aiSettings: AISettings, agentConfigs: { A: AgentConfig; B: AgentConfig }) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ aiSettings, agentConfigs, onSave, onBack }) => {
  const [localAISettings, setLocalAISettings] = React.useState<AISettings>(aiSettings);
  const [localAgentConfigs, setLocalAgentConfigs] = React.useState<{ A: AgentConfig; B: AgentConfig }>(agentConfigs);

  const handleSave = () => {
    onSave(localAISettings, localAgentConfigs);
    onBack();
  };

  const renderTraits = (agentId: 'A' | 'B') => {
    const traits = localAgentConfigs[agentId].traits;
    const setTraits = (newTraits: Partial<typeof traits>) => {
      setLocalAgentConfigs({
        ...localAgentConfigs,
        [agentId]: {
          ...localAgentConfigs[agentId],
          traits: { ...traits, ...newTraits }
        }
      });
    };

    return (
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Aggression</label>
            <span className="text-xs font-mono font-bold text-stone-600">{traits.aggression}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.aggression}
            onChange={(e) => setTraits({ aggression: parseInt(e.target.value) })}
            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Growth Focus</label>
            <span className="text-xs font-mono font-bold text-stone-600">{traits.growthFocus}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.growthFocus}
            onChange={(e) => setTraits({ growthFocus: parseInt(e.target.value) })}
            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Sabotage Tendency</label>
            <span className="text-xs font-mono font-bold text-stone-600">{traits.sabotageTendency}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.sabotageTendency}
            onChange={(e) => setTraits({ sabotageTendency: parseInt(e.target.value) })}
            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Back to Battle
        </button>
        <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
          <SettingsIcon size={32} className="text-stone-400" /> Configuration
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Provider Settings */}
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-stone-100 space-y-6">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Globe size={20} className="text-blue-500" /> AI Provider
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Provider</label>
              <select
                value={localAISettings.provider}
                onChange={(e) => setLocalAISettings({ ...localAISettings, provider: e.target.value as ProviderType })}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none"
              >
                <option value="gemini">Google Gemini (Default)</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>

            {localAISettings.provider !== 'ollama' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">API Key</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input
                    type="password"
                    value={localAISettings.apiKey}
                    onChange={(e) => setLocalAISettings({ ...localAISettings, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none"
                  />
                </div>
              </div>
            )}

            {(localAISettings.provider === 'ollama' || localAISettings.provider === 'openrouter') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Base URL</label>
                <input
                  type="text"
                  value={localAISettings.baseUrl || ''}
                  onChange={(e) => setLocalAISettings({ ...localAISettings, baseUrl: e.target.value })}
                  placeholder={localAISettings.provider === 'ollama' ? 'http://localhost:11434' : 'https://openrouter.ai/api/v1'}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Model Name</label>
              <input
                type="text"
                value={localAISettings.model || ''}
                onChange={(e) => setLocalAISettings({ ...localAISettings, model: e.target.value })}
                placeholder="e.g. gpt-4, gemini-pro, llama3"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Agent Personalities */}
        <div className="space-y-8">
          {/* Agent A */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-stone-100 space-y-6">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Bot size={20} className="text-emerald-500" /> {localAgentConfigs.A.name} Configuration
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Name</label>
                <input
                  type="text"
                  value={localAgentConfigs.A.name}
                  onChange={(e) => setLocalAgentConfigs({ ...localAgentConfigs, A: { ...localAgentConfigs.A, name: e.target.value } })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Personality & Strategy</label>
                <textarea
                  value={localAgentConfigs.A.personality}
                  onChange={(e) => setLocalAgentConfigs({ ...localAgentConfigs, A: { ...localAgentConfigs.A, personality: e.target.value } })}
                  rows={3}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none resize-none"
                />
              </div>
              {renderTraits('A')}
            </div>
          </div>

          {/* Agent B */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-stone-100 space-y-6">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Bot size={20} className="text-lime-500" /> {localAgentConfigs.B.name} Configuration
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Name</label>
                <input
                  type="text"
                  value={localAgentConfigs.B.name}
                  onChange={(e) => setLocalAgentConfigs({ ...localAgentConfigs, B: { ...localAgentConfigs.B, name: e.target.value } })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Personality & Strategy</label>
                <textarea
                  value={localAgentConfigs.B.personality}
                  onChange={(e) => setLocalAgentConfigs({ ...localAgentConfigs, B: { ...localAgentConfigs.B, personality: e.target.value } })}
                  rows={3}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none resize-none"
                />
              </div>
              {renderTraits('B')}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={handleSave}
          className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-stone-800 transition-all flex items-center gap-2"
        >
          <Save size={20} /> Save Configuration
        </button>
      </div>
    </div>
  );
};

export default Settings;
