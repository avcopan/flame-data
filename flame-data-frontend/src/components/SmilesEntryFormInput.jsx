export default function SmilesEntryFormInput({
  label,
  example,
  smiles,
  setSmiles,
  className = "",
}) {
  className = `w-full input input-bordered ${className}`;
  return (
    <div>
      <label className="label">
        <span className="label-text">SMILES for {label}</span>
      </label>
      <input
        type="text"
        spellCheck={false}
        placeholder={`${example}`}
        value={smiles}
        onChange={(event) => setSmiles(event.target.value)}
        className={className}
      />
    </div>
  );
}
