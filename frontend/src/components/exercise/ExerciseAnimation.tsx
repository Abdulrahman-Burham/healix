import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Shield, AlertTriangle, Flame, RotateCw
} from 'lucide-react';

interface ExerciseStep {
  title: string;
  titleAr: string;
  desc: string;
  descAr: string;
  figure: FigurePose;
  duration?: number;
}

interface FigurePose {
  body: number;
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  squat: number;
}

interface ExerciseAnimationProps {
  exercise: {
    id: string;
    name: string;
    nameAr: string;
    muscles: string;
    musclesAr: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    calories: number;
    sets: number;
    reps: number;
    steps: ExerciseStep[];
    safetyTips: string[];
    safetyTipsAr: string[];
  };
  onClose?: () => void;
}

/* ─── Clean Anatomical Figure ─── */
function HumanFigure3D({ pose, color = '#06b6d4', muscleGroup = '' }: { pose: FigurePose; color?: string; muscleGroup?: string }) {
  const cx = 150;
  const baseHeadY = 42;
  const squatDrop = pose.squat * 0.6;
  const headY = baseHeadY + squatDrop * 0.3;
  const neckY = headY + 16;
  const shoulderY = neckY + 8;
  const torsoBottom = shoulderY + 55 - pose.squat * 0.3;
  const hipY = torsoBottom + 4;

  const upperArmLen = 28;
  const forearmLen = 26;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const laAngle = toRad(pose.leftArm);
  const lElbowX = cx - 22 - Math.cos(laAngle) * upperArmLen;
  const lElbowY = shoulderY + 4 + Math.sin(laAngle) * upperArmLen;
  const lForeAngle = laAngle + toRad(20);
  const lHandX = lElbowX - Math.cos(lForeAngle) * forearmLen;
  const lHandY = lElbowY + Math.sin(lForeAngle) * forearmLen;

  const raAngle = toRad(pose.rightArm);
  const rElbowX = cx + 22 + Math.cos(raAngle) * upperArmLen;
  const rElbowY = shoulderY + 4 + Math.sin(raAngle) * upperArmLen;
  const rForeAngle = raAngle + toRad(20);
  const rHandX = rElbowX + Math.cos(rForeAngle) * forearmLen;
  const rHandY = rElbowY + Math.sin(rForeAngle) * forearmLen;

  const thighLen = 35;
  const shinLen = 32;
  const llAngle = toRad(pose.leftLeg);
  const rlAngle = toRad(pose.rightLeg);

  const lKneeX = cx - 12 - Math.sin(llAngle) * thighLen * 0.4;
  const lKneeY = hipY + Math.cos(llAngle) * thighLen + squatDrop * 0.4;
  const lShinAngle = llAngle * 0.6;
  const lFootX = lKneeX - Math.sin(lShinAngle) * shinLen * 0.2;
  const lFootY = lKneeY + Math.cos(lShinAngle) * shinLen + squatDrop * 0.2;

  const rKneeX = cx + 12 + Math.sin(rlAngle) * thighLen * 0.4;
  const rKneeY = hipY + Math.cos(rlAngle) * thighLen + squatDrop * 0.4;
  const rShinAngle = rlAngle * 0.6;
  const rFootX = rKneeX + Math.sin(rShinAngle) * shinLen * 0.2;
  const rFootY = rKneeY + Math.cos(rShinAngle) * shinLen + squatDrop * 0.2;

  const mg = muscleGroup.toLowerCase();
  const shoulderActive = mg.includes('shoulder');
  const chestActive = mg.includes('chest');
  const armActive = mg.includes('tricep') || mg.includes('arm') || mg.includes('bicep');
  const legActive = mg.includes('quad') || mg.includes('leg') || mg.includes('glut') || mg.includes('hamstring');
  const coreActive = mg.includes('abs') || mg.includes('core');

  const spring = { type: 'spring' as const, stiffness: 90, damping: 14 };
  const activeColor = '#34d399';
  const limbColor = '#475569';
  const limbColorDark = '#334155';

  return (
    <svg viewBox="0 0 300 260" className="w-full h-full">
      <defs>
        <linearGradient id="bodyFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="outlineG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="activeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={activeColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={activeColor} stopOpacity="0.5" />
        </linearGradient>
        <filter id="activeGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.06" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor shadow */}
      <ellipse cx={cx} cy="250" rx="70" ry="8" fill="url(#shadow)" />

      {/* LEGS */}
      {/* Left Thigh */}
      <motion.line strokeWidth="10" strokeLinecap="round"
        stroke={legActive ? activeColor : limbColor}
        filter={legActive ? 'url(#activeGlow)' : undefined}
        animate={{ x1: cx - 10, y1: hipY, x2: lKneeX, y2: lKneeY }} transition={spring} />
      {/* Left Shin */}
      <motion.line strokeWidth="8" strokeLinecap="round"
        stroke={legActive ? activeColor : limbColorDark}
        animate={{ x1: lKneeX, y1: lKneeY, x2: lFootX, y2: lFootY }} transition={spring} />
      {/* Right Thigh */}
      <motion.line strokeWidth="10" strokeLinecap="round"
        stroke={legActive ? activeColor : limbColor}
        filter={legActive ? 'url(#activeGlow)' : undefined}
        animate={{ x1: cx + 10, y1: hipY, x2: rKneeX, y2: rKneeY }} transition={spring} />
      {/* Right Shin */}
      <motion.line strokeWidth="8" strokeLinecap="round"
        stroke={legActive ? activeColor : limbColorDark}
        animate={{ x1: rKneeX, y1: rKneeY, x2: rFootX, y2: rFootY }} transition={spring} />

      {/* Feet */}
      <motion.ellipse rx="7" ry="2.5" fill={legActive ? activeColor : limbColor} opacity="0.4"
        animate={{ cx: lFootX, cy: lFootY + 2 }} transition={spring} />
      <motion.ellipse rx="7" ry="2.5" fill={legActive ? activeColor : limbColor} opacity="0.4"
        animate={{ cx: rFootX, cy: rFootY + 2 }} transition={spring} />

      {/* TORSO */}
      <motion.path
        fill={coreActive || chestActive ? `${activeColor}20` : 'url(#bodyFill)'}
        stroke={coreActive || chestActive ? activeColor : 'url(#outlineG)'}
        strokeWidth="1"
        filter={coreActive || chestActive ? 'url(#activeGlow)' : undefined}
        animate={{
          d: `M${cx - 22} ${shoulderY} Q${cx - 26} ${shoulderY + 15} ${cx - 18} ${torsoBottom} L${cx + 18} ${torsoBottom} Q${cx + 26} ${shoulderY + 15} ${cx + 22} ${shoulderY} Z`
        }}
        transition={spring}
      />
      {/* Center line */}
      <motion.line stroke={color} strokeWidth="0.4" opacity={chestActive ? "0.4" : "0.1"}
        animate={{ x1: cx, y1: shoulderY + 4, x2: cx, y2: shoulderY + 25 }} transition={spring} />
      {/* Chest curve */}
      <motion.path stroke={color} strokeWidth="0.4" opacity={chestActive ? "0.35" : "0.08"} fill="none"
        animate={{ d: `M${cx - 14} ${shoulderY + 8} Q${cx} ${shoulderY + 14} ${cx + 14} ${shoulderY + 8}` }}
        transition={spring} />
      {/* Abs */}
      {coreActive && [0, 10, 20].map(offset => (
        <motion.line key={offset} stroke={activeColor} strokeWidth="0.5" opacity="0.25"
          animate={{ x1: cx - 8, y1: shoulderY + 28 + offset, x2: cx + 8, y2: shoulderY + 28 + offset }}
          transition={spring} />
      ))}

      {/* SHOULDERS */}
      <motion.ellipse
        fill={shoulderActive ? `${activeColor}30` : '#1e293b'} stroke={shoulderActive ? activeColor : color} strokeWidth="0.7"
        filter={shoulderActive ? 'url(#activeGlow)' : undefined}
        animate={{ cx: cx - 24, cy: shoulderY + 2, rx: 10, ry: 7 }} transition={spring} />
      <motion.ellipse
        fill={shoulderActive ? `${activeColor}30` : '#1e293b'} stroke={shoulderActive ? activeColor : color} strokeWidth="0.7"
        filter={shoulderActive ? 'url(#activeGlow)' : undefined}
        animate={{ cx: cx + 24, cy: shoulderY + 2, rx: 10, ry: 7 }} transition={spring} />

      {/* ARMS */}
      {/* Left Upper Arm */}
      <motion.line strokeWidth="8" strokeLinecap="round"
        stroke={armActive ? activeColor : limbColor}
        filter={armActive ? 'url(#activeGlow)' : undefined}
        animate={{ x1: cx - 22, y1: shoulderY + 4, x2: lElbowX, y2: lElbowY }} transition={spring} />
      {/* Left Forearm */}
      <motion.line strokeWidth="6" strokeLinecap="round"
        stroke={armActive ? '#2dd4bf' : limbColorDark}
        animate={{ x1: lElbowX, y1: lElbowY, x2: lHandX, y2: lHandY }} transition={spring} />
      {/* Right Upper Arm */}
      <motion.line strokeWidth="8" strokeLinecap="round"
        stroke={armActive ? activeColor : limbColor}
        filter={armActive ? 'url(#activeGlow)' : undefined}
        animate={{ x1: cx + 22, y1: shoulderY + 4, x2: rElbowX, y2: rElbowY }} transition={spring} />
      {/* Right Forearm */}
      <motion.line strokeWidth="6" strokeLinecap="round"
        stroke={armActive ? '#2dd4bf' : limbColorDark}
        animate={{ x1: rElbowX, y1: rElbowY, x2: rHandX, y2: rHandY }} transition={spring} />

      {/* Hands */}
      <motion.circle r="3.5" fill={armActive ? activeColor : color} opacity="0.45"
        animate={{ cx: lHandX, cy: lHandY }} transition={spring} />
      <motion.circle r="3.5" fill={armActive ? activeColor : color} opacity="0.45"
        animate={{ cx: rHandX, cy: rHandY }} transition={spring} />

      {/* Joints */}
      {[
        { x: lElbowX, y: lElbowY },
        { x: rElbowX, y: rElbowY },
        { x: lKneeX, y: lKneeY },
        { x: rKneeX, y: rKneeY },
      ].map((j, i) => (
        <motion.g key={`j-${i}`}>
          <motion.circle r="4.5" fill="#0f172a" stroke={color} strokeWidth="0.8" opacity="0.6"
            animate={{ cx: j.x, cy: j.y }} transition={spring} />
          <motion.circle r="1.5" fill={color} opacity="0.35"
            animate={{ cx: j.x, cy: j.y }} transition={spring} />
        </motion.g>
      ))}

      {/* NECK */}
      <motion.line stroke={limbColor} strokeWidth="5" strokeLinecap="round"
        animate={{ x1: cx, y1: neckY - 2, x2: cx, y2: shoulderY }} transition={spring} />

      {/* HEAD */}
      <motion.ellipse
        fill="url(#bodyFill)" stroke="url(#outlineG)" strokeWidth="1"
        animate={{ cx, cy: headY, rx: 14, ry: 16 }} transition={spring} />
      {/* Face visor */}
      <motion.path fill="none" stroke={color} strokeWidth="0.8" opacity="0.35"
        animate={{ d: `M${cx - 8} ${headY - 3} Q${cx} ${headY + 2} ${cx + 8} ${headY - 3}` }}
        transition={spring} />
      {/* Eyes */}
      <motion.circle r="1.3" fill={color} opacity="0.55"
        animate={{ cx: cx - 5, cy: headY - 3 }} transition={spring} />
      <motion.circle r="1.3" fill={color} opacity="0.55"
        animate={{ cx: cx + 5, cy: headY - 3 }} transition={spring} />

      {/* Muscle label */}
      {muscleGroup && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x={cx - 38} y="8" width="76" height="16" rx="8" fill={color} opacity="0.08" stroke={color} strokeWidth="0.4" strokeOpacity="0.2" />
          <text x={cx} y="19" textAnchor="middle" fill={color} fontSize="7.5" fontWeight="600" opacity="0.6" fontFamily="Inter, sans-serif">
            {muscleGroup.toUpperCase()}
          </text>
        </motion.g>
      )}
    </svg>
  );
}

// Pre-built exercises library
export const exerciseLibrary = [
  {
    id: 'shoulder-press',
    name: 'Shoulder Press',
    nameAr: 'ضغط الكتف',
    muscles: 'Shoulders, Triceps',
    musclesAr: 'الأكتاف، التراي',
    difficulty: 'intermediate' as const,
    calories: 8,
    sets: 3,
    reps: 12,
    steps: [
      { title: 'Starting Position', titleAr: 'وضع البداية', desc: 'Stand straight, arms at shoulder height, elbows bent at 90°', descAr: 'قف مستقيماً، ارفع ذراعيك لمستوى الكتف مع ثني المرفقين 90 درجة', figure: { body: 0, leftArm: -90, rightArm: -90, leftLeg: 0, rightLeg: 0, squat: 0 } },
      { title: 'Press Up', titleAr: 'ادفع لأعلى', desc: 'Press both arms up overhead until fully extended', descAr: 'ادفع ذراعيك لأعلى حتى يمتدا بالكامل فوق الرأس', figure: { body: 0, leftArm: -160, rightArm: -160, leftLeg: 0, rightLeg: 0, squat: 0 } },
      { title: 'Hold & Squeeze', titleAr: 'ثبت واضغط', desc: 'Hold at the top and squeeze your shoulders', descAr: 'ثبت في الأعلى واضغط عضلات الكتف', figure: { body: 0, leftArm: -170, rightArm: -170, leftLeg: 0, rightLeg: 0, squat: 0 } },
      { title: 'Lower Down', titleAr: 'انزل ببطء', desc: 'Slowly lower back to starting position', descAr: 'انزل ببطء للوضع الأول', figure: { body: 0, leftArm: -90, rightArm: -90, leftLeg: 0, rightLeg: 0, squat: 0 } },
    ],
    safetyTips: ['Keep core tight throughout', "Don't arch your back", 'Control the weight on the way down', 'Keep wrists straight'],
    safetyTipsAr: ['حافظ على شد عضلات البطن', 'لا تقوّس ظهرك', 'تحكم بالوزن أثناء النزول', 'حافظ على استقامة الرسغين'],
  },
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    nameAr: 'سكوات',
    muscles: 'Quads, Glutes, Core',
    musclesAr: 'الفخذين، المؤخرة، البطن',
    difficulty: 'beginner' as const,
    calories: 6,
    sets: 3,
    reps: 15,
    steps: [
      { title: 'Stand Tall', titleAr: 'قف مستقيماً', desc: 'Feet shoulder-width apart, arms at sides', descAr: 'قدماك بعرض الكتفين، ذراعاك على الجانبين', figure: { body: 0, leftArm: 20, rightArm: 20, leftLeg: 0, rightLeg: 0, squat: 0 } },
      { title: 'Begin Descent', titleAr: 'ابدأ النزول', desc: 'Push hips back, bend knees, arms forward for balance', descAr: 'ادفع الوركين للخلف، اثنِ الركبتين، ارفع ذراعيك للتوازن', figure: { body: 0, leftArm: -60, rightArm: -60, leftLeg: 15, rightLeg: 15, squat: 15 } },
      { title: 'Deep Squat', titleAr: 'سكوات عميق', desc: 'Thighs parallel to ground, weight on heels', descAr: 'الفخذان موازيان للأرض، الوزن على الكعبين', figure: { body: 0, leftArm: -70, rightArm: -70, leftLeg: 35, rightLeg: 35, squat: 35 } },
      { title: 'Drive Up', titleAr: 'اصعد بقوة', desc: 'Push through heels to stand back up', descAr: 'ادفع من الكعبين للوقوف مرة أخرى', figure: { body: 0, leftArm: 20, rightArm: 20, leftLeg: 0, rightLeg: 0, squat: 0 } },
    ],
    safetyTips: ['Keep knees over toes', "Don't let knees cave inward", 'Keep chest up', 'Push through your heels'],
    safetyTipsAr: ['حافظ على الركبتين فوق أصابع القدم', 'لا تدع الركبتين تنحرف للداخل', 'حافظ على الصدر مرفوع', 'ادفع من الكعبين'],
  },
  {
    id: 'pushup',
    name: 'Push-Up',
    nameAr: 'تمرين الضغط',
    muscles: 'Chest, Shoulders, Triceps',
    musclesAr: 'الصدر، الأكتاف، التراي',
    difficulty: 'beginner' as const,
    calories: 7,
    sets: 3,
    reps: 10,
    steps: [
      { title: 'Plank Position', titleAr: 'وضع البلانك', desc: 'Arms extended, body in a straight line from head to heels', descAr: 'ذراعان ممدودتان، الجسم في خط مستقيم من الرأس للكعبين', figure: { body: 0, leftArm: -45, rightArm: -45, leftLeg: 10, rightLeg: 10, squat: 0 } },
      { title: 'Lower Body', titleAr: 'انزل بجسمك', desc: 'Bend elbows to lower chest toward floor', descAr: 'اثنِ المرفقين لإنزال الصدر نحو الأرض', figure: { body: 0, leftArm: -10, rightArm: -10, leftLeg: 10, rightLeg: 10, squat: 10 } },
      { title: 'Bottom Position', titleAr: 'الوضع السفلي', desc: 'Chest near floor, elbows at 45° angle', descAr: 'الصدر قريب من الأرض، المرفقان بزاوية 45 درجة', figure: { body: 0, leftArm: 5, rightArm: 5, leftLeg: 10, rightLeg: 10, squat: 15 } },
      { title: 'Push Up', titleAr: 'ادفع لأعلى', desc: 'Push through palms to return to start', descAr: 'ادفع من راحة اليد للعودة للوضع الأول', figure: { body: 0, leftArm: -45, rightArm: -45, leftLeg: 10, rightLeg: 10, squat: 0 } },
    ],
    safetyTips: ['Keep body in straight line', "Don't flare elbows out", 'Engage your core', 'Full range of motion'],
    safetyTipsAr: ['حافظ على جسمك في خط مستقيم', 'لا تفتح المرفقين للخارج', 'شد عضلات البطن', 'حركة كاملة المدى'],
  },
  {
    id: 'lunge',
    name: 'Walking Lunge',
    nameAr: 'الطعن',
    muscles: 'Quads, Glutes, Hamstrings',
    musclesAr: 'الفخذ، المؤخرة، العضلات الخلفية',
    difficulty: 'intermediate' as const,
    calories: 7,
    sets: 3,
    reps: 12,
    steps: [
      { title: 'Stand Tall', titleAr: 'قف مستقيماً', desc: 'Feet together, arms at your sides', descAr: 'قدمان معاً، ذراعان على الجانبين', figure: { body: 0, leftArm: 15, rightArm: 15, leftLeg: 0, rightLeg: 0, squat: 0 } },
      { title: 'Step Forward', titleAr: 'خطوة للأمام', desc: 'Take a big step forward with your right leg', descAr: 'خذ خطوة كبيرة للأمام بالرجل اليمنى', figure: { body: 0, leftArm: 10, rightArm: 10, leftLeg: -10, rightLeg: 25, squat: 5 } },
      { title: 'Lunge Down', titleAr: 'انزل للطعن', desc: 'Lower until both knees are at 90°', descAr: 'انزل حتى تصبح كلتا الركبتين بزاوية 90 درجة', figure: { body: 0, leftArm: 5, rightArm: 5, leftLeg: -15, rightLeg: 40, squat: 20 } },
      { title: 'Push Back Up', titleAr: 'اصعد وارجع', desc: 'Push through front heel to stand', descAr: 'ادفع من كعب القدم الأمامية للوقوف', figure: { body: 0, leftArm: 15, rightArm: 15, leftLeg: 0, rightLeg: 0, squat: 0 } },
    ],
    safetyTips: ['Front knee stays over ankle', 'Keep torso upright', 'Back knee gently touches ground', 'Control the movement'],
    safetyTipsAr: ['الركبة الأمامية فوق الكاحل', 'حافظ على الجذع مستقيماً', 'الركبة الخلفية تلمس الأرض برفق', 'تحكم بالحركة'],
  },
];

export default function ExerciseAnimation({ exercise, onClose }: ExerciseAnimationProps) {
  const { language } = useUIStore();
  const isAr = language === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [rotateY, setRotateY] = useState(0);

  const step = exercise.steps[currentStep];
  const diffColors = { beginner: '#34d399', intermediate: '#fbbf24', advanced: '#f87171' };
  const diffLabels = { beginner: isAr ? 'مبتدئ' : 'Beginner', intermediate: isAr ? 'متوسط' : 'Intermediate', advanced: isAr ? 'متقدم' : 'Advanced' };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep(prev => prev >= exercise.steps.length - 1 ? 0 : prev + 1);
    }, 2200);
    return () => clearInterval(timer);
  }, [isPlaying, exercise.steps.length]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06]"
      style={{ background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(10,14,26,0.98))', backdropFilter: 'blur(20px)' }}>
      
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{isAr ? exercise.nameAr : exercise.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: diffColors[exercise.difficulty] + '12',
                color: diffColors[exercise.difficulty],
                border: `1px solid ${diffColors[exercise.difficulty]}20`,
              }}>
              {diffLabels[exercise.difficulty]}
            </span>
            <span className="text-[11px] text-slate-500">{isAr ? exercise.musclesAr : exercise.muscles}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80 bg-amber-500/[0.06] px-2.5 py-1.5 rounded-lg border border-amber-500/10">
          <Flame size={11} /> {exercise.calories} {isAr ? 'سعرة/تكرار' : 'cal/rep'}
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Figure Area */}
        <div>
          <div className="aspect-square max-w-[340px] mx-auto rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,14,26,0.8) 100%)',
              border: '1px solid rgba(255,255,255,0.04)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
            }}>
            
            {/* Subtle grid bg */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }} />

            {/* Soft radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full blur-[50px]" style={{ backgroundColor: diffColors[exercise.difficulty] + '06' }} />
            </div>

            {/* Figure */}
            <div className="relative w-full h-full transition-transform duration-500 ease-out"
              style={{ transform: `rotateY(${rotateY}deg) scale(${rotateY !== 0 ? 0.93 : 1})`, transformStyle: 'preserve-3d' }}>
              <HumanFigure3D pose={step.figure} color={diffColors[exercise.difficulty]} muscleGroup={exercise.muscles.split(',')[0].trim()} />
            </div>

            {/* Step badge */}
            <div className="absolute top-3 left-3 text-[10px] font-medium text-slate-400 bg-slate-800/70 backdrop-blur-sm px-2 py-1 rounded-md border border-white/[0.05]">
              {isAr ? 'خطوة' : 'Step'} {currentStep + 1}/{exercise.steps.length}
            </div>

            {rotateY !== 0 && (
              <div className="absolute top-3 right-3 text-[10px] text-cyan-400/70 bg-slate-800/70 backdrop-blur-sm px-2 py-1 rounded-md border border-white/[0.05]">
                {rotateY}°
              </div>
            )}

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0e1a]/60 to-transparent" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <button onClick={() => setRotateY(r => Math.max(-30, r - 15))}
              className="p-2 rounded-lg bg-slate-800/50 border border-white/[0.04] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/20 transition-all duration-200"
              title={isAr ? 'دوّر يسار' : 'Rotate Left'}>
              <RotateCcw size={14} />
            </button>
            <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="p-2 rounded-lg bg-slate-800/50 border border-white/[0.04] text-slate-500 hover:text-white transition-all duration-200">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl text-white shadow-md transition-all duration-200 hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${diffColors[exercise.difficulty]}cc, ${diffColors[exercise.difficulty]}90)`, boxShadow: `0 4px 15px ${diffColors[exercise.difficulty]}25` }}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => setCurrentStep(prev => Math.min(exercise.steps.length - 1, prev + 1))}
              className="p-2 rounded-lg bg-slate-800/50 border border-white/[0.04] text-slate-500 hover:text-white transition-all duration-200">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setRotateY(r => Math.min(30, r + 15))}
              className="p-2 rounded-lg bg-slate-800/50 border border-white/[0.04] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/20 transition-all duration-200"
              title={isAr ? 'دوّر يمين' : 'Rotate Right'}>
              <RotateCw size={14} />
            </button>
            <button onClick={() => { setCurrentStep(0); setIsPlaying(false); setRotateY(0); }}
              className="p-2 rounded-lg bg-slate-800/50 border border-white/[0.04] text-slate-500 hover:text-white transition-all duration-200">
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 justify-center mt-3">
            {exercise.steps.map((_, i) => (
              <button key={i} onClick={() => setCurrentStep(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentStep ? 24 : 6,
                  height: 6,
                  backgroundColor: i === currentStep ? diffColors[exercise.difficulty] : 'rgba(255,255,255,0.08)',
                  boxShadow: i === currentStep ? `0 0 8px ${diffColors[exercise.difficulty]}40` : 'none',
                }} />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}>
              <h4 className="text-base font-semibold text-white mb-1.5">{isAr ? step.titleAr : step.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{isAr ? step.descAr : step.desc}</p>
            </motion.div>
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: exercise.sets, label: isAr ? 'مجموعات' : 'Sets' },
              { val: exercise.reps, label: isAr ? 'تكرارات' : 'Reps' },
              { val: exercise.calories * exercise.reps * exercise.sets, label: isAr ? 'سعرة' : 'Cal' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center border border-white/[0.04]"
                style={{ background: 'rgba(15,23,42,0.5)' }}>
                <div className="text-lg font-bold text-white">{s.val}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Safety Tips */}
          <button onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-amber-400/80 text-sm font-medium transition-all duration-200 w-full
              bg-amber-500/[0.04] border border-amber-500/[0.08] hover:bg-amber-500/[0.08]">
            <Shield size={15} />
            {isAr ? 'نصائح الأمان' : 'Safety Tips'}
            <ChevronRight size={13} className={`ml-auto transition-transform duration-200 ${showTips ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showTips && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-1.5">
                {(isAr ? exercise.safetyTipsAr : exercise.safetyTips).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-500/[0.06]"
                    style={{ background: 'rgba(245,158,11,0.02)' }}>
                    <AlertTriangle size={11} className="text-amber-400/60 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-400">{tip}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
