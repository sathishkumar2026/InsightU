# InsightU

Explainable AI-Powered Student Performance Consistency & Early Intervention SaaS Platform.

## Structure
- `backend/` FastAPI + ML inference + MySQL schema
- `frontend/` Next.js animated SaaS UI
- `ml/` model training scripts
- `data/` sample CSVs
- `docs/` documentation

## Backend

1. Create a virtual environment and install dependencies:

```
pip install -r backend/requirements.txt
```

2. Configure DB in `backend/app/config.py` (MySQL).

3. Initialize tables and seed data:

```
python -m app.db.init_db
python -m app.db.seed
```

4. Run API:

```
uvicorn app.main:app --reload --app-dir backend
```

## Frontend

```
cd frontend
npm install
npm run dev
```

## API Endpoints (core)
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/students`
- `POST /api/v1/records/academic`
- `POST /api/v1/records/behavioral`
- `POST /api/v1/predictions/run`
- `GET /api/v1/predictions/{student_id}`
- `GET /api/v1/explanations/{prediction_id}`
- `GET /api/v1/interventions/{student_id}`

## Notes
Explainability uses model-native coefficients and decision-tree paths. No black-box deep learning.
