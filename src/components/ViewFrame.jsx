export default function ViewFrame({ className, children }) {
  return (
    <div
      className={`bg-white aspect-square flex flex-col justify-center items-center rounded-3xl ${className}`}
    >
      {children}
    </div>
  );
}
