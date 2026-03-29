from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "ml-service" / "models"
MODEL_PATH = MODEL_DIR / "toxic-wrapped-model-BESTSCORE"  # ← YENİ
DATASET_PATH = DATA_DIR / "dataset" / "dataset.json"

# Model
BASE_MODEL = "dbmdz/bert-base-turkish-cased"
MAX_LENGTH = 256

# Labels
LABELS = ["gaslighting", "love_bombing", "passive_aggressive", "neutral"]
NUM_LABELS = len(LABELS)
LABEL2ID = {label: i for i, label in enumerate(LABELS)}
ID2LABEL = {i: label for i, label in enumerate(LABELS)}

# Training
BATCH_SIZE = 8
EPOCHS = 10
LEARNING_RATE = 2e-5
TRAIN_SPLIT = 0.8