from typing import List
from flame_data_api.db import with_pool_cursor
from flame_data_api import chem


# User table
@with_pool_cursor
def get_user(cursor, id: int, return_password: bool = False) -> dict:
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

    cursor.execute(query_string, query_params)
    user = cursor.fetchone()
    if user and not return_password:
        user.pop("password")

    return user


@with_pool_cursor
def get_user_by_email(cursor, email: str, return_password: bool = False) -> dict:
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

    cursor.execute(query_string, query_params)
    user = cursor.fetchone()
    if user and not return_password:
        user.pop("password")

    return user


@with_pool_cursor
def add_user(cursor, email: str, password: str, return_password: bool = False) -> dict:
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

    cursor.execute(query_string, query_params)
    user = cursor.fetchone()
    if user and not return_password:
        user.pop("password")

    return user


# Species connectivity table
@with_pool_cursor
def identify_missing_species_by_smiles(cursor, smis: List[str]) -> List[str]:
    """Identify species that are missing from the database, from a list of SMILES

    :param smis: SMILES strings
    :type smis: List[str]
    :returns: The missing SMILES strings
    :rtype: List[str]
    """
    hashes = list(map(chem.connectivity_inchi_hash_from_smiles, smis))

    # Look up which of these hashes are already present
    query_string = """
        SELECT conn_inchi_hash FROM species_connectivity
        WHERE conn_inchi_hash = ANY(%s);
    """
    query_params = [hashes]
    cursor.execute(query_string, query_params)
    query_results = cursor.fetchall()
    existing_hashes = [row["conn_inchi_hash"] for row in query_results]

    # Return missing species from the SMILES list
    missing_smis = tuple(
        s for i, s in enumerate(smis) if hashes[i] not in existing_hashes
    )
    return missing_smis


@with_pool_cursor
def add_species_by_smiles(cursor, smi: str):
    """Add a new species using its SMILES string

    :param smi: SMILES string
    :type smi: str
    """
    conn_row = chem.species_connectivity_row(smi)
    estate_row = chem.species_estate_row(smi)
    stereo_rows = chem.species_stereo_rows(smi)

    # INSERT INTO species_connectivity
    query_string1 = """
        INSERT INTO species_connectivity
        (formula, conn_smiles, conn_inchi, conn_inchi_hash, conn_amchi, conn_amchi_hash)
        VALUES
        (%(formula)s, %(conn_smiles)s, %(conn_inchi)s, %(conn_inchi_hash)s, %(conn_amchi)s,
        %(conn_amchi_hash)s)
        RETURNING conn_id;
    """
    query_params1 = conn_row
    cursor.execute(query_string1, query_params1)
    query_result1 = cursor.fetchone()

    # INSERT INTO species_estate
    query_string2 = """
        INSERT INTO species_estate
        (spin_mult, conn_id)
        VALUES
        (%(spin_mult)s, %(conn_id)s)
        RETURNING estate_id;
    """
    query_params2 = {**query_result1, **estate_row}
    cursor.execute(query_string2, query_params2)
    query_result2 = cursor.fetchone()
    print("query_result2:", query_result2)

    # INSERT INTO species_stereo
    query_string3 = """
        INSERT INTO species_stereo
        (geometry, smiles, inchi, amchi, amchi_key, estate_id)
        VALUES
        (%(geometry)s, %(smiles)s, %(inchi)s, %(amchi)s, %(amchi_key)s, %(estate_id)s)
    """
    query_params3 = [{**query_result2, **stereo_row} for stereo_row in stereo_rows]
    cursor.executemany(query_string3, query_params3)


if __name__ == "__main__":
    smiles_list = [
        "C",
        "[CH3]",
        "CO[O]",
        "CC",
        "C[CH2]",
        "CCO[O]",
        "CCCO[O]",
        "CC(O[O])C",
    ]
    # add_species_by_smiles(smiles_list[2])
    print(identify_missing_species_by_smiles(smiles_list))
