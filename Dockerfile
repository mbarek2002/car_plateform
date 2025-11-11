############################################
# Unified Dockerfile for entire project
# - Builds frontend (React) → static assets
# - Installs and runs backend (FastAPI/Uvicorn)
# - Uses Nginx to serve frontend and proxy /api → backend
# - Uses Supervisor to run Nginx and Uvicorn together
############################################

# 1) Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Allow overriding API URL at build time; default to /api for same-container proxying
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

# 2) Final image with Python backend + Nginx + Supervisor
FROM python:3.9-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor curl build-essential \
    && rm -rf /var/lib/apt/lists/*

# Backend deps
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend code
COPY backend /app/backend

# Copy frontend build from stage to Nginx html
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Nginx configuration (root-level unified config)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Supervisor configuration to run both processes
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Prepare runtime directories
RUN mkdir -p /var/log/supervisor /run/nginx /app/backend/temp_uploads

EXPOSE 80

# Healthcheck via Nginx → proxies /api/health to backend
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -f http://localhost/api/health || exit 1

# Run both Nginx and Uvicorn via Supervisor
CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]


