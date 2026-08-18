// SWAIS VidhyaBharathi — pm2 process definitions.
// Two apps: one backend (FastAPI), one web (Next.js). Same EC2.
module.exports = {
  apps: [
    {
      name: "vb-backend",
      cwd: "./backend",
      script: "./.venv/bin/uvicorn",
      interpreter: "none", // CRITICAL: without this pm2 runs uvicorn with Node and crashes
      // Ports 8010/3010 chosen to avoid the SGS/SSS apps already on this box.
      // VERIFY they're free first: `sudo lsof -i -P -n | grep LISTEN` / `pm2 list`.
      args: "app.main:app --host 0.0.0.0 --port 8010",
      env: { PYTHONUNBUFFERED: "1" },
    },
    {
      name: "vb-web",
      cwd: "./web",
      script: "npm",
      args: "start", // = next start -p 3010; requires a prior `npm run build`
      env: { PORT: "3010", NODE_ENV: "production" },
    },
  ],
};
