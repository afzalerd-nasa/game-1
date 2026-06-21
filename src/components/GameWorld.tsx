import React, { useState, useEffect, useRef } from 'react';
import { CharacterCustomization, PlayerStats, ParentSettings, GameNPC, GameCollectible, LivePlayer, BADGES_LIST } from '../types';
import { AvatarPreview } from './CharacterCreator';
import { sound } from './SoundEngine';
import { HelpCircle, Sparkles, Navigation, Volume2, VolumeX, MessageCircle, Shield, Award, MapPin } from 'lucide-react';

interface GameWorldProps {
  customization: CharacterCustomization;
  stats: PlayerStats;
  settings: ParentSettings;
  onUpdateStats: (stats: PlayerStats) => void;
  onOpenParent: () => void;
  onPlayMiniGame: (type: 'quiz' | 'balloon' | 'rescue' | 'fishing' | 'maze') => void;
}

// Map dimensions and tile configurations
const GRID_SIZE = 12;
const TILE_WIDTH = 70;
const TILE_HEIGHT = 40;

// Hardcoded friendly safe predefined messages
const SAFE_CHAT_PHRASES = [
  'Hello friend! 👋',
  'Let\'s explore together! 🧭',
  'Wow! This area looks magical! ✨',
  'Good job! You can do it! 🌟',
  'Follow me! Let\'s go to the Castle! 🏰',
  'Look! An animal needs help! 🐱',
  'I love spelling puzzles! 🔤',
];

export default function GameWorld({
  customization,
  stats,
  settings,
  onUpdateStats,
  onOpenParent,
  onPlayMiniGame,
}: GameWorldProps) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound play toggle track
  const [musicOn, setMusicOn] = useState(false);

  // Player position model in isometric grid
  const [player, setPlayer] = useState({
    x: 4.5,
    y: 4.5,
    z: 0,
    vz: 0, // jump physics velocity
    isJumping: false,
    ridingAnimal: false,
    rideEmoji: '',
  });

  // Camera viewport panning coordinates
  const [camera, setCamera] = useState({ x: 200, y: 50 });

  // Play active chat bubble
  const [myChat, setMyChat] = useState<string | null>(null);
  const [myChatTimer, setMyChatTimer] = useState(0);

  // Items / Collectibles state
  const [collectibles, setCollectibles] = useState<GameCollectible[]>([]);
  
  // Simulated friendly multiplayer bots
  const [friends, setFriends] = useState<LivePlayer[]>([
    { id: 'bot-emma', name: 'Emma 🌸', x: 2, y: 7, z: 0, gender: 'girl', outfit: 'candy-elf', chatBubble: 'Welcome explorer!' },
    { id: 'bot-noah', name: 'Noah 🦖', x: 8, y: 3, z: 0, gender: 'boy', outfit: 'dino-hero', chatBubble: 'Rawr! Dino Park is awesome!' },
    { id: 'bot-mia', name: 'Mia 👨‍🚀', x: 5, y: 1, z: 0, gender: 'girl', outfit: 'space-suit' },
  ]);

  // NPCs database
  const [npcs] = useState<GameNPC[]>([
    { id: 'npc-barney', name: 'Barney Wizard 🧙', emoji: '🧙‍♂️', color: 'bg-purple-100 border-purple-400 text-purple-600', x: 1.5, y: 1.5, area: 'Rainbow Village', dialogue: 'Welcome to Rainbow Village! Ready for math puzzles? Try my Math challenge!', badgeToReward: 'math_wizard', hasQuest: true },
    { id: 'npc-sugar', name: 'Miss Sugar 🍬', emoji: '🧑‍🍳', color: 'bg-pink-100 border-pink-400 text-pink-600', x: 9.5, y: 1.5, area: 'Candy Forest', dialogue: 'Hello cutie! Help me match colorful canvas shapes. Would you like to play?', badgeToReward: 'shape_matcher', hasQuest: true },
    { id: 'npc-leo', name: 'Guardian Leo 🦁', emoji: '🤠', color: 'bg-amber-100 border-amber-400 text-amber-600', x: 1.5, y: 9.5, area: 'Animal Kingdom', dialogue: 'Help! Baby animals got lost from their mommies. Let\'s play Animal Rescue!', badgeToReward: 'animal_saver', hasQuest: true },
    { id: 'npc-cosmos', name: 'Cap. Cosmos 👨‍🚀', emoji: '👨‍🚀', color: 'bg-blue-100 border-blue-400 text-blue-600', x: 9.5, y: 9.5, area: 'Space Zone', dialogue: 'Cosmic Greetings. Let\'s build vocabulary and test spelling! Try my ABC quiz desk!', badgeToReward: 'abc_champion', hasQuest: true },
    { id: 'npc-marina', name: 'Marina Mermaid 🧜‍♀️', emoji: '🧜‍♀️', color: 'bg-cyan-100 border-cyan-400 text-cyan-600', x: 5.5, y: 9.5, area: 'Ocean Adventure', dialogue: 'Splash! Catch cute flying alphabet fish with my fishing hook rod!', badgeToReward: 'deep_diver', hasQuest: true },
  ]);

  // Handle active NPC selected dialogue
  const [activeNPC, setActiveNPC] = useState<GameNPC | null>(null);

  // ==========================================
  // INITIALIZE SCENE & SEED COLLECTIBLES
  // ==========================================
  useEffect(() => {
    // Seed initial coins/stars across areas
    const seededColl: GameCollectible[] = [];
    
    // Seed Coins
    for (let i = 0; i < 15; i++) {
      seededColl.push({
        id: `coin-${i}`,
        type: 'coin',
        x: Math.random() * (GRID_SIZE - 2) + 1,
        y: Math.random() * (GRID_SIZE - 2) + 1,
        z: 0,
        collected: false,
        pulseOffset: Math.random() * 10
      });
    }

    // Seed Stars
    for (let i = 0; i < 6; i++) {
      seededColl.push({
        id: `star-${i}`,
        type: 'star',
        x: Math.random() * (GRID_SIZE - 2) + 1,
        y: Math.random() * (GRID_SIZE - 2) + 1,
        z: 10,
        collected: false,
        pulseOffset: Math.random() * 10
      });
    }

    setCollectibles(seededColl);
  }, []);

  // Update background melody when button toggled
  const handleMusicToggle = () => {
    if (musicOn) {
      sound.stopBackgroundMusic();
      setMusicOn(false);
    } else {
      sound.startBackgroundMusic();
      sound.playCorrect();
      setMusicOn(true);
    }
  };

  // Close bg music on unmount
  useEffect(() => {
    return () => {
      sound.stopBackgroundMusic();
    };
  }, []);

  // ==========================================
  // 3D PHYSICS / MOVEMENT LOOP
  // ==========================================
  useEffect(() => {
    const handlePhysics = setInterval(() => {
      // 1. Handle jump physics (gravity)
      setPlayer((prev) => {
        if (!prev.isJumping) return prev;
        
        let nz = prev.z + prev.vz;
        let nvz = prev.vz - 1.2; // Gravity pull

        if (nz <= 0) {
          // Landed!
          return {
            ...prev,
            z: 0,
            vz: 0,
            isJumping: false,
          };
        }
        return {
          ...prev,
          z: nz,
          vz: nvz,
        };
      });

      // 2. Chat bubble timer decrease
      setMyChatTimer((t) => {
        if (t <= 1) {
          setMyChat(null);
          return 0;
        }
        return t - 1;
      });

      // 3. Move friendly multiplayer bots random pathings
      setFriends((prev) =>
        prev.map((bot) => {
          // 4% chance to wander
          let nx = bot.x;
          let ny = bot.y;
          if (Math.random() < 0.04) {
            nx = Math.max(0.5, Math.min(GRID_SIZE - 0.5, bot.x + (Math.random() > 0.5 ? 0.35 : -0.35)));
            ny = Math.max(0.5, Math.min(GRID_SIZE - 0.5, bot.y + (Math.random() > 0.5 ? 0.35 : -0.35)));
          }

          // 2% chance to sprout safe phrase bubble
          let bubble = bot.chatBubble;
          let timer = bot.chatTimer;
          if (Math.random() < 0.02 && !bubble) {
            bubble = SAFE_CHAT_PHRASES[Math.floor(Math.random() * SAFE_CHAT_PHRASES.length)];
          } else if (Math.random() < 0.05 && bubble) {
            bubble = undefined;
          }

          return { ...bot, x: nx, y: ny, chatBubble: bubble };
        })
      );
    }, 50);

    return () => clearInterval(handlePhysics);
  }, []);

  // ==========================================
  // CANVAS BACKGROUND DRAWING (ISOMETRIC WORLD GRAPHICS)
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize response
    canvas.width = containerRef.current?.clientWidth || 800;
    canvas.height = 450;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;

    // Draw frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient background sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#BAE6FD'); // Light ocean sky
    skyGrad.addColorStop(0.5, '#F0FDFA');
    skyGrad.addColorStop(1, '#FEF9C3'); // Soft sun set
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render floor tile grids
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      for (let gy = 0; gy < GRID_SIZE; gy++) {
        // Map screen center
        const screenX = centerX + (gx - gy) * (TILE_WIDTH / 2);
        const screenY = centerY + (gx + gy) * (TILE_HEIGHT / 2);

        // Determine specific texture colors based on magical area sector
        let tileColor = '#4ADE80'; // Default Grass
        let stripeColor = '#22C55E';

        if (gx < 4 && gy < 4) {
          // Rainbow Village (Bright lush emerald flowers)
          tileColor = '#10B981';
          stripeColor = '#059669';
        } else if (gx >= 8 && gy < 4) {
          // Candy Forest (Sugar Pink)
          tileColor = '#F472B6';
          stripeColor = '#F43F5E';
        } else if (gx < 4 && gy >= 8) {
          // Animal Kingdom (Farm Wood Brown)
          tileColor = '#F59E0B';
          stripeColor = '#D97706';
        } else if (gx >= 8 && gy >= 8) {
          // Space Exploration (Galaxy Midnight Purple)
          tileColor = '#6366F1';
          stripeColor = '#4F46E5';
        } else if (gx >= 4 && gx < 8 && gy >= 8) {
          // Ocean Adventure (Light Blue Wave)
          tileColor = '#0EA5E9';
          stripeColor = '#0284C7';
        } else if (gx >= 8 && gy >= 4 && gy < 8) {
          // Dinosaur primitive orange dirt
          tileColor = '#FB923C';
          stripeColor = '#EA580C';
        } else {
          // Center Learning Castle Majestic Stone Tiles
          tileColor = '#94A3B8';
          stripeColor = '#64748B';
        }

        // Draw isometric block points
        ctx.fillStyle = tileColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
        ctx.lineTo(screenX, screenY + TILE_HEIGHT);
        ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();

        // Draw cute grid highlight borders
        ctx.strokeStyle = stripeColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Decorate castle gate tiles
        if (gx === 6 && gy === 6) {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(screenX, screenY + 15, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw visual land barriers or trees cartoon outlines
    for (let gx = 0; gx < GRID_SIZE; gx += 2) {
      for (let gy = 0; gy < GRID_SIZE; gy += 2) {
        // Spawn pretty static elements (lollipops, castle stones) on canvas context
        const screenX = centerX + (gx - gy) * (TILE_WIDTH / 2);
        const screenY = centerY + (gx + gy) * (TILE_HEIGHT / 2);

        if (gx < 3 && gy < 3) {
          // Rainbow Village Flowers
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(screenX - 10, screenY + 5, 3, 0, Math.PI * 2);
          ctx.arc(screenX + 10, screenY, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (gx >= 9 && gy < 3) {
          // Candy Trees (lollipop stick)
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(screenX, screenY + 10);
          ctx.lineTo(screenX, screenY - 10);
          ctx.stroke();
          // candy circle ball
          ctx.fillStyle = '#EC4899';
          ctx.beginPath();
          ctx.arc(screenX, screenY - 12, 8, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

  }, [player.x, player.y]);

  // ==========================================
  // VIEWPORT CAMERA FOLLOW PROJECTION MATH
  // ==========================================
  const canvasWidth = containerRef.current?.clientWidth || 800;
  const canvasHeight = 450;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 3;

  // Project 3D vector coordinates to screen projection
  const getScreenPos = (wx: number, wy: number, wz: number = 0) => {
    const screenX = centerX + (wx - wy) * (TILE_WIDTH / 2);
    const screenY = centerY + (wx + wy) * (TILE_HEIGHT / 2) - wz;
    return { x: screenX, y: screenY };
  };

  const playerPos = getScreenPos(player.x, player.y, player.z);

  // ==========================================
  // PLAYER MOVEMENT BOUND CHECKS & TRIGGER ACTIONS
  // ==========================================
  const movePlayer = (dx: number, dy: number) => {
    let nx = player.x + dx;
    let ny = player.y + dy;

    // Safety borders checks
    if (nx >= 0 && nx <= GRID_SIZE && ny >= 0 && ny <= GRID_SIZE) {
      // Swimming check (Ocean zone boundary)
      const inWater = nx >= 4 && nx < 8 && ny >= 8;
      if (inWater) {
        sound.playSplash();
        setPlayer((prev) => ({ ...prev, x: nx, y: ny, z: -5 })); // dip slightly
        
        // Award Deep Diver badge instantly
        if (!stats.badges.includes('deep_diver')) {
          const freshBadges = [...stats.badges, 'deep_diver'];
          onUpdateStats({ ...stats, badges: freshBadges });
          sound.playRewardBadge();
        }
      } else {
        setPlayer((prev) => ({ ...prev, x: nx, y: ny, z: 0 }));
      }

      // 1. Check proximity collection rules
      handleCollectionsCheck(nx, ny);

      // 2. Check automatic wizard triggers
      detectNPCOverlap(nx, ny);
    }
  };

  const handleCollectionsCheck = (px: number, py: number) => {
    setCollectibles((prev) =>
      prev.map((c) => {
        if (c.collected) return c;
        const dx = Math.abs(c.x - px);
        const dy = Math.abs(c.y - py);
        
        // Inside collection circle
        if (dx < 0.6 && dy < 0.6) {
          if (c.type === 'coin') {
            sound.playCollectCoin();
            onUpdateStats({
              ...stats,
              coins: stats.coins + 1,
            });
          } else {
            sound.playCollectStar();
            const freshStars = stats.stars + 1;
            let freshBadges = [...stats.badges];
            if (freshStars >= 10 && !freshBadges.includes('star_collector')) {
              freshBadges.push('star_collector');
              sound.playRewardBadge();
            }
            onUpdateStats({
              ...stats,
              stars: freshStars,
              badges: freshBadges,
            });
          }
          return { ...c, collected: true };
        }
        return c;
      })
    );
  };

  const detectNPCOverlap = (px: number, py: number) => {
    // Check if player walks near any NPC
    const near = npcs.find((n) => {
      const dx = Math.abs(n.x - px);
      const dy = Math.abs(n.y - py);
      return dx < 1.1 && dy < 1.1;
    });

    if (near) {
      setActiveNPC(near);
    } else {
      setActiveNPC(null);
    }
  };

  const executeJump = () => {
    if (player.isJumping) return;
    sound.playJump();
    setPlayer((prev) => ({
      ...prev,
      isJumping: true,
      vz: 9, // Jump force velocity
    }));

    // Award first explorer badge for jumping/walking around
    if (!stats.badges.includes('first_steps')) {
      const freshBadges = [...stats.badges, 'first_steps'];
      onUpdateStats({
        ...stats,
        badges: freshBadges,
      });
      sound.playRewardBadge();
    }
  };

  const toggleRideCompanion = () => {
    sound.playRideAnimal();
    if (player.ridingAnimal) {
      setPlayer(prev => ({ ...prev, ridingAnimal: false, rideEmoji: '' }));
    } else {
      const cuteAnimalsList = ['🦖', '🦕', '🦄', '🦒', '🦁', '🐶'];
      const ride = cuteAnimalsList[Math.floor(Math.random() * cuteAnimalsList.length)];
      setPlayer(prev => ({ ...prev, ridingAnimal: true, rideEmoji: ride }));
    }
  };

  // Keyboard desktop support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeNPC) return; // Freeze during modal conversations

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(-0.25, -0.25);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0.25, 0.25);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-0.25, 0.25);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(0.25, -0.25);
          break;
        case ' ':
          executeJump();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player.x, player.y, activeNPC]);

  // Handle player sending preapproved chat phrase
  const handleSendChat = (phrase: string) => {
    sound.playPop();
    setMyChat(phrase);
    setMyChatTimer(5); // 5 sec
  };

  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-[#faf6ee] border-4 border-[#8d6e63] rounded-[36px] shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)]">
      
      {/* HUD DASHBOARD TOP STATUS */}
      <div id="game-overlay-status" className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        
        {/* Kid score displays */}
        <div className="flex gap-3 pointer-events-auto">
          <div className="bg-[#fffdf8]/95 backdrop-blur border-2 border-[#ebd9bd] rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <span className="text-xl animate-spin">🪙</span>
            <div>
              <p className="text-[10px] text-stone-500 font-extrabold uppercase">Coins</p>
              <p className="text-base font-black text-amber-700">{stats.coins}</p>
            </div>
          </div>
          
          <div className="bg-[#fffef4]/95 backdrop-blur border-2 border-[#eee0a4] rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <span className="text-xl animate-pulse">⭐</span>
            <div>
              <p className="text-[10px] text-stone-500 font-extrabold uppercase">Stars</p>
              <p className="text-base font-black text-yellow-600">{stats.stars}</p>
            </div>
          </div>
        </div>

        {/* Music, Parent Dashboard controllers */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={toggleRideCompanion}
            className="w-12 h-12 bg-white hover:bg-stone-50 active:scale-95 border-2 border-rose-300 rounded-2xl flex items-center justify-center text-xl shadow border-b-4 border-rose-200 transition"
            title="Ride Animal Companion!"
          >
            {player.ridingAnimal ? '🧍' : '🦄'}
          </button>

          <button
            onClick={handleMusicToggle}
            className="w-12 h-12 bg-[#fcfaf2] hover:bg-[#f5ebd3] active:scale-95 border-2 border-[#ebdcb9] rounded-2xl flex items-center justify-center text-[#4a5d4e] shadow border-b-4 border-[#d7ccc8] transition"
          >
            {musicOn ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenParent}
            className="px-4 h-12 bg-[#4a5d4e] hover:bg-[#3d4f41] active:scale-95 text-white font-extrabold text-xs tracking-wider rounded-2xl flex items-center gap-2 shadow transition uppercase border-b-4 border-[#2d3a2e]"
          >
            <Shield className="w-4 h-4" /> Parent Guard
          </button>
        </div>
      </div>

      {/* RENDER ISOMETRIC CANVAS BACKGROUND MAP */}
      <div ref={containerRef} className="w-full h-[400px] md:h-[450px] relative overflow-hidden bg-sky-200">
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

        {/* ACTIVE PORTAL FLOATING SIGNPOST */}
        <div
          id="learning-castle-floating"
          className="absolute pointer-events-none mt-2 transition-all duration-300"
          style={{
            left: getScreenPos(5.5, 5.5).x - 30,
            top: getScreenPos(5.5, 5.5).y - 80,
          }}
        >
          <div className="bg-[#fcfaf2]/95 border-2 border-[#ebd9bd] p-2 rounded-xl text-center shadow-lg font-sans animate-bounce">
            <span className="text-base">🏰</span>
            <p className="text-[10px] uppercase font-black text-[#8d6e63]">Quiz Castle</p>
          </div>
        </div>

        {/* FLOATING ACTIVE COLLECTIBLE COINS / STARS */}
        {collectibles.map((coll) => {
          if (coll.collected) return null;
          const pos = getScreenPos(coll.x, coll.y, coll.z);
          const bounceOffset = Math.sin((Date.now() / 200) + coll.pulseOffset) * 4;

          return (
            <div
              key={coll.id}
              className="absolute pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: pos.x,
                top: pos.y + bounceOffset,
              }}
            >
              <span className={`text-xl drop-shadow ${coll.type === 'coin' ? 'animate-pulse' : 'animate-bounce'}`}>
                {coll.type === 'coin' ? '🪙' : '⭐'}
              </span>
            </div>
          );
        })}

        {/* FLOATING MULTIPLAYER EXPEDITION COMPANIONS (Emma, Noah, Mia) */}
        {friends.map((friend) => {
          const pos = getScreenPos(friend.x, friend.y, friend.z);
          return (
            <g key={friend.id}>
              {/* Player element capsule wrapper */}
              <div
                className="absolute transition-all duration-300 -translate-x-1/2 -translate-y-full"
                style={{
                  left: pos.x,
                  top: pos.y,
                }}
              >
                {/* Character visual indicator */}
                <span className="text-2xl drop-shadow filter saturate-120 hover:scale-110 active:scale-95 select-none py-1.5 px-0.5 rounded-full cursor-pointer animate-wiggle">
                  {friend.outfit === 'dino-hero' ? '🦖' : friend.outfit === 'space-suit' ? '👨‍🚀' : '👧'}
                </span>

                {/* Friend Tag */}
                <div className="bg-stone-800/80 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full text-center tracking-wide shadow">
                  {friend.name}
                </div>

                {/* Friend Chat Bubble pop */}
                {friend.chatBubble && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#fffef4] border-2 border-[#eee0a4] text-[#5c4033] text-[10px] font-black tracking-tight px-2 py-1 rounded-xl shadow-md whitespace-nowrap z-30 animate-bounce">
                    {friend.chatBubble}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-0.5 w-2 h-2 bg-[#fffef4] rotate-45 border-r border-b border-[#eee0a4]" />
                  </div>
                )}
              </div>
            </g>
          );
        })}

        {/* ACTIVE INTERACTIVE NPCs FLOATED CARDS */}
        {npcs.map((npc) => {
          const pos = getScreenPos(npc.x, npc.y, 0);
          return (
            <div
              key={npc.id}
              onClick={() => {
                sound.speak(npc.dialogue, settings.voiceGuidance);
                setActiveNPC(npc);
              }}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group flex flex-col items-center"
              style={{
                left: pos.x,
                top: pos.y,
              }}
            >
              {/* Cute animation highlight rings */}
              <div className="w-10 h-10 rounded-full bg-indigo-400/20 absolute -z-10 group-hover:scale-125 transition duration-300 animate-ping" />

              <span className="text-3xl filter drop-shadow hover:scale-105 transition active:scale-95 select-none animate-[bounce_2.5s_infinite_ease-in-out]">
                {npc.emoji}
              </span>

              <div className="bg-[#8d6e63] text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full text-center shadow border-b border-[#5c4033]">
                {npc.name}
              </div>
            </div>
          );
        })}

        {/* HUMBLE PLAYER HERO VISUAL (Absolute pixel projection) */}
        <div
          id="custom-player-avatar"
          className="absolute -translate-x-1/2 -translate-y-full z-10 select-none pb-2 transition-all duration-75"
          style={{
            left: playerPos.x,
            top: playerPos.y,
          }}
        >
          {/* Bobbing dynamic animal riding mount below avatar */}
          {player.ridingAnimal && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
              {player.rideEmoji}
            </span>
          )}

          <div className={player.ridingAnimal ? 'transform -translate-y-3' : ''}>
            <AvatarPreview customization={customization} size={70} animate={!player.isJumping} />
          </div>

          {/* Player name visual tag */}
          <div className="bg-[#4a5d4e]/90 text-white font-sans font-black text-[9px] px-2 py-0.5 rounded-full text-center tracking-wider shadow uppercase border border-[#3d4f41]">
            Explorer Me
          </div>

          {/* Active dialogue bubble for the hero */}
          {myChat && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-[#faf6ee] border-2 border-[#8d6e63] text-[#5c4033] text-[10px] font-black tracking-tight px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-30 animate-[bounce_0.3s_ease-out]">
              {myChat}
              {/* Pointing triangle anchor */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-[#faf6ee] rotate-45 border-r border-b border-[#8d6e63]" />
            </div>
          )}
        </div>

      </div>

      {/* DIALOGUE & ADVENTURE CONVERSATION MODALS */}
      {activeNPC && (
        <div id="npc-chat-bubble" className="p-4 bg-[#fcfaf2] border-t-4 border-[#8d6e63] z-30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-bounce">{activeNPC.emoji}</span>
            <div>
              <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${activeNPC.color}`}>
                Teacher: {activeNPC.area}
              </span>
              <h4 className="text-sm font-black text-stone-900 mt-1 font-display">{activeNPC.name}</h4>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed max-w-lg">{activeNPC.dialogue}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                sound.playCorrect();
                setActiveNPC(null);
                // Map the NPC areas to educational play screens
                if (activeNPC.id === 'npc-barney') onPlayMiniGame('quiz');
                else if (activeNPC.id === 'npc-sugar') onPlayMiniGame('maze');
                else if (activeNPC.id === 'npc-leo') onPlayMiniGame('rescue');
                else if (activeNPC.id === 'npc-cosmos') onPlayMiniGame('quiz');
                else if (activeNPC.id === 'npc-marina') onPlayMiniGame('fishing');
              }}
              className="bg-[#66bb6a] hover:bg-[#55a65a] hover:shadow text-white font-black text-xs px-6 py-2.5 rounded-xl border-b-4 border-[#3d8343] active:scale-95 transition tracking-widest flex-1 md:flex-none uppercase"
            >
              Let's Play! 🎯
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveNPC(null);
              }}
              className="bg-[#f5ebd6] hover:bg-[#ebd9bd] text-[#5c4033] font-extrabold text-xs px-4 py-2.5 rounded-xl border-b-4 border-[#d7ccc8] active:scale-95 transition"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* QUICK PREAPPROVED SAFE CHAT CONSOLE BUTTONS */}
      <div id="quick-safe-chat-ribbon" className="p-3 bg-[#f5f1e6] border-t border-[#ebdcb9] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#5c4033]">
          <MessageCircle className="w-4 h-4 text-[#8d6e63]" />
          <span className="text-[10px] uppercase font-black">Preapproved Safe Chat:</span>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center md:justify-end">
          {SAFE_CHAT_PHRASES.map((phrase) => (
            <button
              key={phrase}
              onClick={() => handleSendChat(phrase)}
              className="py-1 px-2.5 bg-white border border-[#ebdcb9] rounded-lg hover:border-[#8d6e63] text-[10px] font-bold text-stone-700 hover:bg-[#fffdf8] transition shadow-sm active:scale-95"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* FULL RESPONSIVE D-PAD MOVEMENT TOUCH CONTROLS */}
      <div id="touch-movement-joy" className="p-4 bg-[#4a5d4e] flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-stone-100">
          <MapPin className="w-4 h-4 text-[#ffd54f]" />
          <div>
            <p className="text-[9px] uppercase font-bold text-[#ebdcb9] leading-none">Walking directions</p>
            <p className="text-xs font-black text-[#ffeb3b] font-mono tracking-wider">
              X: {player.x.toFixed(1)} | Y: {player.y.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Left joystick pad directions */}
        <div className="flex gap-4">
          <div className="grid grid-cols-3 gap-1 w-28 text-slate-800">
            <div />
            <button
              onClick={() => movePlayer(-0.5, -0.5)}
              className="w-8 h-8 bg-[#faf6ee] hover:bg-[#f5ebd6] active:bg-[#ebd9bd] text-[#5c4033] border-b-4 border-[#ebdcb9] font-black rounded-lg flex items-center justify-center shadow transition"
            >
              W
            </button>
            <div />
            <button
              onClick={() => movePlayer(-0.5, 0.5)}
              className="w-8 h-8 bg-[#faf6ee] hover:bg-[#f5ebd6] active:bg-[#ebd9bd] text-[#5c4033] border-b-4 border-[#ebdcb9] font-black rounded-lg flex items-center justify-center shadow transition"
            >
              A
            </button>
            <button
              onClick={() => movePlayer(0.5, 0.5)}
              className="w-8 h-8 bg-[#faf6ee] hover:bg-[#f5ebd6] active:bg-[#ebd9bd] text-[#5c4033] border-b-4 border-[#ebdcb9] font-black rounded-lg flex items-center justify-center shadow transition"
            >
              S
            </button>
            <button
              onClick={() => movePlayer(0.5, -0.5)}
              className="w-8 h-8 bg-[#faf6ee] hover:bg-[#f5ebd6] active:bg-[#ebd9bd] text-[#5c4033] border-b-4 border-[#ebdcb9] font-black rounded-lg flex items-center justify-center shadow transition"
            >
              D
            </button>
          </div>

          <button
            onClick={executeJump}
            className="px-6 h-12 bg-gradient-to-r from-[#ff8a65] to-[#ffb74d] active:scale-95 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center shadow transition border-b-4 border-[#d84315]"
          >
             JUMP! 🚀
          </button>
        </div>
      </div>

    </div>
  );
}
