import io
import secrets
import tempfile
import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from groq import Groq
from gtts import gTTS

import models, schemas, auth
from database import get_db, settings

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])
ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]

# ─────────────────────────────── Groq Client ────────────────────────────────

groq_client = Groq(api_key=settings.GROQ_API_KEY)

HB_SYSTEM_PROMPT = """You are the AI virtual assistant for H&B Event Solution — a premium event production company at LDA 840, Lahore, Pakistan, with 30+ years of industry experience.

SERVICES:
1. SMD Screen Rentals — High-brightness P3 indoor and P6 outdoor screens. Standard 12x9 to custom large-format. Zero dead pixels. On-site technician included.
2. Sound System Engineering — JBL professional line-array systems, Shure wireless microphone kits, digital mixing consoles. On-site sound engineers for full event duration.
3. Custom 3D Stall Fabrication — End-to-end design and build. 3D digital render first, then premium wood/acrylic/metal. Ideal for pharmaceutical exhibitions and corporate trade shows.

KEY FACTS:
- 30+ years in business, based in Lahore, serving all of Pakistan for major events
- We OWN all equipment and employ our own crew — no subcontracting, zero hidden markups
- Clients: pharmaceutical companies (Novartis, MedPak), corporate managers, concert promoters, local vendors
- Booking: 2–4 weeks advance standard; 6–8 weeks for large-scale or custom fabrication
- Pricing: Always custom, based on event requirements — never give specific prices, direct to Quote Builder
- On-site support: Yes, crew from setup to teardown with backup equipment on standby
- Office hours: Monday–Saturday, 9:00 AM – 7:00 PM PKT

BEHAVIOR RULES:
- Be professional, warm, helpful and concise (2–4 sentences per response max)
- NEVER reveal specific prices — say pricing is customized and requires a quote
- End every response with a short, relevant call-to-action (e.g. "Would you like to start your quote?")
- If user wants a human, tell them sales team is available Mon–Sat 9AM–7PM and to use the Contact page
- Respond in the same language the user writes in (English, Urdu, or Romanized Urdu)
- When user asks for a quote, encourage them to use the Quote Builder on the website"""


# ─────────────────────────────── Helpers ────────────────────────────────────

def _get_history(db: Session, session_id: int, limit: int = 10) -> list:
    msgs = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {"role": "assistant" if m.is_bot else "user", "content": m.content}
        for m in reversed(msgs)
    ]


def _ask_groq(history: list, user_message: str) -> str:
    try:
        history.append({"role": "user", "content": user_message})
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": HB_SYSTEM_PROMPT}, *history],
            max_tokens=512,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return (
            "Thank you for reaching out to H&B Event Solution! Our team is here to help with "
            "SMD screens, sound systems, and custom 3D stalls. Please submit a quote or contact "
            "us directly — Mon–Sat 9AM–7PM PKT."
        )


def _detect_intent(text: str) -> str:
    t = text.lower()
    intents = {
        "greeting": ["hello", "hi", "hey", "salaam", "salam", "good morning", "good evening"],
        "pricing": ["price", "cost", "rate", "how much", "charges", "budget"],
        "booking": ["book", "reserve", "available", "availability", "schedule"],
        "quote_request": ["quote", "estimate", "proposal", "requirement", "need a", "want to"],
        "smd_screen": ["smd", "screen", "display", "led", "projection", "video wall"],
        "sound_system": ["sound", "audio", "speaker", "microphone", "pa system"],
        "stall_fabrication": ["stall", "booth", "3d", "fabrication", "exhibition", "stand"],
        "contact_human": ["speak", "call", "phone", "human", "person", "manager", "agent"],
        "location": ["where", "location", "address", "lahore", "lda"],
        "experience": ["years", "experience", "history", "established", "founded"],
    }
    for intent, keywords in intents.items():
        if any(kw in t for kw in keywords):
            return intent
    return "general"


def _tts_stream(text: str) -> io.BytesIO:
    tts = gTTS(text=text, lang="en", slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf


# ─────────────────────────────── Text Chat ──────────────────────────────────

@router.post("/start", response_model=schemas.ChatStartResponse, status_code=status.HTTP_201_CREATED)
def start_chat_session(db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    session = models.ChatSession(session_token=token)
    db.add(session)
    db.commit()
    db.refresh(session)

    greeting = (
        "Assalam-o-Alaikum! Welcome to H&B Event Solution — Lahore's premier event production "
        "company with 30 years of excellence. I can help you with SMD screen rentals, professional "
        "sound systems, and custom 3D stall fabrication. How can I assist you today?"
    )
    db.add(models.ChatMessage(session_id=session.id, content=greeting, is_bot=True, intent="greeting"))
    db.commit()
    return schemas.ChatStartResponse(session_token=token, message=greeting)


@router.post("/message", response_model=schemas.ChatBotReply)
def send_message(msg_in: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.session_token == msg_in.session_token
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found or expired")

    if msg_in.visitor_name and not session.visitor_name:
        session.visitor_name = msg_in.visitor_name
    if msg_in.visitor_email and not session.visitor_email:
        session.visitor_email = msg_in.visitor_email
    session.last_activity = datetime.now(timezone.utc)

    user_msg = models.ChatMessage(session_id=session.id, content=msg_in.content, is_bot=False)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    history = _get_history(db, session.id, limit=10)
    bot_text = _ask_groq(history, msg_in.content)
    intent = _detect_intent(msg_in.content)

    if intent in ("quote_request", "contact_human"):
        session.is_escalated = True

    bot_msg = models.ChatMessage(session_id=session.id, content=bot_text, is_bot=True, intent=intent)
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    db.refresh(session)

    return schemas.ChatBotReply(user_message=user_msg, bot_message=bot_msg, is_escalated=session.is_escalated)


# ─────────────────────────────── Voice: STT ─────────────────────────────────

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file: webm, mp3, wav, m4a, ogg"),
    db: Session = Depends(get_db),
):
    """Convert spoken audio to text using Groq Whisper."""
    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large. Max 25 MB.")

    allowed = {"audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
               "audio/mp4", "audio/x-m4a", "audio/m4a", "application/octet-stream"}
    content_type = audio.content_type or "audio/webm"

    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            transcription = groq_client.audio.transcriptions.create(
                file=(audio.filename or f"audio{suffix}", f.read(), content_type),
                model="whisper-large-v3-turbo",
                response_format="text",
            )
        text = transcription if isinstance(transcription, str) else transcription.text
        return {"text": text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        os.unlink(tmp_path)


# ─────────────────────────────── Voice: TTS ─────────────────────────────────

@router.post("/speak")
async def text_to_speech(text: str = Form(..., description="Text to convert to speech")):
    """Convert text to MP3 audio using gTTS."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if len(text) > 3000:
        raise HTTPException(status_code=400, detail="Text too long. Max 3000 characters.")
    try:
        audio_buf = _tts_stream(text)
        return StreamingResponse(
            audio_buf,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=response.mp3"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


# ─────────────────────────────── Voice: Full Round-trip ─────────────────────

@router.post("/voice-message")
async def voice_message(
    session_token: str = Form(...),
    audio: UploadFile = File(..., description="Recorded voice audio"),
    visitor_name: Optional[str] = Form(None),
    visitor_email: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Full voice round-trip:
    1. Transcribe audio → user text (Groq Whisper)
    2. Get AI response → bot text (Groq LLaMA)
    3. Convert bot text → audio (gTTS)
    Returns: JSON with transcription + bot_response text, plus streams audio.
    Use ?audio_response=true to get audio stream, otherwise returns JSON.
    """
    session = db.query(models.ChatSession).filter(
        models.ChatSession.session_token == session_token
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Step 1: Transcribe
    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio too large. Max 25 MB.")

    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    content_type = audio.content_type or "audio/webm"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            transcription = groq_client.audio.transcriptions.create(
                file=(audio.filename or f"audio{suffix}", f.read(), content_type),
                model="whisper-large-v3-turbo",
                response_format="text",
            )
        user_text = (transcription if isinstance(transcription, str) else transcription.text).strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        os.unlink(tmp_path)

    if not user_text:
        raise HTTPException(status_code=400, detail="Could not transcribe audio. Please speak clearly.")

    # Update visitor info
    if visitor_name and not session.visitor_name:
        session.visitor_name = visitor_name
    if visitor_email and not session.visitor_email:
        session.visitor_email = visitor_email
    session.last_activity = datetime.now(timezone.utc)

    # Save user message
    user_msg = models.ChatMessage(session_id=session.id, content=user_text, is_bot=False)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Step 2: AI response
    history = _get_history(db, session.id, limit=10)
    bot_text = _ask_groq(history, user_text)
    intent = _detect_intent(user_text)

    if intent in ("quote_request", "contact_human"):
        session.is_escalated = True

    bot_msg = models.ChatMessage(session_id=session.id, content=bot_text, is_bot=True, intent=intent)
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    db.refresh(session)

    # Step 3: TTS for bot response
    try:
        audio_buf = _tts_stream(bot_text)
    except Exception:
        audio_buf = None

    if audio_buf:
        # Encode audio as base64 so we can return everything in one JSON response
        import base64
        audio_b64 = base64.b64encode(audio_buf.read()).decode("utf-8")
    else:
        audio_b64 = None

    return {
        "user_text": user_text,
        "bot_text": bot_text,
        "intent": intent,
        "is_escalated": session.is_escalated,
        "audio_base64": audio_b64,
        "audio_format": "mp3",
    }


# ─────────────────────────────── Admin ──────────────────────────────────────

@router.get("/sessions", response_model=list[schemas.ChatSessionResponse])
def list_chat_sessions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    return (
        db.query(models.ChatSession)
        .options(joinedload(models.ChatSession.messages))
        .order_by(models.ChatSession.last_activity.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/sessions/{token}", response_model=schemas.ChatSessionResponse)
def get_chat_session(
    token: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    session = (
        db.query(models.ChatSession)
        .options(joinedload(models.ChatSession.messages))
        .filter(models.ChatSession.session_token == token)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
