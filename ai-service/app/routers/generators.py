import json
import re
import google.generativeai as genai
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

def _extract_json(raw_text: str):
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
    return json.loads(cleaned)

@router.post("/notes")
async def generate_smart_notes(payload: GenerateNotesRequest):
    query_seed = payload.topic or f"{payload.subject_name} core concepts definitions theorems"
    hits = vector_store.query_user_chunks(
        user_id=payload.user_id,
        question=query_seed,
        document_ids=payload.document_ids or None,
        top_k=7
    )

    if not hits:
        raise HTTPException(status_code=400, detail="No indexed content found in selected documents.")

    context = "\n\n".join(
        f"[{h['metadata'].get('document_name')} - p.{h['metadata'].get('page_number')}]: {h['text']}"
        for h in hits
    )
    sources = list({
        f"{h['metadata'].get('document_name')} (p.{h['metadata'].get('page_number')})"
        for h in hits
    })

    prompt = f"""Generate grounded study notes ONLY from the provided context.
Subject: {payload.subject_name}
Topic Focus: {payload.topic or 'All retrieved topics'}
Format Type: {payload.note_type}
Language Style: {payload.language}

Return ONLY valid JSON:
{{
  "suggestedSubject": "{payload.subject_name}",
  "suggestedUnit": "Unit Title",
  "suggestedTopic": "Main Topic",
  "suggestedSubtopics": ["subtopic 1", "subtopic 2"],
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "title": "Descriptive Notes Title",
  "contentMarkdown": "Structured notes with headings and bullet points"
}}

CONTEXT:
{context}
"""
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    res = model.generate_content(prompt)
    parsed = _extract_json(res.text)
    parsed["sources"] = sources
    return parsed

@router.post("/quiz")
async def generate_quiz_questions(payload: GenerateQuizRequest):
    query_seed = payload.topic or f"{payload.subject_name} important concepts mechanisms formulas"
    hits = vector_store.query_user_chunks(
        user_id=payload.user_id,
        question=query_seed,
        document_ids=payload.document_ids or None,
        top_k=8
    )

    if not hits:
        raise HTTPException(status_code=400, detail="No indexed study material found to generate quiz.")

    context = "\n\n".join(
        f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text']}"
        for h in hits
    )

    prompt = f"""Generate {payload.num_questions} {payload.difficulty}-level {payload.question_type} questions strictly grounded in the context below.
For MCQ: provide exactly 4 options and `correctAnswer` MUST match one option verbatim.
For TrueFalse: options MUST be ["True", "False"].
For subjective types: options as [] and model answer in `correctAnswer`.

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
{context}
"""
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    res = model.generate_content(prompt)
    questions = _extract_json(res.text)
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
    syl_hits = vector_store.query_user_chunks(payload.user_id, "syllabus units topics", document_ids=payload.syllabus_doc_ids, top_k=10) if payload.syllabus_doc_ids else []
    pyq_hits = vector_store.query_user_chunks(payload.user_id, "question marks explain define", document_ids=payload.pyq_doc_ids, top_k=12) if payload.pyq_doc_ids else []
    note_hits = vector_store.query_user_chunks(payload.user_id, "notes summary concepts", document_ids=payload.notes_doc_ids, top_k=10) if payload.notes_doc_ids else []

    if not syl_hits and not pyq_hits:
        raise HTTPException(status_code=400, detail="Select at least one indexed Syllabus or PYQ document.")

    prompt = f"""Analyze syllabus, PYQs, and student notes without inventing questions.
Return ONLY valid JSON:
{{
  "unitDistribution": [{{ "unit": "Unit 1", "questionCount": 4, "weightagePct": 25 }}],
  "topicFrequency": [{{ "topic": "Topic", "unit": "Unit 1", "frequency": 3, "yearsAppeared": ["2024"], "hasNotes": true }}],
  "extractedQuestions": [{{ "questionText": "Exact text", "unit": "Unit 1", "topic": "Topic", "sourcePaper": "DocName", "page": 1 }}],
  "missingFromNotes": ["Topic A"],
  "unaskedSyllabusTopics": ["Topic B"]
}}

SYLLABUS: {chr(10).join(h['text'] for h in syl_hits)}
PYQ: {chr(10).join(f"[{h['metadata'].get('document_name')} p.{h['metadata'].get('page_number')}]: {h['text']}" for h in pyq_hits)}
NOTES: {chr(10).join(h['text'] for h in note_hits)}
"""
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    res = model.generate_content(prompt)
    return _extract_json(res.text)

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
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    res = model.generate_content(prompt)
    return _extract_json(res.text)