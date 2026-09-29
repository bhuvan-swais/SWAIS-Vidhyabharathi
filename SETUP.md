# SWAIS VidhyaBharathi — Developer Setup

Get from clone → working login on your own machine. Read this fully once.

---

## 0. What the admin gives you (one-time, ask for these)
1. **Repo access** + the branch to work on.
2. **Two secrets** (via DM, not group): the **DB password** and (optional) **Twilio creds**.
   The public **Google Client ID** is already in the `.env.example` files.
3. Your machine's **public IP whitelisted on the RDS** (send it — see step 2).
4. If you'll use **Google login**: your Gmail added as a **Test user**, and a **login row seeded** for you (email/phone in the DB).

You (the dev) generate your **own** `SECRET_KEY` — you do NOT need the admin's.

---

## 1. Prerequisites
- **Python 3.11+**, **Node 18+**, **git**.

## 2. Whitelist your IP (do this first — the #1 cause of "login not working")
The backend connects to the shared demo DB (`vb_prod`) from **your** IP. If it's not whitelisted, every login call just **times out**.
```bash
curl https://checkip.amazonaws.com
```
Send that IP to the admin. Re-send if your IP changes (home/office/Wi-Fi switch).

## 3. Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# then edit .env:
#   SECRET_KEY   -> python3 -c "import secrets; print(secrets.token_hex(32))"
#   DEMO_DATABASE_URL -> replace <DB_PASSWORD> with the password the admin gave you
uvicorn app.main:app --reload --port 8000
```
Check: open http://localhost:8000/api/health → `{"status":"ok"}`.

## 4. Web
```bash
cd web
npm install
cp .env.local.example .env.local     # values are public, already filled
npm run dev                          # MUST open on http://localhost:3100
```
> The web **must** run on **:3100** — CORS and the Google redirect are configured for it.

## 5. Log in
Open **http://localhost:3100** → **pick a role** → sign in with **Email** (Google) **or** **Mobile** (OTP).
- **OTP (console mode):** the 6-digit code shows on screen (`OTP sent (test mode): …`). No SMS unless Twilio is configured.
- Your **email/phone must exist in the DB** for that role. Ask the admin to seed you, or use the account you were given.

---

## Ports
| Service | Port | Notes |
|---|---|---|
| Backend (FastAPI) | **8000** | `uvicorn app.main:app --reload --port 8000` |
| Web (Next.js) | **3100** | required — CORS + Google redirect are set for it |

## Env files — never commit them
Both `.env` (backend) and `.env.local` (web) are **gitignored**, so they do NOT come with `git pull`. Every dev creates them from the `.example` files. That's intentional.

---

## Troubleshooting login (F12 → Network → click the `check-email` / `check-phone` request)
| Symptom | Cause | Fix |
|---|---|---|
| Request **pending forever / timeout** | Your IP isn't whitelisted on RDS | Send admin your IP (step 2) |
| **CORS error** in console | Web not on :3100 | Run web on **3100** |
| **404 "Not authorised to login"** | Your email/phone isn't in the DB for that role | Ask admin to seed your login |
| **Failed / connection refused** | Backend not running, or wrong `NEXT_PUBLIC_API_BASE_URL` | Start backend; check `web/.env.local` |
| Google **"access denied / app not verified"** | Your Gmail isn't a Test user on the consent screen | Ask admin to add you |
| `redirect_uri_mismatch` on Google | Client missing your redirect URI | Admin adds `http://localhost:3100/` to the OAuth client |

## Real SMS OTP (optional)
Set `OTP_DELIVERY_MODE=twilio` in `backend/.env` and fill `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (ask admin). Restart the backend. Otherwise console mode is fine for dev.

---

## Admin checklist (per new dev)
- [ ] Give repo access + branch.
- [ ] DM the **DB password** (+ Twilio creds if they need real SMS).
- [ ] **Whitelist their IP** on the `swais-db-test-env` RDS security group (port 5432).
- [ ] Add their **Gmail as a Test user** on the Google OAuth consent screen (for Google login).
- [ ] **Seed their login row** — set their email/phone on a `vb_student_master` row (or the right role table):
  ```sql
  UPDATE vb_student_master SET email_id = NULL  WHERE email_id  = 'dev@gmail.com';
  UPDATE vb_student_master SET mobile_no = NULL WHERE mobile_no = '9XXXXXXXXX';
  UPDATE vb_student_master SET email_id = 'dev@gmail.com', mobile_no = '9XXXXXXXXX'
  WHERE student_id = <spare id>;
  ```
