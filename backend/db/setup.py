import os
import ssl
import pg8000.dbapi
from urllib.parse import urlparse
from dotenv import load_dotenv

def setup_database():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is not set.")
        return

    print("Connecting to Supabase PostgreSQL database...")
    try:
        parsed = urlparse(db_url)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        conn = pg8000.dbapi.connect(
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],
            ssl_context=ssl_context
        )
        conn.autocommit = True
        cursor = conn.cursor()
        try:
            schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
            with open(schema_path, "r") as schema_file:
                schema_sql = schema_file.read()
            
            print("Running schema.sql...")
            cursor.execute(schema_sql)
            print("Database tables created successfully!")
        finally:
            cursor.close()
            
    except Exception as e:
        print(f"Failed to set up database: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    setup_database()
