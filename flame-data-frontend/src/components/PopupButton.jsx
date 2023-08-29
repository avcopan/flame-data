export default function PopupButton({
  condition,
  text,
  onClick,
  className = "btn-primary bottom-4 left-4",
}) {
  className = `btn m-1 fixed ${className}`;

  return (
    condition && (
      <button onClick={onClick} className={className}>
        {text}
      </button>
    )
  );
}
