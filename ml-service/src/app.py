import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import sys
from pathlib import Path

# Config import
sys.path.append(str(Path(__file__).parent.parent))
from config import MODEL_PATH, MAX_LENGTH, ID2LABEL, ALLOWED_ORIGINS, RATE_LIMIT_PER_MINUTE

# ============== LOGGING ==============
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============== RATE LIMITER ==============
limiter = Limiter(key_func=get_remote_address)

# ============== DEVICE SETUP ==============
device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
logger.info(f"🚀 Kullanılan cihaz: {device}")

# ============== MODEL LOADING ==============
model = None
tokenizer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup ve shutdown işlemleri"""
    global model, tokenizer

    # Startup
    logger.info(f"📥 Model yükleniyor: {MODEL_PATH}")

    if not MODEL_PATH.exists():
        logger.error(f"❌ Model bulunamadı: {MODEL_PATH}")
        raise RuntimeError(f"Model path does not exist: {MODEL_PATH}")

    try:
        # Guarantee string path for older transformers compatibility
        model_path_str = str(MODEL_PATH)
        tokenizer = AutoTokenizer.from_pretrained(model_path_str)
        model = AutoModelForSequenceClassification.from_pretrained(model_path_str)
        model.to(device)
        model.eval()
        logger.info("✅ Model başarıyla yüklendi!")
    except Exception as e:
        logger.error(f"❌ Model yükleme hatası: {e}")
        raise

    yield  # Uygulama çalışıyor

    # Shutdown
    logger.info("👋 Uygulama kapatılıyor...")


# ============== FASTAPI APP ==============
app = FastAPI(
    title="Toxic Wrapped ML Service",
    description="WhatsApp mesaj analizi için NLP servisi",
    version="1.0.0",
    lifespan=lifespan
)

# Required by SlowAPI
app.state.limiter = limiter

# Rate limit error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(f"⚠️ Rate limit aşıldı: {get_remote_address(request)}")
    return JSONResponse(
        status_code=429,
        content={"error": "Çok fazla istek. Lütfen biraz bekleyin."}
    )


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"❌ Beklenmeyen hata: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Sunucu hatası oluştu."}
    )


# ============== CORS ==============
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # artık .env'den geliyor
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ============== CONSTANTS ==============
MAX_CONTEXT_MESSAGES = 10
MAX_MESSAGE_LENGTH = 1000
MAX_REQUESTS_PER_MINUTE = RATE_LIMIT_PER_MINUTE  # artık .env'den geliyor


# ============== REQUEST/RESPONSE MODELS ==============
class Message(BaseModel):
    sender: str
    message: str

    @field_validator("sender")
    @classmethod
    def sender_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Sender boş olamaz")
        if len(v) > 100:
            raise ValueError("Sender çok uzun (max 100)")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Message boş olamaz")
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message çok uzun (max {MAX_MESSAGE_LENGTH})")
        return v.strip()


class AnalyzeRequest(BaseModel):
    context: list[Message]
    target: Message

    @field_validator("context")
    @classmethod
    def context_size_check(cls, v):
        if len(v) > MAX_CONTEXT_MESSAGES:
            raise ValueError(f"En fazla {MAX_CONTEXT_MESSAGES} context mesajı")
        return v


class AnalyzeResponse(BaseModel):
    label: str
    confidence: float
    scores: dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str


class ErrorResponse(BaseModel):
    error: str


# ============== ENDPOINTS ==============
@app.get("/health", response_model=HealthResponse)
def health():
    """Servis sağlık kontrolü"""
    return HealthResponse(
        status="ok" if model is not None else "error",
        model_loaded=model is not None,
        model_path=str(MODEL_PATH)
    )


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
@limiter.limit(f"{MAX_REQUESTS_PER_MINUTE}/minute")
def analyze(request: Request, payload: AnalyzeRequest):
    """
    Mesaj analizi yap.

    Context mesajları ve target mesajı alır,
    toxic davranış sınıflandırması yapar.
    """

    # Model yüklü mü kontrol
    if model is None or tokenizer is None:
        logger.error("❌ Model yüklenmemiş!")
        raise HTTPException(status_code=500, detail="Model yüklenmemiş")

    try:
        # Context + target'ı text'e çevir
        text_parts = []
        for msg in payload.context:
            text_parts.append(f"{msg.sender}: {msg.message}")
        text_parts.append(f"{payload.target.sender}: {payload.target.message}")

        full_text = " [SEP] ".join(text_parts)

        logger.info(f"📝 Analiz: {len(full_text)} karakter, {len(payload.context) + 1} mesaj")

        # Tokenize
        inputs = tokenizer(
            full_text,
            max_length=MAX_LENGTH,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        ).to(device)

        # Inference
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)[0]

        # Sonuçları hazırla
        predicted_idx = torch.argmax(probs).item()
        predicted_label = ID2LABEL[predicted_idx]
        confidence = probs[predicted_idx].item()

        scores = {ID2LABEL[i]: round(probs[i].item() * 100, 2) for i in range(len(probs))}

        logger.info(f"✅ Sonuç: {predicted_label} ({confidence * 100:.1f}%)")

        return AnalyzeResponse(
            label=predicted_label,
            confidence=round(confidence * 100, 2),
            scores=scores
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Analiz hatası: {e}")
        raise HTTPException(status_code=500, detail="Analiz sırasında hata oluştu")
