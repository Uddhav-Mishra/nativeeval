from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Session(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    candidate_name: str
    candidate_email: str
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    status: str = "active"  # active | submitted | scored
    scorecard: Optional[str] = None  # JSON string
