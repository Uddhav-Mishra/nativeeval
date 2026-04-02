from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Commit(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="session.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: str
    linked_tickets: str = "[]"  # JSON array string
    diffs: str = "{}"  # JSON string

class TicketCompletion(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="session.id")
    ticket_id: str
    completed_at: datetime = Field(default_factory=datetime.utcnow)
