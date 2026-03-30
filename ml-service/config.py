# from pathlib import Path
#
# # Paths
# ROOT_DIR = Path(__file__).resolve().parent.parent
# DATA_DIR = ROOT_DIR / "data"
# MODEL_DIR = ROOT_DIR / "ml-service" / "models"
# MODEL_PATH = MODEL_DIR / "toxic-wrapped-model-BESTSCORE"  # ← YENİ
# DATASET_PATH = DATA_DIR / "dataset" / "dataset.json"
#
# # Model
# BASE_MODEL = "dbmdz/bert-base-turkish-cased"
# MAX_LENGTH = 256
#
# # Labels
# LABELS = ["gaslighting", "love_bombing", "passive_aggressive", "neutral"]
# NUM_LABELS = len(LABELS)
# LABEL2ID = {label: i for i, label in enumerate(LABELS)}
# ID2LABEL = {i: label for i, label in enumerate(LABELS)}
#
# # Training
# BATCH_SIZE = 8
# EPOCHS = 10
# LEARNING_RATE = 2e-5
# TRAIN_SPLIT = 0.8


import os
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Paths
ROOT_DIR = Path(__file__).resolve().parent
MODEL_PATH = ROOT_DIR / os.getenv("MODEL_PATH", "models/toxic-wrapped-model-BESTSCORE")

# Model
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "256"))

# API
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
WORKERS = int(os.getenv("WORKERS", "4"))
TIMEOUT = int(os.getenv("TIMEOUT", "30"))

# Rate Limiting
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Labels (sabit)
LABELS = ["gaslighting", "love_bombing", "passive_aggressive", "neutral"]
NUM_LABELS = len(LABELS)
LABEL2ID = {label: i for i, label in enumerate(LABELS)}
ID2LABEL = {i: label for i, label in enumerate(LABELS)}