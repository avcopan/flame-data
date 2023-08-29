import itertools
from typing import List, Tuple, Union

import automol

from flame_data.utils import is_nonstring_sequence


# PREPARE DATA FOR DATABASE
def species_connectivity_row(smi: str) -> dict:
    """Generate row for species connectivity table

    :param smi: SMILES string
    :type smi: str
    :return: The row; keys: "formula", "svg_string, "conn_smiles", "conn_inchi",
        "conn_inchi_key", "conn_amchi", "conn_amchi_key"
    :rtype: dict
    """
    smi = automol.smiles.without_stereo(smi)
    ich = automol.smiles.inchi(smi, stereo=False)
    ach = automol.smiles.amchi(smi, stereo=False)
    ick = automol.inchi.inchi_key(ich)
    ack = automol.amchi.amchi_key(ach)
    return {
        "formula": automol.smiles.formula_string(smi),
        "svg_string": automol.smiles.svg_string(smi, stereo=False),
        "conn_smiles": automol.smiles.recalculate_without_stereo(smi),
        "conn_inchi": ich,
        "conn_inchi_hash": automol.inchi_key.first_hash(ick),
        "conn_amchi": ach,
        "conn_amchi_hash": automol.inchi_key.first_hash(ack),
    }


def reaction_connectivity_row(smi: str) -> dict:
    """Generate row for reaction connectivity table

    :param smi: Reaction SMILES string
    :type smi: str
    :return: The row; keys:
        "formula", "conn_smiles", "r_svg_string", "p_svg_string", "r_conn_inchi",
        "p_conn_inchi", "r_conn_inchi_hash", "p_conn_inchi_hash", "r_conn_amchi",
        "p_conn_amchi", "r_conn_amchi_hash", "p_conn_amchi_hash", "r_formulas",
        "p_formulas", "r_conn_inchis", "p_conn_inchis", "r_conn_inchi_hashes",
        "p_conn_inchi_hashes", "r_conn_amchis", "p_conn_amchis", "r_conn_amchi_hashes",
        "p_conn_amchi_hashes",
    :rtype: dict
    """
    smi = automol.smiles.without_stereo(smi)
    rsmi, psmi = automol.smiles.reaction_reagents(smi)
    rich, pich = map(automol.smiles.inchi, (rsmi, psmi))
    richs, pichs = map(automol.inchi.split, (rich, pich))
    rsmis, psmis = (list(map(automol.inchi.smiles, i)) for i in (richs, pichs))
    smi = automol.smiles.reaction(rsmis, psmis)
    rsvg_str, psvg_str = automol.smiles.reaction_reagent_svg_strings(smi)
    rick, pick = map(automol.inchi.inchi_key, (rich, pich))
    ricks, picks = (list(map(automol.inchi.inchi_key, i)) for i in (richs, pichs))
    rach, pach = map(automol.smiles.amchi, (rsmi, psmi))
    rachs, pachs = map(automol.amchi.split, (rach, pach))
    rack, pack = map(automol.amchi.amchi_key, (rach, pach))
    racks, packs = (list(map(automol.amchi.amchi_key, i)) for i in (rachs, pachs))
    return {
        "formula": automol.inchi.formula_string(rich),
        "conn_smiles": smi,
        "r_svg_string": rsvg_str,
        "p_svg_string": psvg_str,
        "r_conn_inchi": rich,
        "p_conn_inchi": pich,
        "r_conn_inchi_hash": automol.inchi_key.first_hash(rick),
        "p_conn_inchi_hash": automol.inchi_key.first_hash(pick),
        "r_conn_amchi": rach,
        "p_conn_amchi": pach,
        "r_conn_amchi_hash": automol.inchi_key.first_hash(rack),
        "p_conn_amchi_hash": automol.inchi_key.first_hash(pack),
        "r_formulas": list(map(automol.inchi.formula_string, richs)),
        "p_formulas": list(map(automol.inchi.formula_string, pichs)),
        "r_conn_inchis": richs,
        "p_conn_inchis": pichs,
        "r_conn_inchi_hashes": list(map(automol.inchi_key.first_hash, ricks)),
        "p_conn_inchi_hashes": list(map(automol.inchi_key.first_hash, picks)),
        "r_conn_amchis": rachs,
        "p_conn_amchis": pachs,
        "r_conn_amchi_hashes": list(map(automol.inchi_key.first_hash, racks)),
        "p_conn_amchi_hashes": list(map(automol.inchi_key.first_hash, packs)),
    }


def species_estate_row(smi: str) -> dict:
    """Generate row for species estate table

    :param smi: SMILES string
    :type smi: str
    :return: The row; keys: "spin_mult"
    :rtype: dict
    """
    ich = automol.smiles.inchi(smi, stereo=False)
    return {"spin_mult": automol.inchi.low_spin_multiplicity(ich)}


def reaction_estate_row(smi: str) -> dict:
    """Generate row for reaction estate table

    :param smi: SMILES string
    :type smi: str
    :return: The row; keys: "spin_mult"
    :rtype: dict
    """
    smi = automol.smiles.without_stereo(smi)
    richs = map(automol.smiles.inchi, automol.smiles.reaction_reactants(smi))
    pichs = map(automol.smiles.inchi, automol.smiles.reaction_products(smi))
    rmuls = list(map(automol.inchi.low_spin_multiplicity, richs))
    pmuls = list(map(automol.inchi.low_spin_multiplicity, pichs))
    return {"spin_mult": automol.mult.ts.low(rmuls, pmuls)}


def species_rows(smi: str) -> List[dict]:
    """Generate rows for species stereo table

    :param smi: SMILES string
    :type smi: str
    :return: The rows; keys: "geometry", "smiles", "inchi", "amchi", "amchi_key"
    :rtype: List[dict]
    """
    conn_gra = automol.smiles.graph(smi, stereo=False)
    gras = automol.graph.expand_stereo(conn_gra)

    rows = []
    for gra in gras:
        ach = automol.graph.amchi(gra)
        row = {
            "geometry": automol.geom.xyz_string(automol.graph.geometry(gra)),
            "smiles": automol.graph.smiles(gra),
            "inchi": automol.graph.inchi(gra),
            "amchi": ach,
            "amchi_key": automol.amchi.amchi_key(ach),
        }
        rows.append(row)

    return rows


def reaction_and_ts_rows(smi: str) -> Tuple[List[dict], List[List[dict]]]:
    """Generate rows for the reaction and TS tables

    The TS rows will be grouped by the reaction that they correspond to

    :param smi: Reaction SMILES string
    :type smi: str
    :return: The reaction rows, with the following keys:
            "smiles", "r_amchi", "p_amchi", "r_amchi_key", "p_amchi_key", "r_inchis",
            "p_inchis", "r_amchis", "p_amchis", "r_amchi_keys", "p_amchi_keys",
        and the TS rows, grouped by reactants and products, with keys:
              "geometry", "class", "amchi", "amchi_key"
    :rtype: Tuple[List[dict], List[List[dict]]]
    """
    smi = automol.smiles.without_stereo(smi)
    rsmi, psmi = automol.smiles.reaction_reagents(smi)
    rgra, pgra = map(automol.smiles.graph, (rsmi, psmi))

    all_rows = []

    # 1. Get all row information
    for rxn in automol.reac.find(rgra, pgra, stereo=False):
        for srxn in automol.reac.expand_stereo(rxn):
            # reaction row
            richs, pichs = automol.reac.inchi(srxn)
            rachs, pachs = automol.reac.amchi(srxn)
            racks, packs = (
                list(map(automol.amchi.amchi_key, cs)) for cs in (rachs, pachs)
            )
            rach, pach = map(automol.amchi.join, (rachs, pachs))
            tsg = automol.reac.ts_graph(srxn)
            ts_geo = automol.graph.geometry(tsg)
            ts_ach = automol.graph.amchi(tsg)
            all_row = {
                # reaction columns
                "smiles": automol.reac.reaction_smiles(srxn),
                "r_amchi": rach,
                "p_amchi": pach,
                "r_amchi_key": automol.amchi.amchi_key(rach),
                "p_amchi_key": automol.amchi.amchi_key(pach),
                "r_inchis": richs,
                "p_inchis": pichs,
                "r_amchis": rachs,
                "p_amchis": pachs,
                "r_amchi_keys": racks,
                "p_amchi_keys": packs,
                # TS columns
                "geometry": automol.geom.xyz_string(ts_geo),
                "class": automol.reac.class_(srxn),
                "amchi": ts_ach,
                "amchi_key": automol.amchi.amchi_key(ts_ach),
            }

            # Append rows to list
            all_rows.append(all_row)

    # 2. Group them by reactants and products
    rxn_keys = (
        "smiles",
        "r_amchi",
        "p_amchi",
        "r_amchi_key",
        "p_amchi_key",
        "r_inchis",
        "p_inchis",
        "r_amchis",
        "p_amchis",
        "r_amchi_keys",
        "p_amchi_keys",
    )
    ts_keys = ("geometry", "class", "amchi", "amchi_key")
    rxn_rows = []
    ts_grouped_rows = []

    def _group_id(row):
        return row["r_amchi_key"], row["p_amchi_key"]

    all_rows = sorted(all_rows, key=_group_id)
    for _, rows in itertools.groupby(all_rows, key=_group_id):
        rows = list(rows)
        row, *_ = rows
        rxn_row = {k: row[k] for k in rxn_keys}
        ts_rows = [{k: r[k] for k in ts_keys} for r in rows]
        rxn_rows.append(rxn_row)
        ts_grouped_rows.append(ts_rows)

    return rxn_rows, ts_grouped_rows


def validate_species_geometry(ach: str, xyz_str: str) -> str:
    """Validate that a geometry matches a species

    :param ach: An AMChI chemical identifier string
    :type ach: str
    :param xyz_str: The species geometry, in xyz format
    :type xyz_str: str
    :return: A normalized xyz string, if valid; otherwise `None`
    :rtype: str or NoneType
    """
    geo = automol.geom.from_xyz_string(xyz_str)
    ach_ = automol.geom.amchi(geo)
    return automol.geom.xyz_string(geo) if ach == ach_ else None


def validate_reaction_geometry(ach: str, xyz_str: str) -> str:
    """Validate that a geometry matches a reaction

    Currently, doesn't actually validate anything

    If geometries were stored in AMChI order, then we could easily validated based on
    the AMChI string

    :param ach: An AMChI chemical identifier string
    :type ach: str
    :param xyz_str: The reaction geometry, in xyz format
    :type xyz_str: str
    :return: A normalized xyz string, if valid; otherwise `None`
    :rtype: str or NoneType
    """
    geo = automol.geom.from_xyz_string(xyz_str)
    return automol.geom.xyz_string(geo)


# HELPERS
def species_amchi_key(key: str, key_type: str = "smiles") -> str:
    """Get an ChI key from an identifier

    :param key: The identifying key by which to look it up
    :parm key_type: The type of the key; options: "smiles", "amchi", "amchi_key"
    :return: The AMChI key
    :rtype: str
    """
    key_type = key_type.lower()
    assert key_type in (
        "smiles",
        "amchi",
        "amchi_key",
    ), f"Invalid key type {key_type}"

    if key_type == "smiles":
        key = automol.smiles.amchi(key)
        key_type = "amchi"
    if key_type == "amchi":
        key = automol.amchi.amchi_key(key)
        key_type = "amchi_key"

    assert key_type == "amchi_key", "Sanity check"
    return key


def species_connectivity_chi_hash(
    key: str, key_type: str = "smiles"
) -> Tuple[str, bool]:
    """Get a species connectivity ChI hash from an identifier

    :param key: The identifying key
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :return: The hash, and a flag indicating whether or not it is an AMChI hash
    :rtype: Tuple[str, bool]
    """
    key_type = key_type.lower()
    assert key_type in (
        "smiles",
        "inchi",
        "amchi",
        "inchi_key",
        "amchi_key",
        "inchi_hash",
        "amchi_hash",
    ), f"Invalid key type {key_type}"

    if key_type == "smiles":
        key = automol.smiles.inchi(key)
        key_type = "inchi"
    if key_type == "inchi":
        key = automol.inchi.inchi_key(key)
        key_type = "inchi_key"
    if key_type == "inchi_key":
        key = automol.inchi_key.first_hash(key)
        key_type = "inchi_hash"

    if key_type == "amchi":
        key = automol.amchi.amchi_key(key)
        key_type = "amchi_key"
    if key_type == "amchi_key":
        key = automol.inchi_key.first_hash(key)
        key_type = "amchi_hash"

    assert key_type in ("inchi_hash", "amchi_hash"), "Sanity check"

    is_amchi = key_type == "amchi_hash"
    return key, is_amchi


def reaction_connectivity_chi_hashes(
    key: Union[str, Tuple[str, str]], key_type: str = "smiles"
) -> Tuple[Tuple[str, str], bool]:
    """Get a reaction connectivity ChI hash from an identifier

    :param key: The identifying key; If not a SMILES reaction string, this must be a
        pair of string identifiers, one for reactants and one for products
    :type key: Union[str, Tuple[str, str]]
    :parm key_type: The type of the key; options: "smiles", "inchi", "amchi",
        "inchi_key", "amchi_key", "inchi_hash", "amchi_hash"
    :type key_type: str
    :return: A pair of reactant and product hashes, and a flag indicating whether or not
        it is an AMChI hash
    :rtype: Tuple[Tuple[str, str], bool]
    """
    key_type = key_type.lower()

    print("key", key)
    if isinstance(key, str) and key_type == "smiles":
        key = automol.smiles.reaction_reagents(key)

    assert is_nonstring_sequence(key) and len(key) == 2, (
        f"Key of type {key_type} requires a pair of strings identifying\n"
        f"reactants and products, but received {key}."
    )

    rkey, pkey = key
    print("rkey", rkey)
    print("pkey", pkey)
    rhash, is_amchi = species_connectivity_chi_hash(rkey, key_type=key_type)
    phash, is_amchi = species_connectivity_chi_hash(pkey, key_type=key_type)
    return (rhash, phash), is_amchi


if __name__ == "__main__":
    # print(reaction_and_ts_rows("CCOC(O[O])C>>C[CH]OC(OO)C"))
    # print(reaction_connectivity_chi_hashes("CCOC(O[O])C>>C[CH]OC(OO)C"))
    print(reaction_connectivity_chi_hashes("N.[OH]>>[NH2].O"))
