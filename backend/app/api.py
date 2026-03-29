from fastapi import APIRouter
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.students.router import router as students_router
from app.records.router import router as records_router
from app.predictions.router import router as predictions_router
from app.explanations.router import router as explanations_router
from app.interventions.router import router as interventions_router
from app.analytics.router import router as analytics_router
from app.notifications.router import router as notifications_router
from app.chatbot.router import router as chatbot_router
from app.materials.router import router as materials_router
from app.assignments.router import router as assignments_router

api_router = APIRouter()

api_router.include_router(auth_router, tags=["auth"], prefix="/auth")
api_router.include_router(users_router, tags=["users"], prefix="/users")
api_router.include_router(students_router, tags=["students"], prefix="/students")
api_router.include_router(records_router, tags=["records"], prefix="/records")
api_router.include_router(predictions_router, tags=["predictions"], prefix="/predictions")
api_router.include_router(explanations_router, tags=["explanations"], prefix="/explanations")
api_router.include_router(interventions_router, tags=["interventions"], prefix="/interventions")
api_router.include_router(analytics_router, tags=["analytics"], prefix="/analytics")
api_router.include_router(notifications_router, tags=["alerts"], prefix="/alerts")
api_router.include_router(chatbot_router, tags=["chatbot"], prefix="/chatbot")
api_router.include_router(materials_router, tags=["materials"], prefix="/materials")
api_router.include_router(assignments_router, tags=["assignments"], prefix="/assignments")


