from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session as DBSession, select
from pydantic import BaseModel
from typing import Optional
import json

from db import get_session
from models.session import Session
from models.commit import Commit, TicketCompletion
from models.message import ChatMessage

router = APIRouter()

class StartSessionRequest(BaseModel):
    candidate_name: str
    candidate_email: str

class CommitRequest(BaseModel):
    session_id: str
    message: str
    linked_tickets: list[str] = []
    files: dict  # {filename: {before: str, after: str}}

class TicketCompleteRequest(BaseModel):
    session_id: str

@router.post("/session/start")
def start_session(req: StartSessionRequest, db: DBSession = Depends(get_session)):
    session = Session(candidate_name=req.candidate_name, candidate_email=req.candidate_email)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id}

@router.get("/session/{session_id}")
def get_session_data(session_id: str, db: DBSession = Depends(get_session)):
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.exec(select(ChatMessage).where(ChatMessage.session_id == session_id)).all()
    commits = db.exec(select(Commit).where(Commit.session_id == session_id)).all()
    completions = db.exec(select(TicketCompletion).where(TicketCompletion.session_id == session_id)).all()

    return {
        "session": session,
        "messages": messages,
        "commits": [
            {**c.dict(), "linked_tickets": json.loads(c.linked_tickets), "diffs": json.loads(c.diffs)}
            for c in commits
        ],
        "completed_tickets": [tc.ticket_id for tc in completions]
    }

@router.post("/commit")
def create_commit(req: CommitRequest, db: DBSession = Depends(get_session)):
    session = db.get(Session, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    commit = Commit(
        session_id=req.session_id,
        message=req.message,
        linked_tickets=json.dumps(req.linked_tickets),
        diffs=json.dumps(req.files)
    )
    db.add(commit)
    db.commit()
    db.refresh(commit)
    return {"commit_id": commit.id, "timestamp": commit.timestamp}

@router.patch("/ticket/{ticket_id}/complete")
def complete_ticket(ticket_id: str, req: TicketCompleteRequest, db: DBSession = Depends(get_session)):
    session = db.get(Session, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check not already completed
    existing = db.exec(
        select(TicketCompletion)
        .where(TicketCompletion.session_id == req.session_id)
        .where(TicketCompletion.ticket_id == ticket_id)
    ).first()
    if existing:
        return {"already_completed": True}

    tc = TicketCompletion(session_id=req.session_id, ticket_id=ticket_id)
    db.add(tc)
    db.commit()
    return {"completed": True, "ticket_id": ticket_id}
