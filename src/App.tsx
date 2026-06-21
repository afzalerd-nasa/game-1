/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, CharacterCustomization, PlayerStats, ParentSettings } from './types';
import CharacterCreator from './components/CharacterCreator';
import GameWorld from './components/GameWorld';
import ParentDashboard from './components/ParentDashboard';
import MiniGames from './components/MiniGames';
import { sound } from './components/SoundEngine';
import { Play, Sparkles, ShieldAlert, Award, Clock, Heart, Star, Smile, Shield } from 'lucide-react';

export default function App() {
  // 1. Core State Managers
  const [gameState, setGameState] = useState<GameState>('START_SCREEN');
  const [character, setCharacter] = useState<CharacterCustomization>({
    gender: 'boy',
    skinColor: '#FFE3D1',
    hairStyle: 'short',
    hairColor: '#4A3B32',
    outfit: 'adventurer',
    accessory: 'none',
  });

  const [stats, setStats] = useState<PlayerStats>({
    coins: 0,
    stars: 0,
    completedTasks: 0,
    badges: [],
    lessonsProgress: {
      math: 20, // base starter XP values
      alphabet: 15,
      shapes: 25,
      vocabulary: 10,
      memory: 30,
    },
  });

  const [parentConfig, setParentConfig] = useState<ParentSettings>({
    screenTimeLimit: 15, // default 15 minutes limit to demonstrate warning easily
    screenTimeUsed: 0, // checked in seconds
    pinCode: '1234',
    soundVolume: 50,
    learningFocus: ['math', 'alphabet', 'shapes', 'memory'],
    voiceGuidance: true,
  });

  // Active loaded mini-game details
  const [activeMiniGame, setActiveMiniGame] = useState<any | null>(null);

  // Apply sound volume initialization
  useEffect(() => {
    sound.setVolume(parentConfig.soundVolume);
  }, [parentConfig.soundVolume]);

  // ==========================================
  // SCREEN TIME TIMER DEMONSTRATION ENGINE
  // ==========================================
  useEffect(() => {
    const clock = setInterval(() => {
      // Screen time ticks if in active gameplay
      const activeState = gameState === 'GAME_PLAY' || gameState === 'CHARACTER_CREATOR';
      
      if (activeState && parentConfig.screenTimeLimit > 0) {
        setParentConfig((prev) => {
          const updatedUsed = prev.screenTimeUsed + 1;
          const limitSeconds = prev.screenTimeLimit * 60;

          if (updatedUsed >= limitSeconds) {
            // Screen time exhausted! Trigger sleeping dragon block
            setGameState('GAME_OVER_SCREEN_TIME');
            sound.stopBackgroundMusic();
            sound.playIncorrect();
            sound.speak("Time's up! Let's take a screen break and play with real toys!", prev.voiceGuidance);
          }

          return {
            ...prev,
            screenTimeUsed: updatedUsed,
          };
        });
      }
    }, 1000);

    return () => clearInterval(clock);
  }, [gameState, parentConfig.screenTimeLimit]);

  // ==========================================
  // ACTIONS / TRIGGERS
  // ==========================================
  const handleStartGame = () => {
    sound.playJump();
    setGameState('CHARACTER_CREATOR');
  };

  const handleSaveAvatar = () => {
    sound.playCorrect();
    // Speak a fun kid welcoming phrase
    sound.speak("Adventure awaits! Welcome to Magic Kids World!", parentConfig.voiceGuidance);
    setGameState('GAME_PLAY');
  };

  const handleUpdateScreenSettings = (updated: ParentSettings) => {
    setParentConfig(updated);
    
    // Check if parent increased time limit during game over, allowing immediate recovery!
    const limitSec = updated.screenTimeLimit * 60;
    if (updated.screenTimeUsed < limitSec || updated.screenTimeLimit === 0) {
      if (gameState === 'GAME_OVER_SCREEN_TIME') {
        setGameState('GAME_PLAY');
        sound.playCorrect();
      }
    }
  };

  const handleAddGameScore = (category: 'math' | 'alphabet' | 'shapes' | 'vocabulary' | 'memory', xpGained: number) => {
    setStats((prev) => {
      const currentXP = prev.lessonsProgress[category];
      const updatedProgress = {
        ...prev.lessonsProgress,
        [category]: Math.min(100, currentXP + xpGained),
      };

      // Check badge reward goals
      let freshBadges = [...prev.badges];
      if (category === 'math' && !freshBadges.includes('math_wizard')) {
        freshBadges.push('math_wizard');
      } else if (category === 'alphabet' && !freshBadges.includes('abc_champion')) {
        freshBadges.push('abc_champion');
      } else if (category === 'shapes' && !freshBadges.includes('shape_matcher')) {
        freshBadges.push('shape_matcher');
      }

      return {
        ...prev,
        completedTasks: prev.completedTasks + 1,
        lessonsProgress: updatedProgress,
        badges: freshBadges,
      };
    });
  };

  const handleAddCoins = (amount: number) => {
    setStats(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleAddStars = (amount: number) => {
    setStats(prev => ({ ...prev, stars: prev.stars + amount }));
  };

  return (
    <div id="game-core-viewport" className="min-h-screen bg-gradient-to-b from-[#a0e0ff] via-[#f2ecd3] to-[#c9dfc3] font-sans text-stone-800 flex items-center justify-center p-3 md:p-6 select-none relative overflow-hidden">
      
      {/* Decorative Natural Backdrop Hills */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#94c387] via-[#a2d195] to-transparent pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full bg-[#87b97a]/30 blur-2xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -right-10 w-96 h-96 rounded-full bg-[#9dc98f]/40 blur-2xl pointer-events-none -z-10" />

      {/* A: WELCOME / START SCREEN */}
      {gameState === 'START_SCREEN' && (
        <div id="start-screen" className="max-w-2xl w-full text-center bg-[#faf6ee] rounded-[36px] p-8 border-4 border-[#8d6e63] shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)] relative overflow-hidden transition-all">
          {/* Animated visual elements */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#81c784] via-[#ffb74d] to-[#ffd54f] animate-pulse" />
          
          <div className="absolute top-6 left-6 text-[#ff8a65] animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <div className="absolute top-10 right-8 text-[#ffd54f] animate-pulse">
            <Star className="w-10 h-10 fill-[#ffd54f]" />
          </div>
 
          <span className="bg-[#e8f5e9] text-[#2ebd3e] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#c8e6c9]">
            Child Safe & Family Friendly 🧸
          </span>

          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight drop-shadow-sm bg-gradient-to-r from-[#215a36] via-[#48956e] to-[#945f3c] bg-clip-text text-transparent font-display">
            Magic Kids World
          </h1>
          <p className="text-stone-600 text-sm md:text-base mt-2 font-semibold">
            A creative 3D open-world adventure designed to make learning colorful & fun for children!
          </p>

          {/* Cute banner preview illustration */}
          <div className="my-8 py-10 px-6 bg-gradient-to-br from-[#f1f8e9] to-[#fff8e1] border-4 border-dashed border-[#b6dca5] rounded-[24px] flex items-center justify-center gap-10">
            <div className="flex flex-col items-center">
              <span className="text-4xl animate-bounce">🦄</span>
              <p className="text-[10px] uppercase font-black text-stone-600 mt-1">Ride Animals</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl animate-pulse">🏰</span>
              <p className="text-[10px] uppercase font-black text-stone-600 mt-1">Quiz Desks</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl animate-bounce">🎈</span>
              <p className="text-[10px] uppercase font-black text-stone-600 mt-1">Balloon Pops</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl animate-wiggle">🦖</span>
              <p className="text-[10px] uppercase font-black text-stone-600 mt-1">Rescue Pets</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleStartGame}
              className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-[#ff8a65] to-[#ffb74d] hover:from-[#ff7043] hover:to-[#ffa726] text-white font-black rounded-2xl active:scale-95 transition shadow-lg hover:shadow-xl text-lg tracking-wide border-b-6 border-[#d84315] font-display"
            >
              Play & Learn Now! 🎮
            </button>
            <p className="text-xs text-stone-500">
              Parents: Verify screen time limits or view report cards anytime with the <br />
              <span className="font-extrabold text-[#795548]">Parent Guard 🛡️</span> button.
            </p>
          </div>
        </div>
      )}

      {/* B: CHARACTER CREATION SCENE */}
      {gameState === 'CHARACTER_CREATOR' && (
        <CharacterCreator
          customization={character}
          onUpdate={setCharacter}
          onSave={handleSaveAvatar}
        />
      )}

      {/* C: CORE GAMEPLAY SCENE */}
      {gameState === 'GAME_PLAY' && (
        <div className="max-w-4xl w-full space-y-4">
          <GameWorld
            customization={character}
            stats={stats}
            settings={parentConfig}
            onUpdateStats={setStats}
            onOpenParent={() => setGameState('PARENT_DASHBOARD')}
            onPlayMiniGame={(type) => setActiveMiniGame({ type })}
          />
        </div>
      )}

      {/* D: INTERACTIVE PLAY MINIGAMES DESK OVERLAYS */}
      {activeMiniGame && (
        <MiniGames
          gameType={activeMiniGame.type}
          focusCourse={parentConfig.learningFocus}
          onAddScore={handleAddGameScore}
          onAddCoins={handleAddCoins}
          onAddStars={handleAddStars}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* E: PARENT CONSOLE WRAPPER */}
      {gameState === 'PARENT_DASHBOARD' && (
        <ParentDashboard
          settings={parentConfig}
          stats={stats}
          onUpdateSettings={handleUpdateScreenSettings}
          onClose={() => setGameState('GAME_PLAY')}
        />
      )}

      {/* F: SCREEN-TIME EXHAUSTION OVERLAY */}
      {gameState === 'GAME_OVER_SCREEN_TIME' && (
        <div id="screen-break-blocker" className="max-w-lg w-full bg-[#faf6ee] rounded-[36px] p-8 border-4 border-[#8d6e63] text-center shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)] relative overflow-hidden">
          {/* Wave top border */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#ffe082] via-[#ffb74d] to-[#d84315]" />

          <div className="mx-auto w-24 h-24 bg-[#f1f8e9] rounded-full flex items-center justify-center text-5xl mb-4 animate-bounce">
            😴💤
          </div>

          <h2 className="text-3xl font-black text-stone-800 tracking-tight font-display">Time to Rest Your Eyes!</h2>
          <p className="text-stone-600 text-sm mt-2 leading-relaxed font-semibold">
            Your family screen time limit has been reached. Let's wave goodbye to Magic Kids World for today, play with physical toys, or read a book!
          </p>

          {/* Today's achievements progress card */}
          <div className="my-6 p-4 bg-[#f5eedc] rounded-2xl border-2 border-dashed border-[#d7ccc8]">
            <h4 className="text-xs uppercase font-extrabold text-[#8d6e63] mb-2">Today's Grand Rewards</h4>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-2xl">🪙</p>
                <p className="text-base font-black text-[#5c4033]">{stats.coins} Coins</p>
              </div>
              <div className="border-r border-[#d7ccc8] h-10 my-auto" />
              <div>
                <p className="text-2xl">⭐</p>
                <p className="text-base font-black text-[#5c4033]">{stats.stars} Stars</p>
              </div>
              <div className="border-r border-[#d7ccc8] h-10 my-auto" />
              <div>
                <p className="text-2xl">🏆</p>
                <p className="text-base font-black text-[#5c4033]">{stats.completedTasks} Tasks</p>
              </div>
            </div>
          </div>

          {/* Option for parents to bypass screen blocker lock */}
          <button
            onClick={() => setGameState('PARENT_DASHBOARD')}
            className="w-full py-3 bg-[#8d6e63] hover:bg-[#795548] text-white font-extrabold rounded-xl transition duration-200 active:scale-95 text-xs uppercase tracking-wider shadow border-b-4 border-[#4e342e]"
          >
            🛡️ Parents: Increase Time / Adjust settings
          </button>
        </div>
      )}

    </div>
  );
}
