from pathlib import Path

# Proje root'unu bul (toxic-wrapped/)
# config.py -> ml-service/ içinde, onun parent'ı toxic-wrapped/
ROOT_DIR = Path(__file__).resolve().parent.parent

# Paths
DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "ml-service" / "models"
DATASET_PATH = DATA_DIR / "dataset" / "dataset.json"

print(f"DEBUG ROOT_DIR: {ROOT_DIR}")
print(f"DEBUG DATASET_PATH: {DATASET_PATH}")
print(f"DEBUG File exists: {DATASET_PATH.exists()}")

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