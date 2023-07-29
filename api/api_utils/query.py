from api_utils.db import database_connection

conn = database_connection()


def get_user(id: int, return_password: bool = False) -> dict:
    """Look up a user by ID

    :param id: The user's ID
    :type id: int
    :param return_password: Return password with user data?, defaults to False
    :type return_password: bool, optional
    :return: The user data; keys: "id", "email"
    :rtype: dict
    """
    query_string = """
        SELECT * FROM users WHERE id = %s;
    """
    query_params = [id]

    user = None
    with conn.cursor() as curs:
        curs.execute(query_string, query_params)
        user = curs.fetchone()
        if user and not return_password:
            user.pop("password")

    return user


def get_user_by_email(email: str, return_password: bool = False):
    """Look up a user by email

    :param email: The user's email
    :type email: str
    :param return_password: Return password with user data?, defaults to False
    :type return_password: bool, optional
    :return: The user data; keys: "id", "email", "password"
    :rtype: dict
    """
    query_string = """
        SELECT * FROM users WHERE email = %s;
    """
    query_params = [email]

    user = None
    with conn.cursor() as curs:
        curs.execute(query_string, query_params)
        user = curs.fetchone()
        if user and not return_password:
            user.pop("password")

    return user


def add_user(email: str, password: str, return_password: bool = False):
    """Add a new user, returning the user's data with their assigned ID

    :param email: The user's email
    :type email: str
    :param password: The user's password
    :type password: str
    :param return_password: Return password with user data?, defaults to False
    :type return_password: bool, optional
    :return: The user data; keys: "id", "email", "password"
    :rtype: dict
    """
    query_string = """
        INSERT INTO users (email, password) VALUES (%s, %s)
        RETURNING *;
    """
    query_params = [email, password]

    user = None
    with conn.cursor() as curs:
        curs.execute(query_string, query_params)
        user = curs.fetchone()
        if user and not return_password:
            user.pop("password")

    return user


if __name__ == "__main__":
    print(add_user("bob@gmail.com", "BOB"))
    print(get_user_by_email("bob@gmail.com"))
