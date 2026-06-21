import React, { useState } from 'react';
import { ParentSettings, PlayerStats, BADGES_LIST } from '../types';
import { Shield, Clock, Award, BookOpen, Volume2, CheckCircle, Lock, Play, Activity } from 'lucide-react';

interface ParentDashboardProps {
  settings: ParentSettings;
  stats: PlayerStats;
  onUpdateSettings: (settings: ParentSettings) => void;
  onClose: () => void;
}

export default function ParentDashboard({
  settings,
  stats,
  onUpdateSettings,
  onClose,
}: ParentDashboardProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Quick verification checks for parents (simple PIN security "1234")
  const handleVerifyPin = (num?: string) => {
    let finalPin = pinInput;
    if (num !== undefined) {
      finalPin = pinInput + num;
      setPinInput(finalPin);
    }
    
    if (finalPin.length === 4) {
      if (finalPin === settings.pinCode) {
        setPinVerified(true);
        setPinError(false);
      } else {
        setPinError(true);
        setPinInput('');
      }
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinError(false);
  };

  const toggleFocus = (topic: string) => {
    const focus = [...settings.learningFocus];
    if (focus.includes(topic)) {
      onUpdateSettings({
        ...settings,
        learningFocus: focus.filter((f) => f !== topic),
      });
    } else {
      onUpdateSettings({
        ...settings,
        learningFocus: [...focus, topic],
      });
    }
  };

  const handleTimeLimitChange = (minutes: number) => {
    onUpdateSettings({
      ...settings,
      screenTimeLimit: minutes,
    });
  };

  if (!pinVerified) {
    return (
      <div id="parent-lock-modal" className="fixed inset-0 z-50 bg-gradient-to-b from-[#a0e0ff] via-[#f2ecd3] to-[#c9dfc3] flex items-center justify-center p-4 overflow-auto">
        <div className="bg-[#faf6ee] rounded-[36px] p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)] border-4 border-[#8d6e63] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#81c784] via-[#ffb74d] to-[#ffd54f]" />
          
          <div className="mx-auto w-16 h-16 bg-[#f1f8e9] rounded-full flex items-center justify-center text-[#ff8a65] mb-4 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mb-2 font-display">Parent Verification</h2>
          <p className="text-stone-600 text-sm mb-6 font-semibold">
            Please enter your 4-digit PIN code <br />
            <span className="text-xs font-mono text-[#8d6e63]">(Default: 1234)</span>
          </p>

          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-xl border-4 ${
                  pinError
                    ? 'border-red-400 bg-red-50'
                    : pinInput.length > i
                    ? 'border-[#66bb6a] bg-[#e8f5e9] text-[#2e7d32]'
                    : 'border-[#d7ccc8] bg-white text-stone-800'
                } flex items-center justify-center text-xl font-bold font-mono`}
              >
                {pinInput.length > i ? '★' : ''}
              </div>
            ))}
          </div>

          {pinError && (
            <p className="text-red-500 text-sm mb-4 font-semibold animate-shake">Incorrect PIN! Try again.</p>
          )}

          {/* Simple kid-friendly larger PIN locked pad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleVerifyPin(num)}
                className="py-3 bg-[#f5ebd6] hover:bg-[#ebd9bd] active:scale-95 text-xl font-bold font-mono rounded-xl text-[#5c4033] border-b-4 border-[#d7ccc8] transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClearPin}
              className="py-3 bg-red-100 hover:bg-red-200 text-red-600 font-extrabold rounded-xl text-sm border-b-4 border-red-300"
            >
              Clear
            </button>
            <button
              onClick={() => handleVerifyPin('0')}
              className="py-3 bg-[#f5ebd6] hover:bg-[#ebd9bd] text-xl font-bold font-mono rounded-xl text-[#5c4033] border-b-4 border-[#d7ccc8]"
            >
              0
            </button>
            <button
              onClick={onClose}
              className="py-3 bg-[#e8f5e9] hover:bg-[#d8edd9] text-[#2c662e] font-extrabold rounded-xl text-sm border-b-4 border-[#a5d6a7]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages/progress bars
  const totalScreenTimePercent = settings.screenTimeLimit > 0
    ? Math.min(100, Math.floor((settings.screenTimeUsed / (settings.screenTimeLimit * 60)) * 100))
    : 0;

  const activeLessons = [
    { key: 'math', label: 'Mathematics (Counting, Subtraction, Math Facts)', score: stats.lessonsProgress.math, color: 'bg-emerald-500', barColor: 'from-[#81c784] to-[#4caf50]' },
    { key: 'alphabet', label: 'English & Spelling (Vocabulary, Word construction)', score: stats.lessonsProgress.alphabet, color: 'bg-[#5c4033]', barColor: 'from-[#a1887f] to-[#795548]' },
    { key: 'shapes', label: 'Shapes & Patterns (Cognitive structure)', score: stats.lessonsProgress.shapes, color: 'bg-[#ffb74d]', barColor: 'from-[#ffcc80] to-[#ffa726]' },
    { key: 'vocabulary', label: 'General Knowledge & Word Search', score: stats.lessonsProgress.vocabulary, color: 'bg-[#4a5d4e]', barColor: 'from-[#8fbc8f] to-[#4a5d4e]' },
    { key: 'memory', label: 'Memory & Speed (Brain challenges)', score: stats.lessonsProgress.memory, color: 'bg-[#ff8a65]', barColor: 'from-[#ffab91] to-[#ff7043]' }
  ];

  return (
    <div id="parent-dashboard-overlay" className="fixed inset-0 z-50 bg-gradient-to-b from-[#a0e0ff]/90 via-[#f2ecd3]/95 to-[#c9dfc3]/95 backdrop-blur-md overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-[#faf6ee] rounded-[36px] border-4 border-[#8d6e63] shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)] relative overflow-hidden my-4">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#4a5d4e] via-[#8fbc8f] to-[#8d6e63] px-6 py-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Shield className="w-48 h-48" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-white/20 text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full text-white/95">
                Safe Mode Parent Console
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1 font-display">Magic Kids World Dashboard</h1>
              <p className="text-stone-100 text-sm mt-1 font-semibold">
                Monitor learning statistics, tweak screen intervals, and configure kid safety settings.
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white hover:bg-stone-100 text-[#4a5d4e] font-black py-2.5 px-6 rounded-2xl active:scale-95 transition shadow"
            >
              Resume Game 🎮
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* LEFT PANEL - Play settings & Limits */}
          <div className="md:col-span-1 space-y-6">
            {/* Screen Time Limit widget */}
            <div className="bg-[#fcfaf2] rounded-[24px] p-5 border border-[#ebdcb9] shadow-sm">
              <div className="flex items-center gap-3 text-stone-800 font-bold mb-4 font-display">
                <Clock className="w-5 h-5 text-[#8d6e63]" />
                <h3>Screen Time Control</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>Limit per session:</span>
                    <span className="font-extrabold text-[#8d6e63]">
                      {settings.screenTimeLimit === 0 ? 'Unlimited Plan' : `${settings.screenTimeLimit} Minutes`}
                    </span>
                  </div>
                  
                  {/* Quick screen buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {[5, 15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleTimeLimitChange(mins)}
                        className={`py-2 text-xs font-bold rounded-xl border-2 transition ${
                          settings.screenTimeLimit === mins
                            ? 'border-[#66bb6a] bg-[#e8f5e9] text-[#2e7d32] font-extrabold shadow-sm'
                            : 'border-[#d7ccc8] bg-white hover:border-[#bcaaa4] text-stone-600'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                    <button
                      onClick={() => handleTimeLimitChange(0)}
                      className={`py-2 text-xs font-bold rounded-xl border-2 col-span-2 transition ${
                        settings.screenTimeLimit === 0
                          ? 'border-[#66bb6a] bg-[#e8f5e9] text-[#2e7d32] font-extrabold shadow-sm'
                          : 'border-[#d7ccc8] bg-white hover:border-[#bcaaa4] text-stone-600'
                      }`}
                    >
                      Unlimited Play
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#ebdcb9] pt-4">
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>Time consumed:</span>
                    <span className="font-bold">{Math.floor(settings.screenTimeUsed / 60)}m / {settings.screenTimeLimit === 0 ? 'Unlimited' : `${settings.screenTimeLimit}m`}</span>
                  </div>
                  <div className="w-full bg-[#ebdcb9]/45 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#66bb6a] h-full transition-all duration-500"
                      style={{ width: `${settings.screenTimeLimit > 0 ? totalScreenTimePercent : 15}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* General audio guidelines / Voice Guidance toggle */}
            <div className="bg-[#fcfaf2] rounded-[24px] p-5 border border-[#ebdcb9] shadow-sm">
              <div className="flex items-center gap-3 text-stone-800 font-bold mb-4 font-display">
                <Volume2 className="w-5 h-5 text-[#8d6e63]" />
                <h3>Audio Guidance</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.voiceGuidance}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        voiceGuidance: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-[#d7ccc8] text-[#66bb6a] focus:ring-[#66bb6a]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-stone-800 font-display">TTS Voice Assist</span>
                    <p className="text-xs text-stone-500">Speaks spelling puzzles/instructions out loud!</p>
                  </div>
                </label>

                <div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>System Sound Volume: {settings.soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        soundVolume: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-1.5 bg-[#ebdcb9]/40 rounded-full appearance-none cursor-pointer accent-[#66bb6a]"
                  />
                </div>
              </div>
            </div>

            {/* Subject Filters */}
            <div className="bg-[#fdfbf7] rounded-[24px] p-5 border border-[#eee5cc] bg-gradient-to-br from-[#f1f8e9]/50 to-[#fffef4]/30">
              <div className="flex items-center gap-3 text-stone-800 font-bold mb-3 font-display">
                <BookOpen className="w-5 h-5 text-[#ff7043]" />
                <h3>Focus Curriculum</h3>
              </div>
              <p className="text-xs text-stone-500 mb-4 font-semibold">Select active learning categories for special focus items:</p>
              <div className="space-y-2">
                {['math', 'alphabet', 'shapes', 'vocabulary', 'memory'].map((topic) => {
                  const isChecked = settings.learningFocus.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleFocus(topic)}
                      className={`flex items-center justify-between w-full py-2 px-3 rounded-xl border text-left transition ${
                        isChecked
                          ? 'bg-white border-[#8fbc8f] text-[#2c662e] font-extrabold shadow-sm'
                          : 'bg-transparent border-[#d7ccc8] text-stone-500 hover:border-[#bcaaa4]'
                      }`}
                    >
                      <span className="text-xs uppercase font-extrabold tracking-wide">{topic}</span>
                      {isChecked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-[#d7ccc8]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Statistics, Scores, Badges progress */}
          <div className="md:col-span-2 space-y-6">
            {/* Learning Status Overview */}
            <div className="bg-[#fcfaf2] rounded-[24px] p-5 border border-[#ebdcb9] shadow-sm">
              <div className="flex items-center gap-3 text-stone-800 font-bold mb-4 font-display">
                <Activity className="w-5 h-5 text-[#8d6e63]" />
                <h3>Active Cognitive Progress Report</h3>
              </div>

              <div className="space-y-5">
                {activeLessons.map((les) => (
                  <div key={les.key}>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${les.color}`} />
                        <span className="font-semibold text-stone-700">{les.label}</span>
                      </div>
                      <span className="font-extrabold text-[#5c4033]">{les.score} XP</span>
                    </div>
                    <div className="w-full bg-[#ebdcb9]/40 h-3 rounded-full overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${les.barColor} h-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(8, les.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges won panel */}
            <div className="bg-[#fcfaf2] rounded-[24px] p-5 border border-[#ebdcb9] shadow-sm">
              <div className="flex items-center gap-3 text-stone-800 font-bold mb-4 font-display">
                <Award className="w-5 h-5 text-[#8d6e63]" />
                <h3>Badges Unlocked ({stats.badges.length} / {BADGES_LIST.length})</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGES_LIST.map((badge) => {
                  const unlocked = stats.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                        unlocked
                          ? 'bg-white border-[#ebdcb9] shadow-sm'
                          : 'bg-[#f4efe1]/40 border-dashed border-[#ebdcb9] opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${
                          unlocked ? badge.color : 'bg-stone-200'
                        } flex items-center justify-center text-2xl shadow-inner`}
                      >
                        {unlocked ? badge.emoji : '🔒'}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${unlocked ? 'text-stone-800' : 'text-stone-400'}`}>
                          {badge.title}
                        </h4>
                        <p className="text-[10px] text-stone-500 leading-tight font-medium">
                          {unlocked ? badge.description : 'Locked'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats count indicator highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#fffdf8] border border-[#f5ebd6] rounded-[20px] p-4 text-center shadow-sm">
                <span className="text-2xl animate-wiggle inline-block">🪙</span>
                <p className="text-[10px] text-stone-500 mt-1 uppercase font-extrabold">Coins Collected</p>
                <p className="text-xl font-black text-amber-600 mt-1">{stats.coins}</p>
              </div>
              <div className="bg-[#fffef4] border border-[#eee0a4] rounded-[20px] p-4 text-center shadow-sm">
                <span className="text-2xl animate-bounce inline-block">⭐</span>
                <p className="text-[10px] text-stone-500 mt-1 uppercase font-extrabold">Stars Earned</p>
                <p className="text-xl font-black text-yellow-500 mt-1">{stats.stars}</p>
              </div>
              <div className="bg-[#f5fcf7] border border-[#c3dfcf] rounded-[20px] p-4 text-center col-span-2 sm:col-span-1 shadow-sm">
                <span className="text-2xl animate-pulse inline-block">🚀</span>
                <p className="text-[10px] text-stone-500 mt-1 uppercase font-extrabold">Tasks Completed</p>
                <p className="text-xl font-black text-emerald-600 mt-1">{stats.completedTasks}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
