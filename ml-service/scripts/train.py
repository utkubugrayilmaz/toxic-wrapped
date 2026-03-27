import sys

sys.path.append("..")

import torch
from torch.utils.data import DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup
)
from torch.optim import AdamW
from sklearn.metrics import classification_report, f1_score
from tqdm import tqdm
from pathlib import Path

from config import (
    BASE_MODEL, MAX_LENGTH, NUM_LABELS, LABEL2ID, ID2LABEL,
    BATCH_SIZE, EPOCHS, LEARNING_RATE, TRAIN_SPLIT, MODEL_DIR
)
from dataset_loader import prepare_datasets


def train():
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Tokenizer ve Model
    print(f"Loading model: {BASE_MODEL}")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL,
        num_labels=NUM_LABELS,
        id2label=ID2LABEL,
        label2id=LABEL2ID
    )
    model.to(device)

    # Datasets
    print("Preparing datasets...")
    train_dataset, val_dataset = prepare_datasets(tokenizer, MAX_LENGTH, TRAIN_SPLIT)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)

    # Optimizer ve Scheduler
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )

    # Training Loop
    print(f"\nStarting training for {EPOCHS} epochs...")
    best_f1 = 0

    for epoch in range(EPOCHS):
        # --- TRAIN ---
        model.train()
        train_loss = 0

        for batch in tqdm(train_loader, desc=f"Epoch {epoch + 1}/{EPOCHS} [Train]"):
            optimizer.zero_grad()

            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )

            loss = outputs.loss
            train_loss += loss.item()

            loss.backward()
            optimizer.step()
            scheduler.step()

        avg_train_loss = train_loss / len(train_loader)

        # --- VALIDATION ---
        model.eval()
        val_loss = 0
        all_preds = []
        all_labels = []

        with torch.no_grad():
            for batch in tqdm(val_loader, desc=f"Epoch {epoch + 1}/{EPOCHS} [Val]"):
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["label"].to(device)

                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )

                val_loss += outputs.loss.item()
                preds = torch.argmax(outputs.logits, dim=1)

                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())

        avg_val_loss = val_loss / len(val_loader)
        f1 = f1_score(all_labels, all_preds, average="macro")

        print(f"\nEpoch {epoch + 1}/{EPOCHS}")
        print(f"Train Loss: {avg_train_loss:.4f}")
        print(f"Val Loss: {avg_val_loss:.4f}")
        print(f"Val F1 (macro): {f1:.4f}")

        # Best model kaydet
        if f1 > best_f1:
            best_f1 = f1
            save_path = MODEL_DIR / "best_model"
            save_path.mkdir(parents=True, exist_ok=True)
            model.save_pretrained(save_path)
            tokenizer.save_pretrained(save_path)
            print(f"✓ Best model saved! F1: {f1:.4f}")

    # Final evaluation
    print("\n" + "=" * 50)
    print("FINAL CLASSIFICATION REPORT")
    print("=" * 50)
    print(classification_report(all_labels, all_preds, target_names=list(LABEL2ID.keys())))

    print(f"\nTraining complete! Best F1: {best_f1:.4f}")
    print(f"Model saved at: {MODEL_DIR / 'best_model'}")


if __name__ == "__main__":
    train()