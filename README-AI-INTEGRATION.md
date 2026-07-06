This project now includes a lightweight AI proxy and guidance for free/self-hosted AI options.

Environment variables (add to your Vercel project or local `.env`):

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — Supabase client
- `OLLAMA_URL` — e.g. `http://localhost:11434` to use an Ollama server
- `HUGGINGFACE_API_KEY` — optional; for Hugging Face Inference API
- `SEARXNG_URL` — optional; URL to a SearxNG instance for web searches

API endpoints:
- `/api/ai/invoke` — POST with `{ provider, payload }`. Provider examples: `ollama`, `huggingface`, `searxng`, `fetch`.

Free/self-hosted recommendations:
- Ollama (self-hosted) or Open WebUI for local models.
- SearxNG for aggregated web search without tracking.
- GPT4All / LM Studio for fully local models.

Notes:
- Closed commercial providers (OpenAI, Anthropic, Google Gemini, etc.) require API keys and may not be free or unlimited.
- Migrating server-side Supabase functions that used `@base44/sdk` requires manual porting; initial shim exists to avoid runtime errors in the frontend.
