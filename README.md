# Free Local AI Story Generator (No Paid API)

This mini-app lets you generate stories using a free, locally-run model via **Ollama**.
No OpenAI/paid licenses required.

## Requirements
- **Node.js 18+**
- **Ollama** installed and running
- A local model such as `qwen2.5:7b-instruct` or `mistral:7b-instruct`

## Quick Start
1. Install Ollama (https://ollama.com) and pull a model, e.g.:
   ```bash
   ollama pull qwen2.5:7b-instruct
   # or
   ollama pull mistral:7b-instruct
   ```

2. In this folder, install server deps:
   ```bash
   npm i express cors
   ```

3. Run the server:
   ```bash
   node server.js
   ```

4. Open: http://localhost:3000

### Change the model
Set the `MODEL` env var when starting the server, e.g.:
```bash
MODEL=mistral:7b-instruct node server.js
```

## Notes
- If your Node is older than 18, upgrade so `fetch` is available globally.
- This server proxies to Ollama at `http://127.0.0.1:11434`. Make sure Ollama is running.
- Everything runs locally; your text does not leave your machine.
