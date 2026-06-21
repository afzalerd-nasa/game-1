import React, { useState, useEffect, useRef } from 'react';
import { sound } from './SoundEngine';
import { Trophy, HelpCircle, Star, Sparkles, Smile, RefreshCw, XCircle, ArrowRight } from 'lucide-react';

interface MiniGameProps {
  gameType: 'quiz' | 'balloon' | 'rescue' | 'fishing' | 'maze';
  onAddScore: (category: 'math' | 'alphabet' | 'shapes' | 'vocabulary' | 'memory', xpGained: number) => void;
  onAddCoins: (amount: number) => void;
  onAddStars: (amount: number) => void;
  onClose: () => void;
  focusCourse?: string[];
}

export default function MiniGames({
  gameType,
  onAddScore,
  onAddCoins,
  onAddStars,
  onClose,
  focusCourse = ['math', 'alphabet', 'shapes', 'vocabulary', 'memory'],
}: MiniGameProps) {

  // Current sub game state
  const [stage, setStage] = useState<'lobby' | 'playing' | 'completed'>('playing');
  const [stats, setGameStats] = useState({ coinsGained: 0, starsGained: 0, category: 'math' as any });

  // 1. BALLOON POP SUB-GAME CONFIG & STATES
  const balloonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [balloonCount, setBalloonCount] = useState(0);
  const [balloonHistory, setBalloonHistory] = useState<string[]>([]);
  
  // 2. MATH / WORD PUZZLES STATES
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizCheck, setQuizCheck] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [quizRound, setQuizRound] = useState(1);

  // 3. ANIMAL RESCUE GAME STATES
  const [rescuePairs, setRescuePairs] = useState<any[]>([]);
  const [selectedRescue, setSelectedRescue] = useState<number | null>(null);

  // 4. MAZE/PUZZLE GAME STATES
  const [mazeGrid, setMazeGrid] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });

  // 5. FISHING ADVENTURE STATES
  const fishingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fishCount, setFishCount] = useState(0);

  // Trigger TTS voice assistant welcome
  useEffect(() => {
    let welcomeText = '';
    if (gameType === 'quiz') {
      welcomeText = "Welcome to the Learning Castle! Let's solve some fun puzzles!";
      generateNewQuiz();
    } else if (gameType === 'balloon') {
      welcomeText = "Yay! Let's pop colorful balloons! Click or tap them!";
    } else if (gameType === 'rescue') {
      welcomeText = "Animal Rescue! Match the mommy animals to their sweet babies!";
      initRescueGame();
    } else if (gameType === 'maze') {
      welcomeText = "Help the baby puppy navigate the maze to eat the treats!";
      initMazeGame();
    } else if (gameType === 'fishing') {
      welcomeText = "Fishing Adventure! Click the water when fish swim near your hook!";
    }
    sound.speak(welcomeText, true);
  }, [gameType]);

  // ==========================================
  // GAME REWARDS WRAPPING
  // ==========================================
  const rewardGameCompletion = (category: any, bonusCoins: number, bonusStars: number, xp: number) => {
    sound.playRewardBadge();
    onAddScore(category, xp);
    onAddCoins(bonusCoins);
    onAddStars(bonusStars);
    setGameStats({ coinsGained: bonusCoins, starsGained: bonusStars, category });
    setStage('completed');
  };

  // ==========================================
  // 1. BALLOON POPPING GAME LOGIC (HTML5 CANVAS)
  // ==========================================
  useEffect(() => {
    if (gameType !== 'balloon' || stage !== 'playing') return;
    const canvas = balloonCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localScore = 0;

    // Define interactive balloons
    interface Balloon {
      x: number;
      y: number;
      radius: number;
      color: string;
      speed: number;
      char: string;
      popped: boolean;
    }

    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const balloons: Balloon[] = [];

    // Set responsive width
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 400;

    // Generate static balloons incrementally
    const spawnBalloon = () => {
      if (balloons.filter(b => !b.popped).length < 6) {
        balloons.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: canvas.height + 40,
          radius: Math.random() * 10 + 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 1.5 + 1.2,
          char: alphabet[Math.floor(Math.random() * alphabet.length)],
          popped: false,
        });
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      balloons.forEach((balloon) => {
        if (balloon.popped) return;
        const dx = clickX - balloon.x;
        const dy = clickY - (balloon.y - 15); // Adjust coordinate circle center
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < balloon.radius + 15) {
          balloon.popped = true;
          sound.playPop();
          localScore++;
          setBalloonCount(prev => prev + 1);
          setBalloonHistory(prev => [...prev.slice(-8), balloon.char]);

          // Trigger particle flashes
          if (localScore >= 12) {
            cancelAnimationFrame(animId);
            rewardGameCompletion('alphabet', 15, 3, 20);
          }
        }
      });
    };

    canvas.addEventListener('mousedown', handleCanvasClick);

    // Interactive Loop drawing custom shapes (rounded base balloon + string dangle)
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background decorations
      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cloud styling
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(80, 80, 20, 0, Math.PI * 2);
      ctx.arc(110, 70, 25, 0, Math.PI * 2);
      ctx.arc(140, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(canvas.width - 120, 100, 15, 0, Math.PI * 2);
      ctx.arc(canvas.width - 90, 90, 22, 0, Math.PI * 2);
      ctx.arc(canvas.width - 60, 100, 15, 0, Math.PI * 2);
      ctx.fill();

      // Spawn balloons
      if (Math.random() < 0.035) {
        spawnBalloon();
      }

      // Draw/update balloons
      balloons.forEach((b) => {
        if (b.popped) return;
        b.y -= b.speed;

        // Dangle string
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.bezierCurveTo(b.x - 5, b.y + 20, b.x + 5, b.y + 30, b.x, b.y + 45);
        ctx.stroke();

        // Balloon body
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius, b.radius * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon little knot bottom triangle
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + b.radius * 1.2);
        ctx.lineTo(b.x + 4, b.y + b.radius * 1.2);
        ctx.lineTo(b.x, b.y + b.radius * 1.35);
        ctx.closePath();
        ctx.fill();

        // White sheen highlights
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(b.x - b.radius * 0.4, b.y - b.radius * 0.4, b.radius * 0.25, b.radius * 0.4, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Alphabet letter overlay
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 3;
        ctx.fillText(b.char, b.x, b.y - 2);
        ctx.shadowBlur = 0; // reset
      });

      // Filter offscreen balloons
      for (let i = balloons.length - 1; i >= 0; i--) {
        if (balloons[i].y < -50 || balloons[i].popped) {
          balloons.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [gameType, stage]);

  // ==========================================
  // 2. LEARNING CASTLE: MATH & ALPHABET WORD PUZZLES
  // ==========================================
  const generateNewQuiz = () => {
    setQuizCheck('idle');
    setQuizAnswer('');

    // Alternate between maths and vocabulary challenges based on parameters
    const mathPick = Math.random() > 0.5;

    if (mathPick) {
      // Create fun interactive Math counting or sums facts
      const num1 = Math.floor(Math.random() * 5) + 3;
      const num2 = Math.floor(Math.random() * 4) + 1;
      const isSub = Math.random() > 0.6;
      const type = isSub ? 'minus' : 'plus';

      const questionText = isSub
        ? `What is ${num1} minus ${num2}?`
        : `Count and calculate: ${num1} plus ${num2}!`;
      const correctAnswer = isSub ? num1 - num2 : num1 + num2;

      // Draw cute objects list (hearts, trees, star shapes)
      const symbols = ['🍎', '🍕', '🌸', '🦖', '⚽', '🚗', '🐱'];
      const currentSym = symbols[Math.floor(Math.random() * symbols.length)];
      
      const options = [
        correctAnswer,
        correctAnswer + 1,
        Math.max(1, correctAnswer - 1),
        correctAnswer + 2
      ];
      // Shuffle options safely
      const uniqueOptions = Array.from(new Set(options)).sort(() => Math.random() - 0.5);

      setQuizQuestion({
        type: 'math',
        question: questionText,
        visuals: { sym: currentSym, count1: num1, count2: num2, op: isSub ? '-' : '+' },
        correct: correctAnswer.toString(),
        options: uniqueOptions.map(o => o.toString())
      });

      sound.speak(questionText, true);

    } else {
      // Word / alphabet puzzle
      const wordDb = [
        { word: 'FROG', emoji: '🐸', hint: 'Jump around the ponds!' },
        { word: 'DINO', emoji: '🦖', hint: 'Rawr! Dinosaur helper friend.' },
        { word: 'PANDA', emoji: '🐼', hint: 'Eats lots of sweet green bamboos' },
        { word: 'FISH', emoji: '🐠', hint: 'Swims around the blue water' },
        { word: 'SHIP', emoji: '🚀', hint: 'Flys through the space galaxies' },
        { word: 'CAKE', emoji: '🎂', hint: 'Sweet birthday treat party' }
      ];

      const chosen = wordDb[Math.floor(Math.random() * wordDb.length)];
      
      // Scramble letters
      const scaffold = chosen.word.split('').sort(() => Math.random() - 0.5);
      
      setQuizQuestion({
        type: 'word',
        question: `Can you spell this animal: ${chosen.emoji}? Spelt with letters: ${scaffold.join(', ')}!`,
        hint: chosen.hint,
        correct: chosen.word,
        options: [chosen.word, chosen.word.split('').reverse().join(''), 'DOG', 'BIRD'].sort(() => Math.random() - 0.5)
      });

      sound.speak(`Spell out this animal: ${chosen.word}`, true);
    }
  };

  const checkAnswer = (answer: string) => {
    setQuizAnswer(answer);
    const isCorrect = answer.toUpperCase().trim() === quizQuestion.correct.toUpperCase();

    if (isCorrect) {
      sound.playCorrect();
      setQuizCheck('correct');

      setTimeout(() => {
        if (quizRound >= 3) {
          rewardGameCompletion(quizQuestion.type === 'math' ? 'math' : 'vocabulary', 20, 4, 25);
        } else {
          setQuizRound(prev => prev + 1);
          generateNewQuiz();
        }
      }, 1500);
    } else {
      sound.playIncorrect();
      setQuizCheck('wrong');
      setTimeout(() => setQuizCheck('idle'), 1200);
    }
  };

  // ==========================================
  // 3. ANIMAL RESCUE MATCHING PUZZLE
  // ==========================================
  const initRescueGame = () => {
    const pool = [
      { id: 'dog', mom: '🐕 (Mommy Dog)', baby: '🐶 (Baby Puppy)', color: 'bg-amber-100 border-amber-300' },
      { id: 'cat', mom: '🐈 (Mommy Cat)', baby: '🐱 (Baby Kitten)', color: 'bg-indigo-100 border-indigo-300' },
      { id: 'bear', mom: '🐻 (Mommy Bear)', baby: '🧸 (Baby Cub)', color: 'bg-orange-100 border-orange-300' },
      { id: 'panda', mom: '🐼 (Mommy Panda)', baby: '🎋 (Baby Panda)', color: 'bg-slate-100 border-slate-300' },
    ];

    // Shuffle babies and mommies separately to create matching grid
    setRescuePairs(pool);
    setStage('playing');
  };

  const handleRescueMatch = (id: string) => {
    if (selectedRescue === null) {
      // Find index
      const idx = rescuePairs.findIndex(p => p.id === id);
      setSelectedRescue(idx);
      sound.playJump();
    } else {
      const first = rescuePairs[selectedRescue];
      const matchObj = rescuePairs.find(p => p.id === id);

      if (first.id === id) {
        // Matching success
        sound.playCorrect();
        setRescuePairs(prev => prev.filter(p => p.id !== id));
        setSelectedRescue(null);

        // Check completion
        if (rescuePairs.length <= 1) {
          rewardGameCompletion('memory', 18, 5, 30);
        }
      } else {
        sound.playIncorrect();
        setSelectedRescue(null);
      }
    }
  };

  // ==========================================
  // 4. MAZE CHALLENGE
  // ==========================================
  const initMazeGame = () => {
    // 0 = path, 1 = Wall, 2 = Treat, 3 = Start player puppy 🐕
    // Simple 5x5 grid
    const layout = [
      [0, 1, 0, 0, 2],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0]
    ];
    setMazeGrid(layout);
    setPlayerPos({ r: 0, c: 0 });
    setStage('playing');
  };

  const moveInMaze = (dr: number, dc: number) => {
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
      if (mazeGrid[nr][nc] !== 1) {
        sound.playJump();
        setPlayerPos({ r: nr, c: nc });

        // Check if treat reached
        if (mazeGrid[nr][nc] === 2) {
          sound.speak("Good job puppy! Delicious treat collected!", true);
          rewardGameCompletion('shapes', 12, 3, 20);
        }
      } else {
        // Wall bump!
        sound.playPop();
      }
    }
  };

  // ==========================================
  // 5. FISHING ADVENTURE CANVAS
  // ==========================================
  useEffect(() => {
    if (gameType !== 'fishing' || stage !== 'playing') return;
    const canvas = fishingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localScore = 0;

    interface Fish {
      x: number;
      y: number;
      speed: number;
      direction: number; // 1 = right, -1 = left
      color: string;
      emoji: string;
      caught: boolean;
    }

    const fishEmojis = ['🐠', '🐟', '🐙', '🐙', '🐡', '🐚'];
    const colors = ['#06B6D4', '#22D3EE', '#A5F3FC', '#F472B6', '#FB7185'];
    const school: Fish[] = [];

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 400;

    const spawnFish = () => {
      const dir = Math.random() > 0.5 ? 1 : -1;
      school.push({
        x: dir === 1 ? -60 : canvas.width + 60,
        y: Math.random() * (canvas.height - 150) + 120,
        speed: Math.random() * 1.8 + 1.1,
        direction: dir,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
        caught: false
      });
    };

    // User fisherman hook line (drapes near center)
    let hookX = canvas.width / 2;
    let hookY = 100;
    let isCasting = false;

    const handleCanvasClick = (e: MouseEvent) => {
      if (isCasting) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      hookX = clickX;
      isCasting = true;
      sound.playSplash();

      // Lower hook down
      let hookDownInterval = setInterval(() => {
        hookY += 15;
        if (hookY >= 320) {
          clearInterval(hookDownInterval);
          
          // Check collision with any fish coordinates
          school.forEach((fish) => {
            if (fish.caught) return;
            const dx = hookX - fish.x;
            const dy = hookY - fish.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 32) {
              fish.caught = true;
              localScore++;
              setFishCount(prev => prev + 1);
              sound.playCollectStar();
            }
          });

          // Reel hook raise back up
          let hookUpInterval = setInterval(() => {
            hookY -= 20;
            if (hookY <= 100) {
              clearInterval(hookUpInterval);
              hookY = 100;
              isCasting = false;

              if (localScore >= 5) {
                cancelAnimationFrame(animId);
                rewardGameCompletion('vocabulary', 15, 3, 20);
              }
            }
          }, 40);
        }
      }, 40);
    };

    canvas.addEventListener('mousedown', handleCanvasClick);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sea color background
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sky
      ctx.fillStyle = '#BAE6FD';
      ctx.fillRect(0, 0, canvas.width, 100);

      // Sea bottom sand
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(0, canvas.height - 25, canvas.width, 25);

      // Hook Line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();

      // Hook Curve anchor
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hookX - 4, hookY, 6, 0, Math.PI, false);
      ctx.stroke();

      // Draw active swimming fish
      if (Math.random() < 0.025) {
        spawnFish();
      }

      school.forEach((f) => {
        if (f.caught) {
          // Attached to hook coordinates
          f.x = hookX;
          f.y = hookY + 12;
        } else {
          f.x += f.speed * f.direction;
        }

        ctx.font = '32px sans-serif';
        ctx.fillText(f.emoji, f.x, f.y);
      });

      // Filter offscreen fish
      for (let i = school.length - 1; i >= 0; i--) {
        if (school[i].x < -100 || school[i].x > canvas.width + 100) {
          school.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [gameType, stage]);


  return (
    <div id="mini-game-modal" className="fixed inset-0 z-40 bg-gradient-to-b from-[#a0e0ff]/80 via-[#e8f5e9]/85 to-[#c9dfc3]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#faf6ee] rounded-[36px] p-6 max-w-2xl w-full border-4 border-[#8d6e63] shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)] relative overflow-hidden">
        
        {/* Splash border top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#81c784] via-[#ffb74d] to-[#ffd54f]" />

        {/* LOBBY / PLAYING SCREEN */}
        {stage === 'playing' ? (
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#ebdcb9]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎪</span>
                <h2 className="text-xl font-black text-stone-900 capitalize tracking-tight font-display">
                  {gameType === 'quiz' ? 'Learning Castle Challenge' : `${gameType} Adventure`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#8c6c59] hover:text-[#5c4033] transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* A: BALLOON POP GAME UI */}
            {gameType === 'balloon' && (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">
                  Pop <span className="font-bold text-pink-500">12 balloons</span> to win! Balloons popped:{' '}
                  <span className="font-extrabold text-slate-800">{balloonCount}</span>
                </p>
                <div className="rounded-2xl overflow-hidden border-4 border-[#ebdcb9] shadow-inner max-w-full">
                  <canvas ref={balloonCanvasRef} className="block w-full cursor-pointer h-80 bg-gradient-to-b from-sky-100 to-sky-50" />
                </div>
                {balloonHistory.length > 0 && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 overflow-hidden">
                    <span className="text-xs text-stone-500">Popped letters:</span>
                    {balloonHistory.map((char, i) => (
                      <span key={i} className="bg-[#fcfaf2] border border-[#ebdcb9] text-[#8d6e63] px-2 py-0.5 rounded font-black text-xs">
                        {char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* B: LEARNING CASTLE QUIZ CHALLENGE */}
            {gameType === 'quiz' && quizQuestion && (
              <div className="space-y-5">
                <div className="bg-[#f5ebd6] border border-[#d7ccc8] p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full border border-[#d7ccc8] text-3xl shadow-sm">
                    {quizQuestion.type === 'math' ? '🔢' : '🔤'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-[#8d6e63]">Round {quizRound} / 3</span>
                    <h3 className="text-base font-black text-stone-900 leading-snug font-display">{quizQuestion.question}</h3>
                    {quizQuestion.hint && <p className="text-xs text-[#8d6e63] mt-1 font-semibold">💡 Hint: {quizQuestion.hint}</p>}
                  </div>
                </div>

                {/* Draw mathematical visualization boxes */}
                {quizQuestion.type === 'math' && quizQuestion.visuals && (
                  <div className="bg-[#fffdf8] p-4 rounded-xl text-center border-2 border-dashed border-[#ebdcb9]">
                    <div className="flex flex-wrap gap-2 justify-center items-center text-lg">
                      {Array.from({ length: quizQuestion.visuals.count1 }).map((_, i) => (
                        <span key={`v1-${i}`} className="animate-wiggle">{quizQuestion.visuals.sym}</span>
                      ))}
                      <span className="mx-2 font-black text-stone-600 text-xl">{quizQuestion.visuals.op}</span>
                      {Array.from({ length: quizQuestion.visuals.count2 }).map((_, i) => (
                        <span key={`v2-${i}`} className="animate-wiggle">{quizQuestion.visuals.sym}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple choices buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {quizQuestion.options.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => checkAnswer(opt)}
                      className="py-3 px-4 bg-[#fcfaf2] hover:bg-[#e8f5e9] hover:border-[#66bb6a] hover:text-[#2e7d32] active:scale-95 border-2 border-[#ebdcb9] rounded-xl font-bold text-[#5c4033] transition capitalize"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Custom popup flags */}
                {quizCheck === 'correct' && (
                  <div className="bg-[#e8f5e9] text-emerald-800 border border-[#a5d6a7] p-3 rounded-xl flex items-center gap-2 justify-center animate-bounce font-extrabold text-sm shadow-sm">
                    💚 Awesome job! Super correct!
                  </div>
                )}
                {quizCheck === 'wrong' && (
                  <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl flex items-center gap-2 justify-center animate-shake font-extrabold text-sm">
                    💥 Close! Try another one!
                  </div>
                )}
              </div>
            )}

            {/* C: ANIMAL RESCUE MATCHING PUZZLE */}
            {gameType === 'rescue' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-stone-500 font-semibold">
                  Click a Mommy animal, then click another tile to match her Baby puppy or cub!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rescuePairs.map((pair, idx) => {
                    const isSelected = selectedRescue === idx;
                    return (
                      <button
                        key={pair.id}
                        onClick={() => handleRescueMatch(pair.id)}
                        className={`p-4 rounded-2xl border-4 ${pair.color} ${
                          isSelected ? 'ring-4 ring-[#8d6e63] scale-105' : 'hover:scale-102 shadow-sm'
                        } flex flex-col items-center justify-center text-center transition min-h-[140px] bg-white`}
                      >
                        <span className="text-xs uppercase font-extrabold text-stone-500">Family Card</span>
                        <p className="text-sm font-black text-stone-800 mt-2">{pair.mom}</p>
                        <p className="text-xs font-semibold text-stone-400 mt-1">Needs: Baby</p>
                      </button>
                    );
                  })}
                </div>

                {rescuePairs.length === 0 && (
                  <p className="text-emerald-700 font-extrabold text-base">Amazing! Animal families successfully rescued!</p>
                )}
              </div>
            )}

            {/* D: MAZE TREAT ADVENTURE */}
            {gameType === 'maze' && (
              <div className="space-y-4">
                <p className="text-sm text-[#8d6e63] font-bold text-center">
                  Use the control buttons below to lead the adorable Puppy 🐕 to his bone 🍖 treat!
                </p>

                <div className="flex justify-center">
                  <div className="grid grid-cols-5 gap-1.5 bg-[#f5ebd6] p-3 rounded-2xl border-4 border-[#8d6e63]">
                    {mazeGrid.map((row, r) =>
                      row.map((cell, c) => {
                        const isPlayer = playerPos.r === r && playerPos.c === c;
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`w-12 h-12 rounded-lg border-2 ${
                              cell === 1
                                ? 'bg-[#8d6e63] border-[#5c4033] text-[#faf6ee]'
                                : cell === 2
                                ? 'bg-[#e8f5e9] border-[#a5d6a7]'
                                : 'bg-white border-[#ebdcb9]'
                            } flex items-center justify-center text-xl font-bold`}
                          >
                            {isPlayer ? '🐕' : cell === 2 ? '🍖' : cell === 1 ? '🧱' : ''}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Custom visual touch controls for children */}
                <div className="flex flex-col items-center gap-2 max-w-xs mx-auto font-sans">
                  <button
                    onClick={() => moveInMaze(-1, 0)}
                    className="w-12 h-12 bg-white hover:bg-stone-50 border-b-4 border-[#ebdcb9] hover:border-[#bcaaa4] active:scale-95 text-[#5c4033] font-black rounded-xl flex items-center justify-center shadow"
                  >
                    ↑
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => moveInMaze(0, -1)}
                      className="w-12 h-12 bg-white hover:bg-stone-50 border-b-4 border-[#ebdcb9] hover:border-[#bcaaa4] active:scale-95 text-[#5c4033] font-black rounded-xl flex items-center justify-center shadow"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => moveInMaze(0, 1)}
                      className="w-12 h-12 bg-white hover:bg-stone-50 border-b-4 border-[#ebdcb9] hover:border-[#bcaaa4] active:scale-95 text-[#5c4033] font-black rounded-xl flex items-center justify-center shadow"
                    >
                      →
                    </button>
                  </div>
                  <button
                    onClick={() => moveInMaze(1, 0)}
                    className="w-12 h-12 bg-white hover:bg-stone-50 border-b-4 border-[#ebdcb9] hover:border-[#bcaaa4] active:scale-95 text-[#5c4033] font-black rounded-xl flex items-center justify-center shadow"
                  >
                    ↓
                  </button>
                </div>
              </div>
            )}

            {/* E: FISHING ADVENTURE */}
            {gameType === 'fishing' && (
              <div className="text-center">
                <p className="text-sm text-stone-500 mb-2 font-semibold">
                  Cast your line and catch <span className="font-bold text-[#8d6e63]">5 fish</span>! Captured:{' '}
                  <span className="font-extrabold text-stone-900">{fishCount}</span>
                </p>
                <div className="rounded-2xl overflow-hidden border-4 border-[#ebdcb9] shadow-inner max-w-full">
                  <canvas ref={fishingCanvasRef} className="block w-full cursor-pointer h-80 bg-gradient-to-b from-cyan-100 to-cyan-50" />
                </div>
              </div>
            )}

          </div>
        ) : (
          /* WINNER CHALLENGE COMPLETED CARD */
          <div className="text-center py-8 space-y-6">
            <div className="w-18 h-18 bg-[#fff9c4] rounded-full flex items-center justify-center mx-auto text-[#f57f17] text-4xl animate-bounce shadow border border-[#fff176]">
              🏆
            </div>

            <div>
              <h2 className="text-3xl font-black text-stone-900 tracking-tight font-display">
                Adventure Completed!
              </h2>
              <p className="text-[#8d6e63] text-sm mt-1 font-semibold">Excellent solving skills! You did beautiful!</p>
            </div>

            {/* Scores summary tags */}
            <div className="flex justify-center gap-4 max-w-xs mx-auto">
              <div className="bg-[#fffdf8] border border-[#f5ebd6] rounded-xl p-3 flex-1 text-center font-bold text-amber-700 shadow-sm animate-pulse">
                <p className="text-[10px] text-stone-500 capitalize font-extrabold">Coins</p>
                <p className="text-xl">🪙 +{stats.coinsGained}</p>
              </div>
              <div className="bg-[#fffef4] border border-[#eee0a4] rounded-xl p-3 flex-1 text-center font-bold text-yellow-600 shadow-sm">
                <p className="text-[10px] text-stone-500 capitalize font-extrabold">Stars</p>
                <p className="text-xl">⭐ +{stats.starsGained}</p>
              </div>
              <div className="bg-[#f5fbf7] border border-[#c3dfcf] rounded-xl p-3 flex-1 text-center font-bold text-emerald-700 shadow-sm">
                <p className="text-[10px] text-stone-500 capitalize font-extrabold">XP Category</p>
                <p className="text-xs uppercase tracking-wider font-extrabold mt-1">{stats.category}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#4a5d4e] hover:bg-[#3d4f41] text-white font-extrabold rounded-2xl active:scale-95 shadow transition border-b-4 border-[#2d3a2e] flex items-center gap-3 mx-auto uppercase tracking-wider text-xs"
            >
              Resume Exploring Wood <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
