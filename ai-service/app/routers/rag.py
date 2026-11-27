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

#         # Fallback: agar specific document_ids/subject_id filter se 0 hits aaye, toh user ke sabhi docs me search karo
#         if not hits and (payload.document_ids or payload.subject_id):
#             hits = vector_store.query_user_chunks(
#                 user_id=payload.user_id,
#                 question=payload.question,
#                 subject_id=None,
#                 document_ids=None,
#                 top_k=5
#             )

#         if not hits:
#             total_count = vector_store.collection.count()
#             return RagChatResponse(
#                 answer=f"⚠️ No matching chunks found (Total vectors in ChromaDB: {total_count}). Please re-upload your PDF once so Gemini embeddings can index it.",
#                 citations=[]
#             )

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

# import google.generativeai as genai
# from fastapi import APIRouter
# from app.core.config import settings
# from app.schemas.models import RagChatRequest, RagChatResponse
# from app.services.vector_store import vector_store
# from app.services.rag_engine import generate_grounded_answer

# genai.configure(api_key=settings.GEMINI_API_KEY)

# router = APIRouter(prefix="/ai/rag", tags=["RAG Chatbot"])


# def _generate_general_ai_answer(question: str, mode: str) -> str:
#     mode_instructions = {
#         "english": "Explain clearly in simple, easy-to-understand English with bullet points.",
#         "hinglish": "Explain clearly in natural Hinglish (Hindi + English mix) like a helpful Indian college tutor.",
#         "exam": "Write a well-structured university exam answer with Definition, Key Points, Example, and Conclusion."
#     }
#     style = mode_instructions.get(mode, mode_instructions["english"])

#     prompt = f"""You are StudySphere AI, an expert academic tutor for university students.
# The student asked a question whose answer is NOT present in their uploaded PDF notes.
# Provide an accurate, helpful explanation using your general academic knowledge.
# Formatting instruction: {style}

# Student Question: {question}
# """
#     model = genai.GenerativeModel("gemini-2.5-flash")
#     response = model.generate_content(prompt)
#     return response.text.strip()


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

#         # Fallback search across all user docs if subject/doc filter returned nothing
#         if not hits and (payload.document_ids or payload.subject_id):
#             hits = vector_store.query_user_chunks(
#                 user_id=payload.user_id,
#                 question=payload.question,
#                 subject_id=None,
#                 document_ids=None,
#                 top_k=5
#             )

#         # Check if retrieved chunks actually match the question (distance < 0.72 means relevant overlap)
#         relevant_hits = [h for h in hits if h.get("distance", 1.0) < 0.72]

#         if relevant_hits:
#             result = generate_grounded_answer(
#                 question=payload.question,
#                 retrieved_chunks=relevant_hits,
#                 mode=payload.mode
#             )
#             return RagChatResponse(
#                 answer=result["answer"],
#                 citations=result["citations"],
#                 source_type="pdf_rag"
#             )

#         # Agar Smart Hybrid AI ON hai tabhi General AI chalega
#         if payload.allow_general_ai:
#             general_answer = _generate_general_ai_answer(payload.question, payload.mode)
#             return RagChatResponse(
#                 answer=general_answer,
#                 citations=[],
#                 source_type="general_ai"
#             )

#         # Strict PDF Mode ON hai aur PDF mein nahi mila
#         return RagChatResponse(
#             answer="⚠️ Strict PDF Mode: This topic was not found in your uploaded PDF notes. Enable the ' Smart Hybrid AI' toggle at the top to get an answer from General AI knowledge.",
#             citations=[],
#             source_type="not_found"
#         )

#     except Exception as exc:
#         return RagChatResponse(
#             answer=f"⚠️ AI Service Debug Error: {str(exc)}",
#             citations=[],
#             source_type="error"
#         )

import google.generativeai as genai
from fastapi import APIRouter
from app.core.config import settings
from app.schemas.models import RagChatRequest, RagChatResponse, CitationItem
from app.services.vector_store import vector_store
from app.services.rag_engine import generate_grounded_answer

genai.configure(api_key=settings.GEMINI_API_KEY)

router = APIRouter(prefix="/ai/rag", tags=["RAG Chatbot"])


def _get_style_instruction(mode: str) -> str:
    mode_instructions = {
        "english": "Explain clearly in simple, easy-to-understand English with clear headings and bullet points.",
        "hinglish": "Explain clearly in natural Hinglish (Hindi + English mix) like a friendly, expert Indian teacher.",
        "exam": "Write a comprehensive, high-scoring university/board exam answer with Definition, Key Points, Explanation, and Conclusion."
    }
    return mode_instructions.get(mode, mode_instructions["english"])


def _generate_hybrid_answer(question: str, chunks: list, mode: str) -> dict:
    style = _get_style_instruction(mode)
    context_blocks = []
    citations = []

    for c in chunks:
        meta = c["metadata"]
        doc_name = meta.get("document_name", "Document")
        page_num = meta.get("page_number", 1)
        context_blocks.append(f"[{doc_name} - Page {page_num}]:\n{c['text']}")
        citations.append(
            CitationItem(
                document_id=str(meta.get("document_id", "")),
                document_name=doc_name,
                page_number=int(page_num),
                passage=c["text"][:280]
            )
        )

    context_text = "\n\n---\n\n".join(context_blocks)

    prompt = f"""You are StudySphere AI, an intelligent academic tutor.
Below are retrieved excerpts from the student's uploaded study material / question paper:

{context_text}

Student Request: {question}

Instructions:
1. First, check if the requested question, MCQ, passage, or topic appears in the retrieved excerpts above.
2. If it is an objective / MCQ / practice question from the PDF without a printed answer key, READ the question and options from the PDF excerpt, SOLVE IT using your subject knowledge, state the exact Correct Option clearly, and give a thorough step-by-step explanation.
3. If the student's question is completely unrelated to the retrieved excerpts, answer it fully and accurately using your general academic knowledge like an expert AI tutor (do NOT refuse to answer).
4. Always cite the document name and page number if the question/topic came from the PDF.
5. Formatting style: {style}
"""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return {
        "answer": response.text.strip(),
        "citations": citations if context_blocks else []
    }


def _generate_general_ai_answer(question: str, mode: str) -> str:
    style = _get_style_instruction(mode)
    prompt = f"""You are StudySphere AI, an expert academic AI tutor.
Provide a clear, complete, and well-structured answer to the student's question using your general academic knowledge.
Formatting instruction: {style}

Student Question: {question}
"""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()


@router.post("/chat", response_model=RagChatResponse)
async def rag_chat(payload: RagChatRequest):
    try:
        hits = vector_store.query_user_chunks(
            user_id=payload.user_id,
            question=payload.question,
            subject_id=payload.subject_id,
            document_ids=payload.document_ids,
            top_k=6
        )

        if not hits and (payload.document_ids or payload.subject_id):
            hits = vector_store.query_user_chunks(
                user_id=payload.user_id,
                question=payload.question,
                subject_id=None,
                document_ids=None,
                top_k=6
            )

        relevant_hits = [h for h in hits if h.get("distance", 1.0) < 0.75]

        # MODE 1: Smart Hybrid AI ON -> PDF se question/context uthayega + MCQ solve karega + bahar ke topics bhi ChatGPT jaisa explain karega
        if payload.allow_general_ai:
            if relevant_hits:
                hybrid_res = _generate_hybrid_answer(
                    question=payload.question,
                    chunks=relevant_hits,
                    mode=payload.mode
                )
                return RagChatResponse(
                    answer=hybrid_res["answer"],
                    citations=hybrid_res["citations"],
                    source_type="pdf_rag"
                )
            else:
                general_answer = _generate_general_ai_answer(payload.question, payload.mode)
                return RagChatResponse(
                    answer=general_answer,
                    citations=[],
                    source_type="general_ai"
                )

        # MODE 2: Strict PDF Only -> Sirf PDF ke andar likhe content se jawab dega
        if relevant_hits:
            result = generate_grounded_answer(
                question=payload.question,
                retrieved_chunks=relevant_hits,
                mode=payload.mode
            )
            return RagChatResponse(
                answer=result["answer"],
                citations=result["citations"],
                source_type="pdf_rag"
            )

        return RagChatResponse(
            answer="⚠️ Strict PDF Mode: This topic was not found in your uploaded PDF notes. Enable the '✨ Smart Hybrid AI' toggle at the top to solve questions or get answers from General AI knowledge.",
            citations=[],
            source_type="not_found"
        )

    except Exception as exc:
        return RagChatResponse(
            answer=f"⚠️ AI Service Debug Error: {str(exc)}",
            citations=[],
            source_type="error"
        )