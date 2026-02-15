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

interface RepData {
  count: number;
  good: number;
  bad: number;
  phase: 'up' | 'down' | 'idle';
  formScore: number;
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
  const [rep, setRep] = useState<RepData>({ count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 });
  const [angles, setAngles] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [error, setError] = useState('');

  // Mutable refs for tracking state in animation loop
  const repRef = useRef(rep);
  repRef.current = rep;
  const selectedExerciseRef = useRef(selectedExercise);
  selectedExerciseRef.current = selectedExercise;
  const exercisesRef = useRef(exercises);
  exercisesRef.current = exercises;
  const isTrackingRef = useRef(isTracking);
  isTrackingRef.current = isTracking;

  // Load exercise rules from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pose/exercises');
        setExercises(res.data);
      } catch {
        // Fallback inline rules
        setExercises({
          squat: {
            name: 'Squat', name_ar: 'سكوات',
            joints: { left_knee: { min: 70, max: 170 }, right_knee: { min: 70, max: 170 } },
            rep_joint: 'left_knee', rep_threshold_down: 110, rep_threshold_up: 155,
            tips: ['Keep knees aligned with toes', 'Back straight, chest up'],
            tips_ar: ['حافظ على الركبة في اتجاه أصابع القدم', 'الظهر مستقيم والصدر مرفوع'],
          },
          push_up: {
            name: 'Push Up', name_ar: 'ضغط',
            joints: { left_elbow: { min: 45, max: 170 }, right_elbow: { min: 45, max: 170 } },
            rep_joint: 'left_elbow', rep_threshold_down: 100, rep_threshold_up: 155,
            tips: ['Keep body in a straight line'], tips_ar: ['حافظ على جسمك في خط مستقيم'],
          },
        });
      }
    })();
  }, []);

  // Session timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTracking) {
      timer = setInterval(() => setSessionTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTracking]);

  // Initialize MediaPipe PoseLandmarker
  const initMediaPipe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const vision = await import('@mediapipe/tasks-vision');
      const { PoseLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
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

      poseLandmarkerRef.current = poseLandmarker;
      setIsLoading(false);
    } catch (err: any) {
      console.error('MediaPipe init error:', err);
      setError(language === 'ar'
        ? 'فشل تحميل MediaPipe. تأكد من اتصال الإنترنت.'
        : 'Failed to load MediaPipe. Check internet connection.');
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    initMediaPipe();
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, [initMediaPipe]);

  // Start camera
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
      setError(language === 'ar'
        ? 'لا يمكن الوصول للكاميرا. تحقق من الصلاحيات.'
        : 'Cannot access camera. Check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setIsTracking(false);
  };

  // Main tracking loop
  const detectPose = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !canvas || !poseLandmarker || !isTrackingRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw video frame
    ctx.drawImage(video, 0, 0, w, h);

    // Detect pose
    const now = performance.now();
    try {
      const result = poseLandmarker.detectForVideo(video, now);

      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks: PoseLandmark[] = result.landmarks[0];

        // Calculate angles for active exercise
        const exId = selectedExerciseRef.current;
        const ex = exercisesRef.current[exId];
        if (ex) {
          const newAngles: Record<string, number> = {};
          for (const joint of Object.keys(ex.joints)) {
            newAngles[joint] = Math.round(getJointAngle(landmarks, joint));
          }
          setAngles(newAngles);

          // Rep counting logic
          const repAngle = newAngles[ex.rep_joint] || 0;
          const curRep = repRef.current;

          // Check if this exercise counts reps going DOWN (squat, push-up) or UP (curl)
          const isDownFirst = ex.rep_threshold_down > ex.rep_threshold_up;

          let newPhase = curRep.phase;
          let newCount = curRep.count;
          let newGood = curRep.good;
          let newBad = curRep.bad;

          if (isDownFirst) {
            // Exercises where you go down first (squat, push-up)
            if (curRep.phase === 'idle' || curRep.phase === 'up') {
              if (repAngle < ex.rep_threshold_down) {
                newPhase = 'down';
              }
            }
            if (curRep.phase === 'down') {
              if (repAngle > ex.rep_threshold_up) {
                newPhase = 'up';
                newCount += 1;
                // Check form quality
                const formOk = Object.entries(ex.joints).every(([j, rule]) => {
                  const a = newAngles[j] || 0;
                  return a >= rule.min && a <= rule.max;
                });
                if (formOk) newGood += 1;
                else newBad += 1;
              }
            }
          } else {
            // Exercises where you go up first (bicep curl)
            if (curRep.phase === 'idle' || curRep.phase === 'down') {
              if (repAngle > ex.rep_threshold_down) {
                newPhase = 'down';
              }
            }
            if (curRep.phase === 'down') {
              if (repAngle < ex.rep_threshold_up) {
                newPhase = 'up';
                newCount += 1;
                const formOk = Object.entries(ex.joints).every(([j, rule]) => {
                  const a = newAngles[j] || 0;
                  return a >= rule.min && a <= rule.max;
                });
                if (formOk) newGood += 1;
                else newBad += 1;
              }
            }
          }

          if (newCount !== curRep.count || newPhase !== curRep.phase) {
            const score = newCount > 0 ? Math.round((newGood / newCount) * 100) : 100;
            setRep({ count: newCount, good: newGood, bad: newBad, phase: newPhase, formScore: score });
          }

          // Live feedback
          const fb: string[] = [];
          for (const [joint, rule] of Object.entries(ex.joints)) {
            const a = newAngles[joint] || 0;
            if (a < rule.min) {
              fb.push(language === 'ar' ? `⚠️ ${joint}: الزاوية صغيرة جداً (${a}°)` : `⚠️ ${joint}: angle too small (${a}°)`);
            } else if (a > rule.max) {
              fb.push(language === 'ar' ? `⚠️ ${joint}: الزاوية كبيرة جداً (${a}°)` : `⚠️ ${joint}: angle too large (${a}°)`);
            }
          }
          if (fb.length === 0) {
            fb.push(language === 'ar' ? '✅ الفورم ممتاز!' : '✅ Great form!');
          }
          setFeedback(fb);
        }

        // Draw skeleton
        const formScore = repRef.current.formScore;
        drawSkeleton(ctx, landmarks, w, h, formScore);

        // Draw angle labels
        const exId2 = selectedExerciseRef.current;
        const ex2 = exercisesRef.current[exId2];
        if (ex2) {
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'left';
          for (const joint of Object.keys(ex2.joints)) {
            const jointAngle = getJointAngle(landmarks, joint);
            // Get the middle joint position for label placement
            const map: Record<string, number> = {
              left_elbow: LANDMARK.LEFT_ELBOW,
              right_elbow: LANDMARK.RIGHT_ELBOW,
              left_shoulder: LANDMARK.LEFT_SHOULDER,
              right_shoulder: LANDMARK.RIGHT_SHOULDER,
              left_hip: LANDMARK.LEFT_HIP,
              right_hip: LANDMARK.RIGHT_HIP,
              left_knee: LANDMARK.LEFT_KNEE,
              right_knee: LANDMARK.RIGHT_KNEE,
            };
            const idx = map[joint];
            if (idx !== undefined && landmarks[idx].visibility > 0.5) {
              const x = landmarks[idx].x * w + 10;
              const y = landmarks[idx].y * h - 10;
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.fillRect(x - 2, y - 14, 52, 18);
              ctx.fillStyle = '#fff';
              ctx.fillText(`${Math.round(jointAngle)}°`, x, y);
            }
          }
        }
      }
    } catch (err) {
      // skip frame errors
    }

    rafRef.current = requestAnimationFrame(detectPose);
  }, [language]);

  // Start/stop tracking
  const startTracking = () => {
    if (!selectedExercise) return;
    setIsTracking(true);
    setRep({ count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 });
    setSessionTime(0);
    isTrackingRef.current = true;
    rafRef.current = requestAnimationFrame(detectPose);
  };

  const stopTracking = () => {
    setIsTracking(false);
    isTrackingRef.current = false;
    cancelAnimationFrame(rafRef.current);
  };

  // Save session
  const saveSession = async () => {
    const ex = exercises[selectedExercise];
    if (!ex || rep.count === 0) return;
    try {
      await api.post('/pose/session', {
        exercise_name: ex.name,
        exercise_name_ar: ex.name_ar,
        total_reps: rep.count,
        good_reps: rep.good,
        bad_reps: rep.bad,
        avg_form_score: rep.formScore,
        duration_seconds: sessionTime,
        calories_burned: Math.round(rep.count * 3.5),
        feedback,
      });
    } catch {}
    stopCamera();
    onClose();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const exerciseList = Object.entries(exercises);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-5xl bg-dark-800 rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Camera size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {language === 'ar' ? '🎯 تتبع التمرين المباشر' : '🎯 Live Exercise Tracker'}
              </h2>
              <p className="text-xs text-gray-400">
                {language === 'ar' ? 'MediaPipe AI Pose Detection' : 'MediaPipe AI Pose Detection'}
              </p>
            </div>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }}
            className="w-9 h-9 rounded-full bg-dark-600 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-500 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Camera / Canvas Area */}
            <div className="lg:col-span-2 space-y-3">
              {/* Video area */}
              <div className="relative aspect-[4/3] bg-dark-900 rounded-xl overflow-hidden border border-white/10">
                {!isCameraOn ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    {isLoading ? (
                      <>
                        <div className="w-16 h-16 rounded-full border-4 border-healix-500/30 border-t-healix-500 animate-spin" />
                        <p className="text-gray-400 text-sm">
                          {language === 'ar' ? 'جاري تحميل MediaPipe...' : 'Loading MediaPipe...'}
                        </p>
                      </>
                    ) : error ? (
                      <>
                        <AlertTriangle size={48} className="text-red-400" />
                        <p className="text-red-400 text-sm text-center px-4">{error}</p>
                        <button onClick={initMediaPipe} className="btn-primary text-sm">
                          {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera size={48} className="text-gray-600" />
                        <p className="text-gray-400 text-sm">
                          {language === 'ar' ? 'اضغط لتشغيل الكاميرا' : 'Click to start camera'}
                        </p>
                        <button onClick={startCamera} className="btn-primary flex items-center gap-2">
                          <Camera size={16} />
                          {language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: isCameraOn && !isTracking ? 'block' : 'none', transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: isTracking ? 'block' : 'none', transform: 'scaleX(-1)' }}
                />

                {/* Live overlay stats */}
                {isTracking && (
                  <>
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-sm font-bold">LIVE</span>
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-white text-sm font-mono">{formatTime(sessionTime)}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{rep.count}</div>
                        <div className="text-[10px] text-gray-400">{language === 'ar' ? 'تكرار' : 'REPS'}</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${rep.formScore >= 80 ? 'text-emerald-400' : rep.formScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {rep.formScore}%
                        </div>
                        <div className="text-[10px] text-gray-400">{language === 'ar' ? 'فورم' : 'FORM'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">{rep.good}</div>
                        <div className="text-[10px] text-gray-400">{language === 'ar' ? 'صحيح' : 'GOOD'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{rep.bad}</div>
                        <div className="text-[10px] text-gray-400">{language === 'ar' ? 'خطأ' : 'BAD'}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {!isCameraOn ? (
                  <button onClick={startCamera} disabled={isLoading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    <Camera size={16} />
                    {language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}
                  </button>
                ) : !isTracking ? (
                  <>
                    <button onClick={startTracking} disabled={!selectedExercise}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      <Play size={16} />
                      {language === 'ar' ? 'بدء التتبع' : 'Start Tracking'}
                    </button>
                    <button onClick={stopCamera}
                      className="btn-secondary flex items-center gap-2">
                      <CameraOff size={16} />
                      {language === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={stopTracking}
                      className="btn-secondary flex items-center gap-2 !border-red-500/30 !text-red-400">
                      <Pause size={16} />
                      {language === 'ar' ? 'إيقاف' : 'Stop'}
                    </button>
                    <button onClick={() => {
                      setRep({ count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 });
                      setSessionTime(0);
                    }}
                      className="btn-secondary flex items-center gap-2">
                      <RotateCcw size={16} />
                      {language === 'ar' ? 'إعادة' : 'Reset'}
                    </button>
                    <button onClick={saveSession}
                      className="btn-primary flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-500">
                      <Check size={16} />
                      {language === 'ar' ? 'حفظ الجلسة' : 'Save Session'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Panel — Exercise Select + Stats */}
            <div className="space-y-3">
              {/* Exercise Selector */}
              <div className="bg-dark-700/50 rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Target size={16} className="text-healix-400" />
                  {language === 'ar' ? 'اختر التمرين' : 'Select Exercise'}
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {exerciseList.map(([id, ex]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedExercise(id);
                        setRep({ count: 0, good: 0, bad: 0, phase: 'idle', formScore: 100 });
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                        selectedExercise === id
                          ? 'bg-healix-500/20 border-healix-500/40 text-healix-300'
                          : 'bg-dark-600/40 border-white/5 text-gray-300 hover:border-white/10'
                      }`}
                    >
                      <div className="font-medium">{language === 'ar' ? ex.name_ar : ex.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {Object.keys(ex.joints).join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Angles */}
              {isTracking && Object.keys(angles).length > 0 && (
                <div className="bg-dark-700/50 rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" />
                    {language === 'ar' ? 'الزوايا المباشرة' : 'Live Angles'}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(angles).map(([joint, angle]) => {
                      const rule = exercises[selectedExercise]?.joints[joint];
                      const isOk = rule ? angle >= rule.min && angle <= rule.max : true;
                      return (
                        <div key={joint} className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{joint.replace('_', ' ')}</span>
                          <span className={`text-sm font-mono font-bold ${isOk ? 'text-emerald-400' : 'text-red-400'}`}>
                            {angle}°
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Session Stats */}
              <div className="bg-dark-700/50 rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  {language === 'ar' ? 'إحصائيات الجلسة' : 'Session Stats'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: language === 'ar' ? 'التكرارات' : 'Reps', value: rep.count, icon: <Zap size={14} className="text-healix-400" /> },
                    { label: language === 'ar' ? 'الوقت' : 'Time', value: formatTime(sessionTime), icon: <Timer size={14} className="text-cyan-400" /> },
                    { label: language === 'ar' ? 'صحيح' : 'Good', value: rep.good, icon: <Check size={14} className="text-emerald-400" /> },
                    { label: language === 'ar' ? 'خطأ' : 'Bad', value: rep.bad, icon: <AlertTriangle size={14} className="text-red-400" /> },
                    { label: language === 'ar' ? 'الفورم' : 'Form', value: `${rep.formScore}%`, icon: <Target size={14} className="text-amber-400" /> },
                    { label: language === 'ar' ? 'سعرات' : 'Calories', value: `${Math.round(rep.count * 3.5)}`, icon: <Flame size={14} className="text-orange-400" /> },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-600/40 border border-white/5">
                      {stat.icon}
                      <div>
                        <div className="text-white font-bold text-sm">{stat.value}</div>
                        <div className="text-[10px] text-gray-500">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {selectedExercise && exercises[selectedExercise] && (
                <div className="bg-dark-700/50 rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-amber-400" />
                    {language === 'ar' ? 'نصائح الفورم' : 'Form Tips'}
                  </h3>
                  <ul className="space-y-1.5">
                    {(language === 'ar'
                      ? exercises[selectedExercise].tips_ar
                      : exercises[selectedExercise].tips
                    ).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-healix-400 mt-0.5">▸</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Feedback */}
              {isTracking && feedback.length > 0 && (
                <div className={`rounded-xl border p-3 ${
                  feedback[0]?.startsWith('✅')
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  {feedback.map((f, i) => (
                    <p key={i} className="text-xs text-gray-300">{f}</p>
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
