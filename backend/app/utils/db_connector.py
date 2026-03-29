"""
Utility for connecting to external college databases and importing records.
Supports MySQL, PostgreSQL, and SQLite.
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError
import pandas as pd


SUPPORTED_DRIVERS = {
    "mysql": "mysql+pymysql",
    "postgresql": "postgresql+psycopg2",
    "sqlite": "sqlite",
}


def build_url(db_type: str, host: str, port: int, database: str, username: str, password: str) -> str:
    driver = SUPPORTED_DRIVERS.get(db_type)
    if not driver:
        raise ValueError(f"Unsupported database type: {db_type}. Supported: {list(SUPPORTED_DRIVERS.keys())}")
    if db_type == "sqlite":
        return f"sqlite:///{database}"
    return f"{driver}://{username}:{password}@{host}:{port}/{database}"


def test_connection(connection_url: str) -> dict:
    """Test a DB connection and return table names."""
    try:
        engine = create_engine(connection_url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        engine.dispose()
        return {"success": True, "tables": tables, "error": None}
    except OperationalError as e:
        return {"success": False, "tables": [], "error": str(e)[:300]}
    except Exception as e:
        return {"success": False, "tables": [], "error": str(e)[:300]}


def get_table_columns(connection_url: str, table_name: str) -> list[str]:
    """Return column names for a given table."""
    engine = create_engine(connection_url)
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    engine.dispose()
    return columns


def fetch_table(connection_url: str, table_name: str, limit: int = 10000) -> pd.DataFrame:
    """Read a table into a DataFrame."""
    engine = create_engine(connection_url)
    df = pd.read_sql_table(table_name, engine)
    engine.dispose()
    if len(df) > limit:
        df = df.head(limit)
    return df
