# NotesSpace - client

React (Vite) + Tailwind CSS v3.

```bash
npm install
npm run dev        # http://localhost:5173
```

Dev madhe `/api` calls vite proxy ne `http://localhost:5000` (Express backend) la jatat.
Backend port vegla asel tar `vite.config.js` madhe change kar.
Production sathi `.env` madhe `VITE_API_URL=https://your-api.com/api` set kar.

Shortcuts: `Ctrl/Cmd + K` search notes, `Ctrl/Cmd + Enter` generate notes.
