from typing import List, Tuple

import automol


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
      "formula", "svg_string", "conn_smiles",
        "r_formulas", "p_formulas",
        "r_conn_inchis", "r_conn_inchi_hashes", "r_conn_inchi", "r_conn_inchi_hash",
        "r_conn_amchis", "r_conn_amchi_hashes", "r_conn_amchi", "r_conn_amchi_hash",
        "p_conn_inchis", "p_conn_inchi_hashes", "p_conn_inchi", "p_conn_inchi_hash",
        "p_conn_amchis", "p_conn_amchi_hashes", "p_conn_amchi", "p_conn_amchi_hash",
    :rtype: dict
    """
    smi = automol.smiles.without_stereo(smi)
    rsmi, psmi = automol.smiles.reaction_reagents(smi)
    rich, pich = map(automol.smiles.inchi, (rsmi, psmi))
    richs, pichs = map(automol.inchi.split, (rich, pich))
    rick, pick = map(automol.inchi.inchi_key, (rich, pich))
    ricks, picks = (list(map(automol.inchi.inchi_key, i)) for i in (richs, pichs))
    rach, pach = map(automol.smiles.amchi, (rsmi, psmi))
    rachs, pachs = map(automol.amchi.split, (rach, pach))
    rack, pack = map(automol.amchi.amchi_key, (rach, pach))
    racks, packs = (list(map(automol.amchi.amchi_key, i)) for i in (rachs, pachs))
    return {
        "formula": automol.inchi.formula_string(rich),
        "svg_string": None,
        "conn_smiles": smi,
        "r_formulas": list(map(automol.inchi.formula_string, richs)),
        "p_formulas": list(map(automol.inchi.formula_string, pichs)),
        "r_conn_inchis": richs,
        "r_conn_inchi_hashes": list(map(automol.inchi_key.first_hash, ricks)),
        "r_conn_inchi": rich,
        "r_conn_inchi_hash": automol.inchi_key.first_hash(rick),
        "r_conn_amchis": rachs,
        "r_conn_amchi_hashes": list(map(automol.inchi_key.first_hash, racks)),
        "r_conn_amchi": rach,
        "r_conn_amchi_hash": automol.inchi_key.first_hash(rack),
        "p_conn_inchis": pichs,
        "p_conn_inchi_hashes": list(map(automol.inchi_key.first_hash, picks)),
        "p_conn_inchi": pich,
        "p_conn_inchi_hash": automol.inchi_key.first_hash(pick),
        "p_conn_amchis": pachs,
        "p_conn_amchi_hashes": list(map(automol.inchi_key.first_hash, packs)),
        "p_conn_amchi": pach,
        "p_conn_amchi_hash": automol.inchi_key.first_hash(pack),
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


def reaction_and_ts_rows(smi: str) -> Tuple[List[dict], List[dict]]:
    """Generate rows for the reaction and TS tables

    :param smi: Reaction SMILES string
    :type smi: str
    :return: The reaction rows, with keys: "smiles", "r_amchi", "r_amchi_key",
          "p_amchi", "p_amchi_key"; Also, the TS rows, with keys: "geometry", "class",
          "amchi", "amchi_key"
    :rtype: Tuple[List[dict], List[dict]]
    """
    smi = automol.smiles.without_stereo(smi)
    rsmi, psmi = automol.smiles.reaction_reagents(smi)
    rgra, pgra = map(automol.smiles.graph, (rsmi, psmi))

    rxn_rows = []
    ts_rows = []

    for rxn in automol.reac.find(rgra, pgra, stereo=False):
        for srxn in automol.reac.expand_stereo(rxn):
            # reaction row
            rachs, pachs = automol.reac.amchi(srxn)
            rach, pach = map(automol.amchi.join, (rachs, pachs))
            rxn_row = {
                "smiles": automol.reac.reaction_smiles(srxn),
                "r_amchi": rach,
                "r_amchi_key": automol.amchi.amchi_key(rach),
                "p_amchi": pach,
                "p_amchi_key": automol.amchi.amchi_key(pach),
            }

            # TS row
            tsg = automol.reac.ts_graph(srxn)
            ts_geo = automol.graph.geometry(tsg)
            ts_ach = automol.graph.amchi(tsg)
            ts_row = {
                "geometry": automol.geom.xyz_string(ts_geo),
                "class": automol.reac.class_(srxn),
                "amchi": ts_ach,
                "amchi_key": automol.amchi.amchi_key(ts_ach),
            }

            # Append rows to list
            rxn_rows.append(rxn_row)
            ts_rows.append(ts_row)

    return rxn_rows, ts_rows


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


# HELPERS
def connectivity_inchi_hash(key: str, key_type: str = "smiles") -> Tuple[str, bool]:
    """Get an InChI connectivity hash from a SMILES string

    :param key: The identifying key by which to look it up
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


if __name__ == "__main__":
    print(reaction_connectivity_row("C.[OH]>>[CH3].O"))
