import { useSelector } from "react-redux";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { textToggler } from "../utils/utils";
import SmilesEntryFormInput from "./SmilesEntryFormInput";
import ViewSpeciesFromSmiles from "./ViewSpeciesFromSmiles";
import ViewFrame from "./ViewFrame";

export default function SmilesEntryForm({
  smiles1,
  setSmiles1,
  smiles2,
  setSmiles2,
}) {
  const reactionMode = useSelector((store) => store.reactionMode);
  const toggleText = textToggler(reactionMode, "reaction", "species");

  return (
    <div className="w-fit flex flex-col justify-center items-center">
      <div className="flex flex-row">
        <SmilesEntryFormInput
          label={toggleText("reactants")}
          example={toggleText("CC + [OH]", "CC(O)C")}
          smiles={smiles1}
          setSmiles={setSmiles1}
          className={toggleText("rounded-r-none", "")}
        />
        {reactionMode && (
          <>
            <SmilesEntryFormInput
              label="products"
              example="C[CH2] + O"
              smiles={smiles2}
              setSmiles={setSmiles2}
              className="rounded-l-none"
            />
          </>
        )}
      </div>
      <ViewFrame
        className={`h-96 m-4 ${toggleText(
          "aspect-auto w-fit",
          "aspect-square"
        )}`}
      >
        <div className="w-full flex flex-row justify-center items-center">
          <ViewSpeciesFromSmiles
            smiles={smiles1}
            className={`h-96 ${toggleText(
              "h-80 aspect-[2/3]",
              "h-96 aspect-square"
            )}`}
          />
          {reactionMode && (
            <>
              <ArrowLongRightIcon className="text-black w-12" />
              <ViewSpeciesFromSmiles
                smiles={smiles2}
                className="h-96 aspect-[2/3]"
              />
            </>
          )}
        </div>
      </ViewFrame>
    </div>
  );
}
