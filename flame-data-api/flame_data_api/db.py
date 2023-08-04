import os
from typing import Callable

import dotenv
import psycopg
import psycopg_pool

dotenv.load_dotenv()


pool = psycopg_pool.ConnectionPool(
    psycopg.conninfo.make_conninfo(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host="localhost",
        port="5432",
    ),
)


def with_pool_cursor(func: Callable) -> Callable:
    """A decorator to place a function in a contet with a cursor connected to the pool

    Args:
        func (Callable): The function

    Returns:
        Callable: The function with `cursor` passed in to the first argument
    """
    def func_with_cursor(*args, **kwargs):
        with pool.connection() as connection:
            with connection.cursor(row_factory=psycopg.rows.dict_row) as cursor:
                return func(cursor, *args, **kwargs)

    return func_with_cursor


if __name__ == "__main__":

    @with_pool_cursor
    def select_star(cursor):
        cursor.execute("SELECT * FROM users;")
        print(cursor.fetchall())

    select_star()
