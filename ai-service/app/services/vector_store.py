# import chromadb
# from sentence_transformers import SentenceTransformer
# from typing import List, Dict, Optional
# from app.core.config import settings

# class VectorStoreManager:
#     def __init__(self):
#         self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
#         self.collection = self.client.get_or_create_collection(
#             name="studysphere_chunks",
#             metadata={"hnsw:space": "cosine"}
#         )
#         self.embedder = SentenceTransformer(settings.EMBEDDING_MODEL)

#     def add_document_chunks(
#         self,
#         user_id: str,
#         document_id: str,
#         subject_id: str,
#         document_name: str,
#         chunks: List[Dict]
#     ) -> int:
#         if not chunks:
#             return 0

#         texts = [c["text"] for c in chunks]
#         embeddings = self.embedder.encode(texts, normalize_embeddings=True).tolist()

#         ids = [f"{user_id}_{document_id}_{c['chunk_index']}" for c in chunks]
#         metadatas = [
#             {
#                 "user_id": str(user_id),
#                 "document_id": str(document_id),
#                 "subject_id": str(subject_id),
#                 "document_name": document_name,
#                 "page_number": int(c["page_number"]),
#                 "chunk_index": int(c["chunk_index"])
#             }
#             for c in chunks
#         ]

#         self.collection.upsert(
#             ids=ids,
#             embeddings=embeddings,
#             documents=texts,
#             metadatas=metadatas
#         )
#         return len(chunks)

#     def delete_document_vectors(self, user_id: str, document_id: str):
#         self.collection.delete(
#             where={
#                 "$and": [
#                     {"user_id": {"$eq": str(user_id)}},
#                     {"document_id": {"$eq": str(document_id)}}
#                 ]
#             }
#         )

#     def query_user_chunks(
#         self,
#         user_id: str,
#         question: str,
#         subject_id: Optional[str] = None,
#         document_ids: Optional[List[str]] = None,
#         top_k: int = 5
#     ) -> List[Dict]:
#         query_embedding = self.embedder.encode([question], normalize_embeddings=True).tolist()[0]

#         conditions = [{"user_id": {"$eq": str(user_id)}}]
#         if document_ids:
#             conditions.append({"document_id": {"$in": [str(d) for d in document_ids]}})
#         elif subject_id:
#             conditions.append({"subject_id": {"$eq": str(subject_id)}})

#         where_filter = conditions[0] if len(conditions) == 1 else {"$and": conditions}

#         results = self.collection.query(
#             query_embeddings=[query_embedding],
#             n_results=top_k,
#             where=where_filter,
#             include=["documents", "metadatas", "distances"]
#         )

#         hits = []
#         docs = results.get("documents", [[]])[0]
#         metas = results.get("metadatas", [[]])[0]
#         dists = results.get("distances", [[]])[0]

#         for doc_text, meta, dist in zip(docs, metas, dists):
#             if dist <= 0.72:
#                 hits.append({
#                     "text": doc_text,
#                     "metadata": meta,
#                     "distance": dist
#                 })
#         return hits


# vector_store = VectorStoreManager()



# import chromadb
# from sentence_transformers import SentenceTransformer
# from typing import List, Dict, Optional
# from app.core.config import settings

# class VectorStoreManager:
#     def __init__(self):
#         self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
#         self.collection = self.client.get_or_create_collection(
#             name="studysphere_chunks",
#             metadata={"hnsw:space": "cosine"}
#         )
#         self.embedder = SentenceTransformer(settings.EMBEDDING_MODEL)

#     def add_document_chunks(
#         self,
#         user_id: str,
#         document_id: str,
#         subject_id: str,
#         document_name: str,
#         chunks: List[Dict]
#     ) -> int:
#         if not chunks:
#             return 0

#         texts = [c["text"] for c in chunks]
#         embeddings = self.embedder.encode(texts, normalize_embeddings=True).tolist()

#         ids = [f"{user_id}_{document_id}_{c['chunk_index']}" for c in chunks]
#         metadatas = [
#             {
#                 "user_id": str(user_id),
#                 "document_id": str(document_id),
#                 "subject_id": str(subject_id),
#                 "document_name": document_name,
#                 "page_number": int(c["page_number"]),
#                 "chunk_index": int(c["chunk_index"])
#             }
#             for c in chunks
#         ]

#         self.collection.upsert(
#             ids=ids,
#             embeddings=embeddings,
#             documents=texts,
#             metadatas=metadatas
#         )
#         return len(chunks)

#     def delete_document_vectors(self, user_id: str, document_id: str):
#         self.collection.delete(
#             where={
#                 "$and": [
#                     {"user_id": {"$eq": str(user_id)}},
#                     {"document_id": {"$eq": str(document_id)}}
#                 ]
#             }
#         )

#     def query_user_chunks(
#         self,
#         user_id: str,
#         question: str,
#         subject_id: Optional[str] = None,
#         document_ids: Optional[List[str]] = None,
#         top_k: int = 5
#     ) -> List[Dict]:
#         query_embedding = self.embedder.encode([question], normalize_embeddings=True).tolist()[0]

#         conditions = [{"user_id": {"$eq": str(user_id)}}]
#         if document_ids:
#             conditions.append({"document_id": {"$in": [str(d) for d in document_ids]}})
#         elif subject_id:
#             conditions.append({"subject_id": {"$eq": str(subject_id)}})

#         where_filter = conditions[0] if len(conditions) == 1 else {"$and": conditions}

#         results = self.collection.query(
#             query_embeddings=[query_embedding],
#             n_results=top_k,
#             where=where_filter,
#             include=["documents", "metadatas", "distances"]
#         )

#         hits = []
#         docs = results.get("documents", [[]])[0]
#         metas = results.get("metadatas", [[]])[0]
#         dists = results.get("distances", [[]])[0]

#         for doc_text, meta, dist in zip(docs, metas, dists):
#             if dist <= 0.88:
#                 hits.append({
#                     "text": doc_text,
#                     "metadata": meta,
#                     "distance": dist
#                 })

#         # Fallback: if chunks exist for this user/document, pass top 3 to Gemini so Gemini itself judges relevance
#         if not hits and docs:
#             for doc_text, meta, dist in list(zip(docs, metas, dists))[:3]:
#                 hits.append({
#                     "text": doc_text,
#                     "metadata": meta,
#                     "distance": dist
#                 })

#         return hits

# vector_store = VectorStoreManager()

import chromadb
from chromadb.utils import embedding_functions
import google.generativeai as genai
from typing import List, Dict, Optional
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

EMBEDDING_MODEL = "models/gemini-embedding-001"
COLLECTION_NAME = "studysphere_chunks_gemini"


class VectorStoreManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        # embedding_function=None rakhne se ChromaDB local ONNX model (400MB RAM) download/load nahi karta
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
            embedding_function=None
        )

    def _embed_texts(self, texts: List[str], task_type: str = "retrieval_document") -> List[List[float]]:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=texts,
            task_type=task_type
        )
        return result["embedding"]

    def _embed_query(self, query: str) -> List[float]:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query"
        )
        return result["embedding"]

    def add_document_chunks(
        self,
        user_id: str,
        document_id: str,
        subject_id: str,
        document_name: str,
        chunks: List[Dict]
    ) -> int:
        if not chunks:
            return 0

        texts = [c["text"] for c in chunks]
        embeddings = self._embed_texts(texts, task_type="retrieval_document")

        ids = [f"{user_id}_{document_id}_{c['chunk_index']}" for c in chunks]
        metadatas = [
            {
                "user_id": str(user_id),
                "document_id": str(document_id),
                "subject_id": str(subject_id),
                "document_name": document_name,
                "page_number": int(c["page_number"]),
                "chunk_index": int(c["chunk_index"])
            }
            for c in chunks
        ]

        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        return len(chunks)

    def delete_document_vectors(self, user_id: str, document_id: str):
        self.collection.delete(
            where={
                "$and": [
                    {"user_id": {"$eq": str(user_id)}},
                    {"document_id": {"$eq": str(document_id)}}
                ]
            }
        )

    def query_user_chunks(
        self,
        user_id: str,
        question: str,
        subject_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Dict]:
        query_embedding = self._embed_query(question)

        conditions = [{"user_id": {"$eq": str(user_id)}}]
        if document_ids:
            conditions.append({"document_id": {"$in": [str(d) for d in document_ids]}})
        elif subject_id:
            conditions.append({"subject_id": {"$eq": str(subject_id)}})

        where_filter = conditions[0] if len(conditions) == 1 else {"$and": conditions}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )

        hits = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        dists = results.get("distances", [[]])[0]

        for doc_text, meta, dist in zip(docs, metas, dists):
            if dist <= 0.88:
                hits.append({
                    "text": doc_text,
                    "metadata": meta,
                    "distance": dist
                })

        if not hits and docs:
            for doc_text, meta, dist in list(zip(docs, metas, dists))[:3]:
                hits.append({
                    "text": doc_text,
                    "metadata": meta,
                    "distance": dist
                })

        return hits


vector_store = VectorStoreManager()