FROM python:3.12-slim
WORKDIR /app
 
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . .
ENV PYTHONPATH=/app
ENV PORT=8000
CMD uvicorn src.main:app --host 0.0.0.0 --port $PORT

