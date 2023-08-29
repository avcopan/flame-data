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
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    ),
    timeout=120,
)


def with_pool_cursor_starter(func: Callable) -> Callable:
    """A decorator to place a function in a contet with a cursor connected to the pool

    :param func: A function, whose first argument takes in the cursor
    :type func: Callable
    :return: A copy of the function, with cursor passed in
    :rtype: Callable
    """

    def func_with_cursor_starter(*args, **kwargs):
        with pool.connection() as connection:

            def start_cursor_():
                return connection.cursor(row_factory=psycopg.rows.dict_row)

            return func(start_cursor_, *args, **kwargs)

    return func_with_cursor_starter


if __name__ == "__main__":

    @with_pool_cursor_starter
    def select_star(cursor):
        cursor.execute("SELECT * FROM users;")
        print(cursor.fetchall())

    select_star()
