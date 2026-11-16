# import google.generativeai as genai
# from typing import List, Dict
# from app.core.config import settings
# from app.schemas.models import CitationItem

# if settings.GEMINI_API_KEY:
#     genai.configure(api_key=settings.GEMINI_API_KEY)

# MODE_INSTRUCTIONS = {
#     "english": "Explain clearly in simple, well-structured academic English.",
#     "hinglish": "Explain in friendly, easy-to-understand Hinglish (natural mix of Hindi and English technical terms) suitable for Indian university students.",
#     "exam": "Write an exam-oriented answer with clear headings, bullet points, definitions, and key takeaways suitable for university semester exams."
# }

# def generate_grounded_answer(
#     question: str,
#     retrieved_chunks: List[Dict],
#     mode: str = "english"
# ) -> Dict:
#     if not retrieved_chunks:
#         return {
#             "answer": "I could not find sufficient evidence in your uploaded study materials to answer this question accurately. Please upload the relevant unit notes or select the right document.",
#             "citations": []
#         }

#     context_blocks = []
#     citations = []
#     seen_refs = set()

#     for idx, item in enumerate(retrieved_chunks, start=1):
#         meta = item["metadata"]
#         doc_name = meta.get("document_name", "Unknown")
#         page_num = int(meta.get("page_number", 1))
#         doc_id = meta.get("document_id", "")

#         context_blocks.append(f"[Source {idx}: {doc_name}, Page {page_num}]\n{item['text']}")

#         ref_key = f"{doc_id}_{page_num}"
#         if ref_key not in seen_refs:
#             seen_refs.add(ref_key)
#             citations.append(
#                 CitationItem(
#                     document_id=doc_id,
#                     document_name=doc_name,
#                     page_number=page_num,
#                     passage=item["text"][:260] + ("..." if len(item["text"]) > 260 else "")
#                 )
#             )

#     style_guide = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["english"])
#     prompt = f"""You are StudySphere AI, a strict academic study assistant.
# Answer the student's question ONLY using the retrieved study material below.
# Rules:
# 1. Do NOT invent facts outside the provided context.
# 2. {style_guide}
# 3. Reference source names and page numbers naturally where helpful.

# RETRIEVED STUDY CONTEXT:
# {chr(10).join(context_blocks)}

# STUDENT QUESTION:
# {question}
# """

#     if not settings.GEMINI_API_KEY:
#         fallback = (
#             "GEMINI_API_KEY is not set in ai-service/.env yet. "
#             "Vector retrieval succeeded from: "
#             + ", ".join(f"{c.document_name} (p.{c.page_number})" for c in citations)
#         )
#         return {"answer": fallback, "citations": citations}

#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     response = model.generate_content(prompt)
#     return {
#         "answer": response.text.strip(),
#         "citations": citations
#     }

# import os
# import google.generativeai as genai
# from typing import List, Dict
# from app.core.config import settings
# from app.schemas.models import CitationItem

# MODE_INSTRUCTIONS = {
#     "english": "Explain clearly in simple, well-structured academic English.",
#     "hinglish": "Explain in friendly, easy-to-understand Hinglish (natural mix of Hindi and English technical terms) suitable for Indian university students.",
#     "exam": "Write an exam-oriented answer with clear headings, bullet points, definitions, and key takeaways suitable for university semester exams."
# }

# def generate_grounded_answer(
#     question: str,
#     retrieved_chunks: List[Dict],
#     mode: str = "english"
# ) -> Dict:
#     if not retrieved_chunks:
#         return {
#             "answer": "I could not find sufficient evidence in your uploaded study materials to answer this question accurately. Please upload the relevant unit notes or select the right document.",
#             "citations": []
#         }

#     context_blocks = []
#     citations = []
#     seen_refs = set()

#     for idx, item in enumerate(retrieved_chunks, start=1):
#         meta = item["metadata"]
#         doc_name = meta.get("document_name", "Unknown")
#         page_num = int(meta.get("page_number", 1))
#         doc_id = meta.get("document_id", "")

#         context_blocks.append(f"[Source {idx}: {doc_name}, Page {page_num}]\n{item['text']}")

#         ref_key = f"{doc_id}_{page_num}"
#         if ref_key not in seen_refs:
#             seen_refs.add(ref_key)
#             citations.append(
#                 CitationItem(
#                     document_id=doc_id,
#                     document_name=doc_name,
#                     page_number=page_num,
#                     passage=item["text"][:260] + ("..." if len(item["text"]) > 260 else "")
#                 )
#             )

#     api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
#     if not api_key or api_key == "your_google_gemini_api_key_here":
#         return {
#             "answer": "Please add a valid GEMINI_API_KEY in ai-service/.env and restart the AI server. Vector search already matched your PDF pages!",
#             "citations": citations
#         }

#     genai.configure(api_key=api_key)
#     style_guide = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["english"])
#     prompt = f"""You are StudySphere AI, a strict academic study assistant.
# Answer the student's question ONLY using the retrieved study material below.
# Rules:
# 1. Do NOT invent facts outside the provided context.
# 2. {style_guide}
# 3. Reference source names and page numbers naturally where helpful.

# RETRIEVED STUDY CONTEXT:
# {chr(10).join(context_blocks)}

# STUDENT QUESTION:
# {question}
# """

#     model = genai.GenerativeModel(settings.GEMINI_MODEL)
#     response = model.generate_content(prompt)
#     return {
#         "answer": response.text.strip(),
#         "citations": citations
#     }




# import os
# import google.generativeai as genai
# from typing import List, Dict
# from app.core.config import settings
# from app.schemas.models import CitationItem

# MODE_INSTRUCTIONS = {
#     "english": "Explain clearly in simple, well-structured academic English.",
#     "hinglish": "Explain in friendly, easy-to-understand Hinglish (natural mix of Hindi and English technical terms) suitable for Indian university students.",
#     "exam": "Write an exam-oriented answer with clear headings, bullet points, definitions, and key takeaways suitable for university semester exams."
# }

# def generate_grounded_answer(
#     question: str,
#     retrieved_chunks: List[Dict],
#     mode: str = "english"
# ) -> Dict:
#     if not retrieved_chunks:
#         return {
#             "answer": "I could not find sufficient evidence in your uploaded study materials to answer this question accurately. Please upload the relevant unit notes or select the right document.",
#             "citations": []
#         }

#     context_blocks = []
#     citations = []
#     seen_refs = set()

#     for idx, item in enumerate(retrieved_chunks, start=1):
#         meta = item["metadata"]
#         doc_name = meta.get("document_name", "Unknown")
#         page_num = int(meta.get("page_number", 1))
#         doc_id = meta.get("document_id", "")

#         context_blocks.append(f"[Source {idx}: {doc_name}, Page {page_num}]\n{item['text']}")

#         ref_key = f"{doc_id}_{page_num}"
#         if ref_key not in seen_refs:
#             seen_refs.add(ref_key)
#             citations.append(
#                 CitationItem(
#                     document_id=doc_id,
#                     document_name=doc_name,
#                     page_number=page_num,
#                     passage=item["text"][:260] + ("..." if len(item["text"]) > 260 else "")
#                 )
#             )

#     api_key = (settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip()
#     if not api_key or api_key == "your_google_gemini_api_key_here":
#         return {
#             "answer": "Please add a valid GEMINI_API_KEY in ai-service/.env and restart the AI server.",
#             "citations": citations
#         }

#     genai.configure(api_key=api_key)
#     style_guide = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["english"])
#     prompt = f"""You are StudySphere AI, a strict academic study assistant.
# Answer the student's question ONLY using the retrieved study material below.
# Rules:
# 1. Do NOT invent facts outside the provided context.
# 2. {style_guide}
# 3. Reference source names and page numbers naturally where helpful.

# RETRIEVED STUDY CONTEXT:
# {chr(10).join(context_blocks)}

# STUDENT QUESTION:
# {question}
# """

#     models_to_try = [settings.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
#     seen_models = []
#     last_err = None

#     for m_name in models_to_try:
#         if not m_name or m_name in seen_models:
#             continue
#         seen_models.append(m_name)
#         try:
#             model = genai.GenerativeModel(m_name)
#             response = model.generate_content(prompt)
#             return {
#                 "answer": response.text.strip(),
#                 "citations": citations
#             }
#         except Exception as e:
#             last_err = str(e)
#             continue

#     raise RuntimeError(f"Gemini API error: {last_err}")

# import os
# import google.generativeai as genai
# from typing import List, Dict
# from app.core.config import settings
# from app.schemas.models import CitationItem

# MODE_INSTRUCTIONS = {
#     "english": (
#         "Write the entire explanation in clear, simple, well-structured academic English."
#     ),
#     "hinglish": (
#         "CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in conversational Hinglish "
#         "(Hindi written in the Roman/English alphabet, keeping technical CS terms like Deadlock, Process, Resource, Thread in English). "
#         "Do NOT write pure English paragraphs. Translate and explain the English study context into natural spoken Hinglish. "
#         "Example tone: 'Deadlock ek aisi state hoti hai jismein do ya usse zyada processes ek-dusre ke resources ka wait karte rehte hain aur koi bhi aage execute nahi ho paata (operating system.pdf, Page 44).'"
#     ),
#     "exam": (
#         "Write a high-scoring university semester exam answer with clear headings, bullet points, formal definition, key conditions/steps, and source page references."
#     )
# }

# def generate_grounded_answer(
#     question: str,
#     retrieved_chunks: List[Dict],
#     mode: str = "english"
# ) -> Dict:
#     clean_mode = (mode or "english").strip().lower()
#     if "hinglish" in clean_mode:
#         clean_mode = "hinglish"
#     elif "exam" in clean_mode:
#         clean_mode = "exam"
#     else:
#         clean_mode = "english"

#     if not retrieved_chunks:
#         not_found_msg = (
#             "Aapke uploaded study materials mein is question ka sufficient evidence nahi mila. Please sahi unit ke notes upload karein ya right document select karein."
#             if clean_mode == "hinglish"
#             else "I could not find sufficient evidence in your uploaded study materials to answer this question accurately. Please upload the relevant unit notes or select the right document."
#         )
#         return {
#             "answer": not_found_msg,
#             "citations": []
#         }

#     context_blocks = []
#     citations = []
#     seen_refs = set()

#     for idx, item in enumerate(retrieved_chunks, start=1):
#         meta = item["metadata"]
#         doc_name = meta.get("document_name", "Unknown")
#         page_num = int(meta.get("page_number", 1))
#         doc_id = meta.get("document_id", "")

#         context_blocks.append(f"[Source {idx}: {doc_name}, Page {page_num}]\n{item['text']}")

#         ref_key = f"{doc_id}_{page_num}"
#         if ref_key not in seen_refs:
#             seen_refs.add(ref_key)
#             citations.append(
#                 CitationItem(
#                     document_id=doc_id,
#                     document_name=doc_name,
#                     page_number=page_num,
#                     passage=item["text"][:260] + ("..." if len(item["text"]) > 260 else "")
#                 )
#             )

#     api_key = (settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip()
#     if not api_key or api_key == "your_google_gemini_api_key_here":
#         return {
#             "answer": "Please add a valid GEMINI_API_KEY in ai-service/.env and restart the AI server.",
#             "citations": citations
#         }

#     genai.configure(api_key=api_key)
#     style_guide = MODE_INSTRUCTIONS[clean_mode]

#     prompt = f"""You are StudySphere AI, an academic study assistant for university students.
# Answer the student's question STRICTLY using ONLY the retrieved study material below.

# RULES:
# 1. Do NOT invent or assume any facts outside the provided context.
# 2. {style_guide}
# 3. Cite document names and page numbers naturally in brackets like (document.pdf, Page X).
# 4. Use clean bullet points for better readability.

# RETRIEVED STUDY CONTEXT:
# {chr(10).join(context_blocks)}

# STUDENT QUESTION:
# {question}
# """

#     models_to_try = [settings.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
#     seen_models = []
#     last_err = None

#     for m_name in models_to_try:
#         if not m_name or m_name in seen_models:
#             continue
#         seen_models.append(m_name)
#         try:
#             model = genai.GenerativeModel(m_name)
#             response = model.generate_content(prompt)
#             return {
#                 "answer": response.text.strip(),
#                 "citations": citations
#             }
#         except Exception as e:
#             last_err = str(e)
#             continue

#     raise RuntimeError(f"Gemini API error: {last_err}")


# 

import os
import time
import google.generativeai as genai
from typing import List, Dict
from app.core.config import settings
from app.schemas.models import CitationItem

MODE_INSTRUCTIONS = {
    "english": (
        "Write the entire explanation in clear, simple, well-structured academic English."
    ),
    "hinglish": (
        "CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in conversational Hinglish "
        "(Hindi written in the Roman/English alphabet, keeping technical CS terms like Deadlock, Virtual Memory, Process, Resource, Thread in English). "
        "Do NOT write pure English paragraphs. Translate and explain the English study context into natural spoken Hinglish. "
        "Example tone: 'Virtual memory ek aisi technique hai jo un processes ko bhi execute karne deti hai jo poori tarah physical memory mein load nahi hue hain (operating system.pdf, Page 63).'"
    ),
    "exam": (
        "Write a high-scoring university semester exam answer with clear headings, bullet points, formal definition, key conditions/steps, and source page references."
    )
}


def generate_grounded_answer(
    question: str,
    retrieved_chunks: List[Dict],
    mode: str = "english"
) -> Dict:
    clean_mode = (mode or "english").strip().lower()
    if "hinglish" in clean_mode:
        clean_mode = "hinglish"
    elif "exam" in clean_mode:
        clean_mode = "exam"
    else:
        clean_mode = "english"

    if not retrieved_chunks:
        not_found_msg = (
            "Aapke uploaded study materials mein is question ka sufficient evidence nahi mila. Please sahi unit ke notes upload karein ya right document select karein."
            if clean_mode == "hinglish"
            else "I could not find sufficient evidence in your uploaded study materials to answer this question accurately. Please upload the relevant unit notes or select the right document."
        )
        return {
            "answer": not_found_msg,
            "citations": []
        }

    context_blocks = []
    citations = []
    seen_refs = set()

    for idx, item in enumerate(retrieved_chunks, start=1):
        meta = item["metadata"]
        doc_name = meta.get("document_name", "Unknown")
        page_num = int(meta.get("page_number", 1))
        doc_id = meta.get("document_id", "")

        context_blocks.append(f"[Source {idx}: {doc_name}, Page {page_num}]\n{item['text']}")

        ref_key = f"{doc_id}_{page_num}"
        if ref_key not in seen_refs:
            seen_refs.add(ref_key)
            citations.append(
                CitationItem(
                    document_id=doc_id,
                    document_name=doc_name,
                    page_number=page_num,
                    passage=item["text"][:260] + ("..." if len(item["text"]) > 260 else "")
                )
            )

    api_key = (settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip()
    if not api_key or api_key == "your_google_gemini_api_key_here":
        return {
            "answer": "Please add a valid GEMINI_API_KEY in ai-service/.env and restart the AI server.",
            "citations": citations
        }

    genai.configure(api_key=api_key)
    style_guide = MODE_INSTRUCTIONS[clean_mode]

    prompt = f"""You are StudySphere AI, an academic study assistant for university students.
Answer the student's question STRICTLY using ONLY the retrieved study material below.

RULES:
1. Do NOT invent or assume any facts outside the provided context.
2. {style_guide}
3. CITATION FORMATTING (STRICT):
- NEVER put citations after every single sentence inside a paragraph.
- Write the complete definition or full paragraph smoothly first, and place ONE single citation at the very end of the paragraph or bullet point like (document.pdf, Page X).
4. Use clean headings and bullet points for better readability.
5. Do NOT write a "Source Citations:" section at the end of your response (the UI renders citation cards separately).

RETRIEVED STUDY CONTEXT:
{chr(10).join(context_blocks)}

STUDENT QUESTION:
{question}
"""

    # models_to_try = [
    #     settings.GEMINI_MODEL,
    #     "gemini-2.5-flash",
    #     "gemini-2.5-flash-lite",
    #     "gemini-2.0-flash",
    #     "gemini-2.0-flash-lite",
    # ]
    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-3-flash-preview",
        settings.GEMINI_MODEL,
        "gemini-2.5-flash",
    ]
    seen_models = []
    errors = []

    for m_name in models_to_try:
        if not m_name or m_name in seen_models:
            continue
        seen_models.append(m_name)
        for attempt in range(2):
            try:
                model = genai.GenerativeModel(m_name)
                response = model.generate_content(prompt)
                return {
                    "answer": response.text.strip(),
                    "citations": citations
                }
            except Exception as e:
                err_msg = str(e)
                errors.append(f"{m_name}: {err_msg}")
                if "429" in err_msg or "quota" in err_msg.lower() or "exhausted" in err_msg.lower():
                    time.sleep(2)
                    continue
                break

    raise RuntimeError(f"Gemini API error -> {' | '.join(errors)}")