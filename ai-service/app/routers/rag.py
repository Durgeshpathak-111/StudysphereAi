# from fastapi import APIRouter, HTTPException
# from app.schemas.models import RagChatRequest, RagChatResponse
# from app.services.vector_store import vector_store
# from app.services.rag_engine import generate_grounded_answer

# router = APIRouter(prefix="/ai/rag", tags=["RAG Chatbot"])

# @router.post("/chat", response_model=RagChatResponse)
# async def rag_chat(payload: RagChatRequest):
#     try:
#         hits = vector_store.query_user_chunks(
#             user_id=payload.user_id,
#             question=payload.question,
#             subject_id=payload.subject_id,
#             document_ids=payload.document_ids,
#             top_k=5
#         )
#         result = generate_grounded_answer(
#             question=payload.question,
#             retrieved_chunks=hits,
#             mode=payload.mode
#         )
#         return RagChatResponse(answer=result["answer"], citations=result["citations"])
#     except Exception as exc:
#         raise HTTPException(status_code=500, detail=f"RAG query failed: {str(exc)}")

# from fastapi import APIRouter
# from app.schemas.models import RagChatRequest, RagChatResponse
# from app.services.vector_store import vector_store
# from app.services.rag_engine import generate_grounded_answer

# router = APIRouter(prefix="/ai/rag", tags=["RAG Chatbot"])

# @router.post("/chat", response_model=RagChatResponse)
# async def rag_chat(payload: RagChatRequest):
#     try:
#         hits = vector_store.query_user_chunks(
#             user_id=payload.user_id,
#             question=payload.question,
#             subject_id=payload.subject_id,
#             document_ids=payload.document_ids,
#             top_k=5
#         )
#         result = generate_grounded_answer(
#             question=payload.question,
#             retrieved_chunks=hits,
#             mode=payload.mode
#         )
#         return RagChatResponse(answer=result["answer"], citations=result["citations"])
#     except Exception as exc:
#         return RagChatResponse(
#             answer=f"⚠️ AI Service Debug Error: {str(exc)}",
#             citations=[]
#         )

from fastapi import APIRouter
from app.schemas.models import RagChatRequest, RagChatResponse
from app.services.vector_store import vector_store
from app.services.rag_engine import generate_grounded_answer

router = APIRouter(prefix="/ai/rag", tags=["RAG Chatbot"])

@router.post("/chat", response_model=RagChatResponse)
async def rag_chat(payload: RagChatRequest):
    try:
        hits = vector_store.query_user_chunks(
            user_id=payload.user_id,
            question=payload.question,
            subject_id=payload.subject_id,
            document_ids=payload.document_ids,
            top_k=5
        )

        # Fallback: agar specific document_ids/subject_id filter se 0 hits aaye, toh user ke sabhi docs me search karo
        if not hits and (payload.document_ids or payload.subject_id):
            hits = vector_store.query_user_chunks(
                user_id=payload.user_id,
                question=payload.question,
                subject_id=None,
                document_ids=None,
                top_k=5
            )

        if not hits:
            total_count = vector_store.collection.count()
            return RagChatResponse(
                answer=f"⚠️ No matching chunks found (Total vectors in ChromaDB: {total_count}). Please re-upload your PDF once so Gemini embeddings can index it.",
                citations=[]
            )

        result = generate_grounded_answer(
            question=payload.question,
            retrieved_chunks=hits,
            mode=payload.mode
        )
        return RagChatResponse(answer=result["answer"], citations=result["citations"])
    except Exception as exc:
        return RagChatResponse(
            answer=f"⚠️ AI Service Debug Error: {str(exc)}",
            citations=[]
        )