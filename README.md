# Digital Twin of Human Learning Style
### AI-Powered Personalized Learning and Performance Prediction Platform (B.Tech CSE College Project)

This is a complete, working full-stack application:

- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Backend:** Python FastAPI
- **Database:** SQLite (a file, no server install needed)
- **Auth:** Register/Login with JWT tokens and bcrypt-hashed passwords
- **Prediction:** A simple, explainable weighted-average / trend model (no paid AI APIs required)

Everything runs 100% locally on your Windows laptop. No paid APIs, no external services.

---

## 1. Folder Structure

```
digital-twin/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── database.py             # SQLite connection setup
│   │   ├── models.py               # Database tables (SQLAlchemy)
│   │   ├── schemas.py              # Request/response validation
│   │   ├── auth.py                 # Password hashing + JWT
│   │   ├── seed_questions.py       # Quiz question bank (72 questions)
│   │   ├── ml/
│   │   │   ├── prediction.py       # Performance prediction logic
│   │   │   └── learning_style.py   # Learning style quiz + scoring
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── subjects_router.py
│   │       ├── learning_style_router.py
│   │       ├── quiz_router.py
│   │       ├── study_plan_router.py
│   │       └── dashboard_router.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/                  # Landing, Login, Register, Dashboard, etc.
    │   ├── components/             # Sidebar layout, shared UI pieces
    │   ├── context/AuthContext.jsx # Global login state
    │   └── api/client.js           # Axios API wrapper
    ├── package.json
    └── vite.config.js
```

The SQLite database file (`digital_twin.db`) is created automatically the first time you run the backend, inside the `backend/` folder. Your data (accounts, marks, quiz history, study plans) is saved there permanently, even after you close VS Code or restart your laptop.

---

## 2. Prerequisites (install these once)

1. **Python 3.10+** — download from https://www.python.org/downloads/ (tick "Add Python to PATH" during install)
2. **Node.js 18+** — download from https://nodejs.org/ (choose the LTS version)
3. **VS Code** — https://code.visualstudio.com/

Verify both are installed by opening a terminal (PowerShell) and running:
```powershell
python --version
node --version
```
Both should print a version number.

---

## 3. First-Time Setup

Open the `digital-twin` folder in VS Code (`File → Open Folder...`).

Open a terminal in VS Code: `Terminal → New Terminal`. You'll run two terminals — one for the backend, one for the frontend. You can open a second terminal with the `+` icon in the terminal panel.

### Terminal 1 — Backend setup

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

You should see `(venv)` appear at the start of your terminal prompt — that means the virtual environment is active.

### Terminal 2 — Frontend setup

```powershell
cd frontend
npm install
```

This downloads all the frontend libraries (React, Tailwind, Recharts, etc.). It may take a minute or two.

---

## 4. Running the Project (every time you want to use it)

### Terminal 1 — Start the backend
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```
You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```
Leave this terminal running. You can test the API directly by visiting **http://127.0.0.1:8000/docs** in your browser — this shows an interactive API explorer (built into FastAPI automatically).

### Terminal 2 — Start the frontend
```powershell
cd frontend
npm run dev
```
You should see:
```
Local:   http://localhost:5173/
```

Now open **http://localhost:5173** in your browser. That's your app.

**Both terminals must stay running at the same time** — the frontend calls the backend at `http://127.0.0.1:8000`.

---

## 5. Using the App — Suggested Test Workflow

1. Open http://localhost:5173 → click **Get Started** → **Register** a new account.
2. You're logged in automatically and land on the **Dashboard**.
3. Go to **Learning Style** → answer all 12 questions → see your result and tips.
4. Go to **Subjects** → click **Add Subject** → add DBMS, Computer Networks, Artificial Intelligence, Cloud Computing, Compiler Design (enter Internal/Assignment/Mid/Current marks, and optionally Previous Semester % for a trend).
5. After adding a couple of subjects, scroll down on the **Subjects** page to see the **Academic Performance Prediction**, charts, and **Subjects That Need Improvement**.
6. Go to **Quiz** → pick a subject → answer the questions → **Submit Quiz** → review your score and explanations.
7. Go to **Study Planner** → click **Generate Study Plan** → check off tasks as you complete them.
8. Go to **Digital Twin** → see everything combined into one profile.
9. Go to **Profile** → click **Edit** → update your study preferences → **Save**.
10. Click **Logout**, then **Login** again with the same email/roll number and password — all your data will still be there (it's saved in the SQLite database file).

---

## 6. How the Prediction Works (for your viva/demo)

The prediction is intentionally **simple and explainable** rather than a black-box model, as required:

- **Current percentage** = sum of your entered Internal + Assignment + Mid Exam + Current marks, divided by the subject's total marks.
- **If you have Previous Semester marks**, the app computes a **weighted average**: 60% weight on your current performance, 40% on your previous performance — favoring recent performance while still respecting history.
- The predicted next-assessment score adds a small extrapolation of the trend (current − previous), scaled down, so the app never overstates confidence.
- **If you have no previous marks**, the app does not invent a prediction — it clearly shows *"More academic data is needed for a reliable prediction."*
- **Improvement priority** (High/Medium/Low) is a simple rule: below 50% is High priority, 50–65% is Medium, above that is Low (adjusted if the subject is declining).

All of this logic lives in `backend/app/ml/prediction.py` — it's plain Python, easy to read and explain to your evaluator.

---

## 7. Common Errors and Fixes

**"uvicorn: command not found" / "uvicorn is not recognized"**
→ Your virtual environment isn't active. Run `venv\Scripts\activate` first (you should see `(venv)` in the prompt), then try again.

**"npm: command not found"**
→ Node.js isn't installed or wasn't added to PATH. Reinstall Node.js from nodejs.org and restart VS Code.

**Frontend loads but shows "Network Error" or nothing loads on pages**
→ The backend isn't running. Make sure Terminal 1 shows `Uvicorn running on http://127.0.0.1:8000` with no errors.

**"Port 8000 already in use"**
→ Another program is using that port. Close other terminals running uvicorn, or run `uvicorn app.main:app --reload --port 8001` and update `API_BASE_URL` in `frontend/src/api/client.js` to match.

**"Port 5173 already in use"**
→ Close any other `npm run dev` terminals, or Vite will automatically offer the next free port (e.g. 5174) — just use whichever URL it prints.

**Registration fails with "An account with this email or roll number already exists"**
→ You already registered with that email/roll number. Use different values, or delete `backend/digital_twin.db` to reset the entire database (⚠️ this erases all saved data).

**Marks won't save / "cannot exceed" error**
→ Marks have maximums: Internal (20), Assignment (10), Mid Exam (20), Current (50), Previous %/Attendance (100). Adjust the number and try again.

**I want to start completely fresh**
→ Stop the backend, delete `backend/digital_twin.db`, then start the backend again — a brand-new empty database will be created automatically.

---

## 8. Notes on the Tech Choices

- **FastAPI** was chosen over Flask because it gives you free interactive API docs (`/docs`), automatic request validation, and is very beginner-friendly with clear error messages.
- **SQLite** needs no separate database server — it's just a file (`digital_twin.db`), perfect for a college project you'll demo on your own laptop.
- **React + Vite** gives fast reloads while you're developing, and Tailwind CSS keeps the styling consistent and quick to adjust.
- **Recharts** renders the bar/line charts using real data from your database — nothing is hardcoded.
- No paid AI APIs are used anywhere. The "AI" in this project is the explainable rule-based/statistical prediction and recommendation logic described above — appropriate for a project you need to explain and defend yourself.

Good luck with your submission!
