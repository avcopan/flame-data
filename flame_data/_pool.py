import os

import dotenv
import psycopg
import psycopg_pool

dotenv.load_dotenv()


pool = psycopg_pool.ConnectionPool(
    psycopg.conninfo.make_conninfo(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
    ),
)


def pg_connection():
    """Ensure a connection from the pool and return its context manager

    :return: The connection context manager
    """
    pool.check()
    return pool.connection()


def pg_cursor(conn):
    """Get a cursor for submitting queries

    :param conn: The connection context
    :return: The cursor
    """
    return conn.cursor(row_factory=psycopg.rows.dict_row)
