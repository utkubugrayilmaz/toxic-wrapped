import json
from pathlib import Path
from collections import Counter
import hashlib

DATASET_DIR = Path(__file__).parent

# Eski dataset
OLD_DATASET = "dataset_full.json"

# Yeni v2 dosyaları
V2_FILES = [
    "dataset_v2/passive_aggressive_v2.json",
    "dataset_v2/gaslighting_v2.json",
    "dataset_v2/love_bombing_v2.json",
    "dataset_v2/neutral_v2.json",
    "dataset_v2/neutral_edge_cases_v2.json",
    "dataset_v2/passive_aggressive_edge_v2.json",
    "dataset_v2/gaslighting_edge_v2.json",
    "dataset_v2/love_bombing_edge_v2.json"
]

OUTPUT_FILE = "dataset_v2_full.json"

def get_item_hash(item):
    """
    Bir verinin benzersiz olup olmadığını anlamak için
    içeriğinden benzersiz bir hash oluşturur.
    Context mesajları ve target mesajının birleşimi kullanılır.
    """
    # İlgili tüm metinleri bir araya getir
    text_parts = []
    for msg in item.get("context", []):
        text_parts.append(msg.get("sender", "") + msg.get("message", ""))
    
    target = item.get("target", {})
    text_parts.append(target.get("sender", "") + target.get("message", ""))
    
    # Label'ı da ekle (aynı konuşma farklı label verilmişse farklı kabul edilsin)
    text_parts.append(item.get("label", ""))
    
    # Hepsini string yapıp hashle
    full_string = "|".join(text_parts).lower().strip()
    return hashlib.md5(full_string.encode('utf-8')).hexdigest()


def merge():
    all_data = []
    seen_hashes = set()
    duplicates_removed = 0

    def add_data_if_unique(data_list):
        nonlocal duplicates_removed
        added_count = 0
        for item in data_list:
            item_hash = get_item_hash(item)
            if item_hash not in seen_hashes:
                seen_hashes.add(item_hash)
                all_data.append(item)
                added_count += 1
            else:
                duplicates_removed += 1
        return added_count

    # 1. Eski dataset'i yükle
    old_path = DATASET_DIR / OLD_DATASET
    if old_path.exists():
        with open(old_path, "r", encoding="utf-8") as f:
            old_data = json.load(f)
            added = add_data_if_unique(old_data)
            print(f"✅ {OLD_DATASET}: {len(old_data)} dosya okundu, {added} tanesi eklendi.")
    else:
        print(f"❌ HATA: {OLD_DATASET} bulunamadı!")
        return

    # 2. V2 dosyalarını yükle
    print("\n📁 V2 dosyaları:")
    for filename in V2_FILES:
        filepath = DATASET_DIR / filename

        if not filepath.exists():
            print(f"   ❌ {filename} bulunamadı!")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            added = add_data_if_unique(data)
            print(f"   ✅ {filename}: {len(data)} dosya okundu, {added} tanesi eklendi.")

    # 3. Kaydet
    output_path = DATASET_DIR / OUTPUT_FILE
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    # 4. Özet
    print("\n" + "=" * 50)
    print(f"📊 TOPLAM OLUŞTURULAN: {len(all_data)} benzersiz örnek")
    print(f"🗑️ TEMİZLENEN KOPYA VERİ: {duplicates_removed} örnek")
    print(f"📁 Kaydedildi: {OUTPUT_FILE}")

    # 5. Label dağılımı
    labels = [item["label"] for item in all_data]
    print("\n📈 Label dağılımı:")
    for label, count in sorted(Counter(labels).items()):
        percentage = (count / len(all_data)) * 100
        print(f"   {label}: {count} ({percentage:.1f}%)")

    # 6. Denge kontrolü
    counts = list(Counter(labels).values())
    min_count, max_count = min(counts), max(counts)
    imbalance = (max_count - min_count) / max_count * 100
    print(f"\n⚖️  Denge: min={min_count}, max={max_count} (fark: {imbalance:.1f}%)")

    if imbalance < 20:
        print("   ✅ Dataset dengeli!")
    else:
        print("   ⚠️  Dataset biraz dengesiz, ama kabul edilebilir.")


if __name__ == "__main__":
    merge()