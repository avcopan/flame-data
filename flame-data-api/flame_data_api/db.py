import os
import dotenv
import psycopg

dotenv.load_dotenv()


def database_connection():
    conn = psycopg.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host="localhost",
        port="5432",
        row_factory=psycopg.rows.dict_row,
    )
    conn.autocommit = True
    return conn


if __name__ == "__main__":
    conn = database_connection()
    with conn.cursor() as curs:
        curs.execute("SELECT * FROM users;")
        print(curs.fetchall())
