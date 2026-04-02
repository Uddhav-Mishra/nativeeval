from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session as DBSession, select
from pydantic import BaseModel
from datetime import datetime
import json
import os
from openai import OpenAI

from db import get_session
from models.session import Session
from models.commit import Commit, TicketCompletion
from models.message import ChatMessage
from data.scoring_prompts import SCORING_PROMPT_TEMPLATE

router = APIRouter()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

class SubmitRequest(BaseModel):
    session_id: str

@router.post("/session/submit")
def submit_session(req: SubmitRequest, db: DBSession = Depends(get_session)):
    session = db.get(Session, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "submitted"
    session.end_time = datetime.utcnow()
    db.add(session)
    db.commit()

    # Gather session data
    duration = int((session.end_time - session.start_time).total_seconds() / 60)

    completions = db.exec(select(TicketCompletion).where(TicketCompletion.session_id == req.session_id)).all()
    tickets_completed = [tc.ticket_id for tc in completions]

    commits = db.exec(select(Commit).where(Commit.session_id == req.session_id).order_by(Commit.timestamp)).all()
    commits_text = ""
    for c in commits:
        commits_text += f"\nCommit: {c.message}\n"
        commits_text += f"Tickets: {c.linked_tickets}\n"
        diffs = json.loads(c.diffs)
        for filename, diff in diffs.items():
            commits_text += f"File: {filename}\n"
            if isinstance(diff, dict):
                commits_text += f"Before: {diff.get('before', '')[:500]}\n"
                commits_text += f"After: {diff.get('after', '')[:500]}\n"

    messages = db.exec(select(ChatMessage).where(ChatMessage.session_id == req.session_id).order_by(ChatMessage.timestamp)).all()
    chat_transcript = "\n".join([f"[{m.role}]: {m.content}" for m in messages])

    scoring_prompt = SCORING_PROMPT_TEMPLATE.format(
        duration=duration,
        tickets_completed=", ".join(tickets_completed) if tickets_completed else "None",
        commits=commits_text or "No commits",
        chat_transcript=chat_transcript or "No chat messages"
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=2048,
        messages=[{"role": "user", "content": scoring_prompt}]
    )

    scorecard_text = response.choices[0].message.content
    # Extract JSON from response
    try:
        scorecard = json.loads(scorecard_text)
    except:
        import re
        match = re.search(r'\{.*\}', scorecard_text, re.DOTALL)
        if match:
            scorecard = json.loads(match.group())
        else:
            scorecard = {"error": "Failed to parse scorecard"}

    session.scorecard = json.dumps(scorecard)
    session.status = "scored"
    db.add(session)
    db.commit()

    return {"scorecard_id": req.session_id, "scorecard": scorecard}

@router.get("/scorecard/{session_id}")
def get_scorecard(session_id: str, db: DBSession = Depends(get_session)):
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not yet generated")

    scorecard = json.loads(session.scorecard)
    return {
        "candidate_name": session.candidate_name,
        "duration_minutes": int((session.end_time - session.start_time).total_seconds() / 60) if session.end_time else 0,
        "scorecard": scorecard
    }
