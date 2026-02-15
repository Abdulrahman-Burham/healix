import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CameraOff, Play, Pause, RotateCcw, X, Check, Zap,
  Activity, Target, TrendingUp, AlertTriangle, ChevronDown, Timer, Flame
} from 'lucide-react';
import api from '../../services/api';

// ── Types ────────────────────────────────────────────

interface JointRule {
  min: number;
  max: number;
  ideal_bottom?: number;
  ideal_top?: number;
}

interface ExerciseRule {
  name: string;
  name_ar: string;
  joints: Record<string, JointRule>;
  rep_joint: string;
  rep_threshold_down: number;
  rep_threshold_up: number;
  tips: string[];
  tips_ar: string[];
}

// Logic state stored in Ref (Single Source of Truth)
interface LogicState {
  count: number;
  good: number;
  bad: number;
  phase: 'up' | 'down' | 'idle';
  formScore: number;
  history: number[]; // To calculate average score
}

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface LivePoseTrackerProps {
  language: 'ar' | 'en';
  onClose: () => void;
  initialExercise?: string;
}

// ── MediaPipe landmark indices ───────────────────────

const LANDMARK = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// ── Angle calculation ────────────────────────────────

function calcAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function getJointAngle(landmarks: PoseLandmark[], joint: string): number {
  const map: Record<string, [number, number, number]> = {
    left_elbow: [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_ELBOW, LANDMARK.LEFT_WRIST],
    right_elbow: [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_ELBOW, LANDMARK.RIGHT_WRIST],
    left_shoulder: [LANDMARK.LEFT_ELBOW, LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP],
    right_shoulder: [LANDMARK.RIGHT_ELBOW, LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP],
    left_hip: [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP, LANDMARK.LEFT_KNEE],
    right_hip: [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP, LANDMARK.RIGHT_KNEE],
    left_knee: [LANDMARK.LEFT_HIP, LANDMARK.LEFT_KNEE, LANDMARK.LEFT_ANKLE],
    right_knee: [LANDMARK.RIGHT_HIP, LANDMARK.RIGHT_KNEE, LANDMARK.RIGHT_ANKLE],
  };
  const triple = map[joint];
  if (!triple) return 0;
  return calcAngle(landmarks[triple[0]], landmarks[triple[1]], landmarks[triple[2]]);
}

// ── Skeleton drawing ─────────────────────────────────

const CONNECTIONS = [
  [LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_ELBOW],
  [LANDMARK.LEFT_ELBOW, LANDMARK.LEFT_WRIST],
  [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_ELBOW],
  [LANDMARK.RIGHT_ELBOW, LANDMARK.RIGHT_WRIST],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP],
  [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP],
  [LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP],
  [LANDMARK.LEFT_HIP, LANDMARK.LEFT_KNEE],
  [LANDMARK.LEFT_KNEE, LANDMARK.LEFT_ANKLE],
  [LANDMARK.RIGHT_HIP, LANDMARK.RIGHT_KNEE],
  [LANDMARK.RIGHT_KNEE, LANDMARK.RIGHT_ANKLE],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  w: number,
  h: number,
  formScore: number,
) {
  const color = formScore >= 80 ? '#10b981' : formScore >= 50 ? '#f59e0b' : '#ef4444';

  // Draw connections
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  for (const [a, b] of CONNECTIONS) {
    if (landmarks[a].visibility > 0.5 && landmarks[b].visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      ctx.stroke();
    }
  }

  // Draw joints
  ctx.shadowBlur = 12;
  const jointIndices = [
    LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER,
    LANDMARK.LEFT_ELBOW, LANDMARK.RIGHT_ELBOW,
    LANDMARK.LEFT_WRIST, LANDMARK.RIGHT_WRIST,
    LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP,
    LANDMARK.LEFT_KNEE, LANDMARK.RIGHT_KNEE,
    LANDMARK.LEFT_ANKLE, LANDMARK.RIGHT_ANKLE,
  ];
  for (const idx of jointIndices) {
    if (landmarks[idx].visibility > 0.5) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(landmarks[idx].x * w, landmarks[idx].y * h, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(landmarks[idx].x * w, landmarks[idx].y * h, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
}

// ── Component ────────────────────────────────────────

export default function LivePoseTracker({ language, onClose, initialExercise }: LivePoseTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const poseLandmarkerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>(initialExercise || '');
  const [exercises, setExercises] = useState<Record<string, ExerciseRule>>({});
  
  // UI State (synced from Ref for display)
  const [repDisplay, setRepDisplay] = useState<Omit<LogicState, 'history'>>({ 
    count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 
  });
  
  const [angles, setAngles] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // CRITICAL FIX: Use refs for ALL logic to avoid React state staleness issues
  // ---------------------------------------------------------------------------
  const logicStateRef = useRef<LogicState>({ 
    count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100, history: [] 
  });
  const selectedExerciseRef = useRef(selectedExercise);
  const exercisesRef = useRef(exercises);
  const isTrackingRef = useRef(isTracking);

  // Sync state to refs when they change
  useEffect(() => { selectedExerciseRef.current = selectedExercise; }, [selectedExercise]);
  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);
  useEffect(() => { isTrackingRef.current = isTracking; }, [isTracking]);

  // Load exercise rules
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pose/exercises');
        setExercises(res.data);
      } catch {
        setExercises({
          squat: {
            name: 'Squat', name_ar: 'سكوات',
            joints: { left_knee: { min: 70, max: 170 }, right_knee: { min: 70, max: 170 } },
            rep_joint: 'left_knee', rep_threshold_down: 100, rep_threshold_up: 160,
            tips: ['Keep knees aligned with toes', 'Back straight'],
            tips_ar: ['حافظ على الركبة في اتجاه أصابع القدم', 'الظهر مستقيم'],
          },
          push_up: {
            name: 'Push Up', name_ar: 'ضغط',
            joints: { left_elbow: { min: 45, max: 170 }, right_elbow: { min: 45, max: 170 } },
            rep_joint: 'left_elbow', rep_threshold_down: 90, rep_threshold_up: 160,
            tips: ['Keep body straight'], tips_ar: ['حافظ على جسمك مستقيماً'],
          },
        });
      }
    })();
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTracking) {
      timer = setInterval(() => setSessionTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTracking]);

  // Init MediaPipe
  const initMediaPipe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const vision = await import('@mediapipe/tasks-vision');
      const { PoseLandmarker, FilesetResolver } = vision;
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(language === 'ar' ? 'فشل تحميل الذكاء الاصطناعي' : 'AI Model failed to load');
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    initMediaPipe();
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [initMediaPipe]);

  // Camera handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch (err) {
      setError(language === 'ar' ? 'لا يمكن الوصول للكاميرا' : 'Camera access denied');
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOn(false);
    setIsTracking(false);
  };

  // ── CORE LOGIC LOOP ──────────────────────────────────
  const detectPose = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !canvas || !poseLandmarker || !isTrackingRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.drawImage(video, 0, 0, w, h);

    const now = performance.now();
    try {
      const result = poseLandmarker.detectForVideo(video, now);

      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks: PoseLandmark[] = result.landmarks[0];
        const exId = selectedExerciseRef.current;
        const ex = exercisesRef.current[exId];

        if (ex) {
          // 1. Calculate all angles
          const currentAngles: Record<string, number> = {};
          for (const joint of Object.keys(ex.joints)) {
            currentAngles[joint] = Math.round(getJointAngle(landmarks, joint));
          }
          
          // Use setState sparingly (only for UI display) to prevent lag
          // We set this here so the UI numbers update, but logic doesn't depend on it
          setAngles(currentAngles);

          // 2. Rep Logic using REFS (Synchronous, fast)
          const state = logicStateRef.current;
          const repAngle = currentAngles[ex.rep_joint] || 0;
          
          // Determine direction (Squat/Pushup = start high, go down. Curl = start low, go up)
          // Defaulting to "Down First" (Squat/Pushup) for this example logic
          const isDownFirst = ex.rep_threshold_down < ex.rep_threshold_up; 

          let hasUpdated = false;

          if (isDownFirst) {
            // Logic for Squats, Pushups (Start Up -> Go Down -> End Up)
            if (state.phase === 'idle' || state.phase === 'up') {
              if (repAngle < ex.rep_threshold_down) {
                state.phase = 'down';
                hasUpdated = true;
              }
            } else if (state.phase === 'down') {
              if (repAngle > ex.rep_threshold_up) {
                state.phase = 'up';
                state.count += 1;
                
                // Form Check on Completion
                const formOk = Object.entries(ex.joints).every(([j, rule]) => {
                  const a = currentAngles[j] || 0;
                  return a >= rule.min && a <= rule.max;
                });

                if (formOk) state.good += 1;
                else state.bad += 1;

                // Update Form Score
                const total = state.good + state.bad;
                state.formScore = Math.round((state.good / total) * 100);
                
                hasUpdated = true;
              }
            }
          } else {
             // Logic for Curls (Start Down -> Go Up -> End Down) - Optional if needed
          }

          // 3. Update UI only if state changed (Prevents re-renders every frame)
          if (hasUpdated) {
             setRepDisplay({
               count: state.count,
               good: state.good,
               bad: state.bad,
               phase: state.phase,
               formScore: state.formScore
             });
          }

          // 4. Generate Feedback
          const fb: string[] = [];
          for (const [joint, rule] of Object.entries(ex.joints)) {
            const a = currentAngles[joint] || 0;
            if (a < rule.min) fb.push(language === 'ar' ? `⚠️ ${joint}: ضيقة (${a}°)` : `⚠️ ${joint}: Too small`);
            else if (a > rule.max) fb.push(language === 'ar' ? `⚠️ ${joint}: واسعة (${a}°)` : `⚠️ ${joint}: Too wide`);
          }
          if (fb.length === 0) fb.push(language === 'ar' ? '✅ ممتاز!' : '✅ Good!');
          setFeedback(fb);

          // 5. Draw Visuals
          drawSkeleton(ctx, landmarks, w, h, state.formScore);
          
          // Draw Angle Labels on Canvas directly for smoothness
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'left';
          for (const [joint, angle] of Object.entries(currentAngles)) {
             const map: Record<string, number> = {
              left_elbow: LANDMARK.LEFT_ELBOW, right_elbow: LANDMARK.RIGHT_ELBOW,
              left_shoulder: LANDMARK.LEFT_SHOULDER, right_shoulder: LANDMARK.RIGHT_SHOULDER,
              left_hip: LANDMARK.LEFT_HIP, right_hip: LANDMARK.RIGHT_HIP,
              left_knee: LANDMARK.LEFT_KNEE, right_knee: LANDMARK.RIGHT_KNEE,
            };
            const idx = map[joint];
            if (idx !== undefined && landmarks[idx].visibility > 0.5) {
               ctx.fillStyle = 'rgba(0,0,0,0.7)';
               ctx.fillRect(landmarks[idx].x * w + 10, landmarks[idx].y * h - 24, 50, 20);
               ctx.fillStyle = '#fff';
               ctx.fillText(`${angle}°`, landmarks[idx].x * w + 15, landmarks[idx].y * h - 10);
            }
          }
        }
      }
    } catch (err) {
      // Ignore transient errors
    }

    rafRef.current = requestAnimationFrame(detectPose);
  }, [language]); // Removed volatile dependencies

  const startTracking = () => {
    if (!selectedExercise) return;
    // Reset Logic State
    logicStateRef.current = { count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100, history: [] };
    setRepDisplay({ count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 });
    
    setIsTracking(true);
    setSessionTime(0);
    // Raf needs a small delay to ensure state is settled
    setTimeout(() => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(detectPose);
    }, 100);
  };

  const stopTracking = () => {
    setIsTracking(false);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  const resetSession = () => {
    logicStateRef.current = { count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100, history: [] };
    setRepDisplay({ count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 });
    setSessionTime(0);
  };

  const saveSession = async () => {
    const ex = exercises[selectedExercise];
    const stats = logicStateRef.current;
    if (!ex || stats.count === 0) return;
    try {
      await api.post('/pose/session', {
        exercise_name: ex.name,
        exercise_name_ar: ex.name_ar,
        total_reps: stats.count,
        good_reps: stats.good,
        bad_reps: stats.bad,
        avg_form_score: stats.formScore,
        duration_seconds: sessionTime,
        calories_burned: Math.round(stats.count * 3.5),
        feedback,
      });
    } catch {}
    stopCamera();
    onClose();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-gray-900/90 rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Camera size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {language === 'ar' ? '🎯 تتبع التمرين المباشر' : '🎯 Live Exercise Tracker'}
              </h2>
              <p className="text-xs text-gray-400">MediaPipe AI Technology</p>
            </div>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 hover:bg-white/10 rounded-full text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Camera Area */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner">
                {!isCameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4">
                    {isLoading ? (
                      <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Camera size={48} />
                        <button onClick={startCamera} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all">
                          {language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}
                        </button>
                      </>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                  </div>
                )}
                
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)', display: isCameraOn && !isTracking ? 'block' : 'none' }} playsInline muted />
                <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)', display: isTracking ? 'block' : 'none' }} />

                {/* Overlays */}
                {isTracking && (
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</div>
                      <div className="bg-black/60 text-white font-mono px-3 py-1 rounded-lg border border-white/10">{formatTime(sessionTime)}</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10">
                       <div className="text-center">
                         <div className="text-2xl font-bold text-white">{repDisplay.count}</div>
                         <div className="text-[10px] text-gray-400">{language === 'ar' ? 'عدات' : 'REPS'}</div>
                       </div>
                       <div className="text-center">
                         <div className={`text-2xl font-bold ${repDisplay.formScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{repDisplay.formScore}%</div>
                         <div className="text-[10px] text-gray-400">{language === 'ar' ? 'أداء' : 'SCORE'}</div>
                       </div>
                       <div className="text-center">
                         <div className="text-2xl font-bold text-emerald-400">{repDisplay.good}</div>
                         <div className="text-[10px] text-gray-400">{language === 'ar' ? 'صحيح' : 'GOOD'}</div>
                       </div>
                       <div className="text-center">
                         <div className="text-2xl font-bold text-red-400">{repDisplay.bad}</div>
                         <div className="text-[10px] text-gray-400">{language === 'ar' ? 'خطأ' : 'BAD'}</div>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-2">
                {!isCameraOn ? null : !isTracking ? (
                   <div className="flex gap-2 w-full">
                     <button onClick={startTracking} disabled={!selectedExercise} className="flex-1 btn bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                       <Play size={18} /> {language === 'ar' ? 'بدء التمرين' : 'Start Workout'}
                     </button>
                     <button onClick={stopCamera} className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl">
                       <CameraOff size={18} />
                     </button>
                   </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button onClick={stopTracking} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Pause size={18} /> {language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}
                    </button>
                    <button onClick={resetSession} className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl">
                      <RotateCcw size={18} />
                    </button>
                    <button onClick={saveSession} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Check size={18} /> {language === 'ar' ? 'إنهاء وحفظ' : 'Finish'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Target size={16} className="text-emerald-400" />
                  {language === 'ar' ? 'اختر التمرين' : 'Select Exercise'}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {Object.entries(exercises).map(([id, ex]) => (
                    <button
                      key={id}
                      onClick={() => { setSelectedExercise(id); resetSession(); }}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                        selectedExercise === id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold">{language === 'ar' ? ex.name_ar : ex.name}</div>
                      <div className="text-xs opacity-60 mt-1">{Object.keys(ex.joints).join(', ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedExercise && exercises[selectedExercise] && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                   <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    {language === 'ar' ? 'نصائح' : 'Tips'}
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {(language === 'ar' ? exercises[selectedExercise].tips_ar : exercises[selectedExercise].tips).map((tip, i) => (
                      <li key={i} className="flex gap-2"><span className="text-emerald-500">▸</span> {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isTracking && feedback.length > 0 && (
                <div className={`p-4 rounded-xl border ${feedback[0].includes('✅') ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-amber-900/20 border-amber-500/30'}`}>
                   {feedback.map((f, i) => (
                     <p key={i} className="text-sm text-white font-medium mb-1 last:mb-0">{f}</p>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}