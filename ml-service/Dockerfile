FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# PyTorch CPU-only (VERSİYON BELİRTİLDİ)
RUN pip install --no-cache-dir torch==2.4.0+cpu --index-url https://download.pytorch.org/whl/cpu

# Diğer Python bağımlılıkları
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodları
COPY config.py .
COPY src/ ./src/

# Model klasörü (volume olarak mount edilecek)
RUN mkdir -p models

# Port
EXPOSE 8000

# Gunicorn ile çalıştır
CMD ["gunicorn", "src.app:app", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]