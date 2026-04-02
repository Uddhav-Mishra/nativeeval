from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class ChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="session.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    role: str  # user | assistant
    content: str
