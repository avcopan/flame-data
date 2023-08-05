import { useState, useEffect, useMemo } from "react";
import * as OCL from "openchemlib/full";
import ViewSpecies2D from "./ViewSpecies2D";

export default function DrawSpecies2DFromSmiles({ smiles, className }) {
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
    // const formulaString = molecule.getMolecularFormula().formula.replace(/(\d+)/g, '<sub>$1</sub>');
    formulaString = molecule.getMolecularFormula().formula;
  }
  return (
    <ViewSpecies2D
      svgString={svgString}
      stringList={[formulaString]}
      className={className}
    />
  );
}
