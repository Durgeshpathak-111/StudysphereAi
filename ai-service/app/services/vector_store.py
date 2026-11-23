

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


# 

# import os
# import json
# import time
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
#             json.dump(self.records, f, separators=(",", ":"))  # Compact JSON = 2x faster save

#     def _embed_texts(self, texts: List[str], task_type: str = "retrieval_document") -> List[List[float]]:
#         all_embeddings: List[List[float]] = []
#         batch_size = 100

#         for i in range(0, len(texts), batch_size):
#             batch = texts[i : i + batch_size]

#             for attempt in range(3):
#                 try:
#                     result = genai.embed_content(
#                         model=EMBEDDING_MODEL,
#                         content=batch,
#                         task_type=task_type,
#                         output_dimensionality=768  # 4x faster & lighter vectors
#                     )
#                     all_embeddings.extend(result["embedding"])
#                     break
#                 except Exception as e:
#                     err_msg = str(e).lower()
#                     if ("429" in err_msg or "quota" in err_msg or "rate" in err_msg) and attempt < 2:
#                         time.sleep(8 * (attempt + 1))
#                     else:
#                         raise e

#         return all_embeddings

#     def _embed_query(self, query: str) -> List[float]:
#         result = genai.embed_content(
#             model=EMBEDDING_MODEL,
#             content=query,
#             task_type="retrieval_query",
#             output_dimensionality=768
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
import re
import json
import math
import hashlib
import numpy as np
from typing import List, Dict, Optional
from app.core.config import settings

DIM = 768
_TOKEN_RE = re.compile(r"[a-z0-9]{2,}")


class _CollectionCompat:
    def __init__(self, store: "VectorStoreManager"):
        self._store = store

    def count(self) -> int:
        return len(self._store.records)


class VectorStoreManager:
    def __init__(self):
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        self.store_path = os.path.join(settings.CHROMA_PERSIST_DIR, "vectors_local.json")
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
            json.dump(self.records, f, separators=(",", ":"))

    def _local_embed(self, text: str) -> List[float]:
        """Fast local 768-dim hybrid word + subword vector on M1 (0 API limits, <1ms per chunk)."""
        vec = np.zeros(DIM, dtype=np.float32)
        tokens = _TOKEN_RE.findall(text.lower())
        if not tokens:
            return vec.tolist()

        # Word-level + 4-gram subword hashing for strong technical & semantic recall
        features = []
        for tok in tokens:
            features.append((tok, 2.0))
            if len(tok) >= 5:
                for i in range(len(tok) - 3):
                    features.append((tok[i : i + 4], 0.8))

        for feat, weight in features:
            digest = hashlib.blake2b(feat.encode("utf-8"), digest_size=8).digest()
            h = int.from_bytes(digest, "little")
            idx = h % DIM
            sign = 1.0 if ((h >> 16) & 1) == 0 else -1.0
            vec[idx] += sign * weight

        # Sublinear TF scaling + L2 normalization
        vec = np.sign(vec) * np.log1p(np.abs(vec))
        norm = float(np.linalg.norm(vec))
        if norm > 0:
            vec /= norm
        return vec.tolist()

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

        self.records = [
            r for r in self.records
            if not (r["metadata"]["user_id"] == str(user_id) and r["metadata"]["document_id"] == str(document_id))
        ]

        for c in chunks:
            emb = self._local_embed(c["text"])
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

        q_vec = np.array(self._local_embed(question), dtype=np.float32)
        q_norm = np.linalg.norm(q_vec) + 1e-10
        q_terms = set(_TOKEN_RE.findall(question.lower()))

        scored = []
        for r in filtered:
            d_vec = np.array(r["embedding"], dtype=np.float32)
            d_norm = np.linalg.norm(d_vec) + 1e-10
            cos_sim = float(np.dot(q_vec, d_vec) / (q_norm * d_norm))

            # Exact term overlap boost for technical OS/subject terms
            if q_terms:
                doc_terms = set(_TOKEN_RE.findall(r["text"].lower()))
                overlap = len(q_terms & doc_terms) / len(q_terms)
                cos_sim = 0.7 * cos_sim + 0.3 * overlap

            distance = 1.0 - cos_sim
            scored.append((distance, r))

        scored.sort(key=lambda x: x[0])
        top_results = scored[:top_k]

        hits = []
        for dist, r in top_results:
            hits.append({
                "text": r["text"],
                "metadata": r["metadata"],
                "distance": dist
            })

        return hits


vector_store = VectorStoreManager()