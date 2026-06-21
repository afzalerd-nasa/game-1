import React from 'react';
import { CharacterCustomization, CharacterGender } from '../types';
import { sound } from './SoundEngine';
import { Sparkles, ArrowRight, UserCheck, Trash2 } from 'lucide-react';

interface CharacterCreatorProps {
  customization: CharacterCustomization;
  onUpdate: (customization: CharacterCustomization) => void;
  onSave: () => void;
}

// Skin presets
const SKIN_COLORS = [
  { value: '#FFE3D1', label: 'Warm Peach' },
  { value: '#F2D2A2', label: 'Sun Gold' },
  { value: '#C68A4C', label: 'Caramel' },
  { value: '#8A5A36', label: 'Deep Cocoa' },
];

// Hair style presets
const HAIR_STYLES = [
  { value: 'short', label: 'Short Trim' },
  { value: 'spiky', label: 'Spiky Style' },
  { value: 'curly', label: 'Curly Puff' },
  { value: 'pigtails', label: 'Cute Pigtails' },
  { value: 'long', label: 'Wavy Locks' },
];

// Hair color presets
const HAIR_COLORS = [
  { value: '#4A3B32', label: 'Chocolate' },
  { value: '#D9984E', label: 'Sunny Yellow' },
  { value: '#CA5A42', label: 'Bright Orange' },
  { value: '#5089C6', label: 'Ocean Blue' },
  { value: '#C355A0', label: 'Candy Pink' },
];

// Outfit theme presets
const OUTFITS = [
  { id: 'adventurer', name: 'Explorer Vest', color: '#10B981', symbol: '🏕️' },
  { id: 'wizard', name: 'Magic Cloak', color: '#8B5CF6', symbol: '🔮' },
  { id: 'space-suit', name: 'Cosmic Armor', color: '#3B82F6', symbol: '🚀' },
  { id: 'dino-hero', name: 'Dinosaur Onesie', color: '#84CC16', symbol: '🦖' },
  { id: 'candy-elf', name: 'Candy Sweet Dress', color: '#EC4899', symbol: '🍬' },
];

// Accessories
const ACCESSORIES = [
  { id: 'none', label: 'No Accessory', emoji: '❌' },
  { id: 'wizard-hat', label: 'Witch / Wizard Hat', emoji: '🧙' },
  { id: 'cat-ears', label: 'Cat Ears Headband', emoji: '🐱' },
  { id: 'rocket-pack', label: 'Futuristic Jetpack', emoji: '🚀' },
  { id: 'flower-crown', label: 'Flower Crown', emoji: '🌸' },
  { id: 'crown', label: 'Royal Gold Crown', emoji: '👑' },
];

// Dynamic Avatar SVG renderer returning highly descriptive scalable vector illustration that reacts immediately to state
export function AvatarPreview({ customization, size = 200, animate = true }: { customization: CharacterCustomization; size?: number; animate?: boolean }) {
  const { skinColor, hairColor, hairStyle, outfit, accessory } = customization;

  // Derive colors from outfit
  const outfitObj = OUTFITS.find(o => o.id === outfit) || OUTFITS[0];
  const primaryClothColor = outfitObj.color;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${animate ? 'animate-[bounce_3s_infinite_ease-in-out]' : ''}`}
      id="avatar-svg"
    >
      <defs>
        <radialGradient id="eggGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
        </radialGradient>
        <clipPath id="headClip">
          <circle cx="50" cy="50" r="16" />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="88" rx="20" ry="4" fill="rgba(0, 0, 0, 0.15)" />

      {/* Jetpack Accessory back layer */}
      {accessory === 'rocket-pack' && (
        <g id="accessory-jetpack">
          <rect x="30" y="55" width="40" height="20" rx="3" fill="#64748B" />
          <path d="M 33 75 L 30 85 L 36 85 Z" fill="#EF4444" />
          <path d="M 67 75 L 64 85 L 70 85 Z" fill="#EF4444" />
          {/* Flame particles */}
          <circle cx="33" cy="87" r="2.5" fill="#F59E0B" className="animate-pulse" />
          <circle cx="67" cy="87" r="2.5" fill="#F59E0B" className="animate-pulse" />
        </g>
      )}

      {/* Body / Clothes */}
      <g id="avatar-body">
        {/* Neck */}
        <rect x="47" y="60" width="6" height="8" fill={skinColor} rx="3" />

        {/* Dynamic Clothes Shape */}
        {outfit === 'wizard' ? (
          // Magic robe (flared)
          <path
            d="M 30 85 C 30 62, 50 62, 50 62 C 50 62, 70 62, 70 85 Z"
            fill={primaryClothColor}
          />
        ) : outfit === 'dino-hero' ? (
          // Dino suit with tiny spikes
          <g>
            <path
              d="M 32 85 C 32 62, 50 62, 50 62 C 50 62, 68 62, 68 85 Z"
              fill={primaryClothColor}
            />
            {/* Dino spikes back trail */}
            <path d="M 32 68 L 29 70 L 32 72 Z" fill="#84CC16" />
            <path d="M 32 75 L 28 78 L 32 81 Z" fill="#84CC16" />
          </g>
        ) : outfit === 'space-suit' ? (
          // Rounded bulky astronaut body
          <g>
            <path
              d="M 32 85 C 32 62, 50 62, 50 62 C 50 62, 68 62, 68 85 Z"
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />
            {/* Blue oxygen badge */}
            <circle cx="50" cy="72" r="5" fill="#3B82F6" />
            <rect x="40" y="78" width="20" height="2" fill="#EF4444" />
          </g>
        ) : (
          // Explorer / Sweet standard body
          <path
            d="M 32 85 C 32 62, 50 62, 50 62 C 50 62, 68 62, 68 85 Z"
            fill={primaryClothColor}
          />
        )}

        {/* Arms */}
        <circle cx="28" cy="74" r="4.5" fill={skinColor} />
        <circle cx="72" cy="74" r="4.5" fill={skinColor} />
      </g>

      {/* Head & Skin */}
      <g id="avatar-head">
        <circle cx="50" cy="46" r="17" fill={skinColor} stroke="#F3F4F6" strokeWidth="0.5" />

        {/* Face features: Happy kids eyes */}
        <circle cx="43" cy="44" r="2.5" fill="#1E293B" />
        <circle cx="57" cy="44" r="2.5" fill="#1E293B" />
        {/* Eye twinkle sparkle points */}
        <circle cx="44.2" cy="42.8" r="0.8" fill="#FFFFFF" />
        <circle cx="58.2" cy="42.8" r="0.8" fill="#FFFFFF" />
        
        {/* Cute blushing cheeks */}
        <circle cx="39" cy="48" r="2" fill="#EF4444" opacity="0.35" />
        <circle cx="61" cy="48" r="2" fill="#EF4444" opacity="0.35" />

        {/* Smiley tongue-out mouth */}
        <path d="M 46 49 Q 50 54 54 49" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 48 50.5 Q 50 53 52 50.5" fill="#EC4899" />
      </g>

      {/* hair styles */}
      <g id="avatar-hair">
        {hairStyle === 'short' && (
          // Neat tidy haircut
          <path
            d="M 32 40 C 32 25, 68 25, 68 40 C 68 31, 32 31, 32 40 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'spiky' && (
          // Cool cartoon hair bangs spikes
          <g fill={hairColor}>
            <path d="M 33 42 C 32 30, 40 25, 50 30 C 60 25, 68 30, 67 42 C 60 40, 50 37, 33 42 Z" />
            <path d="M 44 28 L 50 20 L 56 28 Z" />
            <path d="M 36 33 L 42 24 L 46 32 Z" />
            <path d="M 54 32 L 58 24 L 64 33 Z" />
          </g>
        )}
        {hairStyle === 'curly' && (
          // Friendly poofy cloud hair curls
          <g fill={hairColor}>
            <circle cx="35" cy="35" r="7" />
            <circle cx="45" cy="31" r="7.5" />
            <circle cx="55" cy="31" r="7.5" />
            <circle cx="65" cy="35" r="7" />
            <circle cx="50" cy="38" r="8" />
            <path d="M 32 43 C 32 35, 68 35, 68 43 Z" />
          </g>
        )}
        {hairStyle === 'pigtails' && (
          // Two adorable hair tie bundles on the side
          <g fill={hairColor}>
            {/* Main top crown block */}
            <path d="M 32 42 C 32 30, 68 30, 68 42 Z" />
            {/* Left pigtail puff */}
            <circle cx="28" cy="34" r="6" />
            <circle cx="26" cy="40" r="4.5" />
            {/* Right pigtail puff */}
            <circle cx="72" cy="34" r="6" />
            <circle cx="74" cy="40" r="4.5" />
            {/* Hair tie bands */}
            <circle cx="31" cy="36" r="2" fill="#EF4444" />
            <circle cx="69" cy="36" r="2" fill="#EF4444" />
          </g>
        )}
        {hairStyle === 'long' && (
          // Wavy locks draping below shoulder sides
          <g fill={hairColor}>
            <path d="M 32 40 C 31 22, 69 22, 68 40 C 68 55, 71 63, 68 70 C 65 65, 35 65, 32 70 C 29 63, 32 55, 32 40 Z" />
            {/* Forehead highlights bangs overlay */}
            <path d="M 32 41 C 36 34, 46 34, 50 38 Q 54 34, 68 41" fill="none" stroke={hairColor} strokeWidth="2" />
          </g>
        )}
      </g>

      {/* Accessories overlay */}
      {accessory !== 'none' && (
        <g id="avatar-accessory">
          {accessory === 'wizard-hat' && (
            // Pointy wizard hat with golden buckle band
            <g>
              <path d="M 24 33 C 24 33, 50 1, 50 1 C 50 1, 76 33, 76 33 Z" fill="#581C87" />
              {/* Rim hat */}
              <ellipse cx="50" cy="32" rx="28" ry="4" fill="#3B0764" />
              {/* Orange stripe */}
              <path d="M 34 29 C 34 29, 50 25, 66 29" stroke="#EA580C" strokeWidth="2.5" fill="none" />
              {/* Shiny Gold Star */}
              <polygon points="50,11 51,14 55,14 52,16 53,20 50,18 47,20 48,16 45,14 49,14" fill="#FBBF24" />
            </g>
          )}

          {accessory === 'cat-ears' && (
            // Cute pink and black head ears
            <g>
              {/* Band line */}
              <path d="M 33 34 Q 50 28 67 34" fill="none" stroke="#1F2937" strokeWidth="2" />
              {/* Left ear */}
              <polygon points="28,34 24,18 38,28" fill="#1F2937" />
              <polygon points="29,31 26,21 35,27" fill="#F472B6" />
              {/* Right ear */}
              <polygon points="72,34 76,18 62,28" fill="#1F2937" />
              <polygon points="71,31 74,21 65,27" fill="#F472B6" />
            </g>
          )}

          {accessory === 'flower-crown' && (
            // Circle of colorful flowers
            <g>
              <path d="M 30 33 Q 50 26 70 33" fill="none" stroke="#059669" strokeWidth="1.5" />
              {/* Blossom 1 */}
              <circle cx="34" cy="32" r="3.5" fill="#F472B6" />
              <circle cx="34" cy="32" r="1" fill="#FBBF24" />
              {/* Blossom 2 */}
              <circle cx="50" cy="27" r="4" fill="#60A5FA" />
              <circle cx="50" cy="27" r="1.5" fill="#FBBF24" />
              {/* Blossom 3 */}
              <circle cx="66" cy="32" r="3.5" fill="#F472B6" />
              <circle cx="66" cy="32" r="1.1" fill="#FBBF24" />
              {/* Flower 4, 5 side support */}
              <circle cx="42" cy="29" r="3" fill="#A78BFA" />
              <circle cx="58" cy="29" r="3" fill="#FCA5A5" />
            </g>
          )}

          {accessory === 'crown' && (
            // Imperial yellow shiny luxury crown
            <g>
              <polygon points="32,32 34,16 42,24 50,14 58,24 66,16 68,32" fill="#FBBF24" stroke="#D97706" strokeWidth="0.5" />
              <circle cx="34" cy="15" r="1.5" fill="#EF4444" />
              <circle cx="50" cy="13" r="1.5" fill="#3B82F6" />
              <circle cx="66" cy="15" r="1.5" fill="#10B981" />
              {/* Bottom crown jewel strip */}
              <rect x="34" y="28" width="32" height="2" fill="#3B82F6" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

export default function CharacterCreator({
  customization,
  onUpdate,
  onSave,
}: CharacterCreatorProps) {

  const handleGenderToggle = (gender: CharacterGender) => {
    sound.playJump();
    onUpdate({ ...customization, gender });
  };

  const handleSelectSkin = (skinColor: string) => {
    sound.playCollectCoin();
    onUpdate({ ...customization, skinColor });
  };

  const handleSelectHairStyle = (hairStyle: string) => {
    sound.playJump();
    onUpdate({ ...customization, hairStyle });
  };

  const handleSelectHairColor = (hairColor: string) => {
    sound.playCollectCoin();
    onUpdate({ ...customization, hairColor });
  };

  const handleSelectOutfit = (outfit: string) => {
    sound.playCollectStar();
    onUpdate({ ...customization, outfit });
  };

  const handleSelectAccessory = (accessory: string) => {
    sound.playCorrect();
    onUpdate({ ...customization, accessory });
  };

  return (
    <div id="character-creator-container" className="max-w-4xl mx-auto bg-[#faf6ee] rounded-[36px] border-4 border-[#8d6e63] p-6 shadow-[8px_8px_0px_0px_rgba(92,64,51,0.2)] relative overflow-hidden text-stone-850">
      {/* Sparkles decorations top corner */}
      <div className="absolute top-4 right-4 text-[#ffb74d] animate-pulse pointer-events-none">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="text-center mb-6">
        <span className="bg-[#e8f5e9] text-[#2e7d32] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#c8e6c9]">
          Build Your Hero
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mt-2 tracking-tight font-display">Dress Up Adventure</h1>
        <p className="text-stone-600 text-sm mt-1 font-semibold">Design your cartoon buddy before exploring Magic Kids World!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#f4efe1]/40 rounded-2xl p-4 border border-[#ebdcb9]">
        
        {/* LEFT CARD - Real-Time Dynamic Costume Preview */}
        <div id="visual-avatar-stage" className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#e8f5e9] to-[#faf6ee] rounded-3xl border-4 border-dashed border-[#a2cf95] relative min-h-[320px] shadow-inner">
          <AvatarPreview customization={customization} size={250} />
          
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="bg-[#faf6ee]/90 border border-[#bcaaa4] px-3 py-1 rounded-full text-xs font-bold text-stone-700 shadow-sm capitalize">
              Role: {OUTFITS.find(o => o.id === customization.outfit)?.name}
            </span>
            <span className="bg-[#faf6ee]/90 border border-[#bcaaa4] px-3 py-1 rounded-full text-xs font-bold text-stone-700 shadow-sm capitalize">
              Hat: {ACCESSORIES.find(a => a.id === customization.accessory)?.label}
            </span>
          </div>
        </div>

        {/* RIGHT CARD - Costume customizer controls */}
        <div id="avatar-customizer-controls" className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
          {/* STEP 1: GENDER */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#8d6e63] mb-2">1. Choose Body Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGenderToggle('boy')}
                className={`py-2 px-4 rounded-xl font-bold text-sm transition active:scale-95 border-2 ${
                  customization.gender === 'boy'
                    ? 'border-[#66bb6a] bg-[#e8f5e9] text-[#2e7d32] shadow-sm font-black'
                    : 'border-[#d7ccc8] bg-white hover:border-[#bcaaa4] text-stone-600'
                }`}
              >
                👦 Boy Avatar
              </button>
              <button
                onClick={() => handleGenderToggle('girl')}
                className={`py-2 px-4 rounded-xl font-bold text-sm transition active:scale-95 border-2 ${
                  customization.gender === 'girl'
                    ? 'border-[#66bb6a] bg-[#e8f5e9] text-[#2e7d32] shadow-sm font-black'
                    : 'border-[#d7ccc8] bg-white hover:border-[#bcaaa4] text-stone-600'
                }`}
              >
                👧 Girl Avatar
              </button>
            </div>
          </div>

          {/* STEP 2: SKIN COLOR */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#8d6e63] mb-2">2. Skin tone</h3>
            <div className="flex gap-3">
              {SKIN_COLORS.map((skin) => (
                <button
                  key={skin.value}
                  onClick={() => handleSelectSkin(skin.value)}
                  className={`w-10 h-10 rounded-full border-4 transition active:scale-90 relative ${
                    customization.skinColor === skin.value
                      ? 'border-[#66bb6a] scale-105 shadow'
                      : 'border-white shadow-sm hover:scale-105'
                  }`}
                  style={{ backgroundColor: skin.value }}
                  title={skin.label}
                />
              ))}
            </div>
          </div>

          {/* STEP 3: HAIR STYLE */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#8d6e63] mb-2">3. Hair Style</h3>
            <div className="flex flex-wrap gap-2">
              {HAIR_STYLES.map((hair) => (
                <button
                  key={hair.value}
                  onClick={() => handleSelectHairStyle(hair.value)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                    customization.hairStyle === hair.value
                      ? 'bg-[#66bb6a] text-white border-[#66bb6a] shadow-sm font-extrabold'
                      : 'bg-white border-[#d7ccc8] hover:border-[#bcaaa4] text-stone-600'
                  }`}
                >
                  {hair.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: HAIR COLOR */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#8d6e63] mb-2">4. Hair Color</h3>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.map((hc) => (
                <button
                  key={hc.value}
                  onClick={() => handleSelectHairColor(hc.value)}
                  className={`w-7 h-7 rounded-full border-4 transition active:scale-90 relative ${
                    customization.hairColor === hc.value
                      ? 'border-[#66bb6a] scale-105 shadow'
                      : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: hc.value }}
                  title={hc.label}
                />
              ))}
            </div>
          </div>

          {/* STEP 5: OUTFIT */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#8d6e63] mb-2">5. Magic Outfit</h3>
            <div className="space-y-2">
              {OUTFITS.map((out) => (
                <button
                  key={out.id}
                  onClick={() => handleSelectOutfit(out.id)}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-xl border text-left transition ${
                    customization.outfit === out.id
                      ? 'bg-[#e8f5e9] border-[#66bb6a] text-[#1e4620] shadow-sm font-black'
                      : 'bg-white border-[#d7ccc8] hover:border-[#bcaaa4] text-stone-600'
                  }`}
                >
                  <span className="text-lg">{out.symbol}</span>
                  <div>
                    <p className="text-xs font-bold capitalize">{out.name}</p>
                    <p className="text-[10px] text-stone-500">Magical cartoon theme fit</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 6: ACCESSORIES */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#8d6e63] mb-2">6. Head Accessory</h3>
            <div className="grid grid-cols-2 gap-2">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleSelectAccessory(acc.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition text-xs ${
                    customization.accessory === acc.id
                      ? 'bg-[#e8f5e9] border-[#66bb6a] text-[#1e4620] font-black'
                      : 'bg-white border-[#d7ccc8] hover:border-[#bcaaa4] text-stone-600'
                  }`}
                >
                  <span>{acc.emoji}</span>
                  <span className="truncate">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Button to submit and log character creation */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onSave}
          className="bg-gradient-to-r from-[#ff8a65] to-[#ffb74d] hover:from-[#ff7043] hover:to-[#ffa726] font-black text-white px-10 py-4 rounded-2xl active:scale-95 transition flex items-center gap-3 shadow-lg hover:shadow-xl text-lg tracking-wide border-b-6 border-[#d84315] font-display"
        >
          <UserCheck className="w-5 h-5" /> Start Magical Journey <ArrowRight className="w-5 h-5 animate-pulse" />
        </button>
      </div>

    </div>
  );
}
