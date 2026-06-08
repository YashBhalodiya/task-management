import psycopg2
from psycopg2.extras import RealDictCursor
from flask import current_app, g

def get_db_conn():
    if "db_conn" not in g:
        db_url = current_app.config.get("DATABASE_URL")
        if not db_url:
            raise RuntimeError("DATABASE_URL is not configured in the application config.")
        g.db_conn = psycopg2.connect(db_url)
        
    return g.db_conn

def close_db_conn(exception=None):
    db_conn = g.pop("db_conn", None)
    if db_conn is not None:
        try:
            if exception:
                db_conn.rollback()
            else:
                db_conn.commit()
        except Exception:
            pass
        finally:
            db_conn.close()

def query_one(query, params=None):
    conn = get_db_conn()
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchone()

def query_all(query, params=None):
    conn = get_db_conn()
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchall()

def execute_write(query, params=None):
    conn = get_db_conn()
    with conn.cursor() as cursor:
        cursor.execute(query, params or ())
        return cursor.rowcount

def execute_write_returning(query, params=None):
    conn = get_db_conn()
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchone()

def init_db(app):
    app.teardown_appcontext(close_db_conn)
