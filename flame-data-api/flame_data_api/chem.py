from typing import List

import automol


# PREPARE DATA FOR DATABASE
def species_connectivity_row(smi: str) -> dict:
    """Generate row for species connectivity table

    :param smi: SMILES string
    :type smi: str
    :return: The row; keys: "formula", "conn_smiles", "conn_inchi", "conn_inchi_key",
        "conn_amchi", "conn_amchi_key"
    :rtype: dict
    """
    ich = automol.smiles.inchi(smi, stereo=False)
    ach = automol.smiles.amchi(smi, stereo=False)
    return {
        "formula": automol.smiles.formula_string(smi),
        "svg_string": automol.smiles.svg_string(smi, stereo=False),
        "conn_smiles": automol.smiles.recalculate_without_stereo(smi),
        "conn_inchi": ich,
        "conn_inchi_hash": automol.inchi_key.first_hash(automol.inchi.inchi_key(ich)),
        "conn_amchi": ach,
        "conn_amchi_hash": automol.inchi_key.first_hash(automol.amchi.amchi_key(ach)),
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


def species_stereo_rows(smi: str) -> List[dict]:
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


# HELPERS
def connectivity_inchi_hash_from_smiles(smi: str) -> str:
    """Get an InChI connectivity hash from a SMILES string

    :param smi: SMILES string
    :type smi: str
    :return: InChI connectivity hash
    :rtype: str
    """
    ich = automol.smiles.inchi(smi, stereo=False)
    return automol.inchi_key.first_hash(automol.inchi.inchi_key(ich))
