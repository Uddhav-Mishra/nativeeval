from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session as DBSession, select
from pydantic import BaseModel
import json
import os
from openai import OpenAI

from db import get_session
from models.session import Session
from models.message import ChatMessage
from data.tickets import TICKETS
from data.scoring_prompts import CHAT_SYSTEM_PROMPT_TEMPLATE

router = APIRouter()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    session_id: str
    message: str
    current_files: dict = {}  # current file contents

@router.post("/chat")
async def chat(req: ChatRequest, db: DBSession = Depends(get_session)):
    session = db.get(Session, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Build codebase context
    codebase = ""
    for filename, content in req.current_files.items():
        codebase += f"\n\n### {filename}\n```\n{content}\n```"

    tickets_text = "\n".join([
        f"[{t['id']}] ({t['type']}, {t['priority']}) {t['title']}: {t['description']}"
        for t in TICKETS
    ])

    system_prompt = CHAT_SYSTEM_PROMPT_TEMPLATE.format(
        codebase=codebase or "(no files provided)",
        tickets=tickets_text
    )

    # Get conversation history
    history = db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == req.session_id)
        .order_by(ChatMessage.timestamp)
    ).all()

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": req.message})

    # Save user message
    user_msg = ChatMessage(session_id=req.session_id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # Stream response
    def generate():
        full_response = ""
        stream = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=2048,
            messages=[{"role": "system", "content": system_prompt}] + messages,
            stream=True
        )
        for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                full_response += text
                yield f"data: {json.dumps({'text': text})}\n\n"

        # Save assistant message after streaming
        from db import engine
        with DBSession(engine) as save_session:
            assistant_msg = ChatMessage(
                session_id=req.session_id,
                role="assistant",
                content=full_response
            )
            save_session.add(assistant_msg)
            save_session.commit()

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
