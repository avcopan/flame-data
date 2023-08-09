export default function ViewFrame({
  className,
  id = "speciesView",
  children,
}) {
  return (
    <div
      id={id}
      className={`bg-white aspect-square flex flex-col justify-center items-center rounded-3xl ${className}`}
    >
      {children}
    </div>
  );
}
