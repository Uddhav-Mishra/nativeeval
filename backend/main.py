from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db import create_db_and_tables
from routers import session, chat, scoring
from data import tickets as tickets_data, initial_code

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "https://nativeeval.ai", "https://www.nativeeval.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(scoring.router, prefix="/api")

@app.get("/api/tickets")
def get_tickets():
    return tickets_data.TICKETS

@app.get("/api/initial-code")
def get_initial_code():
    return initial_code.INITIAL_FILES

@app.get("/health")
def health():
    return {"status": "ok"}
