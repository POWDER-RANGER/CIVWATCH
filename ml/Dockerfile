# CIVWATCH ML Service — Python 3.11 + FastAPI
FROM python:3.11-slim
WORKDIR /app
RUN addgroup --system civwatch && adduser --system --group civwatch
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py ./
USER civwatch
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
