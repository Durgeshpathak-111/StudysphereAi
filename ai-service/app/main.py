from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents, rag, generators

app = FastAPI(title="StudySphere AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "studysphere-python-ai"}

app.include_router(documents.router)
app.include_router(rag.router)
app.include_router(generators.router)