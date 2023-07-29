import { useState, useEffect, useMemo } from "react";
import * as OCL from "openchemlib/full";

export default function Molecule2DView({ smiles, className }) {
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
    <div
      className={`bg-white aspect-square flex flex-col justify-center items-center rounded-3xl ${className}`}
    >
      {molecule && (
        <>
          <img
            className="w-full"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
          />
          <span>{formulaString}</span>
        </>
      )}
    </div>
  );
}
