import json
from pathlib import Path
from collections import Counter
import hashlib

# Dosya yolları
DATASET_DIR = Path(__file__).parent

FILES_TO_MERGE = [
    "dataset.json",  # Eski 28 örnek
    "gaslighting_new.json",  # Yeni 30
    "love_bombing_new.json",  # Yeni 30
    "passive_aggressive_new.json",  # Yeni 30
    "neutral_new.json"  # Yeni 30
]

OUTPUT_FILE = "dataset_full.json"


def get_item_hash(item):
    """
    Benzersizliği garanti etmek için bir hash (şifreleme) fonksiyonu.
    Aynı verilerin eklenmesini engeller.
    """
    text_parts = []
    for msg in item.get("context", []):
        text_parts.append(msg.get("sender", "") + msg.get("message", ""))
    
    target = item.get("target", {})
    text_parts.append(target.get("sender", "") + target.get("message", ""))
    text_parts.append(item.get("label", ""))
    
    full_string = "|".join(text_parts).lower().strip()
    return hashlib.md5(full_string.encode('utf-8')).hexdigest()

def merge():
    all_data = []
    seen_hashes = set()
    duplicates = 0

    for filename in FILES_TO_MERGE:
        filepath = DATASET_DIR / filename

        if not filepath.exists():
            print(f"❌ HATA: {filename} bulunamadı!")
            return

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            added_count = 0
            for item in data:
                h = get_item_hash(item)
                if h not in seen_hashes:
                    seen_hashes.add(h)
                    all_data.append(item)
                    added_count += 1
                else:
                    duplicates += 1
            print(f"✅ {filename}: {len(data)} okundu, {added_count} eklendi.")

    # Kaydet
    output_path = DATASET_DIR / OUTPUT_FILE
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    # Özet
    print()
    print("=" * 40)
    print(f"📊 TOPLAM BENZERSİZ: {len(all_data)} örnek")
    print(f"🗑️ SİLİNEN KOPYALAR: {duplicates} örnek")
    print(f"📁 Kaydedildi: {OUTPUT_FILE}")
    print()

    # Label dağılımı
    labels = [item["label"] for item in all_data]
    print("📈 Label dağılımı:")
    for label, count in Counter(labels).items():
        print(f"   {label}: {count}")


if __name__ == "__main__":
    merge()