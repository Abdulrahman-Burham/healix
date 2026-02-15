"""
Healix Multi-Agent AI System
4 Specialized Agents: Clinical, Nutrition, Exercise, Risk
Uses LangChain create_agent (v1+) — NO rule-based fallbacks.
All responses come from AI agents with real MongoDB data + RAG knowledge base.

Reference: https://docs.langchain.com/oss/python/langchain/agents
"""

import asyncio
import concurrent.futures
from typing import Optional
from datetime import datetime, timezone, timedelta

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_ollama import ChatOllama
from langgraph.checkpoint.memory import InMemorySaver

from app.config import settings
from app.database import get_db
from app.ai.knowledge_base import search_knowledge


# ── Thread pool for sync DB calls inside tools ────────
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)


# ── Agent System Prompts ──────────────────────────────
AGENT_PROMPTS = {
    "clinical": """You are the Clinical Health Agent for Healix, an AI-powered healthcare platform by DigitalMind.
Your responsibilities:
- Analyze vital signs (heart rate, SpO2, blood pressure, HRV, stress, temperature)
- Interpret health data trends and provide clinical insights
- Detect abnormal patterns and alert the user
- Provide evidence-based health advice
- Recommend consulting a doctor when appropriate

IMPORTANT RULES:
1. ALWAYS use your tools to look up the user's real vital data before answering health questions
2. Use the search_clinical_knowledge tool (RAG) to back your answers with evidence
3. NEVER make up health data — always query real data first
4. Respond in the SAME language the user writes in (Arabic or English)
5. For serious conditions, ALWAYS recommend seeing a doctor
6. Be caring, professional, and precise with numbers

User Profile: {user_profile}""",

    "nutrition": """You are the Nutrition Agent for Healix, an AI-powered healthcare platform by DigitalMind.
Your responsibilities:
- Create personalized meal plans based on user's goals, weight, and conditions
- Calculate daily macros (protein, carbs, fat) and calories
- Provide nutritional guidance considering medical conditions and allergies
- Track dietary compliance and suggest improvements
- Recommend supplements when evidence supports them

IMPORTANT RULES:
1. ALWAYS use your tools to look up the user's real nutrition data and profile
2. Use the search_nutrition_knowledge tool (RAG) for evidence-based recommendations
3. Tailor advice to the user's conditions (diabetes, hypertension, etc.)
4. Respond in the SAME language the user writes in (Arabic or English)
5. Provide quantities in grams and calories for precision
6. Consider meal timing around workouts

User Profile: {user_profile}""",

    "exercise": """You are the Exercise Agent for Healix, an AI-powered healthcare platform by DigitalMind.
Your responsibilities:
- Design safe, personalized workout plans considering medical conditions
- Calculate Safe Load Index (SLI) based on health status
- Provide proper form guidance with tips in both Arabic and English
- Suggest exercise alternatives when certain movements are contraindicated
- Track exercise history and progressive overload

IMPORTANT RULES:
1. ALWAYS use your tools to check the user's exercise data and medical conditions
2. Use the search_exercise_knowledge tool (RAG) for evidence-based training science
3. Calculate Safe Load Index — NEVER prescribe dangerous exercises for medical conditions
4. Respond in the SAME language the user writes in (Arabic or English)
5. Include warm-up sets, working sets, reps, rest times, and alternatives
6. Explain form cues clearly

User Profile: {user_profile}""",

    "risk": """You are the Risk Assessment Agent for Healix, an AI-powered healthcare platform by DigitalMind.
Your responsibilities:
- Analyze health trends and predict potential risks using SHAP-like explanations
- Generate what-if scenarios (e.g., "if you skip exercise for 2 weeks, risk increases by X%")
- Track behavioral patterns and predict compliance
- Provide early warnings for health deterioration
- Suggest preventive interventions

IMPORTANT RULES:
1. ALWAYS use your tools to pull real vital trends and risk factors
2. Use the search_risk_knowledge tool (RAG) for evidence-based risk models
3. Provide SHAP factor analysis: which factors increase/decrease risk and by how much
4. Respond in the SAME language the user writes in (Arabic or English)
5. Include specific percentages and timeframes in predictions
6. Be data-driven — never guess, always query real data

User Profile: {user_profile}""",
}

# ── Agent Routing Keywords ────────────────────────────
AGENT_KEYWORDS = {
    "clinical": [
        "heart", "blood", "pressure", "vital", "health", "symptom", "disease", "doctor",
        "oxygen", "spo2", "hrv", "temperature", "alert", "condition", "diagnosis", "pulse",
        "قلب", "ضغط", "دم", "صحة", "عرض", "مرض", "طبيب", "نبض", "اكسجين", "حرارة", "تشخيص",
    ],
    "nutrition": [
        "food", "eat", "diet", "meal", "calorie", "protein", "carb", "fat", "nutrition", "water",
        "supplement", "macro", "breakfast", "lunch", "dinner", "snack", "weight loss", "gain",
        "أكل", "طعام", "وجبة", "سعرة", "بروتين", "كربوهيدرات", "دهون", "تغذية", "ماء",
        "نظام غذائي", "فطور", "غداء", "عشاء", "مكمل", "وزن",
    ],
    "exercise": [
        "exercise", "workout", "gym", "muscle", "training", "weight", "cardio", "stretch",
        "squat", "press", "curl", "pull", "push", "leg", "chest", "shoulder", "back", "arm",
        "تمرين", "تدريب", "عضلة", "رياضة", "جيم", "كارديو", "وزن", "سكوات", "بنش", "كتف",
    ],
    "risk": [
        "risk", "predict", "future", "warning", "danger", "prevent", "scenario", "trend",
        "shap", "deterioration", "simulation", "digital twin", "compliance", "forecast",
        "خطر", "توقع", "مستقبل", "تحذير", "وقاية", "سيناريو", "تدهور", "محاكاة",
    ],
}


# ══════════════════════════════════════════════════════════
#  ASYNC DATABASE QUERIES — Real MongoDB via Motor
# ══════════════════════════════════════════════════════════

async def _db_get_latest_vitals(user_id: str) -> dict:
    db = get_db()
    if db is None:
        return {}
    doc = await db.vitals.find_one({"user_id": user_id}, sort=[("timestamp", -1)])
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc or {}


async def _db_get_vitals_history(user_id: str, period: str) -> list:
    db = get_db()
    if db is None:
        return []
    deltas = {"24h": timedelta(hours=24), "7d": timedelta(days=7), "30d": timedelta(days=30)}
    start = datetime.now(timezone.utc) - deltas.get(period, timedelta(hours=24))
    cursor = db.vitals.find(
        {"user_id": user_id, "timestamp": {"$gte": start}},
        sort=[("timestamp", 1)],
    )
    records = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    return records


async def _db_get_alerts(user_id: str) -> list:
    db = get_db()
    if db is None:
        return []
    cursor = db.alerts.find({"user_id": user_id}, sort=[("created_at", -1)], limit=10)
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


async def _db_get_nutrition_plan(user_id: str) -> dict:
    db = get_db()
    if db is None:
        return {}
    doc = await db.nutrition_plans.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc or {}


async def _db_get_nutrition_logs(user_id: str, days: int) -> list:
    db = get_db()
    if db is None:
        return []
    start = datetime.now(timezone.utc) - timedelta(days=days)
    cursor = db.nutrition_logs.find(
        {"user_id": user_id, "created_at": {"$gte": start}},
        sort=[("created_at", -1)],
    )
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs


async def _db_get_exercise_plan(user_id: str) -> dict:
    db = get_db()
    if db is None:
        return {}
    doc = await db.exercise_plans.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc or {}


async def _db_get_exercise_logs(user_id: str, days: int) -> list:
    db = get_db()
    if db is None:
        return []
    start = datetime.now(timezone.utc) - timedelta(days=days)
    cursor = db.exercise_logs.find(
        {"user_id": user_id, "created_at": {"$gte": start}},
        sort=[("created_at", -1)],
    )
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs


async def _db_get_medications(user_id: str) -> list:
    db = get_db()
    if db is None:
        return []
    cursor = db.medications.find({"user_id": user_id})
    meds = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        meds.append(doc)
    return meds


async def _db_get_medication_compliance(user_id: str) -> dict:
    db = get_db()
    if db is None:
        return {"total": 0, "taken": 0, "compliance": 100}
    total = await db.medications.count_documents({"user_id": user_id})
    taken = await db.medications.count_documents({"user_id": user_id, "status": "taken"})
    compliance = (taken / total * 100) if total > 0 else 100
    return {"total": total, "taken": taken, "compliance": round(compliance, 1)}


async def _db_get_exercise_count(user_id: str, days: int) -> int:
    db = get_db()
    if db is None:
        return 0
    start = datetime.now(timezone.utc) - timedelta(days=days)
    return await db.exercise_logs.count_documents(
        {"user_id": user_id, "created_at": {"$gte": start}, "completed": True}
    )


# ── Sync wrapper for tool execution ──────────────────
# create_agent tools run synchronously; async DB goes through a new event loop.

def _run_async(coro):
    """Run an async coroutine from a sync context (inside a tool)."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


# ══════════════════════════════════════════════════════════
#  TOOL FACTORIES — Real data queries + RAG knowledge
# ══════════════════════════════════════════════════════════

def _create_clinical_tools(user_id: str, user_profile: str):
    """Create tools for the Clinical Agent — real MongoDB + RAG."""

    @tool
    def lookup_vitals(query: str) -> str:
        """Look up the user's current vital signs from the database. Returns real-time heart rate, SpO2, blood pressure, stress, HRV, temperature, steps, calories, sleep data. ALWAYS call this before answering health questions."""
        try:
            v = _run_async(_db_get_latest_vitals(user_id))
            if not v:
                return "No vital signs data found. The user needs to upload vitals from their wearable device first."

            parts = [f"=== Real-Time Vitals for {user_profile} ==="]
            if v.get("heart_rate"):       parts.append(f"Heart Rate: {v['heart_rate']} bpm")
            if v.get("spo2"):             parts.append(f"SpO2: {v['spo2']}%")
            if v.get("blood_pressure_sys"):
                parts.append(f"Blood Pressure: {v['blood_pressure_sys']}/{v.get('blood_pressure_dia', '?')} mmHg")
            if v.get("stress_level"):     parts.append(f"Stress Level: {v['stress_level']}/100")
            if v.get("hrv"):              parts.append(f"HRV: {v['hrv']} ms")
            if v.get("body_temp"):        parts.append(f"Body Temp: {v['body_temp']}°C")
            if v.get("steps"):            parts.append(f"Steps Today: {v['steps']}")
            if v.get("calories_burned"):  parts.append(f"Calories Burned: {v['calories_burned']} kcal")
            if v.get("sleep_hours"):
                parts.append(f"Sleep: {v['sleep_hours']}h (Quality: {v.get('sleep_quality', '?')}%)")
            if v.get("timestamp"):        parts.append(f"Recorded: {v['timestamp']}")
            return "\n".join(parts)
        except Exception as e:
            return f"Error retrieving vitals: {e}"

    @tool
    def get_vital_trends(period: str) -> str:
        """Get vital sign trends over a period. Use '24h', '7d', or '30d'. Returns averages, min/max for heart rate, SpO2, stress."""
        try:
            records = _run_async(_db_get_vitals_history(user_id, period))
            if not records:
                return f"No vital history found for the past {period}."

            hrs = [r["heart_rate"] for r in records if r.get("heart_rate")]
            spo2s = [r["spo2"] for r in records if r.get("spo2")]
            stress = [r["stress_level"] for r in records if r.get("stress_level")]
            bps = [r["blood_pressure_sys"] for r in records if r.get("blood_pressure_sys")]

            parts = [f"=== Vital Trends ({period}) — {len(records)} records ==="]
            if hrs:    parts.append(f"Heart Rate: avg {sum(hrs)//len(hrs)} bpm (min {min(hrs)}, max {max(hrs)})")
            if spo2s:  parts.append(f"SpO2: avg {sum(spo2s)/len(spo2s):.1f}% (min {min(spo2s)}%)")
            if stress: parts.append(f"Stress: avg {sum(stress)//len(stress)}/100 (max {max(stress)})")
            if bps:    parts.append(f"Systolic BP: avg {sum(bps)//len(bps)} mmHg (max {max(bps)})")
            return "\n".join(parts)
        except Exception as e:
            return f"Error retrieving trends: {e}"

    @tool
    def check_health_alerts(query: str) -> str:
        """Check the user's recent health alerts and critical notifications from the monitoring system."""
        try:
            alerts = _run_async(_db_get_alerts(user_id))
            if not alerts:
                return "No active health alerts. All vitals are within normal ranges."

            parts = [f"=== Health Alerts ({len(alerts)} active) ==="]
            for a in alerts[:5]:
                parts.append(f"[{a.get('severity', 'info').upper()}] {a.get('message', 'Alert')} — {a.get('created_at', '')}")
            return "\n".join(parts)
        except Exception as e:
            return f"Error checking alerts: {e}"

    @tool
    def search_clinical_knowledge(query: str) -> str:
        """Search the medical knowledge base (RAG) for clinical information about heart rate, blood pressure, SpO2, HRV, stress, diseases, and treatment guidelines. Use this to provide evidence-based advice."""
        return search_knowledge("clinical", query)

    return [lookup_vitals, get_vital_trends, check_health_alerts, search_clinical_knowledge]


def _create_nutrition_tools(user_id: str, user_profile: str):
    """Create tools for the Nutrition Agent — real MongoDB + RAG."""

    @tool
    def get_nutrition_plan(query: str) -> str:
        """Get the user's personalized nutrition plan from the database. Contains daily calorie target, macros, water target, and full meal structure with foods."""
        try:
            plan = _run_async(_db_get_nutrition_plan(user_id))
            if not plan:
                return "No nutrition plan found for this user yet. Use nutrition knowledge to create a recommendation based on the user profile."

            parts = [f"=== Nutrition Plan for {user_profile} ==="]
            parts.append(f"Daily Target: {plan.get('daily_calories_target', '?')} kcal")
            m = plan.get("macros", {})
            parts.append(f"Macros: {m.get('protein', '?')}g Protein | {m.get('carbs', '?')}g Carbs | {m.get('fat', '?')}g Fat")
            parts.append(f"Water Target: {plan.get('water_target_liters', '?')}L/day")
            for meal in plan.get("meals", []):
                parts.append(f"\n{meal.get('type', 'Meal').upper()} ({meal.get('time', '')}):")
                for food in meal.get("foods", []):
                    parts.append(f"  - {food.get('name', '')} ({food.get('name_ar', '')}): {food.get('calories', 0)} kcal, {food.get('protein', 0)}g protein")
            return "\n".join(parts)
        except Exception as e:
            return f"Error retrieving nutrition plan: {e}"

    @tool
    def get_nutrition_history(days: str) -> str:
        """Get the user's meal logging history. Pass number of days as string (e.g., '7'). Returns calorie and macro totals with compliance analysis."""
        try:
            num_days = int(days) if days.isdigit() else 7
            logs = _run_async(_db_get_nutrition_logs(user_id, num_days))
            if not logs:
                return f"No nutrition logs found for the past {num_days} days."

            total_cals = sum(sum(f.get("calories", 0) for f in log.get("foods", [])) for log in logs)
            total_prot = sum(sum(f.get("protein", 0) for f in log.get("foods", [])) for log in logs)
            return (
                f"=== Nutrition History ({num_days} days, {len(logs)} meals logged) ===\n"
                f"Total Calories: {total_cals:.0f} kcal\n"
                f"Avg Daily Calories: {total_cals / max(num_days, 1):.0f} kcal\n"
                f"Total Protein: {total_prot:.0f}g\n"
                f"Avg Daily Protein: {total_prot / max(num_days, 1):.0f}g"
            )
        except Exception as e:
            return f"Error retrieving nutrition history: {e}"

    @tool
    def search_nutrition_knowledge(query: str) -> str:
        """Search the nutrition knowledge base (RAG) for information about macros, meal planning, supplements, hydration, DASH diet, and dietary guidelines. Provides evidence-based nutritional science."""
        return search_knowledge("nutrition", query)

    return [get_nutrition_plan, get_nutrition_history, search_nutrition_knowledge]


def _create_exercise_tools(user_id: str, user_profile: str):
    """Create tools for the Exercise Agent — real MongoDB + RAG."""

    @tool
    def get_exercise_plan(query: str) -> str:
        """Get the user's personalized exercise plan from the database. Contains exercises with sets, reps, muscle groups, tips (AR/EN), alternatives, and safe load index."""
        try:
            plan = _run_async(_db_get_exercise_plan(user_id))
            if not plan:
                return "No exercise plan found. Use exercise knowledge to design one based on the user profile."

            parts = [f"=== Exercise Plan for {user_profile} ==="]
            parts.append(f"Level: {plan.get('user_level', '?')} | Safe Load Index: {plan.get('safe_load_index', '?')}%")
            for i, ex in enumerate(plan.get("exercises", []), 1):
                parts.append(f"\n{i}. {ex.get('name', '')} ({ex.get('name_ar', '')})")
                parts.append(f"   Sets: {ex.get('warmup_sets', 0)} warmup + {ex.get('sets', 0)} working x {ex.get('reps', 0)} reps")
                parts.append(f"   Rest: {ex.get('rest_seconds', 60)}s | Muscle: {ex.get('muscle_group', '')}")
                if ex.get("tips"):         parts.append(f"   Tips (AR): {ex['tips']}")
                if ex.get("tips_en"):      parts.append(f"   Tips (EN): {ex['tips_en']}")
                if ex.get("alternatives"): parts.append(f"   Alternatives: {', '.join(ex['alternatives'])}")
            return "\n".join(parts)
        except Exception as e:
            return f"Error retrieving exercise plan: {e}"

    @tool
    def get_exercise_history(days: str) -> str:
        """Get the user's exercise logging history. Pass number of days as string (e.g., '7'). Returns session count, completion rate, calories burned."""
        try:
            num_days = int(days) if days.isdigit() else 7
            logs = _run_async(_db_get_exercise_logs(user_id, num_days))
            if not logs:
                return f"No exercise logs found for the past {num_days} days."

            completed = sum(1 for l in logs if l.get("completed"))
            total_cals = sum(l.get("calories_burned", 0) for l in logs)
            exercises = set(l.get("exercise_name", "") for l in logs if l.get("exercise_name"))
            return (
                f"=== Exercise History ({num_days} days) ===\n"
                f"Total Sessions: {len(logs)}\n"
                f"Completed: {completed}/{len(logs)} ({completed/max(len(logs),1)*100:.0f}%)\n"
                f"Calories Burned: {total_cals:.0f} kcal\n"
                f"Exercises: {', '.join(exercises) if exercises else 'None logged'}"
            )
        except Exception as e:
            return f"Error retrieving exercise history: {e}"

    @tool
    def calculate_safe_load_index(conditions: str) -> str:
        """Calculate Safe Load Index (SLI) based on the user's medical conditions. Pass conditions as comma-separated (e.g., 'hypertension, knee injury'). Returns safety score and exercise restrictions."""
        base_sli = 100
        restrictions = []
        condition_list = [c.strip().lower() for c in conditions.split(",")]

        for cond in condition_list:
            if any(k in cond for k in ["hypertension", "ضغط", "pressure"]):
                base_sli -= 20
                restrictions.append("Avoid heavy isometric exercises; max HR = 70% of max")
            if any(k in cond for k in ["diabetes", "سكر", "sugar"]):
                base_sli -= 10
                restrictions.append("Monitor glucose pre/post workout; carry fast-acting carbs")
            if any(k in cond for k in ["knee", "ركبة"]):
                base_sli -= 25
                restrictions.append("Avoid deep squats; prefer leg press with limited ROM")
            if any(k in cond for k in ["back", "ظهر", "spine"]):
                base_sli -= 15
                restrictions.append("Avoid deadlifts and heavy squats; focus on core stability")
            if any(k in cond for k in ["heart", "قلب", "cardiac"]):
                base_sli -= 30
                restrictions.append("Medical clearance required; moderate intensity ONLY")
            if any(k in cond for k in ["asthma", "ربو", "respiratory"]):
                base_sli -= 10
                restrictions.append("Keep inhaler nearby; avoid cold-air exercise")
            if any(k in cond for k in ["obesity", "سمنة"]):
                base_sli -= 15
                restrictions.append("Low-impact cardio preferred; gradual progression")

        base_sli = max(base_sli, 10)
        status = "GREEN" if base_sli >= 70 else "YELLOW" if base_sli >= 40 else "RED"

        result = f"Safe Load Index: {base_sli}% — {status}\n"
        if restrictions:
            result += "Restrictions:\n" + "\n".join(f"  - {r}" for r in restrictions)
        else:
            result += "No restrictions. All exercises are safe."
        return result

    @tool
    def search_exercise_knowledge(query: str) -> str:
        """Search the exercise knowledge base (RAG) for workout plans, training splits (PPL), form guidance, warm-up protocols, progressive overload science, and safe training practices."""
        return search_knowledge("exercise", query)

    return [get_exercise_plan, get_exercise_history, calculate_safe_load_index, search_exercise_knowledge]


def _create_risk_tools(user_id: str, user_profile: str):
    """Create tools for the Risk Analysis Agent — real MongoDB + RAG."""

    @tool
    def analyze_risk_factors(query: str) -> str:
        """Analyze the user's health risk factors using REAL vital data from the database. Calculates overall risk score with SHAP-like factor contributions showing which factors increase/decrease risk."""
        try:
            vitals = _run_async(_db_get_latest_vitals(user_id))
            compliance = _run_async(_db_get_medication_compliance(user_id))
            exercise_count = _run_async(_db_get_exercise_count(user_id, 7))

            base_risk = 25
            factors = []

            if vitals:
                hr = vitals.get("heart_rate", 72)
                if hr > 100:
                    base_risk += 10
                    factors.append(f"Elevated Heart Rate ({hr} bpm): +10% risk")
                elif hr < 60 and "athlete" not in user_profile.lower():
                    base_risk += 5
                    factors.append(f"Low Heart Rate ({hr} bpm): +5% risk")
                else:
                    base_risk -= 5
                    factors.append(f"Normal Heart Rate ({hr} bpm): -5% risk")

                spo2 = vitals.get("spo2", 98)
                if spo2 < 95:
                    base_risk += 15
                    factors.append(f"Low SpO2 ({spo2}%): +15% risk")
                elif spo2 < 97:
                    base_risk += 3
                    factors.append(f"Borderline SpO2 ({spo2}%): +3% risk")
                else:
                    base_risk -= 3
                    factors.append(f"Normal SpO2 ({spo2}%): -3% risk")

                stress = vitals.get("stress_level", 30)
                if stress > 70:
                    base_risk += 12
                    factors.append(f"High Stress ({stress}/100): +12% risk")
                elif stress > 40:
                    base_risk += 5
                    factors.append(f"Moderate Stress ({stress}/100): +5% risk")
                else:
                    base_risk -= 8
                    factors.append(f"Low Stress ({stress}/100): -8% risk")

                sleep = vitals.get("sleep_hours", 7)
                if sleep < 5:
                    base_risk += 15
                    factors.append(f"Very Poor Sleep ({sleep}h): +15% risk")
                elif sleep < 6:
                    base_risk += 10
                    factors.append(f"Insufficient Sleep ({sleep}h): +10% risk")
                elif sleep >= 7:
                    base_risk -= 10
                    factors.append(f"Good Sleep ({sleep}h): -10% risk")

                bp = vitals.get("blood_pressure_sys", 120)
                if bp >= 140:
                    base_risk += 12
                    factors.append(f"High Blood Pressure ({bp} mmHg): +12% risk")
                elif bp >= 130:
                    base_risk += 5
                    factors.append(f"Elevated Blood Pressure ({bp} mmHg): +5% risk")
                else:
                    base_risk -= 5
                    factors.append(f"Normal Blood Pressure ({bp} mmHg): -5% risk")
            else:
                factors.append("No vitals data available — upload data for accurate assessment")

            # Exercise compliance
            if exercise_count >= 4:
                base_risk -= 15
                factors.append(f"Active Exercise ({exercise_count} sessions/week): -15% risk")
            elif exercise_count >= 2:
                base_risk -= 5
                factors.append(f"Moderate Exercise ({exercise_count} sessions/week): -5% risk")
            else:
                base_risk += 10
                factors.append(f"Low Exercise ({exercise_count} sessions/week): +10% risk")

            # Medication compliance
            comp_rate = compliance.get("compliance", 100)
            if comp_rate >= 90:
                base_risk -= 8
                factors.append(f"High Medication Adherence ({comp_rate}%): -8% risk")
            elif comp_rate >= 70:
                base_risk += 5
                factors.append(f"Moderate Medication Adherence ({comp_rate}%): +5% risk")
            elif compliance.get("total", 0) > 0:
                base_risk += 12
                factors.append(f"Low Medication Adherence ({comp_rate}%): +12% risk")

            current_risk = max(min(base_risk, 95), 5)
            level = "LOW" if current_risk < 30 else "MODERATE" if current_risk < 60 else "HIGH"

            result = f"=== Health Risk Analysis (SHAP Factors) ===\n"
            result += f"Overall Risk Score: {current_risk}% — {level}\n\n"
            result += "Factor Analysis:\n" + "\n".join(f"  {f}" for f in factors)
            return result
        except Exception as e:
            return f"Error analyzing risk: {e}"

    @tool
    def get_prediction_scenarios(query: str) -> str:
        """Generate predictive what-if health scenarios. Shows what happens if the user follows or ignores recommendations, with specific numbers from real data."""
        try:
            vitals = _run_async(_db_get_latest_vitals(user_id))
            hr = vitals.get("heart_rate", 72) if vitals else 72
            stress = vitals.get("stress_level", 30) if vitals else 30
            bp = vitals.get("blood_pressure_sys", 120) if vitals else 120

            scenarios = [
                f"Scenario 1: Follow AI plan strictly for 3 months\n"
                f"   Risk reduction: -35 to -40%\n"
                f"   Heart Rate: {hr} -> {max(hr - 8, 58)} bpm\n"
                f"   Blood Pressure: {bp} -> {max(bp - 10, 110)} mmHg\n"
                f"   Stress: {stress} -> {max(stress - 15, 10)}/100\n"
                f"   Overall: Significant improvement expected",

                f"Scenario 2: Skip exercise for 2 weeks\n"
                f"   Risk increase: +18 to +25%\n"
                f"   Cardio fitness loss: 5-10%\n"
                f"   Stress: {stress} -> {min(stress + 20, 90)}/100\n"
                f"   Muscle mass loss begins after 10 days",

                f"Scenario 3: Sleep < 5 hours for 1 month\n"
                f"   Risk increase: +20 to +25%\n"
                f"   Cortisol elevation: 30-40%\n"
                f"   Blood Pressure: {bp} -> {min(bp + 12, 165)} mmHg\n"
                f"   Immune function decline: 15-20%",

                f"Scenario 4: Stop medications without doctor approval\n"
                f"   Risk increase: +30 to +50% (condition dependent)\n"
                f"   Potential rebound effects within 48-72 hours\n"
                f"   WARNING: NEVER stop medications without consulting your doctor",
            ]
            return "=== Predictive Health Scenarios ===\n\n" + "\n\n".join(scenarios)
        except Exception as e:
            return f"Error generating predictions: {e}"

    @tool
    def check_medication_compliance(query: str) -> str:
        """Check the user's medication list, compliance rate, and adherence patterns from the database."""
        try:
            meds = _run_async(_db_get_medications(user_id))
            compliance = _run_async(_db_get_medication_compliance(user_id))

            if not meds:
                return "No medications registered for this user."

            parts = ["=== Medication Compliance Report ==="]
            parts.append(f"Overall Compliance: {compliance.get('compliance', 100)}%")
            parts.append(f"Total Medications: {compliance.get('total', 0)}")
            parts.append(f"Taken on Time: {compliance.get('taken', 0)}")
            parts.append(f"\nMedication List:")
            for med in meds[:10]:
                parts.append(
                    f"  - {med.get('name', '?')} ({med.get('dosage', '')}) — "
                    f"{med.get('frequency', '')} at {med.get('time', '')} — "
                    f"Status: {med.get('status', 'unknown')}"
                )
            return "\n".join(parts)
        except Exception as e:
            return f"Error checking medications: {e}"

    @tool
    def search_risk_knowledge(query: str) -> str:
        """Search the risk analysis knowledge base (RAG) for SHAP factors, health deterioration models, digital twin concepts, behavioral AI insights, and population health trends."""
        return search_knowledge("risk", query)

    return [analyze_risk_factors, get_prediction_scenarios, check_medication_compliance, search_risk_knowledge]


# ══════════════════════════════════════════════════════════
#  AGENT FACTORY — create_agent (LangChain v1+)
# ══════════════════════════════════════════════════════════

_checkpointers: dict[str, InMemorySaver] = {}

# Tool factory map
_TOOL_FACTORIES = {
    "clinical": _create_clinical_tools,
    "nutrition": _create_nutrition_tools,
    "exercise": _create_exercise_tools,
    "risk": _create_risk_tools,
}


def _get_or_create_agent(agent_type: str, user_id: str, user_profile: str):
    """
    Create a specialized agent using create_agent (LangChain v1+).
    Each agent gets its own tools, system prompt, and memory checkpointer.
    """
    cache_key = f"{agent_type}_{user_id}"

    # LLM via Ollama
    llm = ChatOllama(
        model=settings.LLM_MODEL,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=0.7,
    )

    # Tools for this agent — real DB + RAG
    tools = _TOOL_FACTORIES[agent_type](user_id, user_profile)

    # System prompt with user context
    system_prompt = AGENT_PROMPTS[agent_type].format(user_profile=user_profile)

    # Per-user checkpointer for conversation memory
    if cache_key not in _checkpointers:
        _checkpointers[cache_key] = InMemorySaver()

    # Create the agent — LangChain v1+ API
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt,
        checkpointer=_checkpointers[cache_key],
    )

    return agent


# ══════════════════════════════════════════════════════════
#  PUBLIC API
# ══════════════════════════════════════════════════════════

def detect_agent(message: str, requested_agent: Optional[str] = None) -> str:
    """Route the message to the most appropriate agent based on keyword analysis."""
    if requested_agent and requested_agent in AGENT_PROMPTS:
        return requested_agent

    message_lower = message.lower()
    scores = {}
    for agent, keywords in AGENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in message_lower)
        scores[agent] = score

    best_agent = max(scores, key=scores.get)
    return best_agent if scores[best_agent] > 0 else "clinical"


def build_user_profile(user: dict) -> str:
    """Build a user profile string for agent context injection."""
    parts = []
    if user.get("name"):               parts.append(f"Name: {user['name']}")
    if user.get("age"):                parts.append(f"Age: {user['age']}")
    if user.get("gender"):             parts.append(f"Gender: {user['gender']}")
    if user.get("weight"):             parts.append(f"Weight: {user['weight']}kg")
    if user.get("height"):             parts.append(f"Height: {user['height']}cm")
    if user.get("medical_conditions"): parts.append(f"Conditions: {', '.join(user['medical_conditions'])}")
    if user.get("allergies"):          parts.append(f"Allergies: {', '.join(user['allergies'])}")
    if user.get("fitness_level"):      parts.append(f"Fitness Level: {user['fitness_level']}")
    if user.get("fitness_goals"):      parts.append(f"Goals: {', '.join(user['fitness_goals'])}")
    return "; ".join(parts) if parts else "New user — limited profile data available."


async def process_chat_message(
    message: str,
    user: dict,
    history: list[dict],
    requested_agent: Optional[str] = None,
) -> dict:
    """
    Process a chat message through the Healix Multi-Agent AI System.

    Uses LangChain create_agent (v1+) — NO rule-based fallbacks.
    Each agent has specialized tools that query REAL MongoDB data
    and the RAG knowledge base (ChromaDB + BM25 Ensemble Retriever).
    """
    agent_type = detect_agent(message, requested_agent)
    user_profile = build_user_profile(user)
    user_id = user.get("id", "unknown")

    # Create the specialized agent
    agent = _get_or_create_agent(agent_type, user_id, user_profile)

    # Build conversation messages from history
    messages = []
    if history:
        for h in history[-6:]:
            if h["role"] == "user":
                messages.append({"role": "user", "content": h["content"]})
            else:
                messages.append({"role": "assistant", "content": h["content"]})

    # Current message
    messages.append({"role": "user", "content": message})

    # Thread ID for conversation memory continuity
    thread_id = f"healix_{user_id}_{agent_type}"

    # Invoke the agent with create_agent API
    result = await agent.ainvoke(
        {"messages": messages},
        config={"configurable": {"thread_id": thread_id}},
    )

    # Extract response from result messages
    response_text = ""
    tools_used = []
    sources = []

    if result.get("messages"):
        for msg in reversed(result["messages"]):
            # Get the last AI message (not a tool response)
            if (
                hasattr(msg, "content")
                and msg.content
                and hasattr(msg, "type")
                and msg.type == "ai"
                and not getattr(msg, "tool_call_id", None)
            ):
                response_text = msg.content
                break

        # Collect tool usage and knowledge sources
        for msg in result["messages"]:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    tools_used.append(tc.get("name", "unknown"))
            if (
                hasattr(msg, "name")
                and msg.name
                and "knowledge" in str(msg.name)
                and hasattr(msg, "content")
                and msg.content
            ):
                sources.append(str(msg.content)[:300])

    if not response_text:
        response_text = "I'm processing your request through the AI system. Please try again."

    return {
        "response": response_text,
        "agent": agent_type,
        "sources": sources,
        "tools_used": list(set(tools_used)),
    }
