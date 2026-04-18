FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install gunicorn

COPY . .

EXPOSE 8080

CMD gunicorn --bind 0.0.0.0:${PORT:-8080} --timeout 120 --workers 2 app:app
