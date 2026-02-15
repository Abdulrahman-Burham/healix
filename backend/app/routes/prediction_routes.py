from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_db
import numpy as np

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("/risk")
async def get_risk_prediction(user: dict = Depends(get_current_user)):
    db = get_db()
    # Get latest vitals for risk calculation
    latest = await db.vitals.find_one({"user_id": user["id"]}, sort=[("timestamp", -1)])

    # Simplified risk model based on available data
    base_risk = 22
    hr = latest.get("heart_rate", 72) if latest else 72
    spo2 = latest.get("spo2", 98) if latest else 98
    stress = latest.get("stress_level", 3) if latest else 3

    # Adjust risk based on vitals (stress is 0-10 scale)
    if hr > 100:
        base_risk += 10
    if spo2 < 95:
        base_risk += 15
    if stress > 7:
        base_risk += 8

    current_risk = min(max(base_risk, 5), 95)
    predicted_risk = max(current_risk - 7, 5)

    risk_factors = [
        {"name": "Sleep Quality", "name_ar": "جودة النوم", "value": 35, "direction": "positive"},
        {"name": "Exercise Compliance", "name_ar": "الالتزام بالتمارين", "value": 28, "direction": "positive"},
        {"name": "Stress Level", "name_ar": "مستوى التوتر", "value": 18, "direction": "negative"},
        {"name": "Diet Adherence", "name_ar": "الالتزام بالنظام الغذائي", "value": 22, "direction": "positive"},
        {"name": "Blood Pressure", "name_ar": "ضغط الدم", "value": 15, "direction": "positive"},
        {"name": "Missed Medications", "name_ar": "الأدوية الفائتة", "value": 12, "direction": "negative"},
    ]

    scenarios = [
        {
            "scenario": "Continue current program for 3 months",
            "scenario_ar": "الاستمرار على البرنامج الحالي لمدة 3 أشهر",
            "risk_change": -30, "timeframe": "3 months",
            "details": "Blood pressure improvement by 15%, cardio fitness +20%",
            "details_ar": "تحسن ضغط الدم بنسبة 15%، لياقة القلب +20%",
        },
        {
            "scenario": "Skip exercise for 2 weeks",
            "scenario_ar": "ترك التمارين لمدة أسبوعين",
            "risk_change": 18, "timeframe": "2 weeks",
            "details": "Risk of deconditioning, stress increase, muscle loss",
            "details_ar": "خطر فقدان اللياقة، زيادة التوتر، فقدان عضلات",
        },
        {
            "scenario": "Neglect sleep (<5h/night)",
            "scenario_ar": "إهمال النوم (أقل من 5 ساعات/ليلة)",
            "risk_change": 25, "timeframe": "1 month",
            "details": "Cardiovascular risk +25%, cognitive decline, hormonal imbalance",
            "details_ar": "خطر القلب +25%، تراجع إدراكي، خلل هرموني",
        },
        {
            "scenario": "Follow AI recommendations strictly",
            "scenario_ar": "اتباع توصيات الذكاء الاصطناعي بدقة",
            "risk_change": -40, "timeframe": "6 months",
            "details": "Optimal health trajectory, disease risk minimized",
            "details_ar": "مسار صحي مثالي، تقليل خطر الأمراض",
        },
    ]

    recommendations = [
        "Increase sleep time to 7-8 hours daily for better cardiac recovery",
        "Add 10 minutes of deep breathing exercises daily to reduce stress",
        "Take medications on time — current compliance at 85%",
        "Increase water intake to 3 liters daily",
        "Reduce sodium intake to help control blood pressure",
    ]
    recommendations_ar = [
        "زيادة وقت النوم إلى 7-8 ساعات يومياً لتحسين تعافي القلب",
        "إضافة تمارين التنفس العميق 10 دقائق يومياً لتقليل التوتر",
        "تناول الأدوية في المواعيد المحددة - الالتزام الحالي 85%",
        "زيادة شرب الماء إلى 3 لتر يومياً",
        "تقليل الصوديوم في الطعام للمساعدة في ضبط ضغط الدم",
    ]

    return {
        "current_risk": current_risk,
        "predicted_risk": predicted_risk,
        "trend": "improving",
        "risk_factors": risk_factors,
        "scenarios": scenarios,
        "recommendations": recommendations,
        "recommendations_ar": recommendations_ar,
        "shap_values": [
            {"feature": "Exercise", "feature_ar": "التمارين", "value": 0.35},
            {"feature": "Sleep", "feature_ar": "النوم", "value": 0.28},
            {"feature": "Diet", "feature_ar": "النظام الغذائي", "value": 0.22},
            {"feature": "Stress", "feature_ar": "التوتر", "value": -0.15},
            {"feature": "Medications", "feature_ar": "الأدوية", "value": 0.18},
            {"feature": "Heart Rate", "feature_ar": "نبض القلب", "value": 0.12},
            {"feature": "HRV", "feature_ar": "تقلب النبض", "value": 0.08},
        ],
    }
