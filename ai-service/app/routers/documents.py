from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.models import ProcessResponse, TextAnalyzeRequest
from app.services.extractor import extract_pages_from_bytes, chunk_pages, extract_keywords_and_topics
from app.services.vector_store import vector_store

router = APIRouter(prefix="/ai", tags=["Document Processing"])

@router.post("/process-document", response_model=ProcessResponse)
async def process_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    document_id: str = Form(...),
    subject_id: str = Form(...),
    document_name: str = Form(...)
):
    try:
        file_bytes = await file.read()
        pages = extract_pages_from_bytes(file_bytes, document_name)
        chunks = chunk_pages(pages)
        full_text = " ".join(p["text"] for p in pages)
        nlp_meta = extract_keywords_and_topics(full_text)

        vector_store.delete_document_vectors(user_id=user_id, document_id=document_id)
        stored_count = vector_store.add_document_chunks(
            user_id=user_id,
            document_id=document_id,
            subject_id=subject_id,
            document_name=document_name,
            chunks=chunks
        )

        return ProcessResponse(
            document_id=document_id,
            status="Completed",
            page_count=len(pages),
            chunk_count=stored_count,
            topics=nlp_meta["topics"],
            keywords=nlp_meta["keywords"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Document processing error: {str(exc)}")

@router.post("/extract-topics")
async def extract_topics_endpoint(payload: TextAnalyzeRequest):
    return extract_keywords_and_topics(payload.text)

@router.delete("/documents/{document_id}")
async def delete_document_vectors(document_id: str, user_id: str):
    vector_store.delete_document_vectors(user_id=user_id, document_id=document_id)
    return {"success": True, "document_id": document_id}