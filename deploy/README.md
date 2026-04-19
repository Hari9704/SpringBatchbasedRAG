# DocIntell — Docker deployment (single host)

This layout is meant to be **cheap to run**: one machine (home server, small cloud VM, or your laptop) with **Docker Compose**. You only pay for that one host; there is no managed Kubernetes or extra databases in this bundle.

## What you get

- All backend services + API gateway + static UI behind **nginx** on port **80**.
- Shared Docker volume **`docintell-data`** so **document uploads** and the **vector store file** stay consistent between document, batch, and query services.
- **`GEMINI_API_KEY`** loaded from a `.env` file when you are ready (optional until you use embeddings or RAG chat).

## Requirements

- Docker Engine + Docker Compose v2
- Roughly **3–4 GB RAM** free for seven JVMs + nginx (tune JVM limits later if needed)
- Maven is only required on the **build machine** inside the Docker image (no local Maven install needed to run)

## Quick start

From the **`deploy`** directory:

1. Copy the environment template and add your key when you use AI features:

   ```bash
   cp .env.example .env
   # Edit .env — set GEMINI_API_KEY=... when you are ready
   ```

2. Build and start:

   ```bash
   docker compose up --build -d
   ```

3. Open **http://localhost** (UI). API gateway is also on **http://localhost:8080** if you need it directly.

## Cloud VM (low cost)

Use the smallest **general-purpose** instance that meets the RAM note above (for example a 2 vCPU / 4 GB VM on many providers). Open **port 80** (and **443** if you add TLS later). Set **`JWT_SECRET`** and **`GEMINI_API_KEY`** in `.env` — do not commit `.env`.

## Notes

- Databases are still **H2 in-memory** per service (demo-friendly). For production-grade persistence, move to PostgreSQL and keep the same Compose pattern.
- **`JWT_SECRET`**: change the default in `docker-compose.yml` or override via `.env` before any public exposure.
