import * as OCL from "openchemlib/full";
import { useState, useEffect, useMemo } from "react";
import { formatFormula } from "../utils/utils";
import ViewSpeciesFromSVG from "./ViewSpeciesFromSVG";

export default function ViewSpeciesFromSmiles({ smiles, className = "h-96" }) {
  // Replace CC + [OH] with CC.[OH] for convenience
  smiles = smiles.replace(/\s+\+\s+/g, ".");

  let svgString, formulaString;
  const [molecule, setMolecule] = useState(null);
  const smilesOptions = { noStereo: true };
  const svgOptions = {
    autoCrop: true,
    autoCropMargin: 10,
    suppressChiralText: true,
    noStereoProblem: true,
  };

  const [success, result] = useMemo(() => {
    try {
      return [true, OCL.Molecule.fromSmiles(smiles, smilesOptions)];
    } catch (error) {
      return [false, error];
    }
  }, [OCL, smiles]);

  useEffect(() => {
    if (success) {
      setMolecule(result);
    }
  }, [OCL, smiles]);

  if (molecule) {
    svgString = molecule.toSVG(400, 400, "", svgOptions);
    formulaString = molecule.getMolecularFormula().formula;
  }
  return (
    <ViewSpeciesFromSVG
      svgString={svgString}
      descriptors={[formatFormula(formulaString)]}
      className={className}
    />
  );
}
