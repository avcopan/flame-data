from typing import List

import automol

from flame_data_api import chem
from flame_data_api.db import with_pool_cursor


# USER TABLE
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

    Automatically creates a new collection for the user

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
    user_row = cursor.fetchone()
    if user_row and not return_password:
        user_row.pop("password")

    return user_row


# SPECIES TABLES
@with_pool_cursor
def get_species_connectivities(
    cursor, fml_str: str = None, is_partial: bool = False
) -> List[dict]:
    """Get connectivity species grouped by formula

    Optionally, search for species matching a particular formula

    :param fml_str: A formula string to search for, defaults to None
    :type fml: str, optional
    :param is_partial: Whether the formula is partial, defaults to False
    :type is_partial: bool, optional
    :return: Connectivity species information
    :rtype: List[dict]
    """
    query_string = """
        SELECT * FROM species_connectivity
    """
    query_params = []

    # Add formula matching to query string, if requested
    if fml_str is not None:
        fml_str = fml_str.upper()

        if not is_partial:
            query_string += "WHERE formula = %s"
            query_params = [fml_str]
        else:
            fml = automol.formula.from_string(fml_str)
            query_string += "WHERE " + " AND ".join(["formula ~ %s"] * len(fml))
            query_params = [
                f"(?!\d){symb}{count}(?!\d)" if count > 1 else f"(?!\d){symb}(?!\d)"
                for symb, count in fml.items()
            ]

    query_string += ";"

    cursor.execute(query_string, query_params)
    species_conns = cursor.fetchall()

    if species_conns:
        # Sort the species by formula
        # 1. Generate sorting information
        fmls = [automol.formula.from_string(row["formula"]) for row in species_conns]
        symbs = automol.formula.sorted_symbols_in_sequence(fmls)
        counts = [automol.formula.heavy_atom_count(f) for f in fmls]
        srt_vecs = [automol.formula.sort_vector(f, symbs) for f in fmls]
        # 2. Do the sorting
        species_conns = [
            row
            for _, _, row in sorted(
                zip(counts, srt_vecs, species_conns), key=lambda x: x[:-1]
            )
        ]

    return species_conns


@with_pool_cursor
def get_species_connectivity_by_smiles(cursor, smi: str) -> dict:
    """Add a new species using its SMILES string, returning the connectivity ID

    :param smi: SMILES string
    :type smi: str
    :return: The row of the species connectivity
    :rtype: dict
    """
    query_string = """
        SELECT * FROM species_connectivity
        WHERE conn_inchi_hash = %s;
    """
    query_params = [chem.connectivity_inchi_hash_from_smiles(smi)]
    cursor.execute(query_string, query_params)
    query_result = cursor.fetchone()
    return query_result


@with_pool_cursor
def add_species_by_smiles(cursor, smi: str) -> int:
    """Add a new species using its SMILES string, returning the connectivity ID

    :param smi: SMILES string
    :type smi: str
    :return: The connectivity ID of the species
    :rtype: int
    """
    conn_row = chem.species_connectivity_row(smi)
    estate_row = chem.species_estate_row(smi)
    detail_rows = chem.species_rows(smi)

    # INSERT INTO species_connectivity
    query_string1 = """
        INSERT INTO species_connectivity
        (formula, svg_string, conn_smiles, conn_inchi, conn_inchi_hash, conn_amchi,
        conn_amchi_hash)
        VALUES
        (%(formula)s, %(svg_string)s, %(conn_smiles)s, %(conn_inchi)s,
        %(conn_inchi_hash)s, %(conn_amchi)s,
        %(conn_amchi_hash)s)
        RETURNING id;
    """
    query_params1 = conn_row
    cursor.execute(query_string1, query_params1)
    query_result1 = cursor.fetchone()

    # INSERT INTO species_estate
    query_string2 = """
        INSERT INTO species_estate
        (spin_mult, conn_id)
        VALUES
        (%(spin_mult)s, %(id)s)
        RETURNING id;
    """
    query_params2 = {**query_result1, **estate_row}
    cursor.execute(query_string2, query_params2)
    query_result2 = cursor.fetchone()

    # INSERT INTO species
    query_string3 = """
        INSERT INTO species
        (geometry, smiles, inchi, amchi, amchi_key, estate_id)
        VALUES
        (%(geometry)s, %(smiles)s, %(inchi)s, %(amchi)s, %(amchi_key)s, %(id)s)
    """
    query_params3 = [{**query_result2, **stereo_row} for stereo_row in detail_rows]
    cursor.executemany(query_string3, query_params3)

    return query_result1["id"]


@with_pool_cursor
def get_species_by_connectivity_id(cursor, id: int) -> List[dict]:
    """Get all species with a certain connectivity ID

    :param id: The ID of the connectivity species
    :type id: int
    :return: Details for each isomer, as a list of dictionaries; keys:
        id, conn_id, estate_id, formula, svg_string, conn_smiles, conn_inchi,
        conn_amchi, spin_mult, smiles, inchi, amchi, geometry
    :rtype: List[dict]
    """
    query_string = """
        SELECT
            species.id, conn_id, estate_id, formula, svg_string, conn_smiles, conn_inchi,
            conn_amchi, spin_mult, smiles, inchi, amchi, geometry
        FROM species_connectivity
        JOIN species_estate ON species_connectivity.id = species_estate.conn_id
        JOIN species ON species_estate.id = species.estate_id
        WHERE species_connectivity.id = %s;
    """
    query_params = [id]
    cursor.execute(query_string, query_params)
    species_rows = cursor.fetchall()
    return species_rows


def get_species_ids_by_connectivity_id(id: int) -> List[int]:
    """Get all species IDs with a certain connectivity ID

    :param id: The ID of the connectivity species
    :type id: int
    :return: The IDs for each species with this connectivity
    :rtype: List[int]
    """
    species_rows = get_species_by_connectivity_id(id)
    ids = [row["id"] for row in species_rows]
    return ids


@with_pool_cursor
def get_species(cursor, id: int) -> dict:
    """Get one species by ID

    :param id: The ID of the connectivity species
    :type id: int
    :return: The table row for this species, as a dictionary
    :rtype: dict
    """
    query_string = """
        SELECT * FROM species WHERE id = %s;
    """
    query_params = [id]
    cursor.execute(query_string, query_params)
    species_row = cursor.fetchone()
    return species_row


@with_pool_cursor
def delete_species_connectivity(cursor, id: int) -> (int, str):
    """Delete one species connectivity

    :param id: The ID of the species connectivity
    :type id: int
    :returns: A status code and an error message, if it failed
    :rtype: str
    """
    query_string = """
        DELETE FROM species_connectivity WHERE id = %s;
    """
    query_params = [id]
    cursor.execute(query_string, query_params)

    if not bool(cursor.rowcount):
        return 404, f"No resource with ID {id} was found."

    return 0, ""


@with_pool_cursor
def update_species_geometry(cursor, id: int, xyz_str: str) -> bool:
    """Delete one connectivity species

    :param id: The ID of the species
    :type id: int
    :param xyz_str: The new xyz string for the geometry
    :type xyz_str: str
    :returns: Whether or not the update succeeded
    :rtype: bool
    """
    species_row = get_species(id)
    if not species_row:
        return 404, f"No resource with ID {id} was found."

    ach = species_row["amchi"]
    ret = chem.validate_species_geometry(ach, xyz_str)
    if ret is None:
        return 415, f"Invalid xyz string for species {ach}:\n{xyz_str}"

    xyz_str = ret

    query_string = """
        UPDATE species SET geometry = %s WHERE id = %s;
    """
    query_params = [xyz_str, id]
    cursor.execute(query_string, query_params)

    return 0, ""


# COLLECTIONS TABLES
@with_pool_cursor
def get_user_collections(cursor, user_id: int) -> List[dict]:
    """Get the collections associated with a user

    :param user_id: The user's ID
    :type user_id: int
    :return: The collections rows associated with this user
    :rtype: List[dict]
    """
    query_string = """
        SELECT * FROM collections WHERE user_id = %s;
    """
    query_params = [user_id]

    cursor.execute(query_string, query_params)
    coll_rows = cursor.fetchall()
    return coll_rows


@with_pool_cursor
def get_collection_species(cursor, coll_id: int) -> List[dict]:
    """Get all species in a collection

    :param coll_id: The collection ID
    :type coll_id: int
    :return: The rows associated with this species
    :rtype: List[dict]
    """
    query_string = """
        SELECT species_connectivity.*, ARRAY_AGG(species.id) AS species_ids FROM collections_species
        JOIN species ON species_id = species.id
        JOIN species_estate ON species.estate_id = species_estate.id
        JOIN species_connectivity ON species_estate.conn_id = species_connectivity.id
        WHERE collections_species.coll_id = %s
        GROUP BY species_connectivity.id;
    """
    query_params = [coll_id]

    cursor.execute(query_string, query_params)
    species_rows = cursor.fetchall()
    return species_rows


@with_pool_cursor
def add_user_collection(cursor, user_id: int, name: str) -> dict:
    """Add a new collection for a user with a specific name

    :param user_id: The user's ID
    :type user_id: int
    :param name: The collection name
    :type name: str
    :return: The collection data; keys: "id", "name", "user_id"
    :rtype: dict
    """
    query_string = """
        INSERT INTO collections (name, user_id) VALUES (%s, %s)
        RETURNING *;
    """
    query_params = [name, user_id]

    cursor.execute(query_string, query_params)
    coll_row = cursor.fetchone()
    return coll_row


@with_pool_cursor
def get_user_collection_by_name(cursor, user_id: int, name: str) -> dict:
    """Get a certain user collection by name

    :param user_id: The user's ID
    :type user_id: int
    :param name: The collection name
    :type name: str
    :return: The collection data; keys: "id", "name", "user_id"
    :rtype: dict
    """
    query_string = """
        SELECT * FROM collections WHERE (name, user_id) = (%s, %s);
    """
    query_params = [name, user_id]

    cursor.execute(query_string, query_params)
    coll_row = cursor.fetchone()
    return coll_row


@with_pool_cursor
def add_species_connectivity_to_collection(cursor, coll_id: int, conn_id: int):
    """Add all species of a given connectivity to a collection

    :param coll_id: The ID of the collection
    :type coll_id: int
    :param conn_id: The connectivity ID of the species
    :type conn_id: int
    """
    species_ids = get_species_ids_by_connectivity_id(conn_id)

    query_string = """
        INSERT INTO collections_species (coll_id, species_id)
        VALUES  (%s, %s) ON CONFLICT (coll_id, species_id) DO NOTHING;
    """
    query_params = [[coll_id, id] for id in species_ids]
    cursor.executemany(query_string, query_params)


@with_pool_cursor
def remove_species_connectivity_from_collection(cursor, coll_id: int, conn_id: int):
    """Remove all species of a given connectivity from a collection

    :param coll_id: The ID of the collection
    :type coll_id: int
    :param conn_id: The connectivity ID of the species
    :type conn_id: int
    """
    species_ids = get_species_ids_by_connectivity_id(conn_id)

    query_string = """
        DELETE FROM collections_species
        WHERE (coll_id, species_id) = (%s, %s);
    """
    query_params = [[coll_id, id] for id in species_ids]
    cursor.executemany(query_string, query_params)


@with_pool_cursor
def get_collection_name(cursor, coll_id: int) -> str:
    """Get the collections associated with a user

    :param coll_id: The collection ID
    :type coll_id: int

    :return: The collections rows associated with this user
    :rtype: List[dict]
    """
    query_string = """
        SELECT name FROM collections WHERE id = %s;
    """
    query_params = [coll_id]

    cursor.execute(query_string, query_params)
    coll_row = cursor.fetchone()

    if not coll_row or "name" not in coll_row:
        return None

    return coll_row["name"]


@with_pool_cursor
def get_collection_species_data(cursor, coll_id: int) -> List[dict]:
    """Get data for all species in a collection (no IDs included)

    :param coll_id: The collection ID
    :type coll_id: int
    :return: The rows associated with this species
    :rtype: List[dict]
    """
    query_string = """
        SELECT
            formula, conn_smiles, conn_inchi, conn_amchi, spin_mult, smiles, inchi,
            amchi, geometry
        FROM collections_species
        JOIN species ON species_id = species.id
        JOIN species_estate ON species.estate_id = species_estate.id
        JOIN species_connectivity ON species_estate.conn_id = species_connectivity.id
        WHERE collections_species.coll_id = %s;
    """
    query_params = [coll_id]

    cursor.execute(query_string, query_params)
    species_rows = cursor.fetchall()
    return species_rows


@with_pool_cursor
def delete_collection(cursor, coll_id: int) -> (int, str):
    """Delete one species connectivity

    :param coll_id: The ID of the species connectivity
    :type coll_id: int
    :returns: A status code and an error message, if it failed
    :rtype: str
    """
    query_string = """
        DELETE FROM collections WHERE id = %s;
    """
    query_params = [coll_id]
    cursor.execute(query_string, query_params)

    if not bool(cursor.rowcount):
        return 404, f"No resource with ID {coll_id} was found."

    return 0, ""


if __name__ == "__main__":
    print(get_collection_name(7))
