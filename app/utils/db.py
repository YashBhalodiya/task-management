import ssl
import pg8000.dbapi
from urllib.parse import urlparse
from flask import current_app, g

def get_db_conn():
    if "db_conn" not in g:
        db_url = current_app.config.get("DATABASE_URL")
        if not db_url:
            raise RuntimeError("DATABASE_URL is not configured in the application config.")
        
        parsed = urlparse(db_url)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        g.db_conn = pg8000.dbapi.connect(
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],
            ssl_context=ssl_context
        )
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
    cursor = conn.cursor()
    try:
        cursor.execute(query, params or ())
        row = cursor.fetchone()
        if not row:
            return None
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()

def query_all(query, params=None):
    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params or ())
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    finally:
        cursor.close()

def execute_write(query, params=None):
    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params or ())
        return cursor.rowcount
    finally:
        cursor.close()

def execute_write_returning(query, params=None):
    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params or ())
        row = cursor.fetchone()
        if not row:
            return None
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()

def init_db(app):
    app.teardown_appcontext(close_db_conn)
