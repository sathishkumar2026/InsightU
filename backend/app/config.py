import os
from pydantic_settings import BaseSettings

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DB_PATH = os.path.join(_BACKEND_DIR, "consist_iq.db")


class Settings(BaseSettings):
    app_name: str = "InsightU"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "CHANGE_ME"
    access_token_expire_minutes: int = 60
    db_url: str = f"sqlite:///{_DB_PATH}"
    admin_setup_key: str = "ADMINS-FIRST-LOGIN"


settings = Settings()
