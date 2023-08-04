from typing import Dict, List

import automol

from flame_data_api.constants import SpeciesConnKey


def species_conn_rows(smis: List[str]) -> List[Dict[str, str]]:
    """Generate row data for species connectivity table

    Args:
        smis (List[str]): SMILES strings for each connectivity species

    Returns:
        List[Dict[str, str]]: A list of dictionaries with the following keys:
            "formula", "conn_smiles", "conn_inchi", "conn_inchi_key",
            "conn_amchi", "conn_amchi_key"
    """

    def row_(smi):
        fml_str = automol.smiles.formula_string(smi)
        smi = automol.smiles.recalculate_without_stereo(smi)
        ich = automol.smiles.inchi(smi, stereo=False)
        ich_key = automol.inchi.inchi_key(ich)
        ich_hash = automol.inchi_key.first_hash(ich_key)
        ach = automol.smiles.amchi(smi, stereo=False)
        ach_key = automol.amchi.amchi_key(ach)
        ach_hash = automol.inchi_key.first_hash(ach_key)
        return {
            SpeciesConnKey.formula: fml_str,
            SpeciesConnKey.conn_smiles: smi,
            SpeciesConnKey.conn_inchi: ich,
            SpeciesConnKey.conn_inchi_hash: ich_hash,
            SpeciesConnKey.conn_amchi: ach,
            SpeciesConnKey.conn_amchi_hash: ach_hash,
        }

    rows = list(map(row_, smis))
    return rows


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
    rows = species_conn_rows(smiles_list)
    for row in rows:
        print(row)
