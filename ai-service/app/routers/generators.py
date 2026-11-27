# import json
# import re
# import google.generativeai as genai
# from fastapi import APIRouter, HTTPException
# from app.core.config import settings
# from app.services.vector_store import vector_store
# from app.schemas.generators import (
#     GenerateNotesRequest,
#     GenerateQuizRequest,
#     PyqAnalyzeRequest,
#     RevisionPlanRequest
# )

# router = APIRouter(prefix="/ai/generate", tags=["AI Study Generators"])

# if settings.GEMINI_API_KEY:
#     genai.configure(api_key=settings.GEMINI_API_KEY)

# def _extract_json(raw_text: str):
#     cleaned = re.sub(r"^```(?:json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
#     return json.loads(cleaned)

# @router.post("/notes")
# async def generate_smart_notes(payload: GenerateNotesRequest):
#     query_seed = payload.topic or f"{payload.subject_name} core concepts definitions theorems"
#     hits = vector_store.query_user_chunks(
#         user_id=payload.user_id,
#         question=query_seed,
#         document_ids=payload.document_ids or None,
#         top_k=7
#     )

#     if not hits:
#         raise HTTPException(status_code=400, detail="No indexed content found in selected documents.")

#     context = "\n\n".join(
#         f"[{h['metadata'].get('document_name')} - p.{h['metadata'].get('page_number')}]: {h['text']}"
#         for h in hits
#     )
#     sources = list({
#         f"{h['metadata'].get('document_name')} (p.{h['metadata'].get('page_number')})"
#         for h in hits
#     })

#     prompt = f"""Generate grounded study notes ONLY from the provided context.
# Subject: {payload.subject_name}
# Topic Focus: {payload.topic or 'All retrieved topics'}
# Format Type: {payload.note_type}
# Language Style: {payload.language}

# Return ONLY valid JSON:
# {{
#   "suggestedSubject": "{payload.subject_name}",
#   "suggestedUnit": "Unit Title",
#   "suggestedTopic": "Main Topic",
#   "suggestedSubtopics": ["subtopic 1", "subtopic 2"],
#   "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
#   "title": "Descriptive Notes Title",
#   "contentMarkdown": "Structured notes with headings and bullet points"
# }}

# CONTEXT:
# {context}
# """
#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     res = model.generate_content(prompt)
#     parsed = _extract_json(res.text)
#     parsed["sources"] = sources
#     return parsed

# @router.post("/quiz")
# async def generate_quiz_questions(payload: GenerateQuizRequest):
#     query_seed = payload.topic or f"{payload.subject_name} important concepts mechanisms formulas"
#     hits = vector_store.query_user_chunks(
#         user_id=payload.user_id,
#         question=query_seed,
#         document_ids=payload.document_ids or None,
#         top_k=8
#     )

#     if not hits:
#         raise HTTPException(status_code=400, detail="No indexed study material found to generate quiz.")

#     context = "\n\n".join(
#         f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text']}"
#         for h in hits
#     )

#     prompt = f"""Generate {payload.num_questions} {payload.difficulty}-level {payload.question_type} questions strictly grounded in the context below.
# For MCQ: provide exactly 4 options and `correctAnswer` MUST match one option verbatim.
# For TrueFalse: options MUST be ["True", "False"].
# For subjective types: options as [] and model answer in `correctAnswer`.

# Return ONLY a valid JSON array:
# [
#   {{
#     "question": "...",
#     "questionType": "{payload.question_type}",
#     "options": ["Option A", "Option B", "Option C", "Option D"],
#     "correctAnswer": "Option A",
#     "explanation": "Why this answer is correct",
#     "difficulty": "{payload.difficulty}",
#     "topic": "{payload.topic or payload.subject_name}",
#     "sourceRef": "DocumentName (p.X)"
#   }}
# ]

# CONTEXT:
# {context}
# """
#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     res = model.generate_content(prompt)
#     questions = _extract_json(res.text)
#     validated = []
#     for q in questions:
#         if payload.question_type == "MCQ":
#             opts = q.get("options", [])
#             ans = q.get("correctAnswer", "")
#             if len(opts) != 4 or ans not in opts:
#                 continue
#         validated.append(q)
#     return {"questions": validated}

# @router.post("/pyq-analysis")
# async def analyze_syllabus_and_pyq(payload: PyqAnalyzeRequest):
#     syl_hits = vector_store.query_user_chunks(payload.user_id, "syllabus units topics", document_ids=payload.syllabus_doc_ids, top_k=10) if payload.syllabus_doc_ids else []
#     pyq_hits = vector_store.query_user_chunks(payload.user_id, "question marks explain define", document_ids=payload.pyq_doc_ids, top_k=12) if payload.pyq_doc_ids else []
#     note_hits = vector_store.query_user_chunks(payload.user_id, "notes summary concepts", document_ids=payload.notes_doc_ids, top_k=10) if payload.notes_doc_ids else []

#     if not syl_hits and not pyq_hits:
#         raise HTTPException(status_code=400, detail="Select at least one indexed Syllabus or PYQ document.")

#     prompt = f"""Analyze syllabus, PYQs, and student notes without inventing questions.
# Return ONLY valid JSON:
# {{
#   "unitDistribution": [{{ "unit": "Unit 1", "questionCount": 4, "weightagePct": 25 }}],
#   "topicFrequency": [{{ "topic": "Topic", "unit": "Unit 1", "frequency": 3, "yearsAppeared": ["2024"], "hasNotes": true }}],
#   "extractedQuestions": [{{ "questionText": "Exact text", "unit": "Unit 1", "topic": "Topic", "sourcePaper": "DocName", "page": 1 }}],
#   "missingFromNotes": ["Topic A"],
#   "unaskedSyllabusTopics": ["Topic B"]
# }}

# SYLLABUS: {chr(10).join(h['text'] for h in syl_hits)}
# PYQ: {chr(10).join(f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text']}" for h in pyq_hits)}
# NOTES: {chr(10).join(h['text'] for h in note_hits)}
# """
#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     res = model.generate_content(prompt)
#     return _extract_json(res.text)

# @router.post("/revision-plan")
# async def generate_revision_plan(payload: RevisionPlanRequest):
#     prompt = f"""Create a daily revision plan for {payload.subject_name} ({payload.daily_minutes} mins/day, Exam: {payload.exam_date or 'Upcoming'}).
# Weak Topics: {json.dumps(payload.weak_topics)}

# Return ONLY valid JSON:
# {{
#   "disclaimer": "Recommendations are AI-generated from quiz accuracy trends and complement full syllabus study.",
#   "dailyTasks": [{{ "day": "Day 1", "topic": "Topic", "durationMins": 45, "action": "Revise & practice" }}],
#   "flashcards": [{{ "topic": "Topic", "front": "Question", "back": "Answer" }}]
# }}
# """
#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     res = model.generate_content(prompt)
#     return _extract_json(res.text)

# import json
# import re
# import google.generativeai as genai
# from fastapi import APIRouter, HTTPException
# from app.core.config import settings
# from app.services.vector_store import vector_store
# from app.schemas.generators import (
#     GenerateNotesRequest,
#     GenerateQuizRequest,
#     PyqAnalyzeRequest,
#     RevisionPlanRequest
# )

# router = APIRouter(prefix="/ai/generate", tags=["AI Study Generators"])

# if settings.GEMINI_API_KEY:
#     genai.configure(api_key=settings.GEMINI_API_KEY)


# def _extract_json(raw_text: str):
#     cleaned = raw_text.strip()
#     cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
#     cleaned = re.sub(r"\s*```$", "", cleaned).strip()

#     obj_start, obj_end = cleaned.find("{"), cleaned.rfind("}")
#     arr_start, arr_end = cleaned.find("["), cleaned.rfind("]")

#     if arr_start != -1 and (obj_start == -1 or arr_start < obj_start) and arr_end > arr_start:
#         cleaned = cleaned[arr_start : arr_end + 1]
#     elif obj_start != -1 and obj_end > obj_start:
#         cleaned = cleaned[obj_start : obj_end + 1]

#     try:
#         return json.loads(cleaned)
#     except json.JSONDecodeError:
#         repaired = re.sub(r",\s*([}\]])", r"\1", cleaned)
#         try:
#             return json.loads(repaired, strict=False)
#         except json.JSONDecodeError as err:
#             raise HTTPException(status_code=502, detail=f"AI returned malformed JSON: {str(err)}")


# def _generate_json_response(prompt: str, timeout_sec: int = 90):
#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     res = model.generate_content(
#         prompt,
#         generation_config={
#             "response_mime_type": "application/json",
#             "max_output_tokens": 8192,
#         },
#         request_options={"timeout": timeout_sec}
#     )
#     return _extract_json(res.text)


# @router.post("/notes")
# async def generate_smart_notes(payload: GenerateNotesRequest):
#     query_seed = payload.topic or f"{payload.subject_name} core concepts definitions theorems"
#     top_k = 10 if "unit" in payload.note_type.lower() else 6

#     hits = vector_store.query_user_chunks(
#         user_id=payload.user_id,
#         question=query_seed,
#         document_ids=payload.document_ids or None,
#         top_k=top_k
#     )

#     if not hits and not payload.allow_general_ai:
#         raise HTTPException(status_code=400, detail="Strict PDF Mode: No indexed content found in selected documents.")

#     context = "\n\n".join(
#         f"[{h['metadata'].get('document_name')} - p.{h['metadata'].get('page_number')}]: {h['text'][:1200]}"
#         for h in hits
#     )
#     sources = list({
#         f"{h['metadata'].get('document_name')} (p.{h['metadata'].get('page_number')})"
#         for h in hits
#     })
#     if payload.allow_general_ai and not sources:
#         sources = ["Hybrid AI Academic Knowledge"]

#     note_key = payload.note_type.strip().lower()
#     format_guides = {
#         "short": "Write a crisp, high-yield Short Summary (250-400 words) with bold key terms and bullet points.",
#         "detailed": "Write a comprehensive, in-depth Detailed Summary covering every concept, workflow, and example.",
#         "unit": "Organize strictly as a Unit-Wise Summary with clear Unit/Module headings and key takeaways.",
#         "definition": "Extract and present ONLY Important Definitions & Key Terms with formal definition and 1-line example.",
#         "exam": "Write Exam-Oriented University Notes (5-mark & 10-mark structure: Definition, Working, Advantages/Limitations, Viva Questions).",
#     }
#     selected_guide = next((v for k, v in format_guides.items() if k in note_key), format_guides["detailed"])

#     lang_instruction = (
#         "Write in natural Hinglish (Hindi concepts explained with English technical terms)."
#         if "hinglish" in payload.language.lower()
#         else "Write in clear, formal academic English."
#     )

#     grounding_rule = (
#         "HYBRID MODE ON: Prioritize the provided PDF context first, and enrich/complete any missing explanations, examples, or subtopics using your general academic knowledge."
#         if payload.allow_general_ai
#         else "STRICT PDF ONLY MODE: Generate notes STRICTLY from the provided context below. Do NOT add outside facts."
#     )

#     prompt = f"""{grounding_rule}
# Subject: {payload.subject_name}
# Topic Focus: {payload.topic or 'All retrieved topics'}
# Format: {selected_guide}
# Language: {lang_instruction}

# Return ONLY valid JSON with non-empty strings:
# {{
#   "suggestedSubject": "{payload.subject_name}",
#   "suggestedUnit": "Unit Name",
#   "suggestedTopic": "{payload.topic or payload.subject_name}",
#   "suggestedSubtopics": ["subtopic 1", "subtopic 2"],
#   "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
#   "title": "Descriptive Notes Title",
#   "contentMarkdown": "Full structured Markdown notes"
# }}

# CONTEXT:
# {context or 'No PDF excerpts retrieved; generate complete academic notes on the requested topic.'}
# """
#     parsed = _generate_json_response(prompt, timeout_sec=75)
#     fallback_topic = (payload.topic or payload.subject_name or "Study Notes").strip()
#     parsed["title"] = (parsed.get("title") or "").strip() or f"{fallback_topic} — {payload.note_type.title()} Notes"
#     parsed["suggestedSubject"] = (parsed.get("suggestedSubject") or "").strip() or payload.subject_name
#     parsed["suggestedUnit"] = (parsed.get("suggestedUnit") or "").strip() or "Core Unit"
#     parsed["suggestedTopic"] = (parsed.get("suggestedTopic") or "").strip() or fallback_topic
#     parsed["contentMarkdown"] = (parsed.get("contentMarkdown") or "").strip() or "No summary content generated."
#     parsed["sources"] = sources
#     return parsed


# @router.post("/quiz")
# async def generate_quiz_questions(payload: GenerateQuizRequest):
#     query_seed = payload.topic or f"{payload.subject_name} important concepts mechanisms formulas"
#     hits = vector_store.query_user_chunks(
#         user_id=payload.user_id,
#         question=query_seed,
#         document_ids=payload.document_ids or None,
#         top_k=6
#     )

#     if not hits and not payload.allow_general_ai:
#         raise HTTPException(status_code=400, detail="Strict PDF Mode: No indexed study material found.")

#     context = "\n\n".join(
#         f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text'][:1000]}"
#         for h in hits
#     )

#     prompt = f"""Generate {payload.num_questions} {payload.difficulty}-level {payload.question_type} questions.
# For MCQ: provide 4 options and `correctAnswer` MUST match one option verbatim.
# For TrueFalse: options MUST be ["True", "False"].

# Return ONLY a valid JSON array:
# [
#   {{
#     "question": "...",
#     "questionType": "{payload.question_type}",
#     "options": ["Option A", "Option B", "Option C", "Option D"],
#     "correctAnswer": "Option A",
#     "explanation": "Why this answer is correct",
#     "difficulty": "{payload.difficulty}",
#     "topic": "{payload.topic or payload.subject_name}",
#     "sourceRef": "DocumentName (p.X)"
#   }}
# ]

# CONTEXT:
# {context or f"Generate academic quiz questions for {payload.subject_name} - {payload.topic or 'Core Concepts'}."}
# """
#     questions = _generate_json_response(prompt, timeout_sec=75)
#     if isinstance(questions, dict):
#         questions = questions.get("questions", [])

#     validated = []
#     for q in questions:
#         if payload.question_type == "MCQ":
#             opts = q.get("options", [])
#             ans = q.get("correctAnswer", "")
#             if len(opts) != 4 or ans not in opts:
#                 continue
#         validated.append(q)
#     return {"questions": validated}


# @router.post("/pyq-analysis")
# async def analyze_syllabus_and_pyq(payload: PyqAnalyzeRequest):
#     syl_hits = vector_store.query_user_chunks(payload.user_id, "syllabus units topics modules", document_ids=payload.syllabus_doc_ids, top_k=6) if payload.syllabus_doc_ids else []
#     pyq_hits = vector_store.query_user_chunks(payload.user_id, "question marks explain define describe", document_ids=payload.pyq_doc_ids, top_k=8) if payload.pyq_doc_ids else []
#     note_hits = vector_store.query_user_chunks(payload.user_id, "notes summary concepts", document_ids=payload.notes_doc_ids, top_k=5) if payload.notes_doc_ids else []

#     if not syl_hits and not pyq_hits:
#         raise HTTPException(status_code=400, detail="Select at least one indexed Syllabus or PYQ document.")

#     syl_text = "\n".join(h["text"][:900] for h in syl_hits) or "Not provided"
#     pyq_text = "\n".join(f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text'][:900]}" for h in pyq_hits) or "Not provided"
#     note_text = "\n".join(h["text"][:700] for h in note_hits) or "Not provided"

#     prompt = f"""Analyze Syllabus, PYQs, and Student Notes for {payload.subject_name} concisely.
# Also generate 6 high-probability predicted exam PYQs mapped to the Syllabus units.

# Return ONLY valid JSON:
# {{
#   "unitDistribution": [{{ "unit": "Unit 1", "questionCount": 4, "weightagePct": 25 }}],
#   "topicFrequency": [{{ "topic": "Topic", "unit": "Unit 1", "frequency": 3, "yearsAppeared": ["2024"], "hasNotes": true }}],
#   "extractedQuestions": [{{ "questionText": "Question text", "unit": "Unit 1", "topic": "Topic", "sourcePaper": "DocName", "page": 1 }}],
#   "predictedPyqs": [{{ "question": "Expected exam question", "unit": "Unit 1", "marks": 10, "probability": "High" }}],
#   "missingFromNotes": ["Topic A"],
#   "unaskedSyllabusTopics": ["Topic B"]
# }}

# SYLLABUS:
# {syl_text}

# PYQ:
# {pyq_text}

# NOTES:
# {note_text}
# """
#     return _generate_json_response(prompt, timeout_sec=90)


# @router.post("/revision-plan")
# async def generate_revision_plan(payload: RevisionPlanRequest):
#     prompt = f"""Create a daily revision plan for {payload.subject_name} ({payload.daily_minutes} mins/day, Exam: {payload.exam_date or 'Upcoming'}).
# Weak Topics: {json.dumps(payload.weak_topics)}

# Return ONLY valid JSON:
# {{
#   "disclaimer": "Recommendations are AI-generated from quiz accuracy trends and complement full syllabus study.",
#   "dailyTasks": [{{ "day": "Day 1", "topic": "Topic", "durationMins": 45, "action": "Revise & practice" }}],
#   "flashcards": [{{ "topic": "Topic", "front": "Question", "back": "Answer" }}]
# }}
# """
#     return _generate_json_response(prompt, timeout_sec=60)

import json
import re
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.services.vector_store import vector_store
from app.schemas.generators import (
    GenerateNotesRequest,
    GenerateQuizRequest,
    PyqAnalyzeRequest,
    RevisionPlanRequest
)

router = APIRouter(prefix="/ai/generate", tags=["AI Study Generators"])

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

FALLBACK_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]


def _extract_json(raw_text: str):
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    obj_start, obj_end = cleaned.find("{"), cleaned.rfind("}")
    arr_start, arr_end = cleaned.find("["), cleaned.rfind("]")

    if arr_start != -1 and (obj_start == -1 or arr_start < obj_start) and arr_end > arr_start:
        cleaned = cleaned[arr_start : arr_end + 1]
    elif obj_start != -1 and obj_end > obj_start:
        cleaned = cleaned[obj_start : obj_end + 1]

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        repaired = re.sub(r",\s*([}\]])", r"\1", cleaned)
        last_complete = max(repaired.rfind("}"), repaired.rfind("]"), repaired.rfind('"'))
        if last_complete != -1:
            repaired = repaired[: last_complete + 1]
        repaired = re.sub(r",\s*$", "", repaired)
        open_brackets = repaired.count("[") - repaired.count("]")
        open_braces = repaired.count("{") - repaired.count("}")
        if open_brackets > 0:
            repaired += "]" * open_brackets
        if open_braces > 0:
            repaired += "}" * open_braces
        try:
            return json.loads(repaired, strict=False)
        except json.JSONDecodeError as err:
            raise HTTPException(status_code=502, detail=f"AI returned malformed JSON: {str(err)}")


def _generate_json_response(prompt: str, timeout_sec: int = 90):
    seen = set()
    for model_name in FALLBACK_MODELS:
        if not model_name or model_name in seen:
            continue
        seen.add(model_name)
        try:
            model = genai.GenerativeModel(model_name)
            res = model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "max_output_tokens": 8192,
                },
                request_options={"timeout": timeout_sec}
            )
            return _extract_json(res.text)
        except ResourceExhausted:
            continue
    raise HTTPException(
        status_code=429,
        detail="All Gemini free-tier daily quotas exhausted. Update GEMINI_API_KEY in ai-service/.env."
    )


@router.post("/notes")
async def generate_smart_notes(payload: GenerateNotesRequest):
    query_seed = payload.topic or f"{payload.subject_name} core concepts definitions theorems"
    top_k = 10 if "unit" in payload.note_type.lower() else 6

    hits = vector_store.query_user_chunks(
        user_id=payload.user_id,
        question=query_seed,
        document_ids=payload.document_ids or None,
        top_k=top_k
    )

    if not hits and not payload.allow_general_ai:
        raise HTTPException(status_code=400, detail="Strict PDF Mode: No indexed content found in selected documents.")

    context = "\n\n".join(
        f"[{h['metadata'].get('document_name')} - p.{h['metadata'].get('page_number')}]: {h['text'][:1200]}"
        for h in hits
    )
    sources = list({
        f"{h['metadata'].get('document_name')} (p.{h['metadata'].get('page_number')})"
        for h in hits
    })
    if payload.allow_general_ai and not sources:
        sources = ["Hybrid AI Academic Knowledge"]

    note_key = payload.note_type.strip().lower()
    format_guides = {
        "short": "Write a crisp, high-yield Short Summary (250-400 words) with bold key terms and bullet points.",
        "detailed": "Write a comprehensive, in-depth Detailed Summary covering every concept, workflow, and example.",
        "unit": "Organize strictly as a Unit-Wise Summary with clear Unit/Module headings and key takeaways.",
        "definition": "Extract and present ONLY Important Definitions & Key Terms with formal definition and 1-line example.",
        "exam": "Write Exam-Oriented University Notes (5-mark & 10-mark structure: Definition, Working, Advantages/Limitations, Viva Questions).",
    }
    selected_guide = next((v for k, v in format_guides.items() if k in note_key), format_guides["detailed"])

    lang_instruction = (
        "Write in natural Hinglish (Hindi concepts explained with English technical terms)."
        if "hinglish" in payload.language.lower()
        else "Write in clear, formal academic English."
    )

    grounding_rule = (
        "HYBRID MODE ON: Prioritize the provided PDF context first, and enrich/complete any missing explanations, examples, or subtopics using your general academic knowledge."
        if payload.allow_general_ai
        else "STRICT PDF ONLY MODE: Generate notes STRICTLY from the provided context below. Do NOT add outside facts."
    )

    prompt = f"""{grounding_rule}
Subject: {payload.subject_name}
Topic Focus: {payload.topic or 'All retrieved topics'}
Format: {selected_guide}
Language: {lang_instruction}

Return ONLY valid JSON with non-empty strings:
{{
  "suggestedSubject": "{payload.subject_name}",
  "suggestedUnit": "Unit Name",
  "suggestedTopic": "{payload.topic or payload.subject_name}",
  "suggestedSubtopics": ["subtopic 1", "subtopic 2"],
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "title": "Descriptive Notes Title",
  "contentMarkdown": "Full structured Markdown notes"
}}

CONTEXT:
{context or 'No PDF excerpts retrieved; generate complete academic notes on the requested topic.'}
"""
    parsed = _generate_json_response(prompt, timeout_sec=75)
    fallback_topic = (payload.topic or payload.subject_name or "Study Notes").strip()
    parsed["title"] = (parsed.get("title") or "").strip() or f"{fallback_topic} — {payload.note_type.title()} Notes"
    parsed["suggestedSubject"] = (parsed.get("suggestedSubject") or "").strip() or payload.subject_name
    parsed["suggestedUnit"] = (parsed.get("suggestedUnit") or "").strip() or "Core Unit"
    parsed["suggestedTopic"] = (parsed.get("suggestedTopic") or "").strip() or fallback_topic
    parsed["contentMarkdown"] = (parsed.get("contentMarkdown") or "").strip() or "No summary content generated."
    parsed["sources"] = sources
    return parsed


@router.post("/quiz")
async def generate_quiz_questions(payload: GenerateQuizRequest):
    query_seed = payload.topic or f"{payload.subject_name} important concepts mechanisms formulas"
    hits = vector_store.query_user_chunks(
        user_id=payload.user_id,
        question=query_seed,
        document_ids=payload.document_ids or None,
        top_k=6
    )

    if not hits and not payload.allow_general_ai:
        raise HTTPException(status_code=400, detail="Strict PDF Mode: No indexed study material found.")

    context = "\n\n".join(
        f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text'][:1000]}"
        for h in hits
    )

    prompt = f"""Generate {payload.num_questions} {payload.difficulty}-level {payload.question_type} questions.
For MCQ: provide 4 options and `correctAnswer` MUST match one option verbatim.
For TrueFalse: options MUST be ["True", "False"].

Return ONLY a valid JSON array:
[
  {{
    "question": "...",
    "questionType": "{payload.question_type}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this answer is correct",
    "difficulty": "{payload.difficulty}",
    "topic": "{payload.topic or payload.subject_name}",
    "sourceRef": "DocumentName (p.X)"
  }}
]

CONTEXT:
{context or f"Generate academic quiz questions for {payload.subject_name} - {payload.topic or 'Core Concepts'}."}
"""
    questions = _generate_json_response(prompt, timeout_sec=75)
    if isinstance(questions, dict):
        questions = questions.get("questions", [])

    validated = []
    for q in questions:
        if payload.question_type == "MCQ":
            opts = q.get("options", [])
            ans = q.get("correctAnswer", "")
            if len(opts) != 4 or ans not in opts:
                continue
        validated.append(q)
    return {"questions": validated}


@router.post("/pyq-analysis")
async def analyze_syllabus_and_pyq(payload: PyqAnalyzeRequest):
    focus_topic = (getattr(payload, "topic", "") or "").strip()
    syl_query = f"{focus_topic} syllabus units topics" if focus_topic else "syllabus units topics modules"
    pyq_query = f"{focus_topic} question marks explain define" if focus_topic else "question marks explain define describe"
    note_query = f"{focus_topic} notes summary concepts" if focus_topic else "notes summary concepts"

    syl_hits = vector_store.query_user_chunks(payload.user_id, syl_query, document_ids=payload.syllabus_doc_ids, top_k=5) if payload.syllabus_doc_ids else []
    pyq_hits = vector_store.query_user_chunks(payload.user_id, pyq_query, document_ids=payload.pyq_doc_ids, top_k=6) if payload.pyq_doc_ids else []
    note_hits = vector_store.query_user_chunks(payload.user_id, note_query, document_ids=payload.notes_doc_ids, top_k=4) if payload.notes_doc_ids else []

    if not syl_hits and not pyq_hits:
        raise HTTPException(status_code=400, detail="Select at least one indexed Syllabus or PYQ document.")

    syl_text = "\n".join(h["text"][:750] for h in syl_hits) or "Not provided"
    pyq_text = "\n".join(f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text'][:750]}" for h in pyq_hits) or "Not provided"
    note_text = "\n".join(h["text"][:600] for h in note_hits) or "Not provided"
    topic_scope = f"specifically focused on '{focus_topic}'" if focus_topic else "across all units"

    prompt = f"""Analyze Syllabus, PYQs, and Student Notes for {payload.subject_name} {topic_scope} concisely (max 5 items per list).
Also generate 5 high-probability predicted exam PYQs mapped to the Syllabus units {topic_scope}.

Return ONLY valid JSON:
{{
  "unitDistribution": [{{ "unit": "Unit 1", "questionCount": 4, "weightagePct": 25 }}],
  "topicFrequency": [{{ "topic": "Topic", "unit": "Unit 1", "frequency": 3, "yearsAppeared": ["2024"], "hasNotes": true }}],
  "extractedQuestions": [{{ "questionText": "Question text", "unit": "Unit 1", "topic": "Topic", "sourcePaper": "DocName", "page": 1 }}],
  "predictedPyqs": [{{ "question": "Expected exam question", "unit": "Unit 1", "marks": 10, "probability": "High" }}],
  "missingFromNotes": ["Topic A"],
  "unaskedSyllabusTopics": ["Topic B"]
}}

SYLLABUS:
{syl_text}

PYQ:
{pyq_text}

NOTES:
{note_text}
"""
    data = _generate_json_response(prompt, timeout_sec=90)
    if not isinstance(data, dict):
        data = {}
    return {
        "unitDistribution": data.get("unitDistribution") or [],
        "topicFrequency": data.get("topicFrequency") or [],
        "extractedQuestions": data.get("extractedQuestions") or [],
        "predictedPyqs": data.get("predictedPyqs") or [],
        "missingFromNotes": data.get("missingFromNotes") or [],
        "unaskedSyllabusTopics": data.get("unaskedSyllabusTopics") or [],
    }


@router.post("/revision-plan")
async def generate_revision_plan(payload: RevisionPlanRequest):
    prompt = f"""Create a daily revision plan for {payload.subject_name} ({payload.daily_minutes} mins/day, Exam: {payload.exam_date or 'Upcoming'}).
Weak Topics: {json.dumps(payload.weak_topics)}

Return ONLY valid JSON:
{{
  "disclaimer": "Recommendations are AI-generated from quiz accuracy trends and complement full syllabus study.",
  "dailyTasks": [{{ "day": "Day 1", "topic": "Topic", "durationMins": 45, "action": "Revise & practice" }}],
  "flashcards": [{{ "topic": "Topic", "front": "Question", "back": "Answer" }}]
}}
"""
    return _generate_json_response(prompt, timeout_sec=60)