from typing import List, Tuple, Union

import automol

from flame_data_api import chem
from flame_data_api.db import with_pool_cursor
from flame_data_api.utils import row_with_array_literals


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
def lookup_user(cursor, email: str, return_password: bool = False) -> dict:
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
def search_species_connectivities(
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


def lookup_species_connectivity(
    key: str, key_type: str = "smiles", id_only: bool = False
) -> Union[dict, int]:
    """Look up a species connectivity using some identifying key

    :param key: The identifying key by which to look it up
    :type key: str
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
    :return: The row or ID
    :rtype: Union[dict, int]
    """
    (ret,) = lookup_species_connectivities((key,), key_type=key_type, id_only=id_only)
    return ret


@with_pool_cursor
def lookup_species_connectivities(
    cursor, keys: List[str], key_type: str = "smiles", id_only: bool = False
) -> Union[List[dict], List[int]]:
    """Look up a species connectivity using some identifying key

    :param keys: The identifying keys by which to look them up
    :type keys: List[str]
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
    :return: The row of the species connectivity
    :rtype: Union[List[dict], List[int]]
    """
    hashes, (is_amchi, *_) = zip(
        *(chem.species_connectivity_chi_hash(k, key_type) for k in keys)
    )

    query_string = f"""
        SELECT * FROM species_connectivity
        WHERE {'conn_amchi_hash' if is_amchi else 'conn_inchi_hash'} = %s;
    """
    query_params = [[h] for h in hashes]
    cursor.executemany(query_string, query_params, returning=True)
    query_results = results_from_executemany(cursor, id_only=id_only)
    return query_results


def lookup_reaction_connectivity(
    key: Union[str, Tuple[str, str]], key_type: str = "smiles", id_only: bool = False
) -> Union[dict, int]:
    """Look up a reaction connectivity using some identifying key

    :param key: The identifying key; If not a SMILES reaction string, this must be a
        pair of string identifiers, one for reactants and one for products
    :type key: Union[str, Tuple[str, str]]
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
    :return: The row of the reaction connectivity
    :rtype: dict
    """
    (ret,) = lookup_reaction_connectivities((key,), key_type=key_type, id_only=id_only)
    return ret


@with_pool_cursor
def lookup_reaction_connectivities(
    cursor,
    keys: List[Union[str, Tuple[str, str]]],
    key_type: str = "smiles",
    id_only: bool = False,
) -> Union[List[dict], List[int]]:
    """Look up a reaction connectivities using some identifying keys

    :param keys: The identifying keys; If not a SMILES reaction string, this must be a
        pair of string identifiers, one for reactants and one for products
    :type keys: List[Union[str, Tuple[str, str]]]
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
    :return: The rows of the reaction connectivity
    :rtype: Union[List[dict], List[int]]
    """
    hash_pairs, (is_amchi, *_) = zip(
        *(chem.reaction_connectivity_chi_hashes(k, key_type) for k in keys)
    )

    query_string = f"""
        SELECT * FROM reaction_connectivity
        WHERE
            {'r_conn_amchi_hash' if is_amchi else 'r_conn_inchi_hash'} = %s AND
            {'p_conn_amchi_hash' if is_amchi else 'p_conn_inchi_hash'} = %s;
    """
    query_params = [h for h in hash_pairs]
    cursor.executemany(query_string, query_params, returning=True)
    query_results = results_from_executemany(cursor, id_only=id_only)
    return query_results


@with_pool_cursor
def lookup_species(
    cursor, keys: str, key_type: str = "smiles", id_only: bool = False
) -> dict:
    """Look up a species connectivity using some identifying key

    :param keys: The identifying keys by which to look them up
    :type keys: str
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
    :return: The row of the species connectivity
    :rtype: dict
    """
    chi_keys = [chem.species_amchi_key(k, key_type) for k in keys]

    query_string = """
        SELECT * FROM species
        WHERE amchi_key = %s;
    """
    query_params = [[c] for c in chi_keys]
    cursor.executemany(query_string, query_params, returning=True)
    query_results = results_from_executemany(cursor, id_only=id_only)
    return query_results


def add_species_by_smiles_connectivity(smi: str) -> Tuple[int, str]:
    """Add a new species using its SMILES string, returning the connectivity ID

    :param smi: SMILES string
    :type smi: str
    :returns: A status code and an error message, if it failed
    :rtype: Tuple[int, str]
    """
    row = lookup_species_connectivity(smi, key_type="smiles")
    if not row:
        try:
            _add_species_by_smiles_connectivity(smi)
        except Exception as exc:
            return 500, f"Adding {smi} to database failed with this exception:\n{exc}"
    return 0, ""


@with_pool_cursor
def _add_species_by_smiles_connectivity(cursor, smi: str) -> int:
    """Add a new species using its SMILES string, returning the connectivity ID

    (Only for species that don't already exist!)

    :param smi: SMILES string
    :type smi: str
    :return: The connectivity ID of the species
    :rtype: int
    """
    conn_row = chem.species_connectivity_row(smi)
    estate_row = chem.species_estate_row(smi)
    spc_rows = chem.species_rows(smi)

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
    query_params3 = [{**query_result2, **spc_row} for spc_row in spc_rows]
    cursor.executemany(query_string3, query_params3)

    return query_result1["id"]


def add_reaction_by_smiles_connectivity(smi: str) -> Tuple[int, str]:
    """Add a new reaction using its SMILES string, returning the connectivity ID

    :param smi: SMILES string
    :type smi: str
    :returns: A status code and an error message, if it failed
    :rtype: Tuple[int, str]
    """
    if not automol.smiles.is_reaction(smi):
        return 415, f"Not a reaction SMILES string: {smi}"

    # 1. Add all reactant and product species in case they don't already exist
    rsmis = automol.smiles.reaction_reactants(smi)
    psmis = automol.smiles.reaction_products(smi)
    for smi_ in rsmis + psmis:
        add_species_by_smiles_connectivity(smi_)

    # 2. Add the reaction
    row = lookup_reaction_connectivity(smi, key_type="smiles")
    if not row:
        try:
            _add_reaction_by_smiles_connectivity(smi)
        except Exception as exc:
            return 500, f"Adding {smi} to database failed with this exception:\n{exc}"
    return 0, ""


@with_pool_cursor
def _add_reaction_by_smiles_connectivity(cursor, smi: str) -> int:
    """Add a new reaction using its SMILES string, returning the connectivity ID

    :param smi: SMILES string
    :type smi: str
    :return: The connectivity ID of the reaction
    :rtype: int
    """
    conn_row = chem.reaction_connectivity_row(smi)
    estate_row = chem.reaction_estate_row(smi)
    rxn_rows, ts_grouped_rows = chem.reaction_and_ts_rows(smi)

    # Determine the connectivity IDs of the reactants and products
    rhashes = conn_row["r_conn_inchi_hashes"]
    phashes = conn_row["p_conn_inchi_hashes"]
    r_conn_ids = lookup_species_connectivities(rhashes, "inchi_hash", id_only=True)
    p_conn_ids = lookup_species_connectivities(phashes, "inchi_hash", id_only=True)
    assert all(
        r_conn_ids
    ), "Add all reactants to database before calling this function!"
    assert all(p_conn_ids), "Add all products to database before calling this function!"

    # Add these connectivity IDs to the connectivity row
    conn_row["r_conn_ids"] = r_conn_ids
    conn_row["p_conn_ids"] = p_conn_ids

    # INSERT INTO reaction_connectivity
    query_string1 = """
        INSERT INTO reaction_connectivity
        (
            formula,
            conn_smiles,
            r_formulas,
            r_svg_strings,
            r_conn_inchis,
            r_conn_inchi_hashes,
            r_conn_inchi,
            r_conn_inchi_hash,
            r_conn_amchis,
            r_conn_amchi_hashes,
            r_conn_amchi,
            r_conn_amchi_hash,
            r_conn_ids,
            p_formulas,
            p_svg_strings,
            p_conn_inchis,
            p_conn_inchi_hashes,
            p_conn_inchi,
            p_conn_inchi_hash,
            p_conn_amchis,
            p_conn_amchi_hashes,
            p_conn_amchi,
            p_conn_amchi_hash,
            p_conn_ids
        )
        VALUES
        (
            %(formula)s,
            %(conn_smiles)s,
            %(r_formulas)s,
            %(r_svg_strings)s,
            %(r_conn_inchis)s,
            %(r_conn_inchi_hashes)s,
            %(r_conn_inchi)s,
            %(r_conn_inchi_hash)s,
            %(r_conn_amchis)s,
            %(r_conn_amchi_hashes)s,
            %(r_conn_amchi)s,
            %(r_conn_amchi_hash)s,
            %(r_conn_ids)s,
            %(p_formulas)s,
            %(p_svg_strings)s,
            %(p_conn_inchis)s,
            %(p_conn_inchi_hashes)s,
            %(p_conn_inchi)s,
            %(p_conn_inchi_hash)s,
            %(p_conn_amchis)s,
            %(p_conn_amchi_hashes)s,
            %(p_conn_amchi)s,
            %(p_conn_amchi_hash)s,
            %(p_conn_ids)s
        )
        RETURNING id;
    """
    query_params1 = row_with_array_literals(conn_row)
    cursor.execute(query_string1, query_params1)
    query_result1 = cursor.fetchone()

    # INSERT INTO reaction
    query_string2 = """
        INSERT INTO reaction
        (
            smiles,
            r_inchis,
            r_amchis,
            r_amchi_keys,
            r_amchi,
            r_amchi_key,
            p_inchis,
            p_amchis,
            p_amchi_keys,
            p_amchi,
            p_amchi_key,
            conn_id
        )
        VALUES
        (
            %(smiles)s,
            %(r_inchis)s,
            %(r_amchis)s,
            %(r_amchi_keys)s,
            %(r_amchi)s,
            %(r_amchi_key)s,
            %(p_inchis)s,
            %(p_amchis)s,
            %(p_amchi_keys)s,
            %(p_amchi)s,
            %(p_amchi_key)s,
            %(id)s
        )
        RETURNING id;
    """
    query_results2 = []
    query_params2 = [
        row_with_array_literals({**query_result1, **rxn_row}) for rxn_row in rxn_rows
    ]
    cursor.executemany(query_string2, query_params2, returning=True)
    query_results2 = results_from_executemany(cursor)

    # INSERT INTO reaction_estate
    query_string3 = """
        INSERT INTO reaction_estate (spin_mult, reaction_id)
        VALUES (%(spin_mult)s, %(id)s)
        RETURNING id;
    """
    query_params3 = [
        {**query_result2, **estate_row} for query_result2 in query_results2
    ]
    cursor.executemany(query_string3, query_params3, returning=True)
    query_results3 = results_from_executemany(cursor)

    # INSERT INTO reaction_ts
    assert len(query_results3) == len(ts_grouped_rows), "Sanity check"

    query_string4 = """
        INSERT INTO reaction_ts
        (geometry, class, amchi, amchi_key, estate_id)
        VALUES
        (%(geometry)s, %(class)s, %(amchi)s, %(amchi_key)s, %(id)s)
        RETURNING id;
    """
    query_params4 = [
        {**query_result3, **ts_row}
        for query_result3, ts_rows in zip(query_results3, ts_grouped_rows)
        for ts_row in ts_rows
    ]
    cursor.executemany(query_string4, query_params4, returning=True)
    query_results4 = results_from_executemany(cursor)

    # INSERT INTO reaction_reactants
    r_species_ids_lst = [
        lookup_species(r["r_amchi_keys"], key_type="amchi_key", id_only=True)
        for r in rxn_rows
    ]
    p_species_ids_lst = [
        lookup_species(r["p_amchi_keys"], key_type="amchi_key", id_only=True)
        for r in rxn_rows
    ]
    assert len(query_results2) == len(r_species_ids_lst), "Sanity check"
    assert len(query_results2) == len(p_species_ids_lst), "Sanity check"

    query_string5 = """
        INSERT INTO reaction_reactants (reaction_id, species_id)
        VALUES (%(id)s, %(species_id)s);
    """
    query_params5 = [
        {**query_result2, "species_id": species_id}
        for query_result2, species_ids in zip(query_results2, r_species_ids_lst)
        for species_id in species_ids
    ]
    cursor.executemany(query_string5, query_params5)

    query_string6 = """
        INSERT INTO reaction_products (reaction_id, species_id)
        VALUES (%(id)s, %(species_id)s);
    """
    query_params6 = [
        {**query_result2, "species_id": species_id}
        for query_result2, species_ids in zip(query_results2, r_species_ids_lst)
        for species_id in species_ids
    ]
    cursor.executemany(query_string6, query_params6)


@with_pool_cursor
def get_species_by_connectivity(cursor, id: int, id_only: bool=False) -> Union[List[dict], List[int]]:
    """Get all species with a certain connectivity ID

    :param id: The ID of the connectivity species
    :type id: int
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
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
    query_results = cursor.fetchall()
    if id_only:
        query_results = [r["id"] for r in query_results]

    return query_results


def get_species_ids_by_connectivity_id(id: int) -> List[int]:
    """Get all species IDs with a certain connectivity ID

    :param id: The ID of the connectivity species
    :type id: int
    :return: The IDs for each species with this connectivity
    :rtype: List[int]
    """
    species_rows = get_species_by_connectivity(id)
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
def lookup_user_collection(
    cursor, user_id: int, name: str, id_only: bool = False
) -> Union[dict, int]:
    """Get a certain user collection by name

    :param user_id: The user's ID
    :type user_id: int
    :param name: The collection name
    :type name: str
    :param id_only: Look up just the ID?, default False
    :type id_only: bool, optional
    :return: The row or ID
    :rtype: Union[dict, int]
    """
    query_string = """
        SELECT * FROM collections WHERE (name, user_id) = (%s, %s);
    """
    query_params = [name, user_id]

    cursor.execute(query_string, query_params)
    query_result = cursor.fetchone()
    return query_result["id"] if query_result and id_only else query_result


@with_pool_cursor
def add_species_connectivity_to_collection(cursor, coll_id: int, conn_id: int):
    """Add all species of a given connectivity to a collection

    :param coll_id: The ID of the collection
    :type coll_id: int
    :param conn_id: The connectivity ID of the species
    :type conn_id: int
    """
    species_ids = get_species_by_connectivity(conn_id, id_only=True)

    query_string = """
        INSERT INTO collections_species (coll_id, species_id)
        VALUES  (%s, %s) ON CONFLICT (coll_id, species_id) DO NOTHING;
    """
    query_params = [[coll_id, id] for id in species_ids]
    cursor.executemany(query_string, query_params)


# @with_pool_cursor
# def add_reaction_connectivity_to_collection(cursor, coll_id: int, conn_id: int):
#     """Add all reaction of a given connectivity to a collection

#     :param coll_id: The ID of the collection
#     :type coll_id: int
#     :param conn_id: The connectivity ID of the reaction
#     :type conn_id: int
#     """
#     reaction_ids = get_reaction_ids_by_connectivity_id(conn_id)

#     query_string = """
#         INSERT INTO collections_reactions (coll_id, reaction_id)
#         VALUES  (%s, %s) ON CONFLICT (coll_id, reaction_id) DO NOTHING;
#     """
#     query_params = [[coll_id, id] for id in reaction_ids]
#     cursor.executemany(query_string, query_params)


@with_pool_cursor
def remove_species_connectivity_from_collection(cursor, coll_id: int, conn_id: int):
    """Remove all species of a given connectivity from a collection

    :param coll_id: The ID of the collection
    :type coll_id: int
    :param conn_id: The connectivity ID of the species
    :type conn_id: int
    """
    species_ids = get_species_by_connectivity(conn_id, id_only=True)

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


# helpers
def results_from_executemany(cursor, id_only=False):
    query_results = []
    while True:
        query_result = cursor.fetchone()
        query_result = query_result["id"] if query_result and id_only else query_result
        query_results.append(query_result)
        if not cursor.nextset():
            break

    return query_results


if __name__ == "__main__":
    # print(lookup_species_connectivities(["CCC", "[O][O]"], id_only=True))
    # print(lookup_species(["CCC", "[O][O]"], id_only=True))
    # add_reaction_by_smiles_connectivity("CCCC.[O][O]>>CCC[CH2].O[O]")
    # print(lookup_reaction_connectivity("CCCC.[O][O]>>CCC[CH2].O[O]", id_only=True))
    print(add_reaction_by_smiles_connectivity("N.[OH]>>[NH2].O"))
