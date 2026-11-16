from pydantic import BaseModel, Field
from typing import List, Optional

class ProcessResponse(BaseModel):
    document_id: str
    status: str
    page_count: int
    chunk_count: int
    topics: List[str]
    keywords: List[str]

class TextAnalyzeRequest(BaseModel):
    text: str

class ChatHistoryTurn(BaseModel):
    role: str
    content: str

class RagChatRequest(BaseModel):
    user_id: str
    question: str
    subject_id: Optional[str] = None
    document_ids: List[str] = Field(default_factory=list)
    mode: str = "english"
    history: List[ChatHistoryTurn] = Field(default_factory=list)

class CitationItem(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    passage: str

class RagChatResponse(BaseModel):
    answer: str
    citations: List[CitationItem]