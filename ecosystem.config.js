// SWAIS VidhyaBharathi — pm2 process definitions.
// Two apps: one backend (FastAPI), one frontend (Next.js). Same EC2.
module.exports = {
  apps: [
    {
      name: "vb-backend",
      cwd: "./backend",
      script: "./.venv/bin/uvicorn",
      interpreter: "none", // CRITICAL: without this pm2 runs uvicorn with Node and crashes
      args: "app.main:app --host 0.0.0.0 --port 8000",
      env: { PYTHONUNBUFFERED: "1" },
    },
    {
      name: "vb-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "start", // = next start; requires a prior `npm run build`
      env: { PORT: "3000", NODE_ENV: "production" },
    },
  ],
};
