import os
import psycopg2
from dotenv import load_dotenv

def setup_database():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is not set.")
        return

    print("Connecting to Supabase PostgreSQL database...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        with conn.cursor() as cursor:
            schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
            with open(schema_path, "r") as schema_file:
                schema_sql = schema_file.read()
            
            print("Running schema.sql...")
            cursor.execute(schema_sql)
            print("Database tables created successfully!")
            
    except Exception as e:
        print(f"Failed to set up database: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    setup_database()
