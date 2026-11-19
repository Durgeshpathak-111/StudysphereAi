

# import os
# import json
# import numpy as np
# import google.generativeai as genai
# from typing import List, Dict, Optional
# from app.core.config import settings

# genai.configure(api_key=settings.GEMINI_API_KEY)

# EMBEDDING_MODEL = "models/gemini-embedding-001"


# class _CollectionCompat:
#     def __init__(self, store: "VectorStoreManager"):
#         self._store = store

#     def count(self) -> int:
#         return len(self._store.records)


# class VectorStoreManager:
#     def __init__(self):
#         os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
#         self.store_path = os.path.join(settings.CHROMA_PERSIST_DIR, "vectors_gemini.json")
#         self.records: List[Dict] = self._load()
#         self.collection = _CollectionCompat(self)

#     def _load(self) -> List[Dict]:
#         if os.path.exists(self.store_path):
#             try:
#                 with open(self.store_path, "r", encoding="utf-8") as f:
#                     return json.load(f)
#             except Exception:
#                 return []
#         return []

#     def _save(self):
#         with open(self.store_path, "w", encoding="utf-8") as f:
#             json.dump(self.records, f)

#     def _embed_texts(self, texts: List[str], task_type: str = "retrieval_document") -> List[List[float]]:
#         result = genai.embed_content(
#             model=EMBEDDING_MODEL,
#             content=texts,
#             task_type=task_type
#         )
#         return result["embedding"]

#     def _embed_query(self, query: str) -> List[float]:
#         result = genai.embed_content(
#             model=EMBEDDING_MODEL,
#             content=query,
#             task_type="retrieval_query"
#         )
#         return result["embedding"]

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
#         embeddings = self._embed_texts(texts, task_type="retrieval_document")

#         # Purane same document ke chunks replace karein (upsert behavior)
#         self.records = [
#             r for r in self.records
#             if not (r["metadata"]["user_id"] == str(user_id) and r["metadata"]["document_id"] == str(document_id))
#         ]

#         for c, emb in zip(chunks, embeddings):
#             self.records.append({
#                 "id": f"{user_id}_{document_id}_{c['chunk_index']}",
#                 "embedding": emb,
#                 "text": c["text"],
#                 "metadata": {
#                     "user_id": str(user_id),
#                     "document_id": str(document_id),
#                     "subject_id": str(subject_id),
#                     "document_name": document_name,
#                     "page_number": int(c["page_number"]),
#                     "chunk_index": int(c["chunk_index"])
#                 }
#             })

#         self._save()
#         return len(chunks)

#     def delete_document_vectors(self, user_id: str, document_id: str):
#         self.records = [
#             r for r in self.records
#             if not (r["metadata"]["user_id"] == str(user_id) and r["metadata"]["document_id"] == str(document_id))
#         ]
#         self._save()

#     def query_user_chunks(
#         self,
#         user_id: str,
#         question: str,
#         subject_id: Optional[str] = None,
#         document_ids: Optional[List[str]] = None,
#         top_k: int = 5
#     ) -> List[Dict]:
#         doc_id_set = set(str(d) for d in document_ids) if document_ids else None

#         filtered = []
#         for r in self.records:
#             meta = r["metadata"]
#             if meta["user_id"] != str(user_id):
#                 continue
#             if doc_id_set and meta["document_id"] not in doc_id_set:
#                 continue
#             elif not doc_id_set and subject_id and meta["subject_id"] != str(subject_id):
#                 continue
#             filtered.append(r)

#         if not filtered:
#             return []

#         q_vec = np.array(self._embed_query(question), dtype=np.float32)
#         q_norm = np.linalg.norm(q_vec) + 1e-10

#         scored = []
#         for r in filtered:
#             d_vec = np.array(r["embedding"], dtype=np.float32)
#             d_norm = np.linalg.norm(d_vec) + 1e-10
#             cos_sim = float(np.dot(q_vec, d_vec) / (q_norm * d_norm))
#             distance = 1.0 - cos_sim
#             scored.append((distance, r))

#         scored.sort(key=lambda x: x[0])
#         top_results = scored[:top_k]

#         hits = []
#         for dist, r in top_results:
#             if dist <= 0.88:
#                 hits.append({
#                     "text": r["text"],
#                     "metadata": r["metadata"],
#                     "distance": dist
#                 })

#         if not hits and top_results:
#             for dist, r in top_results[:3]:
#                 hits.append({
#                     "text": r["text"],
#                     "metadata": r["metadata"],
#                     "distance": dist
#                 })

#         return hits


# vector_store = VectorStoreManager()


import os
import json
import numpy as np
import google.generativeai as genai
from typing import List, Dict, Optional
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

EMBEDDING_MODEL = "models/gemini-embedding-001"


class _CollectionCompat:
    def __init__(self, store: "VectorStoreManager"):
        self._store = store

    def count(self) -> int:
        return len(self._store.records)


class VectorStoreManager:
    def __init__(self):
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        self.store_path = os.path.join(settings.CHROMA_PERSIST_DIR, "vectors_gemini.json")
        self.records: List[Dict] = self._load()
        self.collection = _CollectionCompat(self)

    def _load(self) -> List[Dict]:
        if os.path.exists(self.store_path):
            try:
                with open(self.store_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save(self):
        with open(self.store_path, "w", encoding="utf-8") as f:
            json.dump(self.records, f)

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

        # Purane same document ke chunks replace karein (upsert behavior)
        self.records = [
            r for r in self.records
            if not (r["metadata"]["user_id"] == str(user_id) and r["metadata"]["document_id"] == str(document_id))
        ]

        for c, emb in zip(chunks, embeddings):
            self.records.append({
                "id": f"{user_id}_{document_id}_{c['chunk_index']}",
                "embedding": emb,
                "text": c["text"],
                "metadata": {
                    "user_id": str(user_id),
                    "document_id": str(document_id),
                    "subject_id": str(subject_id),
                    "document_name": document_name,
                    "page_number": int(c["page_number"]),
                    "chunk_index": int(c["chunk_index"])
                }
            })

        self._save()
        return len(chunks)

    def delete_document_vectors(self, user_id: str, document_id: str):
        self.records = [
            r for r in self.records
            if not (r["metadata"]["user_id"] == str(user_id) and r["metadata"]["document_id"] == str(document_id))
        ]
        self._save()

    def query_user_chunks(
        self,
        user_id: str,
        question: str,
        subject_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Dict]:
        doc_id_set = set(str(d) for d in document_ids) if document_ids else None

        filtered = []
        for r in self.records:
            meta = r["metadata"]
            if meta["user_id"] != str(user_id):
                continue
            if doc_id_set and meta["document_id"] not in doc_id_set:
                continue
            elif not doc_id_set and subject_id and meta["subject_id"] != str(subject_id):
                continue
            filtered.append(r)

        if not filtered:
            return []

        q_vec = np.array(self._embed_query(question), dtype=np.float32)
        q_norm = np.linalg.norm(q_vec) + 1e-10

        scored = []
        for r in filtered:
            d_vec = np.array(r["embedding"], dtype=np.float32)
            d_norm = np.linalg.norm(d_vec) + 1e-10
            cos_sim = float(np.dot(q_vec, d_vec) / (q_norm * d_norm))
            distance = 1.0 - cos_sim
            scored.append((distance, r))

        scored.sort(key=lambda x: x[0])
        top_results = scored[:top_k]

        hits = []
        for dist, r in top_results:
            if dist <= 0.88:
                hits.append({
                    "text": r["text"],
                    "metadata": r["metadata"],
                    "distance": dist
                })

        if not hits and top_results:
            for dist, r in top_results[:3]:
                hits.append({
                    "text": r["text"],
                    "metadata": r["metadata"],
                    "distance": dist
                })

        return hits


vector_store = VectorStoreManager()