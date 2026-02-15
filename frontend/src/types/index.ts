// ===== User Types =====
export interface User {
  _id: string;
  email: string;
  name: string;
  nameAr?: string;
  role: 'user' | 'admin';
  avatar?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  conditions: MedicalCondition[];
  medications: Medication[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  emergencyContact?: EmergencyContact;
  familyCode?: string;
  watchConnected: boolean;
  language: 'ar' | 'en';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  nameAr: string;
  severity: 'mild' | 'moderate' | 'severe';
  medications?: string[];
  notes?: string;
}

// ===== Auth =====
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  language: 'ar' | 'en';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ===== Exercise Types =====
export interface Exercise {
  _id: string;
  name: string;
  nameAr: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  description: string;
  descriptionAr: string;
  instructions: string[];
  instructionsAr: string[];
  videoUrl?: string;
  imageUrl?: string;
  warmupSets: string;
  workingSets: number;
  reps: string;
  restMinutes: string;
  alternatives: string[];
  tips: string;
  tipsAr: string;
  contraindications: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
}

export type ExerciseCategory = 
  | 'anterior_a' | 'anterior_b' | 'posterior_a' | 'posterior_b'
  | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'full_body';

export type MuscleGroup = 
  | 'chest' | 'shoulders' | 'back' | 'biceps' | 'triceps' 
  | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'forearms';

export interface WorkoutPlan {
  _id: string;
  userId: string;
  name: string;
  nameAr: string;
  day: string;
  exercises: WorkoutExercise[];
  duration: number;
  calories: number;
  safeLoadIndex?: number;
  createdAt: string;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: string;
  warmupSets: string;
  restMinutes: string;
  completed: boolean;
  notes?: string;
}

// ===== Nutrition Types =====
export interface NutritionPlan {
  _id: string;
  userId: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface Meal {
  _id: string;
  name: string;
  nameAr: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  time: string;
  consumed: boolean;
}

export interface FoodItem {
  name: string;
  nameAr: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ===== Medication Types =====
export interface Medication {
  _id: string;
  userId: string;
  name: string;
  nameAr?: string;
  dosage: string;
  frequency: string;
  time: string;
  beforeMeal: boolean;
  condition: string;
  notes?: string;
  taken: boolean;
  takenAt?: string;
  active: boolean;
}

// ===== Vital Signs =====
export interface VitalSigns {
  _id: string;
  userId: string;
  timestamp: string;
  heartRate: number;
  hrv: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation: number;
  bodyTemperature?: number;
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  stressLevel: number;
  sleepHours?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  status: HealthStatus;
}

export type HealthStatus = 'normal' | 'warning' | 'critical';

export interface VitalsTrend {
  date: string;
  heartRate: number;
  hrv: number;
  oxygenSaturation: number;
  stressLevel: number;
  steps: number;
  calories: number;
  status: HealthStatus;
}

// ===== Prediction Types =====
export interface HealthPrediction {
  _id: string;
  userId: string;
  timestamp: string;
  currentRisk: number;
  predictedRisk: number;
  riskTrend: 'improving' | 'stable' | 'worsening';
  factors: RiskFactor[];
  recommendations: string[];
  recommendationsAr: string[];
  scenarioComparisons: ScenarioComparison[];
  shapAnalysis: ShapAnalysis[];
}

export interface RiskFactor {
  name: string;
  nameAr: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface ScenarioComparison {
  scenario: string;
  scenarioAr: string;
  riskChange: number;
  timeframe: string;
  details: string;
  detailsAr: string;
}

export interface ShapAnalysis {
  feature: string;
  featureAr: string;
  value: number;
  contribution: number;
}

// ===== Chat Types =====
export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  timestamp: string;
  sources?: string[];
}

export interface ChatSession {
  _id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ===== Admin Types =====
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  highRiskUsers: number;
  averageCompliance: number;
  userGrowth: { date: string; count: number }[];
  riskDistribution: { level: string; count: number }[];
  conditionBreakdown: { condition: string; count: number }[];
}

export interface UserReport {
  user: User;
  vitalsTrend: VitalsTrend[];
  prediction: HealthPrediction;
  compliance: number;
  lastActive: string;
}

// ===== Socket Events =====
export interface SocketEvents {
  vitals_update: VitalSigns;
  alert: Alert;
  exercise_update: { exerciseId: string; completed: boolean };
  medication_reminder: Medication;
  chat_message: ChatMessage;
}

export interface Alert {
  _id: string;
  type: 'vital_warning' | 'vital_critical' | 'medication' | 'exercise' | 'emergency';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
}

// ===== Onboarding =====
export interface OnboardingData {
  personalInfo: {
    name: string;
    age: number;
    gender: 'male' | 'female';
    weight: number;
    height: number;
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
  };
  fitnessInfo: {
    level: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    daysPerWeek: number;
    preferredTime: string;
  };
  lifestyle: {
    sleepHours: number;
    stressLevel: number;
    dietType: string;
    waterIntake: number;
  };
  emergencyContact: EmergencyContact;
  watchData?: {
    connected: boolean;
    type?: string;
  };
}
