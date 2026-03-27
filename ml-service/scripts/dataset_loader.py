import json
from torch.utils.data import Dataset
from config import DATASET_PATH, LABEL2ID


def load_raw_data():
    """JSON dosyasını yükle"""
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def format_conversation(item):
    """Context + target'ı tek string'e çevir"""
    parts = []

    # Context mesajlarını ekle
    for msg in item["context"]:
        parts.append(f"{msg['sender']}: {msg['message']}")

    # Target mesajı ekle
    target = item["target"]
    parts.append(f"{target['sender']}: {target['message']}")

    # [SEP] ile birleştir
    return " [SEP] ".join(parts)


class ToxicDataset(Dataset):
    def __init__(self, data, tokenizer, max_length=256):
        self.data = data
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]

        # Conversation'ı text'e çevir
        text = format_conversation(item)

        # Tokenize
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt"
        )

        # Label
        label = LABEL2ID[item["label"]]

        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "label": label
        }


def prepare_datasets(tokenizer, max_length=256, train_split=0.8):
    """Train ve validation dataset'leri hazırla"""
    from sklearn.model_selection import train_test_split

    raw_data = load_raw_data()

    # Stratified split (her label'dan orantılı)
    labels = [item["label"] for item in raw_data]
    train_data, val_data = train_test_split(
        raw_data,
        train_size=train_split,
        stratify=labels,
        random_state=42
    )

    train_dataset = ToxicDataset(train_data, tokenizer, max_length)
    val_dataset = ToxicDataset(val_data, tokenizer, max_length)

    print(f"Train samples: {len(train_dataset)}")
    print(f"Val samples: {len(val_dataset)}")

    return train_dataset, val_dataset