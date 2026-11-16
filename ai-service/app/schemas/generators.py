from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GenerateNotesRequest(BaseModel):
    user_id: str
    subject_name: str
    document_ids: List[str] = Field(default_factory=list)
    topic: Optional[str] = None
    note_type: str = "detailed"
    language: str = "english"

class GenerateQuizRequest(BaseModel):
    user_id: str
    subject_name: str
    document_ids: List[str] = Field(default_factory=list)
    topic: Optional[str] = None
    num_questions: int = 5
    difficulty: str = "Medium"
    question_type: str = "MCQ"

class PyqAnalyzeRequest(BaseModel):
    user_id: str
    subject_name: str
    syllabus_doc_ids: List[str] = Field(default_factory=list)
    pyq_doc_ids: List[str] = Field(default_factory=list)
    notes_doc_ids: List[str] = Field(default_factory=list)

class RevisionPlanRequest(BaseModel):
    subject_name: str
    weak_topics: List[Dict[str, Any]]
    daily_minutes: int = 60
    exam_date: Optional[str] = None