"""
RAG Pipeline — Builds FAISS vector store from knowledge_base.md
Uses Google Generative AI Embeddings (free) with LCEL chain.
"""

import os
import time
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

load_dotenv()

_retriever = None
_rag_chain = None

RAG_SYSTEM_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are the AutoStream AI assistant — friendly, knowledgeable, and concise.
Answer the user's question using ONLY the information in the context below.
Do not fabricate pricing, features, or policies.
If the answer isn't in the context, say: "I don't have specific information on that — our support team at support@autostream.io can help!"

Keep answers conversational and helpful. Use bullet points for lists. Be warm and enthusiastic.

Context:
{context}

Question: {question}

Answer:"""
)

def _format_docs(docs) -> str:
    return "\n\n".join(doc.page_content for doc in docs)

def build_rag_chain():
    global _retriever, _rag_chain
    if _rag_chain is not None:
        return _rag_chain

    kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.md")
    loader = TextLoader(kb_path, encoding="utf-8")
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=60,
        separators=["\n## ", "\n### ", "\n- ", "\n", " "]
    )
    chunks = splitter.split_documents(docs)

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    vector_store = FAISS.from_documents(chunks, embeddings)
    _retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-lite",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.2
    )

    # LCEL pipeline: retrieve → format → prompt → llm → parse
    _rag_chain = (
        {"context": _retriever | _format_docs, "question": RunnablePassthrough()}
        | RAG_SYSTEM_PROMPT
        | llm
        | StrOutputParser()
    )
    print("[RAG] Vector store built successfully.")
    return _rag_chain

def query_knowledge_base(question: str) -> str:
    chain = build_rag_chain()
    for attempt in range(3):
        try:
            return chain.invoke(question)
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                wait = 2 ** attempt
                print(f"[RAG] Rate limited, retrying in {wait}s (attempt {attempt + 1}/3)")
                time.sleep(wait)
            else:
                print(f"[RAG] Query failed: {e}")
                break
    return "I couldn't find that information right now. Please try again or contact support@autostream.io!"
