"""
Healix Medical Knowledge Base
ChromaDB + BM25 Ensemble Retriever for RAG-based medical knowledge retrieval.
Provides the knowledge layer that all 4 agents query for evidence-based answers.
"""

import os
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_community.retrievers import BM25Retriever
from app.config import settings

# ── Knowledge Collections ──────────────────────────────
# Each agent has its own domain-specific knowledge collection.

CLINICAL_KNOWLEDGE = [
    Document(
        page_content="Normal resting heart rate for adults is 60-100 bpm. Athletes may have rates as low as 40 bpm. "
        "Tachycardia (>100 bpm at rest) may indicate stress, dehydration, fever, or cardiac issues. "
        "Bradycardia (<60 bpm) can be normal in athletes but may require evaluation in sedentary individuals.",
        metadata={"source": "clinical_guidelines", "topic": "heart_rate", "lang": "en"},
    ),
    Document(
        page_content="معدل نبض القلب الطبيعي أثناء الراحة للبالغين هو 60-100 نبضة في الدقيقة. الرياضيون قد يكون معدلهم 40 نبضة. "
        "تسارع القلب (أكثر من 100) قد يشير إلى التوتر أو الجفاف أو الحمى أو مشاكل قلبية. "
        "بطء القلب (أقل من 60) طبيعي عند الرياضيين لكن يحتاج تقييم عند غير الرياضيين.",
        metadata={"source": "clinical_guidelines", "topic": "heart_rate", "lang": "ar"},
    ),
    Document(
        page_content="Blood oxygen saturation (SpO2) normal range is 95-100%. Values below 90% are considered hypoxemia "
        "and require immediate medical attention. During exercise, SpO2 should remain above 92%. "
        "Chronic low SpO2 may indicate COPD, asthma, or sleep apnea.",
        metadata={"source": "clinical_guidelines", "topic": "spo2", "lang": "en"},
    ),
    Document(
        page_content="تشبع الأكسجين في الدم (SpO2) الطبيعي هو 95-100%. القيم أقل من 90% تعتبر نقص أكسجة "
        "وتحتاج تدخل طبي فوري. أثناء التمرين يجب أن يبقى فوق 92%. "
        "انخفاض مزمن قد يشير إلى COPD أو ربو أو انقطاع النفس أثناء النوم.",
        metadata={"source": "clinical_guidelines", "topic": "spo2", "lang": "ar"},
    ),
    Document(
        page_content="Normal blood pressure is below 120/80 mmHg. Elevated: 120-129/<80. "
        "Stage 1 hypertension: 130-139/80-89. Stage 2: ≥140/≥90. Hypertensive crisis: >180/>120. "
        "Lifestyle modifications include DASH diet, sodium reduction, exercise 150min/week, weight management.",
        metadata={"source": "clinical_guidelines", "topic": "blood_pressure", "lang": "en"},
    ),
    Document(
        page_content="ضغط الدم الطبيعي أقل من 120/80 ملم زئبق. مرتفع: 120-129. "
        "المرحلة 1 ارتفاع ضغط: 130-139/80-89. المرحلة 2: أكبر من 140/90. أزمة: أكبر من 180/120. "
        "تعديلات نمط الحياة: نظام DASH، تقليل الصوديوم، تمارين 150 دقيقة أسبوعياً، إدارة الوزن.",
        metadata={"source": "clinical_guidelines", "topic": "blood_pressure", "lang": "ar"},
    ),
    Document(
        page_content="Heart Rate Variability (HRV) is the variation in time between heartbeats. Higher HRV generally indicates "
        "better cardiovascular fitness and stress resilience. Low HRV (<20ms RMSSD) may indicate chronic stress, "
        "overtraining, or autonomic dysfunction. Factors affecting HRV: sleep quality, exercise, stress, alcohol.",
        metadata={"source": "clinical_guidelines", "topic": "hrv", "lang": "en"},
    ),
    Document(
        page_content="Stress assessment combines multiple biomarkers: elevated cortisol, reduced HRV, increased resting HR, "
        "sleep disruption, and subjective reporting. Chronic stress (>70/100 sustained) increases cardiovascular "
        "risk by 40% and impairs immune function. Management: deep breathing, meditation, exercise, sleep hygiene.",
        metadata={"source": "clinical_guidelines", "topic": "stress", "lang": "en"},
    ),
    Document(
        page_content="Body temperature normal range is 36.1-37.2°C (97-99°F). Fever is defined as ≥38°C (100.4°F). "
        "Exercise can temporarily elevate body temp to 38-40°C. Post-exercise temperature should normalize "
        "within 30-60 minutes. Persistent elevation may indicate infection or heat illness.",
        metadata={"source": "clinical_guidelines", "topic": "temperature", "lang": "en"},
    ),
    Document(
        page_content="For patients with diabetes: monitor blood glucose before, during, and after exercise. "
        "Avoid exercise if fasting glucose >250 mg/dL with ketones. Start with 150 min/week moderate activity. "
        "Carry fast-acting carbs. Insulin timing: reduce dose by 20-50% before exercise.",
        metadata={"source": "clinical_guidelines", "topic": "diabetes_exercise", "lang": "en"},
    ),
    Document(
        page_content="لمرضى السكر: راقب مستوى السكر قبل وأثناء وبعد التمرين. "
        "تجنب التمرين إذا كان السكر صائم أكثر من 250 مع وجود كيتون. ابدأ بـ 150 دقيقة أسبوعياً نشاط معتدل. "
        "احمل كربوهيدرات سريعة. توقيت الأنسولين: قلل الجرعة 20-50% قبل التمرين.",
        metadata={"source": "clinical_guidelines", "topic": "diabetes_exercise", "lang": "ar"},
    ),
    Document(
        page_content="For hypertensive patients: avoid heavy isometric exercises (heavy lifting, planks >30s). "
        "Prefer dynamic aerobic exercise: walking, cycling, swimming. Target HR: 50-70% max. "
        "Avoid Valsalva maneuver. Do NOT take pre-workout supplements. Monitor BP before training.",
        metadata={"source": "clinical_guidelines", "topic": "hypertension_exercise", "lang": "en"},
    ),
    Document(
        page_content="لمرضى الضغط: تجنب تمارين المقاومة الثقيلة (رفع أوزان ثقيلة، بلانك أكثر من 30 ثانية). "
        "يفضل تمارين الكارديو: مشي، دراجة، سباحة. معدل النبض المستهدف: 50-70% من الأقصى. "
        "تجنب حبس النفس. لا تأخذ مكملات قبل التمرين. قس الضغط قبل التدريب.",
        metadata={"source": "clinical_guidelines", "topic": "hypertension_exercise", "lang": "ar"},
    ),
]

NUTRITION_KNOWLEDGE = [
    Document(
        page_content="Protein requirements for athletes: 1.6-2.2g per kg bodyweight daily. Spread protein intake across "
        "4-5 meals for optimal muscle protein synthesis (MPS). Each meal should contain 25-40g protein. "
        "Post-workout protein within 2 hours enhances recovery. Best sources: chicken, fish, eggs, whey, Greek yogurt.",
        metadata={"source": "nutrition_science", "topic": "protein", "lang": "en"},
    ),
    Document(
        page_content="احتياج البروتين للرياضيين: 1.6-2.2 جم لكل كيلو من وزن الجسم يومياً. وزع البروتين على "
        "4-5 وجبات لأفضل تخليق بروتين عضلي. كل وجبة 25-40 جم بروتين. "
        "بروتين بعد التمرين خلال ساعتين يحسن التعافي. أفضل المصادر: دجاج، سمك، بيض، واي، زبادي يوناني.",
        metadata={"source": "nutrition_science", "topic": "protein", "lang": "ar"},
    ),
    Document(
        page_content="Carbohydrate needs for gym athletes: 3-7g per kg bodyweight. Pre-workout (1-2h before): "
        "complex carbs (oats, rice, sweet potato). Intra-workout: optional simple carbs for sessions >90min. "
        "Post-workout: fast carbs (banana, dates, white rice) with protein for glycogen replenishment.",
        metadata={"source": "nutrition_science", "topic": "carbs", "lang": "en"},
    ),
    Document(
        page_content="Fat intake: 0.8-1.2g per kg bodyweight. Essential for hormone production (testosterone). "
        "Sources: olive oil, avocado, nuts, fatty fish. Avoid trans fats. Omega-3 (2-3g/day) reduces "
        "inflammation and supports joint health. Do not go below 20% of total calories from fat.",
        metadata={"source": "nutrition_science", "topic": "fat", "lang": "en"},
    ),
    Document(
        page_content="Water intake: minimum 30-40ml per kg bodyweight daily. During exercise: 150-250ml every "
        "15-20 minutes. Pre-workout: 500ml 2 hours before. For workouts >60min, add electrolytes. "
        "Signs of dehydration: dark urine, headache, decreased performance, heart rate elevation.",
        metadata={"source": "nutrition_science", "topic": "hydration", "lang": "en"},
    ),
    Document(
        page_content="شرب الماء: 30-40 مل لكل كيلو من وزن الجسم يومياً. أثناء التمرين: 150-250 مل كل 15-20 دقيقة. "
        "قبل التمرين: 500 مل قبل ساعتين. لتمارين أكثر من 60 دقيقة أضف إلكتروليت. "
        "علامات الجفاف: بول داكن، صداع، انخفاض الأداء، ارتفاع نبض القلب.",
        metadata={"source": "nutrition_science", "topic": "hydration", "lang": "ar"},
    ),
    Document(
        page_content="Caloric surplus for muscle gain: 250-500 kcal above maintenance. Caloric deficit for fat loss: "
        "300-500 kcal below maintenance. Maintenance calories = BMR × Activity Factor. "
        "BMR (Mifflin-St Jeor): Men: 10×weight(kg) + 6.25×height(cm) - 5×age - 5. "
        "Women: 10×weight(kg) + 6.25×height(cm) - 5×age - 161.",
        metadata={"source": "nutrition_science", "topic": "calories", "lang": "en"},
    ),
    Document(
        page_content="Meal timing for gym athletes: Meal 1 (breakfast): 25% of daily calories. "
        "Meal 2 (lunch): 30%. Meal 3 (pre-workout snack): 10-15%. "
        "Meal 4 (post-workout): 15-20%. Meal 5 (dinner): 15-20%. "
        "Avoid large meals 1h before training. Pre-workout meal should be 1-2 hours before.",
        metadata={"source": "nutrition_science", "topic": "meal_timing", "lang": "en"},
    ),
    Document(
        page_content="Supplements evidence-based: Creatine Monohydrate (5g/day) - strongest evidence for strength/size. "
        "Whey Protein - convenient protein source. Vitamin D (2000-4000 IU/day) if deficient. "
        "Omega-3 (2-3g/day). Caffeine (3-6mg/kg) pre-workout. Avoid: BCAAs (redundant with sufficient protein), "
        "fat burners, testosterone boosters.",
        metadata={"source": "nutrition_science", "topic": "supplements", "lang": "en"},
    ),
    Document(
        page_content="النظام الغذائي لمرضى الضغط: نظام DASH يقلل الضغط 8-14 نقطة. "
        "قلل الصوديوم لأقل من 2300 ملغ/يوم (مثالي 1500 ملغ). زد البوتاسيوم: موز، سبانخ، أفوكادو. "
        "قلل الكافيين. تجنب الأطعمة المصنعة والمعلبات. زد الألياف (25-30 جم/يوم).",
        metadata={"source": "nutrition_science", "topic": "dash_diet", "lang": "ar"},
    ),
]

EXERCISE_KNOWLEDGE = [
    Document(
        page_content="Push/Pull/Legs (PPL) split for intermediate lifters: 6 days/week. "
        "Push Day: Shoulder Press, Chest Press, Lateral Raises, Tricep Extensions, Butterfly. "
        "Pull Day: Lat Pulldown, Cable Rows, Face Pulls, Bicep Curls, Rear Delts. "
        "Leg Day: Hack Squat, Leg Press, Leg Extension, Leg Curl, Calf Raises. "
        "Progressive overload: increase weight when you can do 2+ extra reps on last set.",
        metadata={"source": "exercise_science", "topic": "ppl_split", "lang": "en"},
    ),
    Document(
        page_content="جدول تقسيم دفع/سحب/أرجل للمتوسطين: 6 أيام/أسبوع. "
        "يوم دفع: كتف أمامي، ضغط صدر، رفرفة جانبية، تراي، فراشة. "
        "يوم سحب: سحب علوي، تجديف، فيس بول، باي، كتف خلفي. "
        "يوم أرجل: هاك سكوات، ليج بريس، ليج إكستنشن، ليج كيرل، بطات. "
        "الحمل التدريجي: زد الوزن لما تقدر تعمل +2 تكرار إضافي في آخر مجموعة.",
        metadata={"source": "exercise_science", "topic": "ppl_split", "lang": "ar"},
    ),
    Document(
        page_content="Anterior A (Push + Quads) workout structure: "
        "1. Machine Shoulder Press: 1-2 warmup sets, 1 working set × 6-8 reps. Rest 3-5 min. "
        "Alternatives: DB Shoulder Press, Smith Shoulder Press. Tip: Don't arch excessively, focus on shoulder contraction. "
        "2. Chest Press Machine: 1-2 warmup, 3 working × 6-10. Alternatives: DB Flat Press, Smith Flat Press. "
        "3. Hack Squat: 1-3 warmup, 2 working × 5-8. 120-degree knee bend targets quads. Go full range. "
        "4. Machine Lateral Raises: 1-2 warmup, 3 × 6-8. Lift from shoulders, not entire body. "
        "5. Overhead Extension: 2 × 6-10. If elbow hurts, switch to pushdown. "
        "6. Butterfly: 1 × 6-10. Focus on chest squeeze. "
        "7. Cable Crunch: 2 × 6-10. Movement from spine flexion, not back swinging. "
        "8. Leg Extension: 1 × 8-12. Use banded version if machine unavailable.",
        metadata={"source": "exercise_science", "topic": "anterior_a", "lang": "en"},
    ),
    Document(
        page_content="جزء أمامي أ (دفع + كوادز): "
        "1. كتف أمامي بالمكينة: 1-2 إحماء، 1 عمل × 6-8. راحة 3-5 دقائق. "
        "بدائل: دمبل كتف، سميث كتف. نصيحة: لا تعمل آرش زيادة، ركز على انقباض الكتف. "
        "2. ضغط صدر مكينة: 1-2 إحماء، 3 عمل × 6-10. بدائل: دمبل بنش، سميث فلات. "
        "3. هاك سكوات: 1-3 إحماء، 2 عمل × 5-8. 120 درجة ثني ركبة يكفي للكوادز. حاول تنزل للآخر. "
        "4. رفرفة جانبية مكينة: 1-2 إحماء، 3 × 6-8. الحركة من الكتف مش الجسم كله. "
        "5. تمديد خلفي تراي: 2 × 6-10. لو كوعك وجعك العب بوش داون. "
        "6. فراشة: 1 × 6-10. ركز على انقباض الصدر. "
        "7. كيبل كرنش: 2 × 6-10. الحركة من ثني العمود الفقري مش الضهر كله. "
        "8. ليج إكستنشن: 1 × 8-12. لو الجهاز مش موجود العب BANDED LEG EXTENSION.",
        metadata={"source": "exercise_science", "topic": "anterior_a", "lang": "ar"},
    ),
    Document(
        page_content="Safe Load Index (SLI) calculation for medical conditions: "
        "Base SLI = 100 for healthy individuals. "
        "Hypertension: -20 SLI, avoid isometric exercises, max HR 70% of max. "
        "Diabetes Type 2: -10 SLI, monitor glucose pre/post workout, carry fast carbs. "
        "Knee injury: -25 SLI, avoid deep squats, prefer leg press with limited ROM. "
        "Back pain: -15 SLI, avoid deadlifts and heavy squats, focus on core stability. "
        "Heart condition: -30 SLI, require medical clearance, limit to moderate intensity.",
        metadata={"source": "exercise_science", "topic": "safe_load_index", "lang": "en"},
    ),
    Document(
        page_content="مؤشر الحمل الآمن (SLI) للحالات المرضية: "
        "الأساس = 100 للأصحاء. "
        "ارتفاع ضغط: -20 SLI، تجنب تمارين الثبات، النبض الأقصى 70% من الحد الأقصى. "
        "سكر نوع 2: -10 SLI، راقب السكر قبل وبعد، احمل كربوهيدرات سريعة. "
        "إصابة ركبة: -25 SLI، تجنب السكوات العميق، يفضل ليج بريس بمدى حركة محدود. "
        "ألم ظهر: -15 SLI، تجنب الديدلفت والسكوات الثقيل، ركز على استقرار الكور. "
        "مرض قلبي: -30 SLI، يحتاج تصريح طبي، اقتصر على شدة معتدلة.",
        metadata={"source": "exercise_science", "topic": "safe_load_index", "lang": "ar"},
    ),
    Document(
        page_content="Warm-up protocol: 5-10 min light cardio → dynamic stretches → 1-2 warm-up sets per exercise. "
        "Cool-down: 5 min walk → static stretches 15-30s per muscle → foam rolling optional. "
        "Rest between sets: compounds 2-3 min, isolation 60-90s. RPE target: 7-9/10 for working sets.",
        metadata={"source": "exercise_science", "topic": "warmup_cooldown", "lang": "en"},
    ),
    Document(
        page_content="Progressive overload methods: 1) Add weight (smallest increment available). "
        "2) Add reps within prescribed range. 3) Add sets (max 1 per muscle/week). "
        "4) Reduce rest time. 5) Improve tempo (slower eccentric). "
        "Deload every 4-6 weeks: reduce volume 40-50%, maintain intensity. "
        "Signs of overtraining: persistent fatigue, strength regression, poor sleep, elevated resting HR.",
        metadata={"source": "exercise_science", "topic": "progressive_overload", "lang": "en"},
    ),
]

RISK_KNOWLEDGE = [
    Document(
        page_content="SHAP (SHapley Additive exPlanations) for health risk: Each factor contributes positively or negatively "
        "to overall risk score. Positive contributors increase risk, negative reduce it. "
        "Key modifiable factors: exercise frequency (-35% risk), sleep quality (-28%), medication adherence (-22%), "
        "stress level (+18%), missed medications (+12%), sedentary periods (+8%). "
        "Non-modifiable: age, genetics, chronic conditions.",
        metadata={"source": "risk_analysis", "topic": "shap_factors", "lang": "en"},
    ),
    Document(
        page_content="تحليل SHAP للمخاطر الصحية: كل عامل يساهم إيجابياً أو سلبياً في درجة الخطر. "
        "العوامل القابلة للتعديل: تكرار التمارين (-35% خطر)، جودة النوم (-28%)، الالتزام بالأدوية (-22%)، "
        "مستوى التوتر (+18%)، الأدوية الفائتة (+12%)، فترات الخمول (+8%). "
        "غير القابلة للتعديل: العمر، الوراثة، الأمراض المزمنة.",
        metadata={"source": "risk_analysis", "topic": "shap_factors", "lang": "ar"},
    ),
    Document(
        page_content="Predictive health deterioration model: Based on current vitals trend analysis. "
        "If exercise compliance drops >50%: predicted risk increase of 18-25% within 2 weeks. "
        "If sleep consistently <6h: cortisol elevation leads to 15-20% risk increase in 1 month. "
        "If medication adherence drops <80%: condition-specific risk rises by 20-30%. "
        "Best outcome scenario: following all AI recommendations → 40% risk reduction in 6 months.",
        metadata={"source": "risk_analysis", "topic": "deterioration_model", "lang": "en"},
    ),
    Document(
        page_content="نموذج تدهور الصحة التنبؤي: بناءً على تحليل اتجاهات المؤشرات الحيوية. "
        "إذا انخفض الالتزام بالتمارين أكثر من 50%: زيادة متوقعة 18-25% في أسبوعين. "
        "إذا النوم أقل من 6 ساعات باستمرار: ارتفاع الكورتيزول يؤدي لزيادة 15-20% خلال شهر. "
        "إذا الالتزام بالأدوية أقل من 80%: خطر مرتبط بالحالة يرتفع 20-30%. "
        "أفضل سيناريو: اتباع جميع توصيات الذكاء الاصطناعي → تقليل 40% خلال 6 أشهر.",
        metadata={"source": "risk_analysis", "topic": "deterioration_model", "lang": "ar"},
    ),
    Document(
        page_content="Population health trends (Pop Trends) analysis: Tracks wearable usage consistency. "
        "Active periods: HR zones 2-4, steps >8000/day, exercise sessions detected. "
        "Sedentary risk windows: >2 hours continuous sitting → cardiovascular risk increases. "
        "Peak stress times: correlate with work hours, identify patterns for intervention. "
        "Critical time analysis: identify specific times of day with highest health risk.",
        metadata={"source": "risk_analysis", "topic": "pop_trends", "lang": "en"},
    ),
    Document(
        page_content="Digital Twin health simulation: Virtual model based on user's physiological data. "
        "Cardio Load: estimated from HR zones, exercise duration, and recovery patterns. "
        "Vascular state: derived from blood pressure trends, HRV, and arterial stiffness indicators. "
        "Mental state: stress scores, sleep quality, behavioral patterns analysis. "
        "Simulation runs what-if scenarios: medication changes, exercise modifications, diet adjustments.",
        metadata={"source": "risk_analysis", "topic": "digital_twin", "lang": "en"},
    ),
    Document(
        page_content="Behavioral AI indicators for compliance prediction: "
        "High dropout risk: declining login frequency, skipped medication logs, reduced exercise sessions. "
        "Emotional eating signals: irregular meal timing, calorie spikes on high-stress days. "
        "Diet break prediction: 3+ consecutive days of exceeding calorie target. "
        "Positive indicators: consistent logging, improving vital trends, engagement with recommendations.",
        metadata={"source": "risk_analysis", "topic": "behavioral_ai", "lang": "en"},
    ),
]


# ── Retriever Factory ──────────────────────────────────

_retrievers: dict = {}
_vector_stores: dict = {}


def _get_all_documents(domain: str) -> list[Document]:
    """Get the document collection for a specific domain."""
    collections = {
        "clinical": CLINICAL_KNOWLEDGE,
        "nutrition": NUTRITION_KNOWLEDGE,
        "exercise": EXERCISE_KNOWLEDGE,
        "risk": RISK_KNOWLEDGE,
    }
    return collections.get(domain, CLINICAL_KNOWLEDGE)


def get_retriever(domain: str):
    """
    Load existing Chroma vector store if it exists on disk,
    otherwise create it from the in-memory document collection.
    """
    if domain in _retrievers:
        return _retrievers[domain]

    try:
        embeddings = OllamaEmbeddings(
            model=settings.EMBED_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
        )

        collection_name = f"healix_{domain}"
        persist_dir = settings.CHROMA_PERSIST_DIR

        # Ensure the persist directory exists
        os.makedirs(persist_dir, exist_ok=True)

        # Try loading an existing collection first
        vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=persist_dir,
        )

        # If the collection is empty, populate it from documents
        existing = vector_store.get()
        if not existing or not existing.get("ids"):
            print(f"📦 Collection '{collection_name}' is empty — creating from documents...")
            docs = _get_all_documents(domain)
            vector_store = Chroma.from_documents(
                documents=docs,
                embedding=embeddings,
                collection_name=collection_name,
                persist_directory=persist_dir,
            )
        else:
            print(f"✅ Loaded existing collection '{collection_name}' ({len(existing['ids'])} docs)")

        _vector_stores[domain] = vector_store

        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        _retrievers[domain] = retriever
        return retriever

    except Exception as e:
        print(f"⚠️  Failed to create retriever for {domain}: {e}")
        return None


def search_knowledge(domain: str, query: str) -> str:
    """Search the medical knowledge base for a specific domain and query."""
    try:
        retriever = get_retriever(domain)
        results = retriever.invoke(query)
        if results:
            # Deduplicate
            seen = set()
            unique = []
            for doc in results:
                if doc.page_content not in seen:
                    seen.add(doc.page_content)
                    unique.append(doc)
            return "\n\n".join([
                f"[Source: {doc.metadata.get('source', 'unknown')} | Topic: {doc.metadata.get('topic', 'general')}]\n{doc.page_content}"
                for doc in unique[:4]
            ])
        return "No relevant medical knowledge found for this query."
    except Exception as e:
        return f"Knowledge base search encountered an issue: {str(e)}"


def initialize_knowledge_base():
    """Pre-initialize all knowledge retriever at startup."""
    print("📚 Initializing Healix Medical Knowledge Base...")
    for domain in ["clinical", "nutrition", "exercise", "risk"]:
        try:
            get_retriever(domain)
            print(f"  ✅ {domain} knowledge loaded")
        except Exception as e:
            print(f"  ⚠️  {domain} knowledge failed: {e}")
    print("📚 Knowledge Base ready.")
