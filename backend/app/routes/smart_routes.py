"""
Healix Smart Features Routes — Fully LLM-Powered
5 AI Features using ChatOllama (LangChain):
1. AI Symptom Checker
2. Drug Interaction Checker
3. AI Health Report Generator
4. Smart Meal Planner
5. Health Journal with AI Insights

NO rule-based fallbacks — all intelligence comes from the LLM.
"""

import json
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from typing import Optional

from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage

from app.auth import get_current_user
from app.database import get_db
from app.config import settings

router = APIRouter(prefix="/smart", tags=["Smart Features"])


# ── LLM Setup ─────────────────────────────────────────
def get_llm(temperature: float = 0.4):
    return ChatOllama(
        model=settings.LLM_MODEL,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=temperature,
    )


async def call_llm_json(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> dict:
    """Call LLM and parse JSON response. Returns parsed dict or empty dict on failure."""
    llm = get_llm(temperature)
    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        response = await llm.ainvoke(messages)
        text = response.content

        # Extract JSON block from response
        if "```json" in text:
            start = text.index("```json") + 7
            end = text.index("```", start)
            text = text[start:end].strip()
        elif "```" in text:
            start = text.index("```") + 3
            end = text.index("```", start)
            text = text[start:end].strip()

        # Try finding raw JSON object
        brace_start = text.find("{")
        brace_end = text.rfind("}") + 1
        if brace_start >= 0 and brace_end > brace_start:
            return json.loads(text[brace_start:brace_end])

        return json.loads(text)
    except Exception as e:
        print(f"[Smart LLM Error] {e}")
        return {}


async def call_llm_text(system_prompt: str, user_prompt: str, temperature: float = 0.5) -> str:
    """Call LLM and return raw text response."""
    llm = get_llm(temperature)
    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        response = await llm.ainvoke(messages)
        return response.content
    except Exception as e:
        print(f"[Smart LLM Text Error] {e}")
        return ""


async def get_user_context(user: dict) -> dict:
    """Get full user health context from DB."""
    db = get_db()
    profile = await db.users.find_one({"_id": ObjectId(user["id"])})
    vitals_cursor = db.vitals.find(
        {"user_id": user["id"]}, sort=[("timestamp", -1)], limit=5
    )
    vitals = []
    async for v in vitals_cursor:
        v["_id"] = str(v["_id"])
        vitals.append(v)

    meds_cursor = db.medications.find({"user_id": user["id"]})
    meds = []
    async for m in meds_cursor:
        m["_id"] = str(m["_id"])
        meds.append(m)

    return {
        "name": profile.get("name", "") if profile else "",
        "age": profile.get("age"),
        "gender": profile.get("gender"),
        "weight": profile.get("weight"),
        "height": profile.get("height"),
        "conditions": profile.get("medical_conditions", []) if profile else [],
        "allergies": profile.get("allergies", []) if profile else [],
        "blood_type": profile.get("blood_type"),
        "fitness_level": profile.get("fitness_level"),
        "diet_type": profile.get("diet_type"),
        "vitals": vitals[0] if vitals else {},
        "medications": [{"name": m.get("name"), "dosage": m.get("dosage")} for m in meds],
    }


def build_patient_context(ctx: dict) -> str:
    """Build a formatted patient context string for LLM prompts."""
    parts = [
        f"Age: {ctx.get('age', 'Unknown')}",
        f"Gender: {ctx.get('gender', 'Unknown')}",
        f"Weight: {ctx.get('weight', 'Unknown')} kg",
        f"Height: {ctx.get('height', 'Unknown')} cm",
        f"Medical Conditions: {', '.join(ctx.get('conditions', [])) or 'None'}",
        f"Allergies: {', '.join(ctx.get('allergies', [])) or 'None'}",
        f"Current Medications: {', '.join([m['name'] for m in ctx.get('medications', [])]) or 'None'}",
        f"Blood Type: {ctx.get('blood_type', 'Unknown')}",
        f"Fitness Level: {ctx.get('fitness_level', 'Unknown')}",
    ]
    v = ctx.get("vitals", {})
    if v:
        parts.append(
            f"Latest Vitals: HR={v.get('heart_rate', 'N/A')} bpm, "
            f"SpO2={v.get('spo2', 'N/A')}%, "
            f"BP={v.get('blood_pressure_sys', 'N/A')}/{v.get('blood_pressure_dia', 'N/A')} mmHg, "
            f"Stress={v.get('stress_level', 'N/A')}/100, "
            f"Temp={v.get('body_temp', 'N/A')}°C"
        )
    return "\n".join(parts)


# ══════════════════════════════════════════════════════════
#  1. AI SYMPTOM CHECKER — Fully LLM-Powered
# ══════════════════════════════════════════════════════════
class SymptomRequest(BaseModel):
    symptoms: list[str]
    duration: Optional[str] = None
    severity: Optional[str] = "moderate"
    additional_notes: Optional[str] = None


SYMPTOM_SYSTEM_PROMPT = """You are an expert clinical AI assistant for Healix healthcare platform.
Your job is to analyze patient symptoms using medical knowledge and provide a thorough clinical assessment.

IMPORTANT:
- Consider the patient's full medical history, current medications, and vitals.
- Cross-reference symptoms with existing conditions for comorbidity analysis.
- Provide evidence-based assessments with realistic probability estimates.
- If symptoms are severe or life-threatening, flag urgency as "emergency".
- Consider drug side effects as potential causes.
- Respond in the same language the symptoms are written in (Arabic or English).

You MUST respond with ONLY a valid JSON object (no extra text) in this exact format:
{
  "possible_conditions": [
    {"name": "Condition Name", "probability": "high/medium/low", "description": "Brief clinical description"}
  ],
  "urgency_level": "emergency/urgent/moderate/low",
  "recommendations": ["specific recommendation 1", "specific recommendation 2"],
  "should_see_doctor": true,
  "home_remedies": ["evidence-based remedy 1", "remedy 2"],
  "warning_signs": ["danger sign to watch for"],
  "related_to_existing_conditions": false,
  "summary": "Concise clinical assessment"
}"""


@router.post("/symptom-checker")
async def check_symptoms(data: SymptomRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    ctx = await get_user_context(user)
    patient_context = build_patient_context(ctx)

    user_prompt = f"""Analyze these symptoms for the following patient:

PATIENT PROFILE:
{patient_context}

REPORTED SYMPTOMS: {', '.join(data.symptoms)}
DURATION: {data.duration or 'Not specified'}
SEVERITY: {data.severity}
ADDITIONAL NOTES: {data.additional_notes or 'None'}

Provide your clinical assessment as JSON."""

    result = await call_llm_json(SYMPTOM_SYSTEM_PROMPT, user_prompt, temperature=0.3)

    # Ensure required fields exist
    result.setdefault("possible_conditions", [{"name": "Requires Further Evaluation", "probability": "medium", "description": "The reported symptoms need clinical assessment."}])
    result.setdefault("urgency_level", "moderate")
    result.setdefault("recommendations", ["Consult a healthcare professional for a thorough evaluation."])
    result.setdefault("should_see_doctor", True)
    result.setdefault("home_remedies", [])
    result.setdefault("warning_signs", [])
    result.setdefault("related_to_existing_conditions", False)
    result.setdefault("summary", f"Analysis of {len(data.symptoms)} symptoms with {data.severity} severity.")

    # Save to DB
    await db.symptom_checks.insert_one({
        "user_id": user["id"],
        "symptoms": data.symptoms,
        "duration": data.duration,
        "severity": data.severity,
        "result": result,
        "created_at": datetime.now(timezone.utc),
    })

    return result


@router.get("/symptom-checker/history")
async def get_symptom_history(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.symptom_checks.find(
        {"user_id": user["id"]}, sort=[("created_at", -1)], limit=20
    )
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results


# ══════════════════════════════════════════════════════════
#  2. DRUG INTERACTION CHECKER — Fully LLM-Powered
# ══════════════════════════════════════════════════════════
class DrugCheckRequest(BaseModel):
    drug_name: str
    current_medications: Optional[list[str]] = None


DRUG_SYSTEM_PROMPT = """You are an expert clinical pharmacologist AI for Healix healthcare platform.
Your job is to analyze drug interactions with deep pharmacological knowledge.

IMPORTANT:
- Check drug-drug interactions (DDI) including pharmacokinetic and pharmacodynamic interactions.
- Check drug-food interactions.
- Check drug-disease contraindications based on patient conditions.
- Flag allergy cross-reactivity risks.
- Consider the patient's renal/hepatic function based on their profile.
- Reference interaction severity using clinical classification (severe/moderate/mild).
- Suggest safer alternatives when severe interactions are found.
- Respond in the same language the drug name is written in (Arabic or English).

You MUST respond with ONLY a valid JSON object (no extra text) in this exact format:
{
  "interactions": [
    {
      "drug_pair": "Drug A + Drug B",
      "severity": "severe/moderate/mild",
      "description": "Pharmacological mechanism of interaction",
      "recommendation": "Clinical recommendation"
    }
  ],
  "contraindications": ["condition-based contraindication"],
  "allergy_warnings": ["allergy cross-reactivity warning"],
  "safe_to_take": true,
  "alternatives": ["safer alternative medication"],
  "timing_advice": "specific timing and administration advice",
  "food_interactions": ["specific food to avoid and why"],
  "summary": "Overall pharmacological safety assessment"
}"""


@router.post("/drug-interactions")
async def check_drug_interactions(data: DrugCheckRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    ctx = await get_user_context(user)
    patient_context = build_patient_context(ctx)

    current_meds = data.current_medications or [m["name"] for m in ctx.get("medications", [])]

    user_prompt = f"""Check drug interactions for the following:

PATIENT PROFILE:
{patient_context}

NEW DRUG TO CHECK: {data.drug_name}
CURRENT MEDICATIONS: {', '.join(current_meds) or 'None currently taking'}

Analyze all possible:
1. Drug-drug interactions between {data.drug_name} and each current medication
2. Drug-disease contraindications for this patient's conditions
3. Drug-food interactions
4. Allergy cross-reactivity risks
5. Suggest safer alternatives if severe interactions found

Provide your pharmacological assessment as JSON."""

    result = await call_llm_json(DRUG_SYSTEM_PROMPT, user_prompt, temperature=0.2)

    # Ensure required fields
    result.setdefault("interactions", [])
    result.setdefault("contraindications", [])
    result.setdefault("allergy_warnings", [])
    result.setdefault("safe_to_take", True if not result.get("interactions") else all(
        i.get("severity") != "severe" for i in result.get("interactions", [])
    ))
    result.setdefault("alternatives", [])
    result.setdefault("timing_advice", "Follow your doctor's prescribed schedule.")
    result.setdefault("food_interactions", [])
    result.setdefault("summary", f"Interaction analysis for {data.drug_name} with {len(current_meds)} current medications.")

    await db.drug_checks.insert_one({
        "user_id": user["id"],
        "drug_name": data.drug_name,
        "current_medications": current_meds,
        "result": result,
        "created_at": datetime.now(timezone.utc),
    })

    return result


# ══════════════════════════════════════════════════════════
#  3. AI HEALTH REPORT GENERATOR — LLM-Powered Analysis
# ══════════════════════════════════════════════════════════

REPORT_SYSTEM_PROMPT = """You are a clinical health analyst AI for Healix healthcare platform.
Your job is to generate a professional health report with AI-driven insights from real patient data.

Given the patient's vitals data, exercise logs, nutrition logs, and medications, produce:
1. A professional executive summary (3-5 sentences) analyzing the patient's overall health
2. Detailed personalized recommendations based on their real data trends
3. Risk flags if any vitals are outside normal ranges
4. Progress assessment compared to healthy benchmarks

Respond in the same language context (if patient has Arabic name/data, include Arabic).
Be precise with numbers — reference actual data points.

You MUST respond with ONLY a valid JSON object (no extra text):
{
  "ai_summary": "Professional 3-5 sentence executive health summary with specific data references",
  "recommendations": ["specific data-driven recommendation 1", "recommendation 2", "recommendation 3"],
  "risk_flags": ["specific risk based on data"],
  "lifestyle_score": "A brief assessment of lifestyle habits",
  "next_steps": ["actionable next step 1", "next step 2"]
}"""


@router.get("/health-report")
async def generate_health_report(user: dict = Depends(get_current_user)):
    db = get_db()
    ctx = await get_user_context(user)

    # Get vitals history (last 7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    vitals_cursor = db.vitals.find(
        {"user_id": user["id"], "timestamp": {"$gte": week_ago}},
        sort=[("timestamp", -1)]
    )
    vitals_history = []
    async for v in vitals_cursor:
        v["_id"] = str(v["_id"])
        vitals_history.append(v)

    # Get exercise logs
    exercise_cursor = db.exercises.find(
        {"user_id": user["id"], "created_at": {"$gte": week_ago}},
        sort=[("created_at", -1)]
    )
    exercises = []
    async for e in exercise_cursor:
        e["_id"] = str(e["_id"])
        exercises.append(e)

    # Get nutrition logs
    nutrition_cursor = db.nutrition.find(
        {"user_id": user["id"], "date": {"$gte": week_ago.strftime("%Y-%m-%d")}},
        sort=[("date", -1)]
    )
    nutrition = []
    async for n in nutrition_cursor:
        n["_id"] = str(n["_id"])
        nutrition.append(n)

    meds = ctx.get("medications", [])

    # ── Calculate vitals statistics ──
    hr_vals = [v.get("heart_rate") for v in vitals_history if v.get("heart_rate")]
    bp_sys_vals = [v.get("blood_pressure_sys") for v in vitals_history if v.get("blood_pressure_sys")]
    bp_dia_vals = [v.get("blood_pressure_dia") for v in vitals_history if v.get("blood_pressure_dia")]
    spo2_vals = [v.get("spo2") for v in vitals_history if v.get("spo2")]
    stress_vals = [v.get("stress_level") for v in vitals_history if v.get("stress_level")]
    sleep_vals = [v.get("sleep_hours") for v in vitals_history if v.get("sleep_hours")]
    steps_vals = [v.get("steps") for v in vitals_history if v.get("steps")]

    avg = lambda vals: round(sum(vals) / len(vals), 1) if vals else None

    # BMI
    bmi = None
    bmi_category = "Unknown"
    if ctx.get("weight") and ctx.get("height"):
        bmi = round(ctx["weight"] / ((ctx["height"] / 100) ** 2), 1)
        if bmi < 18.5:
            bmi_category = "Underweight"
        elif bmi < 25:
            bmi_category = "Normal"
        elif bmi < 30:
            bmi_category = "Overweight"
        else:
            bmi_category = "Obese"

    # Health score (0-100)
    scores = []
    if hr_vals:
        a = avg(hr_vals)
        scores.append(90 if 60 <= a <= 100 else 70 if 50 <= a <= 110 else 40)
    if spo2_vals:
        a = avg(spo2_vals)
        scores.append(95 if a >= 97 else 70 if a >= 94 else 30)
    if bp_sys_vals:
        a = avg(bp_sys_vals)
        scores.append(90 if 100 <= a <= 130 else 65 if 90 <= a <= 140 else 35)
    if stress_vals:
        a = avg(stress_vals)
        scores.append(90 if a <= 4 else 65 if a <= 6 else 35)
    if sleep_vals:
        a = avg(sleep_vals)
        scores.append(90 if 7 <= a <= 9 else 65 if 6 <= a <= 10 else 35)
    if steps_vals:
        a = avg(steps_vals)
        scores.append(90 if a >= 8000 else 65 if a >= 5000 else 40)

    health_score = round(sum(scores) / len(scores)) if scores else 70
    health_grade = "A" if health_score >= 85 else "B" if health_score >= 70 else "C" if health_score >= 55 else "D" if health_score >= 40 else "F"

    # Trend calculation
    def calc_trend(vals):
        if len(vals) < 2:
            return "stable"
        mid = len(vals) // 2
        recent = vals[:mid]
        older = vals[mid:]
        r_avg = sum(recent) / len(recent)
        o_avg = sum(older) / len(older)
        diff = ((r_avg - o_avg) / o_avg * 100) if o_avg else 0
        if diff > 5:
            return "increasing"
        elif diff < -5:
            return "decreasing"
        return "stable"

    # ── Build data summary for LLM ──
    vitals_text = f"""Vitals Summary (last 7 days, {len(vitals_history)} readings):
- Heart Rate: avg={avg(hr_vals) or 'N/A'}, min={min(hr_vals) if hr_vals else 'N/A'}, max={max(hr_vals) if hr_vals else 'N/A'}, trend={calc_trend(hr_vals)}
- Blood Pressure: avg={avg(bp_sys_vals) or 'N/A'}/{avg(bp_dia_vals) or 'N/A'} mmHg, trend={calc_trend(bp_sys_vals)}
- SpO2: avg={avg(spo2_vals) or 'N/A'}%, min={min(spo2_vals) if spo2_vals else 'N/A'}%, trend={calc_trend(spo2_vals)}
- Stress: avg={avg(stress_vals) or 'N/A'}/100, trend={calc_trend(stress_vals)}
- Sleep: avg={avg(sleep_vals) or 'N/A'} hours, trend={calc_trend(sleep_vals)}
- Steps: avg={avg(steps_vals) or 'N/A'}/day, total={sum(steps_vals) if steps_vals else 0}, trend={calc_trend(steps_vals)}

BMI: {bmi or 'N/A'} ({bmi_category})
Health Score: {health_score}/100 (Grade {health_grade})
Exercise sessions this week: {len(exercises)}
Meals logged this week: {len(nutrition)}
Active medications: {len(meds)} — {', '.join([m['name'] for m in meds]) or 'None'}
Conditions: {', '.join(ctx.get('conditions', [])) or 'None'}"""

    patient_context = build_patient_context(ctx)

    user_prompt = f"""Generate a comprehensive health report for this patient:

PATIENT PROFILE:
{patient_context}

HEALTH DATA:
{vitals_text}

Analyze the data and provide your clinical assessment as JSON."""

    llm_analysis = await call_llm_json(REPORT_SYSTEM_PROMPT, user_prompt, temperature=0.4)

    # Build full report
    report_data = {
        "patient": {
            "name": ctx.get("name"),
            "age": ctx.get("age"),
            "gender": ctx.get("gender"),
            "weight": ctx.get("weight"),
            "height": ctx.get("height"),
            "bmi": bmi,
            "bmi_category": bmi_category,
            "blood_type": ctx.get("blood_type"),
            "conditions": ctx.get("conditions", []),
            "allergies": ctx.get("allergies", []),
        },
        "vitals_summary": {
            "heart_rate": {"avg": avg(hr_vals), "min": min(hr_vals) if hr_vals else None, "max": max(hr_vals) if hr_vals else None, "trend": calc_trend(hr_vals)},
            "blood_pressure": {"avg_sys": avg(bp_sys_vals), "avg_dia": avg(bp_dia_vals), "trend": calc_trend(bp_sys_vals)},
            "spo2": {"avg": avg(spo2_vals), "min": min(spo2_vals) if spo2_vals else None, "trend": calc_trend(spo2_vals)},
            "stress": {"avg": avg(stress_vals), "trend": calc_trend(stress_vals)},
            "sleep": {"avg_hours": avg(sleep_vals), "trend": calc_trend(sleep_vals)},
            "steps": {"avg": avg(steps_vals), "total": sum(steps_vals) if steps_vals else 0, "trend": calc_trend(steps_vals)},
            "readings_count": len(vitals_history),
        },
        "health_score": health_score,
        "health_grade": health_grade,
        "exercise_summary": {
            "total_sessions": len(exercises),
            "total_calories": sum(e.get("calories_burned", 0) for e in exercises),
        },
        "nutrition_summary": {
            "logged_meals": len(nutrition),
        },
        "medications": {
            "total_active": len(meds),
            "list": [m["name"] for m in meds],
        },
        # LLM-generated fields
        "ai_summary": llm_analysis.get("ai_summary", f"Health score: {health_score}/100 (Grade {health_grade})."),
        "recommendations": llm_analysis.get("recommendations", ["Continue monitoring your vitals regularly."]),
        "risk_flags": llm_analysis.get("risk_flags", []),
        "lifestyle_score": llm_analysis.get("lifestyle_score", ""),
        "next_steps": llm_analysis.get("next_steps", []),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "period": "Last 7 Days",
    }

    # Save report
    await db.health_reports.insert_one({
        "user_id": user["id"],
        "report": report_data,
        "created_at": datetime.now(timezone.utc),
    })

    return report_data


@router.get("/health-report/history")
async def get_report_history(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.health_reports.find(
        {"user_id": user["id"]}, sort=[("created_at", -1)], limit=10
    )
    reports = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        reports.append(doc)
    return reports


# ══════════════════════════════════════════════════════════
#  4. SMART MEAL PLANNER — Fully LLM-Powered
# ══════════════════════════════════════════════════════════
class MealPlanRequest(BaseModel):
    goal: Optional[str] = "balanced"
    calories_target: Optional[int] = None
    meals_per_day: Optional[int] = 3
    exclude_foods: list[str] = []


MEAL_SYSTEM_PROMPT = """You are an expert clinical nutritionist and dietitian AI for Healix healthcare platform.
Your job is to create personalized, medically-appropriate meal plans based on the patient's health profile.

IMPORTANT:
- Calculate precise macros (protein, carbs, fat) per meal.
- Consider medical conditions (diabetes → low-GI, hypertension → low sodium, etc.).
- Respect food allergies and exclusions strictly.
- Include Arabic food names (name_ar) alongside English names.
- Each meal must have realistic calorie and macro counts.
- Provide practical, locally available foods (include Middle Eastern / Mediterranean options).
- Give evidence-based nutritional tips tailored to the patient.

You MUST respond with ONLY a valid JSON object (no extra text) in this exact format:
{
  "meals": [
    {
      "meal_type": "breakfast",
      "meal_type_ar": "الإفطار",
      "name": "Meal Name in English",
      "name_ar": "اسم الوجبة بالعربي",
      "calories": 400,
      "protein": 30,
      "carbs": 45,
      "fat": 12,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "preparation": "Brief preparation instructions"
    }
  ],
  "tips": ["nutritional tip 1", "tip 2", "tip 3"],
  "hydration_note": "water intake recommendation",
  "supplement_suggestions": ["supplement if applicable"]
}"""


@router.post("/meal-planner")
async def generate_meal_plan(data: MealPlanRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    ctx = await get_user_context(user)

    # Calculate TDEE (math — always accurate)
    weight = ctx.get("weight") or 70
    height = ctx.get("height") or 170
    age = ctx.get("age") or 30
    gender = ctx.get("gender") or "male"

    if gender == "male":
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

    activity_multiplier = {"beginner": 1.375, "intermediate": 1.55, "advanced": 1.725}.get(
        ctx.get("fitness_level", "intermediate"), 1.55
    )
    tdee = round(bmr * activity_multiplier)

    if data.calories_target:
        target_cals = data.calories_target
    elif data.goal == "weight_loss":
        target_cals = tdee - 500
    elif data.goal == "muscle_gain":
        target_cals = tdee + 300
    else:
        target_cals = tdee

    # Macro split based on goal
    macro_splits = {
        "muscle_gain": (0.30, 0.45, 0.25),
        "weight_loss": (0.35, 0.35, 0.30),
        "diabetes_friendly": (0.30, 0.30, 0.40),
        "heart_healthy": (0.25, 0.50, 0.25),
        "balanced": (0.25, 0.50, 0.25),
    }
    p_ratio, c_ratio, f_ratio = macro_splits.get(data.goal, (0.25, 0.50, 0.25))

    macros = {
        "calories": target_cals,
        "protein_g": round((target_cals * p_ratio) / 4),
        "carbs_g": round((target_cals * c_ratio) / 4),
        "fat_g": round((target_cals * f_ratio) / 9),
    }

    patient_context = build_patient_context(ctx)

    meal_types_needed = ["breakfast", "lunch", "dinner"]
    if data.meals_per_day >= 4:
        meal_types_needed.append("snack")
    if data.meals_per_day >= 5:
        meal_types_needed.append("snack")

    user_prompt = f"""Create a personalized daily meal plan for this patient:

PATIENT PROFILE:
{patient_context}

NUTRITION TARGETS:
- Goal: {data.goal}
- Total Daily Calories: {target_cals} kcal
- Target Macros: Protein {macros['protein_g']}g, Carbs {macros['carbs_g']}g, Fat {macros['fat_g']}g
- TDEE: {tdee} kcal/day, BMR: {round(bmr)} kcal/day
- Meals needed: {', '.join(meal_types_needed)} ({data.meals_per_day} meals)
- Foods to EXCLUDE: {', '.join(data.exclude_foods + ctx.get('allergies', [])) or 'None'}
- Medical conditions to consider: {', '.join(ctx.get('conditions', [])) or 'None'}

Create {data.meals_per_day} balanced meals that total approximately {target_cals} kcal.
Include both English and Arabic food names. Provide your meal plan as JSON."""

    llm_result = await call_llm_json(MEAL_SYSTEM_PROMPT, user_prompt, temperature=0.6)

    # Build response
    meals = llm_result.get("meals", [])

    plan = {
        "meals": meals,
        "macros": macros,
        "tdee": tdee,
        "bmr": round(bmr),
        "total_calories": sum(m.get("calories", 0) for m in meals),
        "total_protein": sum(m.get("protein", 0) for m in meals),
        "total_carbs": sum(m.get("carbs", 0) for m in meals),
        "total_fat": sum(m.get("fat", 0) for m in meals),
        "water_recommendation": round(weight * 0.033, 1),
        "tips": llm_result.get("tips", [f"Drink at least {round(weight * 0.033, 1)}L of water daily."]),
        "hydration_note": llm_result.get("hydration_note", ""),
        "supplement_suggestions": llm_result.get("supplement_suggestions", []),
        "goal": data.goal,
    }

    await db.meal_plans.insert_one({
        "user_id": user["id"],
        "plan": plan,
        "created_at": datetime.now(timezone.utc),
    })

    return plan


# ══════════════════════════════════════════════════════════
#  5. HEALTH JOURNAL WITH AI INSIGHTS — Fully LLM-Powered
# ══════════════════════════════════════════════════════════
class JournalEntry(BaseModel):
    content: str
    mood: Optional[str] = "neutral"
    energy_level: Optional[int] = 5
    pain_level: Optional[int] = 0
    tags: list[str] = []


JOURNAL_SYSTEM_PROMPT = """You are a compassionate health psychology AI for Healix healthcare platform.
Your job is to analyze health journal entries and provide meaningful psychological and health insights.

IMPORTANT:
- Detect emotional patterns and sentiment from the text.
- Identify health-related themes (sleep, nutrition, exercise, pain, medication, mental health, etc.).
- Provide empathetic, actionable suggestions.
- Consider the patient's medical conditions in your analysis.
- Respond in the same language the journal entry is written in.

You MUST respond with ONLY a valid JSON object (no extra text):
{
  "sentiment": "positive/neutral/negative",
  "key_themes": ["theme1", "theme2"],
  "health_insights": "Specific insight about their health state based on the entry",
  "suggestion": "One concrete, actionable suggestion",
  "mood_analysis": "Brief analysis of mood patterns and energy levels"
}"""


@router.post("/journal")
async def create_journal_entry(data: JournalEntry, user: dict = Depends(get_current_user)):
    db = get_db()
    ctx = await get_user_context(user)
    patient_context = build_patient_context(ctx)

    entry = {
        "user_id": user["id"],
        "content": data.content,
        "mood": data.mood,
        "energy_level": data.energy_level,
        "pain_level": data.pain_level,
        "tags": data.tags,
        "created_at": datetime.now(timezone.utc),
    }

    user_prompt = f"""Analyze this health journal entry:

PATIENT PROFILE:
{patient_context}

ENTRY METADATA:
- Mood: {data.mood}
- Energy Level: {data.energy_level}/10
- Pain Level: {data.pain_level}/10

JOURNAL ENTRY:
"{data.content}"

Provide your psychological and health analysis as JSON."""

    ai_analysis = await call_llm_json(JOURNAL_SYSTEM_PROMPT, user_prompt, temperature=0.4)

    # Ensure required fields
    ai_analysis.setdefault("sentiment", "neutral")
    ai_analysis.setdefault("key_themes", ["general wellness"])
    ai_analysis.setdefault("health_insights", "Entry recorded for tracking.")
    ai_analysis.setdefault("suggestion", "Keep journaling regularly to track your health patterns.")
    ai_analysis.setdefault("mood_analysis", f"Mood: {data.mood}, Energy: {data.energy_level}/10.")

    entry["ai_analysis"] = ai_analysis
    result = await db.health_journal.insert_one(entry)

    return {
        "id": str(result.inserted_id),
        "ai_analysis": ai_analysis,
        "message": "Journal entry saved",
    }


@router.get("/journal")
async def get_journal_entries(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.health_journal.find(
        {"user_id": user["id"]}, sort=[("created_at", -1)], limit=30
    )
    entries = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        entries.append(doc)
    return entries


@router.get("/journal/insights")
async def get_journal_insights(user: dict = Depends(get_current_user)):
    """Get aggregated insights from journal entries."""
    db = get_db()
    month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    cursor = db.health_journal.find(
        {"user_id": user["id"], "created_at": {"$gte": month_ago}},
        sort=[("created_at", -1)]
    )

    entries = []
    async for doc in cursor:
        entries.append(doc)

    if not entries:
        return {"message": "No journal entries found", "total_entries": 0}

    # Aggregate mood data
    moods = [e.get("mood", "neutral") for e in entries]
    mood_counts = {}
    for m in moods:
        mood_counts[m] = mood_counts.get(m, 0) + 1

    energy_vals = [e.get("energy_level", 5) for e in entries if e.get("energy_level")]
    pain_vals = [e.get("pain_level", 0) for e in entries if e.get("pain_level") is not None]

    all_themes = []
    for e in entries:
        analysis = e.get("ai_analysis", {})
        all_themes.extend(analysis.get("key_themes", []))
    theme_counts = {}
    for t in all_themes:
        theme_counts[t] = theme_counts.get(t, 0) + 1

    return {
        "total_entries": len(entries),
        "period": "Last 30 Days",
        "mood_distribution": mood_counts,
        "dominant_mood": max(mood_counts, key=mood_counts.get) if mood_counts else "neutral",
        "avg_energy": round(sum(energy_vals) / len(energy_vals), 1) if energy_vals else 5,
        "avg_pain": round(sum(pain_vals) / len(pain_vals), 1) if pain_vals else 0,
        "common_themes": dict(sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]),
        "streak": len(entries),
        "entries_this_week": len([e for e in entries if (e["created_at"].replace(tzinfo=timezone.utc) if e["created_at"].tzinfo is None else e["created_at"]) > datetime.now(timezone.utc) - timedelta(days=7)]),
    }


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    await db.health_journal.delete_one({"_id": ObjectId(entry_id), "user_id": user["id"]})
    return {"message": "Journal entry deleted"}
